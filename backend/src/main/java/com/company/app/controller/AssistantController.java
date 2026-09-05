package com.company.app.controller;

import com.company.app.dto.assistant.AssistantChatRequest;
import com.company.app.dto.assistant.AssistantChatResponse;
import com.company.app.dto.common.ApiResponse;
import com.company.app.service.OpenAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final OpenAiService openAiService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "provider", "OpenAI",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AssistantChatResponse>> chat(@Valid @RequestBody AssistantChatRequest request) {
        AssistantChatResponse data = openAiService.chat(request.message(), request.apiKey());
        return ResponseEntity.ok(new ApiResponse<>(true, "Assistant response generated", data, null, LocalDateTime.now()));
    }
}
