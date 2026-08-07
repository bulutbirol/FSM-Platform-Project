package com.serviceflow.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 150) String company,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(max = 40) String phone,
        @NotBlank @Size(max = 300) String address,
        @Size(max = 2000) String notes
) {
}

