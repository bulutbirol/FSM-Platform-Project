package com.serviceflow.controller;

import com.serviceflow.dto.servicerequest.*;
import com.serviceflow.entity.ServiceRequestStatus;
import com.serviceflow.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
public class ServiceRequestController {
    private final ServiceRequestService requestService;

    @GetMapping
    public List<ServiceRequestResponse> list(@RequestParam(required = false) ServiceRequestStatus status, Principal principal) {
        return requestService.list(status, principal.getName());
    }

    @GetMapping("/{id}")
    public ServiceRequestResponse get(@PathVariable Long id, Principal principal) {
        return requestService.get(id, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ServiceRequestResponse create(@Valid @RequestBody ServiceRequestInput request) {
        return requestService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ServiceRequestResponse update(@PathVariable Long id, @Valid @RequestBody ServiceRequestInput request) {
        return requestService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ServiceRequestResponse status(@PathVariable Long id, @Valid @RequestBody UpdateServiceRequestStatusRequest request) {
        return requestService.updateStatus(id, request);
    }
}

