package com.agroai.backend.dto;

public class WeatherDtos {

    public record WeatherRequest(Location location) {
        public record Location(Double lat, Double lon) {}
    }
}
