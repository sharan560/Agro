package com.agroai.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final com.agroai.backend.config.AppProperties appProperties;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, com.agroai.backend.config.AppProperties appProperties) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.appProperties = appProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/api/health", "/api/test", "/api/auth/**", "/predict").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/sensors/**", "/api/debug/thingspeak").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/weather", "/api/device/status").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOriginPatterns = new ArrayList<>();
        if (appProperties.getFrontendUrl() != null && !appProperties.getFrontendUrl().isBlank()) {
            allowedOriginPatterns.add(appProperties.getFrontendUrl());
        }

        // Keep local dev origins working even when switching between localhost and 127.0.0.1.
        allowedOriginPatterns.add("http://localhost:*");
        allowedOriginPatterns.add("http://127.0.0.1:*");

        configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
