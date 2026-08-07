package com.serviceflow.dto.workorder;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record WorkOrderRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 4000) String description,
        @FutureOrPresent LocalDateTime scheduledDate,
        @NotNull Long serviceRequestId,
        Long assignedUserId
) {
}

