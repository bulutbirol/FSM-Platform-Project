package com.serviceflow.dto.customer;

import com.serviceflow.entity.Customer;

import java.time.Instant;

public record CustomerResponse(Long id, String name, String company, String email, String phone, String address, String notes, boolean active, Instant createdAt) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(customer.getId(), customer.getName(), customer.getCompany(), customer.getEmail(), customer.getPhone(), customer.getAddress(), customer.getNotes(), customer.isActive(), customer.getCreatedAt());
    }
}

