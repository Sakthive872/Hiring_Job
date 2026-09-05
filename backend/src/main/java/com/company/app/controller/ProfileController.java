package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.profile.ProfileResponse;
import com.company.app.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/profiles/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile fetched", profileService.getProfile(userId), null, LocalDateTime.now()));
    }

    @PutMapping("/profiles/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(@PathVariable Long userId, @RequestBody ProfileResponse request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated", profileService.updateProfile(userId, request), null, LocalDateTime.now()));
    }
}
