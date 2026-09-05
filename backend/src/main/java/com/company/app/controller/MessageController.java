package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.message.ConversationResponse;
import com.company.app.dto.message.MessageDto;
import com.company.app.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/messages/{recipientId}")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(@PathVariable Long recipientId, @RequestParam String content) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Message sent", messageService.sendMessage(recipientId, content), null, LocalDateTime.now()));
    }

    @GetMapping("/messages/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Conversations fetched", messageService.getConversations(), null, LocalDateTime.now()));
    }

    @GetMapping("/messages/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Messages fetched", messageService.getMessages(conversationId), null, LocalDateTime.now()));
    }

    @MessageMapping("/chat.send")
    public void handleChatSend(@Payload Map<String, Object> payload) {
        Number recipientId = (Number) payload.get("recipientId");
        String content = String.valueOf(payload.get("content"));
        MessageDto message = messageService.sendMessage(recipientId.longValue(), content);
        messagingTemplate.convertAndSend("/topic/messages/" + message.conversationId(), message);
        messagingTemplate.convertAndSendToUser(String.valueOf(recipientId.longValue()), "/queue/messages", message);
    }
}
