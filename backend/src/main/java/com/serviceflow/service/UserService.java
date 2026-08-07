package com.serviceflow.service;

import com.serviceflow.dto.auth.UserResponse;
import com.serviceflow.entity.Role;
import com.serviceflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> technicians() {
        return userRepository.findByRoleOrderByFirstNameAsc(Role.TECHNICIAN).stream().map(UserResponse::from).toList();
    }
}

