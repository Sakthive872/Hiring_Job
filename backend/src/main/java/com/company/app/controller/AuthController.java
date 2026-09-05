package com.company.app.controller;

import com.company.app.dto.auth.AuthResponse;
import com.company.app.dto.auth.LoginRequest;
import com.company.app.dto.auth.RefreshTokenRequest;
import com.company.app.dto.auth.RegisterRequest;
import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.user.UserResponse;
import com.company.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Registration successful", data, null, LocalDateTime.now()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", data, null, LocalDateTime.now()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse data = authService.refresh(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed", data, null, LocalDateTime.now()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(new ApiResponse<>(true, authService.logout(), null, null, LocalDateTime.now()));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Current user", authService.me(), null, LocalDateTime.now()));
    }
}
