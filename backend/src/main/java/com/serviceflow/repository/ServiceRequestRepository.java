package com.serviceflow.repository;

import com.serviceflow.entity.ServiceRequest;
import com.serviceflow.entity.ServiceRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(ServiceRequestStatus status);
    List<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    long countByStatusIn(Collection<ServiceRequestStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select request from ServiceRequest request where request.id = :id")
    Optional<ServiceRequest> findByIdForUpdate(@Param("id") Long id);
}
