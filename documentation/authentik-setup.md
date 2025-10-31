# Authentik Setup Guide - Proxy Provider Configuration

This guide explains how to configure authentik as a proxy provider for the GDGoC Certificate Generator application.

## Overview

Authentik is an open-source Identity Provider (IdP) that provides authentication and authorization for your applications. In this setup, authentik acts as a proxy provider that:

- Authenticates users before they access the application
- Injects user information as HTTP headers
- Integrates with Nginx Proxy Manager for seamless authentication

## Prerequisites

- Authentik instance running (self-hosted or cloud)
- Admin access to authentik
- Domain names configured:
  - `auth.gdg-oncampus.dev` (authentik itself)
  - `sudo.certs-admin.certs.gdg-oncampus.dev` (admin interface)
  - `api.certs.gdg-oncampus.dev` (API endpoints)

## Step 1: Create an Application in Authentik

1. **Log in to authentik** as an administrator
2. Navigate to **Applications** → **Applications**
3. Click **Create** to add a new application

### Application Configuration

- **Name**: `GDGoC Certificate Generator`
- **Slug**: `gdgoc-certs`
- **Group**: (optional) Create or select a group like "GDGoC Apps"
- **Policy engine mode**: `any`
- **UI settings**: (optional) Upload a logo

Click **Create** to save the application.

## Step 2: Create a Proxy Provider

1. Navigate to **Applications** → **Providers**
2. Click **Create** and select **Proxy Provider**

### Proxy Provider Configuration

#### Basic Settings

- **Name**: `GDGoC Certs - Proxy Provider`
- **Authorization flow**: Select your default authorization flow (usually `default-provider-authorization-implicit-consent`)
- **Type**: Select `Forward auth (single application)`

#### Forward Auth Settings

- **External host**: `https://sudo.certs-admin.certs.gdg-oncampus.dev`
- **Cookie domain**: `gdg-oncampus.dev` (this allows cookies across subdomains)

#### Advanced Settings

- **Token validity**: `hours=8` (adjust based on your security requirements)
- **Additional scopes**: (leave default or add custom scopes if needed)
- **Certificate**: (optional) Select if using custom certificates

#### Header Injection

Authentik automatically injects these headers:
- `X-authentik-username`: User's username
- `X-authentik-email`: User's email
- `X-authentik-name`: User's full name
- `X-authentik-uid`: User's unique ID (used as `ocid` in the application)
- `X-authentik-groups`: User's groups

**Important**: The GDGoC backend expects these headers:
- `X-authentik-uid` → mapped to `ocid` (user identifier)
- `X-authentik-name` → user's display name
- `X-authentik-email` → user's email address

Click **Create** to save the provider.

## Step 3: Link Provider to Application

1. Go back to **Applications** → **Applications**
2. Edit the **GDGoC Certificate Generator** application
3. In the **Provider** field, select `GDGoC Certs - Proxy Provider`
4. Click **Update**

## Step 4: Create API Provider (for API Authentication)

For API endpoints that need authentication:

1. Navigate to **Applications** → **Providers**
2. Click **Create** and select **Proxy Provider**

### API Proxy Provider Configuration

- **Name**: `GDGoC Certs - API Proxy Provider`
- **Authorization flow**: Same as above
- **Type**: `Forward auth (single application)`
- **External host**: `https://api.certs.gdg-oncampus.dev`
- **Cookie domain**: `gdg-oncampus.dev`

Create a separate application for the API or use path-based routing in Nginx Proxy Manager.

## Step 5: Configure Access Control (Groups & Policies)

### Create a Group for Admins

1. Navigate to **Directory** → **Groups**
2. Click **Create**
3. Configure the group:
   - **Name**: `GDGoC-Admins`
   - **Parent**: (optional)
   - **Attributes**: (optional) Add custom attributes

### Assign Users to Group

1. In the group settings, go to the **Users** tab
2. Click **Add existing user** or **Create user**
3. Select the users who should have access to the certificate generator

### Create Access Policy (Optional)

For more granular control:

1. Navigate to **Policies** → **Policies**
2. Click **Create** and select **Expression Policy**
3. Configure:
   - **Name**: `GDGoC Admin Access Policy`
   - **Expression**:
     ```python
     # Allow only members of GDGoC-Admins group
     return ak_is_group_member(request.user, name="GDGoC-Admins")
     ```

4. Apply the policy:
   - Go to your application's **Policy Bindings** tab
   - Add the policy with order `10` (lower numbers execute first)

## Step 6: Configure Outpost

Authentik uses "Outposts" to handle proxy authentication:

