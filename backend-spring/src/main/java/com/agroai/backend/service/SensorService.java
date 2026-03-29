package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class SensorService {

    private final ThingSpeakService thingSpeakService;
    private final AppProperties properties;

    public SensorService(ThingSpeakService thingSpeakService, AppProperties properties) {
        this.thingSpeakService = thingSpeakService;
        this.properties = properties;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> latestSensors() {
        Map<String, Object> feedsData = thingSpeakService.fetchFeeds(1);
        List<Map<String, Object>> feeds = (List<Map<String, Object>>) feedsData.getOrDefault("feeds", List.of());

        if (feeds.isEmpty()) {
            return Map.of(
                "success", false,
                "message", "No sensor data available - ThingSpeak channel has no data",
                "data", Map.of(
                    "deviceStatus", Map.of(
                        "online", false,
                        "lastUpdate", null,
                        "minutesAgo", null,
                        "status", "No Data"
                    )
                )
            );
        }

        Map<String, Object> latest = feeds.get(feeds.size() - 1);
        Instant ts = Instant.parse(String.valueOf(latest.get("created_at")));
        long minutesAgo = Duration.between(ts, Instant.now()).toMinutes();

        Double temperature = parseDouble(latest.get("field1"));
        Double soilMoisture = parseDouble(latest.get("field2"));
        Double humidity = parseDouble(latest.get("field4"));
        String motorStatus = latest.get("field3") == null ? null : String.valueOf(latest.get("field3"));

        // Strict online rule: fresh update within 5 minutes and valid core sensor fields.
        boolean validTemperature = temperature != null && temperature >= -50 && temperature <= 80;
        boolean validMoisture = soilMoisture != null && soilMoisture >= 0 && soilMoisture <= 100;
        boolean validHumidity = humidity == null || (humidity >= 0 && humidity <= 100);
        boolean hasMotorField = motorStatus != null;
        boolean online = minutesAgo <= 5 && validTemperature && validMoisture && validHumidity && hasMotorField;

        Map<String, Object> sensorData = new HashMap<>();
        sensorData.put("temperature", temperature);
        sensorData.put("soilMoisture", soilMoisture);
        sensorData.put("humidity", humidity);
        sensorData.put("motorStatus", motorStatus);
        sensorData.put("timestamp", latest.get("created_at"));
        sensorData.put("entryId", latest.get("entry_id"));
        sensorData.put("deviceStatus", Map.of(
            "online", online,
            "lastUpdate", latest.get("created_at"),
            "minutesAgo", minutesAgo,
            "status", online ? "Online" : "Offline (" + minutesAgo + " minutes ago)"
        ));

        return Map.of(
            "success", true,
            "data", sensorData,
            "timestamp", Instant.now().toString(),
            "message", online ? "Device online and data current" : "Device offline, showing last data from " + minutesAgo + " minutes ago"
        );
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> history(int limit) {
        int results = Math.min(limit, 8000);
        Map<String, Object> feedsData = thingSpeakService.fetchFeeds(results);
        List<Map<String, Object>> feeds = (List<Map<String, Object>>) feedsData.getOrDefault("feeds", List.of());

        if (feeds.isEmpty()) {
            return Map.of("success", false, "message", "No sensor history available", "data", List.of());
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = feeds.size() - 1; i >= 0; i--) {
            Map<String, Object> feed = feeds.get(i);
            rows.add(Map.of(
                "timestamp", feed.get("created_at"),
                "entryId", feed.get("entry_id"),
                "temperature", parseDouble(feed.get("field1")),
                "soilMoisture", parseDouble(feed.get("field2")),
                "motorStatus", "1".equals(String.valueOf(feed.get("field3"))) ? "running" : "stopped",
                "humidity", parseDouble(feed.get("field4"))
            ));
        }

        return Map.of(
            "success", true,
            "data", rows,
            "count", rows.size(),
            "channel", properties.getThingspeak().getChannelId(),
            "timestamp", Instant.now().toString()
        );
    }

    private Double parseDouble(Object value) {
        try {
            if (value == null) {
                return null;
            }
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ex) {
            return null;
        }
    }
}
