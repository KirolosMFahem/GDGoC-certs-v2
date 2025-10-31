import express from 'express';
import crypto from 'crypto';
import pool from '../db/index.js';
import { extractAuthentikUser } from '../middleware/auth.js';
import { sendCertificateEmail } from '../services/emailService.js';
import { certificateLimiter, apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Generate a unique certificate ID using cryptographically secure random values
 */
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(4).toString('hex');
  return `GDGOC-${timestamp}-${randomBytes}`.toUpperCase();
}

/**
 * POST /api/certificates
 * Create a single certificate
 * Protected by authentik via NPM
 */
router.post('/', certificateLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  const {
    recipient_name,
    recipient_email,
    event_type,
    event_name,
    issue_date
  } = req.body;

  // Validation
  if (!recipient_name || !event_type || !event_name) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'recipient_name, event_type, and event_name are required'
    });
  }

  if (!['workshop', 'course'].includes(event_type)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'event_type must be either "workshop" or "course"'
    });
  }

  try {
    // Get issuer information
    const issuerQuery = await pool.query(
      'SELECT name, org_name FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (issuerQuery.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Issuer not found'
      });
    }

    const issuer = issuerQuery.rows[0];

    if (!issuer.org_name) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Please complete your profile setup before generating certificates'
      });
    }

    // Generate unique ID
    const unique_id = generateUniqueId();

    // Insert certificate
    const insertQuery = `
      INSERT INTO certificates (
        unique_id, recipient_name, recipient_email, event_type, 
        event_name, issue_date, issuer_name, org_name, generated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      unique_id,
      recipient_name,
      recipient_email || null,
      event_type,
      event_name,
      issue_date || new Date().toISOString().split('T')[0],
      issuer.name,
      issuer.org_name,
      ocid
    ];

    const result = await pool.query(insertQuery, values);
    const certificate = result.rows[0];

    // Send email if recipient email is provided
    if (recipient_email) {
      try {
        await sendCertificateEmail({
          to: recipient_email,
          recipientName: recipient_name,
          eventName: event_name,
          uniqueId: unique_id,
          pdfUrl: certificate.pdf_url
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json(certificate);

  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create certificate'
    });
  }
});

/**
 * POST /api/certificates/bulk
 * Create multiple certificates from CSV data
 * Protected by authentik via NPM
 */
router.post('/bulk', certificateLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  const { certificates } = req.body;

  // Validation
  if (!Array.isArray(certificates) || certificates.length === 0) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'certificates array is required and must not be empty'
    });
  }

  try {
    // Get issuer information
    const issuerQuery = await pool.query(
      'SELECT name, org_name FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (issuerQuery.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Issuer not found'
      });
    }

    const issuer = issuerQuery.rows[0];

    if (!issuer.org_name) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Please complete your profile setup before generating certificates'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    // Process each certificate
    for (const cert of certificates) {
      const {
        recipient_name,
        recipient_email,
        event_type,
        event_name,
        issue_date
      } = cert;

      // Validate required fields
      if (!recipient_name || !event_type || !event_name) {
        results.failed.push({
          data: cert,
          error: 'Missing required fields'
        });
        continue;
      }

      if (!['workshop', 'course'].includes(event_type)) {
        results.failed.push({
          data: cert,
          error: 'Invalid event_type'
        });
        continue;
      }

      try {
        const unique_id = generateUniqueId();

        const insertQuery = `
          INSERT INTO certificates (
            unique_id, recipient_name, recipient_email, event_type, 
            event_name, issue_date, issuer_name, org_name, generated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;

        const values = [
          unique_id,
          recipient_name,
          recipient_email || null,
          event_type,
          event_name,
          issue_date || new Date().toISOString().split('T')[0],
          issuer.name,
          issuer.org_name,
          ocid
        ];

        const result = await pool.query(insertQuery, values);
        const certificate = result.rows[0];

        results.success.push(certificate);

        // Send email if recipient email is provided
        if (recipient_email) {
          try {
            await sendCertificateEmail({
              to: recipient_email,
              recipientName: recipient_name,
              eventName: event_name,
              uniqueId: unique_id,
              pdfUrl: certificate.pdf_url
            });
          } catch (emailError) {
            console.error('Failed to send email for', recipient_email, emailError);
          }
        }

      } catch (error) {
        console.error('Error creating certificate:', error);
        results.failed.push({
          data: cert,
          error: error.message
        });
      }
    }

    res.status(201).json({
      total: certificates.length,
      successful: results.success.length,
      failed: results.failed.length,
      certificates: results.success,
      errors: results.failed
    });

  } catch (error) {
    console.error('Error in bulk certificate creation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create certificates'
    });
  }
});

/**
 * GET /api/certificates
 * Get all certificates generated by the authenticated user
 * Protected by authentik via NPM
 */
router.get('/', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  
  // Validate and sanitize query parameters
  let limit = parseInt(req.query.limit) || 50;
  let offset = parseInt(req.query.offset) || 0;
  
  // Set bounds to prevent performance issues
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  if (offset < 0) offset = 0;

  try {
    const query = `
      SELECT * FROM certificates 
      WHERE generated_by = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM certificates WHERE generated_by = $1
    `;

    const [certificates, count] = await Promise.all([
      pool.query(query, [ocid, limit, offset]),
      pool.query(countQuery, [ocid])
    ]);

    res.json({
      total: parseInt(count.rows[0].count),
      limit,
      offset,
      certificates: certificates.rows
    });

  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch certificates'
    });
  }
});

export default router;
