package handlers

import (
	"artguard/config"
	"artguard/models"

	"github.com/gofiber/fiber/v2"
)

// GET /thresholds
func GetAllThresholds(c *fiber.Ctx) error {
	rows, err := config.DB.Query(c.Context(), `
		SELECT id, zone_id, sensor_type, min_value, max_value FROM thresholds`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var list []models.Threshold
	for rows.Next() {
		var t models.Threshold
		if err := rows.Scan(&t.ID, &t.ZoneID, &t.SensorType, &t.MinValue, &t.MaxValue); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		list = append(list, t)
	}

	return c.JSON(list)
}

// POST /thresholds
func CreateThreshold(c *fiber.Ctx) error {
	var t models.Threshold
	if err := c.BodyParser(&t); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	query := `
		INSERT INTO thresholds (zone_id, sensor_type, min_value, max_value)
		VALUES ($1, $2, $3, $4)
		RETURNING id`
	err := config.DB.QueryRow(c.Context(), query, t.ZoneID, t.SensorType, t.MinValue, t.MaxValue).
		Scan(&t.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Insert failed"})
	}

	return c.Status(201).JSON(t)
}

// PUT /thresholds/:id
func UpdateThreshold(c *fiber.Ctx) error {
	id := c.Params("id")
	var t models.Threshold
	if err := c.BodyParser(&t); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	query := `
		UPDATE thresholds 
		SET zone_id=$1, sensor_type=$2, min_value=$3, max_value=$4
		WHERE id=$5`
	_, err := config.DB.Exec(c.Context(), query, t.ZoneID, t.SensorType, t.MinValue, t.MaxValue, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update failed"})
	}

	return c.JSON(fiber.Map{"message": "Threshold updated"})
}

// DELETE /thresholds/:id
func DeleteThreshold(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := config.DB.Exec(c.Context(), "DELETE FROM thresholds WHERE id=$1", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Delete failed"})
	}

	return c.JSON(fiber.Map{"message": "Threshold deleted"})
}
