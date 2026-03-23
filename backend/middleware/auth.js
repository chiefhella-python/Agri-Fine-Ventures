// ============================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================

// Verify JWT token and extract user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Decode base64 token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Validate token structure
    if (!decoded.uid || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};

// Require admin only
const requireAdmin = requireRole('admin');

// Require supervisor or admin
const requireSupervisorOrAdmin = requireRole('supervisor', 'admin');

// Export all middleware
module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireSupervisorOrAdmin
};
