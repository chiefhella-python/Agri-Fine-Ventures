// ============================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================

const jwt = require('jsonwebtoken');
const db = require('../config/database');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// Verify JWT token and extract user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate token payload
    if (!decoded.uid || !decoded.role || !decoded.email) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
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

// Check if supervisor is assigned to a specific greenhouse
const requireAssignedGreenhouse = async (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const greenhouseId = req.params.id;
  
  try {
    const isAssigned = await db.isSupervisorAssignedToGreenhouse(req.user.uid, greenhouseId);
    if (!isAssigned) {
      return res.status(403).json({ error: 'Access denied to this greenhouse' });
    }
    next();
  } catch (err) {
    console.error('Greenhouse assignment check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get supervisor's assigned greenhouses (for use in routes)
const getSupervisorGreenhouses = async (supervisorId) => {
  return await db.getSupervisorGreenhouses(supervisorId);
};

// Export all middleware
module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireSupervisorOrAdmin,
  requireAssignedGreenhouse
};
