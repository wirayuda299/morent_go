package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/clerk/clerk-sdk-go/v2/user"
)

type AuthData struct {
	Claims *clerk.SessionClaims
	Role   string
}

func ClerkAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authData, err := parseJWT(r)

		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		} 


		ctx := context.WithValue(r.Context(), "clerkAuth", authData)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func parseJWT(r *http.Request) (*AuthData, error) {
	sessionToken := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")

	if sessionToken == "" {
		return nil, errors.New("missing token")
	}

	claims, err := jwt.Verify(r.Context(), &jwt.VerifyParams{
		Token: sessionToken,
	})

	if err != nil {
		return nil, err
	}

	usr, err := user.Get(r.Context(), claims.Subject)
	if err != nil {
		return nil, err
	}

	var metadata map[string]string
	if err := json.Unmarshal(usr.PublicMetadata, &metadata); err != nil {
		log.Println("Error unmarshalling PublicMetadata:", err)
		return nil,err
	}

	return &AuthData{
		Claims: claims,
		Role:   metadata["role"],
	}, nil
}
