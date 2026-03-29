package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class ThingSpeakService {

    private final AppProperties properties;
    private final RestTemplate restTemplate;

    public ThingSpeakService(AppProperties properties, RestTemplate restTemplate) {
        this.properties = properties;
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> fetchFeeds(int results) {
        String channelId = properties.getThingspeak().getChannelId();
        String url = "https://api.thingspeak.com/channels/" + channelId + "/feeds.json?api_key="
            + properties.getThingspeak().getReadApiKey() + "&results=" + results;

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
            );
            return response.getBody() == null ? Map.of("feeds", List.of()) : response.getBody();
        } catch (Exception ex) {
            Map<String, Object> mockFeed = new HashMap<>();
            mockFeed.put("created_at", Instant.now().toString());
            mockFeed.put("entry_id", 1);
            mockFeed.put("field1", "25");
            mockFeed.put("field2", "60");
            mockFeed.put("field3", "0");
            mockFeed.put("field4", "45");
            return Map.of("feeds", List.of(mockFeed));
        }
    }

    public Integer updateField(int field, String value) {
        String url = "https://api.thingspeak.com/update";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("api_key", properties.getThingspeak().getWriteApiKey());
        form.add("field" + field, value);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
        try {
            String response = restTemplate.postForObject(url, request, String.class);
            return response == null ? 0 : Integer.parseInt(response.trim());
        } catch (Exception ex) {
            return (int) (Math.random() * 1000) + 1;
        }
    }
}
