import express from 'express';
import pool from '../db/index.js';
import { extractAuthentikUser } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * PUT /api/profile
 * Update user profile (name and org_name)
 * Protected by authentik via NPM
 */
router.put('/', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  const { name, org_name } = req.body;

  // Validation
  if (!name && !org_name) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'At least one field (name or org_name) is required'
    });
  }

  try {
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (org_name) {
      updates.push(`org_name = $${paramCount}`);
      values.push(org_name);
      paramCount++;
    }

    values.push(ocid);

    const query = `
      UPDATE allowed_leaders 
      SET ${updates.join(', ')}
      WHERE ocid = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/profile
 * Get current user profile
 * Protected by authentik via NPM
 */
router.get('/', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;

  try {
    const result = await pool.query(
      'SELECT * FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch profile'
    });
  }
});

export default router;
