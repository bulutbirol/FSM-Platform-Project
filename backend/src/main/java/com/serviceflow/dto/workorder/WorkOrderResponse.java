package com.serviceflow.dto.workorder;

import com.serviceflow.dto.auth.UserResponse;
import com.serviceflow.dto.customer.CustomerResponse;
import com.serviceflow.entity.WorkOrder;
import com.serviceflow.entity.WorkOrderStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record WorkOrderResponse(Long id, String title, String description, WorkOrderStatus status, LocalDateTime scheduledDate, CustomerResponse customer, Long serviceRequestId, String serviceRequestTitle, UserResponse assignedUser, Instant createdAt) {
    public static WorkOrderResponse from(WorkOrder order) {
        return new WorkOrderResponse(order.getId(), order.getTitle(), order.getDescription(), order.getStatus(), order.getScheduledDate(), CustomerResponse.from(order.getCustomer()), order.getServiceRequest().getId(), order.getServiceRequest().getTitle(), order.getAssignedUser() == null ? null : UserResponse.from(order.getAssignedUser()), order.getCreatedAt());
    }
}
