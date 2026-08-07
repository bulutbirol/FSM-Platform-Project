package com.serviceflow.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class DemoCredentialsTest {
    @Test
    void seededHashMatchesDocumentedPassword() {
        String hash = "$2a$10$9ujc8fAr9ByfI0FV32PDNemgTIGh9MtrgOG4AsSzY85DzSMQ1GcIO";

        assertThat(new BCryptPasswordEncoder().matches("password", hash)).isTrue();
    }
}
