package com.agroai.backend.service;

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

    // Change this if your endpoint is different
    private static final String ML_API_URL =
            "https://croppredictor-hqfk.onrender.com/predict";

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

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(request, headers);

            ResponseEntity<Map<String, Object>> response =
                    restTemplate.exchange(
                            ML_API_URL,
                            HttpMethod.POST,
                            entity,
                            new ParameterizedTypeReference<Map<String, Object>>() {}
                    );

            Map<String, Object> body = response.getBody();

            if (body != null) {
                return body;
            }

            return Map.of(
                    "success", false,
                    "message", "Empty response from ML API"
            );

        } catch (Exception ex) {

            return Map.of(
                    "success", false,
                    "message", "Crop prediction service unavailable",
                    "error", ex.getMessage()
            );
        }
    }
}   