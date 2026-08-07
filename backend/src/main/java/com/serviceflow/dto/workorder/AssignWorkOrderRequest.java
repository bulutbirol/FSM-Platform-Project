package com.serviceflow.dto.workorder;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AssignWorkOrderRequest(
        @NotNull Long assignedUserId,
        @NotNull @FutureOrPresent LocalDateTime scheduledDate
) {
}

