package com.agroai.backend.security;

import com.agroai.backend.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final AppProperties appProperties;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String generateToken(String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);

        Instant now = Instant.now();
        Instant expiry = now.plus(appProperties.getJwtExpirationHours(), ChronoUnit.HOURS);

        return Jwts.builder()
            .claims(claims)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(getSigningKey())
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        String secret = appProperties.getJwtSecret() == null ? "secret" : appProperties.getJwtSecret();
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] expanded = new byte[32];
            System.arraycopy(keyBytes, 0, expanded, 0, keyBytes.length);
            for (int i = keyBytes.length; i < 32; i++) {
                expanded[i] = (byte) '0';
            }
            keyBytes = expanded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
