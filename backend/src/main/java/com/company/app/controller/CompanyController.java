package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.company.CompanyCreateDto;
import com.company.app.dto.company.CompanyResponse;
import com.company.app.service.CompanyService;
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
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/companies")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CompanyCreateDto request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Company created", companyService.createCompany(request), null, LocalDateTime.now()));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> listCompanies(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Companies fetched", companyService.listCompanies(pageable), null, LocalDateTime.now()));
    }

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Company fetched", companyService.getCompany(companyId), null, LocalDateTime.now()));
    }
}
