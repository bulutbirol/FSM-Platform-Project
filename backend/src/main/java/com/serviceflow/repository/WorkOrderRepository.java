package com.serviceflow.repository;

import com.serviceflow.entity.WorkOrder;
import com.serviceflow.entity.WorkOrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findAllByOrderByCreatedAtDesc();
    List<WorkOrder> findByAssignedUserIdOrderByCreatedAtDesc(Long userId);
    List<WorkOrder> findTop5ByOrderByCreatedAtDesc();
    boolean existsByServiceRequestId(Long serviceRequestId);
    long countByStatus(WorkOrderStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select workOrder from WorkOrder workOrder where workOrder.id = :id")
    Optional<WorkOrder> findByIdForUpdate(@Param("id") Long id);
}
