package main

import (
	"backend/routes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"syscall"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"golang.org/x/time/rate"
)

// Configuration holds all application settings
type Configuration struct {
	Port            string
	ClientURL       string
	DatabaseURL     string
	ClerkSecretKey  string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
	MaxDBConnections int32
}

// LoadConfig loads application configuration from environment variables
func LoadConfig() Configuration {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ Warning: .env file not found, using system environment variables.")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "https://yourproductiondomain.com"
	}

	return Configuration{
		Port:            port,
		ClientURL:       clientURL,
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		ClerkSecretKey:  os.Getenv("CLERK_SECRET_KEY"),
		ReadTimeout:     15 * time.Second,
		WriteTimeout:    20 * time.Second,
		ShutdownTimeout: 30 * time.Second,
		MaxDBConnections: int32(runtime.GOMAXPROCS(0) * 4), // Multiply by CPU cores
	}
}

// RateLimiterMiddleware implements a basic rate limiter
func RateLimiterMiddleware(rps int) mux.MiddlewareFunc {
	limiter := rate.NewLimiter(rate.Limit(rps), rps*3) // Allow bursts
	
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !limiter.Allow() {
				http.Error(w, "429 Too Many Requests", http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// SecurityMiddleware prevents access to dot-prefixed paths
func SecurityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/.") {
			http.Error(w, "403 Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// CORSMiddleware handles CORS headers
func CORSMiddleware(allowedOrigin string) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			headers := w.Header()
			headers.Set("Access-Control-Allow-Origin", allowedOrigin)
			headers.Set("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE")
			headers.Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With")
			headers.Set("Access-Control-Allow-Credentials", "true")
			headers.Set("X-Content-Type-Options", "nosniff")
			
			// Only set Content-Type for responses that need it, not for OPTIONS
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}
}

// InitDB initializes the database connection pool
func InitDB(config Configuration) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(config.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("error parsing database URL: %w", err)
	}
	
	// Configure connection pool
	poolConfig.MaxConns = config.MaxDBConnections
	poolConfig.MinConns = 2
	poolConfig.MaxConnLifetime = 30 * time.Minute
	poolConfig.MaxConnIdleTime = 5 * time.Minute
	poolConfig.HealthCheckPeriod = 1 * time.Minute
	
	// Create connection pool
	conn, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	
	// Verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	
	fmt.Println("✅ Database connected successfully")
	return conn, nil
}

// SetupMiddleware configures all middleware for the router
func SetupMiddleware(router *mux.Router, config Configuration) {
	router.Use(SecurityMiddleware)
	router.Use(CORSMiddleware(config.ClientURL))
	router.Use(RateLimiterMiddleware(500)) // Limit to 500 requests per second
}

func main() {
	// Load configuration
	config := LoadConfig()
	
	// Initialize Clerk SDK
	clerk.SetKey(config.ClerkSecretKey)
	
	// Initialize database connection
	conn, err := InitDB(config)
	if err != nil {
		log.Fatalf("❌ Database Error: %v", err)
	}
	defer conn.Close()
	
	// Create and configure router
	router := mux.NewRouter()
	SetupMiddleware(router, config)
	
	// Register routes
	routes.RegisterUserRoute(conn, router)
	routes.RegisterCloudinaryRoute(conn, router)
	routes.RegisterCarRoute(conn, router)
	routes.RegisterStripeRoute(conn, router)
	routes.RegisterAdminRoute(conn, router)
	
	// Create server with timeouts
	server := &http.Server{
		Handler:      router,
		Addr:         ":" + config.Port,
		WriteTimeout: config.WriteTimeout,
		ReadTimeout:  config.ReadTimeout,
		IdleTimeout:  120 * time.Second, // Added idle timeout
	}
	
	// Start server in a goroutine
	go func() {
		fmt.Println("🚀 Server is running on port", config.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server Error: %v", err)
		}
	}()
	
	// Set up graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	
	fmt.Println("\n🛑 Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), config.ShutdownTimeout)
	defer cancel()
	
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("❌ Server Shutdown Failed: %v", err)
	}
	
	fmt.Println("✅ Server gracefully stopped")
}
