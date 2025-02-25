package handler

import (
	"backend/constant"
	"backend/helper"
	"backend/middleware"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Thumbnail struct {
	PublicId string `json:"public_id"`
	Url      string `json:"url"`
}

type Car struct {
	ID            uuid.UUID   `json:"id"`
	Name          string      `json:"name"`
	Type          string      `json:"type"`
	Description   string      `json:"description"`
	Price         int         `json:"price"`
	FuelTankSize  int         `json:"fuelTankSize"`
	Capacity      int         `json:"capacity"`
	Owner         string      `json:"owner"`
	StreetAddress string      `json:"street_address"`
	City          string      `json:"city"`
	Country       string      `json:"country"`
	Thumbnails    []Thumbnail `json:"thumbnails"`
	Transmission  string      `json:"transmission"`
	IsFavorite    bool        `json:"is_favorite"`
	AvailableFrom time.Time   `json:"available_from"`
	Features      []string    `json:"features"`
}

type CarLocation struct {
	City          string `json:"city"`
	Country       string `json:"country"`
	StreetAddress string `json:"street_address"`
}

func addCarToFavorite(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request, carId string, userId string) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	_, err := conn.Exec(r.Context(), "insert into favorite_car(user_id, car_id) values($1,$2)", userId, carId)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "Car has been added to favorite", nil)
}

func removeCarFromFavorite(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request, carId string, userId string) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	_, err := conn.Exec(r.Context(), "delete from favorite_car where user_id = $1 and car_id = $2", userId, carId)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "Car has been remove to favorite", nil)
}

func AddOrRemoveCarFromFavorite(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	body, err := io.ReadAll(r.Body)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}
	var favoriteCar FavoriteCar

	err = json.Unmarshal(body, &favoriteCar)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	if favoriteCar.CarId == "" || favoriteCar.UserId == "" {
		helper.WriteErrorResponse(w, "Car Id or User ID is missing", http.StatusBadRequest)
		return
	}

	var dbUserId, dbCarId string
	err = conn.QueryRow(r.Context(), "select user_id, car_id from favorite_car where user_id =$1 and car_id=$2", favoriteCar.UserId, favoriteCar.CarId).Scan(&dbUserId, &dbCarId)
	if err == pgx.ErrNoRows {
		addCarToFavorite(conn, w, r, favoriteCar.CarId, favoriteCar.UserId)
		return
	} else {
		removeCarFromFavorite(conn, w, r, favoriteCar.CarId, favoriteCar.UserId)
		return
	}
}

func AddNewCar(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	body, readErr := io.ReadAll(r.Body)
	if readErr != nil {
		helper.WriteErrorResponse(w, readErr.Error(), http.StatusBadRequest)
		return
	}

	var car Car
	err := json.Unmarshal(body, &car)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	var carId uuid.UUID
	insertErr := conn.QueryRow(r.Context(), `
		INSERT INTO car (name, type, description, price, fuel_tank_size, capacity, owner, transmission, city, country, street_address, features)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11, $12)
		RETURNING id`,
		car.Name, car.Type, car.Description, car.Price, car.FuelTankSize, car.Capacity, car.Owner, car.Transmission, car.City, car.Country, car.StreetAddress, car.Features,
	).Scan(&carId)

	if insertErr != nil {
		helper.WriteErrorResponse(w, insertErr.Error(), http.StatusInternalServerError)
		return
	}

	if len(car.Thumbnails) > 0 {
		batch := &pgx.Batch{}
		for _, thumbnail := range car.Thumbnails {
			batch.Queue("INSERT INTO car_thumbnails(car_id, image_id, url) VALUES($1, $2, $3)", carId, thumbnail.PublicId, thumbnail.Url)
		}
		batchResults := conn.SendBatch(r.Context(), batch)
		if closeErr := batchResults.Close(); closeErr != nil {
			helper.WriteErrorResponse(w, closeErr.Error(), http.StatusInternalServerError)
			return
		}
	}

	helper.EncodeResponse(w, "Car has been added", car)
}

func GetAllCars(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request, userId string) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	sort := r.URL.Query().Get("sort")

	var queryBuilder strings.Builder
	queryBuilder.WriteString(constant.BaseQuery)

	var args []interface{}
	args = append(args, userId)

	queryBuilder.WriteString(" GROUP BY c.id, c.transmission, f.user_id ORDER BY c.name ASC")

	if sort == "popular" {
		queryBuilder.WriteString(" LIMIT 3")
	}

	query := queryBuilder.String()

	rows, err := conn.Query(r.Context(), query, args...)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	var allCars []Car
	for rows.Next() {
		var car Car
		var thumbnailsJSON []byte

		err := rows.Scan(
			&car.ID, &car.Name, &car.Type, &car.Owner, &car.Price, &car.Capacity,
			&car.Description, &car.City, &car.Country, &car.StreetAddress, &car.FuelTankSize,
			&car.Transmission, &car.Features, &thumbnailsJSON, &car.IsFavorite,
		)

		if err != nil {
			helper.WriteErrorResponse(w, "Failed to scan car data: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.Unmarshal(thumbnailsJSON, &car.Thumbnails); err != nil {
			helper.WriteErrorResponse(w, "Failed to parse thumbnails: "+err.Error(), http.StatusInternalServerError)
			return
		}

		allCars = append(allCars, car)
	}

	if err := rows.Err(); err != nil {
		helper.WriteErrorResponse(w, "Error during row iteration", http.StatusInternalServerError)
		return
	}

	helper.EncodeResponse(w, "All cars have been fetched", allCars)
}

