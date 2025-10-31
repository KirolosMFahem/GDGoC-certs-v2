import express from 'express';
import pool from '../db/index.js';
import { extractAuthentikUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/auth/me
 * Get or create authenticated user
 * Protected by authentik via NPM
 */
router.get('/me', authLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid, name, email } = req.user;

  try {
    // Check if user exists
    const userQuery = await pool.query(
      'SELECT * FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (userQuery.rows.length > 0) {
      const user = userQuery.rows[0];
      
      // Check if user is allowed to login
      if (!user.can_login) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Your account has been disabled. Please contact an administrator.'
        });
      }

      return res.json(user);
    }

    // User doesn't exist, create new record
    const insertQuery = await pool.query(
      `INSERT INTO allowed_leaders (ocid, name, email, org_name, can_login)
       VALUES ($1, $2, $3, NULL, true)
       RETURNING *`,
      [ocid, name, email]
    );

    const newUser = insertQuery.rows[0];
    return res.status(201).json(newUser);

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    
    // Handle unique constraint violation on email
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate user'
    });
  }
});

export default router;
