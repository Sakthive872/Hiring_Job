package com.company.app.service;

import com.company.app.dto.job.JobCreateDto;
import com.company.app.dto.job.JobResponse;
import com.company.app.dto.job.JobSearchFilter;
import com.company.app.exception.BusinessRuleException;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.model.Company;
import com.company.app.model.Job;
import com.company.app.model.JobStatus;
import com.company.app.model.User;
import com.company.app.repository.CompanyRepository;
import com.company.app.repository.JobRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserService userService;

    @Transactional
    public JobResponse createJob(JobCreateDto request) {
        User recruiter = userService.getCurrentUser();
        if (!userService.isUserRecruiter(recruiter)) {
            throw new BusinessRuleException("Only recruiters can create jobs");
        }
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Job job = Job.builder()
                .company(company)
                .recruiter(recruiter)
                .title(request.title())
                .description(request.description())
                .requirements(request.requirements())
                .location(request.location())
                .workplaceType(request.workplaceType())
                .employmentType(request.employmentType())
                .experienceLevel(request.experienceLevel())
                .minSalary(request.minSalary() == null ? null : BigDecimal.valueOf(request.minSalary()))
                .maxSalary(request.maxSalary() == null ? null : BigDecimal.valueOf(request.maxSalary()))
                .status(request.status())
                .build();
        return map(jobRepository.save(job));
    }

    @Transactional
    public JobResponse updateJob(Long jobId, JobCreateDto request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        User recruiter = userService.getCurrentUser();
        if (!job.getRecruiter().getId().equals(recruiter.getId()) && !userService.isUserAdmin(recruiter)) {
            throw new BusinessRuleException("You cannot edit this job");
        }
        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setRequirements(request.requirements());
        job.setLocation(request.location());
        job.setWorkplaceType(request.workplaceType());
        job.setEmploymentType(request.employmentType());
        job.setExperienceLevel(request.experienceLevel());
        job.setMinSalary(request.minSalary() == null ? null : BigDecimal.valueOf(request.minSalary()));
        job.setMaxSalary(request.maxSalary() == null ? null : BigDecimal.valueOf(request.maxSalary()));
        job.setStatus(request.status());
        return map(jobRepository.save(job));
    }

    public JobResponse getJob(Long id) {
        return map(jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id)));
    }

    public Page<JobResponse> listJobs(Pageable pageable) {
        return jobRepository.findAll(pageable).map(this::map);
    }

    public Page<JobResponse> searchJobs(JobSearchFilter filter, Pageable pageable) {
        Specification<Job> spec = buildSpecification(filter);
        return jobRepository.findAll(spec, pageable).map(this::map);
    }

    private Specification<Job> buildSpecification(JobSearchFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filter == null) {
                return cb.conjunction();
            }
            if (filter.keyword() != null && !filter.keyword().isBlank()) {
                String keyword = "%" + filter.keyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), keyword),
                        cb.like(cb.lower(root.get("description")), keyword),
                        cb.like(cb.lower(root.get("requirements")), keyword)
                ));
            }
            if (filter.location() != null && !filter.location().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + filter.location().toLowerCase() + "%"));
            }
            if (filter.employmentType() != null && !filter.employmentType().isBlank()) {
                predicates.add(cb.equal(root.get("employmentType"), com.company.app.model.EmploymentType.valueOf(filter.employmentType())));
            }
            if (filter.workplaceType() != null && !filter.workplaceType().isBlank()) {
                predicates.add(cb.equal(root.get("workplaceType"), com.company.app.model.WorkplaceType.valueOf(filter.workplaceType())));
            }
            if (filter.status() != null && !filter.status().isBlank()) {
                predicates.add(cb.equal(root.get("status"), JobStatus.valueOf(filter.status())));
            }
            if (filter.experienceLevel() != null && !filter.experienceLevel().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("experienceLevel")), "%" + filter.experienceLevel().toLowerCase() + "%"));
            }
            if (filter.minSalary() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("minSalary"), BigDecimal.valueOf(filter.minSalary())));
            }
            if (filter.maxSalary() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("maxSalary"), BigDecimal.valueOf(filter.maxSalary())));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private JobResponse map(Job job) {
        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getRequirements(),
                job.getLocation(),
                job.getWorkplaceType(),
                job.getEmploymentType(),
                job.getExperienceLevel(),
                job.getMinSalary() == null ? null : job.getMinSalary().doubleValue(),
                job.getMaxSalary() == null ? null : job.getMaxSalary().doubleValue(),
                job.getStatus(),
                job.getRecruiter() != null ? job.getRecruiter().getId() : null,
                job.getCompany() != null ? job.getCompany().getId() : null,
                job.getCompany() != null ? job.getCompany().getName() : null,
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}
