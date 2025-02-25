package handler

import (
	"backend/helper"
	"backend/middleware"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
) 

func GetTotalRevenue(pool *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	
	if authData.Role != os.Getenv("ADMIN_ROLE") {
		log.Println("User is not an admin")
		helper.WriteErrorResponse(w, "You are not allowed to access this page", http.StatusForbidden)
		return
	}

	var total int

	rows, err := pool.Query(r.Context(), "SELECT amount FROM payments")
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var revenue int
		if err := rows.Scan(&revenue); err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}
		total += revenue
	}

	if err = rows.Err(); err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "Total revenue", total)
}

func GetActiveRental(pool *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {

	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	if authData.Role != os.Getenv("ADMIN_ROLE") {
		log.Println("User is not an admin")
		helper.WriteErrorResponse(w, "You are not allowed to access this page", http.StatusForbidden)
		return
	}

	var activeRental int

	err := pool.QueryRow(r.Context(), "SELECT count(*) FROM car WHERE rented_end > NOW()").Scan(&activeRental)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "Active rental", activeRental)
}

func GetTotalCustomers(pool *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	if authData.Role != os.Getenv("ADMIN_ROLE") {
		log.Println("User is not an admin")
		helper.WriteErrorResponse(w, "You are not allowed to access this page", http.StatusForbidden)
		return
	}

	var totalUsers int

	err := pool.QueryRow(r.Context(), "SELECT count(*) FROM users").Scan(&totalUsers)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "Total customers", totalUsers)
}
