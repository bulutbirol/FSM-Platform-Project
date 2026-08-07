package com.serviceflow.service;

import com.serviceflow.dto.workorder.UpdateWorkOrderStatusRequest;
import com.serviceflow.dto.workorder.WorkOrderRequest;
import com.serviceflow.dto.workorder.AssignWorkOrderRequest;
import com.serviceflow.entity.*;
import com.serviceflow.exception.BusinessRuleException;
import com.serviceflow.exception.ForbiddenException;
import com.serviceflow.repository.ServiceRequestRepository;
import com.serviceflow.repository.UserRepository;
import com.serviceflow.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class WorkOrderServiceTest {
    private WorkOrderRepository workOrderRepository;
    private ServiceRequestRepository requestRepository;
    private UserRepository userRepository;
    private WorkOrderService workOrderService;
    private User technician;

    @BeforeEach
    void setUp() {
        workOrderRepository = mock(WorkOrderRepository.class);
        requestRepository = mock(ServiceRequestRepository.class);
        userRepository = mock(UserRepository.class);
        workOrderService = new WorkOrderService(workOrderRepository, requestRepository, userRepository);
        technician = User.builder().id(2L).email("tech@serviceflow.demo").role(Role.TECHNICIAN).build();
        when(userRepository.findByEmailIgnoreCase(technician.getEmail())).thenReturn(Optional.of(technician));
    }

    @Test
    void assignedTechnicianStartsScheduledWorkOrder() {
        Customer customer = Customer.builder().id(4L).name("Northstar Coffee").active(true).build();
        ServiceRequest request = ServiceRequest.builder().id(8L).title("Machine maintenance").status(ServiceRequestStatus.SCHEDULED).customer(customer).build();
        WorkOrder order = WorkOrder.builder().id(7L).status(WorkOrderStatus.SCHEDULED).assignedUser(technician).serviceRequest(request).customer(customer).build();
        when(workOrderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(workOrderRepository.save(order)).thenReturn(order);

        var response = workOrderService.updateStatus(7L, new UpdateWorkOrderStatusRequest(WorkOrderStatus.IN_PROGRESS), technician.getEmail());

        assertThat(response.status()).isEqualTo(WorkOrderStatus.IN_PROGRESS);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.IN_PROGRESS);
    }

    @Test
    void unassignedTechnicianCannotChangeWorkOrder() {
        User other = User.builder().id(6L).email("other@serviceflow.demo").role(Role.TECHNICIAN).build();
        WorkOrder order = WorkOrder.builder().id(7L).status(WorkOrderStatus.SCHEDULED).assignedUser(other).build();
        when(workOrderRepository.findById(7L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> workOrderService.updateStatus(7L, new UpdateWorkOrderStatusRequest(WorkOrderStatus.IN_PROGRESS), technician.getEmail()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void technicianCannotSkipFromScheduledToCompleted() {
        WorkOrder order = WorkOrder.builder().id(7L).status(WorkOrderStatus.SCHEDULED).assignedUser(technician).build();
        when(workOrderRepository.findById(7L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> workOrderService.updateStatus(7L, new UpdateWorkOrderStatusRequest(WorkOrderStatus.COMPLETED), technician.getEmail()))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void assignedWorkOrderRequiresScheduledDate() {
        Customer customer = Customer.builder().id(4L).name("Northstar").active(true).build();
        ServiceRequest request = ServiceRequest.builder().id(8L).title("Maintenance").status(ServiceRequestStatus.APPROVED).customer(customer).build();
        WorkOrderRequest input = new WorkOrderRequest("Visit", "Complete service", null, 8L, 2L);
        when(workOrderRepository.existsByServiceRequestId(8L)).thenReturn(false);
        when(requestRepository.findById(8L)).thenReturn(Optional.of(request));
        when(userRepository.findById(2L)).thenReturn(Optional.of(technician));

        assertThatThrownBy(() -> workOrderService.create(input)).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void adminCannotCompleteUnassignedWorkOrder() {
        User admin = User.builder().id(1L).email("admin@serviceflow.demo").role(Role.ADMIN).build();
        WorkOrder order = WorkOrder.builder().id(7L).status(WorkOrderStatus.UNASSIGNED).build();
        when(workOrderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(userRepository.findByEmailIgnoreCase(admin.getEmail())).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> workOrderService.updateStatus(7L, new UpdateWorkOrderStatusRequest(WorkOrderStatus.COMPLETED), admin.getEmail()))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void adminAssignsAndSchedulesUnassignedWorkOrder() {
        Customer customer = Customer.builder().id(4L).name("Northstar").active(true).build();
        ServiceRequest request = ServiceRequest.builder().id(8L).title("Maintenance").status(ServiceRequestStatus.APPROVED).customer(customer).build();
        WorkOrder order = WorkOrder.builder().id(7L).title("Visit").description("Complete service").status(WorkOrderStatus.UNASSIGNED).customer(customer).serviceRequest(request).build();
        AssignWorkOrderRequest input = new AssignWorkOrderRequest(2L, LocalDateTime.now().plusDays(1));
        when(workOrderRepository.findById(7L)).thenReturn(Optional.of(order));
        when(userRepository.findById(2L)).thenReturn(Optional.of(technician));
        when(workOrderRepository.save(order)).thenReturn(order);

        var response = workOrderService.assign(7L, input);

        assertThat(response.status()).isEqualTo(WorkOrderStatus.SCHEDULED);
        assertThat(response.assignedUser().id()).isEqualTo(2L);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.SCHEDULED);
    }
}
