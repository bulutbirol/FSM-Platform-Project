package com.serviceflow.dto.servicerequest;

import com.serviceflow.entity.ServiceRequestStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateServiceRequestStatusRequest(@NotNull ServiceRequestStatus status) {
}

