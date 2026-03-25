// ============================================
// AGRI-FINE VENTURES — WORKERS API ROUTES
// PostgreSQL database (Supabase)
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, requireAdmin, requireSupervisorOrAdmin } = require('../middleware/auth');

// GET /api/workers - Get all workers (Admin & Supervisor)
router.get('/', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const workers = await db.getAllWorkers();
    res.json(workers);
  } catch (err) {
    console.error('Get workers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/workers/:id - Get single worker
router.get('/:id', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const worker = await db.getWorkerById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (err) {
    console.error('Get worker error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/workers - Create new worker (Admin & Supervisor)
router.post('/', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const { name, phone, email, salary, salary_paid, transaction_code, role, notes } = req.body;
    
    console.log('Creating worker:', req.body);
    
    if (!name) {
      return res.status(400).json({ error: 'Worker name is required' });
    }
    
    const newWorker = {
      name,
      phone,
      email,
      salary: salary || 0,
      salary_paid: salary_paid || 0,
      transaction_code,
      role: role || 'worker',
      notes
    };
    
    console.log('Worker data to insert:', newWorker);
    
    const created = await db.createWorker(newWorker);
    console.log('Worker created:', created);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create worker error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// PUT /api/workers/:id - Update worker (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const updated = await db.updateWorker(req.params.id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Update worker error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/workers/:id - Delete worker (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteWorker(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    res.json({ message: 'Worker deleted' });
  } catch (err) {
    console.error('Delete worker error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;