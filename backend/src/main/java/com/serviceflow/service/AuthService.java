package com.serviceflow.service;

import com.serviceflow.dto.auth.*;
import com.serviceflow.exception.ResourceNotFoundException;
import com.serviceflow.exception.UnauthorizedException;
import com.serviceflow.repository.UserRepository;
import com.serviceflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException exception) {
            throw new UnauthorizedException("Invalid email or password.");
        }
        var user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    public UserResponse currentUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }
}

