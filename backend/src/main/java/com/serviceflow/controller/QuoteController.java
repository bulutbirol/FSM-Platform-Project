package com.serviceflow.controller;

import com.serviceflow.dto.quote.*;
import com.serviceflow.entity.QuoteStatus;
import com.serviceflow.service.QuoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
public class QuoteController {
    private final QuoteService quoteService;

    @GetMapping
    public List<QuoteResponse> list(@RequestParam(required = false) QuoteStatus status, Principal principal) {
        return quoteService.list(status, principal.getName());
    }

    @GetMapping("/{id}")
    public QuoteResponse get(@PathVariable Long id, Principal principal) {
        return quoteService.get(id, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public QuoteResponse create(@Valid @RequestBody QuoteRequest request) {
        return quoteService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public QuoteResponse update(@PathVariable Long id, @Valid @RequestBody QuoteRequest request) {
        return quoteService.update(id, request);
    }

    @PostMapping("/{id}/send")
    @PreAuthorize("hasRole('ADMIN')")
    public QuoteResponse send(@PathVariable Long id) {
        return quoteService.send(id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('CUSTOMER')")
    public QuoteResponse approve(@PathVariable Long id, Principal principal) {
        return quoteService.decide(id, true, principal.getName());
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('CUSTOMER')")
    public QuoteResponse reject(@PathVariable Long id, Principal principal) {
        return quoteService.decide(id, false, principal.getName());
    }
}

