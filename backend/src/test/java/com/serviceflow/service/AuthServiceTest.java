package com.serviceflow.service;

import com.serviceflow.dto.auth.LoginRequest;
import com.serviceflow.entity.Role;
import com.serviceflow.entity.User;
import com.serviceflow.exception.UnauthorizedException;
import com.serviceflow.repository.UserRepository;
import com.serviceflow.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {
    private AuthenticationManager authenticationManager;
    private UserRepository userRepository;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authenticationManager = mock(AuthenticationManager.class);
        userRepository = mock(UserRepository.class);
        jwtService = mock(JwtService.class);
        authService = new AuthService(authenticationManager, userRepository, jwtService);
    }

    @Test
    void returnsTokenAndSafeUserForValidCredentials() {
        User user = User.builder().id(1L).firstName("Aylin").lastName("Kaya").email("admin@serviceflow.demo").password("hash").role(Role.ADMIN).build();
        LoginRequest request = new LoginRequest(user.getEmail(), "password");
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        var response = authService.login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo(user.getEmail());
        assertThat(response.user().role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void rejectsInvalidCredentialsWithUnauthorizedError() {
        LoginRequest request = new LoginRequest("admin@serviceflow.demo", "wrong");
        when(authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password())))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authService.login(request)).isInstanceOf(UnauthorizedException.class);
    }
}

