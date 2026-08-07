package com.serviceflow.repository;

import com.serviceflow.entity.Role;
import com.serviceflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findByRoleOrderByFirstNameAsc(Role role);
}

