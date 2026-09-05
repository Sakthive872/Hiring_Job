package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.user.UserResponse;
import com.company.app.dto.user.UserUpdateRequest;
import com.company.app.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched", userService.getUserResponse(id), null, LocalDateTime.now()));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        UserResponse updated = userService.updateUser(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "User updated", updated, null, LocalDateTime.now()));
    }
}
