package handlers

import (
	"artguard/config"
	"artguard/models"
	"artguard/utils"
	"context"
	"time"

	"firebase.google.com/go/auth"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// POST /api/user/fcm-token
func UpdateFcmToken(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(int)
	var input struct {
		Token string `json:"token"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}
	_, err := config.DB.Exec(c.Context(), `
		UPDATE users SET fcm_token=$1, updated_at=NOW() WHERE id=$2
	`, input.Token, userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update token"})
	}
	return c.SendStatus(200)
}

func VerifyFirebaseToken(idToken string) (*auth.Token, error) {
	token, err := FirebaseAuthClient.VerifyIDToken(context.Background(), idToken)
	if err != nil {
		return nil, err
	}
	return token, nil
}

func GoogleLogin(c *fiber.Ctx) error {
	var input struct {
		IdToken string `json:"idToken"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	token, err := VerifyFirebaseToken(input.IdToken)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid Google token"})
	}

	email, ok := token.Claims["email"].(string)
	if !ok || email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email not found in token"})
	}

	name := ""
	if n, ok := token.Claims["name"].(string); ok {
		name = n
	}

	var user models.User
	err = config.DB.QueryRow(c.Context(),
		`SELECT id, role FROM users WHERE email=$1`, email).Scan(&user.ID, &user.Role)

	if err != nil {
		err = config.DB.QueryRow(c.Context(), `
			INSERT INTO users (name, email, role, created_at, updated_at)
			VALUES ($1, $2, 'viewer', NOW(), NOW()) RETURNING id
		`, name, email).Scan(&user.ID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
		}
		user.Role = "viewer"
	}

	tokenJWT, err := utils.GenerateJWT(user.ID, user.Role)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}
	return c.JSON(fiber.Map{"token": tokenJWT})
}

// POST /register
func Register(c *fiber.Ctx) error {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 12)

	var id int
	err := config.DB.QueryRow(c.Context(), `
		INSERT INTO users (name, email, role, password_hash, created_at, updated_at)
		VALUES ($1, $2, 'viewer', $3, NOW(), NOW()) RETURNING id
	`, input.Name, input.Email, string(hash)).Scan(&id)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Registration failed"})
	}

	token, _ := utils.GenerateJWT(id, "viewer")
	return c.JSON(fiber.Map{"token": token})
}

// POST /login
func Login(c *fiber.Ctx) error {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var u models.User
	err := config.DB.QueryRow(c.Context(), `
		SELECT id, name, role, password_hash FROM users WHERE email=$1
	`, input.Email).Scan(&u.ID, &u.Name, &u.Role, &u.PasswordHash)

	if err != nil || bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(input.Password)) != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token, _ := utils.GenerateJWT(u.ID, u.Role)
	return c.JSON(fiber.Map{"token": token})
}

func GetMe(c *fiber.Ctx) error {
	userID := c.Locals("user_id")

	var u models.User
	err := config.DB.QueryRow(c.Context(), `
		SELECT id, name, email, role, created_at, updated_at
		FROM users WHERE id = $1
	`, userID).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)

	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(u)
}

// GET /api/users (admin only)
func GetUsers(c *fiber.Ctx) error {
	rows, err := config.DB.Query(c.Context(), `SELECT id, name, email, role, created_at, updated_at FROM users`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error"})
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}
	return c.JSON(users)
}

// POST /api/users (admin only)
func CreateUser(c *fiber.Ctx) error {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	var id int
	err := config.DB.QueryRow(c.Context(), `
		INSERT INTO users (name, email, role, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $5) RETURNING id
	`, input.Name, input.Email, input.Role, string(hash), time.Now()).Scan(&id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.Status(201).JSON(fiber.Map{"id": id})
}

// PUT /api/users/:id (admin only)
func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var input struct {
		Name  string `json:"name"`
		Role  string `json:"role"`
		Email string `json:"email"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	_, err := config.DB.Exec(c.Context(),
		`UPDATE users SET name=$1, role=$2, email=$3, updated_at=$4 WHERE id=$5`,
		input.Name, input.Role, input.Email, time.Now(), id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update user"})
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/users/:id (admin only)
func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := config.DB.Exec(c.Context(), `DELETE FROM users WHERE id=$1`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete user"})
	}
	return c.JSON(fiber.Map{"success": true})
}
