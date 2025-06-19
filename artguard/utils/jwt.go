package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTUser struct {
	ID   int
	Role string
}

var Secret = []byte("your_secret_key")

func GenerateJWT(userID int, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(Secret)
}
