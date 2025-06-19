package models

import "time"

type Object struct {
	ID           int       `json:"id"`
	ZoneID       int       `json:"zone_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Material     string    `json:"material"`
	Value        string    `json:"value"`
	CreationDate time.Time `json:"creation_date"`
	UpdatedAt    time.Time `json:"updated_at"`
}
