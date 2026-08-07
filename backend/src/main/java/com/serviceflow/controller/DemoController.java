package com.serviceflow.controller;

import com.serviceflow.service.DemoDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class DemoController {
    private final DemoDataService demoDataService;

    @PostMapping("/reset")
    public Map<String, String> reset() {
        demoDataService.reset();
        return Map.of("message", "Demo data restored.");
    }
}
