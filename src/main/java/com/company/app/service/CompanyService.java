package com.company.app.service;

import com.company.app.dto.company.CompanyCreateDto;
import com.company.app.dto.company.CompanyResponse;
import com.company.app.exception.BusinessRuleException;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.model.Company;
import com.company.app.model.User;
import com.company.app.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserService userService;

    @Transactional
    public CompanyResponse createCompany(CompanyCreateDto dto) {
        User current = userService.getCurrentUser();
        if (!userService.isUserRecruiter(current) && !userService.isUserAdmin(current)) {
            throw new BusinessRuleException("Only recruiters/admins can create companies");
        }
        Company company = Company.builder()
                .name(dto.name())
                .description(dto.description())
                .website(dto.website())
                .industry(dto.industry())
                .location(dto.location())
                .build();
        return map(companyRepository.save(company));
    }

    public CompanyResponse getCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        return map(company);
    }

    public Page<CompanyResponse> listCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable).map(this::map);
    }

    private CompanyResponse map(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getDescription(),
                company.getWebsite(),
                company.getIndustry(),
                company.getLocation(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
