// ============================================
// AGRI-FINE VENTURES — STATE MANAGEMENT
// ============================================

const AFV = {
  currentUser: null,
  currentRole: 'admin',
  aiSettings: { provider: 'anthropic', apiKey: '' },
  notifications: [],
  currentGHView: null,
  pendingTaskComplete: null,
  activePage: {},

  // USERS
  users: {
    admin: { id: 'admin', name: 'Admin', role: 'admin', password: '1234', avatar: '👑', imageUrl: '' },
    supervisor: { id: 'supervisor', name: 'James Kariuki', role: 'supervisor', password: '1234', avatar: '👨‍🌾', assignedGH: [1, 2, 3], imageUrl: '' },
    agronomist: { id: 'agronomist', name: 'Dr. Grace Njeri', role: 'agronomist', password: '1234', avatar: '🔬', imageUrl: '' },
  },

  // INVENTORY
  inventory: [
    { id: 1, name: 'Calcium Nitrate (Ca-Nit)', category: 'Fertilizer', qty: 180, unit: 'kg', reorder: 50, status: 'good' },
    { id: 2, name: 'Mancozeb 80WP', category: 'Fungicide', qty: 12, unit: 'kg', reorder: 20, status: 'low' },
    { id: 3, name: 'Abamectin 1.8EC', category: 'Pesticide', qty: 3, unit: 'L', reorder: 5, status: 'critical' },
    { id: 4, name: 'NPK 17:17:17', category: 'Fertilizer', qty: 250, unit: 'kg', reorder: 100, status: 'good' },
    { id: 5, name: 'Magnesium Sulphate', category: 'Fertilizer', qty: 45, unit: 'kg', reorder: 30, status: 'good' },
    { id: 6, name: 'Drip Emitters', category: 'Equipment', qty: 280, unit: 'pcs', reorder: 100, status: 'good' },
    { id: 7, name: 'Jute String (500m)', category: 'Supplies', qty: 4, unit: 'rolls', reorder: 5, status: 'low' },
    { id: 8, name: 'Coco Peat Bags', category: 'Media', qty: 320, unit: 'bags', reorder: 200, status: 'good' },
    { id: 9, name: 'Sticky Yellow Traps', category: 'Pest Control', qty: 85, unit: 'pcs', reorder: 50, status: 'good' },
    { id: 10, name: 'Vapor Gard (Anti-transpirant)', category: 'Chemicals', qty: 2, unit: 'L', reorder: 5, status: 'critical' },
  ],

  // WORKERS (added by supervisor)
  workers: [
    { id: 'worker1', name: 'Peter Kamau', role: 'worker', password: '1234', avatar: '👨‍🌾', assignedGH: [1, 2], addedBy: 'supervisor', imageUrl: '' },
    { id: 'worker2', name: 'Mary Wanjiku', role: 'worker', password: '1234', avatar: '👩‍🌾', assignedGH: [3, 4], addedBy: 'supervisor', imageUrl: '' },
    { id: 'worker3', name: 'John Otieno', role: 'worker', password: '1234', avatar: '👨‍🌾', assignedGH: [5], addedBy: 'supervisor', imageUrl: '' },
  ],

  // ACTIVITY LOG
  activityLog: [],

  logActivity(icon, text) {
    this.activityLog.unshift({ icon, text, time: new Date() });
    if (this.activityLog.length > 50) this.activityLog.pop();
  },

  // TASK UTILITIES
  getTasksForWorker(workerId) {
    const user = this.users[workerId];
    if (!user || !user.assignedGH) return [];

    const tasks = [];

    user.assignedGH.forEach(ghId => {
      const gh = AFV.greenhouses?.find(g => g.id === ghId);
      if (!gh) return;

      const pending = gh.tasks.filter(t => !t.completed);
      if (pending.length > 0) {
        tasks.push({ gh, task: pending[0] });
      }
    });

    return tasks;
  },

  getOverallProgress(gh) {
    if (!gh.tasks || gh.tasks.length === 0) return 0;
    const done = gh.tasks.filter(t => t.completed).length;
    return Math.round((done / gh.tasks.length) * 100);
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
  }
};