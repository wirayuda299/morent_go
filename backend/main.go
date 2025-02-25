package main

import (
	"backend/routes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func securityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/.") {
			http.Error(w, "403 Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		headers := w.Header()
		headers.Set("Access-Control-Allow-Origin", os.Getenv("CLIENT_URL"))
		headers.Set("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE")
		headers.Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With")
		headers.Set("Access-Control-Allow-Credentials", "true")

		headers.Set("X-Content-Type-Options", "nosniff")
		headers.Set("Content-Type", "application/json")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func initDB() (*pgxpool.Pool, error) {
	conn, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	fmt.Println("✅ Database connected successfully")
	return conn, nil
}

func setupMiddleware(router *mux.Router) {
	router.Use(securityMiddleware)
	router.Use(corsMiddleware)
}

func main() {

	clerk.SetKey("sk_test_640pc1eWedoqrNT9LvqH77Mx0p6HzIEf7fapyWDoIx")
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ Warning: .env file not found, using system environment variables.")
	}

	conn, err := initDB()
	if err != nil {
		log.Fatalf("❌ Database Error: %v", err)
	}
	defer conn.Close()

	router := mux.NewRouter()
	setupMiddleware(router)

	routes.RegisterUserRoute(conn, router)
	routes.RegisterCloudinaryRoute(conn, router)
	routes.RegisterCarRoute(conn, router)
	routes.RegisterStripeRoute(conn, router)
	routes.RegisterAdminRoute(conn, router)

	server := &http.Server{
		Handler:      router,
		Addr:         "127.0.0.1:8000",
		WriteTimeout: 20 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		fmt.Println("🚀 Server is running on", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server Error: %v", err)
		}
	}()

	<-stop
	fmt.Println("\n🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("❌ Server Shutdown Failed: %v", err)
	}
	fmt.Println("✅ Server gracefully stopped")
}
