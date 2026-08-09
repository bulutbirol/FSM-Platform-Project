package com.serviceflow.dto.servicerequest;

import com.serviceflow.entity.Priority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ServiceRequestInput(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 4000) String description,
        @NotNull Priority priority,
        @NotNull @FutureOrPresent LocalDate requestedDate,
        @NotBlank @Size(max = 300) String address,
        Long customerId
) {
}
