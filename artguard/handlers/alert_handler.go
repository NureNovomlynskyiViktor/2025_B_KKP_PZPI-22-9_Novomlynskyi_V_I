package handlers

import (
	"artguard/config"
	"artguard/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GET /alerts
func GetAllAlerts(c *fiber.Ctx) error {
	sensorID := c.QueryInt("sensor_id")
	alertType := c.Query("type", "")
	viewed := c.Query("viewed")

	sortField := c.Query("sort", "created_at")
	order := c.Query("order", "desc")
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	if sortField != "created_at" && sortField != "alert_type" {
		sortField = "created_at"
	}
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	query := `
		SELECT a.id, a.sensor_id, a.user_id, a.alert_type, a.alert_message, a.viewed, a.created_at,
		       a.resolved_at, a.resolved_by, a.resolved_by_user_id, u.name
		FROM alerts a
		LEFT JOIN users u ON u.id = a.resolved_by_user_id
		WHERE ($1 = 0 OR a.sensor_id = $1)
		  AND ($2 = '' OR a.alert_type = $2)
		  AND ($3 = '' OR a.viewed = ($3::boolean))
		ORDER BY ` + sortField + ` ` + order + `
		LIMIT $4 OFFSET $5
	`

	rows, err := config.DB.Query(c.Context(), query, sensorID, alertType, viewed, limit, offset)
	if err != nil {
		fmt.Println("❌ Query error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var alerts []models.Alert

	for rows.Next() {
		var a models.Alert
		var resolvedByUserID *int
		var resolvedByUserName *string

		err := rows.Scan(
			&a.ID, &a.SensorID, &a.UserID, &a.AlertType, &a.AlertMessage, &a.Viewed,
			&a.CreatedAt, &a.ResolvedAt, &a.ResolvedBy, &resolvedByUserID, &resolvedByUserName,
		)
		if err != nil {
			fmt.Println("❌ Scan error:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Scan error", "details": err.Error()})
		}

		a.ResolvedByUserID = resolvedByUserID
		a.ResolvedByUserName = resolvedByUserName
		alerts = append(alerts, a)
	}

	return c.JSON(alerts)
}

// GET /alerts/sensor/:id
func GetAlertsBySensor(c *fiber.Ctx) error {
	sensorID := c.Params("id")

	query := `
		SELECT a.id, a.sensor_id, a.user_id, a.alert_type, a.alert_message, a.viewed, a.created_at,
		       a.resolved_at, a.resolved_by, a.resolved_by_user_id, u.name
		FROM alerts a
		LEFT JOIN users u ON u.id = a.resolved_by_user_id
		WHERE a.sensor_id = $1
		ORDER BY a.created_at DESC
	`

	rows, err := config.DB.Query(c.Context(), query, sensorID)
	if err != nil {
		fmt.Println("❌ Query error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var alerts []models.Alert

	for rows.Next() {
		var a models.Alert
		var resolvedByUserID *int
		var resolvedByUserName *string

		err := rows.Scan(
			&a.ID, &a.SensorID, &a.UserID, &a.AlertType, &a.AlertMessage, &a.Viewed,
			&a.CreatedAt, &a.ResolvedAt, &a.ResolvedBy, &resolvedByUserID, &resolvedByUserName,
		)
		if err != nil {
			fmt.Println("❌ Scan error:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Scan error", "details": err.Error()})
		}

		a.ResolvedByUserID = resolvedByUserID
		a.ResolvedByUserName = resolvedByUserName
		alerts = append(alerts, a)
	}

	return c.JSON(alerts)
}

// PATCH /alerts/:id/viewed
func MarkAlertViewed(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(int)

	query := `
		UPDATE alerts
		SET viewed = TRUE,
		    resolved_at = $2,
		    resolved_by = 'manual',
		    resolved_by_user_id = $3
		WHERE id = $1
	`

	_, err := config.DB.Exec(c.Context(), query, id, time.Now(), userID)
	if err != nil {
		fmt.Println("❌ Update error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update alert"})
	}

	return c.JSON(fiber.Map{
		"message": "Alert marked as viewed",
		"user_id": userID,
	})
}
