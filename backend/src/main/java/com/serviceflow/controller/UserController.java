package com.serviceflow.controller;

import com.serviceflow.dto.auth.UserResponse;
import com.serviceflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final UserService userService;

    @GetMapping("/technicians")
    public List<UserResponse> technicians() {
        return userService.technicians();
    }
}

