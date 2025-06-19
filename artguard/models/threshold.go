package models

type Threshold struct {
	ID         int     `json:"id"`
	ZoneID     int     `json:"zone_id"`
	SensorType string  `json:"sensor_type"`
	MinValue   float64 `json:"min_value"`
	MaxValue   float64 `json:"max_value"`
}
