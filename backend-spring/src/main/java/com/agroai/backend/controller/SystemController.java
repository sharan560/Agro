package com.agroai.backend.controller;

import com.agroai.backend.config.AppProperties;
import java.time.Instant;
import java.util.Map;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class SystemController {

    private final AppProperties properties;
    private final Environment environment;

    public SystemController(AppProperties properties, Environment environment) {
        this.properties = properties;
        this.environment = environment;
    }

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
            "message", "AgroAI Backend API is running!",
            "status", "healthy",
            "timestamp", Instant.now().toString(),
            "endpoints", Map.of(
                "health", "/api/health",
                "test", "/api/test",
                "sensors", "/api/sensors/latest",
                "auth", "/api/auth/login"
            )
        );
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "Server running",
            "timestamp", Instant.now().toString(),
            "port", environment.getProperty("server.port", "3000"),
            "environment", properties.getNodeEnv(),
            "version", "2.0.0-spring",
            "uptime", System.currentTimeMillis()
        );
    }

    @GetMapping("/api/test")
    public Map<String, Object> test() {
        return Map.of(
            "message", "API is working!",
            "timestamp", Instant.now().toString(),
            "config", Map.of(
                "port", environment.getProperty("server.port", "3000"),
                "nodeEnv", properties.getNodeEnv(),
                "hasGeminiKey", properties.getGeminiApiKey() != null && !properties.getGeminiApiKey().isBlank(),
                "hasMongoDB", environment.getProperty("MONGODB_URI") != null
                    || environment.getProperty("SPRING_DATA_MONGODB_URI") != null
            )
        );
    }
}
