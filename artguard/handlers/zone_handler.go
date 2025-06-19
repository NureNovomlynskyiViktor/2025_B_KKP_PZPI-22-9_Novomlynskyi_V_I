package handlers

import (
	"artguard/config"
	"artguard/models"

	"github.com/gofiber/fiber/v2"
)

// GET /zones
func GetZones(c *fiber.Ctx) error {
	rows, err := config.DB.Query(c.Context(), "SELECT id, museum_id, name, created_at FROM zones")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}
	defer rows.Close()

	var zones []models.Zone
	for rows.Next() {
		var z models.Zone
		err := rows.Scan(&z.ID, &z.MuseumID, &z.Name, &z.CreatedAt)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		zones = append(zones, z)
	}

	return c.JSON(zones)
}

// POST /zones
func CreateZone(c *fiber.Ctx) error {
	var z models.Zone
	if err := c.BodyParser(&z); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	query := `INSERT INTO zones (museum_id, name, created_at) VALUES ($1, $2, NOW()) RETURNING id, created_at`
	err := config.DB.QueryRow(c.Context(), query, z.MuseumID, z.Name).Scan(&z.ID, &z.CreatedAt)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Insert error"})
	}

	return c.Status(201).JSON(z)
}

// PUT /zones/:id
func UpdateZone(c *fiber.Ctx) error {
	id := c.Params("id")
	var z models.Zone
	if err := c.BodyParser(&z); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	query := `UPDATE zones SET museum_id=$1, name=$2 WHERE id=$3`
	_, err := config.DB.Exec(c.Context(), query, z.MuseumID, z.Name, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update error"})
	}

	return c.JSON(fiber.Map{"message": "Zone updated"})
}

// DELETE /zones/:id
func DeleteZone(c *fiber.Ctx) error {
	id := c.Params("id")

	_, err := config.DB.Exec(c.Context(), "DELETE FROM zones WHERE id=$1", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Delete error"})
	}

	return c.JSON(fiber.Map{"message": "Zone deleted"})
}

// GET /zones/stats — кількість об'єктів на зону
func GetZoneStats(c *fiber.Ctx) error {
	rows, err := config.DB.Query(c.Context(), `
		SELECT z.id, z.name, COUNT(o.id) AS object_count
		FROM zones z
		LEFT JOIN objects o ON o.zone_id = z.id
		GROUP BY z.id
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query error"})
	}
	defer rows.Close()

	type ZoneStat struct {
		ID          int    `json:"id"`
		Name        string `json:"name"`
		ObjectCount int    `json:"object_count"`
	}

	var stats []ZoneStat
	for rows.Next() {
		var s ZoneStat
		if err := rows.Scan(&s.ID, &s.Name, &s.ObjectCount); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		stats = append(stats, s)
	}

	return c.JSON(stats)
}
