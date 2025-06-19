package models

import "time"

type Zone struct {
	ID        int       `json:"id"`
	MuseumID  int       `json:"museum_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}
