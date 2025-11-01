# Port Configuration Reference

This document explains the port configuration for the GDGoC Certificate Generator Docker deployment.

## Default Configuration (Recommended)

**No ports are exposed to the host machine.** All services communicate through the internal Docker network `gdgoc-net`.

### Service Ports (Internal Only)

| Service | Internal Port | Purpose | Access Method |
|---------|---------------|---------|---------------|
| **db** | 5432 | PostgreSQL database | Via `gdgoc-net` network |
| **backend** | 3001 | Express API | Via `gdgoc-net` network |
| **frontend** | 80 | Nginx serving React SPA | Via `gdgoc-net` network |

### Why Ports Are Not Exposed

1. **Security**: No direct access from host prevents unauthorized connections
2. **Network Isolation**: Services are isolated from other Docker networks
3. **Nginx Proxy Manager**: All external access is controlled through NPM with authentik authentication
4. **Production Ready**: This configuration matches the production architecture

## Nginx Proxy Manager Configuration

Nginx Proxy Manager (NPM) should be on the same Docker network (`gdgoc-net`) or able to route to it. Configure NPM to forward traffic as follows:

### Admin Interface
```
Domain: sudo.certs-admin.certs.gdg-oncampus.dev
Scheme: http
Forward Hostname/IP: frontend
Forward Port: 80
Access List: authentik (GDGoC-Admins group)
```

### Public Validation Page
```
Domain: certs.gdg-oncampus.dev
Scheme: http
Forward Hostname/IP: frontend
Forward Port: 80
Access List: None (public)
```

### Backend API
```
Domain: api.certs.gdg-oncampus.dev
Scheme: http
Forward Hostname/IP: backend
Forward Port: 3001
Default Access List: None

Custom Locations:
  Location: /api/validate
    Access List: None (public)
  
  Location: /
    Access List: authentik (protected)
```

## Alternative: Exposing Ports for Development/Testing

If you need direct access to services (e.g., for local development without NPM), you can uncomment the port mappings in `docker-compose.yml`:

### To Expose Database Port (5432)
```yaml
db:
  # ... other configuration ...
  ports:
    - "5432:5432"  # Uncomment this line
```
Access: `postgresql://localhost:5432/gdgoc_certs`

### To Expose Backend API Port (3001)
```yaml
backend:
  # ... other configuration ...
  ports:
    - "3001:3001"  # Uncomment this line
```
Access: `http://localhost:3001`

### To Expose Frontend Port (80 → 8080)
```yaml
frontend:
  # ... other configuration ...
  ports:
    - "8080:80"  # Uncomment this line (maps container port 80 to host port 8080)
```
Access: `http://localhost:8080`

**Note**: Port 80 is mapped to 8080 on the host to avoid conflicts with other services.

## Port Mapping Syntax

Docker Compose port mapping format: `"HOST_PORT:CONTAINER_PORT"`

Example: `"8080:80"` means:
- Container listens on port 80 internally
- Host machine exposes it on port 8080
- Access via `http://localhost:8080`

## Security Considerations

### Production Deployment
✅ **DO NOT expose ports** - Use Nginx Proxy Manager
✅ Use authentik for authentication
✅ Configure SSL/TLS certificates in NPM
✅ Restrict CORS origins in backend/.env

### Development/Testing (Exposed Ports)
⚠️ **Only expose ports on trusted networks**
⚠️ Use strong database passwords
⚠️ Do not expose to public internet without authentication
⚠️ Consider using firewall rules to restrict access

## Connecting to Services

### From Another Container on `gdgoc-net`

Services can connect using service names:

```bash
# Database connection from backend
postgresql://db:5432/gdgoc_certs

# Backend API from frontend or other service
http://backend:3001

# Frontend from NPM or other proxy
http://frontend:80
```

### From Host Machine (Only if Ports Are Exposed)

If you uncommented the port mappings:

```bash
# Database
postgresql://localhost:5432/gdgoc_certs

# Backend API
http://localhost:3001

# Frontend
http://localhost:8080
```

### Joining Another Service to the Network

To add another Docker service (like Nginx Proxy Manager) to the network:

```yaml
services:
  your-service:
    # ... your configuration ...
    networks:
      - gdgoc-net

networks:
  gdgoc-net:
    external: true  # Use the existing network
```

## Troubleshooting

### Can't connect to services
1. Verify services are running: `docker compose ps`
2. Check network exists: `docker network ls | grep gdgoc-net`
3. Verify service is on network: `docker network inspect gdgoc-net`
4. For NPM, ensure it's on the same network or can route to it

### Need direct access for debugging
1. Temporarily uncomment port mappings in docker-compose.yml
2. Restart services: `./deploy.sh restart`
3. Access via localhost with mapped ports
4. Remember to comment out ports again for production

### Port conflicts
If you expose ports and get "port already in use" errors:
1. Check what's using the port: `lsof -i :PORT` (Linux/Mac) or `netstat -ano | findstr :PORT` (Windows)
2. Either stop the conflicting service or use a different host port
3. Example: Use `"3002:3001"` instead of `"3001:3001"`

## Quick Reference

### Default Setup (No Exposed Ports)
```yaml
# docker-compose.yml
services:
  db:
    # No ports section
  backend:
    # No ports section
  frontend:
    # No ports section
```

### Development Setup (Exposed Ports)
```yaml
# docker-compose.yml or docker-compose.override.yml
services:
  db:
    ports:
      - "5432:5432"
  backend:
    ports:
      - "3001:3001"
  frontend:
    ports:
      - "8080:80"
```

## More Information

- Full deployment guide: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- Quick start: [QUICKSTART.md](QUICKSTART.md)
- Main README: [README.md](README.md)
