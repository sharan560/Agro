package com.agroai.backend.service;

import com.agroai.backend.dto.AuthDtos;
import com.agroai.backend.model.User;
import com.agroai.backend.repository.UserRepository;
import com.agroai.backend.security.JwtService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final List<User> mockUsers = new CopyOnWriteArrayList<>();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

        User demo = new User();
        demo.setId("mock-user-1");
        demo.setEmail("test@agroai.com");
        demo.setPassword("test123");
        demo.setName("Test User");
        mockUsers.add(demo);
    }

    public AuthDtos.AuthResponse signup(AuthDtos.SignupRequest request, boolean mockMode) {
        if (mockMode) {
            boolean exists = mockUsers.stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(request.email()));
            if (exists) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already exists (Mock Mode)");
            }

            User mockUser = new User();
            mockUser.setId("mock-" + System.currentTimeMillis());
            mockUser.setEmail(request.email());
            mockUser.setPassword(request.password());
            mockUser.setName(request.name());
            mockUsers.add(mockUser);

            String token = "mock-token-" + mockUser.getId();
            return new AuthDtos.AuthResponse(token, new AuthDtos.UserView(mockUser.getEmail(), mockUser.getName()));
        }

        Optional<User> existing = userRepository.findByEmail(request.email());
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already exists");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        user.setPassword(passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved.getId());
        return new AuthDtos.AuthResponse(token, new AuthDtos.UserView(saved.getEmail(), saved.getName()));
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request, boolean mockMode) {
        if (mockMode) {
            User mockUser = mockUsers.stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(request.email()) && u.getPassword().equals(request.password()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid credentials. Use test@agroai.com / test123 for demo"
                ));

            String token = "mock-token-" + mockUser.getId();
            return new AuthDtos.AuthResponse(token, new AuthDtos.UserView(mockUser.getEmail(), mockUser.getName()));
        }

        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId());
        return new AuthDtos.AuthResponse(token, new AuthDtos.UserView(user.getEmail(), user.getName()));
    }

    public Map<String, Object> testAuth(boolean mockMode) {
        return Map.of(
            "success", true,
            "message", "Authentication system test completed",
            "mockMode", Map.of(
                "enabled", mockMode,
                "userCount", mockUsers.size(),
                "users", mockUsers.stream().map(u -> Map.of("email", u.getEmail(), "name", u.getName())).toList()
            )
        );
    }
}
