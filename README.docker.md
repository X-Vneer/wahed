# Docker Setup Guide

This guide explains how to run the Internal System application using Docker.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM

## Quick Start

### Production Mode

1. **Create environment file** (REQUIRED):

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file and set the required variables**:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A secure random string for JWT token signing (generate with: `openssl rand -base64 32`)

3. **Build and start services**:

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**:

   ```bash
   docker-compose exec app pnpm db:migrate:deploy
   ```

5. **Seed the database** (optional):

   ```bash
   docker-compose exec app pnpm db:seed
   ```

6. **Access the application**:
   - Application: http://localhost:3000
   - Database: localhost:5432

### Development Mode

1. **Start development environment**:

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Run database migrations**:

   ```bash
   docker-compose -f docker-compose.dev.yml exec app pnpm db:migrate
   ```

3. **Access the application**:
   - Application: http://localhost:3000 (with hot reload)

## Available Commands

### Production

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Execute commands in app container
docker-compose exec app pnpm <command>

# Rebuild after code changes
docker-compose up -d --build
```

### Development

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Stop development services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f app
```

## Database Management

### Run Prisma Studio

```bash
docker-compose exec app pnpm db:studio
```

### Access PostgreSQL directly

```bash
docker-compose exec postgres psql -U postgres -d internal_system
```

### Backup database

```bash
docker-compose exec postgres pg_dump -U postgres internal_system > backup.sql
```

### Restore database

```bash
docker-compose exec -T postgres psql -U postgres internal_system < backup.sql
```

## Environment Variables

### Required Variables

You **MUST** set these two environment variables in your `.env` file:

1. **`DATABASE_URL`** - PostgreSQL connection string

   ```env
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/internal_system?schema=public
   ```

   - For Docker: Use `postgres` as the hostname (service name)
   - For local development: Use `localhost` as the hostname

2. **`JWT_SECRET`** - Secret key for JWT token signing

   ```env
   JWT_SECRET=your-secure-random-string-minimum-32-characters
   ```

   - Generate a secure secret: `openssl rand -base64 32`
   - **Never commit this to version control!**

### Optional Variables

These have defaults but can be customized:

- `POSTGRES_USER`: PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD`: PostgreSQL password (default: postgres)
- `POSTGRES_DB`: Database name (default: internal_system)
- `POSTGRES_PORT`: PostgreSQL port (default: 5432)
- `APP_PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment mode (production/development)

**Note:** If `DATABASE_URL` is set, the individual `POSTGRES_*` variables are ignored.

### Example `.env` file:

```env
# REQUIRED
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/internal_system?schema=public
JWT_SECRET=your-very-secure-random-secret-key-min-32-characters

# OPTIONAL
APP_PORT=3000
NODE_ENV=production
```

## Troubleshooting

### Port already in use

If port 3000 or 5432 is already in use, change them in `.env`:

```
APP_PORT=3001
POSTGRES_PORT=5433
```

### Database connection issues

1. Ensure the postgres service is healthy:

   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Application won't start

1. Check application logs:

   ```bash
   docker-compose logs app
   ```

2. Rebuild the image:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Reset everything

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Production Deployment

For production deployment:

1. Use strong passwords in `.env`
2. Set `NODE_ENV=production`
3. Configure proper database credentials
4. Use Docker secrets or environment variable management
5. Set up reverse proxy (nginx/traefik) for SSL termination
6. Configure proper backup strategy for PostgreSQL volumes
