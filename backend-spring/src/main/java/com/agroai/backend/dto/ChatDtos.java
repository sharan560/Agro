package com.agroai.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatDtos {

    public record ChatRequest(@NotBlank String message) {}

    public record ChatResponse(String response) {}
}
