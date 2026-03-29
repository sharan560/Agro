#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// 🔐 WiFi Credentials
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// 🌐 ThingSpeak API
String readApiKey = "JRDAPKYRYFI67DZB";  // Your READ API key
String writeApiKey = "K3H52YQQRAIKCS59"; // Your WRITE API key
const char* readServer = "http://api.thingspeak.com/channels/3314379/feeds.json";
const char* writeServer = "http://api.thingspeak.com/update";

// 📌 Pin Definitions
#define ONE_WIRE_BUS 4     
#define MOISTURE_PIN 34    
#define MOTOR_PIN 5         // Changed from LED to MOTOR_PIN for clarity

// 🌡️ Sensor Setup
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// 💡 Motor status variables
bool motorStatus = false;  // Current motor state
bool manualOverride = false; // Manual control from web
unsigned long lastThingSpeakRead = 0;
const unsigned long THINGSPEAK_READ_INTERVAL = 30000; // Read every 30 seconds

void setup() {
  Serial.begin(115200);

  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);

  sensors.begin();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected!");
  Serial.println("🌾 Smart Irrigation System Started");
}

void loop() {
  // 🌡️ Read Temperature
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  // 🌱 Read Moisture
  int moisture = analogRead(MOISTURE_PIN);

  // � Read ThingSpeak for LED control
  readThingSpeakControl();

  // � Print values
  Serial.print("🌡️ Temp: ");
  Serial.print(temperature);
  Serial.print(" °C | 🌱 Moisture: ");
  Serial.print(moisture);
  Serial.print(" | 💡 LED: ");
  Serial.println(motorStatus ? "ON" : "OFF");

  // 🌐 Send Data to ThingSpeak
  sendToThingSpeak(temperature, moisture);

  Serial.println("----------------------------------");
  delay(15000); // ThingSpeak limit
}

void readThingSpeakControl() {
  // Read ThingSpeak every 30 seconds for LED control
  if (millis() - lastThingSpeakRead > THINGSPEAK_READ_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      
      // Get latest feed to check field3 (LED control)
      String url = String(readServer) + "?api_key=" + readApiKey + "&results=1";
      
      http.begin(url);
      int httpCode = http.GET();

      if (httpCode > 0) {
        String payload = http.getString();
        
        // Parse JSON response
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, payload);
        
        if (doc["feeds"].size() > 0) {
          JsonObject feed = doc["feeds"][0];
          String field3Value = feed["field3"];
          
          // Control LED directly based on field3 value
          if (field3Value == "1") {
            digitalWrite(MOTOR_PIN, HIGH);
            motorStatus = true;
            Serial.println("� LED ON (field3=1)");
          } else if (field3Value == "0") {
            digitalWrite(MOTOR_PIN, LOW);
            motorStatus = false;
            Serial.println("� LED OFF (field3=0)");
          } else {
            // Default to OFF if field3 is not 0 or 1
            digitalWrite(MOTOR_PIN, LOW);
            motorStatus = false;
            Serial.println("🛑 LED OFF (field3=undefined, default OFF)");
          }
        }
      } else {
        Serial.println("❌ Failed to read ThingSpeak control");
      }
      
      http.end();
      lastThingSpeakRead = millis();
    }
  }
}

void sendToThingSpeak(float temperature, int moisture) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String url = String(writeServer);
    url += "?api_key=" + writeApiKey;
    url += "&field1=" + String(temperature);
    url += "&field2=" + String(moisture);
    url += "&field3=" + String(motorStatus ? "1" : "0");  // Motor status in field3
    url += "&field4=" + String(random(40, 80)); // Mock humidity in field4

    http.begin(url);
    int httpCode = http.GET();

    if (httpCode > 0) {
      Serial.println("📡 Data sent to ThingSpeak");
    } else {
      Serial.println("❌ Error sending data to ThingSpeak");
    }

    http.end();
  }
}
