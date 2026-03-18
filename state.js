// ============================================
// AGRI-FINE VENTURES — STATE MANAGEMENT
// ============================================

// XSS Prevention: HTML escape utility function (available to all modules)
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const AFV = {
  currentUser: null,
  currentRole: 'admin',
  aiSettings: { provider: 'openrouter', apiKey: '', model: 'nvidia/nemotron-3-super-120b-a12b:free' },
  notifications: [],
  currentGHView: null,
  pendingTaskComplete: null,
  activePage: {},
  weeklyReports: [],
  passwordResetRequests: [],
  taskCategories: ['general', 'irrigation', 'nutrition', 'pest', 'harvest', 'pruning', 'training', 'planting', 'preparation', 'stress_management'],
  harvestOrders: [],

  // USERS (passwords should be hashed in production - using placeholders for demo)
  users: {
    admin: { id: 'admin', email: 'agrifineventures@gmail.com', name: 'Admin', role: 'admin', passwordHash: 'demo_admin', avatar: '👑', imageUrl: '' },
    supervisor: { id: 'supervisor', name: 'James Kariuki', role: 'supervisor', passwordHash: 'demo_supervisor', avatar: '👨‍🌾', assignedGH: [1, 2, 3], imageUrl: '' },
    agronomist: { id: 'agronomist', name: 'Dr. Grace Njeri', role: 'agronomist', passwordHash: 'demo_agronomist', avatar: '🔬', imageUrl: '' },
  },

  // INVENTORY - Default empty
  inventory: [],

  // FARM PRODUCE - Default empty
  farmProduce: [],

  // REVENUE RECORDS
  revenue: [],

  // HARVEST RECORDS (per greenhouse)
  // Structure: { greenhouseId: [ { id, date, quantity, unit, quality, notes, recordedBy, recordedAt } ] }
  harvest: {},

  // IMAGE ANALYSIS REQUESTS
  imageAnalysisRequests: [],

  // WORKERS - Default empty, add via UI
  workers: [],

  // ACTIVITY LOG
  activityLog: [],
  
  // WEATHER DATA (Open-Meteo - Nairobi, Kenya)
  weather: null,
  
  async fetchWeather() {
    try {
      // Nairobi coordinates
      const lat = -1.2921;
      const lon = 36.8219;
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`);
      const data = await response.json();
      
      this.weather = {
        current: {
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          feelsLike: Math.round(data.current.apparent_temperature),
          code: data.current.weather_code
        },
        daily: data.daily.time.map((date, i) => ({
          date,
          code: data.daily.weather_code[i],
          max: Math.round(data.daily.temperature_2m_max[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          precip: data.daily.precipitation_sum[i]
        }))
      };
      return this.weather;
    } catch (e) {
      console.error('Weather fetch error:', e);
      return null;
    }
  },
  
  getWeatherEmoji(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌫️';
    if (code <= 59) return '🌧️';
    if (code <= 69) return '🌧️';
    if (code <= 79) return '❄️';
    if (code <= 99) return '⛈️';
    return '🌤️';
  },
  
  getWeatherDesc(code) {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 49) return 'Foggy';
    if (code <= 59) return 'Drizzle';
    if (code <= 69) return 'Rain';
    if (code <= 79) return 'Snow';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
  },

  logActivity(icon, text) {
    this.activityLog.unshift({ icon, text, time: new Date() });
    if (this.activityLog.length > 50) this.activityLog.pop();
  },

  // AI HELPER - NVIDIA NEMOTRON VIA OPENROUTER
  async askAI(prompt, context = '') {
    const settings = this.aiSettings;
    if (!settings.apiKey) {
      return { error: 'AI not configured. Please add API key in Settings.' };
    }

    // Build system prompt with farm context
    const systemPrompt = `You are AgriBot, an expert agricultural AI assistant for Agri-Fine Ventures, a greenhouse farm in Kenya.

## SYSTEM OVERVIEW
Agri-Fine Ventures is a modern greenhouse farm in Kenya managing:
- 4 greenhouses with tomatoes, capsicum, and cucumbers
- User roles: Admin, Agronomist, Supervisor, Workers
- Inventory for fertilizers, pesticides, equipment
- Farm produce: dairy (milk), poultry (eggs), vegetables
- Task management and harvest tracking

## USER ROLES
- ADMIN: Full access to all features, settings, reports, inventory, sales
- AGRONOMIST: Crop health, disease diagnosis, nutrient management
- SUPERVISOR: Manages assigned greenhouses, assigns tasks to workers
- WORKERS: Complete daily tasks in assigned greenhouses

## CURRENT DATE: ${new Date().toLocaleDateString('en-KE')}

## GREENHOUSES & CROPS
${this.greenhouses.map(gh => `### ${gh.name}
- Crop: ${gh.crop} (${gh.variety})
- Planted: ${gh.plantedDate.toLocaleDateString()}, Harvest: ${gh.expectedHarvest.toLocaleDateString()}
- Area: ${gh.area}, Plants: ${gh.plants}
- Environment: Temp ${gh.environment?.temp || 'N/A'}, Humidity ${gh.environment?.humidity || 'N/A'}, pH ${gh.environment?.ph || 'N/A'}, EC ${gh.environment?.ec || 'N/A'}
- Price: KES ${gh.pricePerKg}/kg | Notes: ${gh.notes || 'None'}
- PENDING TASKS: ${gh.tasks?.filter(t => !t.completed).map(t => `- ${t.name} (${t.priority})`).join('\n') || 'None'}`).join('\n')}

## INVENTORY
${this.inventory.map(i => `- ${i.name}: ${i.qty} ${i.unit} [${i.status}]`).join('\n')}

## FARM PRODUCE
${this.farmProduce.map(p => `- ${p.emoji} ${p.name}: ${p.quantity} ${p.unit} @ KES ${p.price}`).join('\n')}

## WEATHER
${this.weather ? `Current: ${this.weather.current?.temp}°C, Humidity ${this.weather.current?.humidity}%, Wind ${this.weather.current?.wind}km/h` : 'N/A'}

${context ? `## CONTEXT: ${context}` : ''}

Provide practical advice for Kenyan climate. Reference specific greenhouses. Include KES costs. Suggest IPM approaches.`
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'Agri-Fine Ventures'
        },
        body: JSON.stringify({
          model: settings.model || 'nvidia/nemotron-3-super-120b-a12b:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500
        })
      });

      const data = await response.json();
      
      if (data.error) {
        return { error: data.error.message };
      }

      return { response: data.choices[0].message.content };
    } catch (err) {
      return { error: 'Failed to connect to AI service. Please try again.' };
    }
  },

  // TASK UTILITIES
  getTasksForWorker(workerId) {
    // First check in the main users object (for supervisor/agronomist)
    let user = this.users[workerId];
    
    // If not found, check in workers array
    if (!user || !user.assignedGH) {
      user = this.workers?.find(w => w.id === workerId);
    }
    
    if (!user || !user.assignedGH) return [];

    const tasks = [];

    user.assignedGH.forEach(ghId => {
      const gh = AFV.greenhouses?.find(g => g.id === ghId);
      if (!gh) return;

      // Get all pending tasks for this greenhouse (not just the first one)
      const pending = gh.tasks.filter(t => !t.completed);
      pending.forEach(task => {
        tasks.push({ gh, task });
      });
    });

    return tasks;
  },

  getOverallProgress(gh) {
    if (!gh.tasks || gh.tasks.length === 0) return 0;
    const done = gh.tasks.filter(t => t.completed).length;
    return Math.round((done / gh.tasks.length) * 100);
  },

  // PERFORMANCE SCORE CALCULATION (0-100)
  getPerformanceScore(gh) {
    if (!gh) return 0;
    
    const today = new Date();
    let score = 0;
    
    // 1. TASK COMPLETION RATE (40% weight)
    const taskCompletion = this.getOverallProgress(gh);
    const taskScore = taskCompletion * 0.4;
    
    // 2. GROWTH PROGRESS (30% weight)
    // Calculate based on days planted vs expected harvest
    let growthScore = 0;
    if (gh.plantedDate && gh.expectedHarvest) {
      const plantedDate = new Date(gh.plantedDate);
      const expectedHarvest = new Date(gh.expectedHarvest);
      const totalDays = Math.ceil((expectedHarvest - plantedDate) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((today - plantedDate) / (1000 * 60 * 60 * 24));
      const progressPct = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
      growthScore = progressPct * 0.3;
    }
    
    // 3. HARVEST TIMELINE BONUS (20% weight)
    // Bonus for being on track or ahead of schedule
    let timelineScore = 0;
    if (gh.expectedHarvest) {
      const expectedHarvest = new Date(gh.expectedHarvest);
      const daysToHarvest = Math.ceil((expectedHarvest - today) / (1000 * 60 * 60 * 24));
      
      if (daysToHarvest < 0) {
        // Overdue - penalty
        timelineScore = -10;
      } else if (daysToHarvest <= 7) {
        // Ready for harvest - full score
        timelineScore = 20;
      } else if (daysToHarvest <= 30) {
        // Near harvest - good score
        timelineScore = 15;
      } else {
        // More than 30 days - base score
        timelineScore = 10;
      }
    }
    
    // 4. CRITICAL TASKS HANDLING (10% weight)
    // Check if high priority tasks are completed
    let criticalScore = 0;
    if (gh.tasks && gh.tasks.length > 0) {
      const highPriorityTasks = gh.tasks.filter(t => t.priority === 'high');
      if (highPriorityTasks.length > 0) {
        const completedHighPriority = highPriorityTasks.filter(t => t.completed).length;
        criticalScore = (completedHighPriority / highPriorityTasks.length) * 10;
      } else {
        // No high priority tasks = full score
        criticalScore = 10;
      }
    }
    
    // Calculate total score (0-100 range)
    score = taskScore + growthScore + timelineScore + criticalScore;
    
    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  },

  // Get performance grade letter
  getPerformanceGrade(score) {
    if (score >= 90) return { grade: 'A', color: '#22c55e', label: 'Excellent' };
    if (score >= 80) return { grade: 'B', color: '#84cc16', label: 'Good' };
    if (score >= 70) return { grade: 'C', color: '#eab308', label: 'Average' };
    if (score >= 60) return { grade: 'D', color: '#f97316', label: 'Below Average' };
    return { grade: 'F', color: '#ef4444', label: 'Poor' };
  },

  getGHStatus(gh) {
    const pending = gh.tasks.filter(t => !t.completed);

    if (pending.length === 0) {
      return { label: 'Complete', cls: 'badge-active' };
    }

    const next = pending[0];

    if (next.priority === 'high') {
      return { label: 'Critical', cls: 'badge-critical' };
    }

    if (next.priority === 'medium') {
      return { label: 'Active', cls: 'badge-warning' };
    }

    return { label: 'On Track', cls: 'badge-active' };
  },

  completeTask(ghId, taskId) {
    const gh = this.greenhouses.find(g => g.id === ghId);
    if (!gh) return null;

    const task = gh.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.completed = true;
    task.completedAt = new Date();
    task.completedBy = this.currentUser?.id;

    this.logActivity('✅', `Task "${task.name}" completed in ${gh.name}`);

    const nextTask = gh.tasks.find(t => !t.completed);
    return nextTask || null;
  },

  // UPDATE GREENHOUSE
  updateGreenhouse(ghId, updates) {
    const gh = this.greenhouses.find(g => g.id === ghId);
    if (!gh) return null;

    Object.keys(updates).forEach(key => {
      if (key in gh) {
        if (key === 'plantedDate' || key === 'expectedHarvest') {
          gh[key] = new Date(updates[key]);
        } else if (key === 'environment') {
          gh[key] = { ...gh[key], ...updates[key] };
        } else {
          gh[key] = updates[key];
        }
      }
    });

    this.logActivity('✏️', `Greenhouse updated: ${gh.name}`);
    return gh;
  },

  // UPDATE TASK
  updateTask(ghId, taskId, updates) {
    const gh = this.greenhouses.find(g => g.id === ghId);
    if (!gh) return null;

    const task = gh.tasks.find(t => t.id === taskId);
    if (!task) return null;

    Object.keys(updates).forEach(key => {
      task[key] = updates[key];
    });

    this.logActivity('✏️', `Task updated: ${task.name} in ${gh.name}`);
    return task;
  },

  // ADD NEW TASK
  addTask(ghId, taskData) {
    const gh = this.greenhouses.find(g => g.id === ghId);
    if (!gh) return null;

    const newTask = {
      id: Date.now(),
      ...taskData
    };

    gh.tasks.push(newTask);

    this.logActivity('➕', `New task added: ${taskData.name} in ${gh.name}`);
    return newTask;
  },

  // DELETE TASK
  deleteTask(ghId, taskId) {
    const gh = this.greenhouses.find(g => g.id === ghId);
    if (!gh) return false;

    const taskIndex = gh.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    const task = gh.tasks[taskIndex];

    gh.tasks.splice(taskIndex, 1);

    this.logActivity('🗑️', `Task deleted: ${task.name} from ${gh.name}`);
    return true;
  },

  // AGRONOMIST REPORTS
  agronomistReports: [],

  addAgronomistReport(ghId, type, text, tags) {
    const report = {
      id: Date.now(),
      ghId,
      type,
      text,
      tags,
      author: 'Dr. Grace Njeri',
      timestamp: new Date(),
      acknowledged: false
    };

    this.agronomistReports.unshift(report);

    this.logActivity('🔬', `Agronomist report added for GH ${ghId}: ${text.substring(0, 50)}...`);

    return report;
  },

  updateAgronomistReport(reportId, ghId, type, text, tags) {
    const report = this.agronomistReports.find(r => r.id === reportId);
    if (!report) return null;

    report.ghId = ghId;
    report.type = type;
    report.text = text;
    report.tags = tags;
    report.editedAt = new Date();

    this.logActivity('🔬', `Agronomist report updated for GH ${ghId}`);

    return report;
  },

  // FEEDING PROGRAM
  feedingProgram: {
    skipWeeks: [1, 11, 21, 31],
    
    // Calendar tracking
    calendarStartDate: null,
    
    // Calendar notes - keyed by week number and cycle
    calendarNotes: {},
    
    weeklyFertilizers: {
      npk: {
        name: 'N.P.K',
        unit: 'kg',
        defaultAmount: 25,
        description: 'Nitrogen Phosphorus Potassium compound fertilizer'
      },
      magnesiumSulphate: {
        name: 'Magnesium Sulphate',
        unit: 'kg',
        defaultAmount: 10,
        description: 'MgSO4 - Secondary nutrient source'
      }
    },

    periodicFertilizers: {
      calciumCarbonate: {
        name: 'Calcium Carbonate',
        unit: 'kg',
        defaultAmount: 20,
        description: 'CaCO3 - Calcium supplement for cell wall strength'
      },
      potassiumSulphate: {
        name: 'Potassium Sulphate',
        unit: 'kg',
        defaultAmount: 15,
        description: 'K2SO4 - Potassium and sulfur source'
      }
    },

    configuredAmounts: {}
  },

  setFeedingCalendarStart(startDate) {
    this.feedingProgram.calendarStartDate = startDate;
    this.logActivity('🧪', `Feeding calendar started: ${new Date(startDate).toLocaleDateString()}`);
  },

  getCalendarCurrentWeek() {
    if (!this.feedingProgram.calendarStartDate) return 1;
    
    const startDate = new Date(this.feedingProgram.calendarStartDate);
    const now = new Date();
    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    
    // Cycle through 34 weeks
    const week = (Math.floor(diffDays / 7) % 34) + 1;
    return week;
  },

  getCalendarWeekDates(weekNum) {
    if (!this.feedingProgram.calendarStartDate) return null;
    
    const startDate = new Date(this.feedingProgram.calendarStartDate);
    const weekStart = new Date(startDate.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      start: weekStart,
      end: weekEnd,
      startStr: weekStart.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      endStr: weekEnd.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  },

  getCalendarMonths() {
    if (!this.feedingProgram.calendarStartDate) return [];
    
    const months = [];
    const startDate = new Date(this.feedingProgram.calendarStartDate);
    
    for (let cycle = 0; cycle < 2; cycle++) {
      for (let week = 1; week <= 34; week++) {
        const weekStart = new Date(startDate.getTime() + ((cycle * 34 + week - 1) * 7 * 24 * 60 * 60 * 1000));
        const monthKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}`;
        
        if (!months.find(m => m.key === monthKey)) {
          months.push({
            key: monthKey,
            year: weekStart.getFullYear(),
            month: weekStart.getMonth(),
            name: weekStart.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }),
            weeks: []
          });
        }
        
        const month = months.find(m => m.key === monthKey);
        month.weeks.push({
          weekNum: week,
          cycle: cycle + 1,
          startDate: new Date(weekStart),
          endDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    return months;
  },

  isCurrentCalendarWeek(weekNum, cycle) {
    const currentWeek = this.getCalendarCurrentWeek();
    const currentCycle = this.getCurrentCalendarCycle();
    return currentWeek === weekNum && currentCycle === cycle;
  },

  getCurrentCalendarCycle() {
    if (!this.feedingProgram.calendarStartDate) return 1;
    
    const startDate = new Date(this.feedingProgram.calendarStartDate);
    const now = new Date();
    const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    
    return Math.floor(diffDays / (34 * 7)) + 1;
  },

  saveCalendarNote(weekNum, cycle, note) {
    const key = `${cycle}-${weekNum}`;
    this.feedingProgram.calendarNotes[key] = {
      note: note,
      updatedAt: new Date(),
      updatedBy: this.currentUser?.name || 'Admin'
    };
    this.logActivity('📝', `Calendar note added for Week ${weekNum} (Cycle ${cycle})`);
  },

  getCalendarNote(weekNum, cycle) {
    const key = `${cycle}-${weekNum}`;
    return this.feedingProgram.calendarNotes[key] || null;
  },

  getAllCalendarNotes() {
    return this.feedingProgram.calendarNotes;
  },

  getCurrentWeek(plantedDate) {
    // First check if calendar is set up, if so use calendar week
    if (this.feedingProgram.calendarStartDate) {
      return this.getCalendarCurrentWeek();
    }
    
    if (!plantedDate) return 1;

    const planted = new Date(plantedDate);
    const now = new Date();

    const diffDays = Math.floor((now - planted) / (1000 * 60 * 60 * 24));

    return Math.min(Math.floor(diffDays / 7) + 1, 34);
  },

  getWeekSchedule(weekNum) {
    const program = this.feedingProgram;
    const skipWeeks = program.skipWeeks;

    const isSkippedWeek = skipWeeks.includes(weekNum);

    const schedule = {
      week: weekNum,
      fertilizers: []
    };

    const npkAmount =
      program.configuredAmounts.npk ||
      program.weeklyFertilizers.npk.defaultAmount;

    const mgAmount =
      program.configuredAmounts.magnesiumSulphate ||
      program.weeklyFertilizers.magnesiumSulphate.defaultAmount;

    schedule.fertilizers.push({
      name: 'N.P.K',
      amount: npkAmount,
      unit: 'kg',
      type: 'weekly'
    });

    schedule.fertilizers.push({
      name: 'Magnesium Sulphate',
      amount: mgAmount,
      unit: 'kg',
      type: 'weekly'
    });

    if (!isSkippedWeek) {
      const caAmount =
        program.configuredAmounts.calciumCarbonate ||
        program.periodicFertilizers.calciumCarbonate.defaultAmount;

      const kAmount =
        program.configuredAmounts.potassiumSulphate ||
        program.periodicFertilizers.potassiumSulphate.defaultAmount;

      schedule.fertilizers.push({
        name: 'Calcium Carbonate',
        amount: caAmount,
        unit: 'kg',
        type: 'periodic'
      });

      schedule.fertilizers.push({
        name: 'Potassium Sulphate',
        amount: kAmount,
        unit: 'kg',
        type: 'periodic'
      });
    } else {
      schedule.skippedFertilizers = [
        'Calcium Carbonate',
        'Potassium Sulphate'
      ];
    }

    return schedule;
  },

  updateFertilizerAmount(fertilizerKey, amount, unit) {
    this.feedingProgram.configuredAmounts[fertilizerKey] = parseFloat(amount);

    if (unit === 'g') {
      this.feedingProgram.configuredAmounts[fertilizerKey] =
        this.feedingProgram.configuredAmounts[fertilizerKey] / 1000;
    }

    this.logActivity('🧪', `Fertilizer amount updated: ${fertilizerKey} = ${amount}${unit}`);
  },

  // Save state to localStorage (and Firebase if available)
  saveState() {
    try {
      const stateToSave = {
        passwordResetRequests: this.passwordResetRequests,
        weeklyReports: this.weeklyReports,
        workers: this.workers,
        inventory: this.inventory,
        greenhouses: this.greenhouses,
        notifications: this.notifications,
        feedingProgram: this.feedingProgram,
        agronomistReports: this.agronomistReports,
        activityLog: this.activityLog,
        receipts: this.receipts,
        revenue: this.revenue,
        harvest: this.harvest,
        taskCategories: this.taskCategories,
        harvestOrders: this.harvestOrders
      };
      // Save AI model preference only (not API key) for security
      if (this.aiSettings?.model) {
        stateToSave.aiSettings = { model: this.aiSettings.model };
      }
      localStorage.setItem('afv_state', JSON.stringify(stateToSave));
      
      // Try to save to Firebase (async, don't wait)
      if (window.FirebaseSync?.isFirebaseReady()) {
        window.FirebaseSync.saveToFirebase(stateToSave);
      }
    } catch (e) {
      console.error('Error saving state:', e);
    }
  },

  // Load state from localStorage (and try Firebase first if available)
  async loadState() {
    // Try Firebase first if available
    if (window.FirebaseSync) {
      const fbData = await window.FirebaseSync.loadFromFirebase();
      if (fbData) {
        this.applyLoadedState(fbData);
        // Also save to localStorage as backup
        localStorage.setItem('afv_state', JSON.stringify(fbData));
        return;
      }
    }
    
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem('afv_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.passwordResetRequests) this.passwordResetRequests = parsed.passwordResetRequests;
        if (parsed.weeklyReports) this.weeklyReports = parsed.weeklyReports;
        if (parsed.workers) this.workers = parsed.workers;
        if (parsed.inventory) this.inventory = parsed.inventory;
        if (parsed.greenhouses) this.greenhouses = parsed.greenhouses;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (parsed.feedingProgram) this.feedingProgram = parsed.feedingProgram;
        if (parsed.aiSettings) {
          // Only restore model preference, not API key for security
          if (parsed.aiSettings.model) this.aiSettings.model = parsed.aiSettings.model;
        }
        if (parsed.receipts) this.receipts = parsed.receipts;
        if (parsed.revenue) this.revenue = parsed.revenue;
        if (parsed.harvest) this.harvest = parsed.harvest;
        if (parsed.taskCategories) this.taskCategories = parsed.taskCategories;
        if (parsed.harvestOrders) this.harvestOrders = parsed.harvestOrders;
        
        // Convert date strings back to Date objects
        this.passwordResetRequests?.forEach(r => {
          r.requestedAt = new Date(r.requestedAt);
          r.resolvedAt = r.resolvedAt ? new Date(r.resolvedAt) : null;
        });
        this.weeklyReports?.forEach(r => {
          r.submittedAt = new Date(r.submittedAt);
          r.weekStart = new Date(r.weekStart);
        });
        
        // Convert greenhouse date fields
        this.greenhouses?.forEach(gh => {
          gh.plantedDate = gh.plantedDate ? new Date(gh.plantedDate) : null;
          gh.expectedHarvest = gh.expectedHarvest ? new Date(gh.expectedHarvest) : null;
          gh.tasks?.forEach(task => {
            task.completedAt = task.completedAt ? new Date(task.completedAt) : null;
          });
        });
        
        // Convert agronomist report timestamps
        this.agronomistReports?.forEach(r => {
          r.timestamp = new Date(r.timestamp);
          r.editedAt = r.editedAt ? new Date(r.editedAt) : null;
        });
        
        // Convert activity log timestamps
        this.activityLog?.forEach(log => {
          log.time = new Date(log.time);
        });
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }
  },

  // Apply loaded state data (used by Firebase sync and localStorage)
  applyLoadedState(parsed) {
    if (!parsed) return;
    
    try {
      if (parsed.passwordResetRequests) this.passwordResetRequests = parsed.passwordResetRequests;
      if (parsed.weeklyReports) this.weeklyReports = parsed.weeklyReports;
      if (parsed.workers) this.workers = parsed.workers;
      if (parsed.inventory) this.inventory = parsed.inventory;
      if (parsed.greenhouses) this.greenhouses = parsed.greenhouses;
      if (parsed.notifications) this.notifications = parsed.notifications;
      if (parsed.feedingProgram) this.feedingProgram = parsed.feedingProgram;
      if (parsed.aiSettings) {
        if (parsed.aiSettings.model) this.aiSettings.model = parsed.aiSettings.model;
      }
      if (parsed.receipts) this.receipts = parsed.receipts;
      if (parsed.revenue) this.revenue = parsed.revenue;
      if (parsed.harvest) this.harvest = parsed.harvest;
      if (parsed.taskCategories) this.taskCategories = parsed.taskCategories;
      if (parsed.harvestOrders) this.harvestOrders = parsed.harvestOrders;
      if (parsed.farmProduce) this.farmProduce = parsed.farmProduce;
      
      // Convert date strings back to Date objects
      this.passwordResetRequests?.forEach(r => {
        r.requestedAt = new Date(r.requestedAt);
        r.resolvedAt = r.resolvedAt ? new Date(r.resolvedAt) : null;
      });
      this.weeklyReports?.forEach(r => {
        r.submittedAt = new Date(r.submittedAt);
        r.weekStart = new Date(r.weekStart);
      });
      
      // Convert greenhouse date fields
      this.greenhouses?.forEach(gh => {
        gh.plantedDate = gh.plantedDate ? new Date(gh.plantedDate) : null;
        gh.expectedHarvest = gh.expectedHarvest ? new Date(gh.expectedHarvest) : null;
        gh.tasks?.forEach(task => {
          task.completedAt = task.completedAt ? new Date(task.completedAt) : null;
          task.startedAt = task.startedAt ? new Date(task.startedAt) : null;
        });
      });
      
      // Convert agronomist report timestamps
      this.agronomistReports?.forEach(r => {
        r.timestamp = new Date(r.timestamp);
        r.editedAt = r.editedAt ? new Date(r.editedAt) : null;
      });
      
      // Convert activity log timestamps
      this.activityLog?.forEach(log => {
        log.time = new Date(log.time);
      });
      
      // Convert harvest records
      if (this.harvest) {
        Object.keys(this.harvest).forEach(ghId => {
          this.harvest[ghId]?.forEach(record => {
            record.recordedAt = new Date(record.recordedAt);
            record.date = new Date(record.date);
          });
        });
      }
      
      console.log('State applied successfully from remote data');
    } catch (e) {
      console.error('Error applying loaded state:', e);
    }
  }
};