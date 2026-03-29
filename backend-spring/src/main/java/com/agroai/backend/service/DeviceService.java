package com.agroai.backend.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DeviceService {

    private final ThingSpeakService thingSpeakService;

    public DeviceService(ThingSpeakService thingSpeakService) {
        this.thingSpeakService = thingSpeakService;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> status() {
        boolean deviceOnline = false;
        Map<String, Object> sensorData = null;

        try {
            Map<String, Object> feedsData = thingSpeakService.fetchFeeds(1);
            List<Map<String, Object>> feeds = (List<Map<String, Object>>) feedsData.getOrDefault("feeds", List.of());
            if (!feeds.isEmpty()) {
                Map<String, Object> latest = feeds.get(feeds.size() - 1);

                // ThingSpeak mapping in this project:
                // field1 = temperature, field2 = soil moisture, field3 = motor, field4 = humidity
                Double temperature = parseDouble(latest.get("field1"));
                Double moisture = parseDouble(latest.get("field2"));
                Double humidity = parseDouble(latest.get("field4"));
                String motorValue = String.valueOf(latest.get("field3"));

                boolean validMoisture = moisture != null && moisture >= 0 && moisture <= 100;
                boolean validTemperature = temperature != null && temperature >= -50 && temperature <= 80;
                boolean validHumidity = humidity == null || (humidity >= 0 && humidity <= 100);

                if (validMoisture && validTemperature && validHumidity) {
                    Instant updatedAt = Instant.parse(String.valueOf(latest.get("created_at")));
                    long minutes = Duration.between(updatedAt, Instant.now()).toMinutes();
                    deviceOnline = minutes <= 5;

                    // Always return latest valid values even if device is currently offline.
                    sensorData = Map.of(
                        "moisture", moisture,
                        "temperature", temperature,
                        "humidity", humidity,
                        "motorStatus", "1".equals(motorValue) ? "Running" : "Standby",
                        "motorValue", motorValue,
                        "lastUpdated", latest.get("created_at"),
                        "minutesAgo", minutes
                    );
                }
            }
        } catch (Exception ignored) {
            deviceOnline = false;
        }

        return Map.of(
            "success", true,
            "online", deviceOnline,
            "sensorData", sensorData,
            "message", deviceOnline
                ? "Device is online and transmitting data"
                : (sensorData != null ? "Device is offline, showing latest valid ThingSpeak data" : "Device is offline or not transmitting valid data"),
            "timestamp", Instant.now().toString()
        );
    }

    private Double parseDouble(Object val) {
        try {
            return val == null ? null : Double.parseDouble(String.valueOf(val));
        } catch (Exception ex) {
            return null;
        }
    }
}
