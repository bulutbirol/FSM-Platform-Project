package com.serviceflow.controller;

import com.serviceflow.dto.workorder.*;
import com.serviceflow.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
public class WorkOrderController {
    private final WorkOrderService workOrderService;

    @GetMapping
    public List<WorkOrderResponse> list(Principal principal) {
        return workOrderService.list(principal.getName());
    }

    @GetMapping("/{id}")
    public WorkOrderResponse get(@PathVariable Long id, Principal principal) {
        return workOrderService.get(id, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public WorkOrderResponse create(@Valid @RequestBody WorkOrderRequest request) {
        return workOrderService.create(request);
    }

    @PatchMapping("/{id}/assignment")
    @PreAuthorize("hasRole('ADMIN')")
    public WorkOrderResponse assign(@PathVariable Long id, @Valid @RequestBody AssignWorkOrderRequest request) {
        return workOrderService.assign(id, request);
    }

    @PatchMapping("/{id}/status")
    public WorkOrderResponse status(@PathVariable Long id, @Valid @RequestBody UpdateWorkOrderStatusRequest request, Principal principal) {
        return workOrderService.updateStatus(id, request, principal.getName());
    }
}
