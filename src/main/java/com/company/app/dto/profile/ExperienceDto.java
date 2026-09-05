package com.company.app.dto.profile;

import java.time.LocalDate;

public record ExperienceDto(
        Long id,
        String title,
        String companyName,
        String employmentType,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {
}
