# ServiceFlow MVP Implementation Plan

## 1. Repository foundation

- Add Java 21 Spring Boot Maven project metadata and runtime configuration.
- Add React JavaScript Vite project metadata, Tailwind, linting, Vitest, and Cypress configuration.
- Add PostgreSQL Docker Compose, environment templates, ignore rules, and CI workflow.

## 2. Backend schema and domain

- Write service behavior tests for authentication, quotation decisions, and work-order transitions.
- Add Flyway schema and deterministic demo seed migrations.
- Add enums and JPA entities for users, customers, service requests, quotations, and work orders.
- Add focused Spring Data repositories.

## 3. Backend API

- Implement JWT authentication, password hashing, current-user lookup, and role authorization.
- Implement customer archive/search/detail operations.
- Implement service-request create/edit/filter/status operations.
- Implement quotation create/edit/send/approve/reject operations.
- Implement work-order create/assign/filter/status operations.
- Implement technician listing, dashboard aggregation, and admin-only demo reset.
- Add DTO validation, centralized JSON errors, CORS, and OpenAPI configuration.

## 4. Frontend foundation

- Write component tests for role navigation, empty states, and work-order columns.
- Build the Axios client, React Query provider, authentication context, and protected routing.
- Build the refined operations-console design system and responsive application shell.
- Add toast, dialog, loading, error, form, table, and empty-state primitives.

## 5. Frontend pages

- Build landing, login, dashboard, customers, requests, quotations, work-order board/detail, profile, and not-found pages.
- Connect every page and mutation to real backend APIs.
- Add role-aware actions and the persistent demo role switcher/reset control.

## 6. Demonstration and documentation

- Add a Cypress main-workflow specification.
- Replace the starter README with setup, accounts, tests, limitations, screenshots placeholders, and future deployment notes.
- Verify backend tests where the Java/Maven environment permits.
- Run frontend tests and production build.
- Start available services and exercise login and workflow endpoints where Docker and Java 21 permit.
- Inspect primary pages at desktop and mobile sizes and fix blocking issues.
