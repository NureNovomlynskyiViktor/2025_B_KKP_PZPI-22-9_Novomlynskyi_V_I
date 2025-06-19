# ArtGuard — Програмна система моніторингу умов зберігання музейних експонатів

## Загальна інформація

ArtGuard — серверна частина системи, що забезпечує моніторинг температури, вологості, вібрацій, а також сповіщення при перевищенні порогових значень. Система побудована за REST-архітектурою, з авторизацією через JWT.

## Технології

- Go (Fiber)
- PostgreSQL
- JWT для авторизації
- bcrypt для хешування паролів
- Postman (тестування API)

## Структура API

### Аутентифікація

- `POST /api/register` — реєстрація (name, email, password, role)
- `POST /api/login` — логін (email, password)
- `GET /api/me` — профіль поточного користувача (JWT)

### Музеї (admin)

- `GET /api/museums`
- `POST /api/museums`
- `PUT /api/museums/:id`
- `DELETE /api/museums/:id`

### Зони

- `GET /api/zones`
- `GET /api/zones/stats`
- `POST /api/zones` (admin)
- `PUT /api/zones/:id` (admin)
- `DELETE /api/zones/:id` (admin)

### Об'єкти

- `GET /api/objects`
- `GET /api/objects/with-latest`
- `POST /api/objects` (admin)
- `PUT /api/objects/:id` (admin)
- `DELETE /api/objects/:id` (admin)

### Сенсори

- `GET /api/sensors`
- `GET /api/sensors/by-object/:id`
- `POST /api/sensors` (admin)
- `PUT /api/sensors/:id` (admin)
- `DELETE /api/sensors/:id` (admin)

### Вимірювання

- `POST /api/measurements` (від сенсора)
- `GET /api/measurements`
- `GET /api/measurements/sensor/:id`
- `GET /api/measurements/sensor/:id/stats`
- `GET /api/measurements/sensor/:id/period?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Пороги

- `GET /api/thresholds` (admin)
- `POST /api/thresholds` (admin)
- `PUT /api/thresholds/:id` (admin)
- `DELETE /api/thresholds/:id` (admin)

### Сповіщення

- `GET /api/alerts`
- `GET /api/alerts/sensor/:id`
- `PATCH /api/alerts/:id/viewed`

## Ролі користувачів

- `admin` — повний доступ
- `staff` — читання + сповіщення
- `viewer` — лише перегляд

## Запуск

go mod tidy
go run main.go
