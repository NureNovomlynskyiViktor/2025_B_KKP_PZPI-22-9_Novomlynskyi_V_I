package models

import "time"

type Measurement struct {
	ID         int       `json:"id"`
	SensorID   int       `json:"sensor_id"`
	Value      float64   `json:"value"`
	MeasuredAt time.Time `json:"measured_at"`
}
