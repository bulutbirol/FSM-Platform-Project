package com.serviceflow.repository;

import com.serviceflow.entity.Quote;
import com.serviceflow.entity.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findAllByOrderByCreatedAtDesc();
    List<Quote> findByStatusOrderByCreatedAtDesc(QuoteStatus status);
    List<Quote> findByServiceRequestCustomerIdOrderByCreatedAtDesc(Long customerId);
    boolean existsByServiceRequestId(Long serviceRequestId);
    long countByStatus(QuoteStatus status);
}

