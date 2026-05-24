# Global AIESEC News Platform — Backend

Spring Boot API for the Global AIESEC News Platform MVP. Serves a moderated
news feed where MCPs publish entity updates and members read, like, and comment.

## Stack

- **Java 21**, Spring Boot 3.3
- **Postgres** (Neon) via Spring Data JPA + Flyway migrations
- **Deployment**: Docker → Render
- **Frontend** (separate repo): React + Vite → Firebase Hosting (`aiesec-news.web.app`)

## Authentication model

Two ways in, one token type:

| User      | Login method                              | Token issued |
|-----------|--------------------------------------------|--------------|
| MCP       | AIESEC OAuth 2.0 (EXPA login)              | our JWT      |
| Member    | AIESEC OAuth 2.0 (EXPA login)              | our JWT      |
| Admin     | Separate email + password (NOT OAuth)      | our JWT      |

After AIESEC OAuth, the backend calls the GIS GraphQL API's `currentPerson`
query to detect whether the user is an MCP or a Member (based on their
`current_positions` → office type). AIESEC passwords are never stored.

## Environments

Develop against AIESEC **staging**, deploy against **production** — selected
by Spring profile:

| | Staging (local dev) | Production (Render) |
|---|---|---|
| Profile | `staging` | `prod` |
| Auth server | `auth-staging.aiesec.org` | `auth.aiesec.org` |
| GraphQL API | `staging-jruby.aiesec.org/graphql` | `gis-api.aiesec.org/graphql` |

## Local setup

1. Install JDK 21 and Maven.
2. `cp .env.example .env` and fill in real values (Neon credentials, AIESEC
   staging app credentials, a generated `APP_JWT_SECRET`).
3. Export the variables (e.g. `set -a; source .env; set +a`) or use an
   IDE env-file plugin.
4. Run: `mvn spring-boot:run`
5. Check: `GET http://localhost:8080/health` → `{"status":"UP",...}`

Flyway applies the schema (`V1__initial_schema.sql`) automatically on startup.

## Project layout

```
src/main/java/org/aiesec/news/
  config/      Spring config — properties, beans, security, CORS
  controller/  REST endpoints
  domain/      JPA entities + enums
  dto/         request/response payloads
  repository/  Spring Data repositories
  service/     business logic (posting rules, OAuth, moderation)
  security/    JWT filter + helpers
  exception/   error handling
src/main/resources/
  application*.yml      base + per-profile config
  db/migration/         Flyway SQL migrations
```

## Deployment (Render)

- Build via the included `Dockerfile`.
- Set all env vars from `.env.example` in the Render dashboard, with
  `SPRING_PROFILES_ACTIVE=prod` and the **production** AIESEC credentials.
- Point an uptime pinger at `/health` every ~10 min to keep the free-tier
  service (and the Neon DB) warm.
