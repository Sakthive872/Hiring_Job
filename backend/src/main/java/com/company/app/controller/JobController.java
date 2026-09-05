package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.job.JobCreateDto;
import com.company.app.dto.job.JobResponse;
import com.company.app.dto.job.JobSearchFilter;
import com.company.app.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@Valid @RequestBody JobCreateDto request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Job created", jobService.createJob(request), null, LocalDateTime.now()));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> listJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String workplaceType,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String experienceLevel,
            @PageableDefault(size = 20) Pageable pageable) {
        JobSearchFilter filter = new JobSearchFilter(keyword, location, employmentType, workplaceType, minSalary, maxSalary, status, experienceLevel);
        return ResponseEntity.ok(new ApiResponse<>(true, "Jobs fetched", jobService.searchJobs(filter, pageable), null, LocalDateTime.now()));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<JobResponse>> getJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Job fetched", jobService.getJob(jobId), null, LocalDateTime.now()));
    }

    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(@PathVariable Long jobId, @Valid @RequestBody JobCreateDto request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Job updated", jobService.updateJob(jobId, request), null, LocalDateTime.now()));
    }
}
