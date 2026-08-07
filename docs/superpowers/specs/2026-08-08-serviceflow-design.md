# ServiceFlow MVP Design

## Goal

ServiceFlow is a junior-level field service management portfolio application. It demonstrates one complete business workflow: a customer request becomes a quotation, an approved quotation becomes an assigned work order, and a technician completes the work. The application is designed for a quick local demo and uses shared seed data that an administrator can reset.

## Approaches Considered

### 1. Layered Spring Boot API and React SPA

This approach uses one Spring Boot application, one React application, and PostgreSQL. It is the recommended approach because it maps directly to the requested stack, keeps deployment boundaries easy to explain, and makes authorization rules visible without introducing architecture that a junior project does not need.

### 2. Feature-oriented modular monolith

This would group backend code by business feature and give each feature its own controller, service, repository, and DTO packages. It can scale well, but adds navigation and package ceremony that does not improve this MVP enough to justify the cost.

### 3. Server-rendered Spring application

This would reduce client-side state and simplify authentication, but conflicts with the requested React and Vite frontend and would be less representative of a separate frontend/backend portfolio project.

## Architecture

The repository contains `backend`, `frontend`, Docker Compose, shared environment examples, a GitHub Actions workflow, and documentation. The backend follows controller, service, repository, entity, dto, security, exception, and config layers. Controllers perform HTTP mapping and delegate to services. Services own authorization-aware business rules and transactions. Repositories use Spring Data JPA. Flyway owns the PostgreSQL schema.

The React SPA uses route-level pages, reusable layout and form components, a small authentication context, Axios for HTTP, and TanStack Query for server state. Tailwind provides the visual system. Forms use React Hook Form. Recharts renders the dashboard status chart.

## Authentication and Authorization

There is no public registration. Three seeded users represent ADMIN, TECHNICIAN, and CUSTOMER. Login returns a short-lived JWT and a safe user object. The token is stored in local storage for this demonstrator and attached to API requests. `/api/auth/me` restores the active session.

Spring Security enforces role access at the endpoint level. Services additionally enforce ownership for customer-visible requests and quotations and assignment for technician work orders. Unauthorized and forbidden responses use the same JSON error shape as validation and business errors.

The demo role switcher submits the selected demo account credentials through the normal login endpoint. It does not bypass security. Demo reset is restricted to ADMIN and restores only known demo records.

## Data Model

`User` stores identity, password hash, and role. A CUSTOMER user may reference one `Customer` record, which provides an explicit ownership link.

`Customer` stores contact details, notes, creation time, and an `active` flag. Deletion is implemented as archiving so workflow history remains valid.

`ServiceRequest` belongs to a customer and stores title, description, priority, status, requested date, service address, and creation time.

`Quote` belongs to a service request and stores description, decimal amount, status, validity date, and creation time. A request has at most one quotation in this MVP.

`WorkOrder` belongs to a customer and service request, may be assigned to a technician user, and stores its schedule and status. A request has at most one work order.

Foreign keys preserve historical data. Business deletes are avoided except during the controlled demo reset operation.

## Workflow Rules

An ADMIN creates customers and requests. Creating a draft quote marks the request QUOTED when the quote is sent. A CUSTOMER may approve or reject only a SENT quote belonging to their linked customer. Approval marks both the quote and request APPROVED. An ADMIN can then create a work order, optionally assign a technician, and schedule it. The request becomes SCHEDULED. A TECHNICIAN can view assigned work and move it from SCHEDULED to IN_PROGRESS and then COMPLETED. Completing it also completes the request.

The API rejects invalid transitions with HTTP 409 and a readable error. DTO validation rejects malformed input with HTTP 400. Missing resources return HTTP 404.

## API Surface

The API exposes authentication, customers, service requests, quotations, work orders, dashboard, users/technicians, and demo reset endpoints under `/api`. List endpoints accept the small set of search and status filters required by the UI. Swagger UI is available at `/swagger-ui.html`.

DTOs are used for all request and response bodies. Passwords and entity internals are never serialized.

## Frontend Experience

The visual direction is a refined operations console: ink-navy navigation, mineral-blue actions, warm neutral surfaces, compact data presentation, and a single saffron accent for priority and attention. The landing page introduces the request-to-completion workflow and has prominent Try Demo and Sign In actions. Authenticated pages share a responsive sidebar and a mobile navigation drawer.

The dashboard contains real metrics, a status chart, recent work, and a workflow summary. Customers, requests, and quotations use responsive tables that become stacked records on small screens. Work orders use a Kanban board with distinct operational columns. Forms have visible labels and inline validation. Loading skeletons, empty states, alert banners, confirmation dialogs, and toast feedback are shared components.

Role-aware navigation hides unavailable actions but never replaces backend authorization. The demo toolbar stays visible in authenticated demo sessions and allows one-click role switching. Only the admin sees Reset Demo Data.

## Error Handling

The backend returns a consistent body containing timestamp, status, error, message, path, and optional field errors. The frontend maps field errors into forms and shows other failures as alerts or toasts. Axios handles expired or invalid authentication by clearing the session and returning to login.

## Testing

Backend tests cover authentication, quotation approval, work-order status changes, dashboard calculations, and important service validation. Service tests use JUnit 5 and Mockito. A Spring Security integration test verifies authentication behavior.

Frontend tests use Vitest and Testing Library for role-aware navigation, empty states, and work-order presentation. Cypress covers the seeded demo workflow when PostgreSQL, backend, and frontend are running. The GitHub Actions workflow runs backend tests, frontend tests, and the production frontend build.

## Local Verification

Docker Compose starts PostgreSQL. Flyway migrations create the schema and seed deterministic demo data. Verification includes Maven tests, frontend tests and build, backend startup and health/API checks, frontend startup, demo logins, and the request-to-completion workflow. Browser console and responsive layouts are checked before completion.

## Scope Boundaries

The MVP has shared demo data, no email verification, no refresh tokens, no real-time notifications, no file attachments, and no deployment configuration. It does not implement public registration, multiple organizations, payments, or notification delivery.
