# Nginx Proxy Manager Setup Guide with Authentik Integration

This guide explains how to configure Nginx Proxy Manager (NPM) as a reverse proxy with authentik authentication for the GDGoC Certificate Generator application.

## Overview

Nginx Proxy Manager provides:
- Easy-to-use web interface for managing reverse proxy configurations
- Automatic SSL certificate management with Let's Encrypt
- Integration with authentik for forward authentication
- Access control and security features

## Architecture

```
Internet → Nginx Proxy Manager → authentik (authentication) → GDGoC Services
                ↓                                                    ↓
          SSL Termination                                  - Frontend (React)
          Forward Auth                                     - Backend (API)
          Routing                                          - Database
```

## Prerequisites

- Nginx Proxy Manager installed and running
- Authentik configured as proxy provider (see [authentik-setup.md](authentik-setup.md))
- Docker network `gdgoc-net` created and services running
- Domain names with DNS configured:
  - `sudo.certs-admin.certs.gdg-oncampus.dev` (Admin interface)
  - `certs.gdg-oncampus.dev` (Public validation page)
  - `api.certs.gdg-oncampus.dev` (Backend API)
  - `auth.gdg-oncampus.dev` (Authentik)

## Step 1: Connect Nginx Proxy Manager to Docker Network

Ensure NPM is on the same Docker network as the GDGoC services:

### If NPM is in Docker Compose

Add to your NPM docker-compose.yml:

```yaml
networks:
  gdgoc-net:
    external: true
```

Then connect the service:

```yaml
services:
  nginx-proxy-manager:
    # ... other configuration ...
    networks:
      - default
      - gdgoc-net
```

Restart NPM:
```bash
docker compose restart nginx-proxy-manager
```

### If NPM is Standalone

Connect the existing container to the network:

```bash
docker network connect gdgoc-net nginx-proxy-manager
```

Verify the connection:
```bash
docker network inspect gdgoc-net
```

## Step 2: Configure SSL Certificates

### Using Let's Encrypt

