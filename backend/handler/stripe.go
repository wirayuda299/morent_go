package handler

import (
	"backend/helper"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/mail"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/webhook"
)

type PayloadReq struct {
	CarId       string `json:"carId"`
	UserId      string `json:"userId"`
	Email       string `json:"email"`
	RentedStart string `json:"rentedStart"`
	RentedEnd   string `json:"rentedEnd"`
}

type SearchResult struct {
	CarId    string
	Name     string
	Price    int
	RentedBy *string
}

func StripeWebhook(conn *pgxpool.Pool, w http.ResponseWriter, req *http.Request) {
	
	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	endpointSecret := os.Getenv("STRIPE_ENDPOINT_SECRET")

	if secretKey == "" || endpointSecret == "" {
		log.Println("Missing Stripe credentials")
		helper.WriteErrorResponse(w, "Missing Stripe credentials", http.StatusInternalServerError)
		return
	}

	stripe.Key = secretKey

	const MaxBodyBytes = int64(65536)
	req.Body = http.MaxBytesReader(w, req.Body, MaxBodyBytes)
	defer req.Body.Close()

	payload, err := io.ReadAll(req.Body)
	if err != nil {
		helper.WriteErrorResponse(w, "Error reading request body", http.StatusServiceUnavailable)
		return
	}

	sigHeader := req.Header.Get("Stripe-Signature")
	event, err := webhook.ConstructEvent(payload, sigHeader, endpointSecret)
	if err != nil {
		log.Println("Invalid webhook signature:", err)
		helper.WriteErrorResponse(w, "Invalid webhook signature", http.StatusBadRequest)
		return
	}

	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		log.Println("Failed to parse event:", err)
		helper.WriteErrorResponse(w, "Failed to parse event", http.StatusBadRequest)
		return
	}

	switch event.Type {

	case "checkout.session.expired", "payment_intent.payment_failed":
		_, err := conn.Exec(req.Context(), `
			INSERT INTO payments (stripe_payment_id, customer_email, status) 
			VALUES ($1, $2, 'failed') 
			ON CONFLICT (stripe_payment_id) DO UPDATE SET status = 'failed'
		`, session.ID, session.Metadata["email"])

		if err != nil {
			log.Println("Failed to update failed payment:", err)
			helper.WriteErrorResponse(w, "Database error", http.StatusInternalServerError)
			return
		}

		log.Printf("❌ Payment failed: %s", session.ID)

	case "checkout.session.completed":
		requiredKeys := []string{"email", "rentedStart", "rentedEnd", "user_id", "car_id"}
		for _, key := range requiredKeys {
			if _, ok := session.Metadata[key]; !ok {
				log.Println("Missing required metadata:", key)
				helper.WriteErrorResponse(w, "Missing required metadata", http.StatusBadRequest)
				return
			}
		}

		tx, err := conn.Begin(req.Context())

		if err != nil {
			log.Println("Failed to start transaction:", err)
			helper.WriteErrorResponse(w, "Database error", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback(req.Context())

		var paymentExists bool

		err = tx.QueryRow(req.Context(), "SELECT EXISTS(SELECT 1 FROM payments WHERE stripe_payment_id = $1)", session.ID).Scan(&paymentExists)

		if err != nil {
			log.Println("Failed to check payment existence:", err)
			helper.WriteErrorResponse(w, "Database error", http.StatusInternalServerError)
			return
		}

		if paymentExists {
			log.Println("Duplicate payment detected:", session.ID)
			helper.WriteErrorResponse(w, "Payment already processed", http.StatusConflict)
			return
		}

		parsedPrice, err := strconv.Atoi(session.Metadata["total"])
		if err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = tx.Exec(req.Context(), `
			INSERT INTO payments (stripe_payment_id, amount, currency, customer_email, status) 
			VALUES ($1, $2, $3, $4, 'paid')
		`, session.ID, parsedPrice/100, session.Currency, session.Metadata["email"])
		if err != nil {
			log.Println("Failed to insert payment:", err)
			helper.WriteErrorResponse(w, "Database error", http.StatusInternalServerError)
			return
		}

		_, err = tx.Exec(req.Context(), `insert into rentals(user_id,car_id,pickup_date,return_date, total_price,status,payment_id) values($1,$2,$3,$4,$5,$6,$7)`, session.Metadata["user_id"], session.Metadata["car_id"], session.Metadata["rentedStart"], session.Metadata["rentedEnd"], parsedPrice/100, "paid", session.ID)

		if err != nil {
			log.Println("Failed to insert rentals ", err.Error())
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_, err = tx.Exec(req.Context(), `
			UPDATE car 
			SET rented_start = $1, rented_end = $2, rented_by = $3 
			WHERE id = $4 AND rented_by IS NULL
		`, session.Metadata["rentedStart"], session.Metadata["rentedEnd"], session.Metadata["user_id"], session.Metadata["car_id"])

		if err != nil {
			log.Println("Failed to update car rental:", err)
			helper.WriteErrorResponse(w, "Database error", http.StatusInternalServerError)
			return
		}

		if err = tx.Commit(req.Context()); err != nil {
			log.Println("Failed to commit transaction:", err)
			helper.WriteErrorResponse(w, "Database error", http.StatusInternalServerError)
			return
		}

		log.Printf("✅ Checkout session completed: %s", session.ID)

	default:
		log.Printf("Unhandled event type: %s", event.Type)
	}

	w.WriteHeader(http.StatusOK)
}

func CreateCheckoutSession(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {

	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	domain := os.Getenv("CLIENT_URL")

	if secretKey == "" || domain == "" {
		helper.WriteErrorResponse(w, "Missing credentials", http.StatusInternalServerError)
		return
	}

	stripe.Key = secretKey

	body, err := io.ReadAll(r.Body)
	if err != nil {
		helper.WriteErrorResponse(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var requestData PayloadReq
	if err = json.Unmarshal(body, &requestData); err != nil {
		helper.WriteErrorResponse(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if requestData.CarId == "" || requestData.UserId == "" || requestData.Email == "" ||
		requestData.RentedStart == "" || requestData.RentedEnd == "" {
		helper.WriteErrorResponse(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	pickupDate, err := time.Parse("2006-01-02", requestData.RentedStart)
	returnDate, err2 := time.Parse("2006-01-02", requestData.RentedEnd)

	if err != nil || err2 != nil {
		helper.WriteErrorResponse(w, "Invalid 2025-02-21 format", http.StatusBadRequest)
		return
	}

	if pickupDate.Before(time.Now().Truncate(24 * time.Hour)) {
		helper.WriteErrorResponse(w, "Pickup date must be in the future", http.StatusBadRequest)
		return
	}

	if returnDate.Before(pickupDate) {
		helper.WriteErrorResponse(w, "Return date must after pickup date", http.StatusBadRequest)
		return
	}

	_, err = mail.ParseAddress(requestData.Email)
	if err != nil {
		helper.WriteErrorResponse(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	var car SearchResult
	err = conn.QueryRow(r.Context(), "SELECT id, price, name, rented_by FROM car WHERE id = $1", requestData.CarId).
		Scan(&car.CarId, &car.Price, &car.Name, &car.RentedBy)

	if err == pgx.ErrNoRows {
		helper.WriteErrorResponse(w, "Car not found", http.StatusNotFound)
		return
	} else if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if car.RentedBy != nil {
		helper.WriteErrorResponse(w, "Car is already rented", http.StatusBadRequest)
		return
	}

	if car.Price <= 0 {
		helper.WriteErrorResponse(w, "Invalid car price", http.StatusBadRequest)
		return
	}

	maxRentalPeriod := 180
	if returnDate.Sub(pickupDate).Hours()/24 > float64(maxRentalPeriod) {
		helper.WriteErrorResponse(w, "Rental period exceeds maximum allowed duration", http.StatusBadRequest)
		return
	}
	duration := returnDate.Sub(pickupDate).Hours() / 24

	total := int64((car.Price * 100) * int(duration))

	params := &stripe.CheckoutSessionParams{
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Quantity: stripe.Int64(1),
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency:   stripe.String("idr"),
					UnitAmount: stripe.Int64(total),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(car.Name),
					},
				},
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(domain + "?success=true"),
		CancelURL:  stripe.String(domain + "?canceled=true"),
		Metadata: map[string]string{
			"user_id":     requestData.UserId,
			"car_id":      requestData.CarId,
			"email":       requestData.Email,
			"rentedEnd":   requestData.RentedEnd,
			"rentedStart": requestData.RentedStart,
			"total":       strconv.Itoa(int(total)),
		},
	}

	s, err := session.New(params)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "Success", s)
}
