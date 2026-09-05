package com.company.app.service;

import com.company.app.dto.application.ApplicationRequestDto;
import com.company.app.dto.application.ApplicationStatusUpdateDto;
import com.company.app.exception.BusinessRuleException;
import com.company.app.exception.DuplicateResourceException;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.model.ApplicationStatus;
import com.company.app.model.Job;
import com.company.app.model.JobApplication;
import com.company.app.model.JobStatus;
import com.company.app.model.User;
import com.company.app.repository.JobApplicationRepository;
import com.company.app.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public JobApplication apply(ApplicationRequestDto request) {
        User candidate = userService.getCurrentUser();
        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() == JobStatus.CLOSED || job.getStatus() == JobStatus.EXPIRED) {
            throw new BusinessRuleException("This job is no longer accepting applications");
        }
        if (applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), job.getId())) {
            throw new DuplicateResourceException("You already applied to this job");
        }

        JobApplication application = JobApplication.builder()
                .job(job)
                .candidate(candidate)
                .coverLetter(request.coverLetter())
                .status(ApplicationStatus.APPLIED)
                .build();

        JobApplication saved = applicationRepository.save(application);
        notificationService.createNotification(
                job.getRecruiter(),
                candidate,
                "JOB_APPLICATION",
                candidate.getUsername() + " applied to " + job.getTitle(),
                "JOB",
                job.getId());
        return saved;
    }

    public List<JobApplication> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobIdOrderByCreatedAtDesc(jobId);
    }

    public List<JobApplication> getApplicationsForCandidate(Long candidateId) {
        return applicationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId);
    }

    @Transactional
    public JobApplication updateApplicationStatus(Long applicationId, ApplicationStatusUpdateDto request) {
        User currentUser = userService.getCurrentUser();
        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!app.getJob().getRecruiter().getId().equals(currentUser.getId()) && !userService.isUserAdmin(currentUser)) {
            throw new BusinessRuleException("Only recruiters can update application status");
        }

        app.setStatus(request.status());
        JobApplication saved = applicationRepository.save(app);
        notificationService.createNotification(
                saved.getCandidate(),
                currentUser,
                "APPLICATION_STATUS",
                "Your application for " + saved.getJob().getTitle() + " is now " + request.status(),
                "JOB_APPLICATION",
                saved.getId());
        return saved;
    }
}
