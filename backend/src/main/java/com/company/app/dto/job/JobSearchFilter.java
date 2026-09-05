package com.company.app.dto.job;

public record JobSearchFilter(
        String keyword,
        String location,
        String employmentType,
        String workplaceType,
        Double minSalary,
        Double maxSalary,
        String status,
        String experienceLevel
) {
}
