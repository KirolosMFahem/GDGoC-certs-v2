import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/index.js';
import { extractAuthentikUser } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to built-in templates
const BUILTIN_TEMPLATES_DIR = path.join(__dirname, '../../templates/emails');
const CUSTOM_TEMPLATES_DIR = path.join(BUILTIN_TEMPLATES_DIR, 'custom');

/**
 * GET /api/templates/email
 * Get all email templates (built-in and custom for organization)
 * Protected by authentik via NPM
 */
router.get('/', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;

  try {
    // Get user's organization
    const userResult = await pool.query(
      'SELECT org_name FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const org_name = userResult.rows[0].org_name;

    // Get built-in templates
    const builtinFiles = await fs.readdir(BUILTIN_TEMPLATES_DIR);
    const builtinTemplates = builtinFiles
      .filter(file => file.endsWith('.html') && !file.startsWith('.'))
      .map(file => ({
        name: file,
        type: 'builtin',
        description: getBuiltinTemplateDescription(file)
      }));

    // Get custom templates for this organization
    const customResult = await pool.query(
      `SELECT id, name, description, is_default, created_at, updated_at 
       FROM email_templates 
       WHERE org_name = $1 
       ORDER BY created_at DESC`,
      [org_name]
    );

    const customTemplates = customResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: 'custom',
      description: row.description,
      is_default: row.is_default,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({
      builtin: builtinTemplates,
      custom: customTemplates
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch templates'
    });
  }
});

/**
 * GET /api/templates/email/:type/:name
 * Get specific email template content
 * Protected by authentik via NPM
 */
router.get('/:type/:name', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  const { type, name } = req.params;

  try {
    if (type === 'builtin') {
      // Read built-in template file
      const filePath = path.join(BUILTIN_TEMPLATES_DIR, name);
      const content = await fs.readFile(filePath, 'utf-8');

      res.json({
        name,
        type: 'builtin',
        html_content: content,
        description: getBuiltinTemplateDescription(name)
      });

    } else if (type === 'custom') {
      // Get custom template from database
      const userResult = await pool.query(
        'SELECT org_name FROM allowed_leaders WHERE ocid = $1',
        [ocid]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'User not found'
        });
      }

      const org_name = userResult.rows[0].org_name;

      const result = await pool.query(
        `SELECT id, name, description, html_content, is_default, created_at, updated_at 
         FROM email_templates 
         WHERE org_name = $1 AND name = $2`,
        [org_name, name]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Template not found'
        });
      }

      res.json({
        ...result.rows[0],
        type: 'custom'
      });

    } else {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid template type'
      });
    }

  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch template'
    });
  }
});

/**
 * POST /api/templates/email
 * Create or update custom email template
 * Protected by authentik via NPM
 */
router.post('/', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  const { name, description, html_content, is_default } = req.body;

  // Validation
  if (!name || !html_content) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'name and html_content are required'
    });
  }

  // Validate template name
  if (!/^[a-zA-Z0-9_-]+\.html$/.test(name)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid template name. Must be alphanumeric with .html extension'
    });
  }

  try {
    // Get user's organization
    const userResult = await pool.query(
      'SELECT org_name FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const org_name = userResult.rows[0].org_name;

    // Check if template already exists
    const existingResult = await pool.query(
      'SELECT id FROM email_templates WHERE org_name = $1 AND name = $2',
      [org_name, name]
    );

    let result;

    if (existingResult.rows.length > 0) {
      // Update existing template
      result = await pool.query(
        `UPDATE email_templates 
         SET description = $1, html_content = $2, is_default = $3, updated_at = CURRENT_TIMESTAMP
         WHERE org_name = $4 AND name = $5
         RETURNING *`,
        [description || null, html_content, is_default || false, org_name, name]
      );
    } else {
      // Create new template
      result = await pool.query(
        `INSERT INTO email_templates (name, description, html_content, created_by, org_name, is_default)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, description || null, html_content, ocid, org_name, is_default || false]
      );
    }

    // If setting as default, unset other defaults for this organization
    if (is_default) {
      await pool.query(
        `UPDATE email_templates 
         SET is_default = false 
         WHERE org_name = $1 AND id != $2`,
        [org_name, result.rows[0].id]
      );
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save template'
    });
  }
});

/**
 * DELETE /api/templates/email/:id
 * Delete custom email template
 * Protected by authentik via NPM
 */
router.delete('/:id', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  const { id } = req.params;

  try {
    // Get user's organization
    const userResult = await pool.query(
      'SELECT org_name FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const org_name = userResult.rows[0].org_name;

    // Check if template is default (cannot delete default)
    const templateResult = await pool.query(
      'SELECT is_default FROM email_templates WHERE id = $1 AND org_name = $2',
      [id, org_name]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Template not found'
      });
    }

    if (templateResult.rows[0].is_default) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot delete default template. Set another template as default first.'
      });
    }

    // Delete template
    await pool.query(
      'DELETE FROM email_templates WHERE id = $1 AND org_name = $2',
      [id, org_name]
    );

    res.json({ message: 'Template deleted successfully' });

  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete template'
    });
  }
});

/**
 * PUT /api/templates/email/:id/default
 * Set template as default for organization
 * Protected by authentik via NPM
 */
router.put('/:id/default', apiLimiter, extractAuthentikUser, async (req, res) => {
  const { ocid } = req.user;
  const { id } = req.params;

  try {
    // Get user's organization
    const userResult = await pool.query(
      'SELECT org_name FROM allowed_leaders WHERE ocid = $1',
      [ocid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    const org_name = userResult.rows[0].org_name;

    // Unset all defaults for this organization
    await pool.query(
      'UPDATE email_templates SET is_default = false WHERE org_name = $1',
      [org_name]
    );

    // Set this template as default
    const result = await pool.query(
      `UPDATE email_templates 
       SET is_default = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND org_name = $2
       RETURNING *`,
      [id, org_name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Template not found'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error setting default template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to set default template'
    });
  }
});

/**
 * Helper function to get description for built-in templates
 */
function getBuiltinTemplateDescription(filename) {
  const descriptions = {
    'default.html': 'Professional template with clean Google-style design',
    'celebratory.html': 'Fun, energetic template for special events and hackathons',
    'corporate.html': 'Formal template for enterprise and official occasions'
  };

  return descriptions[filename] || 'Built-in email template';
}

export default router;
