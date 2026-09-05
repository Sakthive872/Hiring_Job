package com.company.app.service;

import com.company.app.dto.notification.NotificationDto;
import com.company.app.model.Notification;
import com.company.app.model.User;
import com.company.app.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createNotification(User recipient, User actor, String type, String message, String entityType, Long entityId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .read(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/notifications", map(saved));
        return saved;
    }

    public List<NotificationDto> getForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::map).toList();
    }

    @Transactional
    public NotificationDto markRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return map(notificationRepository.save(notification));
    }

    private NotificationDto map(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType(),
                n.getMessage(),
                n.getActor() != null ? n.getActor().getId() : null,
                n.getActor() != null ? n.getActor().getUsername() : null,
                n.getEntityId(),
                n.getEntityType(),
                n.isRead(),
                n.getCreatedAt(),
                n.getReadAt()
        );
    }
}
