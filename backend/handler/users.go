package handler

import (
	"backend/helper"
	"backend/middleware"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Structs
type FavoriteCar struct {
	CarId  string `json:"car_id"`
	UserId string `json:"user_id"`
}

type User struct {
	Id string `json:"id"`
}

type RecentBooking struct {
	RentalId   string    `json:"rental_id"`
	UserID     string    `json:"user_id"`
	CarID      string    `json:"car_id"`
	PickupDate time.Time `json:"pickup_date"`
	ReturnDate time.Time `json:"return_date"`
	TotalPrice int       `json:"total_price"`
	Status     string    `json:"status"`
	CarName    string    `json:"car_name"`
}

// Create a new user
func CreateUser(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		helper.WriteErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	query := `INSERT INTO users(id) VALUES($1)`
	_, err := conn.Exec(r.Context(), query, user.Id)
	if err != nil {
		log.Printf("Database error: %v", err)
		helper.WriteErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "User created", http.StatusCreated)
}

// Get user by ID
func GetUserById(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request, id string) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("Unauthorized access attempt")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	var user User
	err := conn.QueryRow(r.Context(), `SELECT id FROM users WHERE id = $1`, id).Scan(&user.Id)
	if err != nil {
		log.Printf("Database error: %v", err)
		helper.WriteErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(helper.Response{
		Success: true,
		Message: "User found",
		Data:    user,
	}); err != nil {
		log.Println("JSON encoding error:", err)
	}
}

// Get total rentals by user
func GetUserTotalRental(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		helper.WriteErrorResponse(w, "UserId is missing", http.StatusBadRequest)
		return
	}

	var userTotalRental int
	err := conn.QueryRow(r.Context(), `SELECT COUNT(*) FROM rentals WHERE user_id = $1`, userID).Scan(&userTotalRental)
	if err != nil {
		log.Printf("Database error: %v", err)
		helper.WriteErrorResponse(w, "Error retrieving rental count", http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "User total rental", userTotalRental)
}

// Get recent bookings for a user
func GetUserRecentBookings(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		helper.WriteErrorResponse(w, "User ID is missing", http.StatusBadRequest)
		return
	}

	var recentBookings []RecentBooking
	rows, err := conn.Query(r.Context(), `
		SELECT r.id, r.user_id, r.car_id, r.pickup_date, r.return_date, r.total_price, c.name, r.status
		FROM rentals AS r
		LEFT JOIN car AS c ON c.id = r.car_id
		WHERE r.pickup_date >= CURRENT_DATE AND r.pickup_date < CURRENT_DATE + INTERVAL '14 days'
		AND r.user_id = $1
	`, userID)
	if err != nil {
		log.Printf("Database error: %v", err)
		helper.WriteErrorResponse(w, "Error fetching recent bookings", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var recentBooking RecentBooking
		if err := rows.Scan(
			&recentBooking.RentalId, &recentBooking.UserID, &recentBooking.CarID,
			&recentBooking.PickupDate, &recentBooking.ReturnDate, &recentBooking.TotalPrice,
			&recentBooking.CarName, &recentBooking.Status,
		); err != nil {
			log.Println("Error scanning recent booking:", err)
			continue
		}
		recentBookings = append(recentBookings, recentBooking)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error reading results: %v", err)
		helper.WriteErrorResponse(w, "Error retrieving bookings", http.StatusInternalServerError)
		return
	}

	if len(recentBookings) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	helper.EncodeResponse(w, "Recent bookings", recentBookings)
}

