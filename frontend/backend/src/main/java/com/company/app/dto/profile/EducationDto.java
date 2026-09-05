package com.company.app.dto.profile;

import java.time.LocalDate;

public record EducationDto(
        Long id,
        String school,
        String degree,
        String fieldOfStudy,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {
}
