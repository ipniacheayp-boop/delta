# Delta-like Airline Backend (Original Branding Required)

This repository contains a starting backend for an enterprise-grade airline booking platform. It is intentionally generic and does not copy any real airline branding.

Quick start:

1. Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate` (or `prisma db push` in early dev)
5. Seed: `npm run seed`
6. Start dev server: `npm run dev`

Deployment (docker-compose)
1. Copy `.env.production.example` to `.env` and fill values.
2. Build and run with Docker Compose:

```bash
docker-compose up --build -d
```

This will start a Postgres database, the backend on port `4000`, and the frontend on `3000`.

Notes:
- Ensure `JWT_SECRET` and `DATABASE_URL` are set properly for production.
- Review security, monitoring, backups, and SSL configuration before exposing to public.
