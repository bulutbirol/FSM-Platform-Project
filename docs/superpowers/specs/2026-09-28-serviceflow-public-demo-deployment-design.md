# ServiceFlow public demo deployment

## Goal

Make the full Java and React ServiceFlow demo reachable when the developer's PC is off, without a payment card or monthly charge. Keep the API from routinely sleeping between portfolio visits. This is a hobby demo, so the free providers do not promise uninterrupted service.

## Architecture

- Render Free runs the existing Spring Boot Docker image from `backend/` on port 10000. A dedicated `demo` profile applies schema and demo seed migrations but still requires an externally supplied JWT signing secret.
- Neon Free stores the PostgreSQL demo database. The public health endpoint omits the database check and idle JDBC connections close, so repeated uptime requests do not exhaust Neon's free compute allowance.
- Vercel Hobby serves the existing Vite frontend from `frontend/`, with `VITE_API_URL` pointing to the Render API.
- UptimeRobot Free requests the Render `/actuator/health` endpoint every five minutes. Render sleeps after fifteen minutes without inbound traffic, so this normally prevents idle sleep.

## Data and access

The seeded users and records are fictional. The admin demo login can reset the shared dataset. No personal or production data belongs in this database. The Render environment holds unique database credentials and a strong JWT secret; these values are never committed to Git.

## Verification

Run backend and frontend tests and builds, confirm the demo profile starts with a fresh PostgreSQL database, test the public health endpoint and role flows, and verify that the monitor is reporting successful checks. Add the live and source links to the CV after the public URL is stable.

## Limits

Render Free has 750 instance hours per month. A continuously running single service uses up to 744 hours in a 31-day month, leaving little margin. Render may restart a free service, and an interrupted monitor could let it sleep. Neon may scale its database compute to zero between real user requests. The deployment is an always-reachable portfolio demo, not a guaranteed 24/7 production service.
