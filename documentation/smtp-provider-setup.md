# SMTP Provider Setup Guide

This guide explains how to configure SMTP providers for the GDGoC Certificate Generator to send certificate emails.

## Overview

The application uses SMTP (Simple Mail Transfer Protocol) to send certificates via email. This guide covers:
- Configuring different SMTP providers
- Setting up environment variables
- Testing email delivery
- Troubleshooting common issues

## SMTP Configuration

### Environment Variables

SMTP settings are configured in the root `.env` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.example.com        # SMTP server hostname
SMTP_PORT=587                      # SMTP port (25, 465, 587, 2525)
SMTP_SECURE=starttls               # Security type: starttls, ssl, or none
SMTP_USER=your-username            # SMTP authentication username
SMTP_PASS=your-password            # SMTP authentication password
SMTP_FROM="Sender Name" <email@example.com>  # From address

# Public hostname for email links
PUBLIC_HOSTNAME=certs.gdg-oncampus.dev
```

### SMTP Security Options

The `SMTP_SECURE` variable controls the encryption method:

- **starttls** (Recommended): Use STARTTLS encryption
  - Port: 587
  - Starts as plain connection, upgrades to TLS
  - Most modern SMTP servers support this
  
- **ssl**: Use SSL/TLS encryption
  - Port: 465
  - Encrypted from the start
  - Also called "implicit TLS"
  
- **none**: No encryption (not recommended)
  - Port: 25 or 2525
  - Plain text connection
  - Often blocked by ISPs and cloud providers

**Recommendation**: Use `starttls` with port 587 for best compatibility and security.

### Port and Security Combinations

| Port | SMTP_SECURE | Description | Recommended |
|------|-------------|-------------|-------------|
| 587 | `starttls` | STARTTLS (upgrade to TLS) | ✅ Yes |
| 465 | `ssl` | SSL/TLS (implicit) | ✅ Yes |
| 25 | `none` | Plain SMTP | ❌ No (blocked) |
| 2525 | `starttls` or `none` | Alternative port | ⚠️ If needed |

## Supported SMTP Providers

### Brevo (Recommended for GDGoC)

**Features:**
- Free tier: 300 emails/day
- Reliable delivery
- Easy setup
- Good for small to medium volumes

**Setup:**

1. **Create Brevo Account:**
   - Go to [Brevo](https://www.brevo.com/)
   - Sign up for a free account
   - Verify your email address

2. **Get SMTP Credentials:**
   - Navigate to **SMTP & API** → **SMTP**
   - Click **"Generate a new SMTP key"**
   - Note your credentials:
     - SMTP server: `smtp-relay.brevo.com`
     - Port: `587`
     - Login: Your Brevo email
     - Password: Generated SMTP key

3. **Configure .env:**
   ```bash
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_SECURE=starttls
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-generated-smtp-key
   SMTP_FROM="GDGoC Certificates" <noreply@yourdomain.com>
   ```

4. **Verify Sender Domain (Optional but Recommended):**
   - Go to **Senders & IP** → **Domains**
   - Add your domain
   - Add DNS records (SPF, DKIM, DMARC)
   - Improves deliverability

**Limits:**
- Free: 300 emails/day
- Lite: From $25/month for more emails
- Premium: Custom pricing

### Gmail / Google Workspace

**Features:**
- Free with Google account
- 500 emails/day (Gmail)
- 2,000 emails/day (Google Workspace)
- Familiar and reliable

**Setup:**

1. **Enable 2-Factor Authentication:**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Create App Password:**
   - Go to Security → 2-Step Verification
   - Scroll to "App passwords"
   - Generate a new app password
   - Select "Mail" and "Other"
   - Name it "GDGoC Certs"

3. **Configure .env:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=starttls
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM="GDGoC Certificates" <your-email@gmail.com>
   ```

**Important Notes:**
- Must use App Password, not regular password
- May trigger security alerts initially
- Consider Google Workspace for higher limits

**Limits:**
- Gmail: 500 emails/day
- Google Workspace: 2,000 emails/day

### SendGrid

**Features:**
- Free tier: 100 emails/day
- Scalable pricing
- Advanced analytics
- Email validation

**Setup:**

