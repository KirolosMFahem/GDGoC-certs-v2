/**
 * Authentication middleware for authentik proxy provider
 * Extracts user information from HTTP headers injected by authentik
 */
export const extractAuthentikUser = (req, res, next) => {
  const ocid = req.get('X-authentik-uid');
  const name = req.get('X-authentik-name');
  const email = req.get('X-authentik-email');

  if (!ocid || !email) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Missing authentik headers'
    });
  }

  req.user = {
    ocid,
    name: name || email.split('@')[0],
    email
  };

  next();
};

/**
 * Middleware to require authentication
 * Should be used on all protected routes
 */
export const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.ocid) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  next();
};
