CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(150),
    email VARCHAR(180) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    address VARCHAR(300) NOT NULL,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    customer_id BIGINT REFERENCES customers(id)
);

CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    requested_date DATE NOT NULL,
    address VARCHAR(300) NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(30) NOT NULL,
    valid_until DATE NOT NULL,
    service_request_id BIGINT NOT NULL UNIQUE REFERENCES service_requests(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_orders (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    scheduled_date TIMESTAMP,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    service_request_id BIGINT NOT NULL UNIQUE REFERENCES service_requests(id),
    assigned_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_assigned_user ON work_orders(assigned_user_id);

