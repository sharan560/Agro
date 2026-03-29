package com.agroai.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record SignupRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password
    ) {}

    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {}

    public record UserView(String email, String name) {}

    public record AuthResponse(String token, UserView user) {}
}
