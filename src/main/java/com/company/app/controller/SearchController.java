package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(@RequestParam String q) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Search completed", searchService.search(q), null, LocalDateTime.now()));
    }
}
