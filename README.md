# GDGoC Certificate Generator

A full-stack web application for Google Developer Groups on Campus (GDGoC) to generate and validate certificates.

## Features

- **Certificate Generation**: Single and bulk certificate creation
- **Email Distribution**: Automated certificate delivery via Brevo SMTP
- **Public Validation**: Certificate verification by unique ID
- **Authentication**: Secured with authentik proxy provider via Nginx Proxy Manager
- **Role-based Access**: Organization-based leader management

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: authentik (Proxy Provider)
- **Email**: Brevo SMTP
- **Reverse Proxy**: Nginx Proxy Manager

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js          # Database connection
│   │   │   └── schema.sql        # Database schema
│   │   ├── middleware/
│   │   │   └── auth.js           # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js           # Authentication routes
│   │   │   ├── certificates.js   # Certificate routes
│   │   │   └── profile.js        # Profile routes
│   │   ├── services/
│   │   │   └── emailService.js   # Email service (Brevo)
│   │   └── index.js              # Main server file
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── AdminApp.jsx      # Admin application wrapper
    │   ├── contexts/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── ProfileSetup.jsx
    │   │   ├── Settings.jsx
    │   │   └── PublicValidationPage.jsx
    │   ├── utils/
    │   │   └── api.js            # API utility functions
    │   ├── App.jsx               # Main app component
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## Architecture

### Hostname-Based Routing

The application uses hostname-based routing to serve different interfaces:

- **`sudo.certs-admin.certs.gdg-oncampus.dev`**: Admin interface (protected by authentik)
- **`certs.gdg-oncampus.dev`**: Public validation page (no authentication)
- **`api.certs.gdg-oncampus.dev`**: Backend API

### Authentication Flow

1. Nginx Proxy Manager intercepts requests to admin and API endpoints
2. authentik validates the user and injects headers (`X-authentik-uid`, `X-authentik-name`, `X-authentik-email`)
3. Backend reads these headers to identify and authorize users
4. Frontend makes API calls with these headers automatically forwarded

### Database Schema

#### `allowed_leaders` Table
- `ocid` (TEXT, PRIMARY KEY): Unique user ID from authentik
- `name` (TEXT): Leader's full name (appears as issuer on certificates)
- `email` (TEXT, UNIQUE): Leader's email
- `org_name` (TEXT): Organization name (set once during profile setup)
- `can_login` (BOOLEAN): Enable/disable access

#### `certificates` Table
- `id` (UUID, PRIMARY KEY)
- `unique_id` (TEXT, UNIQUE): Certificate validation ID
- `recipient_name` (TEXT): Certificate recipient
- `recipient_email` (TEXT): Optional email for delivery
- `event_type` (TEXT): 'workshop' or 'course'
- `event_name` (TEXT): Name of the event
- `issue_date` (DATE): Certificate issue date
- `issuer_name` (TEXT): Leader's name
- `org_name` (TEXT): Organization name
- `generated_by` (TEXT): Foreign key to `allowed_leaders.ocid`
- `pdf_url` (TEXT): Optional PDF URL
- `created_at` (TIMESTAMP)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker and Docker Compose (for deployment)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gdgoc_certs
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3001
NODE_ENV=development

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_user
SMTP_PASS=your_brevo_password
SMTP_FROM="GDGoC Certificates" <noreply@gdg-oncampus.dev>
```

5. Set up PostgreSQL database:
```bash
# Create database
createdb gdgoc_certs

# Run schema
psql -d gdgoc_certs -f src/db/schema.sql
```

6. Start the backend:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get or create authenticated user (protected)

### Profile
- `GET /api/profile` - Get current user profile (protected)
- `PUT /api/profile` - Update user profile (protected)

### Certificates
- `POST /api/certificates` - Create single certificate (protected)
- `POST /api/certificates/bulk` - Create multiple certificates (protected)
- `GET /api/certificates` - List user's certificates (protected)
- `GET /api/validate/:uniqueId` - Validate certificate (public)

### Health Check
- `GET /health` - Service health check

## CORS Configuration

The backend is configured to only accept requests from:
- `https://sudo.certs-admin.certs.gdg-oncampus.dev`
- `https://certs.gdg-oncampus.dev`
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)

## Nginx Proxy Manager Setup

### Admin Host Configuration
- **Host**: `sudo.certs-admin.certs.gdg-oncampus.dev`
- **Forward To**: `frontend:80`
- **Access List**: authentik (GDGoC-Admins group)

### Public Host Configuration
- **Host**: `certs.gdg-oncampus.dev`
- **Forward To**: `frontend:80`
- **Access List**: None

### API Host Configuration
- **Host**: `api.certs.gdg-oncampus.dev`
- **Forward To**: `backend:3001`
- **Default Access List**: None
- **Locations**:
  - Path: `/api/validate` - Access List: None (public)
  - Path: `/` - Access List: authentik (protected)

## Deployment

Docker deployment configuration is available for production use. See the following guides:

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide for Docker deployment
- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete Docker deployment documentation
- **[PORT_REFERENCE.md](PORT_REFERENCE.md)** - Port configuration and Nginx Proxy Manager setup
- **[documentation/](documentation/)** - Comprehensive setup guides

### Authentication & Reverse Proxy Setup

For production deployment with authentication:

- **[documentation/authentik-setup.md](documentation/authentik-setup.md)** - Configure authentik as proxy provider
- **[documentation/nginx-proxy-manager-setup.md](documentation/nginx-proxy-manager-setup.md)** - Set up Nginx Proxy Manager with authentik

### Certificate Templates & Email Setup

For certificate customization and email delivery:

- **[documentation/certificate-templates.md](documentation/certificate-templates.md)** - Create and customize certificate templates
- **[documentation/smtp-provider-setup.md](documentation/smtp-provider-setup.md)** - Configure SMTP providers (Brevo, Gmail, SendGrid, etc.)
- **[documentation/email-templates.md](documentation/email-templates.md)** - Choose and customize email templates for leaders

### Quick Start

```bash
# 1. Configure environment
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env with database passwords and settings
# Edit backend/.env with SMTP and application settings

# 2. Start services
./deploy.sh up

# 3. Check status
./deploy.sh status
```

**Important**: 
- Change the PostgreSQL password in `.env` before deploying to production
- No ports are exposed to the host by default
- Services communicate through the internal `gdgoc-net` Docker network
- Configure Nginx Proxy Manager to provide external access (see PORT_REFERENCE.md)

### Docker Network

All services communicate through a custom Docker network (`gdgoc-net`):
- No ports exposed to host
- Services communicate via service names
- Nginx Proxy Manager provides external access

## Development Workflow

1. **Profile Setup**: First-time users set their organization name
2. **Certificate Generation**: Leaders create single or bulk certificates
3. **Email Delivery**: Certificates automatically emailed to recipients (if email provided)
4. **Public Validation**: Anyone can verify certificates using the unique ID

## Security Features

- Authentication handled entirely by authentik proxy provider
- No credentials stored in application code
- CORS restricted to specific domains
- Database connection pooling with prepared statements
- Environment-based configuration

## License

See LICENSE file for details.

## Contributing

This is a private project for GDGoC. Contact the maintainers for contribution guidelines.
