import express from 'express';
import pool from '../db/index.js';
import { validationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/validate/:uniqueId
 * Public endpoint to validate a certificate
 * NO AUTHENTICATION REQUIRED
 */
router.get('/:uniqueId', validationLimiter, async (req, res) => {
  const { uniqueId } = req.params;

  try {
    const query = `
      SELECT 
        unique_id, recipient_name, event_type, event_name, 
        issue_date, issuer_name, org_name, pdf_url
      FROM certificates 
      WHERE unique_id = $1
    `;

    const result = await pool.query(query, [uniqueId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Certificate not found',
        valid: false
      });
    }

    res.json({
      valid: true,
      certificate: result.rows[0]
    });

  } catch (error) {
    console.error('Error validating certificate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate certificate'
    });
  }
});

export default router;
