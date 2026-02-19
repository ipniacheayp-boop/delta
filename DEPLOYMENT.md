# Delta Backend - Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- A domain name (for production HTTPS)

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/delta_db
PORT=4000
JWT_SECRET=your_very_secure_random_secret_min_32_chars
CORS_ORIGIN=https://your-production-domain.com
NODE_ENV=production
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 3. Verify Deployment

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/health

## Production Deployment Options

### Option A: Docker Compose (Recommended for simple deployments)

```bash
# Build
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option B: Cloud Platforms

#### Render.com

1. Connect your GitHub repository
2. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `CORS_ORIGIN`: Your frontend URL
3. Use the following build command:
   ```bash
   npm run build
   ```
4. Start command:
   - Backend: `node dist/server.js`
   - Frontend: Build with Next.js output

#### Railway

1. Connect GitHub repository
2. Add PostgreSQL database service
3. Configure environment variables
4. Deploy both frontend and backend services

#### AWS ECS / Google Cloud Run

1. Push images to container registry:
   ```bash
   docker-compose build
   docker tag delta-backend_backend:latest your-registry/delta-backend_backend:latest
   docker push your-registry/delta-backend_backend:latest
   ```
2. Deploy using your cloud platform's UI or CLI

## Database Migrations

For production, you need to run migrations. Add a migration script or run manually:

```bash
# Run migrations (inside container)
docker-compose exec backend npm run prisma:migrate
```

Or build the migration SQL and run it directly on your database.

## Security Checklist

- [ ] Set a strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure `CORS_ORIGIN` to your actual domain
- [ ] Use HTTPS in production
- [ ] Keep Docker images updated
- [ ] Monitor logs in production
- [ ] Set up database backups
- [ ] Configure proper firewall rules

## Troubleshooting

### Container won't start

```bash
docker-compose logs backend
docker-compose logs frontend
```

### Database connection issues

```bash
docker-compose exec db pg_isready
docker-compose logs db
```

### Rebuild after changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
