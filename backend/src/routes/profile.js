import express from 'express';
import pool from '../db/index.js';
import { extractAuthentikUser } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * PUT /api/profile
 * Update user profile (name and org_name)
 * Protected by authentik via NPM
 * 
 * Rules:
 * - Name can be changed anytime
 * - org_name can only be set once (first login)
 * - After org_name is set, it's locked and requires support ticket to change
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
    // Get current user data to check if org_name is already set
    const userResult = await pool.query(
      'SELECT org_name, org_name_set_at FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const currentUser = userResult.rows[0];

    // Check if trying to change org_name when it's already set
    if (org_name && currentUser.org_name && currentUser.org_name_set_at) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Organization name cannot be changed once set. Please submit a support ticket if you need to change it.',
        code: 'ORG_NAME_LOCKED'
      });
    }

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
      // Setting org_name for the first time
      updates.push(`org_name = $${paramCount}`);
      values.push(org_name);
      paramCount++;
      
      // Set the lock timestamp
      updates.push(`org_name_set_at = CURRENT_TIMESTAMP`);
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(ocid);

    const query = `
      UPDATE allowed_leaders 
      SET ${updates.join(', ')}
      WHERE ocid = $${paramCount}
      RETURNING ocid, name, email, org_name, org_name_set_at, can_login, created_at, updated_at
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
