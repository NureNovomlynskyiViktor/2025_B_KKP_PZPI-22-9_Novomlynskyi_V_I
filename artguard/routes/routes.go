package routes

import (
	"artguard/handlers"
	"artguard/utils"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	//Auth+users
	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)
	api.Post("/google-login", handlers.GoogleLogin)
	api.Post("/user/fcm-token", utils.JWTMiddleware(), handlers.UpdateFcmToken)
	api.Get("/me", utils.JWTMiddleware(), handlers.GetMe)
	api.Get("/users", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.GetUsers)
	api.Post("/users", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.CreateUser)
	api.Put("/users/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.UpdateUser)
	api.Delete("/users/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.DeleteUser)

	//Thresholds (admin only)
	api.Get("/thresholds", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.GetAllThresholds)
	api.Post("/thresholds", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.CreateThreshold)
	api.Put("/thresholds/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.UpdateThreshold)
	api.Delete("/thresholds/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.DeleteThreshold)

	//Zones (viewer+)
	api.Get("/zones", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetZones)
	api.Post("/zones", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.CreateZone)
	api.Put("/zones/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.UpdateZone)
	api.Delete("/zones/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.DeleteZone)
	api.Get("/zones/stats", utils.JWTMiddleware(), utils.RequireRole("admin", "staff"), handlers.GetZoneStats)

	//Objects (GET = public, rest = admin)
	api.Get("/objects", handlers.GetObjects)
	api.Get("/objects/with-latest", handlers.GetObjectsWithLatestMeasurements)
	api.Post("/objects", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.CreateObject)
	api.Put("/objects/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.UpdateObject)
	api.Delete("/objects/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.DeleteObject)

	//Sensors (viewer+ for read, admin for write)
	api.Get("/sensors", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetSensors)
	api.Get("/sensors/by-object/:id", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetSensorsByObject)
	api.Get("/sensors-with-object", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetSensorsWithObjectName)
	api.Post("/sensors", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.CreateSensor)
	api.Put("/sensors/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.UpdateSensor)
	api.Delete("/sensors/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.DeleteSensor)

	//Measurements (viewer+)
	api.Get("/measurements", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetAllMeasurements)
	api.Get("/measurements/sensor/:id", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetMeasurementsBySensor)
	api.Get("/measurements/sensor/:id/stats", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetSensorStats)
	api.Get("/measurements/sensor/:id/period", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetMeasurementsByPeriod)
	api.Post("/measurements", handlers.CreateMeasurement)

	//Alerts (staff+admin)
	api.Get("/alerts", utils.JWTMiddleware(), utils.RequireRole("admin", "staff"), handlers.GetAllAlerts)
	api.Get("/alerts/sensor/:id", utils.JWTMiddleware(), utils.RequireRole("admin", "staff"), handlers.GetAlertsBySensor)
	api.Patch("/alerts/:id/viewed", utils.JWTMiddleware(), utils.RequireRole("admin", "staff"), handlers.MarkAlertViewed)

	//Museums (viewer+ for GET, admin for write)
	api.Get("/museums", utils.JWTMiddleware(), utils.RequireRole("admin", "staff", "viewer"), handlers.GetMuseums)
	api.Post("/museums", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.CreateMuseum)
	api.Put("/museums/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.UpdateMuseum)
	api.Delete("/museums/:id", utils.JWTMiddleware(), utils.RequireRole("admin"), handlers.DeleteMuseum)
}
