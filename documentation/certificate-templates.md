# Certificate Template Guide

This guide explains how to add and customize certificate templates for the GDGoC Certificate Generator application.

## Overview

The GDGoC Certificate Generator creates certificates for workshops and courses. This guide covers:
- Creating certificate templates
- Template design requirements
- Integration with the application
- PDF generation setup

## Certificate Template Requirements

### File Formats

Supported template formats:
- **SVG** (Recommended) - Scalable, editable, and easy to generate PDFs from
- **HTML/CSS** - For dynamic rendering with template engines
- **PDF** - Pre-designed templates with variable placeholders

### Template Information

Each certificate template should include placeholders for:
- **Recipient Name**: The person receiving the certificate
- **Event Type**: Workshop or Course
- **Event Name**: Specific name of the workshop/course
- **Issue Date**: When the certificate was issued
- **Issuer Name**: Name of the person/organization issuing it
- **Organization Name**: GDGoC chapter name
- **Unique ID**: For validation purposes

## Template Design Guidelines

### Design Specifications

**Dimensions:**
- Standard size: A4 (210mm × 297mm) or Letter (8.5" × 11")
- Resolution: 300 DPI for print quality
- Orientation: Landscape recommended for certificates

**Colors:**
- Use your GDGoC chapter branding colors
- Ensure good contrast for readability
- Consider both digital and print display

**Typography:**
- Use professional, readable fonts
- Minimum font size: 14pt for body text
- Larger fonts (24-36pt) for names and titles

**Branding:**
- Include GDGoC logo (if permitted)
- Include your chapter logo
- Google Developer branding (follow Google's brand guidelines)

### Template Structure

A typical certificate template includes:

```
┌─────────────────────────────────────────────────┐
│  [Header: Logo + Title]                         │
│                                                  │
│  Certificate of [Achievement/Completion]        │
│                                                  │
│  This is to certify that                        │
│                                                  │
│  [RECIPIENT NAME - Large Font]                  │
│                                                  │
│  has successfully completed                      │
│                                                  │
│  [EVENT NAME]                                   │
│  [Event Type: Workshop/Course]                  │
│                                                  │
│  Date: [ISSUE DATE]                             │
│  Certificate ID: [UNIQUE_ID]                    │
│                                                  │
│  [Issuer Signature]        [Organization Name]  │
│  [Issuer Name]                                  │
└─────────────────────────────────────────────────┘
```

## Creating SVG Templates

### Step 1: Design the Template

Use a vector graphics editor:
- **Inkscape** (Free) - Recommended for beginners
- **Adobe Illustrator** - Professional option
- **Figma** or **Sketch** - For web-based design

### Step 2: Add Placeholders

Use text placeholders in your design:
- `{{RECIPIENT_NAME}}` - Recipient's name
- `{{EVENT_NAME}}` - Event name
- `{{EVENT_TYPE}}` - Workshop or Course
- `{{ISSUE_DATE}}` - Issue date
- `{{ISSUER_NAME}}` - Issuer's name
- `{{ORG_NAME}}` - Organization name
- `{{UNIQUE_ID}}` - Certificate validation ID

**Example SVG snippet:**
```xml
<text x="400" y="300" font-size="36" text-anchor="middle" font-weight="bold">
  {{RECIPIENT_NAME}}
</text>
<text x="400" y="400" font-size="20" text-anchor="middle">
  has successfully completed
</text>
<text x="400" y="450" font-size="24" text-anchor="middle">
  {{EVENT_NAME}}
</text>
```

### Step 3: Export the Template

1. Ensure all text is editable (not converted to paths)
2. Save as SVG with text elements preserved
3. Clean up the SVG (remove unnecessary metadata)
4. Test the SVG in a web browser

### Step 4: Add to Templates Directory

```bash
# Create templates directory if it doesn't exist
mkdir -p backend/templates/certificates

# Copy your template
cp my-certificate-template.svg backend/templates/certificates/default.svg
```

## Creating HTML/CSS Templates

### Template Structure

Create a template file using a template engine like Handlebars or EJS:

**templates/certificates/default.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .certificate {
      background: white;
      padding: 60px;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 800px;
      text-align: center;
    }
    h1 {
      font-size: 36px;
      color: #333;
      margin-bottom: 20px;
    }
    .recipient-name {
      font-size: 48px;
      color: #667eea;
      margin: 30px 0;
      font-weight: bold;
    }
    .event-name {
      font-size: 28px;
      color: #555;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      font-size: 14px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <h1>Certificate of Achievement</h1>
    <p>This is to certify that</p>
    <div class="recipient-name">{{recipientName}}</div>
    <p>has successfully completed</p>
    <div class="event-name">{{eventName}}</div>
    <p>{{eventType}}</p>
    <div class="footer">
      <p>Issued on: {{issueDate}}</p>
      <p>By: {{issuerName}}</p>
      <p>Organization: {{orgName}}</p>
      <p>Certificate ID: {{uniqueId}}</p>
    </div>
  </div>
</body>
</html>
```

## Integrating Templates with the Application

### Option 1: Server-Side Rendering (Recommended)

Install required packages:
```bash
cd backend
npm install puppeteer handlebars
```

Create a certificate generator service:

**backend/src/services/certificateGenerator.js:**
```javascript
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export async function generateCertificatePDF(certificateData) {
  // Load template
  const templatePath = path.join(process.cwd(), 'templates/certificates/default.html');
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  
  // Compile template
  const template = Handlebars.compile(templateSource);
  
  // Render with data
  const html = template(certificateData);
  
  // Generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  
  await browser.close();
  
  return pdf;
}
```

### Option 2: Client-Side Rendering

Use libraries like:
- **jsPDF** - Client-side PDF generation
- **html2canvas** - Convert HTML to canvas, then to PDF
- **pdfmake** - PDF creation library

### Option 3: External Service

Use external PDF generation services:
- **PDFShift** - HTML to PDF API
- **CloudConvert** - Document conversion API
- **API2PDF** - HTML/URL to PDF API

## Template Storage

### Local Storage

```
backend/
├── templates/
│   └── certificates/
│       ├── default.html         # Default template
│       ├── workshop.html        # Workshop-specific
│       ├── course.html          # Course-specific
│       └── custom/              # Custom chapter templates
│           ├── chapter1.html
│           └── chapter2.html
```

### Database Storage

Store templates in the database for dynamic management:

```sql
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT CHECK (template_type IN ('html', 'svg', 'pdf')),
    template_content TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cloud Storage

Store templates in cloud storage for scalability:
- **AWS S3** - Object storage
- **Google Cloud Storage** - GCS
- **Azure Blob Storage** - Azure

## PDF Generation Setup

### Using Puppeteer (Recommended)

**1. Install Puppeteer:**
```bash
cd backend
npm install puppeteer
```

**2. Update Dockerfile to include Chromium:**

**backend/Dockerfile:**
```dockerfile
FROM node:20-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY templates ./templates

EXPOSE 3001

CMD ["node", "src/index.js"]
```

**3. Generate PDF in Certificate Route:**

```javascript
import { generateCertificatePDF } from '../services/certificateGenerator.js';

router.post('/certificates', async (req, res) => {
  // ... create certificate in database ...
  
  // Generate PDF
  const certificateData = {
    recipientName: req.body.recipient_name,
    eventName: req.body.event_name,
    eventType: req.body.event_type,
    issueDate: new Date().toLocaleDateString(),
    issuerName: req.user.name,
    orgName: req.user.org_name,
    uniqueId: certificate.unique_id
  };
  
  const pdfBuffer = await generateCertificatePDF(certificateData);
  
  // Save PDF or return to client
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.unique_id}.pdf"`);
  res.send(pdfBuffer);
});
```

## Template Customization

### Per-Organization Templates

Allow each organization to have custom templates:

```javascript
// Load organization-specific template if available
const templateName = `${orgName}-${eventType}.html`;
const customTemplatePath = path.join(process.cwd(), 'templates/certificates/custom', templateName);

