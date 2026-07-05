package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CropPredictionService {

    private final AppProperties properties;
    private final RestTemplate restTemplate;

    public CropPredictionService(AppProperties properties, RestTemplate restTemplate) {
        this.properties = properties;
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> predict(Map<String, Object> request) {
        if (request == null
            || !request.containsKey("soil_type")
            || !request.containsKey("soil_temp")
            || !request.containsKey("env_temp")
            || !request.containsKey("moisture")) {
            return Map.of(
                "success", false,
                "message", "Missing required fields: soil_type, soil_temp, env_temp, moisture"
            );
        }

        List<String> modelUrls = buildModelUrls();

        Exception lastError = null;
        for (String url : modelUrls) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {}
                );

                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("top_predictions")) {
                    return body;
                }

                if (body != null && body.containsKey("success") && Boolean.FALSE.equals(body.get("success"))) {
                    lastError = new IllegalStateException(String.valueOf(body.getOrDefault("message", "Crop prediction failed")));
                }
            } catch (Exception ex) {
                lastError = ex;
            }
        }

        return Map.of(
            "success", false,
            "message", "Crop prediction service unavailable",
            "error", lastError == null ? "Unknown error" : lastError.getMessage()
        );
    }

    private List<String> buildModelUrls() {
        List<String> modelUrls = new ArrayList<>();

        if (properties.getMlModel() != null && properties.getMlModel().getUrl() != null && !properties.getMlModel().getUrl().isBlank()) {
            modelUrls.add(properties.getMlModel().getUrl());
        }

        if (properties.getMlModel() != null && properties.getMlModel().getFallbackUrls() != null) {
            for (String fallbackUrl : properties.getMlModel().getFallbackUrls()) {
                if (fallbackUrl != null && !fallbackUrl.isBlank() && !modelUrls.contains(fallbackUrl)) {
                    modelUrls.add(fallbackUrl);
                }
            }
        }

        return modelUrls;
    }
}
