package com.company.app.dto.user;

import com.company.app.dto.profile.ProfileResponse;
import com.company.app.model.Role;

import java.time.LocalDateTime;
import java.util.Set;

public record UserResponse(
        Long id,
        String username,
        String email,
        Set<Role> roles,
        boolean enabled,
        long connectionsCount,
        LocalDateTime createdAt,
        ProfileResponse profile
) {
}
