package com.serviceflow.repository;

import com.serviceflow.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByActiveTrueAndNameContainingIgnoreCaseOrActiveTrueAndCompanyContainingIgnoreCaseOrderByNameAsc(String name, String company);
    List<Customer> findByActiveTrueOrderByNameAsc();
    long countByActiveTrue();
}

