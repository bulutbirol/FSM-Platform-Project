package com.serviceflow.service;

import com.serviceflow.dto.servicerequest.ServiceRequestInput;
import com.serviceflow.dto.servicerequest.UpdateServiceRequestStatusRequest;
import com.serviceflow.entity.*;
import com.serviceflow.exception.BusinessRuleException;
import com.serviceflow.repository.CustomerRepository;
import com.serviceflow.repository.ServiceRequestRepository;
import com.serviceflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ServiceRequestServiceTest {
    private ServiceRequestRepository requestRepository;
    private CustomerRepository customerRepository;
    private UserRepository userRepository;
    private ServiceRequestService requestService;

    @BeforeEach
    void setUp() {
        requestRepository = mock(ServiceRequestRepository.class);
        customerRepository = mock(CustomerRepository.class);
        userRepository = mock(UserRepository.class);
        requestService = new ServiceRequestService(requestRepository, customerRepository, userRepository);
    }

    @Test
    void technicianSeesOnlyRequestsApprovedForTechnicianReview() {
        User technician = User.builder().id(2L).email("tech@serviceflow.demo").role(Role.TECHNICIAN).build();
        Customer customer = Customer.builder().id(1L).name("Northstar").active(true).build();
        ServiceRequest fresh = ServiceRequest.builder().id(10L).title("Fresh").description("Fresh request").priority(Priority.MEDIUM).requestedDate(LocalDate.now().plusDays(1)).address("Istanbul").customer(customer).status(ServiceRequestStatus.NEW).build();
        ServiceRequest approved = ServiceRequest.builder().id(11L).title("Approved").description("Approved request").priority(Priority.HIGH).requestedDate(LocalDate.now().plusDays(2)).address("Istanbul").customer(customer).status(ServiceRequestStatus.REVIEWED).build();
        ServiceRequest scheduled = ServiceRequest.builder().id(12L).title("Scheduled").description("Scheduled request").priority(Priority.LOW).requestedDate(LocalDate.now().plusDays(3)).address("Istanbul").customer(customer).status(ServiceRequestStatus.SCHEDULED).build();
        when(userRepository.findByEmailIgnoreCase(technician.getEmail())).thenReturn(Optional.of(technician));
        when(requestRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(fresh, approved, scheduled));
        when(requestRepository.findByStatusOrderByCreatedAtDesc(ServiceRequestStatus.REVIEWED)).thenReturn(List.of(approved));

        var responses = requestService.list(null, technician.getEmail());

        assertThat(responses).extracting(response -> response.id()).containsExactly(11L);
        verify(requestRepository).findByStatusOrderByCreatedAtDesc(ServiceRequestStatus.REVIEWED);
    }

    @Test
    void customerCreatesRequestForCustomerLinkedToAuthenticatedAccount() {
        Customer linkedCustomer = Customer.builder().id(1L).name("Northstar").active(true).build();
        User customerUser = User.builder().id(3L).email("customer@serviceflow.demo").role(Role.CUSTOMER).customer(linkedCustomer).build();
        ServiceRequestInput input = new ServiceRequestInput("Coffee machine issue", "Pressure is unstable", Priority.HIGH, LocalDate.now().plusDays(2), "Kadikoy", 99L);
        when(userRepository.findByEmailIgnoreCase(customerUser.getEmail())).thenReturn(Optional.of(customerUser));
        when(requestRepository.save(any(ServiceRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = requestService.create(input, customerUser.getEmail());

        assertThat(response.customer().id()).isEqualTo(linkedCustomer.getId());
        assertThat(response.status()).isEqualTo(ServiceRequestStatus.NEW);
        verify(customerRepository, never()).findById(99L);
    }

    @Test
    void adminCreatesRequestForSelectedActiveCustomer() {
        User admin = User.builder().id(1L).email("admin@serviceflow.demo").role(Role.ADMIN).build();
        Customer selectedCustomer = Customer.builder().id(7L).name("Acar Dental").active(true).build();
        ServiceRequestInput input = new ServiceRequestInput("Air conditioner", "Cooling is intermittent", Priority.MEDIUM, LocalDate.now().plusDays(3), "Sisli", 7L);
        when(userRepository.findByEmailIgnoreCase(admin.getEmail())).thenReturn(Optional.of(admin));
        when(customerRepository.findById(7L)).thenReturn(Optional.of(selectedCustomer));
        when(requestRepository.save(any(ServiceRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = requestService.create(input, admin.getEmail());

        assertThat(response.customer().id()).isEqualTo(selectedCustomer.getId());
        assertThat(response.status()).isEqualTo(ServiceRequestStatus.NEW);
    }

    @Test
    void activeWorkOrderRequestCannotBeCancelledDirectly() {
        Customer customer = Customer.builder().id(1L).name("Northstar").active(true).build();
        ServiceRequest request = ServiceRequest.builder().id(20L).title("Scheduled visit").customer(customer).status(ServiceRequestStatus.SCHEDULED).build();
        when(requestRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(request));
        when(requestRepository.save(request)).thenReturn(request);

        assertThatThrownBy(() -> requestService.updateStatus(20L, new UpdateServiceRequestStatusRequest(ServiceRequestStatus.CANCELLED)))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void cannotMoveExistingRequestToAnotherCustomer() {
        Customer original = Customer.builder().id(1L).name("Original").active(true).build();
        Customer another = Customer.builder().id(2L).name("Another").active(true).build();
        ServiceRequest request = ServiceRequest.builder().id(8L).title("Maintenance").customer(original).status(ServiceRequestStatus.NEW).build();
        ServiceRequestInput input = new ServiceRequestInput("Maintenance", "Service scope", Priority.MEDIUM, LocalDate.now().plusDays(1), "Istanbul", 2L);
        when(requestRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(request));
        when(customerRepository.findById(2L)).thenReturn(Optional.of(another));
        when(requestRepository.save(request)).thenReturn(request);

        assertThatThrownBy(() -> requestService.update(8L, input)).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void scheduledRequestCannotBeEditedFromAStaleAdminForm() {
        Customer customer = Customer.builder().id(1L).name("Northstar").active(true).build();
        ServiceRequest request = ServiceRequest.builder().id(8L).title("Maintenance").customer(customer).status(ServiceRequestStatus.SCHEDULED).build();
        ServiceRequestInput input = new ServiceRequestInput("Changed title", "Changed scope", Priority.HIGH, LocalDate.now().plusDays(1), "Istanbul", 1L);
        when(requestRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(request));

        assertThatThrownBy(() -> requestService.update(8L, input)).isInstanceOf(BusinessRuleException.class);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.SCHEDULED);
    }
}
