package com.company.app.controller;

import com.company.app.dto.application.ApplicationRequestDto;
import com.company.app.dto.application.ApplicationStatusUpdateDto;
import com.company.app.dto.application.ApplicationResponseDto;
import com.company.app.dto.common.ApiResponse;
import com.company.app.model.JobApplication;
import com.company.app.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/applications")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> apply(@Valid @RequestBody ApplicationRequestDto request) {
        JobApplication app = applicationService.apply(request);
        ApplicationResponseDto dto = map(app);
        return ResponseEntity.ok(new ApiResponse<>(true, "Application created", dto, null, LocalDateTime.now()));
    }

    // Backwards-compatible endpoint: accept multipart/form-data from frontend which posts to /jobs/{jobId}/applications
    @PostMapping("/jobs/{jobId}/applications")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> applyToJob(
            @PathVariable Long jobId,
            @RequestParam(value = "coverNote", required = false) String coverNote,
            @RequestParam(value = "resume", required = false) MultipartFile resume
    ) {
        // Note: resume is currently not persisted. If resume handling is required, integrate file storage.
        ApplicationRequestDto request = new ApplicationRequestDto(jobId, coverNote);
        JobApplication app = applicationService.apply(request);
        ApplicationResponseDto dto = map(app);
        return ResponseEntity.ok(new ApiResponse<>(true, "Application created", dto, null, LocalDateTime.now()));
    }

    @GetMapping("/applications/jobs/{jobId}")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getByJob(@PathVariable Long jobId) {
        List<ApplicationResponseDto> list = applicationService.getApplicationsForJob(jobId).stream().map(this::map).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Job applications", list, null, LocalDateTime.now()));
    }

    @GetMapping("/applications/candidates/{candidateId}")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getByCandidate(@PathVariable Long candidateId) {
        List<ApplicationResponseDto> list = applicationService.getApplicationsForCandidate(candidateId).stream().map(this::map).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Candidate applications", list, null, LocalDateTime.now()));
    }

    @PatchMapping("/applications/{applicationId}")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> updateStatus(@PathVariable Long applicationId, @Valid @RequestBody ApplicationStatusUpdateDto request) {
        JobApplication updated = applicationService.updateApplicationStatus(applicationId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Application status updated", map(updated), null, LocalDateTime.now()));
    }

    private ApplicationResponseDto map(JobApplication app){
        return new ApplicationResponseDto(
                app.getId(),
                app.getJob() != null ? app.getJob().getId() : null,
                app.getCandidate() != null ? app.getCandidate().getId() : null,
                app.getStatus(),
                app.getCoverLetter(),
                app.getCreatedAt(),
                app.getUpdatedAt()
        );
    }
}
