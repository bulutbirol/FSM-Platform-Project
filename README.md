# ServiceFlow

ServiceFlow is a field service management system for small installation, maintenance, repair, cleaning, and technical service businesses. It follows a job from customer submission through admin approval, technician acceptance, appointment scheduling, and completion.

The project is a portfolio-sized full-stack application with separate Spring Boot and React applications, PostgreSQL persistence, JWT authentication, and a shared interactive demo.

## Features

- JWT login with admin, technician, and customer authorization
- Customer contact management, search, editing, and archiving
- Customer-owned service-request submission, filtering, details, and status tracking
- Admin approval queue and optional draft/send/approve quotation workflow
- Technician intake queue with self-assignment and appointment scheduling
- Role-aware work-order Kanban board
- Technician start and completion actions
- Dashboard metrics, recent work, and status chart backed by API data
- One-click demo role switching through normal authenticated accounts
- Admin-only shared demo data reset
- Responsive navigation, loading and empty states, validation feedback, confirmation prompts, and toast notifications
- Flyway schema and deterministic demo seed data
- Swagger/OpenAPI documentation

## Screenshots

Screenshots will be added after the first deployment.

- Landing page — placeholder
- Admin dashboard — placeholder
- Work-order Kanban board — placeholder
- Customer quotation approval — placeholder
- Mobile navigation — placeholder

## Technology stack

### Backend

- Java 21 and Spring Boot 3.3
- Maven, Spring Web, and Spring Security
- JWT with JJWT
- Spring Data JPA, Hibernate, PostgreSQL, and Flyway
- Bean Validation, Lombok, and Springdoc OpenAPI
- JUnit 5, Mockito, AssertJ, and Spring Security Test

### Frontend

- React 18 with JavaScript
- Vite 8 and Tailwind CSS 3
- React Router 7
- Axios and TanStack React Query
- React Hook Form
- Recharts and Lucide React
- Vitest, Testing Library, and Cypress

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml                         # Backend and frontend CI
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/serviceflow/
│   │   │   │   ├── config/               # Security and OpenAPI configuration
│   │   │   │   ├── controller/           # REST endpoints
│   │   │   │   ├── dto/                  # API request and response models
│   │   │   │   ├── entity/               # JPA entities and enums
│   │   │   │   ├── exception/            # API errors and global handling
│   │   │   │   ├── repository/           # Spring Data repositories
│   │   │   │   ├── security/             # JWT authentication
│   │   │   │   └── service/              # Business rules and workflows
│   │   │   └── resources/
│   │   │       ├── db/migration/
│   │   │       │   ├── schema/            # Production-safe database schema
│   │   │       │   └── demo/              # Local demo seed data
│   │   │       ├── application.yml
│   │   │       └── application-local.yml
│   │   └── test/java/com/serviceflow/     # Backend unit tests
│   └── pom.xml
├── frontend/
│   ├── cypress/e2e/                       # Browser workflow tests
│   ├── src/
│   │   ├── api/                           # Axios client and API helpers
│   │   ├── auth/                          # Authentication state
│   │   ├── components/                    # Shared UI and component tests
│   │   ├── pages/                         # Route-level screens
│   │   ├── test/                          # Vitest setup
│   │   ├── App.jsx                        # Routes and app composition
│   │   ├── main.jsx                       # React entry point
│   │   └── styles.css                     # Tailwind and global styles
│   ├── cypress.config.js
│   ├── package.json
│   └── vite.config.js
├── docs/superpowers/
│   ├── plans/                             # Implementation plan
│   └── specs/                             # Approved product design
├── .env.example                           # Docker environment template
├── .gitignore
├── docker-compose.yml                     # PostgreSQL service
└── README.md
```

Generated folders such as `backend/target`, `frontend/node_modules`,
`frontend/dist`, Cypress artifacts, local environment files, and logs are kept
out of version control through the root `.gitignore`.

## Requirements

- Java 21
- Maven 3.9 or newer
- Node.js 20.19 or newer
- npm 10 or newer
- Docker with Docker Compose

## Local setup

1. Clone the repository and open its root directory.
2. Copy the root environment example if you want to change the PostgreSQL defaults.

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL.

   ```bash
   docker compose up -d postgres
   ```

4. Start the backend in a second terminal.

   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

5. Install and start the frontend in a third terminal.

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173).

The `local` profile matches the Docker Compose PostgreSQL settings, enables the demo reset endpoint, and applies both schema and demo seed migrations. Without that profile, demo reset and seed data are disabled and `JWT_SECRET` is required.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_DB` | `serviceflow` | Docker PostgreSQL database |
| `POSTGRES_USER` | `serviceflow` | Docker PostgreSQL user |
| `POSTGRES_PASSWORD` | `serviceflow` | Docker PostgreSQL password |
| `POSTGRES_PORT` | `5432` | Exposed PostgreSQL port |
| `DB_URL` | `jdbc:postgresql://localhost:5432/serviceflow` | Backend JDBC URL |
| `DB_USERNAME` | `serviceflow` | Backend database user |
| `DB_PASSWORD` | `serviceflow` | Backend database password |
| `JWT_SECRET` | Local development value | Base64-encoded JWT signing secret |
| `JWT_EXPIRATION_MS` | `28800000` | JWT lifetime in milliseconds |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `SERVER_PORT` | `8080` | Backend HTTP port |
| `VITE_API_URL` | `http://localhost:8080/api` | Frontend API base URL |

