// ============================================
// AGRI-FINE VENTURES — GREENHOUSES API ROUTES
// PostgreSQL database (Supabase)
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, requireAdmin, requireSupervisorOrAdmin } = require('../middleware/auth');

// GET /api/greenhouses - Get all greenhouses
router.get('/', authenticate, async (req, res) => {
  try {
    const greenhouses = await db.getAllGreenhouses();
    res.json(greenhouses);
  } catch (err) {
    console.error('Get greenhouses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/greenhouses/:id - Get single greenhouse
router.get('/:id', authenticate, async (req, res) => {
  try {
    const greenhouse = await db.getGreenhouseById(req.params.id);
    if (!greenhouse) {
      return res.status(404).json({ error: 'Greenhouse not found' });
    }
    res.json(greenhouse);
  } catch (err) {
    console.error('Get greenhouse error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/greenhouses - Create new greenhouse
router.post('/', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const { name, crop, variety, plants, area, location } = req.body;
    const newGreenhouse = {
      id: `gh_${Date.now()}`,
      name,
      crop: crop || '',
      variety: variety || '',
      plants: plants || 0,
      area: area || '0',
      location: location || '',
      plantedDate: null,
      expectedHarvest: null,
      status: 'active',
      environment: { temp: '', humidity: '', ph: '', ec: '' },
      notes: '',
      tasks: [],
      sensors: [],
      gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 }
    };
    
    const created = await db.createGreenhouse(newGreenhouse);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create greenhouse error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/greenhouses/:id - Update greenhouse
router.put('/:id', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    const updated = await db.updateGreenhouse(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Greenhouse not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update greenhouse error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/greenhouses/:id - Delete greenhouse
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteGreenhouse(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Greenhouse not found' });
    }
    res.json({ message: 'Greenhouse deleted' });
  } catch (err) {
    console.error('Delete greenhouse error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/greenhouses/:id/tasks - Add task
router.post('/:id/tasks', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const greenhouse = await db.getGreenhouseById(req.params.id);
    if (!greenhouse) {
      return res.status(404).json({ error: 'Greenhouse not found' });
    }
    
    const { title, category, priority } = req.body;
    const newTask = {
      id: Date.now(),
      title,
      category: category || 'general',
      priority: priority || 'medium',
      completed: false,
      completedAt: null,
      completedBy: null
    };
    
    const tasks = [...(greenhouse.tasks || []), newTask];
    const updated = await db.updateGreenhouse(req.params.id, { tasks });
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Add task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/greenhouses/:id/tasks/:taskId - Update task
router.put('/:id/tasks/:taskId', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const greenhouse = await db.getGreenhouseById(req.params.id);
    if (!greenhouse) {
      return res.status(404).json({ error: 'Greenhouse not found' });
    }
    
    const tasks = greenhouse.tasks.map(t => 
      t.id == req.params.taskId ? { ...t, ...req.body } : t
    );
    const updated = await db.updateGreenhouse(req.params.id, { tasks });
    const task = updated.tasks.find(t => t.id == req.params.taskId);
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/greenhouses/:id/tasks/:taskId - Delete task
router.delete('/:id/tasks/:taskId', authenticate, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const greenhouse = await db.getGreenhouseById(req.params.id);
    if (!greenhouse) {
      return res.status(404).json({ error: 'Greenhouse not found' });
    }
    
    const tasks = greenhouse.tasks.filter(t => t.id != req.params.taskId);
    await db.updateGreenhouse(req.params.id, { tasks });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/greenhouses/options/crops - Get crop options (public)
router.get('/options/crops', (req, res) => {
  const crops = [
    { value: 'tomato', label: 'Tomatoes' },
    { value: 'pepper', label: 'Peppers/Capsicum' },
    { value: 'cucumber', label: 'Cucumber' },
    { value: 'lettuce', label: 'Lettuce' },
    { value: 'spinach', label: 'Spinach' },
    { value: 'kale', label: 'Kale' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'other', label: 'Other' }
  ];
  res.json(crops);
});

module.exports = router;