1. Navigate to **Applications** → **Outposts**
2. Edit the default outpost (usually `authentik Embedded Outpost`)
3. Add your applications to the outpost:
   - Select **GDGoC Certificate Generator**
   - Select **GDGoC Certs API** (if created separately)

The outpost handles the authentication flow and communicates with Nginx Proxy Manager.

## Step 7: Test Authentication Flow

### Manual Test

1. Open a browser in incognito/private mode
2. Navigate to `https://sudo.certs-admin.certs.gdg-oncampus.dev`
3. You should be redirected to authentik login page
4. Log in with a user in the `GDGoC-Admins` group
5. After successful login, you should be redirected to the application

### Verify Headers

You can verify that headers are being injected by checking the backend logs or using browser developer tools to inspect the requests.

## Configuration Summary

### Application Configuration

```yaml
Name: GDGoC Certificate Generator
Slug: gdgoc-certs
Provider: GDGoC Certs - Proxy Provider
Group: GDGoC-Admins
```

### Proxy Provider Configuration

```yaml
Name: GDGoC Certs - Proxy Provider
Type: Forward auth (single application)
External host: https://sudo.certs-admin.certs.gdg-oncampus.dev
Cookie domain: gdg-oncampus.dev
Authorization flow: default-provider-authorization-implicit-consent
Token validity: hours=8
```

### Headers Injected

- `X-authentik-uid` → User's unique ID (used as ocid)
- `X-authentik-name` → Full name
- `X-authentik-email` → Email address
- `X-authentik-username` → Username
- `X-authentik-groups` → Comma-separated group names

## Advanced Configuration

### Custom Header Mappings

If you need to customize header names:

1. Go to **Customization** → **Property Mappings**
2. Create a new **Scope Mapping**
3. Define custom expressions for header values

### Session Configuration

Configure session timeout and behavior:

1. Edit the provider
2. Adjust **Token validity** for session duration
3. Configure **Cookie settings** for session management

### Multi-Application Setup

For the full architecture with separate admin and public interfaces:

1. Create provider for admin interface: `sudo.certs-admin.certs.gdg-oncampus.dev`
2. Create provider for API: `api.certs.gdg-oncampus.dev`
3. Public validation page at `certs.gdg-oncampus.dev` does NOT need authentication

## Troubleshooting

### Users Can't Access the Application

1. **Check group membership**: Ensure user is in `GDGoC-Admins` group
2. **Check policy bindings**: Verify policies are correctly applied
3. **Check outpost status**: Ensure outpost is running and healthy
4. **Check logs**: Navigate to **Events** → **Logs** in authentik

### Headers Not Being Injected

1. **Verify Nginx Proxy Manager configuration**: Headers must be forwarded (see Nginx Proxy Manager guide)
2. **Check provider settings**: Ensure proxy provider is correctly configured
3. **Test with curl**:
   ```bash
   curl -H "Host: sudo.certs-admin.certs.gdg-oncampus.dev" \
        http://localhost/api/auth/me -v
   ```

### Authentication Loop

1. **Cookie domain mismatch**: Ensure cookie domain is set to parent domain
2. **HTTPS issues**: Verify SSL/TLS certificates are valid
3. **Check external host**: Must match the domain users access

### Session Expires Too Quickly

1. Increase **Token validity** in provider settings
2. Configure **Remember me** feature in authorization flow
3. Check **Session** settings in authentik system settings

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS for production deployments
2. **Restrict cookie domain**: Set to specific domain, not wildcard
3. **Configure CORS**: Properly configure CORS in backend to accept only specific origins
4. **Enable MFA**: Enable multi-factor authentication in authentik
5. **Regular audits**: Review access logs and user permissions regularly
6. **Backup policies**: Export and backup your authentik configuration
7. **Use strong passwords**: Enforce password policies in authentik

## Next Steps

After configuring authentik:

1. Configure Nginx Proxy Manager to use authentik (see [nginx-proxy-manager-setup.md](nginx-proxy-manager-setup.md))
2. Test the complete authentication flow
3. Configure the backend application to read authentik headers
4. Set up monitoring and logging for authentication events

## References

- [Authentik Documentation](https://goauthentik.io/docs/)
- [Proxy Provider Configuration](https://goauthentik.io/docs/providers/proxy/)
- [Forward Auth Documentation](https://goauthentik.io/docs/providers/proxy/forward_auth)
- [Nginx Proxy Manager Integration](https://goauthentik.io/integrations/services/nginx-proxy-manager/)

## Support

For issues specific to authentik configuration:
- Check the [authentik community forum](https://github.com/goauthentik/authentik/discussions)
- Review authentik logs: **Events** → **Logs**
- Check system status: **System** → **System Status**
