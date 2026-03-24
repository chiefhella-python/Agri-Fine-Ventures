// ============================================
// AGRI-FINE VENTURES — AUTH API ROUTES
// PostgreSQL database (Supabase)
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate, requireAdmin, requireSupervisorOrAdmin } = require('../middleware/auth');

// For password hashing
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// JWT utility (simple implementation - for production use jsonwebtoken)
const generateToken = (user) => {
  const payload = {
    uid: user.uid,
    email: user.email,
    role: user.role
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// POST /api/auth/login - User login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user);
    
    res.json({
      user: userWithoutPassword,
      token,
      expiresIn: 3600
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register - User registration
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('role').notEmpty().withMessage('Role is required').isIn(['user', 'supervisor', 'agronomist', 'admin']),
  body('displayName').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password, role, displayName, assignedGH, uid: providedUid } = req.body;
  
  // Validate role is required and must be valid
  if (!role || !['user', 'supervisor', 'agronomist', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Valid role is required (user, supervisor, agronomist, or admin)' });
  }
  
  // Validate displayName is required for supervisor and agronomist
  if ((role === 'supervisor' || role === 'agronomist') && (!displayName || displayName.trim() === '')) {
    return res.status(400).json({ error: 'Display name is required for supervisors and agronomists' });
  }
  
  // Validate role is supervisor or agronomist when assigning greenhouses
  if (assignedGH && assignedGH.length > 0 && role !== 'supervisor' && role !== 'agronomist') {
    return res.status(400).json({ error: 'Greenhouses can only be assigned to supervisors or agronomists' });
  }
  
  try {
    // Check if user already exists by email
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Use provided uid or extract from email
    const uid = providedUid || email.split('@')[0];
    
    const newUser = {
      uid: uid,
      email,
      password: hashedPassword,
      displayName: displayName || uid,
      role: role,
      assignedGH: assignedGH || [],
      avatar: role === 'supervisor' ? '👨‍🌾' : role === 'agronomist' ? '🔬' : '👤',
      imageUrl: ''
    };
    
    await db.createUser(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    const token = generateToken(newUser);
    
    res.status(201).json({
      user: userWithoutPassword,
      token,
      expiresIn: 3600
    });
   } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', authenticate, (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    res.json({
      valid: true,
      user: decoded
    });
  } catch (decodeError) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/users - Get all users (for frontend sync)
router.get('/users', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPassword);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset - Reset all users (only admin remains)
router.post('/reset', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.resetUsers();
    res.json({ message: 'All users reset. Only admin remains.' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/auth/users/:uid - Delete a user
router.delete('/users/:uid', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.params;
  
  try {
    // Prevent deleting admin
    if (uid === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin' });
    }
    
    const deleted = await db.deleteUser(uid);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: `User deleted` });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-all - Full system reset (Admin only)
router.post('/reset-all', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.resetAll();
    res.json({ message: 'Full system reset complete. All users, workers, and greenhouses have been reset.' });
  } catch (err) {
    console.error('Reset all error:', err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// PUT /api/auth/users/:uid/greenhouses - Update supervisor greenhouse assignments
router.put('/users/:uid/greenhouses', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.params;
  const { greenhouseIds } = req.body;
  
  if (!Array.isArray(greenhouseIds)) {
    return res.status(400).json({ error: 'greenhouseIds must be an array' });
  }
  
  try {
    await db.updateSupervisorGreenhouses(uid, greenhouseIds);
    res.json({ message: 'Supervisor greenhouses updated', assignedGH: greenhouseIds });
  } catch (err) {
    console.error('Update supervisor greenhouses error:', err);
    res.status(500).json({ error: 'Failed to update assignments' });
  }
});

module.exports = router;
