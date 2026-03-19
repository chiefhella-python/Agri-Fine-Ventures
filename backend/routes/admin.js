// ============================================
// AGRI-FINE VENTURES — ADMIN API ROUTES
// In-memory storage (no Firebase)
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// In-memory admin data
let adminData = {
  users: [
    {
      uid: 'admin_1',
      email: 'admin@agrifine.com',
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  logs: [],
  settings: {
    alertsEnabled: true,
    dataRetentionDays: 30,
    autoSync: false,
    temperatureThreshold: 30,
    humidityThreshold: 80
  }
};

// GET /api/admin/stats - Get system statistics
router.get('/stats', (req, res) => {
  res.json({
    greenhouses: 2,
    sensors: 5,
    readings: Object.values(require('./sensors').router).length || 0,
    users: adminData.users.length,
    uptime: process.uptime(),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
    lastUpdated: new Date().toISOString()
  });
});

// GET /api/admin/users - Get all users
router.get('/users', (req, res) => {
  res.json(adminData.users);
});

// POST /api/admin/users - Create new user
router.post('/users', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'supervisor', 'agronomist', 'user'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, displayName, role } = req.body;
  
  const newUser = {
    uid: `user_${Date.now()}`,
    email,
    displayName: displayName || email.split('@')[0],
    role: role || 'user',
    createdAt: new Date().toISOString()
  };
  
  adminData.users.push(newUser);
  res.status(201).json(newUser);
});

// DELETE /api/admin/users/:uid - Delete user
router.delete('/users/:uid', (req, res) => {
  const { uid } = req.params;
  const index = adminData.users.findIndex(u => u.uid === uid);
  
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  adminData.users.splice(index, 1);
  res.json({ message: 'User deleted successfully' });
});

// GET /api/admin/settings - Get system settings
router.get('/settings', (req, res) => {
  res.json(adminData.settings);
});

// PUT /api/admin/settings - Update system settings
router.put('/settings', (req, res) => {
  const updates = req.body;
  adminData.settings = { ...adminData.settings, ...updates };
  res.json(adminData.settings);
});

// GET /api/admin/logs - Get system logs
router.get('/logs', (req, res) => {
  const { limit = '100' } = req.query;
  res.json(adminData.logs.slice(-parseInt(limit)));
});

// POST /api/admin/logs - Create log entry
router.post('/logs', (req, res) => {
  const { type, message, data } = req.body;
  
  const logEntry = {
    id: `log_${Date.now()}`,
    type: type || 'info',
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  adminData.logs.push(logEntry);
  
  // Keep only last 1000 logs in memory
  if (adminData.logs.length > 1000) {
    adminData.logs = adminData.logs.slice(-1000);
  }
  
  res.status(201).json(logEntry);
});

// POST /api/admin/backup - Trigger data backup
router.post('/backup', (req, res) => {
  const backup = {
    timestamp: new Date().toISOString(),
    data: {
      greenhouses: require('./greenhouses').router,
      sensors: require('./sensors').router,
      users: adminData.users,
      settings: adminData.settings
    }
  };
  
  res.json({
    message: 'Backup created successfully',
    timestamp: backup.timestamp,
    size: JSON.stringify(backup).length + ' bytes'
  });
});

// POST /api/admin/cleanup - Clean up old data
router.post('/cleanup', (req, res) => {
  const { days = 30 } = req.body;
  
  res.json({
    message: 'Cleanup completed',
    deletedCount: 0,
    cutoffDate: new Date().toISOString(),
    note: 'In-memory storage does not require cleanup'
  });
});

// GET /api/admin/export - Export all data
router.get('/export', (req, res) => {
  res.json({
    exportDate: new Date().toISOString(),
    users: adminData.users,
    settings: adminData.settings,
    logs: adminData.logs
  });
});

module.exports = router;
