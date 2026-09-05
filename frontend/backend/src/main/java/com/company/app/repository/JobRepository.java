package com.company.app.repository;

import com.company.app.model.Job;
import com.company.app.model.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    Page<Job> findByCompanyId(Long companyId, Pageable pageable);
    List<Job> findByStatus(JobStatus status);
}
