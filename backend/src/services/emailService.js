import nodemailer from 'nodemailer';

// Create reusable transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Send certificate email to recipient
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.recipientName - Recipient name
 * @param {string} params.eventName - Event name
 * @param {string} params.uniqueId - Certificate unique ID
 * @param {string} [params.pdfUrl] - URL to certificate PDF (optional)
 */
export async function sendCertificateEmail({ to, recipientName, eventName, uniqueId, pdfUrl = null }) {
  // Validate required parameters
  if (!to || !recipientName || !eventName || !uniqueId) {
    throw new Error('Missing required parameters for sending certificate email');
  }

  // Escape user-provided values to prevent XSS
  const safeRecipientName = escapeHtml(recipientName);
  const safeEventName = escapeHtml(eventName);
  const safeUniqueId = escapeHtml(uniqueId);
  const safePdfUrl = pdfUrl ? escapeHtml(pdfUrl) : null;

  const publicHostname = process.env.PUBLIC_HOSTNAME || 'certs.gdg-oncampus.dev';
  const validationUrl = `https://${publicHostname}/?cert=${encodeURIComponent(uniqueId)}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
        </div>
        <div class="content">
          <p>Dear ${safeRecipientName},</p>
          <p>Congratulations on completing <strong>${safeEventName}</strong>!</p>
          <p>Your certificate has been generated and is ready for verification.</p>
          <p><strong>Certificate ID:</strong> ${safeUniqueId}</p>
          <p>You can validate your certificate at any time using the link below:</p>
          <p style="text-align: center;">
            <a href="${validationUrl}" class="button">Validate Certificate</a>
          </p>
          ${safePdfUrl ? `<p style="text-align: center;"><a href="${safePdfUrl}" class="button">Download PDF</a></p>` : ''}
          <p>Keep this certificate ID safe for future reference.</p>
          <p>Best regards,<br>GDGoC Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>Google Developer Groups on Campus</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"GDGoC Certificates" <noreply@gdg-oncampus.dev>',
    to,
    subject: `Your Certificate for ${eventName}`,
    html: htmlContent,
    text: `Congratulations ${recipientName}! Your certificate for ${eventName} has been generated. Certificate ID: ${uniqueId}. Validate at: ${validationUrl}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailService() {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
}
