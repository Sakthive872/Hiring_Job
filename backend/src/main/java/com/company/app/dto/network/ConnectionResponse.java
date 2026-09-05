package com.company.app.dto.network;

import com.company.app.model.ConnectionStatus;
import java.time.LocalDateTime;

public record ConnectionResponse(
        Long id,
        Long requesterId,
        Long recipientId,
        String requesterName,
        String recipientName,
        ConnectionStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