1. **Create SendGrid Account:**
   - Go to [SendGrid](https://sendgrid.com/)
   - Sign up for free account
   - Verify your email

2. **Create API Key:**
   - Go to **Settings** → **API Keys**
   - Click **"Create API Key"**
   - Give it "Full Access" or "Mail Send" permissions
   - Save the API key (shown only once)

3. **Configure .env:**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=starttls
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM="GDGoC Certificates" <verified@yourdomain.com>
   ```

4. **Verify Sender:**
   - Go to **Settings** → **Sender Authentication**
   - Verify a single sender or domain

**Limits:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails

### Mailgun

**Features:**
- Free tier: 5,000 emails/month (first 3 months)
- Pay as you go
- Email validation
- Good API

**Setup:**

1. **Create Mailgun Account:**
   - Go to [Mailgun](https://www.mailgun.com/)
   - Sign up for free
   - Verify email

2. **Get SMTP Credentials:**
   - Go to **Sending** → **Domain Settings**
   - Find your sandbox domain or add custom domain
   - Note SMTP credentials

3. **Configure .env:**
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=starttls
   SMTP_USER=postmaster@yourdomain.mailgun.org
   SMTP_PASS=your-mailgun-smtp-password
   SMTP_FROM="GDGoC Certificates" <noreply@yourdomain.com>
   ```

4. **Add Custom Domain (Recommended):**
   - Add your domain in Mailgun
   - Configure DNS records
   - Verify domain

**Limits:**
- Trial: 5,000 emails/month for 3 months
- Foundation: $35/month for 50,000 emails
- Growth: Custom pricing

### Amazon SES (AWS Simple Email Service)

**Features:**
- Very cheap ($0.10 per 1,000 emails)
- Highly scalable
- Integration with AWS services
- Production-ready

**Setup:**

1. **Create AWS Account:**
   - Sign up at [AWS](https://aws.amazon.com/)
   - Complete verification

2. **Set Up SES:**
   - Go to SES Console
   - Choose your region
   - Verify email address or domain
   - Request production access (initially in sandbox)

3. **Create SMTP Credentials:**
   - Go to **SMTP Settings**
   - Click **"Create My SMTP Credentials"**
   - Save the credentials

4. **Configure .env:**
   ```bash
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=starttls
   SMTP_USER=your-ses-smtp-username
   SMTP_PASS=your-ses-smtp-password
   SMTP_FROM="GDGoC Certificates" <verified@yourdomain.com>
   ```

**Limits:**
- Sandbox: 200 emails/day to verified addresses
- Production: 50,000 emails/day (can request increase)
- Pricing: $0.10 per 1,000 emails

### Postmark

**Features:**
- Fast delivery
- Great deliverability rates
- Simple pricing
- Good for transactional emails

**Setup:**

1. **Create Postmark Account:**
   - Go to [Postmark](https://postmarkapp.com/)
   - Sign up (45-day free trial)

2. **Add Server:**
   - Create a new server
   - Get SMTP credentials

3. **Configure .env:**
   ```bash
   SMTP_HOST=smtp.postmarkapp.com
   SMTP_PORT=587
   SMTP_SECURE=starttls
   SMTP_USER=your-postmark-server-token
   SMTP_PASS=your-postmark-server-token
   SMTP_FROM="GDGoC Certificates" <verified@yourdomain.com>
   ```

4. **Verify Sender Signature:**
   - Add and verify your sender email/domain
   - Configure DNS records

**Limits:**
- Free trial: 100 emails
- $15/month: 10,000 emails
- $50/month: 50,000 emails

### Microsoft 365 / Outlook

**Features:**
- Included with Microsoft 365
- Good for organizations already using Microsoft
- Reliable delivery

**Setup:**

1. **Enable SMTP Authentication:**
   - Go to Microsoft 365 Admin Center
   - Enable authenticated SMTP

2. **Configure .env:**
   ```bash
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_SECURE=starttls
   SMTP_USER=your-email@yourdomain.com
   SMTP_PASS=your-password
   SMTP_FROM="GDGoC Certificates" <your-email@yourdomain.com>
   ```

**Limits:**
- 10,000 recipients/day
- 30 messages/minute

## Testing SMTP Configuration

### Test Email Script

Create a test script to verify SMTP settings:

**backend/scripts/test-email.js:**
```javascript
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'ssl',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function testEmail() {
  try {
    // Verify connection
    await transporter.verify();
    console.log('✓ SMTP connection verified');
    
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'test-recipient@example.com',  // Change this
      subject: 'Test Email - GDGoC Certificate Generator',
      text: 'This is a test email from the GDGoC Certificate Generator.',
      html: '<p>This is a <strong>test email</strong> from the GDGoC Certificate Generator.</p>'
    });
    
    console.log('✓ Test email sent successfully');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('✗ SMTP test failed:', error.message);
    process.exit(1);
  }
}

testEmail();
```

### Run the Test

```bash
cd backend
node scripts/test-email.js
```

### Using curl to Test

```bash
# Test SMTP connection
curl -v --url 'smtp://smtp.example.com:587' \
  --mail-from 'sender@example.com' \
  --mail-rcpt 'recipient@example.com' \
  --upload-file email.txt \
  --user 'username:password'
```

## Email Configuration in Application

The application uses Nodemailer for sending emails. The configuration is in:

**backend/src/services/emailService.js**

```javascript
import nodemailer from 'nodemailer';

// Create transporter using environment variables
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'ssl',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Optional: Add retry logic
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5
});

export async function sendCertificateEmail(recipientEmail, certificateData) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: recipientEmail,
    subject: `Your ${certificateData.eventType} Certificate - ${certificateData.eventName}`,
    html: `
      <h2>Congratulations!</h2>
      <p>Dear ${certificateData.recipientName},</p>
      <p>You have successfully completed <strong>${certificateData.eventName}</strong>.</p>
      <p>You can verify your certificate here:</p>
      <p><a href="https://${process.env.PUBLIC_HOSTNAME}/validate/${certificateData.uniqueId}">
        Verify Certificate
      </a></p>
      <p>Certificate ID: ${certificateData.uniqueId}</p>
      <br>
      <p>Best regards,<br>${certificateData.orgName}</p>
    `
  };
  
  // Attach PDF if available
  if (certificateData.pdfBuffer) {
    mailOptions.attachments = [{
      filename: `certificate-${certificateData.uniqueId}.pdf`,
      content: certificateData.pdfBuffer
    }];
  }
  
  return await transporter.sendMail(mailOptions);
}
```

## Troubleshooting

### Authentication Failed

**Problem:** SMTP authentication error

**Solutions:**
1. Verify username and password are correct
2. Check if 2FA is enabled (use app password)
3. Ensure SMTP access is enabled for your account
4. Check for typos in environment variables

### Connection Timeout

**Problem:** Cannot connect to SMTP server

**Solutions:**
1. Verify SMTP_HOST is correct
2. Check port number (587, 465, or 2525)
3. Ensure firewall allows outbound SMTP traffic
4. Try alternative port if one is blocked
5. Check if your ISP blocks SMTP ports

### TLS/SSL Errors

**Problem:** SSL/TLS connection errors

**Solutions:**
1. Verify SMTP_SECURE matches port:
   - Port 465: SMTP_SECURE=ssl
   - Port 587: SMTP_SECURE=starttls
2. Update Node.js to latest version
3. Check server certificates are valid

### Emails Going to Spam

**Problem:** Emails delivered to spam folder

**Solutions:**
1. **Verify sender domain:**
   - Add SPF record
   - Add DKIM record
   - Add DMARC policy

2. **Use proper From address:**
   - Use verified sender address
   - Match domain with DNS records

3. **Improve email content:**
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper HTML structure
   - Balance text/image ratio

4. **Monitor reputation:**
   - Check sender score
   - Monitor bounce rates
   - Handle bounces properly

### Rate Limiting

**Problem:** Too many emails sent, hitting rate limits

**Solutions:**
1. Implement email queue
2. Add delays between sends
3. Upgrade to higher tier
4. Use bulk sending APIs
5. Distribute load across multiple providers

## DNS Configuration for Better Deliverability

### SPF Record

Add to your DNS:
```
TXT record: v=spf1 include:_spf.brevo.com ~all
```

### DKIM Record

Provided by your SMTP provider, add to DNS:
```
TXT record: [provider-specific-dkim-key]
```

### DMARC Policy

```
TXT record for _dmarc.yourdomain.com:
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

## Best Practices

1. **Use Environment Variables:** Never hardcode credentials
2. **Enable TLS:** Always use encrypted connections
3. **Verify Sender:** Set up SPF, DKIM, DMARC
4. **Handle Errors:** Implement proper error handling and retries
5. **Monitor Delivery:** Track bounces and delivery rates
6. **Test Regularly:** Test email delivery in all environments
7. **Rate Limiting:** Respect provider rate limits
8. **Queue Management:** Use queues for bulk emails
9. **Unsubscribe:** Provide unsubscribe options
10. **Compliance:** Follow CAN-SPAM and GDPR regulations

## Email Queue Implementation

For sending many emails, implement a queue:

```javascript
import Bull from 'bull';

const emailQueue = new Bull('email', process.env.REDIS_URL);

// Add email to queue
emailQueue.add({
  to: recipient.email,
  certificateData: data
});

// Process queue
emailQueue.process(async (job) => {
  await sendCertificateEmail(job.data.to, job.data.certificateData);
});
```

## Monitoring and Analytics

### Track Email Metrics

- **Sent**: Total emails sent
- **Delivered**: Successfully delivered
- **Bounced**: Failed deliveries
- **Opened**: Recipient opened email (if tracking enabled)
- **Clicked**: Recipient clicked links

### Logging

Implement comprehensive logging:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'email-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'email-combined.log' })
  ]
});

// Log email sending
logger.info('Email sent', {
  to: recipientEmail,
  certificateId: uniqueId,
  provider: process.env.SMTP_HOST
});
```

## Switching SMTP Providers

To switch providers:

1. Update .env with new credentials
2. Test with test script
3. Update any provider-specific code
4. Gradually migrate traffic
5. Monitor delivery rates

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SMTP RFC 5321](https://tools.ietf.org/html/rfc5321)
- [Email Deliverability Guide](https://www.mailgun.com/blog/email-deliverability-guide/)
- [SPF, DKIM, DMARC Guide](https://www.cloudflare.com/learning/email-security/dmarc-dkim-spf/)

## Support

For SMTP configuration issues:
- Check provider documentation
- Verify credentials are correct
- Test connection with test script
- Review application logs
- Contact provider support if needed
