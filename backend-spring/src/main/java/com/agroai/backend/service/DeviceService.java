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
        Map<String, Object> sensorData = new java.util.HashMap<>();

        try {
            Map<String, Object> feedsData = thingSpeakService.fetchFeeds(100);
            List<Map<String, Object>> feeds = (List<Map<String, Object>>) feedsData.getOrDefault("feeds", List.of());
            if (!feeds.isEmpty()) {
                Map<String, Object> latest = feeds.get(feeds.size() - 1);
                Instant updatedAt = Instant.parse(String.valueOf(latest.get("created_at")));
                long minutes = Duration.between(updatedAt, Instant.now()).toMinutes();
                deviceOnline = minutes <= 5;

                Double temperature = null;
                Double moisture = null;
                Double humidity = null;
                String motorValue = null;

                // Scan backward to find the latest valid non-null sensor values
                for (int i = feeds.size() - 1; i >= 0; i--) {
                    Map<String, Object> feed = feeds.get(i);
                    if (temperature == null) temperature = parseDouble(feed.get("field1"));
                    if (moisture == null) moisture = parseDouble(feed.get("field2"));
                    if (humidity == null) humidity = parseDouble(feed.get("field4"));
                    if (motorValue == null && feed.get("field3") != null) {
                        motorValue = String.valueOf(feed.get("field3"));
                    }
                }

                // If still null, set defaults or leave null
                if (motorValue == null) motorValue = "0";

                boolean validMoisture = moisture != null && moisture >= 0 && moisture <= 100;
                boolean validTemperature = temperature != null && temperature >= -50 && temperature <= 80;
                if (!validMoisture || !validTemperature) {
                    deviceOnline = false;
                }

                sensorData.put("moisture", moisture);
                sensorData.put("temperature", temperature);
                sensorData.put("humidity", humidity);
                sensorData.put("motorStatus", "1".equals(motorValue) ? "Running" : "Standby");
                sensorData.put("motorValue", motorValue);
                sensorData.put("field1", temperature);
                sensorData.put("field2", moisture);
                sensorData.put("field3", motorValue);
                sensorData.put("field4", humidity);
                sensorData.put("lastUpdated", latest.get("created_at"));
                sensorData.put("minutesAgo", minutes);
            }
        } catch (Exception ignored) {
            deviceOnline = false;
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("success", true);
        result.put("online", deviceOnline);
        result.put("sensorData", sensorData.isEmpty() ? null : sensorData);
        result.put("message", deviceOnline
            ? "Device is online and transmitting data"
            : (!sensorData.isEmpty() ? "Device is offline, showing last valid sensor data from " + sensorData.get("minutesAgo") + " minutes ago" : "Device is offline or not transmitting valid data"));
        result.put("timestamp", Instant.now().toString());
        return result;
    }

    private Double parseDouble(Object val) {
        try {
            return val == null ? null : Double.parseDouble(String.valueOf(val));
        } catch (Exception ex) {
            return null;
        }
    }
}
