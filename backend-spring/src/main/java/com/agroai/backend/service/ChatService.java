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

    public ChatService(AppProperties properties, RestTemplate restTemplate, ThingSpeakService thingSpeakService, ChatMessageRepository chatMessageRepository) {
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

        String responseText = callGemini(systemInstruction, message, sensorContext);

        if (!mockMode) {
            try {
                ChatMessage chat = new ChatMessage();
                chat.setUserId(userId);
                chat.setMessage(message);
                chat.setResponse(responseText);
                chat.setTimestamp(Instant.now());
                chat.setLanguage("auto");
                chat.setCategory("farming");
                chatMessageRepository.save(chat);
            } catch (Exception ex) {
                System.err.println("⚠️ Could not save chat message to MongoDB: " + ex.getMessage());
            }
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

        try {
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
        } catch (Exception ex) {
            System.err.println("⚠️ Could not fetch history from MongoDB: " + ex.getMessage());
            return Map.of(
                "success", true,
                "data", List.of(),
                "pagination", Map.of("page", page, "limit", limit, "total", 0, "pages", 0)
            );
        }
    }

    private String callGemini(String systemInstruction, String userMessage, String sensorContext) {
        if (properties.getGeminiApiKey() == null || properties.getGeminiApiKey().isBlank()) {
            return generateFarmingFallback(userMessage, sensorContext);
        }

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
            String extracted = extractText(response.getBody());
            if (extracted != null && !extracted.contains("No response from AI service") && !extracted.contains("Failed to process")) {
                return extracted;
            }
        } catch (Exception ex) {
            System.err.println("⚠️ Gemini API call (gemini-2.5-flash) failed or unavailable: " + ex.getMessage());
        }

        return generateFarmingFallback(userMessage, sensorContext);
    }

    private String generateFarmingFallback(String userMessage, String sensorContext) {
        String lower = userMessage.toLowerCase();
        if (lower.contains("hello") || lower.contains("hi") || lower.contains("hey") || lower.contains("who are you")) {
            return "🌱 **Hello! I am your AgroAI Farming Assistant.**\n\nI can help you analyze real-time crop conditions, soil health, irrigation schedules, and IoT sensor readings.\n\n"
                 + "📡 **Current Farm Status:**\n" + sensorContext + "\n\n"
                 + "Feel free to ask me about crop diseases, fertilizer recommendations, or weather tips!";
        } else if (lower.contains("water") || lower.contains("moisture") || lower.contains("irrigation") || lower.contains("dry") || lower.contains("pump") || lower.contains("motor")) {
            return "💧 **Irrigation & Soil Moisture Advice:**\n\n"
                 + "Maintaining optimal soil moisture (between 60-80%) is critical for nutrient absorption and root development.\n\n"
                 + "📡 **Real-time Sensor Status:**\n" + sensorContext + "\n\n"
                 + "💡 **Recommendation:** If soil moisture drops below 40%, run the automated irrigation pump during early morning or late evening to minimize evaporation.";
        } else if (lower.contains("fertilizer") || lower.contains("npk") || lower.contains("nutrient") || lower.contains("urea") || lower.contains("compost") || lower.contains("soil")) {
            return "🌾 **Soil Health & Fertilizer Guidelines:**\n\n"
                 + "Balanced NPK (Nitrogen, Phosphorus, Potassium) application ensures robust foliage, strong roots, and high grain/fruit yield.\n\n"
                 + "💡 **Recommendation:**\n"
                 + "1. Conduct periodic soil tests before applying nitrogen-heavy fertilizers like urea.\n"
                 + "2. Incorporate organic compost or farmyard manure (FYM) to improve microbial biodiversity and water retention.";
        } else if (lower.contains("disease") || lower.contains("pest") || lower.contains("spot") || lower.contains("yellow") || lower.contains("leaf") || lower.contains("insect") || lower.contains("blight")) {
            return "🐛 **Crop Disease & Pest Management:**\n\n"
                 + "Early detection of leaf spots, yellowing, or fungal blight is essential to prevent rapid spread across the field.\n\n"
                 + "💡 **Action Plan:**\n"
                 + "1. Use AgroAI's **Disease Detection** tab to upload a leaf photo for instant ML diagnosis.\n"
                 + "2. For fungal infections, apply copper-based fungicides or organic neem oil extract (5ml/liter of water) during early morning hours.";
        } else if (lower.contains("weather") || lower.contains("temp") || lower.contains("rain") || lower.contains("climate") || lower.contains("sun") || lower.contains("humidity")) {
            return "☀️ **Weather & Environmental Monitoring:**\n\n"
                 + "Temperature and relative humidity directly impact evapotranspiration and fungal pathogen growth.\n\n"
                 + "📡 **Current Readings:**\n" + sensorContext + "\n\n"
                 + "💡 **Tip:** During high humidity (>80%), avoid overhead sprinkler irrigation to reduce foliage wetness and fungal spore germination.";
        } else {
            return "🌾 **AgroAI Farming Guidance:**\n\n"
                 + "Regarding your inquiry: *" + userMessage + "*\n\n"
                 + "For optimal crop yields, always monitor your field's environmental parameters closely.\n\n"
                 + "📡 **Current IoT Sensor Data:**\n" + sensorContext + "\n\n"
                 + "💡 You can ask me specific questions about **irrigation schedules**, **pest control**, **soil nutrients**, or **crop disease symptoms**!";
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
