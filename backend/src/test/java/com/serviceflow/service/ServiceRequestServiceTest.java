package com.serviceflow.service;

import com.serviceflow.dto.servicerequest.ServiceRequestInput;
import com.serviceflow.entity.*;
import com.serviceflow.exception.BusinessRuleException;
import com.serviceflow.repository.CustomerRepository;
import com.serviceflow.repository.ServiceRequestRepository;
import com.serviceflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ServiceRequestServiceTest {
    private ServiceRequestRepository requestRepository;
    private CustomerRepository customerRepository;
    private ServiceRequestService requestService;

    @BeforeEach
    void setUp() {
        requestRepository = mock(ServiceRequestRepository.class);
        customerRepository = mock(CustomerRepository.class);
        requestService = new ServiceRequestService(requestRepository, customerRepository, mock(UserRepository.class));
    }

    @Test
    void cannotMoveExistingRequestToAnotherCustomer() {
        Customer original = Customer.builder().id(1L).name("Original").active(true).build();
        Customer another = Customer.builder().id(2L).name("Another").active(true).build();
        ServiceRequest request = ServiceRequest.builder().id(8L).title("Maintenance").customer(original).status(ServiceRequestStatus.NEW).build();
        ServiceRequestInput input = new ServiceRequestInput("Maintenance", "Service scope", Priority.MEDIUM, LocalDate.now().plusDays(1), "Istanbul", 2L);
        when(requestRepository.findById(8L)).thenReturn(Optional.of(request));
        when(customerRepository.findById(2L)).thenReturn(Optional.of(another));
        when(requestRepository.save(request)).thenReturn(request);

        assertThatThrownBy(() -> requestService.update(8L, input)).isInstanceOf(BusinessRuleException.class);
    }
}
