package com.serviceflow.controller;

import com.serviceflow.dto.dashboard.DashboardResponse;
import com.serviceflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse get() {
        return dashboardService.get();
    }
}

