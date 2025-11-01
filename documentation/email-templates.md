# Email Template Guide

This guide explains how to create, customize, and manage email templates for certificate delivery in the GDGoC Certificate Generator.

## Overview

The email template system allows leaders to:
- Choose from pre-built email templates
- Customize templates for their organization
- Create new templates with their own branding
- Store templates for reuse across certificates

## Template Structure

Email templates support:
- **HTML formatting** for rich email content
- **Variable placeholders** for dynamic content
- **Inline CSS** for styling (for email client compatibility)
- **Custom branding** (logos, colors, organization info)

## Available Variables

Templates can use the following placeholders that will be replaced with actual values:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{RECIPIENT_NAME}}` | Recipient's full name | John Doe |
| `{{EVENT_NAME}}` | Event/workshop/course name | Advanced React Workshop |
| `{{EVENT_TYPE}}` | Type of event | Workshop, Course, Event |
| `{{CERTIFICATE_ID}}` | Unique certificate identifier | CERT-2024-ABC123 |
| `{{VALIDATION_URL}}` | URL to validate certificate | https://certs.gdg.../validate/... |
| `{{ISSUE_DATE}}` | Certificate issue date | January 15, 2024 |
| `{{ORGANIZATION_NAME}}` | Issuing organization | GDGoC Chapter Name |
| `{{ORGANIZATION_LOGO}}` | Organization logo URL | https://... |
| `{{PDF_URL}}` | Certificate PDF download link | https://... (optional) |
| `{{CUSTOM_MESSAGE}}` | Leader's custom message | Keep learning! |

## Pre-built Templates

### 1. Default Template (Professional)

**Use case**: Standard certificate delivery, professional tone

**Features**:
- Clean, professional design
- Google colors (blue header)
- Clear call-to-action buttons
- Mobile-responsive

**Preview**:
```
Subject: Your Certificate for {{EVENT_NAME}}

┌─────────────────────────────────────┐
│   🎉 Congratulations!               │
│   [Blue Header]                     │
├─────────────────────────────────────┤
│                                     │
│   Dear {{RECIPIENT_NAME}},          │
│                                     │
│   Congratulations on completing     │
│   {{EVENT_NAME}}!                   │
│                                     │
│   Certificate ID: {{CERTIFICATE_ID}}│
│                                     │
│   [Validate Certificate Button]    │
│   [Download PDF Button]            │
│                                     │
│   Best regards,                     │
│   {{ORGANIZATION_NAME}}             │
│                                     │
├─────────────────────────────────────┤
│   GDGoC Team                        │
└─────────────────────────────────────┘
```

### 2. Celebratory Template (Fun)

**Use case**: Special events, hackathons, celebrations

**Features**:
- Vibrant colors and emojis
- Celebratory tone
- Social media sharing encouragement
- Achievement highlights

**Preview**:
```
Subject: 🎊 You Did It! Your {{EVENT_NAME}} Certificate

┌─────────────────────────────────────┐
│   🎊🎉🎈 CONGRATULATIONS! 🎈🎉🎊   │
│   [Gradient Header]                 │
├─────────────────────────────────────┤
│                                     │
│   Hey {{RECIPIENT_NAME}}! 👋        │
│                                     │
│   You've successfully completed     │
│   {{EVENT_NAME}} and we couldn't be │
│   more excited for you! 🚀          │
│                                     │
│   Your Achievement:                 │
│   ✅ Completed {{EVENT_NAME}}       │
│   ✅ Certificate Earned             │
│   ✅ Skills Upgraded                │
│                                     │
│   [Celebrate Button]                │
│   [Share on LinkedIn]               │
│                                     │
│   Keep the momentum going! 💪       │
│                                     │
└─────────────────────────────────────┘
```

### 3. Minimal Template (Simple)

**Use case**: Quick notifications, batch sending

**Features**:
- Plain text emphasis
- Fast loading
- Essential information only
- High deliverability

**Preview**:
```
Subject: Certificate Ready - {{EVENT_NAME}}

Hello {{RECIPIENT_NAME}},

Your certificate for {{EVENT_NAME}} is ready.

Certificate ID: {{CERTIFICATE_ID}}
Validate: {{VALIDATION_URL}}

{{ORGANIZATION_NAME}}
```

### 4. Corporate Template (Formal)

**Use case**: Enterprise events, formal occasions

**Features**:
- Formal tone
- Professional layout
- Organization branding
- Official appearance

**Preview**:
```
Subject: Certificate of Completion - {{EVENT_NAME}}

