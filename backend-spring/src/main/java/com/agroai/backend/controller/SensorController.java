package com.agroai.backend.controller;

import com.agroai.backend.config.AppProperties;
import com.agroai.backend.service.SensorService;
import com.agroai.backend.service.ThingSpeakService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final SensorService sensorService;
    private final ThingSpeakService thingSpeakService;
    private final AppProperties properties;

    public SensorController(SensorService sensorService, ThingSpeakService thingSpeakService, AppProperties properties) {
        this.sensorService = sensorService;
        this.thingSpeakService = thingSpeakService;
        this.properties = properties;
    }

    @GetMapping("/latest")
    public Map<String, Object> latest() {
        return sensorService.latestSensors();
    }

    @GetMapping("/history")
    public Map<String, Object> history(@RequestParam(name = "limit", defaultValue = "100") int limit) {
        return sensorService.history(limit);
    }

    @GetMapping("/debug")
    public Map<String, Object> debug() {
        Map<String, Object> feeds = thingSpeakService.fetchFeeds(1);
        return Map.of(
            "success", true,
            "message", "ThingSpeak connection successful",
            "config", Map.of(
                "channelId", properties.getThingspeak().getChannelId(),
                "hasReadKey", properties.getThingspeak().getReadApiKey() != null
            ),
            "data", feeds
        );
    }
}
