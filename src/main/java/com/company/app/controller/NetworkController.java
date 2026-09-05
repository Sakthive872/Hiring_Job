package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.network.ConnectionRequestDto;
import com.company.app.dto.network.ConnectionResponse;
import com.company.app.model.ConnectionStatus;
import com.company.app.service.NetworkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class NetworkController {

    private final NetworkService networkService;

    @PostMapping("/network/connections/request")
    public ResponseEntity<ApiResponse<ConnectionResponse>> sendRequest(@Valid @RequestBody ConnectionRequestDto request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Connection request sent", networkService.sendRequest(request), null, LocalDateTime.now()));
    }

    @GetMapping("/network/profiles")
    public ResponseEntity<ApiResponse<List<com.company.app.dto.user.UserResponse>>> listProfiles() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Profiles", networkService.listProfiles(), null, LocalDateTime.now()));
    }

    @GetMapping("/network/connections/{userId}")
    public ResponseEntity<ApiResponse<List<ConnectionResponse>>> listConnections(@PathVariable Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Connections", networkService.listConnections(userId), null, LocalDateTime.now()));
    }

    @PatchMapping("/network/connections/{connectionId}/status")
    public ResponseEntity<ApiResponse<ConnectionResponse>> updateStatus(@PathVariable Long connectionId, @RequestParam ConnectionStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Connection status updated", networkService.updateStatus(connectionId, status), null, LocalDateTime.now()));
    }
}
