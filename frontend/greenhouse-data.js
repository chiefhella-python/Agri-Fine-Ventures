// ============================================
// AGRI-FINE VENTURES — GREENHOUSE DATA MODULE
// ============================================

(function(global) {
  'use strict';

  // Use existing AFV if already defined (from state.js), otherwise create new
  const AFV = global.AFV || {};

  // 5 blank greenhouses - admin can edit details
  const defaultGreenhouses = [
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
      gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 }
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
      gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 }
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
      gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 }
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
      gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 }
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
      gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 }
    }
  ];

  // Add/extend AFV properties
  AFV.greenhouses = defaultGreenhouses;

  // Initialize - load from API or use defaults
  AFV.initGreenhouses = async function() {
    try {
      const greenhouses = await AFV.fetchGreenhouses();
      if (greenhouses && greenhouses.length > 0) {
        this.greenhouses = greenhouses;
        console.log('✅ Loaded greenhouses from server:', this.greenhouses.length);
      } else {
        this.greenhouses = defaultGreenhouses;
        console.log('⚠️ Server returned empty, using defaults');
      }
    } catch (err) {
      this.greenhouses = defaultGreenhouses;
      console.log('⚠️ API error, using defaults');
    }
  },

  // Save to localStorage
  AFV.save = function() {
    try {
      const state = JSON.parse(localStorage.getItem('afv_state') || '{}');
      state.greenhouses = this.greenhouses;
      localStorage.setItem('afv_state', JSON.stringify(state));
    } catch (e) {
      console.error('Error saving greenhouses:', e);
    }
  };

  // Get all greenhouses
  AFV.getAll = function() {
    return this.greenhouses || [];
  };

  // Get greenhouse by ID
  AFV.getById = function(id) {
    return (this.greenhouses || []).find(g => g.id === id);
  };

  // Add new greenhouse
  AFV.addGreenhouse = function(greenhouse) {
    const newGh = {
      id: `gh_${Date.now()}`,
      name: greenhouse.name || 'New Greenhouse',
      crop: greenhouse.crop || '',
      variety: greenhouse.variety || '',
      cropEmoji: greenhouse.cropEmoji || '🏡',
      plants: greenhouse.plants || 0,
      area: greenhouse.area || '',
      location: greenhouse.location || '',
      plantedDate: greenhouse.plantedDate || null,
      expectedHarvest: greenhouse.expectedHarvest || null,
      status: greenhouse.status || 'active',
      environment: greenhouse.environment || { temp: '', humidity: '', ph: '', ec: '' },
      notes: greenhouse.notes || '',
      tasks: [],
      sensors: [],
      gradePrices: greenhouse.gradePrices || { grade1: 0, grade2: 0, grade3: 0, reject: 0 }
    };
    this.greenhouses.push(newGh);
    this.save();
    return newGh;
  };

  // Update greenhouse
  AFV.updateGreenhouse = function(id, updates) {
    const index = this.greenhouses.findIndex(g => g.id === id);
    if (index !== -1) {
      this.greenhouses[index] = { ...this.greenhouses[index], ...updates };
      this.save();
      return this.greenhouses[index];
    }
    return null;
  };

  // Delete greenhouse
  AFV.deleteGreenhouse = function(id) {
    const index = this.greenhouses.findIndex(g => g.id === id);
    if (index !== -1) {
      this.greenhouses.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  };

  // Get crop emoji
  AFV.getCropEmoji = function(crop) {
    const emojis = {
      tomato: '🍅',
      pepper: '🌶️',
      cucumber: '🥒',
      lettuce: '🥬',
      spinach: '🥬',
      kale: '🥬',
      herbs: '🌿',
      flowers: '🌸',
      strawberry: '🍓',
      other: '🏡'
    };
    return emojis[crop] || '🏡';
  };

  // Calculate statistics
  AFV.getGreenhouseStats = function() {
    const stats = {
      total: this.greenhouses.length,
      active: 0,
      inactive: 0,
      planted: 0,
      totalPlants: 0,
      tasksPending: 0,
      tasksCompleted: 0
    };

    this.greenhouses.forEach(gh => {
      if (gh.status === 'active') stats.active++;
      else stats.inactive++;
      
      if (gh.crop) stats.planted++;
      if (gh.plants) stats.totalPlants += parseInt(gh.plants) || 0;
      
      if (gh.tasks) {
        gh.tasks.forEach(task => {
          if (task.completed) stats.tasksCompleted++;
          else stats.tasksPending++;
        });
      }
    });

    return stats;
  };

  // Sync with server
  AFV.syncGreenhouses = async function() {
    try {
      const greenhouses = await AFV.fetchGreenhouses();
      if (greenhouses && greenhouses.length > 0) {
        this.greenhouses = greenhouses;
        this.save();
        return true;
      }
    } catch (err) {
      console.error('Sync error:', err);
    }
    return false;
  };

  // Reset all data
  AFV.resetGreenhouses = async function() {
    this.greenhouses = JSON.parse(JSON.stringify(defaultGreenhouses));
    this.save();
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AFV;
  } else {
    global.AFV = AFV;
  }

})(typeof window !== 'undefined' ? window : this);
