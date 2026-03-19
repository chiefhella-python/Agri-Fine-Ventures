// ============================================
// AGRI-FINE VENTURES — GREENHOUSES API ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// 5 Blank greenhouses - owners will fill in details
let greenhouses = [
  {
    id: 'gh_1',
    name: 'Greenhouse 1',
    crop: '',
    variety: '',
    cropEmoji: '🏡',
    plants: 0,
    area: '',
    location: '',
    plantedDate: null,
    expectedHarvest: null,
    status: 'active',
    environment: { temp: '', humidity: '', ph: '', ec: '' },
    notes: '',
    tasks: [],
    sensors: [],
    gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gh_2',
    name: 'Greenhouse 2',
    crop: '',
    variety: '',
    cropEmoji: '🏡',
    plants: 0,
    area: '',
    location: '',
    plantedDate: null,
    expectedHarvest: null,
    status: 'active',
    environment: { temp: '', humidity: '', ph: '', ec: '' },
    notes: '',
    tasks: [],
    sensors: [],
    gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gh_3',
    name: 'Greenhouse 3',
    crop: '',
    variety: '',
    cropEmoji: '🏡',
    plants: 0,
    area: '',
    location: '',
    plantedDate: null,
    expectedHarvest: null,
    status: 'active',
    environment: { temp: '', humidity: '', ph: '', ec: '' },
    notes: '',
    tasks: [],
    sensors: [],
    gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gh_4',
    name: 'Greenhouse 4',
    crop: '',
    variety: '',
    cropEmoji: '🏡',
    plants: 0,
    area: '',
    location: '',
    plantedDate: null,
    expectedHarvest: null,
    status: 'active',
    environment: { temp: '', humidity: '', ph: '', ec: '' },
    notes: '',
    tasks: [],
    sensors: [],
    gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gh_5',
    name: 'Greenhouse 5',
    crop: '',
    variety: '',
    cropEmoji: '🏡',
    plants: 0,
    area: '',
    location: '',
    plantedDate: null,
    expectedHarvest: null,
    status: 'active',
    environment: { temp: '', humidity: '', ph: '', ec: '' },
    notes: '',
    tasks: [],
    sensors: [],
    gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/greenhouses - Get all greenhouses
router.get('/', (req, res) => {
  res.json(greenhouses);
});

// GET /api/greenhouses/:id - Get single greenhouse
router.get('/:id', (req, res) => {
  const greenhouse = greenhouses.find(g => g.id === req.params.id);
  if (!greenhouse) {
    return res.status(404).json({ error: 'Greenhouse not found' });
  }
  res.json(greenhouse);
});

// POST /api/greenhouses - Create new greenhouse
router.post('/', (req, res) => {
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
    gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  greenhouses.push(newGreenhouse);
  res.status(201).json(newGreenhouse);
});

// PUT /api/greenhouses/:id - Update greenhouse
router.put('/:id', (req, res) => {
  const index = greenhouses.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Greenhouse not found' });
  }
  
  greenhouses[index] = {
    ...greenhouses[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(greenhouses[index]);
});

// DELETE /api/greenhouses/:id - Delete greenhouse
router.delete('/:id', (req, res) => {
  const index = greenhouses.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Greenhouse not found' });
  }
  
  greenhouses.splice(index, 1);
  res.json({ message: 'Greenhouse deleted' });
});

// POST /api/greenhouses/:id/tasks - Add task
router.post('/:id/tasks', (req, res) => {
  const greenhouse = greenhouses.find(g => g.id === req.params.id);
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
  
  if (!greenhouse.tasks) greenhouse.tasks = [];
  greenhouse.tasks.push(newTask);
  
  res.status(201).json(newTask);
});

// PUT /api/greenhouses/:id/tasks/:taskId - Update task
router.put('/:id/tasks/:taskId', (req, res) => {
  const greenhouse = greenhouses.find(g => g.id === req.params.id);
  if (!greenhouse) {
    return res.status(404).json({ error: 'Greenhouse not found' });
  }
  
  const task = greenhouse.tasks.find(t => t.id == req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  Object.assign(task, req.body);
  res.json(task);
});

// DELETE /api/greenhouses/:id/tasks/:taskId - Delete task
router.delete('/:id/tasks/:taskId', (req, res) => {
  const greenhouse = greenhouses.find(g => g.id === req.params.id);
  if (!greenhouse) {
    return res.status(404).json({ error: 'Greenhouse not found' });
  }
  
  const index = greenhouse.tasks.findIndex(t => t.id == req.params.taskId);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  greenhouse.tasks.splice(index, 1);
  res.json({ message: 'Task deleted' });
});

// GET /api/greenhouses/options/crops - Get crop options
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
