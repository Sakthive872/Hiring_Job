package com.company.app.dto.notification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String type,
        String message,
        Long actorId,
        String actorName,
        Long entityId,
        String entityType,
        boolean read,
        LocalDateTime createdAt,
        LocalDateTime readAt
) {
}
