package com.company.app.dto.company;

import jakarta.validation.constraints.NotBlank;

public record CompanyCreateDto(
        @NotBlank String name,
        String description,
        String website,
        String industry,
        String location
) {
}
