package com.company.app.dto.profile;

import java.time.LocalDateTime;
import java.util.List;

public record ProfileResponse(
        Long id,
        Long userId,
        String headline,
        String summary,
        String location,
        String website,
        List<ExperienceDto> experiences,
        List<EducationDto> educations,
        List<SkillDto> skills,
        long connectionsCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
