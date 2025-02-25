package handler

import (
	"backend/helper"
	"backend/middleware"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type FavoriteCar struct {
	CarId  string `json:"car_id"`
	UserId string `json:"user_id"`
}

type User struct {
	Id string `json:"id"`
}

func CreateUser(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	body, bodyErr := io.ReadAll(r.Body)
	if bodyErr != nil {
		http.Error(w, bodyErr.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var user User
	if parserErr := json.Unmarshal(body, &user); parserErr != nil {
		http.Error(w, parserErr.Error(), http.StatusBadRequest)
		return
	}

	query := `INSERT INTO users(id) VALUES($1)`
	_, execErr := conn.Exec(r.Context(), query, user.Id)

	if execErr != nil {
		http.Error(w, execErr.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "User created",201 )
}

func GetUserById(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request, id string) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}
	query := `select * from users where id = $1`
	var user User

	err := conn.QueryRow(r.Context(), query, id).Scan(&user.Id)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		if err:= json.NewEncoder(w).Encode(helper.Response{
			Success: true,
			Message: "User found",
			Data:    user,
		}); err !=nil{
log.Println(err.Error())
		}
	}
}

func GetUserTotalRental(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")

	var userTotalRental int

	if userID == "" {
		helper.WriteErrorResponse(w, "UserId is missing", http.StatusBadRequest)
		return
	}

	err := conn.QueryRow(r.Context(), `select count(*) from rentals where user_id = $1`, userID).Scan(&userTotalRental)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "User total rental", userTotalRental)

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

func GetUserRecentBookings(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")

	if userID == "" {
		helper.WriteErrorResponse(w, "User ID is missing", http.StatusBadRequest)
		return
	}

	var recentBookings []RecentBooking

	rows, err := conn.Query(r.Context(), `select 
      r.id , 
      r.user_id, 
      r.car_id,
      r.pickup_date, 
      r.return_date, 
      r.total_price,
      c.name, 
      status 
      from rentals as r 
      left join car as c on c.id = car_id 
      WHERE pickup_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 weeks' and user_id = $1`, userID)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for rows.Next() {
		var recentBooking RecentBooking

		if err := rows.Scan(&recentBooking.RentalId, &recentBooking.UserID, &recentBooking.CarID, &recentBooking.PickupDate, &recentBooking.ReturnDate, &recentBooking.TotalPrice, &recentBooking.CarName, &recentBooking.Status); err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}

		recentBookings = append(recentBookings, recentBooking)

	}

	if len(recentBookings) == 0 {

		helper.EncodeResponse(w, "Recent booking", []RecentBooking{})
	} else {

		helper.EncodeResponse(w, "Recent booking", recentBookings)
	}
}
