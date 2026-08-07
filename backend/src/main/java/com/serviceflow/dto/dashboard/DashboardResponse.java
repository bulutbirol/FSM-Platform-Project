package com.serviceflow.dto.dashboard;

import com.serviceflow.dto.workorder.WorkOrderResponse;

import java.util.List;

public record DashboardResponse(long totalCustomers, long openServiceRequests, long pendingQuotations, long scheduledWorkOrders, long completedWorkOrders, List<WorkOrderResponse> recentWorkOrders, List<StatusCount> workOrderStatusChart) {
}

