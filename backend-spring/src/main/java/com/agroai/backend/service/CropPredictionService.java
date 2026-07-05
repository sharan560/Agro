package com.agroai.backend.service;

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

    private final RestTemplate restTemplate;

    public CropPredictionService(RestTemplate restTemplate) {
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

        List<String> modelUrls = List.of(
            "https://croppredictor-hqfk.onrender.com/predict"
        );

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
}
