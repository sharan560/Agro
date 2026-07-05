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
        Map<String, Object> feedsData = thingSpeakService.fetchFeeds(100);
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

        Double temperature = null;
        Double soilMoisture = null;
        Double humidity = null;
        String motorStatus = null;

        for (int i = feeds.size() - 1; i >= 0; i--) {
            Map<String, Object> feed = feeds.get(i);
            if (temperature == null) temperature = parseDouble(feed.get("field1"));
            if (soilMoisture == null) soilMoisture = parseDouble(feed.get("field2"));
            if (humidity == null) humidity = parseDouble(feed.get("field4"));
            if (motorStatus == null && feed.get("field3") != null) {
                motorStatus = String.valueOf(feed.get("field3"));
            }
        }

        if (motorStatus == null) motorStatus = "0";

        // Strict online rule: fresh update within 5 minutes and valid core sensor fields.
        boolean validTemperature = temperature != null && temperature >= -50 && temperature <= 80;
        boolean validMoisture = soilMoisture != null && soilMoisture >= 0 && soilMoisture <= 100;
        boolean online = minutesAgo <= 5 && validTemperature && validMoisture;

        Map<String, Object> dsMap = new HashMap<>();
        dsMap.put("online", online);
        dsMap.put("lastUpdate", latest.get("created_at"));
        dsMap.put("minutesAgo", minutesAgo);
        dsMap.put("status", online ? "Online" : "Offline (" + minutesAgo + " minutes ago)");

        Map<String, Object> sensorData = new HashMap<>();
        sensorData.put("temperature", temperature);
        sensorData.put("soilMoisture", soilMoisture);
        sensorData.put("humidity", humidity);
        sensorData.put("motorStatus", motorStatus);
        sensorData.put("field1", temperature);
        sensorData.put("field2", soilMoisture);
        sensorData.put("field3", motorStatus);
        sensorData.put("field4", humidity);
        sensorData.put("timestamp", latest.get("created_at"));
        sensorData.put("entryId", latest.get("entry_id"));
        sensorData.put("deviceStatus", dsMap);

        Map<String, Object> resMap = new HashMap<>();
        resMap.put("success", true);
        resMap.put("data", sensorData);
        resMap.put("timestamp", Instant.now().toString());
        resMap.put("message", online ? "Device online and data current" : "Device offline, showing last data from " + minutesAgo + " minutes ago");
        return resMap;
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
            Map<String, Object> row = new HashMap<>();
            row.put("timestamp", feed.get("created_at"));
            row.put("entryId", feed.get("entry_id"));
            row.put("temperature", parseDouble(feed.get("field1")));
            row.put("soilMoisture", parseDouble(feed.get("field2")));
            row.put("motorStatus", "1".equals(String.valueOf(feed.get("field3"))) ? "running" : "stopped");
            row.put("humidity", parseDouble(feed.get("field4")));
            rows.add(row);
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
