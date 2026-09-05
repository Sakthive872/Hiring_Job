package com.company.app.service;

import com.company.app.dto.assistant.AssistantChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class OpenAiService {

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final long timeoutMs;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    public OpenAiService(
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.model:gpt-4o-mini}") String model,
            @Value("${openai.base-url:https://api.openai.com/v1}") String baseUrl,
            @Value("${openai.timeout-ms:30000}") long timeoutMs) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
        this.timeoutMs = timeoutMs;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(java.time.Duration.ofMillis(timeoutMs))
                .build();
    }

    public AssistantChatResponse chat(String userMessage) {
        return chat(userMessage, null);
    }

    public AssistantChatResponse chat(String userMessage, String apiKeyOverride) {
        String effectiveApiKey = (apiKeyOverride != null && !apiKeyOverride.isBlank()) ? apiKeyOverride.trim() : apiKey;

        if (effectiveApiKey == null || effectiveApiKey.isBlank()) {
            throw new IllegalStateException("OpenAI API key is not configured");
        }

        String requestBody = "{\n" +
                "  \"model\": \"" + model + "\",\n" +
                "  \"messages\": [\n" +
                "    {\"role\": \"system\", \"content\": \"You are a helpful AI assistant for a professional networking and hiring application. Give concise, professional, actionable answers.\"},\n" +
                "    {\"role\": \"user\", \"content\": \"" + escapeJson(userMessage) + "\"}\n" +
                "  ],\n" +
                "  \"temperature\": 0.7\n" +
                "}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
            .header("Authorization", "Bearer " + effectiveApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("OpenAI API request failed with status " + response.statusCode() + ": " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (choices.isMissingNode() || choices.isEmpty()) {
                throw new IllegalStateException("OpenAI API returned no choices");
            }

            String reply = choices.get(0).path("message").path("content").asText();
            if (reply == null || reply.isBlank()) {
                throw new IllegalStateException("OpenAI API returned empty response content");
            }

            return new AssistantChatResponse(reply.trim(), model, "OpenAI");
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Failed to communicate with OpenAI", e);
        }
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
