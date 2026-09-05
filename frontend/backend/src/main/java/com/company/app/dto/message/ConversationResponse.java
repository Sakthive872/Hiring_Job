package com.company.app.dto.message;

import java.time.LocalDateTime;
import java.util.List;

public record ConversationResponse(
        Long id,
        Long participantId,
        String participantName,
        String lastMessage,
        LocalDateTime updatedAt,
        List<MessageDto> messages
) {
}
