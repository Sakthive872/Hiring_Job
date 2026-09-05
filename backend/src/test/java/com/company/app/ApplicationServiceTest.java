package com.company.app;

import com.company.app.dto.application.ApplicationRequestDto;
import com.company.app.model.ApplicationStatus;
import com.company.app.model.Company;
import com.company.app.model.EmploymentType;
import com.company.app.model.Job;
import com.company.app.model.JobStatus;
import com.company.app.model.Role;
import com.company.app.model.User;
import com.company.app.model.WorkplaceType;
import com.company.app.repository.CompanyRepository;
import com.company.app.repository.JobRepository;
import com.company.app.repository.UserRepository;
import com.company.app.service.ApplicationService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationServiceTest {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        User recruiter = User.builder()
                .email("recruiter2@example.com")
                .username("recruiter2")
                .password("secret")
                .roles(Set.of(Role.ROLE_RECRUITER))
                .enabled(true)
                .build();
        userRepository.save(recruiter);

        Company company = Company.builder().name("Example Org").industry("Consulting").location("Boston").build();
        companyRepository.save(company);

        Job job = Job.builder()
                .company(company)
                .recruiter(recruiter)
                .title("Data Analyst")
                .description("Analyze data")
                .location("Boston")
                .workplaceType(WorkplaceType.REMOTE)
                .employmentType(EmploymentType.CONTRACT)
                .experienceLevel("Mid")
                .minSalary(BigDecimal.valueOf(90000))
                .maxSalary(BigDecimal.valueOf(120000))
                .status(JobStatus.PUBLISHED)
                .build();
        jobRepository.save(job);
    }

    @Test
    @Transactional
    void apply_shouldCreateApplication() {
        User candidate = User.builder()
                .email("candidate@example.com")
                .username("candidate")
                .password("secret")
                .roles(Set.of(Role.ROLE_CANDIDATE))
                .enabled(true)
                .build();
        userRepository.save(candidate);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(candidate.getEmail(), "secret", candidate.getAuthorities()));

        Job job = jobRepository.findAll().getFirst();
        var app = applicationService.apply(new ApplicationRequestDto(job.getId(), "I am excited to join"));

        assertNotNull(app);
        assertEquals(ApplicationStatus.APPLIED, app.getStatus());
    }
}
