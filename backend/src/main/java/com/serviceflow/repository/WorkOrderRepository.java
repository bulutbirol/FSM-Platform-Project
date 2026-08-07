package com.serviceflow.repository;

import com.serviceflow.entity.WorkOrder;
import com.serviceflow.entity.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findAllByOrderByCreatedAtDesc();
    List<WorkOrder> findByAssignedUserIdOrderByCreatedAtDesc(Long userId);
    List<WorkOrder> findTop5ByOrderByCreatedAtDesc();
    boolean existsByServiceRequestId(Long serviceRequestId);
    long countByStatus(WorkOrderStatus status);
}
