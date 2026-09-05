package com.company.app.dto.application;

import jakarta.validation.constraints.NotNull;

public record ApplicationRequestDto(
        @NotNull Long jobId,
        String coverLetter
) {
}
