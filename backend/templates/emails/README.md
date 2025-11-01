# Email Templates

This directory contains email templates for certificate delivery notifications.

## Available Templates

### 1. default.html
**Professional template** with clean design and Google colors.
- Use for: Standard certificate delivery
- Tone: Professional, encouraging
- Features: Blue header, certificate info box, clear CTAs

### 2. celebratory.html
**Fun and energetic template** with vibrant colors.
- Use for: Special events, hackathons, major achievements
- Tone: Celebratory, enthusiastic
- Features: Gradient backgrounds, stats display, next steps section

### 3. corporate.html
**Formal template** with business-appropriate styling.
- Use for: Enterprise events, formal occasions
- Tone: Formal, official
- Features: Certificate details table, official document appearance

## Template Variables

All templates support these variables:

| Variable | Description |
|----------|-------------|
| `{{RECIPIENT_NAME}}` | Recipient's full name |
| `{{EVENT_NAME}}` | Event/workshop/course name |
| `{{CERTIFICATE_ID}}` | Unique certificate identifier |
| `{{VALIDATION_URL}}` | URL to validate certificate |
| `{{ISSUE_DATE}}` | Certificate issue date |
| `{{ORGANIZATION_NAME}}` | Issuing organization name |
| `{{PDF_URL}}` | PDF download link (optional) |
| `{{YEAR}}` | Current year |

## Using Templates

Templates use Handlebars syntax for variable substitution and conditionals:

```handlebars
{{! Basic variable }}
Hello {{RECIPIENT_NAME}}!

{{! Conditional rendering }}
{{#if PDF_URL}}
  <a href="{{PDF_URL}}">Download PDF</a>
{{/if}}
```

## Creating Custom Templates

1. Copy an existing template as a starting point
2. Save it in the `custom/` subdirectory
3. Modify the HTML and styling
4. Test with sample data
5. Register the template in the database

See [documentation/email-templates.md](../../documentation/email-templates.md) for complete guide.

## Email Client Compatibility

Templates are designed to work with:
- Gmail
- Outlook (desktop and web)
- Apple Mail
- Yahoo Mail
- Mobile clients (iOS, Android)

**Best Practices:**
- Use inline CSS (not external stylesheets)
- Keep width under 600px
- Provide plain text alternatives
- Test on multiple clients

## Testing Templates

To preview a template:

```bash
# From backend directory
npm run preview-template templates/emails/default.html
```

To send a test email:

```bash
npm run test-email -- --template default --to your-email@example.com
```

## Folder Structure

```
emails/
├── default.html          # Default professional template
├── celebratory.html      # Celebratory template
├── corporate.html        # Formal corporate template
├── custom/               # Custom organization templates
│   └── README.md
└── README.md            # This file
```

## Support

For help with email templates:
- See [documentation/email-templates.md](../../documentation/email-templates.md)
- Check email service logs for debugging
- Test templates before production use
