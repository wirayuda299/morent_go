package routes

import (
	"backend/handler"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterStripeRoute(conn *pgxpool.Pool, router *mux.Router) {
	stripeRouter := router.PathPrefix("/stripe").Subrouter()

	stripeRouter.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
		handler.StripeWebhook(conn, w, r)
	}).Methods(http.MethodPost)

	stripeRouter.HandleFunc("/checkout", func(w http.ResponseWriter, r *http.Request) {
		handler.CreateCheckoutSession(conn, w, r)
	}).Methods(http.MethodPost)
}
