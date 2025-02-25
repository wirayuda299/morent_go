package main

import (
	"backend/routes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func securityMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path[0] == '/' && len(r.URL.Path) > 1 && r.URL.Path[1] == '.' {
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
        headers.Set("Access-Control-Max-Age", "86400") // Cache preflight for 24 hours

        headers.Set("X-Content-Type-Options", "nosniff")
        headers.Set("Content-Type", "application/json")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }
        next.ServeHTTP(w, r)
    })
}
func initDB() (*pgxpool.Pool, error) {
    config, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
    if err != nil {
        return nil, fmt.Errorf("failed to parse database config: %w", err)
    }

    config.MaxConns = 20 // Adjust based on load
    config.MinConns = 2
    config.MaxConnIdleTime = time.Minute * 5
    config.HealthCheckPeriod = time.Minute

    pool, err := pgxpool.NewWithConfig(context.Background(), config)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }

    fmt.Println("✅ Database connected successfully")
    return pool, nil
}


func setupMiddleware(router *mux.Router) {
	router.Use(securityMiddleware)
	router.Use(corsMiddleware)
}

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("⚠️ Warning: .env file not found, using system environment variables.")
    }

    clerk.SetKey(os.Getenv("CLERK_SECRET_KEY"))

    conn, err := initDB()
    if err != nil {
        log.Fatalf("❌ Database Error: %v", err)
    }
    defer conn.Close()

    router := mux.NewRouter().StrictSlash(true)
    setupMiddleware(router)
    
    router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("OK"))
})

    routes.RegisterUserRoute(conn, router)
    routes.RegisterCloudinaryRoute(conn, router)
    routes.RegisterCarRoute(conn, router)
    routes.RegisterStripeRoute(conn, router)
    routes.RegisterAdminRoute(conn, router)

    server := &http.Server{
        Handler:      router,
        Addr:         ":" + os.Getenv("PORT"),
        WriteTimeout: 20 * time.Second,
        ReadTimeout:  15 * time.Second,
        IdleTimeout:  60 * time.Second, // Set Idle timeout
    }

    go func() {
        fmt.Println("🚀 Server is running on", server.Addr)
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("❌ Server Error: %v", err)
        }
    }()

    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

    <-stop
    fmt.Println("\n🛑 Shutting down server...")

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("❌ Server Shutdown Failed: %v", err)
    }

    fmt.Println("✅ Server gracefully stopped")
}

