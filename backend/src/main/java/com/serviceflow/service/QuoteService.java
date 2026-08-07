package com.serviceflow.service;

import com.serviceflow.dto.quote.*;
import com.serviceflow.entity.*;
import com.serviceflow.exception.*;
import com.serviceflow.repository.QuoteRepository;
import com.serviceflow.repository.ServiceRequestRepository;
import com.serviceflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteService {
    private final QuoteRepository quoteRepository;
    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<QuoteResponse> list(QuoteStatus status, String email) {
        User user = user(email);
        List<Quote> quotes;
        if (user.getRole() == Role.CUSTOMER) {
            if (user.getCustomer() == null) {
                throw new ForbiddenException("This account is not linked to a customer.");
            }
            quotes = quoteRepository.findByServiceRequestCustomerIdOrderByCreatedAtDesc(user.getCustomer().getId());
            if (status != null) {
                quotes = quotes.stream().filter(quote -> quote.getStatus() == status).toList();
            }
        } else {
            quotes = status == null ? quoteRepository.findAllByOrderByCreatedAtDesc() : quoteRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return quotes.stream().map(QuoteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public QuoteResponse get(Long id, String email) {
        Quote quote = find(id);
        User user = user(email);
        if (user.getRole() == Role.CUSTOMER && (user.getCustomer() == null || !user.getCustomer().getId().equals(quote.getServiceRequest().getCustomer().getId()))) {
            throw new ForbiddenException("You can only view your own quotations.");
        }
        return QuoteResponse.from(quote);
    }

    @Transactional
    public QuoteResponse create(QuoteRequest input) {
        if (quoteRepository.existsByServiceRequestId(input.serviceRequestId())) {
            throw new BusinessRuleException("This service request already has a quotation.");
        }
        ServiceRequest request = requestRepository.findById(input.serviceRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found."));
        if (request.getStatus() != ServiceRequestStatus.NEW && request.getStatus() != ServiceRequestStatus.REVIEWED) {
            throw new BusinessRuleException("Quotations can only be created for new or reviewed requests.");
        }
        Quote quote = new Quote();
        apply(quote, input);
        quote.setServiceRequest(request);
        quote.setStatus(QuoteStatus.DRAFT);
        return QuoteResponse.from(quoteRepository.save(quote));
    }

    @Transactional
    public QuoteResponse update(Long id, QuoteRequest input) {
        Quote quote = find(id);
        if (quote.getStatus() != QuoteStatus.DRAFT) {
            throw new BusinessRuleException("Only draft quotations can be edited.");
        }
        if (!quote.getServiceRequest().getId().equals(input.serviceRequestId())) {
            throw new BusinessRuleException("A quotation cannot be moved to another request.");
        }
        apply(quote, input);
        return QuoteResponse.from(quoteRepository.save(quote));
    }

    @Transactional
    public QuoteResponse send(Long id) {
        Quote quote = find(id);
        if (quote.getStatus() != QuoteStatus.DRAFT) {
            throw new BusinessRuleException("Only draft quotations can be sent.");
        }
        quote.setStatus(QuoteStatus.SENT);
        quote.getServiceRequest().setStatus(ServiceRequestStatus.QUOTED);
        requestRepository.save(quote.getServiceRequest());
        return QuoteResponse.from(quoteRepository.save(quote));
    }

    @Transactional
    public QuoteResponse decide(Long id, boolean approve, String email) {
        Quote quote = find(id);
        User user = user(email);
        if (user.getRole() != Role.CUSTOMER || user.getCustomer() == null || !user.getCustomer().getId().equals(quote.getServiceRequest().getCustomer().getId())) {
            throw new ForbiddenException("You can only decide your own quotations.");
        }
        if (quote.getStatus() != QuoteStatus.SENT) {
            throw new BusinessRuleException("Only sent quotations can be approved or rejected.");
        }
        quote.setStatus(approve ? QuoteStatus.APPROVED : QuoteStatus.REJECTED);
        quote.getServiceRequest().setStatus(approve ? ServiceRequestStatus.APPROVED : ServiceRequestStatus.REVIEWED);
        requestRepository.save(quote.getServiceRequest());
        return QuoteResponse.from(quoteRepository.save(quote));
    }

    private Quote find(Long id) {
        return quoteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quotation not found."));
    }

    private User user(String email) {
        return userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void apply(Quote quote, QuoteRequest input) {
        quote.setDescription(input.description().trim());
        quote.setAmount(input.amount());
        quote.setValidUntil(input.validUntil());
    }
}
