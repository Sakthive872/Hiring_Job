package com.company.app.dto.application;

import com.company.app.model.ApplicationStatus;
import java.time.LocalDateTime;

public record ApplicationResponseDto(
        Long id,
        Long jobId,
        Long candidateId,
        ApplicationStatus status,
        String coverLetter,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
