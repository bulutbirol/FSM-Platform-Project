INSERT INTO customers (id, name, company, email, phone, address, notes, active, created_at) VALUES
    (1, 'Mert Yilmaz', 'Northstar Coffee', 'mert@northstar.demo', '+90 212 555 0101', 'Kadikoy, Istanbul', 'Prefers morning appointments.', TRUE, CURRENT_TIMESTAMP - INTERVAL '20 days'),
    (2, 'Selin Acar', 'Acar Dental Studio', 'selin@acar.demo', '+90 212 555 0102', 'Sisli, Istanbul', 'Call reception before arrival.', TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days'),
    (3, 'Can Demir', 'Demir Workshop', 'can@demir.demo', '+90 212 555 0103', 'Besiktas, Istanbul', NULL, TRUE, CURRENT_TIMESTAMP - INTERVAL '9 days');

INSERT INTO users (id, first_name, last_name, email, password, role, customer_id) VALUES
    (1, 'Aylin', 'Kaya', 'admin@serviceflow.demo', '$2a$10$9ujc8fAr9ByfI0FV32PDNemgTIGh9MtrgOG4AsSzY85DzSMQ1GcIO', 'ADMIN', NULL),
    (2, 'Emre', 'Tekin', 'technician@serviceflow.demo', '$2a$10$9ujc8fAr9ByfI0FV32PDNemgTIGh9MtrgOG4AsSzY85DzSMQ1GcIO', 'TECHNICIAN', NULL),
    (3, 'Mert', 'Yilmaz', 'customer@serviceflow.demo', '$2a$10$9ujc8fAr9ByfI0FV32PDNemgTIGh9MtrgOG4AsSzY85DzSMQ1GcIO', 'CUSTOMER', 1);

INSERT INTO service_requests (id, title, description, priority, status, requested_date, address, customer_id, created_at) VALUES
    (1, 'Espresso machine maintenance', 'Quarterly maintenance and pressure calibration for the main bar machine.', 'MEDIUM', 'SCHEDULED', CURRENT_DATE + 2, 'Kadikoy, Istanbul', 1, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (2, 'Air conditioning repair', 'The treatment room unit is making noise and cooling intermittently.', 'HIGH', 'QUOTED', CURRENT_DATE + 1, 'Sisli, Istanbul', 2, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (3, 'Electrical safety inspection', 'Inspect workshop distribution panel and label circuits.', 'LOW', 'NEW', CURRENT_DATE + 5, 'Besiktas, Istanbul', 3, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (4, 'Water filter replacement', 'Replace two under-counter filters and check for leaks.', 'MEDIUM', 'COMPLETED', CURRENT_DATE - 3, 'Kadikoy, Istanbul', 1, CURRENT_TIMESTAMP - INTERVAL '12 days');

INSERT INTO quotes (id, description, amount, status, valid_until, service_request_id, created_at) VALUES
    (1, 'Maintenance visit, calibration, and replacement seals.', 4250.00, 'APPROVED', CURRENT_DATE + 10, 1, CURRENT_TIMESTAMP - INTERVAL '6 days'),
    (2, 'Diagnostic visit and fan motor replacement if required.', 6800.00, 'SENT', CURRENT_DATE + 7, 2, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (3, 'Filter parts, installation, and leak test.', 1950.00, 'APPROVED', CURRENT_DATE + 3, 4, CURRENT_TIMESTAMP - INTERVAL '11 days');

INSERT INTO work_orders (id, title, description, status, scheduled_date, customer_id, service_request_id, assigned_user_id, created_at) VALUES
    (1, 'Maintain espresso machine', 'Complete quarterly service checklist and record pressure readings.', 'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '2 days', 1, 1, 2, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (2, 'Replace water filters', 'Replace filters and perform a ten-minute leak observation.', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '3 days', 1, 4, 2, CURRENT_TIMESTAMP - INTERVAL '10 days');

SELECT setval('customers_id_seq', 20, TRUE);
SELECT setval('users_id_seq', 20, TRUE);
SELECT setval('service_requests_id_seq', 20, TRUE);
SELECT setval('quotes_id_seq', 20, TRUE);
SELECT setval('work_orders_id_seq', 20, TRUE);
