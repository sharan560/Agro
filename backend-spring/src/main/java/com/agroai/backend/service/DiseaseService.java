package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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

    public DiseaseService(AppProperties properties, RestTemplate restTemplate) {
        this.properties = properties;
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> predict(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return Map.of("success", false, "message", "No image file provided");
        }

        List<String> urls = new ArrayList<>();
        urls.add(properties.getMlModel().getUrl());
        urls.addAll(properties.getMlModel().getFallbackUrls());

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
                body.add("image", resource);

                HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    new ParameterizedTypeReference<>() {}
                );

                Map<String, Object> payload = response.getBody();
                return Map.of(
                    "success", true,
                    "disease", payload.getOrDefault("disease", payload.getOrDefault("class", "Unknown")),
                    "confidence", payload.getOrDefault("confidence", payload.getOrDefault("probability", 0)),
                    "symptoms", payload.getOrDefault("symptoms", List.of()),
                    "treatment", payload.getOrDefault("treatment", List.of()),
                    "prevention", payload.getOrDefault("prevention", List.of()),
                    "severity", payload.getOrDefault("severity", "Medium"),
                    "raw_response", payload
                );
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

        return Map.of("success", false, "message", "Failed to predict disease", "error", msg);
    }
}
