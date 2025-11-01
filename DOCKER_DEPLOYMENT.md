# Docker Deployment Guide

This guide explains how to deploy the GDGoC Certificate Generator using Docker Compose.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose V2 (comes with Docker Desktop or install separately)
- At least 2GB of free disk space
- Domain names configured (for production):
  - `sudo.certs-admin.certs.gdg-oncampus.dev` (Admin interface)
  - `certs.gdg-oncampus.dev` (Public validation)
  - `api.certs.gdg-oncampus.dev` (Backend API)

## Quick Start

### 1. Configure Environment Variables

Create environment files from examples:

```bash
# Root environment for Docker Compose
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env

# Edit .env with your configuration
nano .env

# Edit backend/.env with your configuration
nano backend/.env
```

**Important**: Update the following in `.env` (root directory):
- `POSTGRES_PASSWORD` - **Change this to a strong password for production**
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_DB` - Database name (default: gdgoc_certs)
- `DB_PASSWORD` - **Must match POSTGRES_PASSWORD**
- Frontend build arguments (`VITE_API_URL`, `VITE_ADMIN_HOSTNAME`, `VITE_PUBLIC_HOSTNAME`)

**Important**: Update the following in `backend/.env`:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Your Brevo SMTP credentials
- `SMTP_FROM` - Your sender email address
- `ALLOWED_ORIGINS` - Your frontend hostnames (comma-separated)
- `PUBLIC_HOSTNAME` - Your public validation hostname
- Database credentials (can also be set in root .env file)

**Security Note**: The database password is now configurable via environment variables. Always use a strong, unique password in production.

### 2. Build and Start Services

```bash
# Build all services
docker compose build

# Start all services in detached mode
docker compose up -d
```

### 3. Verify Deployment

Check that all services are running:

```bash
docker compose ps
```

Expected output:
```
NAME                IMAGE                  STATUS
gdgoc-db           postgres:16-alpine     Up (healthy)
gdgoc-backend      gdgoc-certs-backend    Up (healthy)
gdgoc-frontend     gdgoc-certs-frontend   Up (healthy)
```

Check service logs:

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

### 4. Access the Application

The services are now running on the internal Docker network (`gdgoc-net`):
- Frontend: `http://frontend:80`
- Backend API: `http://backend:3001`
- Database: `postgresql://postgres:postgres@db:5432/gdgoc_certs`

**Important**: 
- ⚠️ **No ports are exposed to the host** - this is by design for security
- All services are only accessible via the internal `gdgoc-net` Docker network
- You need to configure Nginx Proxy Manager to route external traffic to these services
- See [PORT_REFERENCE.md](PORT_REFERENCE.md) for detailed port configuration and how to expose ports if needed for development

## Architecture

### Services

1. **Database (db)**
   - Image: `postgres:16-alpine`
   - Port: 5432 (internal only)
   - Volume: `gdgoc-postgres-data` (persistent storage)
   - Initialized with `backend/src/db/schema.sql` on first run

2. **Backend (backend)**
   - Built from: `backend/Dockerfile`
   - Port: 3001 (internal only)
   - Depends on: database (waits for health check)
   - Environment: Production mode

3. **Frontend (frontend)**
   - Built from: `frontend/Dockerfile` (multi-stage)
   - Port: 80 (internal only)
   - Serves: Static React build via Nginx
   - Build args: `VITE_API_URL`, `VITE_ADMIN_HOSTNAME`, `VITE_PUBLIC_HOSTNAME`

### Network

All services communicate through a custom bridge network named `gdgoc-net`. This allows:
- Service discovery by name (e.g., `backend`, `db`, `frontend`)
- Isolation from other Docker networks
- No port exposure to host (security)

**Port Configuration**: By default, no ports are exposed to the host machine. Services are accessible only through the internal `gdgoc-net` network. For detailed information on:
- How to access services via Nginx Proxy Manager
- How to temporarily expose ports for development/testing
- Port mapping syntax and examples
- Security considerations

See the comprehensive [PORT_REFERENCE.md](PORT_REFERENCE.md) guide.

## Configuration

### Root Environment Variables (.env)

The root `.env` file contains Docker Compose configuration:

```env
# Frontend Build Arguments
VITE_API_URL=https://api.certs.gdg-oncampus.dev
VITE_ADMIN_HOSTNAME=sudo.certs-admin.certs.gdg-oncampus.dev
VITE_PUBLIC_HOSTNAME=certs.gdg-oncampus.dev

# PostgreSQL Database Configuration
POSTGRES_DB=gdgoc_certs
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_this_secure_password_in_production  # CHANGE THIS!

# Database connection for backend (should match PostgreSQL values)
DB_HOST=db
DB_PORT=5432
DB_NAME=gdgoc_certs
DB_USER=postgres
DB_PASSWORD=change_this_secure_password_in_production  # CHANGE THIS!
```

**Security Critical**: Always change `POSTGRES_PASSWORD` and `DB_PASSWORD` to a strong, unique password in production. These values should match.

### Backend Environment Variables

See `backend/.env.example` for all available options. Key variables:

- **Database**: Database credentials can be configured in root `.env` or `backend/.env`
- **Server**: `PORT`, `NODE_ENV`
- **CORS**: `ALLOWED_ORIGINS` (comma-separated list)
- **SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **Public**: `PUBLIC_HOSTNAME` (used in email links)

## Nginx Proxy Manager Setup

To expose the application to the internet, configure Nginx Proxy Manager:

