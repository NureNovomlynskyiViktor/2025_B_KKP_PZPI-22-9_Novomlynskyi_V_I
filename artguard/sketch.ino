#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <MPU6050_light.h>

#define DHTPIN 4
#define DHTTYPE DHT22
#define SDA_PIN 21
#define SCL_PIN 22

DHT dht(DHTPIN, DHTTYPE);
MPU6050 mpu(Wire);

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* serverName = "http://cb59-62-122-67-26.ngrok-free.app/api/measurements";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  dht.begin();

  Wire.begin(SDA_PIN, SCL_PIN);
  byte status = mpu.begin();
  if (status != 0) {
    Serial.print("MPU6050 init failed with code: ");
    Serial.println(status);
    while (1);
  }
  mpu.calcOffsets(); // калібрування

  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  mpu.update();
  float vibration = abs(mpu.getAccX()) + abs(mpu.getAccY()) + abs(mpu.getAccZ());

  if (!isnan(temperature))
    sendMeasurement(1, temperature);

  if (!isnan(humidity))
    sendMeasurement(2, humidity);

  sendMeasurement(3, vibration);

  delay(10000);
}

void sendMeasurement(int sensorId, float value) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"sensor_id\":" + String(sensorId) + ",\"value\":" + String(value) + "}";
    int code = http.POST(json);

    Serial.printf("📤 Sensor #%d → Value: %.2f | HTTP: %d\n", sensorId, value, code);
    http.end();
  }
}






