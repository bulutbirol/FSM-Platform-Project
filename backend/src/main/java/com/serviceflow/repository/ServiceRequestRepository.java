package com.serviceflow.repository;

import com.serviceflow.entity.ServiceRequest;
import com.serviceflow.entity.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(ServiceRequestStatus status);
    List<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    long countByStatusIn(Collection<ServiceRequestStatus> statuses);
}