1. Log in to Nginx Proxy Manager web interface (usually http://localhost:81)
2. Navigate to **SSL Certificates** → **Add SSL Certificate**
3. Select **Let's Encrypt**
4. Configure:
   - **Domain Names**: Add all your domains:
     - `sudo.certs-admin.certs.gdg-oncampus.dev`
     - `certs.gdg-oncampus.dev`
     - `api.certs.gdg-oncampus.dev`
   - **Email**: Your email for certificate notifications
   - **Agree to Let's Encrypt Terms**: Check
   - **Use a DNS Challenge**: (Optional) Check if using wildcard certificates
5. Click **Save**

### Using Custom Certificates

If you have your own SSL certificates:

1. Navigate to **SSL Certificates** → **Add SSL Certificate**
2. Select **Custom**
3. Upload:
   - **Certificate Key**: Your private key file (.key)
   - **Certificate**: Your certificate file (.crt or .pem)
   - **Intermediate Certificate**: (Optional) CA bundle
4. Click **Save**

## Step 3: Understanding Authentik Forward Auth

Authentik forward authentication will be configured directly in each Proxy Host that requires authentication. NPM doesn't use Access Lists for forward auth - instead, we'll add custom Nginx configuration to each protected proxy host.

**Note**: In Nginx Proxy Manager, Access Lists are for basic IP whitelisting or HTTP authentication. For authentik forward auth, we configure it directly in the Proxy Host's Advanced tab (see Step 4 below).

### How Forward Auth Works

1. User accesses protected resource (e.g., admin interface)
2. NPM checks authentik via `/outpost.goauthentik.io/auth/nginx`
3. If not authenticated:
   - Redirect to authentik login page
   - User logs in
   - Redirect back to original URL
4. If authenticated:
   - Authentik injects user headers
   - NPM forwards request with headers to application

## Step 4: Configure Admin Interface Proxy Host

### Admin Interface (Protected with Authentik)

1. Navigate to **Hosts** → **Proxy Hosts** → **Add Proxy Host**

#### Details Tab

- **Domain Names**: `sudo.certs-admin.certs.gdg-oncampus.dev`
- **Scheme**: `http`
- **Forward Hostname/IP**: `frontend` (Docker service name)
- **Forward Port**: `80`
- **Cache Assets**: Check
- **Block Common Exploits**: Check
- **Websockets Support**: Check (if needed for real-time features)

#### SSL Tab

- **SSL Certificate**: Select the certificate created in Step 2
- **Force SSL**: Check
- **HTTP/2 Support**: Check
- **HSTS Enabled**: Check
- **HSTS Subdomains**: Check

#### Advanced Tab

Add this configuration for authentik forward auth:

```nginx
# Forward auth to authentik
auth_request /outpost.goauthentik.io/auth/nginx;

# Preserve authentication cookie
auth_request_set $auth_cookie $upstream_http_set_cookie;
add_header Set-Cookie $auth_cookie;

# Get authentik user headers
auth_request_set $authentik_username $upstream_http_x_authentik_username;
auth_request_set $authentik_groups $upstream_http_x_authentik_groups;
auth_request_set $authentik_email $upstream_http_x_authentik_email;
auth_request_set $authentik_name $upstream_http_x_authentik_name;
auth_request_set $authentik_uid $upstream_http_x_authentik_uid;

# Forward application traffic
location / {
    proxy_pass http://frontend:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Pass authentik user information to application
    proxy_set_header X-authentik-username $authentik_username;
    proxy_set_header X-authentik-groups $authentik_groups;
    proxy_set_header X-authentik-email $authentik_email;
    proxy_set_header X-authentik-name $authentik_name;
    proxy_set_header X-authentik-uid $authentik_uid;
}

# Authentik outpost endpoint
location /outpost.goauthentik.io {
    proxy_pass https://auth.gdg-oncampus.dev/outpost.goauthentik.io;
    proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Redirect to authentik login on auth failure
location @goauthentik_proxy_signin {
    internal;
    return 302 https://auth.gdg-oncampus.dev/outpost.goauthentik.io/start?rd=$scheme://$http_host$request_uri;
}

error_page 401 = @goauthentik_proxy_signin;
```

#### Access List Tab

- **Access List**: None (authentication handled by authentik forward auth)

Click **Save**.

## Step 5: Configure Public Validation Page

### Public Interface (No Authentication)

1. Navigate to **Hosts** → **Proxy Hosts** → **Add Proxy Host**

#### Details Tab

- **Domain Names**: `certs.gdg-oncampus.dev`
- **Scheme**: `http`
- **Forward Hostname/IP**: `frontend`
- **Forward Port**: `80`
- **Cache Assets**: Check
- **Block Common Exploits**: Check

#### SSL Tab

- **SSL Certificate**: Select the certificate
- **Force SSL**: Check
- **HTTP/2 Support**: Check
- **HSTS Enabled**: Check

#### Advanced Tab

```nginx
location / {
    proxy_pass http://frontend:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### Access List Tab

- **Access List**: None (public access)

Click **Save**.

## Step 6: Configure Backend API

### API Configuration (Mixed Authentication)

The API has both protected and public endpoints:
- `/api/validate/*` - Public (no auth)
- All other `/api/*` - Protected (requires auth)

1. Navigate to **Hosts** → **Proxy Hosts** → **Add Proxy Host**

#### Details Tab

- **Domain Names**: `api.certs.gdg-oncampus.dev`
- **Scheme**: `http`
- **Forward Hostname/IP**: `backend`
- **Forward Port**: `3001`
- **Block Common Exploits**: Check

#### SSL Tab

- **SSL Certificate**: Select the certificate
- **Force SSL**: Check
- **HTTP/2 Support**: Check

#### Advanced Tab

```nginx
# Public validation endpoint - no authentication required
location /api/validate {
    proxy_pass http://backend:3001/api/validate;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Health check endpoint - no authentication required
location /health {
    proxy_pass http://backend:3001/health;
    proxy_set_header Host $host;
}

# All other API endpoints - require authentication
location / {
    # Forward auth to authentik
    auth_request /outpost.goauthentik.io/auth/nginx;
    
    # Pass authentik headers
    auth_request_set $authentik_username $upstream_http_x_authentik_username;
    auth_request_set $authentik_groups $upstream_http_x_authentik_groups;
    auth_request_set $authentik_email $upstream_http_x_authentik_email;
    auth_request_set $authentik_name $upstream_http_x_authentik_name;
    auth_request_set $authentik_uid $upstream_http_x_authentik_uid;
    
    proxy_pass http://backend:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Forward authentik user information to backend
    proxy_set_header X-authentik-username $authentik_username;
    proxy_set_header X-authentik-groups $authentik_groups;
    proxy_set_header X-authentik-email $authentik_email;
    proxy_set_header X-authentik-name $authentik_name;
    proxy_set_header X-authentik-uid $authentik_uid;
    
    # Error handling
    error_page 401 = @authelia_proxy_signin;
}

# Authentik outpost endpoint
location /outpost.goauthentik.io {
    proxy_pass https://auth.gdg-oncampus.dev/outpost.goauthentik.io;
    proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $http_host;
}

# Error page redirect
location @authelia_proxy_signin {
    internal;
    return 302 https://auth.gdg-oncampus.dev/outpost.goauthentik.io/start?rd=$scheme://$http_host$request_uri;
}
```

Click **Save**.

## Step 7: Test the Configuration

### Test Admin Interface

1. Open browser in incognito mode
2. Navigate to `https://sudo.certs-admin.certs.gdg-oncampus.dev`
3. Should redirect to authentik login
4. Log in with a user in `GDGoC-Admins` group
5. Should be redirected back to admin interface

### Test Public Page

1. Navigate to `https://certs.gdg-oncampus.dev`
2. Should load without authentication
3. Try to validate a certificate

### Test API

```bash
# Public endpoint (should work)
curl https://api.certs.gdg-oncampus.dev/api/validate/TEST-ID

# Protected endpoint (should require auth)
curl https://api.certs.gdg-oncampus.dev/api/certificates
```

### Verify Headers

Check that authentik headers are being forwarded:

```bash
# Make authenticated request and check headers
curl -H "Cookie: authentik_session=..." \
     https://api.certs.gdg-oncampus.dev/api/auth/me \
     -v 2>&1 | grep -i "x-authentik"
```

## Configuration Summary

### Proxy Hosts Created

| Domain | Service | Port | Authentication | Purpose |
|--------|---------|------|----------------|---------|
| `sudo.certs-admin.certs.gdg-oncampus.dev` | frontend | 80 | ✅ Required | Admin interface |
| `certs.gdg-oncampus.dev` | frontend | 80 | ❌ Public | Validation page |
| `api.certs.gdg-oncampus.dev` | backend | 3001 | ⚠️ Mixed | API endpoints |

### Network Flow

```
User Request
    ↓
Nginx Proxy Manager (SSL Termination)
    ↓
Forward Auth Request → Authentik
    ↓                      ↓
Denied ←────────────── Redirect to Login
    ↓
Allowed (with headers injected)
    ↓
Backend Service (reads X-authentik-* headers)
    ↓
Response to User
```

## Troubleshooting

### 502 Bad Gateway

1. **Check service is running**:
   ```bash
   docker compose ps
   ```

2. **Check network connectivity**:
   ```bash
   docker network inspect gdgoc-net
   ```

3. **Test from NPM container**:
   ```bash
   docker exec -it nginx-proxy-manager ping frontend
   ```

### Authentication Loop

1. **Cookie domain mismatch**: Check authentik cookie domain setting
2. **HTTPS redirect issues**: Ensure "Force SSL" is enabled
3. **Check authentik logs**: Look for authentication errors

### Headers Not Forwarded

1. **Verify configuration**: Check Advanced tab configuration
2. **Test headers**:
   ```bash
   curl -I https://api.certs.gdg-oncampus.dev/api/auth/me
   ```
3. **Check NPM logs**:
   ```bash
   docker logs nginx-proxy-manager
   ```

### SSL Certificate Issues

1. **Domain not accessible**: Ensure DNS points to your server
2. **Let's Encrypt rate limits**: Wait or use DNS challenge
3. **Certificate expired**: Renew in NPM SSL Certificates section

### Can't Access Services

1. **Firewall**: Open ports 80 and 443
2. **DNS**: Verify domain resolution
3. **Docker network**: Ensure services are on same network

## Security Best Practices

1. **Use SSL/TLS**: Always enforce HTTPS in production
2. **Enable HSTS**: Prevent protocol downgrade attacks
3. **Block common exploits**: Enable in NPM for each host
4. **Limit authentication attempts**: Configure in authentik
5. **Regular updates**: Keep NPM and authentik updated
6. **Monitor logs**: Regularly review access and error logs
7. **Backup configuration**: Export NPM configuration regularly

## Advanced Configuration

### Custom Error Pages

Add custom error pages in NPM Advanced tab:

```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;

location = /404.html {
    root /usr/share/nginx/html;
    internal;
}

location = /50x.html {
    root /usr/share/nginx/html;
    internal;
}
```

### Rate Limiting

Add rate limiting to prevent abuse:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... rest of configuration
}
```

### Logging

Enable detailed logging:

```nginx
access_log /var/log/nginx/gdgoc-access.log;
error_log /var/log/nginx/gdgoc-error.log warn;
```

### IP Whitelisting (Optional)

Restrict access to specific IPs:

```nginx
# In Advanced tab
allow 192.168.1.0/24;
allow 10.0.0.0/8;
deny all;
```

## Maintenance

### Update SSL Certificates

Certificates auto-renew, but you can manually renew:

1. Navigate to **SSL Certificates**
2. Click on certificate
3. Click **Renew**

### Backup Configuration

Export configuration:

1. Navigate to **Settings** → **Backup**
2. Click **Download Backup**
3. Store securely

### Monitor Performance

Check NPM logs for performance issues:

```bash
docker logs nginx-proxy-manager --tail 100
```

## Next Steps

After configuring Nginx Proxy Manager:

1. Test all authentication flows
2. Verify header injection works
3. Configure monitoring and alerts
4. Set up log aggregation
5. Create backup schedules
6. Document your specific configuration

## References

- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/guide/)
- [Authentik Forward Auth](https://goauthentik.io/docs/providers/proxy/forward_auth)
- [Nginx Forward Auth](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)

## Support

For issues with Nginx Proxy Manager:
- Check [NPM GitHub Issues](https://github.com/NginxProxyManager/nginx-proxy-manager/issues)
- Review NPM logs for errors
- Verify Docker network configuration
