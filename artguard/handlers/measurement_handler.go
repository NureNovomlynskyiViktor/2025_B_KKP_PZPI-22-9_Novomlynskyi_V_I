package handlers

import (
	"artguard/config"
	"artguard/models"
	"database/sql"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

func ifNull(f sql.NullFloat64, def float64) float64 {
	if f.Valid {
		return f.Float64
	}
	return def
}

func CreateMeasurement(c *fiber.Ctx) error {
	var m models.Measurement

	if err := c.BodyParser(&m); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	query := `INSERT INTO measurements (sensor_id, value, measured_at) 
			  VALUES ($1, $2, NOW()) RETURNING id, measured_at`
	err := config.DB.QueryRow(c.Context(), query, m.SensorID, m.Value).Scan(&m.ID, &m.MeasuredAt)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert measurement"})
	}

	var sensorType string
	var zoneID int

	query = `
		SELECT s.type, o.zone_id
		FROM sensors s
		JOIN objects o ON s.object_id = o.id
		WHERE s.id = $1`
	err = config.DB.QueryRow(c.Context(), query, m.SensorID).Scan(&sensorType, &zoneID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Sensor lookup failed"})
	}

	var minValue, maxValue float64
	query = `SELECT min_value, max_value FROM thresholds WHERE zone_id = $1 AND sensor_type = $2`
	err = config.DB.QueryRow(c.Context(), query, zoneID, sensorType).Scan(&minValue, &maxValue)
	if err != nil {
		fmt.Println("ℹ️ No thresholds found — skipping alert")
		return c.Status(201).JSON(m)
	}

	if m.Value < minValue || m.Value > maxValue {
		alertMsg := fmt.Sprintf("%s out of range: %.2f (min: %.2f, max: %.2f)", sensorType, m.Value, minValue, maxValue)

		var exists bool
		check := `SELECT EXISTS (
			SELECT 1 FROM alerts 
			WHERE sensor_id = $1 AND alert_type = $2 AND viewed = false
		)`
		err = config.DB.QueryRow(c.Context(), check, m.SensorID, sensorType+"_alert").Scan(&exists)
		if err != nil {
			fmt.Println("⚠️ Failed to check for existing alert:", err)
		}

		if !exists {
			alertQuery := `
				INSERT INTO alerts (sensor_id, user_id, alert_type, alert_message, viewed, created_at)
				VALUES ($1, $2, $3, $4, false, $5)`
			_, err := config.DB.Exec(c.Context(), alertQuery,
				m.SensorID, 1, sensorType+"_alert", alertMsg, time.Now())
			if err != nil {
				fmt.Println("❌ Failed to insert alert:", err)
			} else {
				fmt.Println("✅ Alert created:", alertMsg)

				rows, err := config.DB.Query(c.Context(),
					`SELECT fcm_token FROM users WHERE role = 'staff' AND fcm_token IS NOT NULL`)
				if err != nil {
					fmt.Println("❌ Failed to query staff tokens:", err)
				} else {
					defer rows.Close()
					for rows.Next() {
						var token string
						if err := rows.Scan(&token); err == nil && token != "" {
							_ = SendPush(token, "🚨 ArtGuard Alert", alertMsg)
						}
					}
				}
			}
		} else {
			fmt.Println("🔁 Alert already active — skipping")
		}
	} else {
		resolveQuery := `
			UPDATE alerts
			SET resolved_at = $1, resolved_by = 'auto'
			WHERE sensor_id = $2 AND alert_type = $3 AND resolved_at IS NULL
		`
		_, err := config.DB.Exec(c.Context(), resolveQuery, time.Now(), m.SensorID, sensorType+"_alert")
		if err != nil {
			fmt.Println("⚠️ Failed to resolve alert:", err)
		} else {
			fmt.Println("✅ Alert auto-resolved for sensor", m.SensorID)
		}
	}

	return c.Status(201).JSON(m)
}

func GetAllMeasurements(c *fiber.Ctx) error {
	sensorID := c.QueryInt("sensor_id")
	sortField := c.Query("sort", "measured_at")
	order := c.Query("order", "desc")
	limit := c.QueryInt("limit", 100)
	offset := c.QueryInt("offset", 0)

	if sortField != "measured_at" && sortField != "value" {
		sortField = "measured_at"
	}
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	query := `
		SELECT id, sensor_id, value, measured_at
		FROM measurements
		WHERE ($1 = 0 OR sensor_id = $1)
		ORDER BY ` + sortField + ` ` + order + `
		LIMIT $2 OFFSET $3
	`

	rows, err := config.DB.Query(c.Context(), query, sensorID, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var data []models.Measurement
	for rows.Next() {
		var m models.Measurement
		if err := rows.Scan(&m.ID, &m.SensorID, &m.Value, &m.MeasuredAt); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		data = append(data, m)
	}

	return c.JSON(data)
}

func GetMeasurementsBySensor(c *fiber.Ctx) error {
	sensorID := c.Params("id")
	rows, err := config.DB.Query(c.Context(), `SELECT id, sensor_id, value, measured_at FROM measurements WHERE sensor_id=$1 ORDER BY measured_at DESC LIMIT 100`, sensorID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var data []models.Measurement
	for rows.Next() {
		var m models.Measurement
		if err := rows.Scan(&m.ID, &m.SensorID, &m.Value, &m.MeasuredAt); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		data = append(data, m)
	}
	return c.JSON(data)
}

func GetSensorStats(c *fiber.Ctx) error {
	sensorID := c.Params("id")
	query := `SELECT COUNT(*), MIN(value), MAX(value), AVG(value) FROM measurements WHERE sensor_id = $1`

	var count int
	var min, max, avg sql.NullFloat64
	err := config.DB.QueryRow(c.Context(), query, sensorID).Scan(&count, &min, &max, &avg)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Stats query failed"})
	}

	return c.JSON(fiber.Map{
		"count": count,
		"min":   ifNull(min, 0),
		"max":   ifNull(max, 0),
		"avg":   ifNull(avg, 0),
	})
}

func GetMeasurementsByPeriod(c *fiber.Ctx) error {
	sensorID := c.Params("id")
	from := c.Query("from")
	to := c.Query("to")

	fromTime, err := time.Parse("2006-01-02", from)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid from date"})
	}
	toTime, err := time.Parse("2006-01-02", to)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid to date"})
	}

	query := `
		SELECT id, sensor_id, value, measured_at 
		FROM measurements 
		WHERE sensor_id = $1 AND measured_at BETWEEN $2 AND $3
		ORDER BY measured_at ASC`

	rows, err := config.DB.Query(c.Context(), query, sensorID, fromTime, toTime)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var data []models.Measurement
	for rows.Next() {
		var m models.Measurement
		if err := rows.Scan(&m.ID, &m.SensorID, &m.Value, &m.MeasuredAt); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		data = append(data, m)
	}
	return c.JSON(data)
}
