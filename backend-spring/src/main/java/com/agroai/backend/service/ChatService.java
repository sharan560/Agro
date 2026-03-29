package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import com.agroai.backend.model.ChatMessage;
import com.agroai.backend.repository.ChatMessageRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ChatService {

    private final AppProperties properties;
    private final RestTemplate restTemplate;
    private final ThingSpeakService thingSpeakService;
    private final ChatMessageRepository chatMessageRepository;

    public ChatService(
        AppProperties properties,
        RestTemplate restTemplate,
        ThingSpeakService thingSpeakService,
        ChatMessageRepository chatMessageRepository
    ) {
        this.properties = properties;
        this.restTemplate = restTemplate;
        this.thingSpeakService = thingSpeakService;
        this.chatMessageRepository = chatMessageRepository;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> sendMessage(String userId, String message, boolean mockMode) {
        if (message == null || message.trim().isEmpty()) {
            return Map.of("response", "Message is required");
        }

        if (properties.getGeminiApiKey() == null || properties.getGeminiApiKey().isBlank()) {
            return Map.of(
                "response",
                "I'm currently unable to access the AI model because GEMINI_API_KEY is not configured. Please add it to your backend environment and restart the server."
            );
        }

        String sensorContext = "Sensor data is currently unavailable.";
        try {
            Map<String, Object> feeds = thingSpeakService.fetchFeeds(1);
            List<Map<String, Object>> list = (List<Map<String, Object>>) feeds.getOrDefault("feeds", List.of());
            if (!list.isEmpty()) {
                Map<String, Object> latest = list.get(list.size() - 1);
                sensorContext = "Soil Temperature: " + latest.get("field1") + " C, Soil Moisture: " + latest.get("field2")
                    + "%, Humidity: " + latest.get("field4") + "%, Motor Status: "
                    + ("1".equals(String.valueOf(latest.get("field3"))) ? "Running" : "Standby")
                    + ", Last Updated: " + latest.get("created_at");
            }
        } catch (Exception ignored) {
            sensorContext = "Sensor data is currently unavailable.";
        }

        String systemInstruction = "You are an expert AI Farming Assistant. Only answer farming, crop, soil, irrigation, pests, weather, IoT sensor and device status questions. "
            + "If asked non-farming topics, politely refuse and redirect. Keep responses practical and concise. "
            + "Current Sensor Data: " + sensorContext;

        String responseText = callGemini(systemInstruction, message);

        if (!mockMode) {
            ChatMessage chat = new ChatMessage();
            chat.setUserId(userId);
            chat.setMessage(message);
            chat.setResponse(responseText);
            chat.setTimestamp(Instant.now());
            chat.setLanguage("auto");
            chat.setCategory("farming");
            chatMessageRepository.save(chat);
        }

        return Map.of("response", responseText);
    }

    public Map<String, Object> history(String userId, int limit, int page, boolean mockMode) {
        if (mockMode) {
            return Map.of(
                "success", true,
                "data", List.of(),
                "pagination", Map.of("page", page, "limit", limit, "total", 0, "pages", 0)
            );
        }

        var pageable = PageRequest.of(Math.max(page - 1, 0), limit);
        var data = chatMessageRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        long total = chatMessageRepository.countByUserId(userId);

        return Map.of(
            "success", true,
            "data", data.getContent().stream().map(c -> Map.of(
                "message", c.getMessage(),
                "response", c.getResponse(),
                "timestamp", c.getTimestamp(),
                "language", c.getLanguage(),
                "category", c.getCategory()
            )).toList(),
            "pagination", Map.of(
                "page", page,
                "limit", limit,
                "total", total,
                "pages", (int) Math.ceil(total / (double) limit)
            )
        );
    }

    private String callGemini(String systemInstruction, String userMessage) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
            + properties.getGeminiApiKey();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(
            Map.of("role", "user", "parts", List.of(Map.of("text", systemInstruction))),
            Map.of("role", "user", "parts", List.of(Map.of("text", userMessage)))
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {}
            );
            return extractText(response.getBody());
        } catch (Exception ex) {
            return "Failed to process chat message";
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> body) {
        if (body == null) {
            return "No response from AI service";
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            return "No response from AI service";
        }

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) {
            return "No response from AI service";
        }

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) {
            return "No response from AI service";
        }

        Object text = parts.get(0).get("text");
        return text == null ? "No response from AI service" : String.valueOf(text);
    }
}
