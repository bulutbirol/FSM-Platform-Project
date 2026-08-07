package com.serviceflow.service;

import com.serviceflow.entity.*;
import com.serviceflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;

@Service
@RequiredArgsConstructor
public class DemoDataService {
    private final WorkOrderRepository workOrderRepository;
    private final QuoteRepository quoteRepository;
    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void reset() {
        workOrderRepository.deleteAllInBatch();
        quoteRepository.deleteAllInBatch();
        requestRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        customerRepository.deleteAllInBatch();

        Customer northstar = customerRepository.save(customer("Mert Yilmaz", "Northstar Coffee", "mert@northstar.demo", "+90 212 555 0101", "Kadikoy, Istanbul", "Prefers morning appointments."));
        Customer dental = customerRepository.save(customer("Selin Acar", "Acar Dental Studio", "selin@acar.demo", "+90 212 555 0102", "Sisli, Istanbul", "Call reception before arrival."));
        Customer workshop = customerRepository.save(customer("Can Demir", "Demir Workshop", "can@demir.demo", "+90 212 555 0103", "Besiktas, Istanbul", null));

        userRepository.save(user("Aylin", "Kaya", "admin@serviceflow.demo", Role.ADMIN, null));
        User technician = userRepository.save(user("Emre", "Tekin", "technician@serviceflow.demo", Role.TECHNICIAN, null));
        userRepository.save(user("Mert", "Yilmaz", "customer@serviceflow.demo", Role.CUSTOMER, northstar));

        ServiceRequest maintenance = requestRepository.save(request("Espresso machine maintenance", "Quarterly maintenance and pressure calibration for the main bar machine.", Priority.MEDIUM, ServiceRequestStatus.SCHEDULED, northstar, 2));
        ServiceRequest repair = requestRepository.save(request("Air conditioning repair", "The treatment room unit is making noise and cooling intermittently.", Priority.HIGH, ServiceRequestStatus.QUOTED, dental, 1));
        requestRepository.save(request("Electrical safety inspection", "Inspect workshop distribution panel and label circuits.", Priority.LOW, ServiceRequestStatus.NEW, workshop, 5));
        ServiceRequest filters = requestRepository.save(request("Water filter replacement", "Replace two under-counter filters and check for leaks.", Priority.MEDIUM, ServiceRequestStatus.COMPLETED, northstar, 1));

        quoteRepository.save(quote("Maintenance visit, calibration, and replacement seals.", "4250.00", QuoteStatus.APPROVED, maintenance));
        quoteRepository.save(quote("Diagnostic visit and fan motor replacement if required.", "6800.00", QuoteStatus.SENT, repair));
        quoteRepository.save(quote("Filter parts, installation, and leak test.", "1950.00", QuoteStatus.APPROVED, filters));

        workOrderRepository.save(order("Maintain espresso machine", "Complete quarterly service checklist and record pressure readings.", WorkOrderStatus.SCHEDULED, LocalDateTime.now().plusDays(2), northstar, maintenance, technician));
        workOrderRepository.save(order("Replace water filters", "Replace filters and perform a ten-minute leak observation.", WorkOrderStatus.COMPLETED, LocalDateTime.now().minusDays(3), northstar, filters, technician));
    }

    private Customer customer(String name, String company, String email, String phone, String address, String notes) {
        return Customer.builder().name(name).company(company).email(email).phone(phone).address(address).notes(notes).active(true).build();
    }

    private User user(String firstName, String lastName, String email, Role role, Customer customer) {
        return User.builder().firstName(firstName).lastName(lastName).email(email).password(passwordEncoder.encode("password")).role(role).customer(customer).build();
    }

    private ServiceRequest request(String title, String description, Priority priority, ServiceRequestStatus status, Customer customer, int days) {
        return ServiceRequest.builder().title(title).description(description).priority(priority).status(status).requestedDate(LocalDate.now().plusDays(days)).address(customer.getAddress()).customer(customer).build();
    }

    private Quote quote(String description, String amount, QuoteStatus status, ServiceRequest request) {
        return Quote.builder().description(description).amount(new BigDecimal(amount)).status(status).validUntil(LocalDate.now().plusDays(10)).serviceRequest(request).build();
    }

    private WorkOrder order(String title, String description, WorkOrderStatus status, LocalDateTime scheduled, Customer customer, ServiceRequest request, User technician) {
        return WorkOrder.builder().title(title).description(description).status(status).scheduledDate(scheduled).customer(customer).serviceRequest(request).assignedUser(technician).build();
    }
}
