package com.serviceflow.dto.quote;

import com.serviceflow.dto.servicerequest.ServiceRequestResponse;
import com.serviceflow.entity.Quote;
import com.serviceflow.entity.QuoteStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record QuoteResponse(Long id, String description, BigDecimal amount, QuoteStatus status, LocalDate validUntil, ServiceRequestResponse serviceRequest, Instant createdAt) {
    public static QuoteResponse from(Quote quote) {
        return new QuoteResponse(quote.getId(), quote.getDescription(), quote.getAmount(), quote.getStatus(), quote.getValidUntil(), ServiceRequestResponse.from(quote.getServiceRequest()), quote.getCreatedAt());
    }
}