Use a new strong Base64-encoded `JWT_SECRET` outside local development. Do not reuse the development database credentials or secret in a deployed environment.

## Demo accounts

All three accounts use the password `password`.

| Role | Email |
| --- | --- |
| Admin | `admin@serviceflow.demo` |
| Technician | `technician@serviceflow.demo` |
| Customer | `customer@serviceflow.demo` |

The landing-page **Try Demo** button signs in as the demo admin. The authenticated header can switch roles by logging into the matching account, so backend authorization remains active. The admin can restore the original records with **Reset Demo Data**.

## API documentation

With the backend running, Swagger UI is available at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html). The OpenAPI JSON is available at `http://localhost:8080/v3/api-docs`.

## Tests and builds

Run backend tests:

```bash
cd backend
mvn test
```

Run frontend component tests and create the production build:

```bash
cd frontend
npm test -- --run
npm run build
```

Run the Cypress demo workflow after PostgreSQL, the backend, and the frontend are running:

```bash
cd frontend
npm run e2e:run
```

## Main demo path

1. Select **Try Demo** and review the admin dashboard.
2. Switch to the Customer demo and submit a new service request.
3. Return to the Admin demo, open the new request, and select **Approve for technicians**.
4. Switch to the Technician demo and open the request from **Request queue**.
5. Confirm an appointment date/time and select **Accept and schedule**.
6. Open the scheduled work order at appointment time, then select **Start work** and **Complete work**.
7. Return to the Admin dashboard to see the updated totals.

The seeded Customer demo account belongs to Northstar Coffee. Customer ownership is derived from the authenticated account, so the customer cannot submit a request for another customer. Quotations remain available as an optional commercial workflow when a price approval is required.

## Known limitations

- Demo data is shared and may need to be reset.
- Public registration and email verification are not implemented.
- Refresh tokens are not implemented.
- Real-time notifications are not implemented.
- File attachments are not implemented.
- Customer accounts are linked manually to customer records.
- The demo reset is intended for a shared portfolio environment, not production data recovery.

## Planned improvements

- Add service notes and completion summaries to work orders.
- Add customer and technician availability filters.
- Add printable quotation and work-order views.
- Add PostgreSQL integration tests with Testcontainers.
- Add screenshot assets and improve accessibility testing.

## Future deployment

Deployment is intentionally not configured yet. A future deployment can package the Spring Boot API and React build separately, use a managed PostgreSQL database, and provide secrets through the hosting platform. The `local` profile must not be enabled in production. CORS, the API base URL, database credentials, and JWT secret must be set for the deployed addresses.
