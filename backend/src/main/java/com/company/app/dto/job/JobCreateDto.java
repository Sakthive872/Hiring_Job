package com.company.app.dto.job;

import com.company.app.model.EmploymentType;
import com.company.app.model.JobStatus;
import com.company.app.model.WorkplaceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JobCreateDto(
        @NotBlank String title,
        @NotBlank String description,
        String requirements,
        String location,
        @NotNull WorkplaceType workplaceType,
        @NotNull EmploymentType employmentType,
        String experienceLevel,
        Double minSalary,
        Double maxSalary,
        @NotNull JobStatus status,
        @NotNull Long companyId
) {
}
