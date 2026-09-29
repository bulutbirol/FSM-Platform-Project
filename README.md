# ServiceFlow

ServiceFlow is a field service project I built to practice working on both the frontend and backend. The idea is simple: a customer sends a service request, an admin reviews it, and a technician takes the job through to completion.

**[Try the live demo](https://serviceflow-web-ten.vercel.app/)**

## What you can do

- Create and follow service requests
- Review requests as an admin
- Schedule and complete jobs as a technician
- Try the different roles with the demo accounts

The demo uses sample data, so you can explore it without creating an account.

## Tech I used

- React and Tailwind CSS for the frontend
- Java and Spring Boot for the API
- PostgreSQL for storing the data
- JWT for login

## Running it locally

You will need Java, Maven, Node.js, and Docker. Start PostgreSQL from the project folder:

```bash
docker compose up -d postgres
```

Then start the backend from `backend/`:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Finally, start the frontend from `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. I'm still improving the project, but the main demo flow is ready to try.
