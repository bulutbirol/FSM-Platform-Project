package com.serviceflow.dto.quote;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record QuoteRequest(
        @NotBlank @Size(max = 4000) String description,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotNull @FutureOrPresent LocalDate validUntil,
        @NotNull Long serviceRequestId
) {
}

