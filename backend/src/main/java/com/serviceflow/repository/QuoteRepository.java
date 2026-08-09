package com.serviceflow.repository;

import com.serviceflow.entity.Quote;
import com.serviceflow.entity.QuoteStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findAllByOrderByCreatedAtDesc();
    List<Quote> findByStatusOrderByCreatedAtDesc(QuoteStatus status);
    List<Quote> findByServiceRequestCustomerIdOrderByCreatedAtDesc(Long customerId);
    boolean existsByServiceRequestId(Long serviceRequestId);
    long countByStatus(QuoteStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select quote from Quote quote where quote.id = :id")
    Optional<Quote> findByIdForUpdate(@Param("id") Long id);
}
