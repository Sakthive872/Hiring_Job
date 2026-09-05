package com.company.app.dto.job;

import com.company.app.model.EmploymentType;
import com.company.app.model.JobStatus;
import com.company.app.model.WorkplaceType;

import java.time.LocalDateTime;

public record JobResponse(
        Long id,
        String title,
        String description,
        String requirements,
        String location,
        WorkplaceType workplaceType,
        EmploymentType employmentType,
        String experienceLevel,
        Double minSalary,
        Double maxSalary,
        JobStatus status,
        Long recruiterId,
        Long companyId,
        String companyName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
