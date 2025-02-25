package routes

import (
	"backend/handler"
	"backend/middleware"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterAdminRoute(conn *pgxpool.Pool, router *mux.Router) {
	adminRoutes := router.PathPrefix("/admin").Subrouter()

	adminRoutes.Use(middleware.ClerkAuthMiddleware)

	adminRoutes.HandleFunc("/active-rental", func(w http.ResponseWriter, r *http.Request) {
		handler.GetActiveRental(conn, w, r)
	}).Methods(http.MethodGet)

	adminRoutes.HandleFunc("/total-customers", func(w http.ResponseWriter, r *http.Request) {
		handler.GetTotalCustomers(conn, w, r)
	}).Methods(http.MethodGet)

	adminRoutes.HandleFunc("/revenue", func(w http.ResponseWriter, r *http.Request) {
		handler.GetTotalRevenue(conn, w, r)
	}).Methods(http.MethodGet)
}
