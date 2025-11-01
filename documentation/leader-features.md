# Leader Features Guide

## Overview

This guide covers the features available to leaders (administrators) of the GDGoC Certificate Generator, including profile management, organization settings, and email template customization.

## Table of Contents

1. [Profile Setup (First Login)](#profile-setup-first-login)
2. [Settings & Profile Management](#settings--profile-management)
3. [Email Template Customization](#email-template-customization)
4. [Organization Name Policy](#organization-name-policy)

---

## Profile Setup (First Login)

When leaders log in for the first time, they must complete their profile setup:

### Required Information

1. **Your Name** - Will appear as the issuer name on certificates (can be changed later)
2. **Organization Name** - Your GDGoC chapter or organization (⚠️ **CANNOT BE CHANGED LATER**)

### Important Notes

- **Organization Name is Permanent**: Once you set your organization name during first login, it cannot be changed through the interface
- If you need to change your organization name later, you must submit a support ticket
- This policy prevents accidental changes that could affect certificate validity

### UI Flow

```
First Login → Profile Setup Page
├── Name Input (changeable)
└── Organization Name Input (permanent - warning displayed)
    └── Complete Setup Button
        └── Redirect to Admin Dashboard
```

---

## Settings & Profile Management

Leaders can access settings from the Admin Dashboard by clicking the ⚙️ **Settings** button.

### What You Can Change

#### ✅ Your Name
- Can be changed anytime
- Updates will apply to all future certificates
- Does not affect previously issued certificates

#### ❌ Organization Name
- **Cannot be changed** through settings
- Displays as read-only/disabled field
- Shows warning: "Organization name cannot be changed. Contact support if changes are needed."

#### ❌ Email Address
- Managed by your organization's authentication system (authentik)
- Cannot be changed in the application

### How to Update Your Name

1. Navigate to Admin Dashboard
2. Click ⚙️ **Settings**
3. Update "Your Name" field
4. Click **Save Changes**
5. Success message confirms update

---

## Email Template Customization

Leaders can create and customize email templates for certificate delivery emails.

### Accessing Template Editor

From Admin Dashboard:
```
Dashboard → Customization → Email Templates
```

### Features

#### 1. **Template Selection**
Choose from pre-built templates:
- **default.html** - Professional, clean design
- **celebratory.html** - Fun, energetic for events
- **corporate.html** - Formal, official style

#### 2. **Online Code Editor**
Built-in code editor with:
- **Syntax Highlighting** - HTML, CSS highlighting
- **Line Numbers** - Easy navigation
- **Auto-complete** - Variable suggestions
- **Real-time Validation** - Check for errors
- **Preview Mode** - See changes before saving

#### 3. **Template Variables**
Available placeholders for dynamic content:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{RECIPIENT_NAME}}` | Certificate recipient | John Doe |
| `{{EVENT_NAME}}` | Event or workshop name | Intro to React |
| `{{EVENT_TYPE}}` | Type of event | workshop, course |
| `{{CERTIFICATE_ID}}` | Unique certificate ID | GDG-2024-ABC123 |
| `{{VALIDATION_URL}}` | Public validation link | https://certs.gdg.../validate/... |
| `{{ISSUE_DATE}}` | Certificate issue date | January 15, 2024 |
| `{{ORGANIZATION_NAME}}` | Your organization | GDGoC Alexandria University |
| `{{PDF_URL}}` | Certificate PDF download | https://... (optional) |
| `{{CUSTOM_MESSAGE}}` | Custom message per cert | (optional) |

#### 4. **Conditional Logic**
Use Handlebars syntax for logic:

```html
{{#if PDF_URL}}
  <a href="{{PDF_URL}}">Download Certificate</a>
{{/if}}

{{#if CUSTOM_MESSAGE}}
  <p>{{CUSTOM_MESSAGE}}</p>
{{/if}}
```

### Creating Custom Templates

#### Step 1: Start with a Base Template

1. Navigate to **Customization → Email Templates**
2. Select a template to use as starting point
3. Click **Edit** or **Duplicate**

#### Step 2: Edit in Code Editor

The online code editor provides:

```
┌─────────────────────────────────────────────┐
│ File: custom/my-template.html              │
├─────────────────────────────────────────────┤
│ 1  <!DOCTYPE html>                          │
│ 2  <html>                                   │
│ 3  <head>                                   │
│ 4    <style>                                │
│ 5      /* Your custom styles */            │
│ 6      .header { background: #4285F4; }    │
│ 7    </style>                               │
│ 8  </head>                                  │
│ 9  <body>                                   │
│ 10   <h1>{{ORGANIZATION_NAME}}</h1>        │
│ 11   <p>Hi {{RECIPIENT_NAME}},</p>         │
│ 12   <!-- Your content -->                  │
│ 13 </body>                                  │
│ 14 </html>                                  │
├─────────────────────────────────────────────┤
│ [Preview] [Save] [Test Email] [Cancel]     │
└─────────────────────────────────────────────┘
```

#### Step 3: Customize Branding

Add your organization's branding:

**Logo:**
```html
<img src="YOUR_LOGO_URL" alt="{{ORGANIZATION_NAME}}" style="height: 50px;">
```

**Colors:**
```css
:root {
  --primary-color: #4285F4;  /* Your brand color */
  --secondary-color: #34A853;
}
```

**Typography:**
```css
body {
  font-family: 'Your Brand Font', Arial, sans-serif;
}
```

#### Step 4: Preview & Test

1. **Preview Mode** - Click **Preview** to see rendered template
2. **Test Email** - Send test email to yourself
3. **Validate** - Check for errors (automatic)

#### Step 5: Save Template

1. Click **Save Template**
2. Enter template name: `my-custom-template.html`
3. Add description (optional)
4. Set as default (optional)

### Managing Templates

#### List Your Templates

View all templates in Customization section:

```
┌──────────────────────────────────────────────┐
│ Email Templates                               │
├──────────────────────────────────────────────┤
│ ● default.html (Built-in)                    │
│   Professional, clean design                  │
│   [Preview] [Use as Default]                  │
│                                               │
│ ● celebratory.html (Built-in)                │
│   Fun, energetic for events                   │
│   [Preview] [Duplicate] [Use as Default]      │
│                                               │
│ ● corporate.html (Built-in)                  │
│   Formal, official style                      │
│   [Preview] [Duplicate] [Use as Default]      │
│                                               │
│ ● my-custom-template.html (Custom) ✓ Active  │
│   My organization's template                  │
│   [Preview] [Edit] [Delete] [Use as Default]  │
└──────────────────────────────────────────────┘
```

#### Set Default Template

1. Navigate to template list
2. Click **Use as Default** on desired template
3. Confirmation: "Template set as default for all future certificates"

#### Edit Existing Template

1. Click **Edit** on custom template
2. Opens in code editor
3. Make changes
4. Click **Save**

#### Delete Template

1. Click **Delete** on custom template
2. Confirm deletion (cannot delete if it's the active default)

### Template Storage

Templates are stored:
- **Built-in**: `backend/templates/emails/`
- **Custom**: `backend/templates/emails/custom/`
- **Database**: Template metadata and preferences

#### Database Schema

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    html_content TEXT NOT NULL,
    created_by TEXT REFERENCES allowed_leaders(ocid),
    org_name TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_templates_org ON email_templates(org_name);
CREATE INDEX idx_email_templates_default ON email_templates(is_default);
```

### Code Editor Features

#### Syntax Highlighting

The editor highlights:
- HTML tags: `<div>`, `<p>`, `<a>`
- CSS properties: `color`, `background`, `margin`
- Variables: `{{RECIPIENT_NAME}}`
- Comments: `<!-- HTML -->`, `/* CSS */`

#### Auto-complete

Type `{{` to trigger auto-complete:
```
{{
  RECIPIENT_NAME
  EVENT_NAME
  CERTIFICATE_ID
  VALIDATION_URL
  ...
}}
```

#### Error Detection

Real-time validation checks:
- ✅ Valid HTML structure
- ✅ Closed tags
- ✅ Valid CSS syntax
- ✅ Recognized variables
- ❌ Missing closing tags
- ❌ Unknown variables
- ❌ Invalid CSS

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` / `Cmd + S` | Save template |
| `Ctrl + P` / `Cmd + P` | Preview |
| `Ctrl + F` / `Cmd + F` | Find in code |
| `Ctrl + Z` / `Cmd + Z` | Undo |
| `Ctrl + Y` / `Cmd + Y` | Redo |
| `Tab` | Indent |
| `Shift + Tab` | Outdent |

### Best Practices

#### Mobile Responsiveness

Use responsive design:
```html
<style>
  @media (max-width: 600px) {
    .container {
      width: 100% !important;
      padding: 10px !important;
    }
  }
</style>
```

#### Email Client Compatibility

- Use inline CSS for critical styles
- Use tables for layout
- Avoid JavaScript (not supported in email)
- Test on multiple clients (Gmail, Outlook, Apple Mail)

#### Accessibility

```html
<!-- Alt text for images -->
<img src="logo.png" alt="GDGoC Logo">

<!-- Descriptive link text -->
<a href="{{VALIDATION_URL}}">Validate Your Certificate</a>
```

#### Performance

- Optimize images (use CDN)
- Keep HTML under 100KB
- Minimize inline CSS

---

## Organization Name Policy

### Why Organization Name is Locked

1. **Certificate Validity**: Organization name appears on all certificates and must remain consistent
2. **Historical Accuracy**: Previously issued certificates reference the organization name
3. **Trust & Authentication**: Prevents unauthorized changes that could affect certificate verification
4. **Compliance**: Ensures organizational accountability

### When You Need to Change It

Organization name changes may be needed for:
- Organization rebranding
- Merger or acquisition
- Correction of typo/error

### How to Request Organization Name Change

#### Step 1: Submit Support Ticket

Create a support ticket with:

**Required Information:**
- Current organization name
- Requested new organization name
- Reason for change
- Your name and email
- Organization verification documents (if applicable)

**Submit ticket to:**
- Email: support@gdg-oncampus.dev
- Support portal: [Link to support system]

#### Step 2: Verification Process

Support team will:
1. Verify your identity
2. Review change request
3. Confirm organizational authority
4. Check certificate history impact

#### Step 3: Approval & Update

If approved:
1. Support updates organization name
2. You receive confirmation email
3. New name applies to future certificates
4. Historical certificates remain unchanged

**Timeline**: 3-5 business days

### Temporary Workaround

If urgent, you can:
1. Use email template customization to display preferred name
2. Add custom message on certificates
3. Wait for official name change approval

---

## API Endpoints for Template Management

### Get All Templates

```http
GET /api/templates/email
Authorization: [Authentik headers]
```

Response:
```json
{
  "builtin": [
    {
      "name": "default.html",
      "description": "Professional template"
    }
  ],
  "custom": [
    {
      "id": "uuid",
      "name": "my-template.html",
      "description": "My custom template",
      "is_default": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Get Template Content

```http
GET /api/templates/email/:name
Authorization: [Authentik headers]
```

Response:
```json
{
  "name": "my-template.html",
  "html_content": "<!DOCTYPE html>...",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Create/Update Template

```http
POST /api/templates/email
Authorization: [Authentik headers]
Content-Type: application/json

{
  "name": "my-template.html",
  "description": "My custom template",
  "html_content": "<!DOCTYPE html>...",
  "is_default": false
}
```

### Delete Template

```http
DELETE /api/templates/email/:id
Authorization: [Authentik headers]
```

### Set Default Template

```http
PUT /api/templates/email/:id/default
Authorization: [Authentik headers]
```

---

## Troubleshooting

### Template Editor Issues

**Problem**: Editor not loading
- **Solution**: Clear browser cache, refresh page
- Check browser console for errors

**Problem**: Preview not working
- **Solution**: Check for HTML syntax errors
- Ensure all variables are valid

**Problem**: Can't save template
- **Solution**: Check template name is unique
- Ensure you have required permissions

### Organization Name Issues

**Problem**: Need to change organization name
- **Solution**: Submit support ticket (see above)

**Problem**: Wrong organization name after setup
- **Solution**: Contact support immediately
- Explain the error in detail

### Profile Update Issues

**Problem**: Name update not saving
- **Solution**: Check network connection
- Ensure name field is not empty
- Try logging out and back in

---

## Security Considerations

### Template Security

- Templates are sandboxed (no JavaScript execution)
- Only HTML and CSS allowed
- XSS protection enabled
- Template access restricted to organization

### Access Control

- Only authenticated leaders can create templates
- Templates are organization-specific
- Built-in templates cannot be modified
- Custom templates can only be edited by creator

### Data Privacy

- Templates may contain organization branding
- No personal data stored in templates
- Variables populated at send time
- Email logs retained per policy

---

## Support & Resources

### Getting Help

- Email: support@gdg-oncampus.dev
- Documentation: /documentation/
- Template examples: /backend/templates/emails/
- Community forum: [Link]

### Related Documentation

- [Email Templates Guide](./email-templates.md)
- [SMTP Provider Setup](./smtp-provider-setup.md)
- [Certificate Templates](./certificate-templates.md)
- [Nginx Proxy Manager Setup](./nginx-proxy-manager-setup.md)

---

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial release
- Profile setup with organization name lock
- Online template editor
- Template management system
- Organization name change via support ticket
