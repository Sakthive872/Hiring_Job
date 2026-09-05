package com.company.app.repository;

import com.company.app.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Optional<JobApplication> findByCandidateIdAndJobId(Long candidateId, Long jobId);
    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);
    List<JobApplication> findByJobIdOrderByCreatedAtDesc(Long jobId);
    List<JobApplication> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
}
