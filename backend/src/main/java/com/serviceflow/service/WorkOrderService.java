package com.serviceflow.service;

import com.serviceflow.dto.workorder.*;
import com.serviceflow.entity.*;
import com.serviceflow.exception.*;
import com.serviceflow.repository.ServiceRequestRepository;
import com.serviceflow.repository.UserRepository;
import com.serviceflow.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderService {
    private final WorkOrderRepository workOrderRepository;
    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> list(String email) {
        User user = user(email);
        List<WorkOrder> orders = user.getRole() == Role.TECHNICIAN
                ? workOrderRepository.findByAssignedUserIdOrderByCreatedAtDesc(user.getId())
                : workOrderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream().map(WorkOrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse get(Long id, String email) {
        WorkOrder order = find(id);
        ensureAssignedWhenTechnician(order, user(email));
        return WorkOrderResponse.from(order);
    }

    @Transactional
    public WorkOrderResponse create(WorkOrderRequest input) {
        ServiceRequest request = findRequestForUpdate(input.serviceRequestId());
        if (request.getStatus() != ServiceRequestStatus.APPROVED) {
            throw new BusinessRuleException("A work order requires an approved quotation.");
        }
        if (workOrderRepository.existsByServiceRequestId(input.serviceRequestId())) {
            throw new BusinessRuleException("This service request already has a work order.");
        }
        if (input.assignedUserId() != null && input.scheduledDate() == null) {
            throw new BusinessRuleException("An assigned work order requires a scheduled date.");
        }
        User technician = input.assignedUserId() == null ? null : technician(input.assignedUserId());
        WorkOrder order = new WorkOrder();
        order.setTitle(input.title().trim());
        order.setDescription(input.description().trim());
        order.setScheduledDate(input.scheduledDate());
        order.setServiceRequest(request);
        order.setCustomer(request.getCustomer());
        order.setAssignedUser(technician);
        order.setStatus(technician == null ? WorkOrderStatus.UNASSIGNED : WorkOrderStatus.SCHEDULED);
        request.setStatus(technician == null ? ServiceRequestStatus.APPROVED : ServiceRequestStatus.SCHEDULED);
        requestRepository.save(request);
        return WorkOrderResponse.from(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse acceptRequest(Long requestId, LocalDateTime scheduledDate, String email) {
        User technician = user(email);
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new ForbiddenException("Only technicians can accept approved requests.");
        }
        ServiceRequest request = findRequestForUpdate(requestId);
        if (request.getStatus() != ServiceRequestStatus.REVIEWED) {
            throw new BusinessRuleException("Only administrator-approved requests can be accepted.");
        }
        if (workOrderRepository.existsByServiceRequestId(requestId)) {
            throw new BusinessRuleException("This service request already has a work order.");
        }
        if (scheduledDate == null || scheduledDate.isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Appointment date must be in the present or future.");
        }

        WorkOrder order = new WorkOrder();
        order.setTitle(request.getTitle());
        order.setDescription(request.getDescription());
        order.setScheduledDate(scheduledDate);
        order.setServiceRequest(request);
        order.setCustomer(request.getCustomer());
        order.setAssignedUser(technician);
        order.setStatus(WorkOrderStatus.SCHEDULED);
        request.setStatus(ServiceRequestStatus.SCHEDULED);
        requestRepository.save(request);
        return WorkOrderResponse.from(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse assign(Long id, AssignWorkOrderRequest input) {
        WorkOrder order = findForUpdate(id);
        if (order.getStatus() != WorkOrderStatus.UNASSIGNED) {
            throw new BusinessRuleException("Only unassigned work orders can be assigned.");
        }
        order.setAssignedUser(technician(input.assignedUserId()));
        order.setScheduledDate(input.scheduledDate());
        order.setStatus(WorkOrderStatus.SCHEDULED);
        syncRequestStatus(order, lockRequest(order));
        return WorkOrderResponse.from(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse updateStatus(Long id, UpdateWorkOrderStatusRequest input, String email) {
        WorkOrder order = findForUpdate(id);
        User user = user(email);
        ensureAssignedWhenTechnician(order, user);
        if (order.getStatus() == WorkOrderStatus.SCHEDULED
                && input.status() == WorkOrderStatus.IN_PROGRESS
                && (order.getScheduledDate() == null || order.getScheduledDate().isAfter(LocalDateTime.now()))) {
            throw new BusinessRuleException("Work cannot start before the scheduled appointment.");
        }
        if (!isAllowedTransition(order.getStatus(), input.status())) {
            throw new BusinessRuleException("Invalid work-order status transition.");
        }
        order.setStatus(input.status());
        syncRequestStatus(order, lockRequest(order));
        return WorkOrderResponse.from(workOrderRepository.save(order));
    }

    private boolean isAllowedTransition(WorkOrderStatus current, WorkOrderStatus next) {
        if (current == next) {
            return true;
        }
        return switch (current) {
            case UNASSIGNED -> next == WorkOrderStatus.CANCELLED;
            case SCHEDULED -> next == WorkOrderStatus.IN_PROGRESS || next == WorkOrderStatus.CANCELLED;
            case IN_PROGRESS -> next == WorkOrderStatus.COMPLETED || next == WorkOrderStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };
    }

    private void syncRequestStatus(WorkOrder order, ServiceRequest request) {
        ServiceRequestStatus status = switch (order.getStatus()) {
            case SCHEDULED -> ServiceRequestStatus.SCHEDULED;
            case IN_PROGRESS -> ServiceRequestStatus.IN_PROGRESS;
            case COMPLETED -> ServiceRequestStatus.COMPLETED;
            case CANCELLED -> ServiceRequestStatus.CANCELLED;
            case UNASSIGNED -> ServiceRequestStatus.APPROVED;
        };
        request.setStatus(status);
        requestRepository.save(request);
    }

    private WorkOrder find(Long id) {
        return workOrderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Work order not found."));
    }

    private WorkOrder findForUpdate(Long id) {
        return workOrderRepository.findByIdForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Work order not found."));
    }

    private ServiceRequest lockRequest(WorkOrder order) {
        if (order.getServiceRequest() == null) {
            throw new BusinessRuleException("Work order is not linked to a service request.");
        }
        return findRequestForUpdate(order.getServiceRequest().getId());
    }

    private ServiceRequest findRequestForUpdate(Long id) {
        return requestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found."));
    }

    private User user(String email) {
        return userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private User technician(Long id) {
        return userRepository.findById(id).filter(user -> user.getRole() == Role.TECHNICIAN)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found."));
    }

    private void ensureAssignedWhenTechnician(WorkOrder order, User user) {
        if (user.getRole() == Role.TECHNICIAN && (order.getAssignedUser() == null || !order.getAssignedUser().getId().equals(user.getId()))) {
            throw new ForbiddenException("You can only update assigned work orders.");
        }
    }
}
