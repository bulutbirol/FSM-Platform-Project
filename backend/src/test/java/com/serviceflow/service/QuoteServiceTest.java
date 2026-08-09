package com.serviceflow.service;

import com.serviceflow.dto.quote.QuoteRequest;
import com.serviceflow.entity.*;
import com.serviceflow.exception.BusinessRuleException;
import com.serviceflow.exception.ForbiddenException;
import com.serviceflow.repository.QuoteRepository;
import com.serviceflow.repository.ServiceRequestRepository;
import com.serviceflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class QuoteServiceTest {
    private QuoteRepository quoteRepository;
    private ServiceRequestRepository requestRepository;
    private UserRepository userRepository;
    private QuoteService quoteService;
    private Customer customer;
    private User customerUser;

    @BeforeEach
    void setUp() {
        quoteRepository = mock(QuoteRepository.class);
        requestRepository = mock(ServiceRequestRepository.class);
        userRepository = mock(UserRepository.class);
        quoteService = new QuoteService(quoteRepository, requestRepository, userRepository);
        customer = Customer.builder().id(4L).name("Deniz Arslan").active(true).build();
        customerUser = User.builder().id(3L).email("customer@serviceflow.demo").role(Role.CUSTOMER).customer(customer).build();
    }

    @Test
    void customerApprovesOwnSentQuoteAndUpdatesRequest() {
        ServiceRequest request = ServiceRequest.builder().id(8L).customer(customer).status(ServiceRequestStatus.QUOTED).build();
        Quote quote = Quote.builder().id(9L).serviceRequest(request).status(QuoteStatus.SENT).build();
        when(quoteRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(quote));
        when(requestRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(request));
        when(userRepository.findByEmailIgnoreCase(customerUser.getEmail())).thenReturn(Optional.of(customerUser));
        when(quoteRepository.save(quote)).thenReturn(quote);

        var result = quoteService.decide(9L, true, customerUser.getEmail());

        assertThat(result.status()).isEqualTo(QuoteStatus.APPROVED);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.APPROVED);
        verify(requestRepository).save(request);
    }

    @Test
    void customerCannotApproveAnotherCustomersQuote() {
        Customer other = Customer.builder().id(5L).name("Other").active(true).build();
        Quote quote = Quote.builder().id(9L).status(QuoteStatus.SENT).serviceRequest(ServiceRequest.builder().customer(other).build()).build();
        when(quoteRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(quote));
        when(userRepository.findByEmailIgnoreCase(customerUser.getEmail())).thenReturn(Optional.of(customerUser));

        assertThatThrownBy(() -> quoteService.decide(9L, true, customerUser.getEmail())).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void customerCannotDecideDraftQuote() {
        Quote quote = Quote.builder().id(9L).status(QuoteStatus.DRAFT).serviceRequest(ServiceRequest.builder().customer(customer).build()).build();
        when(quoteRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(quote));
        when(userRepository.findByEmailIgnoreCase(customerUser.getEmail())).thenReturn(Optional.of(customerUser));

        assertThatThrownBy(() -> quoteService.decide(9L, true, customerUser.getEmail())).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void cannotCreateQuoteForCancelledRequest() {
        ServiceRequest request = ServiceRequest.builder().id(8L).customer(customer).status(ServiceRequestStatus.CANCELLED).build();
        QuoteRequest input = new QuoteRequest("Service scope", new BigDecimal("100.00"), LocalDate.now().plusDays(7), 8L);
        when(quoteRepository.existsByServiceRequestId(8L)).thenReturn(false);
        when(requestRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(request));

        assertThatThrownBy(() -> quoteService.create(input)).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void cannotSendDraftQuoteAfterTechnicianSchedulesRequest() {
        ServiceRequest request = ServiceRequest.builder().id(8L).customer(customer).status(ServiceRequestStatus.SCHEDULED).build();
        Quote quote = Quote.builder().id(9L).serviceRequest(request).status(QuoteStatus.DRAFT).build();
        when(quoteRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(quote));
        when(requestRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(request));

        assertThatThrownBy(() -> quoteService.send(9L)).isInstanceOf(BusinessRuleException.class);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.SCHEDULED);
    }

    @Test
    void cannotDecideSentQuoteAfterRequestLeavesQuotedState() {
        ServiceRequest request = ServiceRequest.builder().id(8L).customer(customer).status(ServiceRequestStatus.IN_PROGRESS).build();
        Quote quote = Quote.builder().id(9L).serviceRequest(request).status(QuoteStatus.SENT).build();
        when(quoteRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(quote));
        when(requestRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(request));
        when(userRepository.findByEmailIgnoreCase(customerUser.getEmail())).thenReturn(Optional.of(customerUser));

        assertThatThrownBy(() -> quoteService.decide(9L, true, customerUser.getEmail())).isInstanceOf(BusinessRuleException.class);
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.IN_PROGRESS);
    }
}
