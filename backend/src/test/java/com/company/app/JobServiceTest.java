package com.company.app;

import com.company.app.dto.job.JobCreateDto;
import com.company.app.model.Company;
import com.company.app.model.EmploymentType;
import com.company.app.model.JobStatus;
import com.company.app.model.Role;
import com.company.app.model.User;
import com.company.app.model.WorkplaceType;
import com.company.app.repository.CompanyRepository;
import com.company.app.repository.UserRepository;
import com.company.app.service.JobService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class JobServiceTest {

    @Autowired
    private JobService jobService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        User recruiter = User.builder()
                .email("recruiter@example.com")
                .username("recruiter")
                .password("secret")
                .roles(Set.of(Role.ROLE_RECRUITER))
                .enabled(true)
                .build();
        userRepository.save(recruiter);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(recruiter.getEmail(), "secret", recruiter.getAuthorities()));

        Company company = Company.builder().name("Acme Labs").industry("Technology").location("NYC").build();
        companyRepository.save(company);
    }

    @Test
    @Transactional
    void createJob_shouldPersistJob() {
        Company company = companyRepository.findByName("Acme Labs").orElseThrow();
        JobCreateDto dto = new JobCreateDto(
                "Backend Engineer",
                "Build APIs with Java and Spring Boot",
                "Java, SQL, REST",
                "New York",
                WorkplaceType.HYBRID,
                EmploymentType.FULL_TIME,
                "Senior",
                120000.0,
                180000.0,
                JobStatus.PUBLISHED,
                company.getId());

        var response = jobService.createJob(dto);
        assertNotNull(response);
        assertNotNull(response.id());
    }
}
