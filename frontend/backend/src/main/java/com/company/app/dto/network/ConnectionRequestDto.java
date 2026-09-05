package com.company.app.dto.network;

import jakarta.validation.constraints.NotNull;

public record ConnectionRequestDto(
        @NotNull Long recipientId
) {
}
