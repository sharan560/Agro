package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MotorService {

    private final ThingSpeakService thingSpeakService;
    private final AppProperties properties;
    private final AtomicLong lastMotorControlEpochMs = new AtomicLong(0);

    public MotorService(ThingSpeakService thingSpeakService, AppProperties properties) {
        this.thingSpeakService = thingSpeakService;
        this.properties = properties;
    }

    public Map<String, Object> control(String action, boolean simulationMode) {
        if (!"on".equals(action) && !"off".equals(action)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid action. Use 'on' or 'off'");
        }

        long now = System.currentTimeMillis();
        long last = lastMotorControlEpochMs.get();
        if (last > 0 && (now - last) < 15000) {
            long waitSeconds = (15000 - (now - last) + 999) / 1000;
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                "Please wait " + waitSeconds + " seconds before controlling the motor again");
        }
        lastMotorControlEpochMs.set(now);

        String value = "on".equals(action) ? "1" : "0";
        Integer responseEntryId = simulationMode ? ((int) (Math.random() * 1000) + 1000) : thingSpeakService.updateField(3, value);

        return Map.of(
            "success", true,
            "message", "Motor turned " + action + " successfully",
            "motorStatus", "on".equals(action) ? "running" : "stopped",
            "timestamp", Instant.now().toString(),
            "thingSpeakResponse", responseEntryId,
            "simulationMode", simulationMode,
            "note", simulationMode
                ? "Hardware simulation mode: Motor " + action + " (mock ThingSpeak update). Mock Entry ID: " + responseEntryId
                : "Control signal sent to ThingSpeak successfully. Entry ID: " + responseEntryId
        );
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> status() {
        Map<String, Object> feedsData = thingSpeakService.fetchFeeds(1);
        List<Map<String, Object>> feeds = (List<Map<String, Object>>) feedsData.getOrDefault("feeds", List.of());
        if (feeds.isEmpty()) {
            return Map.of("success", false, "message", "No motor status data available", "motorStatus", "unknown");
        }

        Map<String, Object> latest = feeds.get(feeds.size() - 1);
        String motorValue = String.valueOf(latest.get("field3"));
        return Map.of(
            "success", true,
            "motorStatus", "1".equals(motorValue) ? "running" : "stopped",
            "motorValue", motorValue,
            "timestamp", latest.get("created_at"),
            "entryId", latest.get("entry_id")
        );
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> debugThingSpeak() {
        Map<String, Object> feedsData = thingSpeakService.fetchFeeds(5);
        List<Map<String, Object>> feeds = (List<Map<String, Object>>) feedsData.getOrDefault("feeds", List.of());
        Instant now = Instant.now();

        List<Map<String, Object>> analysis = feeds.stream().map(feed -> {
            Instant created = Instant.parse(String.valueOf(feed.get("created_at")));
            long mins = Duration.between(created, now).toMinutes();
            return Map.of(
                "timestamp", feed.get("created_at"),
                "minutesAgo", mins,
                "field1", feed.get("field1"),
                "field2", feed.get("field2"),
                "field3", feed.get("field3"),
                "field4", feed.get("field4"),
                "motorStatus", "1".equals(String.valueOf(feed.get("field3"))) ? "RUNNING" : "STOPPED"
            );
        }).toList();

        return Map.of(
            "success", true,
            "channelId", properties.getThingspeak().getChannelId(),
            "totalFeeds", feeds.size(),
            "analysis", analysis,
            "lastUpdate", feeds.isEmpty() ? null : feeds.get(feeds.size() - 1).get("created_at"),
            "currentTime", now.toString()
        );
    }
}
