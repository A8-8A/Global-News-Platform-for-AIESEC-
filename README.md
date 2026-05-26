# Global AIESEC News Platform

A centralized news platform for AIESEC. Member Committee Presidents (MCPs)
publish entity updates; members read, like, and comment; admins moderate the
content. Built as an MVP.

This is a **monorepo** with two independently-deployed applications:

```
Global-AIESEC-News-Platform/
├── backend/    Spring Boot REST API   → deployed to Render
└── frontend/   React + Vite SPA       → deployed to Firebase Hosting
```

Each subfolder has its own README with full detail. This file is the overview.

## Architecture
 
```
   Browser
      │
      ▼
  frontend  (React + Vite, Firebase Hosting — aiesec-news.web.app)
      │  REST + JWT
      ▼
  backend   (Spring Boot, Render)
      │                         │
      ▼                         ▼
  Postgres (Neon)          AIESEC GIS
                           · OAuth token exchange
                           · currentPerson (role detection)
```

## Authentication

Two ways in, one token type — the backend always issues its own JWT:

| User   | Login method                          |
|--------|----------------------------------------|
| MCP    | AIESEC OAuth 2.0 (EXPA login)          |
| Member | AIESEC OAuth 2.0 (EXPA login)          |
| Admin  | Separate email + password (not OAuth)  |

After AIESEC OAuth, the backend calls the GIS `currentPerson` query to
detect whether the user is an MCP or a Member. AIESEC passwords are never
stored.

## Core rules

- **Posting** — only MCPs can post. Up to 2 posts per rolling 7-day window
  publish immediately; further posts go to an admin approval queue.
- **Feed** — shows approved posts only, newest first.
- **Engagement** — any AIESEC user can like and comment.
- **Moderation** — admins approve/reject queued posts and can remove content;
  every admin action is logged.

## Running locally

The two halves run independently. Full instructions are in each subfolder's
README; in brief:

**Backend** (`backend/`)
```bash
cp .env.example .env      # fill in Neon + AIESEC + JWT values
mvn spring-boot:run       # starts on :8080
```

**Frontend** (`frontend/`)
```bash
cp .env.example .env      # fill in API URL + AIESEC client id
npm install
npm run dev               # starts on :5173
```

Start the backend first, then the frontend.

## Deployment

- **Frontend** → Firebase Hosting (`aiesec-news.web.app` for testing; the
  AIESEC domain later).
- **Backend** → Render, built from `backend/Dockerfile`. Set the Render
  service's root directory to `backend/`.

Both free tiers sleep when idle — keep a `/health` pinger running so demos
don't hit a cold start.

## Environments

Develop against AIESEC **staging**, deploy against **production** — selected
by the backend's Spring profile (`staging` / `prod`). Never commit a real
`.env`; secrets live in `.env` (git-ignored) locally and in the Render
dashboard in production.
