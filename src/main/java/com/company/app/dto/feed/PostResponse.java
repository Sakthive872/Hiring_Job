package com.company.app.dto.feed;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        Long authorId,
        String authorName,
        String content,
        int likeCount,
        int commentCount,
        List<CommentDto> comments,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
