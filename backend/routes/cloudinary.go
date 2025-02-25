package routes

import (
	"backend/handler"
	"backend/middleware"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterCloudinaryRoute(conn *pgxpool.Pool, router *mux.Router) {
	cloudinaryRouter := router.PathPrefix("/image").Subrouter()
	cloudinaryRouter.Use(middleware.ClerkAuthMiddleware)

	cloudinaryRouter.HandleFunc("/upload", handler.UploadImage).Methods(http.MethodPost)
}