┌─────────────────────────────────────┐
│   [Organization Logo]               │
│                                     │
│   CERTIFICATE OF COMPLETION         │
├─────────────────────────────────────┤
│                                     │
│   Dear {{RECIPIENT_NAME}},          │
│                                     │
│   This is to certify that you have  │
│   successfully completed:           │
│                                     │
│   {{EVENT_NAME}}                    │
│   Issued: {{ISSUE_DATE}}            │
│                                     │
│   Certificate Number:               │
│   {{CERTIFICATE_ID}}                │
│                                     │
│   [Verify Authenticity]             │
│                                     │
│   Sincerely,                        │
│   {{ORGANIZATION_NAME}}             │
│                                     │
└─────────────────────────────────────┘
```

### 5. Achievement Template (Gamified)

**Use case**: Gamified learning, badges, milestones

**Features**:
- Achievement badge design
- Progress indicators
- Next steps guidance
- Motivational tone

**Preview**:
```
Subject: 🏆 New Achievement Unlocked: {{EVENT_NAME}}

┌─────────────────────────────────────┐
│   🏆 ACHIEVEMENT UNLOCKED!          │
├─────────────────────────────────────┤
│                                     │
│   Congratulations {{RECIPIENT_NAME}}!│
│                                     │
│   You've earned:                    │
│   📜 {{EVENT_NAME}} Certificate     │
│                                     │
│   Stats:                            │
│   🎯 Completion: 100%               │
│   ⭐ Certificate ID: {{CERTIFICATE_ID}}│
│                                     │
│   [View Achievement]                │
│   [Share Badge]                     │
│                                     │
│   What's Next?                      │
│   → Advanced courses                │
│   → Community events                │
│   → More certifications             │
│                                     │
└─────────────────────────────────────┘
```

## Template Files Location

Templates are stored in:
```
backend/templates/emails/
├── default.html              # Default professional template
├── celebratory.html          # Celebratory template
├── minimal.html              # Minimal template
├── corporate.html            # Corporate template
├── achievement.html          # Achievement template
└── custom/                   # Custom leader templates
    ├── chapter1.html
    ├── chapter2.html
    └── ...
```

## Creating Custom Templates

### Step 1: Create HTML Template

Create a new HTML file with your template:

**templates/emails/custom/my-template.html**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Inline CSS for email compatibility */
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px 20px;
      color: #333;
    }
    .content p {
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .certificate-box {
      background-color: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 5px;
      text-align: center;
    }
    .button:hover {
      background-color: #5568d3;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎓 {{ORGANIZATION_NAME}}</h1>
      <p>Certificate Achievement</p>
    </div>
    <div class="content">
      <p>Dear {{RECIPIENT_NAME}},</p>
      
      <p>Congratulations on successfully completing <strong>{{EVENT_NAME}}</strong>!</p>
      
      <div class="certificate-box">
        <strong>Certificate Details:</strong><br>
        Certificate ID: {{CERTIFICATE_ID}}<br>
        Event: {{EVENT_NAME}}<br>
        Issued: {{ISSUE_DATE}}
      </div>
      
      <p>{{CUSTOM_MESSAGE}}</p>
      
      <p style="text-align: center;">
        <a href="{{VALIDATION_URL}}" class="button">📜 Validate Certificate</a>
        {{#if PDF_URL}}
        <a href="{{PDF_URL}}" class="button">⬇️ Download PDF</a>
        {{/if}}
      </p>
      
      <p>Keep this certificate ID safe for future verification.</p>
      
      <p>Best regards,<br>
      {{ORGANIZATION_NAME}} Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>&copy; {{YEAR}} Google Developer Groups on Campus</p>
    </div>
  </div>
</body>
</html>
```

### Step 2: Test Template

Test your template with sample data:

```bash
# Navigate to backend directory
cd backend

# Create test script
node scripts/test-email-template.js --template custom/my-template.html
```

### Step 3: Save Template

Save the template in the database for reuse:

```javascript
// Add template via API
POST /api/email-templates
{
  "name": "My Custom Template",
  "description": "Custom template for our chapter",
  "template_file": "custom/my-template.html",
  "is_default": false,
  "variables": [
    "RECIPIENT_NAME",
    "EVENT_NAME",
    "CERTIFICATE_ID",
    "VALIDATION_URL"
  ]
}
```

## Using Templates

### Via API

When creating a certificate, specify the template:

```javascript
POST /api/certificates
{
  "recipient_name": "John Doe",
  "event_name": "React Workshop",
  "email_template_id": "template-uuid",  // Or use "default"
  "custom_message": "Great job! Keep learning!"
}
```

### Via Admin Interface

1. Navigate to **Settings** → **Email Templates**
2. Select a template from the library
3. Preview the template with sample data
4. Customize variables if needed
5. Set as default (optional)

## Template Management

### Database Schema

