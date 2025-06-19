package main

import (
	"artguard/config"
	"artguard/handlers"
	"artguard/routes"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Fatal("Failed to load .env file")
	}

	config.ConnectDB()
	defer config.DB.Close()

	handlers.InitFirebase()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3001",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("API is working!")
	})

	routes.RegisterRoutes(app)

	log.Fatal(app.Listen(":3000"))
}