func GetAvailableCar(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	var availableCars []Car

	rows, err := conn.Query(r.Context(), `SELECT
			c.id,
			c.name,
			c.type,
			c.owner,
			c.price,
			c.capacity,
			c.description,
			c.city,
			c.country,
			c.street_address,
			c.fuel_tank_size,
			c.transmission,
      c.features,
			COALESCE(json_agg(json_build_object('public_id', t.image_id, 'url', t.url)) FILTER (WHERE t.image_id IS NOT NULL), '[]') AS thumbnails
			FROM car as c
		  LEFT JOIN car_thumbnails t ON c.id = t.car_id
      where c.rented_by is null
      group by c.id
		`)

	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for rows.Next() {
		var car Car
		var thumbnailsJSON string

		err := rows.Scan(
			&car.ID, &car.Name, &car.Type, &car.Owner, &car.Price, &car.Capacity,
			&car.Description, &car.City, &car.Country, &car.StreetAddress, &car.FuelTankSize,
			&car.Transmission, &car.Features, &thumbnailsJSON,
		)
		if err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.Unmarshal([]byte(thumbnailsJSON), &car.Thumbnails); err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}
		availableCars = append(availableCars, car)
	}

	if len(availableCars) == 0 {
		helper.EncodeResponse(w, "No cars found", []Car{})
	} else {
		helper.EncodeResponse(w, fmt.Sprintf("Found %d cars", len(availableCars)), availableCars)
	}
}

func SearchCars(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	authData, ok := r.Context().Value("clerkAuth").(*middleware.AuthData)
	if !ok || authData.Claims == nil {
		log.Println("User is not authenticated")
		helper.WriteErrorResponse(w, "You must be signed in to access this page", http.StatusUnauthorized)
		return
	}

	var searchResults []Car

	allowedSearchFields := map[string]bool{
		"name":     true,
		"type":     true,
		"capacity": true,
		"id":       true,
	}

	name := r.URL.Query().Get("name")
	userId := r.URL.Query().Get("userId")
	carType := r.URL.Query().Get("type")
	capacity := r.URL.Query().Get("capacity")
	searchBy := r.URL.Query().Get("search_by")
	id := r.URL.Query().Get("id")

	if searchBy == "" {
		helper.WriteErrorResponse(w, "You must specify search_by", http.StatusBadRequest)
		return
	}

	if !allowedSearchFields[searchBy] {
		helper.WriteErrorResponse(w, "Invalid search_by parameter", http.StatusBadRequest)
		return
	}

	var queryBuilder strings.Builder
	queryBuilder.WriteString(constant.BaseQuery)

	var args []interface{}
	args = append(args, userId) // $1 is always userId (for is_favorite)

	argIndex := 2 // Since $1 is userId, additional params start at $2
	var conditions []string

	if searchBy == "name" && name != "" {
		conditions = append(conditions, fmt.Sprintf("c.name ILIKE $%d", argIndex))
		args = append(args, "%"+name+"%") // Use ILIKE for case-insensitive search
		argIndex++
	}
	if searchBy == "type" && carType != "" {
		conditions = append(conditions, fmt.Sprintf("c.type = $%d", argIndex))
		args = append(args, carType)
		argIndex++
	}
	if searchBy == "capacity" && capacity != "" {
		conditions = append(conditions, fmt.Sprintf("c.capacity = $%d", argIndex))
		args = append(args, capacity)
		argIndex++
	}
	if searchBy == "id" && id != "" {
		conditions = append(conditions, fmt.Sprintf("c.id = $%d", argIndex))
		args = append(args, id)
		argIndex++
	}

	if len(conditions) > 0 {
		queryBuilder.WriteString(" WHERE " + strings.Join(conditions, " AND "))
	}

	queryBuilder.WriteString(" GROUP BY c.id, c.transmission, f.user_id ORDER BY c.name ASC")

	query := queryBuilder.String()
	rows, err := conn.Query(r.Context(), query, args...)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var car Car
		var thumbnailsJSON string

		err := rows.Scan(
			&car.ID, &car.Name, &car.Type, &car.Owner, &car.Price, &car.Capacity,
			&car.Description, &car.City, &car.Country, &car.StreetAddress, &car.FuelTankSize,
			&car.Transmission, &car.Features, &thumbnailsJSON, &car.IsFavorite,
		)
		if err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.Unmarshal([]byte(thumbnailsJSON), &car.Thumbnails); err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}
		searchResults = append(searchResults, car)
	}

	if len(searchResults) == 0 {
		helper.EncodeResponse(w, "No cars found", []Car{})
	} else {
		helper.EncodeResponse(w, fmt.Sprintf("Found %d cars", len(searchResults)), searchResults)
	}
}


func GetFeaturedCategories(conn *pgxpool.Pool, w http.ResponseWriter, r *http.Request) {
	var categories []string

	// Fetch distinct car types from rentals
	rows, err := conn.Query(r.Context(), `
		SELECT DISTINCT c.type FROM rentals AS r
		LEFT JOIN car AS c ON c.id = r.car_id
	`)
	if err != nil {
		helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var carType string
		if err := rows.Scan(&carType); err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}
		categories = append(categories, carType)
	}

	// If we have less than 4 categories, fetch more from "car"
	if len(categories) < 4 {
		needed := 4 - len(categories) // How many more categories we need

		rows, err := conn.Query(r.Context(), `
			SELECT DISTINCT type FROM car
			WHERE type NOT IN (SELECT DISTINCT c.type FROM rentals AS r
							  LEFT JOIN car AS c ON c.id = r.car_id)
			LIMIT $1`, needed) // Fetch only the missing amount
		if err != nil {
			helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var carType string
			if err := rows.Scan(&carType); err != nil {
				helper.WriteErrorResponse(w, err.Error(), http.StatusInternalServerError)
				return
			}
			categories = append(categories, carType)
		}
	}

	helper.EncodeResponse(w, "Featured categories", categories)
}