### 1. Admin Interface

```
Domain Name: sudo.certs-admin.certs.gdg-oncampus.dev
Scheme: http
Forward Hostname/IP: frontend
Forward Port: 80
Access List: authentik (GDGoC-Admins group)
```

### 2. Public Validation

```
Domain Name: certs.gdg-oncampus.dev
Scheme: http
Forward Hostname/IP: frontend
Forward Port: 80
Access List: None
```

### 3. Backend API

```
Domain Name: api.certs.gdg-oncampus.dev
Scheme: http
Forward Hostname/IP: backend
Forward Port: 3001
Default Access List: None

Locations:
  - Path: /api/validate
    Access List: None (public)
  - Path: /
    Access List: authentik (protected)
```

**Important**: Make sure Nginx Proxy Manager is on the same Docker network (`gdgoc-net`) or can route to it.

**For detailed setup instructions**:
- [Authentik Setup Guide](documentation/authentik-setup.md) - Complete authentik configuration
- [Nginx Proxy Manager Setup Guide](documentation/nginx-proxy-manager-setup.md) - NPM configuration with authentik integration

## Management Commands

### Start/Stop Services

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: deletes database)
docker compose down -v
```

### View Logs

```bash
# All services (follow mode)
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100
```

### Rebuild Services

```bash
# Rebuild all services
docker compose build

# Rebuild specific service
docker compose build backend

# Rebuild and restart
docker compose up -d --build
```

### Database Management

```bash
# Access PostgreSQL shell
docker compose exec db psql -U postgres -d gdgoc_certs

# Backup database
docker compose exec db pg_dump -U postgres gdgoc_certs > backup.sql

# Restore database
docker compose exec -T db psql -U postgres -d gdgoc_certs < backup.sql

# Reset database (CAUTION: deletes all data)
docker compose down
docker volume rm gdgoc-postgres-data
docker compose up -d
```

### Service Health Checks

```bash
# Check service status
docker compose ps

# Check health of specific service
docker inspect gdgoc-backend | grep -A 10 Health
```

## Troubleshooting

### Service Won't Start

1. Check logs:
   ```bash
   docker compose logs service-name
   ```

2. Verify environment variables:
   ```bash
   docker compose config
   ```

3. Check if ports are already in use (if exposing ports)

### Database Connection Issues

1. Verify database is healthy:
   ```bash
   docker compose ps db
   ```

2. Check backend can reach database:
   ```bash
   docker compose exec backend ping db
   ```

3. Verify database credentials in `backend/.env`

### Frontend Not Loading

1. Check if build succeeded:
   ```bash
   docker compose logs frontend
   ```

2. Verify build arguments were passed correctly:
   ```bash
   docker compose config | grep -A 5 "build:"
   ```

3. Access frontend container and check files:
   ```bash
   docker compose exec frontend ls -la /usr/share/nginx/html
   ```

### Email Not Sending

1. Verify SMTP credentials in `backend/.env`
2. Check backend logs for email errors:
   ```bash
   docker compose logs backend | grep -i email
   ```
3. Test SMTP connection from backend container:
   ```bash
   docker compose exec backend node -e "require('./src/services/emailService.js')"
   ```

## Security Considerations

1. **Environment Files**: 
   - Never commit `.env` files to Git
   - Use strong database passwords in production
   - Keep SMTP credentials secure

2. **Network Isolation**:
   - Services are on isolated Docker network
   - No ports exposed to host by default
   - All external access via Nginx Proxy Manager

3. **Authentication**:
   - Admin interface protected by authentik
   - API endpoints protected (except validation)
   - CORS restricted to specific origins

4. **Updates**:
   - Regularly update Docker images
   - Monitor security advisories for dependencies
   - Keep Nginx and PostgreSQL updated

## Production Checklist

Before deploying to production:

- [ ] Update all environment variables with production values
- [ ] Configure SMTP with real Brevo credentials
- [ ] Set strong database password
- [ ] Configure proper domain names
- [ ] Set up SSL/TLS certificates in Nginx Proxy Manager
- [ ] Configure authentik with proper group permissions
- [ ] Test authentication flow end-to-end
- [ ] Test certificate generation and email delivery
- [ ] Test public validation page
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up monitoring and alerts
- [ ] Document disaster recovery procedures

## Scaling

### Horizontal Scaling

To scale backend instances:

```bash
docker compose up -d --scale backend=3
```

**Note**: You'll need a load balancer (like Nginx Proxy Manager or HAProxy) to distribute traffic.

### Resource Limits

Add resource constraints in `docker compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Backup Strategy

### Automated Backups

Create a backup script (`backup.sh`):

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T db pg_dump -U postgres gdgoc_certs > "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql"
```

Schedule with cron:
```
0 2 * * * /path/to/backup.sh
```

## Monitoring

### Health Endpoints

- Backend: `http://backend:3001/health`
- Frontend: `http://frontend:80/health`

### Docker Stats

```bash
# Real-time resource usage
docker stats

# Service-specific
docker stats gdgoc-backend gdgoc-frontend gdgoc-db
```

## Updates

### Update Application Code

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build
```

### Update Dependencies

```bash
# Update Docker images
docker compose pull

# Rebuild with latest dependencies
docker compose build --no-cache

# Restart services
docker compose up -d
```

## Support

For issues and questions:
1. Check logs: `docker compose logs`
2. Review this documentation
3. Check GitHub repository issues
4. Contact maintainers

## License

See LICENSE file in the repository root.
