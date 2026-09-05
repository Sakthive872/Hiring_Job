package com.company.app.dto.feed;

import jakarta.validation.constraints.NotBlank;

public record PostCreateDto(
        @NotBlank String content
) {
}
