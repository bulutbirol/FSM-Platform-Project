package com.serviceflow.service;

import com.serviceflow.dto.customer.CustomerRequest;
import com.serviceflow.dto.customer.CustomerResponse;
import com.serviceflow.entity.Customer;
import com.serviceflow.exception.ResourceNotFoundException;
import com.serviceflow.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<CustomerResponse> list(String search) {
        List<Customer> customers = search == null || search.isBlank()
                ? customerRepository.findByActiveTrueOrderByNameAsc()
                : customerRepository.findByActiveTrueAndNameContainingIgnoreCaseOrActiveTrueAndCompanyContainingIgnoreCaseOrderByNameAsc(search.trim(), search.trim());
        return customers.stream().map(CustomerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse get(Long id) {
        return CustomerResponse.from(find(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        apply(customer, request);
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = find(id);
        apply(customer, request);
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public void archive(Long id) {
        Customer customer = find(id);
        customer.setActive(false);
        customerRepository.save(customer);
    }

    Customer find(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found."));
    }

    private void apply(Customer customer, CustomerRequest request) {
        customer.setName(request.name().trim());
        customer.setCompany(request.company() == null ? null : request.company().trim());
        customer.setEmail(request.email().trim().toLowerCase());
        customer.setPhone(request.phone().trim());
        customer.setAddress(request.address().trim());
        customer.setNotes(request.notes() == null ? null : request.notes().trim());
    }
}

