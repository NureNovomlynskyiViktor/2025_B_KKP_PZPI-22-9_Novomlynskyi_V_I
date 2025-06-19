package models

import "time"

type Alert struct {
	ID                 int        `json:"id"`
	SensorID           int        `json:"sensor_id"`
	UserID             int        `json:"user_id"`
	AlertType          string     `json:"alert_type"`
	AlertMessage       string     `json:"alert_message"`
	Viewed             bool       `json:"viewed"`
	CreatedAt          time.Time  `json:"created_at"`
	ResolvedAt         *time.Time `json:"resolved_at,omitempty"`
	ResolvedBy         *string    `json:"resolved_by,omitempty"`
	ResolvedByUserID   *int       `json:"resolved_by_user_id,omitempty"`
	ResolvedByUserName *string    `json:"resolved_by_user_name,omitempty"`
}
