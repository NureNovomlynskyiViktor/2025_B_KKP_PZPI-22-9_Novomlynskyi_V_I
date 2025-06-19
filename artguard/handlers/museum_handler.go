package handlers

import (
	"artguard/config"
	"artguard/models"

	"github.com/gofiber/fiber/v2"
)

// GET /museums
func GetMuseums(c *fiber.Ctx) error {
	rows, err := config.DB.Query(c.Context(), `
		SELECT id, name, description, location, created_at, updated_at
		FROM museums ORDER BY id`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var museums []models.Museum
	for rows.Next() {
		var m models.Museum
		if err := rows.Scan(&m.ID, &m.Name, &m.Description, &m.Location, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		museums = append(museums, m)
	}
	return c.JSON(museums)
}

// POST /museums
func CreateMuseum(c *fiber.Ctx) error {
	var m models.Museum
	if err := c.BodyParser(&m); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	query := `
		INSERT INTO museums (name, description, location, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at, updated_at`
	err := config.DB.QueryRow(c.Context(), query, m.Name, m.Description, m.Location).
		Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Insert failed"})
	}

	return c.Status(201).JSON(m)
}

// PUT /museums/:id
func UpdateMuseum(c *fiber.Ctx) error {
	id := c.Params("id")
	var m models.Museum
	if err := c.BodyParser(&m); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	query := `
		UPDATE museums SET name=$1, description=$2, location=$3, updated_at=NOW()
		WHERE id=$4`
	_, err := config.DB.Exec(c.Context(), query, m.Name, m.Description, m.Location, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update failed"})
	}

	return c.JSON(fiber.Map{"message": "Museum updated"})
}

// DELETE /museums/:id
func DeleteMuseum(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := config.DB.Exec(c.Context(), "DELETE FROM museums WHERE id=$1", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Delete failed"})
	}
	return c.JSON(fiber.Map{"message": "Museum deleted"})
}
