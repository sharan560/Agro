package com.agroai.backend.repository;

import com.agroai.backend.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    Page<ChatMessage> findByUserIdOrderByTimestampDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
}
