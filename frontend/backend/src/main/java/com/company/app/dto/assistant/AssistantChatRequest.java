package com.company.app.dto.assistant;

import jakarta.validation.constraints.NotBlank;

public record AssistantChatRequest(
        @NotBlank(message = "Message is required") String message,
        String apiKey
) {
}
