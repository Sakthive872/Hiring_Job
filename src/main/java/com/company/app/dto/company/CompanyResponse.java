package com.company.app.dto.company;

import java.time.LocalDateTime;

public record CompanyResponse(
        Long id,
        String name,
        String description,
        String website,
        String industry,
        String location,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
