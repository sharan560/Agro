package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DiseaseService {

    private final AppProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public DiseaseService(AppProperties properties, RestTemplate restTemplate) {
        this.properties = properties;
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> predict(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return Map.of("success", false, "message", "No image file provided");
        }

       List<String> urls = new ArrayList<>();
        urls.add("https://crop-disease-70gb.onrender.com/predict");

        Exception lastError = null;
        for (String url : urls) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
                    @Override
                    public String getFilename() {
                        return image.getOriginalFilename() == null ? "image.jpg" : image.getOriginalFilename();
                    }
                };

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("file", resource);

                HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<>() {}
                );

                Map<String, Object> payload = response.getBody();
                if (payload == null) {
                    continue;
                }
                String diseaseName = String.valueOf(
                    payload.getOrDefault(
                        "disease",
                        payload.getOrDefault("class", payload.getOrDefault("predicted_class", "Unknown"))
                    )
                );

                Object confidenceRaw = payload.getOrDefault("confidence", payload.getOrDefault("probability", 0));

                Map<String, Object> enriched = enrichWithAi(diseaseName, confidenceRaw, payload);

                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("disease", diseaseName);
                result.put("confidence", confidenceRaw);
                result.put("symptoms", enriched.getOrDefault("symptoms", payload.getOrDefault("symptoms", List.of())));
                result.put("treatment", enriched.getOrDefault("treatment", payload.getOrDefault("treatment", List.of())));
                result.put("prevention", enriched.getOrDefault("prevention", payload.getOrDefault("prevention", List.of())));
                result.put("severity", enriched.getOrDefault("severity", payload.getOrDefault("severity", "Medium")));
                result.put("diseaseReason", enriched.getOrDefault("diseaseReason", ""));
                result.put("aiTips", enriched.getOrDefault("aiTips", List.of()));
                result.put("raw_response", payload);
                return result;
            } catch (Exception ex) {
                lastError = ex;
            }
        }

        String msg = lastError == null ? "Unknown error" : lastError.getMessage();
        if (msg.contains("403")) {
            return Map.of(
                "success", true,
                "disease", "Analysis Unavailable",
                "confidence", 0,
                "symptoms", List.of("ML model service is currently unavailable"),
                "treatment", List.of("Try again later", "Contact support if issue persists"),
                "prevention", List.of("Check internet connection", "Verify ML model status"),
                "severity", "Medium",
                "fallback", true,
                "note", "ML model returned 403 Forbidden - using fallback response"
            );
        }

        if (msg.contains("422")) {
            return Map.of(
                "success", false,
                "message", "Disease model rejected the uploaded image format",
                "error", msg
            );
        }

        return Map.of("success", false, "message", "Failed to predict disease", "error", msg);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> enrichWithAi(String diseaseName, Object confidence, Map<String, Object> payload) {
        if (properties.getGeminiApiKey() == null || properties.getGeminiApiKey().isBlank()) {
            return Map.of();
        }

        String systemInstruction = "You are an expert agronomist and plant pathologist. "
            + "Given a predicted crop disease, return farmer-friendly guidance in strict JSON only.";

        String prompt = "Predicted disease: " + diseaseName + "\\n"
            + "Confidence: " + confidence + "\\n"
            + "Model raw response: " + payload + "\\n\\n"
            + "Return valid JSON object with keys: diseaseReason (string), severity (Low|Medium|High), "
            + "symptoms (string array, max 5), treatment (string array, max 5), prevention (string array, max 5), "
            + "aiTips (string array, max 5). No markdown.";

        String text = callGemini(systemInstruction, prompt);
        if (text == null || text.isBlank()) {
            return Map.of();
        }

        try {
            String cleaned = stripCodeFences(text.trim());
            JsonNode root = objectMapper.readTree(cleaned);
            if (!root.isObject()) {
                return Map.of();
            }

            Map<String, Object> out = new HashMap<>();
            if (root.hasNonNull("diseaseReason")) {
                out.put("diseaseReason", root.get("diseaseReason").asText(""));
            }
            if (root.hasNonNull("severity")) {
                out.put("severity", root.get("severity").asText("Medium"));
            }
            out.put("symptoms", toStringList(root.get("symptoms")));
            out.put("treatment", toStringList(root.get("treatment")));
            out.put("prevention", toStringList(root.get("prevention")));
            out.put("aiTips", toStringList(root.get("aiTips")));
            return out;
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    private String callGemini(String systemInstruction, String userMessage) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
            + properties.getGeminiApiKey();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> request = new HashMap<>();
        request.put("contents", List.of(
            Map.of("role", "user", "parts", List.of(Map.of("text", systemInstruction))),
            Map.of("role", "user", "parts", List.of(Map.of("text", userMessage)))
        ));

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                new ParameterizedTypeReference<>() {}
            );
            return extractGeminiText(response.getBody());
        } catch (Exception ignored) {
            return "";
        }
    }

    @SuppressWarnings("unchecked")
    private String extractGeminiText(Map<String, Object> body) {
        if (body == null) {
            return "";
        }
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            return "";
        }
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) {
            return "";
        }
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) {
            return "";
        }
        Object text = parts.get(0).get("text");
        return text == null ? "" : String.valueOf(text);
    }

    private String stripCodeFences(String text) {
        if (text.startsWith("```") && text.endsWith("```")) {
            String stripped = text.substring(3, text.length() - 3).trim();
            if (stripped.startsWith("json")) {
                return stripped.substring(4).trim();
            }
            return stripped;
        }
        return text;
    }

    private List<String> toStringList(JsonNode node) {
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (JsonNode item : node) {
            if (item != null && !item.isNull()) {
                String value = item.asText("").trim();
                if (!value.isEmpty()) {
                    values.add(value);
                }
            }
        }
        return values;
    }
}
