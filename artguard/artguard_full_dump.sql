
-- Таблиця museums
CREATE TABLE IF NOT EXISTS museums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO museums (name, description, location) VALUES
('Музей історії', 'Історичні артефакти України', 'Київ'),
('Музей сучасного мистецтва', 'Картини та інсталяції сучасних художників', 'Харків');

-- Таблиця zones
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    museum_id INTEGER REFERENCES museums(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO zones (museum_id, name) VALUES
(1, 'Археологія'),
(1, 'Етнографія'),
(2, 'Сучасне мистецтво');

-- Таблиця objects
CREATE TABLE IF NOT EXISTS objects (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES zones(id),
    name VARCHAR(255),
    description TEXT,
    material VARCHAR(100),
    value VARCHAR(50),
    creation_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO objects (zone_id, name, description, material, value, creation_date) VALUES
(1, 'Київська монета', 'Монета часів Київської Русі', 'срібло', 'висока', '1100-01-01'),
(2, 'Писанка', 'Українська традиційна писанка', 'яйце', 'середня', '1950-04-10');

-- Таблиця sensors
CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    object_id INTEGER REFERENCES objects(id),
    type VARCHAR(50),
    unit VARCHAR(20),
    identifier VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sensors (object_id, type, unit, identifier) VALUES
(1, 'temperature', '°C', 'TEMP-001'),
(1, 'humidity', '%', 'HUM-001'),
(2, 'vibration', 'Hz', 'VIB-001');

-- Таблиця measurements
CREATE TABLE IF NOT EXISTS measurements (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id),
    value FLOAT,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO measurements (sensor_id, value) VALUES
(1, 22.5),
(2, 60.0),
(3, 0.5);

-- Таблиця thresholds
CREATE TABLE IF NOT EXISTS thresholds (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES zones(id),
    sensor_type VARCHAR(50),
    min_value FLOAT,
    max_value FLOAT
);

INSERT INTO thresholds (zone_id, sensor_type, min_value, max_value) VALUES
(1, 'temperature', 18.0, 24.0),
(1, 'humidity', 40.0, 65.0),
(2, 'vibration', 0.0, 1.0);

-- Таблиця users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50),
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id),
    user_id INTEGER REFERENCES users(id),
    alert_type VARCHAR(100),
    alert_message VARCHAR(255),
    viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO alerts (sensor_id, user_id, alert_type, alert_message) VALUES
(1, 1, 'temperature_alert', 'Температура перевищує норму');
