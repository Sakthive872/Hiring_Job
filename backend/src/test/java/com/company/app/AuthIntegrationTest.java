package com.company.app;

import com.company.app.dto.auth.RegisterRequest;
import com.company.app.model.Role;
import com.company.app.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Test
    void register_shouldCreateUser() throws Exception {
        RegisterRequest request = new RegisterRequest("alice", "alice@example.com", "secret123", "candidate");
        String json = new ObjectMapper().writeValueAsString(request);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/v1/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(httpRequest, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertNotNull(response.body());
        assertTrue(response.body().contains("Registration successful"));
        assertTrue(response.body().contains("ROLE_CANDIDATE"));
        assertTrue(userRepository.findByEmail("alice@example.com").isPresent());
    }

        @Test
        void register_shouldAcceptNameAliasAndPersistAccount() throws Exception {
                String json = "{\"name\":\"name-alias-user\",\"email\":\"NAME.ALIAS@EXAMPLE.COM\",\"password\":\"secret123\",\"role\":\"candidate\"}";

                HttpRequest httpRequest = HttpRequest.newBuilder()
                                .uri(URI.create("http://localhost:" + port + "/api/v1/auth/register"))
                                .header("Content-Type", "application/json")
                                .POST(HttpRequest.BodyPublishers.ofString(json))
                                .build();

                HttpResponse<String> response = HttpClient.newHttpClient()
                                .send(httpRequest, HttpResponse.BodyHandlers.ofString());

                assertEquals(200, response.statusCode());
                assertTrue(userRepository.findByEmail("name.alias@example.com").isPresent());
                assertEquals("name-alias-user", userRepository.findByEmail("name.alias@example.com").orElseThrow().getAccountUsername());
        }

    @Test
    void profileUpdate_shouldPersistChangesInDatabase() throws Exception {
        String email = "profile.user@example.com";
        RegisterRequest request = new RegisterRequest("profile-user", email, "secret123", "recruiter");
        String registerJson = new ObjectMapper().writeValueAsString(request);

        HttpRequest registerRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/v1/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(registerJson))
                .build();

        HttpResponse<String> registerResponse = HttpClient.newHttpClient()
                .send(registerRequest, HttpResponse.BodyHandlers.ofString());
        String token = new ObjectMapper().readTree(registerResponse.body()).get("data").get("accessToken").asText();

        String profileJson = "{\"id\":null,\"userId\":null,\"headline\":\"Senior Java Engineer\",\"summary\":\"Builds secure enterprise APIs\",\"location\":\"Bengaluru\",\"website\":\"https://example.com\",\"experiences\":[],\"educations\":[],\"skills\":[{\"id\":null,\"name\":\"Spring Boot\"}],\"createdAt\":null,\"updatedAt\":null}";

        HttpRequest updateRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/v1/profiles/" + userRepository.findByEmail(email).orElseThrow().getId()))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .PUT(HttpRequest.BodyPublishers.ofString(profileJson))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(updateRequest, HttpResponse.BodyHandlers.ofString());

        JsonNode body = new ObjectMapper().readTree(response.body());
        assertEquals(200, response.statusCode());
        assertEquals("Profile updated", body.get("message").asText());
        assertTrue(body.get("data").get("headline").asText().contains("Senior Java Engineer"));
        assertTrue(userRepository.findByEmail(email).orElseThrow().getRoles().contains(Role.ROLE_RECRUITER));
    }

    @Test
    void protectedEndpoint_withoutAuthorization_shouldBeRejected() throws Exception {
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/v1/auth/me"))
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(httpRequest, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
    }

    @Test
    void preflightRequest_shouldIncludeCorsHeadersForFrontend() throws Exception {
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/v1/auth/me"))
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "Authorization,Content-Type")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(httpRequest, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertEquals("http://localhost:3000", response.headers().firstValue("Access-Control-Allow-Origin").orElse(""));
        assertEquals("true", response.headers().firstValue("Access-Control-Allow-Credentials").orElse(""));
    }
}
