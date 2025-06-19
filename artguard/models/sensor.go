package models

import "time"

type Sensor struct {
	ID         int       `json:"id"`
	ObjectID   int       `json:"object_id"`
	Type       string    `json:"type"`       // temperature, humidity, vibration
	Unit       string    `json:"unit"`       // °C, %, Hz
	Identifier string    `json:"identifier"` // унікальний код або MAC
	CreatedAt  time.Time `json:"created_at"`
}

type SensorWithObjectName struct {
	ID         int       `json:"id"`
	ObjectID   int       `json:"object_id"`
	ObjectName string    `json:"object_name"`
	Type       string    `json:"type"`
	Unit       string    `json:"unit"`
	Identifier string    `json:"identifier"`
	CreatedAt  time.Time `json:"created_at"`
}
