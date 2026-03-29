package com.agroai.backend.controller;

import com.agroai.backend.dto.WeatherDtos;
import com.agroai.backend.service.WeatherService;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @PostMapping("/weather")
    public Map<String, Object> weather(@RequestBody WeatherDtos.WeatherRequest request) {
        return weatherService.getWeather(request);
    }
}
