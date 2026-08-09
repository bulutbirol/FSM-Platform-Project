package com.serviceflow.service;

import com.serviceflow.dto.servicerequest.*;
import com.serviceflow.entity.*;
import com.serviceflow.exception.BusinessRuleException;
import com.serviceflow.exception.ForbiddenException;
import com.serviceflow.exception.ResourceNotFoundException;
import com.serviceflow.repository.CustomerRepository;
import com.serviceflow.repository.ServiceRequestRepository;
import com.serviceflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {
    private final ServiceRequestRepository requestRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> list(ServiceRequestStatus status, String email) {
        User user = user(email);
        List<ServiceRequest> requests;
        if (user.getRole() == Role.CUSTOMER) {
            requests = requestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId(user));
            if (status != null) {
                requests = requests.stream().filter(request -> request.getStatus() == status).toList();
            }
        } else if (user.getRole() == Role.TECHNICIAN) {
            requests = status == null || status == ServiceRequestStatus.REVIEWED
                    ? requestRepository.findByStatusOrderByCreatedAtDesc(ServiceRequestStatus.REVIEWED)
                    : List.of();
        } else {
            requests = status == null ? requestRepository.findAllByOrderByCreatedAtDesc() : requestRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return requests.stream().map(ServiceRequestResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ServiceRequestResponse get(Long id, String email) {
        ServiceRequest request = find(id);
        ensureVisible(request, user(email));
        return ServiceRequestResponse.from(request);
    }

    @Transactional
    public ServiceRequestResponse create(ServiceRequestInput input, String email) {
        Customer customer = customerForCreation(input, user(email));
        ServiceRequest request = new ServiceRequest();
        apply(request, input);
        request.setCustomer(customer);
        request.setStatus(ServiceRequestStatus.NEW);
        return ServiceRequestResponse.from(requestRepository.save(request));
    }

    @Transactional
    public ServiceRequestResponse update(Long id, ServiceRequestInput input) {
        ServiceRequest request = findForUpdate(id);
        if (request.getStatus() != ServiceRequestStatus.NEW && request.getStatus() != ServiceRequestStatus.REVIEWED) {
            throw new BusinessRuleException("Only new or reviewed service requests can be edited.");
        }
        if (!request.getCustomer().getId().equals(input.customerId())) {
            throw new BusinessRuleException("A service request cannot be moved to another customer.");
        }
        Customer customer = customerRepository.findById(input.customerId()).filter(Customer::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active customer not found."));
        apply(request, input);
        request.setCustomer(customer);
        return ServiceRequestResponse.from(requestRepository.save(request));
    }

    @Transactional
    public ServiceRequestResponse updateStatus(Long id, UpdateServiceRequestStatusRequest input) {
        ServiceRequest request = findForUpdate(id);
        if (!isAllowedTransition(request.getStatus(), input.status())) {
            throw new BusinessRuleException("Invalid service-request status transition.");
        }
        request.setStatus(input.status());
        return ServiceRequestResponse.from(requestRepository.save(request));
    }

    ServiceRequest find(Long id) {
        return requestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service request not found."));
    }

    private ServiceRequest findForUpdate(Long id) {
        return requestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found."));
    }

    private User user(String email) {
        return userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private Long customerId(User user) {
        if (user.getCustomer() == null) {
            throw new ForbiddenException("This account is not linked to a customer.");
        }
        return user.getCustomer().getId();
    }

    private Customer customerForCreation(ServiceRequestInput input, User user) {
        if (user.getRole() == Role.CUSTOMER) {
            if (user.getCustomer() == null || !user.getCustomer().isActive()) {
                throw new ForbiddenException("This account is not linked to an active customer.");
            }
            return user.getCustomer();
        }
        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only customers and administrators can create service requests.");
        }
        if (input.customerId() == null) {
            throw new BusinessRuleException("Customer is required for an administrator-created request.");
        }
        return customerRepository.findById(input.customerId()).filter(Customer::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active customer not found."));
    }

    private void ensureVisible(ServiceRequest request, User user) {
        if (user.getRole() == Role.CUSTOMER && !request.getCustomer().getId().equals(customerId(user))) {
            throw new ForbiddenException("You can only view your own service requests.");
        }
        if (user.getRole() == Role.TECHNICIAN && request.getStatus() != ServiceRequestStatus.REVIEWED) {
            throw new ForbiddenException("Technicians can only view requests waiting for technician acceptance.");
        }
    }

    private void apply(ServiceRequest request, ServiceRequestInput input) {
        request.setTitle(input.title().trim());
        request.setDescription(input.description().trim());
        request.setPriority(input.priority());
        request.setRequestedDate(input.requestedDate());
        request.setAddress(input.address().trim());
    }

    private boolean isAllowedTransition(ServiceRequestStatus current, ServiceRequestStatus next) {
        if (current == next) {
            return true;
        }
        return switch (current) {
            case NEW -> next == ServiceRequestStatus.REVIEWED || next == ServiceRequestStatus.CANCELLED;
            case REVIEWED -> next == ServiceRequestStatus.NEW || next == ServiceRequestStatus.CANCELLED;
            case QUOTED, APPROVED -> next == ServiceRequestStatus.CANCELLED;
            case SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED -> false;
        };
    }
}
