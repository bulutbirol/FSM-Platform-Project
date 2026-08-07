package com.serviceflow.service;

import com.serviceflow.dto.dashboard.*;
import com.serviceflow.dto.workorder.WorkOrderResponse;
import com.serviceflow.entity.*;
import com.serviceflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final CustomerRepository customerRepository;
    private final ServiceRequestRepository requestRepository;
    private final QuoteRepository quoteRepository;
    private final WorkOrderRepository workOrderRepository;

    @Transactional(readOnly = true)
    public DashboardResponse get() {
        long openRequests = requestRepository.countByStatusIn(List.of(ServiceRequestStatus.NEW, ServiceRequestStatus.REVIEWED, ServiceRequestStatus.QUOTED, ServiceRequestStatus.APPROVED, ServiceRequestStatus.SCHEDULED, ServiceRequestStatus.IN_PROGRESS));
        List<StatusCount> chart = Arrays.stream(WorkOrderStatus.values())
                .map(status -> new StatusCount(status.name(), workOrderRepository.countByStatus(status)))
                .toList();
        return new DashboardResponse(
                customerRepository.countByActiveTrue(),
                openRequests,
                quoteRepository.countByStatus(QuoteStatus.SENT),
                workOrderRepository.countByStatus(WorkOrderStatus.SCHEDULED),
                workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED),
                workOrderRepository.findTop5ByOrderByCreatedAtDesc().stream().map(WorkOrderResponse::from).toList(),
                chart
        );
    }
}

