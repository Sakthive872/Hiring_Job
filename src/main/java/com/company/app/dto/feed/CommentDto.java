package com.company.app.dto.feed;

import jakarta.validation.constraints.NotBlank;

public record CommentDto(
        @NotBlank String content
) {
}
