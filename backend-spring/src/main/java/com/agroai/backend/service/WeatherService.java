package com.agroai.backend.service;

import com.agroai.backend.config.AppProperties;
import com.agroai.backend.dto.WeatherDtos;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    private final AppProperties properties;
    private final RestTemplate restTemplate;

    public WeatherService(AppProperties properties, RestTemplate restTemplate) {
        this.properties = properties;
        this.restTemplate = restTemplate;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getWeather(WeatherDtos.WeatherRequest request) {
        Double lat = request.location() != null && request.location().lat() != null ? request.location().lat() : 20.5937;
        Double lon = request.location() != null && request.location().lon() != null ? request.location().lon() : 78.9629;

        if (properties.getWeatherApiKey() == null || properties.getWeatherApiKey().isBlank()) {
            return Map.of(
                "success", true,
                "data", mockWeather(lat, lon),
                "timestamp", Instant.now().toString(),
                "note", "Weather API key not configured. Returning fallback weather data."
            );
        }

        try {
            String currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon
                + "&appid=" + properties.getWeatherApiKey() + "&units=metric";
            String forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon
                + "&appid=" + properties.getWeatherApiKey() + "&units=metric";

            ResponseEntity<Map<String, Object>> currentResp = restTemplate.exchange(
                currentUrl, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            ResponseEntity<Map<String, Object>> forecastResp = restTemplate.exchange(
                forecastUrl, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});

            Map<String, Object> current = currentResp.getBody();
            Map<String, Object> forecast = forecastResp.getBody();

            List<Map<String, Object>> list = (List<Map<String, Object>>) forecast.getOrDefault("list", List.of());
            List<Map<String, Object>> daily = new ArrayList<>();
            for (int i = 0; i < list.size() && daily.size() < 5; i += 8) {
                daily.add(list.get(i));
            }

            return Map.of(
                "success", true,
                "data", formatWeather(current, daily),
                "timestamp", Instant.now().toString()
            );
        } catch (Exception ex) {
            return Map.of(
                "success", true,
                "data", mockWeather(lat, lon),
                "timestamp", Instant.now().toString(),
                "note", "Using mock weather data due to API connectivity issues"
            );
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> formatWeather(Map<String, Object> current, List<Map<String, Object>> daily) {
        Map<String, Object> coord = (Map<String, Object>) current.get("coord");
        Map<String, Object> main = (Map<String, Object>) current.get("main");
        Map<String, Object> wind = (Map<String, Object>) current.get("wind");
        Map<String, Object> sys = (Map<String, Object>) current.get("sys");
        List<Map<String, Object>> weather = (List<Map<String, Object>>) current.get("weather");
        Map<String, Object> weatherFirst = weather.get(0);

        List<Map<String, Object>> forecastRows = daily.stream().map(item -> {
            Map<String, Object> itemMain = (Map<String, Object>) item.get("main");
            Map<String, Object> itemWind = (Map<String, Object>) item.get("wind");
            List<Map<String, Object>> itemWeather = (List<Map<String, Object>>) item.get("weather");
            Map<String, Object> itemWeatherFirst = itemWeather.get(0);
            Number dt = (Number) item.get("dt");
            Number pop = (Number) item.getOrDefault("pop", 0);

            return Map.of(
                "date", Instant.ofEpochSecond(dt.longValue()).toString(),
                "temperature", Map.of(
                    "min", Math.round(((Number) itemMain.get("temp_min")).doubleValue()),
                    "max", Math.round(((Number) itemMain.get("temp_max")).doubleValue())
                ),
                "humidity", ((Number) itemMain.get("humidity")).intValue(),
                "condition", itemWeatherFirst.get("main"),
                "description", itemWeatherFirst.get("description"),
                "icon", itemWeatherFirst.get("icon"),
                "windSpeed", ((Number) itemWind.get("speed")).doubleValue(),
                "precipitation", pop.doubleValue() * 100
            );
        }).toList();

        Map<String, Object> currentData = new HashMap<>();
        currentData.put("temperature", Math.round(((Number) main.get("temp")).doubleValue()));
        currentData.put("feelsLike", Math.round(((Number) main.get("feels_like")).doubleValue()));
        currentData.put("humidity", ((Number) main.get("humidity")).intValue());
        currentData.put("pressure", ((Number) main.get("pressure")).intValue());
        currentData.put("windSpeed", ((Number) wind.get("speed")).doubleValue());
        currentData.put("windDirection", ((Number) wind.getOrDefault("deg", 0)).intValue());
        currentData.put("visibility", ((Number) current.getOrDefault("visibility", 0)).doubleValue() / 1000.0);
        currentData.put("uvIndex", 0);
        currentData.put("condition", weatherFirst.get("main"));
        currentData.put("description", weatherFirst.get("description"));
        currentData.put("icon", weatherFirst.get("icon"));
        currentData.put("sunrise", Instant.ofEpochSecond(((Number) sys.get("sunrise")).longValue()).toString());
        currentData.put("sunset", Instant.ofEpochSecond(((Number) sys.get("sunset")).longValue()).toString());

        Map<String, Object> output = new HashMap<>();
        output.put("location", Map.of(
            "name", current.get("name"),
            "country", sys.get("country"),
            "lat", coord.get("lat"),
            "lon", coord.get("lon")
        ));
        output.put("current", currentData);
        output.put("forecast", forecastRows);
        output.put("farmingAdvice", List.of("Weather data received successfully. Continue regular farming checks."));
        return output;
    }

    private Map<String, Object> mockWeather(double lat, double lon) {
        List<Map<String, Object>> forecast = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            forecast.add(Map.of(
                "date", Instant.now().plusSeconds(i * 86400L).toString(),
                "temperature", Map.of("min", 25, "max", 32),
                "humidity", 65,
                "condition", "Clear",
                "description", "clear sky",
                "icon", "01d",
                "windSpeed", 3.5,
                "precipitation", 20
            ));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("location", Map.of("name", "Default Location", "country", "IN", "lat", lat, "lon", lon));
        Map<String, Object> mockCurrent = new HashMap<>();
        mockCurrent.put("temperature", 28);
        mockCurrent.put("feelsLike", 30);
        mockCurrent.put("humidity", 65);
        mockCurrent.put("pressure", 1013);
        mockCurrent.put("windSpeed", 3.5);
        mockCurrent.put("windDirection", 180);
        mockCurrent.put("visibility", 10);
        mockCurrent.put("uvIndex", 6);
        mockCurrent.put("condition", "Clear");
        mockCurrent.put("description", "clear sky");
        mockCurrent.put("icon", "01d");
        mockCurrent.put("sunrise", Instant.now().minusSeconds(21600).toString());
        mockCurrent.put("sunset", Instant.now().plusSeconds(21600).toString());
        data.put("current", mockCurrent);
        data.put("forecast", forecast);
        data.put("farmingAdvice", List.of(
            "Weather data is currently unavailable. Using default conditions for farming advice.",
            "Ensure regular irrigation based on crop needs.",
            "Monitor temperature changes and adjust watering accordingly."
        ));
        return data;
    }
}
