package com.company.app.dto.common;

import java.time.LocalDateTime;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        String errorCode,
        LocalDateTime timestamp
) {
}
