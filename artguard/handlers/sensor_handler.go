package handlers

import (
	"artguard/config"
	"artguard/models"

	"github.com/gofiber/fiber/v2"
)

// GET /sensors
func GetSensors(c *fiber.Ctx) error {
	rows, err := config.DB.Query(c.Context(), "SELECT id, object_id, type, unit, identifier, created_at FROM sensors")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var sensors []models.Sensor
	for rows.Next() {
		var s models.Sensor
		err := rows.Scan(&s.ID, &s.ObjectID, &s.Type, &s.Unit, &s.Identifier, &s.CreatedAt)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		sensors = append(sensors, s)
	}

	return c.JSON(sensors)
}

// GET /sensors/by-object/:id
func GetSensorsByObject(c *fiber.Ctx) error {
	objectID := c.Params("id")
	rows, err := config.DB.Query(c.Context(), `
		SELECT id, object_id, type, unit, identifier, created_at 
		FROM sensors WHERE object_id = $1`, objectID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var sensors []models.Sensor
	for rows.Next() {
		var s models.Sensor
		err := rows.Scan(&s.ID, &s.ObjectID, &s.Type, &s.Unit, &s.Identifier, &s.CreatedAt)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		sensors = append(sensors, s)
	}

	return c.JSON(sensors)
}

// POST /sensors
func CreateSensor(c *fiber.Ctx) error {
	var s models.Sensor
	if err := c.BodyParser(&s); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	query := `
		INSERT INTO sensors (object_id, type, unit, identifier, created_at) 
		VALUES ($1, $2, $3, $4, NOW()) RETURNING id, created_at`
	err := config.DB.QueryRow(c.Context(), query, s.ObjectID, s.Type, s.Unit, s.Identifier).
		Scan(&s.ID, &s.CreatedAt)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Insert error"})
	}

	return c.Status(201).JSON(s)
}

// PUT /sensors/:id
func UpdateSensor(c *fiber.Ctx) error {
	id := c.Params("id")
	var s models.Sensor
	if err := c.BodyParser(&s); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	query := `
		UPDATE sensors SET object_id=$1, type=$2, unit=$3, identifier=$4 
		WHERE id=$5`
	_, err := config.DB.Exec(c.Context(), query, s.ObjectID, s.Type, s.Unit, s.Identifier, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update error"})
	}

	return c.JSON(fiber.Map{"message": "Sensor updated"})
}

// DELETE /sensors/:id
func DeleteSensor(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := config.DB.Exec(c.Context(), "DELETE FROM sensors WHERE id=$1", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Delete error"})
	}

	return c.JSON(fiber.Map{"message": "Sensor deleted"})
}

// GET /sensors-with-object
func GetSensorsWithObjectName(c *fiber.Ctx) error {
	rows, err := config.DB.Query(c.Context(), `
		SELECT s.id, s.object_id, o.name, s.type, s.unit, s.identifier, s.created_at
		FROM sensors s
		LEFT JOIN objects o ON s.object_id = o.id
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var sensors []models.SensorWithObjectName
	for rows.Next() {
		var s models.SensorWithObjectName
		err := rows.Scan(&s.ID, &s.ObjectID, &s.ObjectName, &s.Type, &s.Unit, &s.Identifier, &s.CreatedAt)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		sensors = append(sensors, s)
	}

	return c.JSON(sensors)
}
