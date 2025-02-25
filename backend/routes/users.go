package routes

import (
	"backend/handler"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterUserRoute(conn *pgxpool.Pool, router *mux.Router) {
	router.HandleFunc("/users/total-rentals", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("User routes")
		handler.GetUserTotalRental(conn, w, r)
	}).Methods(http.MethodGet)

	router.HandleFunc("/users/recent-booking", func(w http.ResponseWriter, r *http.Request) {
		handler.GetUserRecentBookings(conn, w, r)
	}).Methods(http.MethodGet)

	router.HandleFunc("/users/create", func(w http.ResponseWriter, r *http.Request) {
		handler.CreateUser(conn, w, r)
	}).Methods(http.MethodPost)

	router.HandleFunc("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]
		handler.GetUserById(conn, w, r, id)
	}).Methods(http.MethodGet)

}
