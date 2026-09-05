package com.company.app.dto.assistant;

public record AssistantChatResponse(
        String reply,
        String model,
        String provider
) {
}
