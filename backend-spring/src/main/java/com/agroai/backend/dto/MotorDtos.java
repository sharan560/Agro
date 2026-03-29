package com.agroai.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class MotorDtos {

    public record MotorControlRequest(@NotBlank String action) {}
}
