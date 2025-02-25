package routes

import (
	"backend/handler"
	"backend/middleware"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterCarRoute(conn *pgxpool.Pool, router *mux.Router) {
	carRouter := router.PathPrefix("/car").Subrouter()

	carRouter.Use(middleware.ClerkAuthMiddleware)

	carRouter.HandleFunc("/add", func(w http.ResponseWriter, r *http.Request) {
		handler.AddNewCar(conn, w, r)
	}).Methods(http.MethodPost)

	carRouter.HandleFunc("/available-car", func(w http.ResponseWriter, r *http.Request) {
		handler.GetAvailableCar(conn, w, r)
	}).Methods(http.MethodGet)

	carRouter.HandleFunc("/find-all/{userId}", func(w http.ResponseWriter, r *http.Request) {
		userId := mux.Vars(r)["userId"]
		handler.GetAllCars(conn, w, r, userId)
	}).Methods(http.MethodGet)

	carRouter.HandleFunc("/add-or-remove", func(w http.ResponseWriter, r *http.Request) {
		handler.AddOrRemoveCarFromFavorite(conn, w, r)
	}).Methods(http.MethodPost)

	carRouter.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
		handler.SearchCars(conn, w, r)
	}).Methods(http.MethodGet)

	carRouter.HandleFunc("/featured_categories", func(w http.ResponseWriter, r *http.Request) {
		handler.GetFeaturedCategories(conn,w,r)
	}).Methods(http.MethodGet)

}
