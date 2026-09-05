package com.company.app.dto.application;

import com.company.app.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusUpdateDto(
        @NotNull ApplicationStatus status
) {
}