let templatePath;
try {
  await fs.access(customTemplatePath);
  templatePath = customTemplatePath;
} catch {
  // Fall back to default template
  templatePath = path.join(process.cwd(), 'templates/certificates/default.html');
}
```

### Dynamic Template Selection

Allow admins to choose templates via UI:

```javascript
router.post('/certificates', async (req, res) => {
  const templateId = req.body.template_id || 'default';
  
  // Load selected template
  const template = await db.query(
    'SELECT template_content FROM certificate_templates WHERE id = $1',
    [templateId]
  );
  
  // Generate certificate with selected template
  // ...
});
```

## Testing Templates

### Manual Testing

1. Create test certificates with sample data
2. Check all placeholders are replaced correctly
3. Verify layout and spacing
4. Test PDF generation
5. Print a test certificate

### Automated Testing

Create tests for template generation:

```javascript
import { generateCertificatePDF } from './certificateGenerator.js';

describe('Certificate Generation', () => {
  test('should generate PDF with correct data', async () => {
    const testData = {
      recipientName: 'John Doe',
      eventName: 'Advanced React Workshop',
      eventType: 'Workshop',
      issueDate: '2024-01-15',
      issuerName: 'Jane Smith',
      orgName: 'GDGoC Chapter Name',
      uniqueId: 'TEST-123-ABC'
    };
    
    const pdf = await generateCertificatePDF(testData);
    
    expect(pdf).toBeDefined();
    expect(pdf.length).toBeGreaterThan(0);
  });
});
```

## Best Practices

1. **Version Control**: Keep templates in version control
2. **Backups**: Regularly backup custom templates
3. **Documentation**: Document template variables and requirements
4. **Testing**: Test templates with various data lengths
5. **Accessibility**: Ensure certificates are accessible (proper contrast, fonts)
6. **Branding**: Follow brand guidelines consistently
7. **Performance**: Optimize template size and complexity
8. **Security**: Validate all input data before inserting into templates

## Troubleshooting

### PDF Generation Fails

1. Check Puppeteer/Chromium installation
2. Verify template syntax (HTML/CSS validity)
3. Check server resources (memory, CPU)
4. Review error logs

### Template Not Rendering Correctly

1. Validate HTML/CSS syntax
2. Test template in browser first
3. Check font availability
4. Verify image paths are correct

### Placeholders Not Replaced

1. Verify placeholder syntax matches template engine
2. Check data is passed correctly to template
3. Ensure template compilation succeeds

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [HTML to PDF Best Practices](https://www.smashingmagazine.com/2019/06/create-pdfs-html-css/)
- [Certificate Design Examples](https://www.canva.com/templates/certificates/)
- [Google Brand Guidelines](https://developers.google.com/style/branding)

## Support

For issues with certificate templates:
- Check template syntax and structure
- Review PDF generation logs
- Test with sample data
- Consult the community for design feedback
