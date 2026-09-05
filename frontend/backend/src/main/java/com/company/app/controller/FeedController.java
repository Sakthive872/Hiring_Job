package com.company.app.controller;

import com.company.app.dto.common.ApiResponse;
import com.company.app.dto.feed.CommentDto;
import com.company.app.dto.feed.PostCreateDto;
import com.company.app.dto.feed.PostResponse;
import com.company.app.service.FeedService;
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
public class FeedController {

    private final FeedService feedService;

    @PostMapping("/feed/posts")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody PostCreateDto request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Post created", feedService.createPost(request), null, LocalDateTime.now()));
    }

    @GetMapping("/feed/posts")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getFeed(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Feed fetched", feedService.getFeed(pageable), null, LocalDateTime.now()));
    }

    @PostMapping("/feed/posts/{postId}/like")
    public ResponseEntity<ApiResponse<PostResponse>> likePost(@PathVariable Long postId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Post liked", feedService.likePost(postId), null, LocalDateTime.now()));
    }

    @PostMapping("/feed/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<PostResponse>> addComment(@PathVariable Long postId, @Valid @RequestBody CommentDto request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment added", feedService.addComment(postId, request), null, LocalDateTime.now()));
    }
}
