package com.serviceflow.dto.servicerequest;

import com.serviceflow.dto.customer.CustomerResponse;
import com.serviceflow.entity.*;

import java.time.Instant;
import java.time.LocalDate;

public record ServiceRequestResponse(Long id, String title, String description, Priority priority, ServiceRequestStatus status, LocalDate requestedDate, String address, CustomerResponse customer, Instant createdAt) {
    public static ServiceRequestResponse from(ServiceRequest request) {
        return new ServiceRequestResponse(request.getId(), request.getTitle(), request.getDescription(), request.getPriority(), request.getStatus(), request.getRequestedDate(), request.getAddress(), CustomerResponse.from(request.getCustomer()), request.getCreatedAt());
    }
}

