# Custom Email Templates

This directory is for organization-specific custom email templates.

## Creating Custom Templates

Leaders can create custom templates for their organization:

1. **Copy a base template**:
   ```bash
   cp ../default.html custom/my-chapter-template.html
   ```

2. **Customize the template**:
   - Update colors to match your chapter branding
   - Add your organization logo
   - Modify the messaging and tone
   - Add custom sections

3. **Use supported variables**:
   - `{{RECIPIENT_NAME}}` - Recipient's name
   - `{{EVENT_NAME}}` - Event name
   - `{{CERTIFICATE_ID}}` - Certificate ID
   - `{{VALIDATION_URL}}` - Validation link
   - `{{ORGANIZATION_NAME}}` - Your chapter name
   - And more (see parent README.md)

4. **Test your template**:
   ```bash
   npm run test-email -- --template custom/my-chapter-template.html --to your-email@example.com
   ```

5. **Register in database** (via admin interface or API):
   ```javascript
   POST /api/email-templates
   {
     "name": "My Chapter Template",
     "template_file": "custom/my-chapter-template.html",
     "organization_id": "your-org-uuid"
   }
   ```

## Template Customization Guide

### Adding Your Logo

Replace the placeholder with your logo:

```html
<!-- Replace this -->
<div class="header">
  <h1>Organization Name</h1>
</div>

<!-- With this -->
<div class="header">
  <img src="https://your-domain.com/logo.png" alt="Logo" style="height: 60px;">
  <h1>{{ORGANIZATION_NAME}}</h1>
</div>
```

### Changing Colors

Update the color scheme to match your branding:

```css
/* Change primary color */
.header {
  background-color: #YOUR_COLOR; /* Replace #4285f4 */
}

.button {
  background-color: #YOUR_COLOR; /* Replace #4285f4 */
}
```

### Adding Custom Sections

Add organization-specific content:

```html
<div class="custom-section">
  <h3>Join Our Community</h3>
  <p>Connect with us on social media:</p>
  <a href="https://your-social-link">LinkedIn</a> |
  <a href="https://your-social-link">Twitter</a>
</div>
```

### Personalizing Messages

Add leader-specific messaging:

```html
<div class="leader-message">
  <p><em>"Congratulations on this achievement! Your dedication to learning 
  inspires us all. Keep building amazing things!"</em></p>
  <p><strong>- Chapter Lead Name</strong></p>
</div>
```

## Best Practices

1. **Keep it simple**: Avoid complex layouts that break in email clients
2. **Test thoroughly**: Test on Gmail, Outlook, and mobile devices
3. **Use inline CSS**: External stylesheets don't work in emails
4. **Optimize images**: Host images externally, use absolute URLs
5. **Provide fallbacks**: Include plain text version
6. **Stay accessible**: Use proper heading structure and alt text

## Examples

### Minimal Color Change

```html
<style>
  /* Change only the primary color */
  .header { background-color: #e74c3c; } /* Red */
  .button { background-color: #e74c3c; }
</style>
```

### Adding Social Links

```html
<div class="footer">
  <p>Follow us:</p>
  <a href="https://linkedin.com/company/your-chapter">LinkedIn</a> |
  <a href="https://twitter.com/your-chapter">Twitter</a> |
  <a href="https://instagram.com/your-chapter">Instagram</a>
</div>
```

### Custom Achievement Badge

```html
<div style="text-align: center; margin: 20px 0;">
  <img src="https://your-domain.com/badges/{{EVENT_TYPE}}.png" 
       alt="Achievement Badge" 
       style="width: 150px; height: 150px;">
</div>
```

## Template Storage

Custom templates are stored per organization and can be:
- Set as default for all certificates
- Selected individually per certificate issuance
- Edited through the admin interface
- Versioned for tracking changes

## Support

Need help with custom templates?
- Check the main documentation: [../../documentation/email-templates.md](../../documentation/email-templates.md)
- Review existing templates for reference
- Test templates before production use
- Contact your system administrator for database access
