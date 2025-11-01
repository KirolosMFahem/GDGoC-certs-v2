# Quick Start Guide - Docker Deployment

This guide helps you get started with the GDGoC Certificate Generator using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- 2GB free disk space

## Step-by-Step Setup

### 1. Prepare Environment

```bash
# Create root environment file
cp .env.example .env

# Create backend environment file
cp backend/.env.example backend/.env

# Edit root .env with your settings
nano .env

# Edit backend .env with your settings
nano backend/.env
```

**Required settings to update in `.env` (root):**
- **POSTGRES_PASSWORD** - Change to a strong password
- **DB_PASSWORD** - Must match POSTGRES_PASSWORD
- VITE_API_URL, VITE_ADMIN_HOSTNAME, VITE_PUBLIC_HOSTNAME (your domains)

**Required settings to update in `backend/.env`:**
- SMTP credentials (Brevo)
- ALLOWED_ORIGINS (your domain names)
- PUBLIC_HOSTNAME (your public domain)

### 2. Start Services

**Option A: Using the deployment script (recommended)**
```bash
./deploy.sh up
```

**Option B: Using Docker Compose directly**
```bash
docker compose up -d
```

### 3. Check Status

```bash
# Using script
./deploy.sh status

# Or directly
docker compose ps
```

All services should show status "Up (healthy)".

### 4. View Logs

```bash
# All services
./deploy.sh logs

# Specific service
./deploy.sh logs backend
```

## Service URLs

After deployment, services are available on the internal network:

- Frontend: `http://frontend:80`
- Backend API: `http://backend:3001`
- Database: `postgresql://postgres:postgres@db:5432/gdgoc_certs`

**Important**: 
- ⚠️ **No ports are exposed to the host** - this is intentional for security
- Services are only accessible through the internal `gdgoc-net` Docker network
- Configure Nginx Proxy Manager to expose services externally
- See [PORT_REFERENCE.md](PORT_REFERENCE.md) for detailed port configuration

**Note:** Configure Nginx Proxy Manager to expose these services externally.

## Common Commands

```bash
# Stop services
./deploy.sh stop

# Restart services
./deploy.sh restart

# View logs
./deploy.sh logs

# Create database backup
./deploy.sh backup

# Open backend shell
./deploy.sh shell backend

# Open database shell
./deploy.sh db
```

## Troubleshooting

### Services won't start
```bash
# Check logs
./deploy.sh logs

# Check specific service
docker compose logs backend
```

### Database issues
```bash
# Check database health
docker compose ps db

# Access database
./deploy.sh db
```

### Rebuild after code changes
```bash
./deploy.sh rebuild
```

## Next Steps

1. Configure Nginx Proxy Manager (see DOCKER_DEPLOYMENT.md)
2. Set up authentik for authentication
3. Test certificate generation
4. Set up database backups (cron job)

## More Help

See `DOCKER_DEPLOYMENT.md` for complete documentation.
