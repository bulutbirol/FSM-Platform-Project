package com.serviceflow.dto.workorder;

import com.serviceflow.entity.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateWorkOrderStatusRequest(@NotNull WorkOrderStatus status) {
}

