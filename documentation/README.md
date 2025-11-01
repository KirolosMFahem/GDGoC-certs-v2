# GDGoC Certificate Generator - Documentation

This directory contains comprehensive setup guides for deploying and configuring the GDGoC Certificate Generator with authentik authentication and Nginx Proxy Manager.

## Documentation Files

### [authentik-setup.md](authentik-setup.md)
Complete guide for configuring authentik as a proxy provider for the application.

**Contents:**
- Application and provider configuration in authentik
- Group-based access control setup
- Header injection configuration
- Policy creation and binding
- Outpost configuration
- Testing and troubleshooting
- Security best practices

**Key Topics:**
- Creating proxy providers for admin and API
- Configuring forward authentication
- Setting up the GDGoC-Admins group
- Header mappings (X-authentik-uid, X-authentik-name, X-authentik-email)

### [nginx-proxy-manager-setup.md](nginx-proxy-manager-setup.md)
Complete guide for setting up Nginx Proxy Manager as a reverse proxy with authentik integration.

**Contents:**
- NPM installation and network configuration
- SSL certificate setup (Let's Encrypt)
- Forward auth configuration with authentik
- Proxy host configuration for all services
- Testing and verification
- Troubleshooting common issues
- Security hardening

**Key Topics:**
- Connecting NPM to Docker network
- Creating proxy hosts for admin, public, and API interfaces
- Mixed authentication (public + protected endpoints)
- Header forwarding configuration
- SSL/TLS setup

### [certificate-templates.md](certificate-templates.md)
Complete guide for creating and customizing certificate templates.

**Contents:**
- Certificate template requirements and design guidelines
- Creating SVG and HTML/CSS templates
- Template placeholder syntax
- Integrating templates with the application
- PDF generation setup with Puppeteer
- Template storage options (local, database, cloud)
- Per-organization customization
- Testing and troubleshooting

**Key Topics:**
- Template design specifications (dimensions, colors, fonts)
- SVG template creation with Inkscape/Illustrator
- HTML/CSS template structure
- Server-side rendering with Puppeteer
- Dockerfile configuration for Chromium
- Dynamic template selection

### [smtp-provider-setup.md](smtp-provider-setup.md)
Complete guide for configuring SMTP providers to send certificate emails.

**Contents:**
- SMTP environment variable configuration
- Step-by-step setup for popular providers (Brevo, Gmail, SendGrid, Mailgun, AWS SES, Postmark, Microsoft 365)
- Testing SMTP configuration
- Email delivery troubleshooting
- DNS configuration for better deliverability (SPF, DKIM, DMARC)
- Email queue implementation
- Monitoring and analytics

**Key Topics:**
- Brevo setup (recommended for GDGoC)
- Gmail with App Passwords
- SendGrid API configuration
- Amazon SES production access
- Rate limiting and best practices
- Handling bounces and spam issues

### [email-templates.md](email-templates.md)
Complete guide for creating and customizing email templates for certificate delivery.

**Contents:**
- Pre-built email templates (Default, Celebratory, Minimal, Corporate, Achievement)
- Template variable system
- Creating custom templates for leaders
- Per-organization template customization
- Email client compatibility
- Template management and storage
- Testing and preview tools

**Key Topics:**
- Available template variables (RECIPIENT_NAME, EVENT_NAME, CERTIFICATE_ID, etc.)
- Template selection and customization per leader
- HTML email best practices
- Database schema for template storage
- Handlebars syntax for dynamic content
- Mobile-responsive design

### [leader-features.md](leader-features.md)
Complete guide for leaders (administrators) covering profile management, organization settings, and email template customization.

**Contents:**
- Profile setup (first login) with organization name lock
- Settings and profile management
- Email template customization with online code editor
- Organization name change policy and support ticket process
- Template variable system and conditional logic
- Template management (create, edit, delete, set default)
- Security considerations and access control

**Key Topics:**
- Organization name cannot be changed after first login (requires support ticket)
- Leaders can change their name anytime in settings
- Online code editor for email template customization
- Template selection and per-organization preferences
- Support ticket workflow for organization name changes

## Quick Start

Follow these guides in order:

1. **Deploy the Application**: Use the main deployment guides
   - [../QUICKSTART.md](../QUICKSTART.md) - Quick deployment
   - [../DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md) - Complete deployment guide

2. **Configure Authentication**: Set up authentik
   - Read [authentik-setup.md](authentik-setup.md)
   - Create application and proxy provider
   - Configure groups and access policies

3. **Configure Reverse Proxy**: Set up Nginx Proxy Manager
   - Read [nginx-proxy-manager-setup.md](nginx-proxy-manager-setup.md)
   - Create proxy hosts for each service
   - Configure forward authentication

4. **Test**: Verify the complete setup
   - Test admin interface authentication
   - Test public validation page
   - Verify API endpoint access control

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Nginx Proxy Manager                            │
│  - SSL Termination                                          │
│  - Reverse Proxy                                            │
│  - Forward Auth to authentik                                │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌───────────────────────────────┐
│      authentik         │   │    GDGoC Services             │
│  - User Authentication │   │  ┌─────────────────────────┐  │
│  - Proxy Provider      │   │  │  Frontend (React+Nginx) │  │
│  - Header Injection    │   │  └─────────────────────────┘  │
└────────────────────────┘   │  ┌─────────────────────────┐  │
                             │  │  Backend (Express API)  │  │
                             │  └─────────────────────────┘  │
                             │  ┌─────────────────────────┐  │
                             │  │  Database (PostgreSQL)  │  │
                             │  └─────────────────────────┘  │
                             └───────────────────────────────┘
```

## Service Endpoints

| Service | Domain | Authentication | Purpose |
|---------|--------|----------------|---------|
| Admin Interface | `sudo.certs-admin.certs.gdg-oncampus.dev` | ✅ Required | Certificate management |
| Public Validation | `certs.gdg-oncampus.dev` | ❌ Public | Certificate verification |
| API (Protected) | `api.certs.gdg-oncampus.dev/*` | ✅ Required | Certificate CRUD operations |
| API (Public) | `api.certs.gdg-oncampus.dev/api/validate/*` | ❌ Public | Certificate validation endpoint |
| Authentik | `auth.gdg-oncampus.dev` | N/A | Authentication provider |

## Authentication Flow

1. User accesses protected resource (e.g., admin interface)
2. Nginx Proxy Manager intercepts the request
3. Forward auth request sent to authentik
4. If not authenticated:
   - Redirect to authentik login page
   - User logs in
   - Redirect back to original URL
5. If authenticated:
   - Authentik injects user headers
   - NPM forwards request with headers to application
   - Application reads user info from headers

## Required Headers

The backend application expects these headers from authentik:

- `X-authentik-uid` - Unique user identifier (stored as `ocid`)
- `X-authentik-name` - User's full name
- `X-authentik-email` - User's email address

## Security Considerations

### Authentication
- Admin interface requires authentication via authentik
- Users must be members of `GDGoC-Admins` group
- API endpoints are protected except `/api/validate/*`

### Network Security
- No ports exposed to host (all services on internal Docker network)
- SSL/TLS encryption for all external traffic
- Forward auth prevents direct access to services

### Data Protection
- PostgreSQL credentials in environment variables
- Session cookies secured with appropriate domain settings
- HTTPS enforced via Nginx Proxy Manager

## Troubleshooting

### Authentication Issues

**Symptom**: Can't access admin interface  
**Solution**: 
1. Check user is in `GDGoC-Admins` group
2. Verify authentik provider configuration
3. Check NPM forward auth settings

**Symptom**: Authentication loop  
**Solution**:
1. Verify cookie domain settings in authentik
2. Check SSL certificate validity
3. Ensure external host matches accessed domain

### Network Issues

**Symptom**: 502 Bad Gateway  
**Solution**:
1. Verify services are running: `docker compose ps`
2. Check Docker network: `docker network inspect gdgoc-net`
3. Ensure NPM is on `gdgoc-net` network

**Symptom**: Headers not forwarded  
**Solution**:
1. Check NPM Advanced configuration
2. Verify authentik provider settings
3. Test with curl: `curl -H "Cookie: ..." -v https://api.../api/auth/me`

### SSL Issues

**Symptom**: SSL certificate errors  
**Solution**:
1. Verify DNS points to correct server
2. Check Let's Encrypt rate limits
3. Ensure ports 80 and 443 are open

## Additional Resources

### Main Documentation
- [README.md](../README.md) - Project overview
- [QUICKSTART.md](../QUICKSTART.md) - Quick deployment guide
- [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md) - Complete Docker guide
- [PORT_REFERENCE.md](../PORT_REFERENCE.md) - Port configuration reference

### External Resources
- [Authentik Documentation](https://goauthentik.io/docs/)
- [Nginx Proxy Manager](https://nginxproxymanager.com/)
- [Docker Networking](https://docs.docker.com/network/)

## Support

For issues with:
- **Application deployment**: See main documentation
- **Authentik configuration**: Check [authentik-setup.md](authentik-setup.md)
- **Nginx Proxy Manager**: Check [nginx-proxy-manager-setup.md](nginx-proxy-manager-setup.md)
- **General questions**: Open an issue in the repository

## Contributing

To improve this documentation:
1. Test the setup procedures
2. Note any missing steps or clarifications needed
3. Submit updates via pull request
4. Include screenshots for UI-based steps

## Version History

- **v1.0** - Initial documentation
  - Authentik proxy provider setup
  - Nginx Proxy Manager configuration
  - Forward auth integration
