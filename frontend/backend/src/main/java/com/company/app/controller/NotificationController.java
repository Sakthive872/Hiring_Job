package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.notification.NotificationDto;
import com.company.app.service.NotificationService;
import com.company.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications fetched", notificationService.getForUser(userService.getCurrentUser().getId()), null, LocalDateTime.now()));
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked read", notificationService.markRead(notificationId), null, LocalDateTime.now()));
    }
}
