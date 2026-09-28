# Public demo deployment

This guide hosts the full application without a developer PC. It uses free hobby tiers and requires no payment card. Free services have no uptime guarantee.

## 1. Neon PostgreSQL

Create a free PostgreSQL project named `serviceflow-public-demo` near the Render region. Keep the database name, host, user, and password in Neon; never commit the connection string. Use a pooled host if Neon offers one. The JDBC URL must have this form:

```text
jdbc:postgresql://HOST/DATABASE?sslmode=require
```

The `demo` Spring profile applies both schema and seed migrations to a fresh database. It also lets idle JDBC connections close so the database can scale to zero between visits. Use this database only for fictional shared demo data.

## 2. Render API

Create one Free Web Service from this repository with these settings:

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Runtime | Docker |
| Dockerfile | `./Dockerfile` |
| Health check path | `/actuator/health` |
| Region | Close to the Neon database |

Set these environment variables in Render, using the real private values from Neon:

| Variable | Value |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `demo` |
| `SERVER_PORT` | `10000` |
| `DB_URL` | `jdbc:postgresql://HOST/DATABASE?sslmode=require` |
| `DB_USERNAME` | Neon database user |
| `DB_PASSWORD` | Neon database password |
| `JWT_SECRET` | New, random Base64 string made from at least 32 bytes |
| `CORS_ORIGIN` | The final Vercel origin, such as `https://serviceflow.vercel.app` |
| `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=50 -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC` |

The live API is `https://serviceflow-birol-api.onrender.com`; its health endpoint is `https://serviceflow-birol-api.onrender.com/actuator/health`. The live frontend origin for `CORS_ORIGIN` is `https://serviceflow-web-ten.vercel.app`.

Generate the JWT secret locally with PowerShell, then paste it directly into Render:

```powershell
$jwtBytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwtBytes)
[Convert]::ToBase64String($jwtBytes)
```

Render's **Generate** button may produce a 32-character hexadecimal value. That decodes to only 24 bytes when treated as Base64 and causes HTTP 500 on successful login because JJWT requires at least 32 decoded bytes. Use the Base64 command above and verify a real demo login after deployment.

Do not reuse the `local` profile or its default JWT secret. The `demo` profile keeps the public `/actuator/health` check independent of the database, so the external monitor does not keep Neon's metered compute awake. Confirm `https://RENDER-HOST/actuator/health` returns `{"status":"UP"}`.

## 3. Vercel frontend

Deploy the existing Vite app from `frontend/` on Vercel Hobby. If the Vercel GitHub app does not have access to this repository, deploy from the CLI without granting it broader GitHub access:

```powershell
cd frontend
npx --yes vercel@latest login
npx --yes vercel@latest link --yes --project serviceflow-web --scope birols-projects-a05748f6
npx --yes vercel@latest env add VITE_API_URL production --value https://RENDER-HOST/api --no-sensitive --yes
npx --yes vercel@latest deploy --prod --yes
```

The CLI detects Vite and builds `dist`. Note the stable production alias from its output, then set Render's `CORS_ORIGIN` to that exact origin. The existing `frontend/vercel.json` handles React route refreshes. A CLI-only project does not automatically redeploy after a Git push; run the production deploy command again when the frontend changes. The generated `.vercel/` and `.env.local` files stay local.

## 4. UptimeRobot

Create one free HTTP monitor for `https://RENDER-HOST/actuator/health` with a five-minute interval. Check that the first monitor response is successful and email alerts go to the owner. Do not use `/robots.txt`: Render may answer that path without waking a sleeping service.

The external checks normally prevent Render's 15-minute idle spin-down. They do not prevent platform maintenance or restarts. Render grants 750 free instance hours monthly; a single continuously running service consumes 744 hours in a 31-day month. Watch the Render usage page, especially if the workspace contains another free web service. Neon's free database can pause its own compute between real user requests.

The live five-minute HTTP monitor is in the owner's UptimeRobot dashboard at `https://dashboard.uptimerobot.com/monitors/804115066`.

## 5. Public check

Open the Vercel site in a private browser. Switch between the seeded admin, customer, and technician demo accounts. Create and process a fictional service request, then reset the shared demo. Check the Render health URL and UptimeRobot status. Add the verified frontend URL and source repository link to the CV.
