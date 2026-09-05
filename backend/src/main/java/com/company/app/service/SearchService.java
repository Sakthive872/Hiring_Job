package com.company.app.service;

import com.company.app.dto.user.UserResponse;
import com.company.app.dto.job.JobResponse;
import com.company.app.dto.company.CompanyResponse;
import com.company.app.model.Company;
import com.company.app.model.Job;
import com.company.app.model.User;
import com.company.app.repository.CompanyRepository;
import com.company.app.repository.JobRepository;
import com.company.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final com.company.app.service.UserService userService;

    public Map<String, Object> search(String q) {
        String term = q == null ? "" : q.trim().toLowerCase();
        Map<String, Object> result = new HashMap<>();

        List<UserResponse> users = userRepository.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(term)
                        || u.getEmail().toLowerCase().contains(term))
                .limit(10)
                .map(userService::mapUser)
                .toList();

        List<JobResponse> jobs = jobRepository.findAll().stream()
                .filter(j -> j.getTitle().toLowerCase().contains(term)
                        || (j.getDescription() != null && j.getDescription().toLowerCase().contains(term))
                        || (j.getLocation() != null && j.getLocation().toLowerCase().contains(term)))
                .limit(10)
                .map(j -> new JobResponse(
                        j.getId(),
                        j.getTitle(),
                        j.getDescription(),
                        j.getRequirements(),
                        j.getLocation(),
                        j.getWorkplaceType(),
                        j.getEmploymentType(),
                        j.getExperienceLevel(),
                        j.getMinSalary() == null ? null : j.getMinSalary().doubleValue(),
                        j.getMaxSalary() == null ? null : j.getMaxSalary().doubleValue(),
                        j.getStatus(),
                        j.getRecruiter() != null ? j.getRecruiter().getId() : null,
                        j.getCompany() != null ? j.getCompany().getId() : null,
                        j.getCompany() != null ? j.getCompany().getName() : null,
                        j.getCreatedAt(),
                        j.getUpdatedAt()
                ))
                .toList();

        List<CompanyResponse> companies = companyRepository.findAll().stream()
                .filter(c -> c.getName().toLowerCase().contains(term)
                        || (c.getIndustry() != null && c.getIndustry().toLowerCase().contains(term)))
                .limit(10)
                .map(c -> new CompanyResponse(
                        c.getId(),
                        c.getName(),
                        c.getDescription(),
                        c.getWebsite(),
                        c.getIndustry(),
                        c.getLocation(),
                        c.getCreatedAt(),
                        c.getUpdatedAt()
                ))
                .toList();

        result.put("users", users);
        result.put("jobs", jobs);
        result.put("companies", companies);
        result.put("query", term);
        return result;
    }
}
