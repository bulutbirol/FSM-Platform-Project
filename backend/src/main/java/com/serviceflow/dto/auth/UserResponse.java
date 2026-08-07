package com.serviceflow.dto.auth;

import com.serviceflow.entity.Role;
import com.serviceflow.entity.User;

public record UserResponse(Long id, String firstName, String lastName, String email, Role role, Long customerId) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getCustomer() == null ? null : user.getCustomer().getId()
        );
    }
}

