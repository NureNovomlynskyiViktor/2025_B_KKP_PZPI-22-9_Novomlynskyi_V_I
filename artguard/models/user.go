package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Role         string    `json:"role"` // admin, staff, viewer
	PasswordHash string    `json:"-"`    // не виводимо
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	FcmToken     *string   `json:"fcm_token"`
}