Email templates are stored in the database:

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_file VARCHAR(255) NOT NULL,
    html_content TEXT,
    subject_line VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    variables JSONB,  -- Array of variable names used
    metadata JSONB    -- Custom settings
);

CREATE INDEX idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX idx_email_templates_default ON email_templates(is_default) WHERE is_default = true;
```

### Per-Leader Customization

Leaders can:

1. **Select Template**: Choose from pre-built templates
2. **Customize Variables**: Set custom messages, branding
3. **Save Preferences**: Store template preferences per organization
4. **Create Custom**: Design completely new templates

### Template Permissions

- **Leaders**: Can view all templates, customize for their org
- **Admins**: Can create, edit, delete templates
- **Super Admin**: Can set system-wide defaults

## Email Client Compatibility

Templates are tested with:
- Gmail
- Outlook (desktop and web)
- Apple Mail
- Yahoo Mail
- Mobile clients (iOS, Android)

**Best Practices**:
- Use inline CSS (not external stylesheets)
- Keep width under 600px
- Test on multiple clients
- Provide plain text alternative
- Avoid JavaScript
- Use web-safe fonts

## Variables and Handlebars

Templates use Handlebars syntax for logic:

```handlebars
{{! Basic variable }}
{{RECIPIENT_NAME}}

{{! Conditional }}
{{#if PDF_URL}}
<a href="{{PDF_URL}}">Download PDF</a>
{{/if}}

{{! Loop (for multiple certificates) }}
{{#each certificates}}
  <li>{{name}}: {{id}}</li>
{{/each}}

{{! Default value }}
{{ORGANIZATION_NAME}} or "GDGoC"
```

## Personalization Options

### Dynamic Content

Add personalized sections based on:
- Event type (workshop, course, hackathon)
- Achievement level (beginner, intermediate, advanced)
- Organization branding
- Time of day (Good morning/afternoon/evening)

### Example Personalization

```javascript
const template = {
  greeting: getTimeBasedGreeting(),  // "Good morning"
  tone: event.type === 'hackathon' ? 'celebratory' : 'professional',
  colors: organization.brandColors,
  logo: organization.logoUrl
};
```

## Testing Templates

### Test Email Service

```javascript
// backend/src/services/emailService.js
export async function sendTestEmail(templateId, recipientEmail) {
  const template = await loadTemplate(templateId);
  
  const testData = {
    RECIPIENT_NAME: "Test User",
    EVENT_NAME: "Sample Workshop",
    CERTIFICATE_ID: "TEST-" + Date.now(),
    VALIDATION_URL: "https://example.com/validate/test",
    ISSUE_DATE: new Date().toLocaleDateString(),
    ORGANIZATION_NAME: "Test Chapter",
    CUSTOM_MESSAGE: "This is a test email"
  };
  
  await sendEmail(recipientEmail, template, testData);
}
```

### Preview in Browser

Templates can be previewed in a browser:

```bash
# Start preview server
npm run preview-template -- templates/emails/default.html
```

## Analytics and Tracking

Track email performance:
- Open rates
- Click-through rates (validation link)
- Download rates (PDF)
- Delivery success

```javascript
// Add tracking parameters
const validationUrl = `${baseUrl}?cert=${certId}&utm_source=email&utm_medium=cert&utm_campaign=${eventName}`;
```

## Troubleshooting

### Template Not Rendering

1. Check HTML syntax
2. Verify all variables are provided
3. Test with minimal template
4. Check CSS compatibility

### Images Not Showing

1. Use absolute URLs (https://)
2. Host images externally
3. Test image URLs
4. Check email client settings

### Styling Issues

1. Use inline CSS
2. Avoid complex layouts
3. Test on multiple clients
4. Use tables for layout (email-safe)

## Best Practices

1. **Keep it Simple**: Avoid complex layouts and JavaScript
2. **Mobile-First**: Design for mobile screens
3. **Clear CTA**: Make validation/download buttons prominent
4. **Brand Consistency**: Use organization colors and logo
5. **Accessibility**: Use proper heading structure, alt text
6. **Test Thoroughly**: Test on all major email clients
7. **Plain Text**: Always provide plain text version
8. **Unsubscribe**: Include unsubscribe option if required
9. **Legal**: Include required legal information
10. **Performance**: Optimize images, keep HTML size small

## Resources

- [Email Client CSS Support](https://www.caniemail.com/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/)
- [HTML Email Templates](https://github.com/leemunroe/responsive-html-email-template)
- [Nodemailer Documentation](https://nodemailer.com/)

## Support

For issues with email templates:
- Check template syntax and variables
- Review email service logs
- Test with different providers
- Contact system administrator for database access
