package com.company.app.dto.message;

import java.time.LocalDateTime;

public record MessageDto(
        Long id,
        Long conversationId,
        Long senderId,
        String senderName,
        String content,
        LocalDateTime createdAt
) {
}
