package handlers

import (
	"artguard/config"
	"artguard/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetObjects(c *fiber.Ctx) error {
	search := c.Query("search", "")
	sortField := c.Query("sort", "id")
	order := c.Query("order", "asc")
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	// Безпечні поля
	if sortField != "name" && sortField != "created_at" {
		sortField = "id"
	}
	if order != "asc" && order != "desc" {
		order = "asc"
	}

	query := `
		SELECT id, zone_id, name, description, material, value, creation_date, updated_at
		FROM objects
		WHERE name ILIKE '%' || $1 || '%'
		ORDER BY ` + sortField + ` ` + order + `
		LIMIT $2 OFFSET $3
	`

	rows, err := config.DB.Query(c.Context(), query, search, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var list []models.Object
	for rows.Next() {
		var o models.Object
		if err := rows.Scan(&o.ID, &o.ZoneID, &o.Name, &o.Description, &o.Material, &o.Value, &o.CreationDate, &o.UpdatedAt); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		list = append(list, o)
	}

	return c.JSON(list)
}

// POST /objects
func CreateObject(c *fiber.Ctx) error {
	var obj models.Object
	if err := c.BodyParser(&obj); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	query := `
		INSERT INTO objects (zone_id, name, description, material, value, creation_date, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
		RETURNING id, updated_at
	`
	err := config.DB.QueryRow(c.Context(), query,
		obj.ZoneID, obj.Name, obj.Description, obj.Material, obj.Value, obj.CreationDate,
	).Scan(&obj.ID, &obj.UpdatedAt)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Insert failed"})
	}

	return c.Status(201).JSON(obj)
}

// PUT /objects/:id
func UpdateObject(c *fiber.Ctx) error {
	id := c.Params("id")
	var obj models.Object
	if err := c.BodyParser(&obj); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	query := `
		UPDATE objects SET zone_id=$1, name=$2, description=$3, material=$4, value=$5, creation_date=$6, updated_at=NOW()
		WHERE id=$7
	`
	_, err := config.DB.Exec(c.Context(), query,
		obj.ZoneID, obj.Name, obj.Description, obj.Material, obj.Value, obj.CreationDate, id)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update failed"})
	}

	return c.JSON(fiber.Map{"message": "Object updated"})
}

// DELETE /objects/:id
func DeleteObject(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := config.DB.Exec(c.Context(), "DELETE FROM objects WHERE id=$1", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Delete failed"})
	}

	return c.JSON(fiber.Map{"message": "Object deleted"})
}

// GET /objects/with-latest
func GetObjectsWithLatestMeasurements(c *fiber.Ctx) error {
	query := `
	SELECT o.id, o.name, o.description, o.zone_id, z.name, s.type, m.value, m.measured_at
	FROM objects o
	LEFT JOIN zones z ON o.zone_id = z.id
	LEFT JOIN sensors s ON s.object_id = o.id
	LEFT JOIN LATERAL (
		SELECT value, measured_at 
		FROM measurements 
		WHERE sensor_id = s.id 
		ORDER BY measured_at DESC LIMIT 1
	) m ON true
	ORDER BY o.id
	`

	type ObjectStat struct {
		ObjectID    int      `json:"object_id"`
		ObjectName  string   `json:"object_name"`
		Description string   `json:"description"`
		ZoneID      int      `json:"zone_id"`
		ZoneName    string   `json:"zone_name"`
		SensorType  string   `json:"sensor_type"`
		LatestValue *float64 `json:"latest_value"`
		MeasuredAt  *string  `json:"measured_at"`
	}

	rows, err := config.DB.Query(c.Context(), query)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Query failed"})
	}
	defer rows.Close()

	var stats []ObjectStat
	for rows.Next() {
		var s ObjectStat
		var measuredAt *time.Time
		err := rows.Scan(&s.ObjectID, &s.ObjectName, &s.Description, &s.ZoneID, &s.ZoneName, &s.SensorType, &s.LatestValue, &measuredAt)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Scan error"})
		}
		if measuredAt != nil {
			str := measuredAt.Format(time.RFC3339)
			s.MeasuredAt = &str
		}
		stats = append(stats, s)
	}

	return c.JSON(stats)
}
