package com.agroai.backend.controller;

import com.agroai.backend.config.AppProperties;
import com.agroai.backend.dto.ChatDtos;
import com.agroai.backend.security.AuthenticatedUser;
import com.agroai.backend.service.ChatService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final AppProperties properties;

    public ChatController(ChatService chatService, AppProperties properties) {
        this.chatService = chatService;
        this.properties = properties;
    }

    @PostMapping
    public Map<String, Object> sendMessage(@Valid @RequestBody ChatDtos.ChatRequest request, Authentication authentication) {
        String userId = (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user)
            ? user.userId() : "anonymous-user";
        return chatService.sendMessage(userId, request.message(), properties.isMockMode());
    }

    @GetMapping("/history")
    public Map<String, Object> history(
        Authentication authentication,
        @RequestParam(name = "limit", defaultValue = "50") int limit,
        @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        String userId = (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user)
            ? user.userId() : "anonymous-user";
        return chatService.history(userId, limit, page, properties.isMockMode());
    }
}
