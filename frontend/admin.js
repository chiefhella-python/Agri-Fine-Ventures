// ============================================
// AGRI-FINE VENTURES — ADMIN DASHBOARD
// ============================================

const AdminDashboard = {
  currentPage: 'overview',
  weatherData: null,
  pageCache: new Map(),
  isNavigating: false,
  lastNavTime: 0,

  saveState() {
    this.saveState();
    // Clear page cache when data changes to force re-render
    this.pageCache.clear();
  },

  // Refresh current page
  async refreshCurrentPage() {
    if (this.currentPage) {
      await this.showPage(this.currentPage);
      console.log('AdminDashboard: Refreshed page after remote sync');
    }
  },

  // Limuru, Kiambu, Kenya coordinates
  farmLocation: {
    latitude: -1.1064,
    longitude: 36.6414
  },

  async fetchWeatherData() {
  try {
    const { latitude, longitude } = this.farmLocation;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=sunshine_duration,weather_code,temperature_2m_max,temperature_2m_min&timezone=Africa%2FNairobi&forecast_days=5`
    );
    const data = await response.json();

    if (!data || !data.current) {
      console.error('Invalid weather data:', data);
      return null;
    }

    // sunshine_duration is in seconds — convert to hours
    const sunshineHours = data.daily?.sunshine_duration?.[0]
      ? (data.daily.sunshine_duration[0] / 3600).toFixed(1)
      : 0;

    this.weatherData = {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      rainfall: data.current.precipitation,
      sunshineHours: sunshineHours,
      code: data.current.weather_code
    };

    // Also store on AFV for use by supervisor/worker weather widgets
    AFV.weather = {
      current: {
        temp: this.weatherData.temperature,
        feelsLike: this.weatherData.feelsLike,
        humidity: this.weatherData.humidity,
        wind: this.weatherData.windSpeed,
        code: this.weatherData.code,
        precip: this.weatherData.rainfall
      },
      daily: (data.daily?.time || []).map((date, i) => ({
        date,
        code: data.daily.weather_code[i],
        max: Math.round(data.daily.temperature_2m_max[i]),
        min: Math.round(data.daily.temperature_2m_min[i])
      }))
    };

    return this.weatherData;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
},

  getWeatherHTML(weather) {
    if (!weather) {
      return `<div class="weather-bar">
        <div class="weather-item"><span class="weather-icon">🌡️</span><div><div class="weather-val">--°C</div><div class="weather-lbl">Temperature</div></div></div>
        <div class="weather-divider"></div>
        <div class="weather-item"><span class="weather-icon">💧</span><div><div class="weather-val">--%</div><div class="weather-lbl">Humidity</div></div></div>
        <div class="weather-divider"></div>
        <div class="weather-item"><span class="weather-icon">☀️</span><div><div class="weather-val">-- hrs</div><div class="weather-lbl">Sunlight Today</div></div></div>
        <div class="weather-divider"></div>
        <div class="weather-item"><span class="weather-icon">💨</span><div><div class="weather-val">-- km/h</div><div class="weather-lbl">Wind Speed</div></div></div>
        <div class="weather-divider"></div>
        <div class="weather-item"><span class="weather-icon">🌧️</span><div><div class="weather-val">--mm</div><div class="weather-lbl">Rainfall</div></div></div>
      </div>`;
    }
    
    return `<div class="weather-bar">
      <div class="weather-item"><span class="weather-icon">🌡️</span><div><div class="weather-val">${weather.temperature}°C</div><div class="weather-lbl">Temperature</div></div></div>
      <div class="weather-divider"></div>
      <div class="weather-item"><span class="weather-icon">💧</span><div><div class="weather-val">${weather.humidity}%</div><div class="weather-lbl">Humidity</div></div></div>
      <div class="weather-divider"></div>
      <div class="weather-item"><span class="weather-icon">☀️</span><div><div class="weather-val">${weather.sunshineHours} hrs</div><div class="weather-lbl">Sunlight Today</div></div></div>
      <div class="weather-divider"></div>
      <div class="weather-item"><span class="weather-icon">💨</span><div><div class="weather-val">${weather.windSpeed} km/h</div><div class="weather-lbl">Wind Speed</div></div></div>
      <div class="weather-divider"></div>
      <div class="weather-item"><span class="weather-icon">🌧️</span><div><div class="weather-val">${weather.rainfall}mm</div><div class="weather-lbl">Rainfall</div></div></div>
    </div>`;
  },

  init() {
    this.renderNav();
    // Fetch greenhouses and users from backend first
    Promise.all([
      this.fetchGreenhouses(),
      AFV.fetchUsersFromBackend()
    ]).then(() => {
      this.showPage('overview');
    });
  },

  async fetchGreenhouses() {
    const greenhouses = await AFV.fetchGreenhouses();
    if (greenhouses && greenhouses.length > 0) {
      AFV.save();
      console.log('Greenhouses loaded:', greenhouses.length);
    } else {
      // Backend returned empty or error - use default greenhouses from state.js
      if (!AFV.greenhouses || AFV.greenhouses.length === 0) {
        // Initialize with default greenhouses defined in state.js
        AFV.greenhouses = [
          { id: 'gh_1', name: 'Greenhouse 1', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
          { id: 'gh_2', name: 'Greenhouse 2', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
          { id: 'gh_3', name: 'Greenhouse 3', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
          { id: 'gh_4', name: 'Greenhouse 4', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
          { id: 'gh_5', name: 'Greenhouse 5', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } }
        ];
      }
      console.log('Using default greenhouses (backend empty)');
    }
  },

  renderNav() {
    const nav = document.getElementById('admin-nav');
    nav.innerHTML = `
      <div class="sidebar-logo">
        <img src="/logo.png" alt="Agri-Fine" style="width:50px;height:50px;object-fit:contain;margin-bottom:6px">
        <div class="sidebar-logo-title">Agri-Fine</div>
        <div class="sidebar-logo-sub">Ventures — Admin</div>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar">${AFV.currentUser.imageUrl ? `<img src="${AFV.currentUser.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '👑'}</div>
        <div>
          <div class="user-name">${AFV.currentUser.name}</div>
          <div class="user-role">Owner / Admin</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Operations</div>
        <button class="nav-item active" data-page="overview" onclick="AdminDashboard.showPage('overview')">
          <span class="nav-icon">📊</span><span>Overview</span>
        </button>
        <button class="nav-item" data-page="live-status" onclick="AdminDashboard.showPage('live-status')">
          <span class="nav-icon">📡</span><span>Live Status</span>
        </button>
        <button class="nav-item" data-page="greenhouses" onclick="AdminDashboard.showPage('greenhouses')">
          <span class="nav-icon">🏡</span><span>Greenhouses</span>
        </button>
        <button class="nav-item" data-page="tasks" onclick="AdminDashboard.showPage('tasks')">
          <span class="nav-icon">📋</span><span>All Tasks</span>
        </button>
        <button class="nav-item" data-page="task-management" onclick="AdminDashboard.showPage('task-management')">
          <span class="nav-icon">➕</span><span>Task Management</span>
        </button>
        <button class="nav-item" data-page="assign-tasks" onclick="AdminDashboard.showPage('assign-tasks')">
          <span class="nav-icon">📋</span><span>Assign Tasks</span>
        </button>
        <button class="nav-item" data-page="supervisors" onclick="AdminDashboard.showPage('supervisors')">
          <span class="nav-icon">👥</span><span>Supervisors</span>
        </button>
        <button class="nav-item" data-page="workers" onclick="AdminDashboard.showPage('workers')">
          <span class="nav-icon">👷</span><span>Workers</span>
        </button>
        <div class="nav-section-label">Resources</div>
        <button class="nav-item" data-page="categories" onclick="AdminDashboard.showPage('categories')">
          <span class="nav-icon">🏷️</span><span>Categories</span>
        </button>
        <button class="nav-item" data-page="orders" onclick="AdminDashboard.showPage('orders')">
          <span class="nav-icon">🌱</span><span>Harvest Orders</span>
        </button>
        <div class="nav-section-label">Intelligence</div>
        <button class="nav-item" data-page="agronomists" onclick="AdminDashboard.showPage('agronomists')">
          <span class="nav-icon">🔬</span><span>Agronomists</span>
        </button>
        <button class="nav-item" data-page="agro-reports" onclick="AdminDashboard.showPage('agro-reports')">
          <span class="nav-icon">📋</span><span>Agro Reports</span>
          ${(AFV.agronomistReports || []).filter(r => !r.acknowledged).length > 0 ? `<span style="background:var(--red-alert);color:white;font-size:0.65rem;padding:2px 6px;border-radius:10px;margin-left:auto">${(AFV.agronomistReports || []).filter(r => !r.acknowledged).length}</span>` : ''}
        </button>
        <button class="nav-item" data-page="reports-inbox" onclick="AdminDashboard.showPage('reports-inbox')">
          <span class="nav-icon">📥</span><span>Reports Inbox</span>
          ${(AFV.agronomistReports || []).filter(r => !r.acknowledged).length > 0 ? `<span style="background:var(--red-alert);color:white;font-size:0.65rem;padding:2px 6px;border-radius:10px;margin-left:auto">${(AFV.agronomistReports || []).filter(r => !r.acknowledged).length}</span>` : ''}
        </button>
        <button class="nav-item" data-page="analytics" onclick="AdminDashboard.showPage('analytics')">
          <span class="nav-icon">📈</span><span>Analytics</span>
        </button>
        <button class="nav-item" data-page="inventory" onclick="AdminDashboard.showPage('inventory')">
          <span class="nav-icon">📦</span><span>Inventory</span>
        </button>
        <button class="nav-item" data-page="revenue" onclick="AdminDashboard.showPage('revenue')">
          <span class="nav-icon">💰</span><span>Revenue</span>
        </button>
        <button class="nav-item" data-page="receipts" onclick="AdminDashboard.showPage('receipts')">
          <span class="nav-icon">🧾</span><span>Receipts</span>
        </button>
        <button class="nav-item" data-page="harvest" onclick="AdminDashboard.showPage('harvest')">
          <span class="nav-icon">🌾</span><span>Harvest</span>
        </button>
        <div class="nav-section-label">Farm</div>
        <button class="nav-item" data-page="schedule" onclick="AdminDashboard.showPage('schedule')">
          <span class="nav-icon">📅</span><span>Schedule</span>
        </button>
        <button class="nav-item" data-page="alerts" onclick="AdminDashboard.showPage('alerts')">
          <span class="nav-icon">🔔</span><span>Alerts</span>
        </button>
        <button class="nav-item" data-page="activity-log" onclick="AdminDashboard.showPage('activity-log')">
          <span class="nav-icon">📜</span><span>Activity Log</span>
        </button>
        <button class="nav-item" data-page="feeding" onclick="AdminDashboard.showPage('feeding')">
          <span class="nav-icon">🧪</span><span>Feeding Program</span>
        </button>
        <button class="nav-item" data-page="password-resets" onclick="AdminDashboard.showPage('password-resets')">
          <span class="nav-icon">🔐</span><span>Password Resets</span>
        </button>
        <button class="nav-item" data-page="settings" onclick="AdminDashboard.showPage('settings')">
          <span class="nav-icon">⚙️</span><span>Settings</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" onclick="handleLogout()">🚪 <span>Sign Out</span></button>
      </div>
    `;
  },

  async showPage(page) {
    // Debounce rapid navigation
    const now = Date.now();
    if (now - this.lastNavTime < 100) return;
    this.lastNavTime = now;
    this.isNavigating = true;
    
    this.currentPage = page;
    // Make AdminDashboard globally accessible
    window.AdminDashboard = this;
    document.querySelectorAll('#admin-nav .nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`#admin-nav [data-page="${page}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById('admin-content');
    
    // Use cache for pages that don't need live data
    const cachedPages = ['greenhouses', 'categories', 'supervisors', 'workers', 'agronomists', 'analytics', 'revenue', 'receipts', 'harvest', 'schedule', 'alerts', 'activity-log', 'feeding', 'password-resets', 'settings'];
    if (cachedPages.includes(page) && this.pageCache.has(page)) {
      content.innerHTML = this.pageCache.get(page);
      this.isNavigating = false;
      return;
    }
    
    // Skip heavy operations during page switch - just render directly
    switch(page) {
      case 'overview': 
        content.innerHTML = this.renderOverview(); 
        break;
      case 'live-status': content.innerHTML = this.renderLiveStatus(); this.attachLiveStatusEvents(); break;
      case 'greenhouses': content.innerHTML = this.renderGreenhouses(); this.pageCache.set('greenhouses', content.innerHTML); break;
      case 'tasks': content.innerHTML = this.renderAllTasks(); this.attachPageEvents('tasks'); break;
      case 'task-management': content.innerHTML = this.renderTaskManagement(); break;
      case 'assign-tasks': content.innerHTML = this.renderAssignTasks(); break;
      case 'categories': content.innerHTML = this.renderCategories(); this.pageCache.set('categories', content.innerHTML); break;
      case 'orders': content.innerHTML = this.renderOrders(); break;
      case 'supervisors': content.innerHTML = this.renderSupervisors(); this.pageCache.set('supervisors', content.innerHTML); break;
      case 'workers': content.innerHTML = await this.renderSupervisorWorkers(); this.pageCache.set('workers', content.innerHTML); break;
      case 'agronomists': content.innerHTML = this.renderAgronomists(); this.attachAgronomistEvents(); this.pageCache.set('agronomists', content.innerHTML); break;
      case 'agro-reports': content.innerHTML = this.renderAgroReports(); break;
      case 'reports-inbox': content.innerHTML = this.renderReportsInbox(); this.attachPageEvents('reports-inbox'); break;
      case 'analytics': content.innerHTML = this.renderAnalytics(); this.pageCache.set('analytics', content.innerHTML); break;
      case 'inventory': content.innerHTML = this.renderInventory(); break;
      case 'revenue': content.innerHTML = this.renderRevenue(); this.pageCache.set('revenue', content.innerHTML); break;
      case 'receipts': content.innerHTML = this.renderReceipts(); this.pageCache.set('receipts', content.innerHTML); break;
      case 'harvest': content.innerHTML = this.renderHarvest(); this.pageCache.set('harvest', content.innerHTML); break;
      case 'schedule': content.innerHTML = this.renderSchedule(); this.pageCache.set('schedule', content.innerHTML); break;
      case 'alerts': content.innerHTML = this.renderAlerts(); this.pageCache.set('alerts', content.innerHTML); break;
      case 'activity-log': content.innerHTML = this.renderActivityLog(); this.pageCache.set('activity-log', content.innerHTML); break;
      case 'feeding': content.innerHTML = this.renderFeedingProgram(); this.attachFeedingEvents(); this.pageCache.set('feeding', content.innerHTML); break;
      case 'password-resets': content.innerHTML = this.renderPasswordResets(); this.pageCache.set('password-resets', content.innerHTML); break;
      case 'settings': content.innerHTML = this.renderSettings(); this.pageCache.set('settings', content.innerHTML); break;
    }
    this.isNavigating = false;
  },

  renderOverview() {
    const greenhouses = AFV.greenhouses || [];
    const totalTasks = greenhouses.reduce((s, g) => s + (g.tasks ? g.tasks.length : 0), 0);
    const doneTasks = greenhouses.reduce((s, g) => s + (g.tasks ? g.tasks.filter(t => t.completed).length : 0), 0);
    const pendingTasks = totalTasks - doneTasks;
    const criticalTasks = greenhouses.reduce((s, g) => s + (g.tasks ? g.tasks.filter(t => !t.completed && t.priority === 'high').length : 0), 0);
    const agronomistReports = AFV.agronomistReports || [];
    const unreadReports = agronomistReports.filter(r => !r.acknowledged).length;

    return `
      <div class="page-header">
        <div>
          <div class="page-title">Farm Overview 🌾</div>
          <div class="page-subtitle">${new Date().toLocaleDateString('en-KE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
        </div>
        <div class="header-actions">
          ${unreadReports > 0 ? `<button class="btn-secondary" onclick="AdminDashboard.showPage('agronomist')">🔬 ${unreadReports} New Agro Report${unreadReports>1?'s':''}</button>` : ''}
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🏡</div>
            <div>
              <div class="stat-value">5</div>
              <div class="stat-label">Active Greenhouses</div>
              <div class="stat-change up">↑ All operational</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div>
              <div class="stat-value">${pendingTasks}</div>
              <div class="stat-label">Pending Tasks</div>
              <div class="stat-change ${pendingTasks > 5 ? 'down' : 'up'}">${doneTasks} completed today</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🚨</div>
            <div>
              <div class="stat-value" style="color:var(--red-alert)">${criticalTasks}</div>
              <div class="stat-label">Critical Tasks</div>
              <div class="stat-change down">Requires immediate action</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🌱</div>
            <div>
              <div class="stat-value">${AFV.greenhouses.reduce((s,g) => s + g.plants, 0).toLocaleString()}</div>
              <div class="stat-label">Total Plants</div>
              <div class="stat-change up">Across all greenhouses</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div>
              <div class="stat-value">${Math.round((doneTasks/totalTasks)*100)}%</div>
              <div class="stat-label">Overall Progress</div>
              <div class="stat-change up">Tasks completion rate</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔬</div>
            <div>
              <div class="stat-value" style="color: #9b59b6">${unreadReports}</div>
              <div class="stat-label">New Agro Reports</div>
              <div class="stat-change ${unreadReports > 0 ? 'down' : 'up'}">${unreadReports > 0 ? 'Review required' : 'All reviewed'}</div>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div>
            <div class="card" style="margin-bottom:20px">
              <div class="section-title">🏡 Greenhouse Status</div>
              ${AFV.greenhouses.map(gh => {
                const status = AFV.getGHStatus(gh);
                const progress = AFV.getOverallProgress(gh);
                const nextTask = gh.tasks.find(t => !t.completed);
                return `
                  <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--green-ultra-pale);cursor:pointer" onclick="AdminDashboard.showPage('greenhouses')">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <div style="font-weight:600;color:var(--green-deep);font-size:0.9rem">${gh.cropEmoji} ${gh.name} — ${gh.crop}</div>
                      <span class="gh-status-badge ${status.cls}">${status.label}</span>
                    </div>
                    <div class="gh-progress-bar" style="margin-bottom:4px">
                      <div class="gh-progress-fill" style="width:${progress}%"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-light)">
                      <span>${progress}% complete</span>
                      <span>${nextTask ? `Next: ${nextTask.name}` : '✅ All done!'}</span>
                    </div>
                  </div>`;
              }).join('')}
            </div>

            ${AFV.agronomistReports.length > 0 ? `
            <div class="card">
              <div class="section-title">🔬 Latest Agro Reports</div>
              ${AFV.agronomistReports.slice(0,3).map(r => `
                <div style="padding:12px;background:${r.acknowledged ? 'var(--green-ultra-pale)' : 'rgba(155,89,182,0.06)'};border-radius:var(--radius-sm);margin-bottom:10px;border-left:3px solid ${r.type==='issue'?'var(--red-alert)':r.type==='recommendation'?'var(--green-fresh)':'var(--orange-warn)'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:0.78rem;font-weight:700;color:${r.type==='issue'?'var(--red-alert)':r.type==='recommendation'?'var(--green-forest)':'var(--orange-warn)'}">
                      ${r.type==='issue'?'⚠️ Issue':r.type==='recommendation'?'💡 Recommendation':'📝 Observation'} — GH${r.ghId}
                    </span>
                    ${!r.acknowledged ? '<span style="font-size:0.68rem;background:rgba(155,89,182,0.15);color:#9b59b6;padding:2px 8px;border-radius:10px;font-weight:700">NEW</span>' : ''}
                  </div>
                  <div style="font-size:0.82rem;color:var(--text-dark);line-height:1.5">${r.text.substring(0,120)}...</div>
                  <div style="font-size:0.7rem;color:var(--text-light);margin-top:6px">${r.author} · ${timeAgo(r.timestamp)}</div>
                  ${!r.acknowledged ? `<button onclick="AdminDashboard.acknowledgeReport(${r.id})" style="margin-top:8px;font-size:0.75rem;padding:4px 12px;background:var(--green-forest);color:white;border:none;border-radius:6px;cursor:pointer">Mark Reviewed ✓</button>` : ''}
                </div>
              `).join('')}
              <button class="btn-secondary" style="width:100%;margin-top:6px" onclick="AdminDashboard.showPage('agronomist')">View All Reports →</button>
            </div>` : ''}
          </div>

          <div>
            <div class="card" style="margin-bottom:20px">
              <div class="section-title">🚨 Urgent Tasks</div>
              ${(() => {
                const urgent = [];
                AFV.greenhouses.forEach(gh => gh.tasks.filter(t => !t.completed && t.priority === 'high').forEach(t => urgent.push({gh, task: t})));
                return urgent.length === 0 
                  ? '<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-text">All urgent tasks complete!</div></div>'
                  : urgent.slice(0,5).map(({gh, task}) => `
                    <div class="task-item priority-high" style="margin-bottom:8px">
                      <div class="task-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-meta">
                          <span class="task-gh-tag">${gh.name}</span>
                          <span>${gh.crop}</span>
                          <span>⏱ ${task.duration}</span>
                        </div>
                      </div>
                      <span class="task-priority">🔴 HIGH</span>
                    </div>`).join('');
              })()}
            </div>

            <div class="card">
              <div class="section-title">📜 Activity Log</div>
              <div style="max-height:320px;overflow-y:auto">
                ${AFV.activityLog.map(a => `
                  <div class="activity-item">
                    <div class="activity-icon">${a.icon}</div>
                    <div>
                      <div class="activity-text">${a.text}</div>
                      <div class="activity-time">${timeAgo(a.time)}</div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
    `;
  },

  renderLiveStatus() {
    // Gather all alerts dynamically
    const alerts = this.generateAdminAlerts();
    const now = new Date();
    
    // Get current filter values
    const ghFilter = document.getElementById('live-gh-filter')?.value || '';
    const actionFilter = document.getElementById('live-action-filter')?.value || '';
    const roleFilter = document.getElementById('live-role-filter')?.value || '';
    
    // Get activities from log and filter them
    let activities = AFV.activityLog || [];
    
    // Filter activities based on selected filters
    if (ghFilter) {
      activities = activities.filter(a => a.ghId === ghFilter);
    }
    if (actionFilter) {
      activities = activities.filter(a => {
        if (actionFilter === 'task') return a.text?.toLowerCase().includes('task');
        if (actionFilter === 'report') return a.text?.toLowerCase().includes('report');
        if (actionFilter === 'harvest') return a.text?.toLowerCase().includes('harvest');
        if (actionFilter === 'system') return a.text?.toLowerCase().includes('login') || a.text?.toLowerCase().includes('logout');
        return true;
      });
    }
    
    // Filter alerts by greenhouse
    const filteredAlerts = ghFilter ? alerts.filter(a => a.ghId === ghFilter) : alerts;
    
    // Count alerts by type for summary
    const blockedCount = alerts.filter(a => a.type === 'blocked').length;
    const overdueCount = alerts.filter(a => a.type === 'overdue').length;
    const unassignedCount = alerts.filter(a => a.type === 'unassigned').length;
    const reportCount = alerts.filter(a => a.type === 'report').length;
    const completedCount = alerts.filter(a => a.type === 'completed').length;
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#0d2818,#1a4d2e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">📡 Live Status</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Real-time farm activity feed</div>
        </div>
        <div class="header-actions">
          <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;text-align:center">
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.7)">Last Updated</div>
            <div style="font-size:0.85rem;font-weight:600" id="live-status-time">${now.toLocaleTimeString()}</div>
          </div>
          <button class="btn-secondary" onclick="AdminDashboard.refreshLiveStatus()" style="margin-left:10px;background:rgba(255,255,255,0.2);color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">🔄 Refresh</button>
        </div>
      </div>
      
      <!-- Alerts Summary -->
      <div style="margin-bottom:20px">
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
          ${blockedCount > 0 ? `<div style="background:rgba(214,48,49,0.15);padding:8px 14px;border-radius:20px;border:1px solid var(--red-alert)"><span style="font-size:0.8rem;color:var(--red-alert)">🚨 ${blockedCount} Blocked</span></div>` : ''}
          ${overdueCount > 0 ? `<div style="background:rgba(214,48,49,0.15);padding:8px 14px;border-radius:20px;border:1px solid var(--red-alert)"><span style="font-size:0.8rem;color:var(--red-alert)">⏰ ${overdueCount} Overdue</span></div>` : ''}
          ${unassignedCount > 0 ? `<div style="background:rgba(247,183,51,0.15);padding:8px 14px;border-radius:20px;border:1px solid var(--orange-warn)"><span style="font-size:0.8rem;color:var(--orange-warn)">⚠️ ${unassignedCount} Unassigned HIGH</span></div>` : ''}
          ${reportCount > 0 ? `<div style="background:rgba(155,89,182,0.15);padding:8px 14px;border-radius:20px;border:1px solid #9b59b6"><span style="font-size:0.8rem;color:#9b59b6">📋 ${reportCount} Reports</span></div>` : ''}
          ${completedCount > 0 ? `<div style="background:rgba(46,204,113,0.15);padding:8px 14px;border-radius:20px;border:1px solid var(--green-fresh)"><span style="font-size:0.8rem;color:var(--green-fresh)">✅ ${completedCount} Completed</span></div>` : ''}
        </div>
        
        <!-- Alerts Section -->
        ${filteredAlerts.length > 0 ? `
        <div class="card" style="margin-bottom:20px">
          <div class="section-title" style="color:var(--red-alert)">🚨 Active Alerts (${filteredAlerts.length})</div>
          ${filteredAlerts.map(a => `
            <div style="background:${a.severity === 'high' ? 'rgba(214,48,49,0.08)' : a.severity === 'medium' ? 'rgba(247,183,51,0.08)' : 'rgba(46,204,113,0.08)'};border-left:4px solid ${a.severity === 'high' ? 'var(--red-alert)' : a.severity === 'medium' ? 'var(--orange-warn)' : 'var(--green-fresh)'};padding:14px;margin-bottom:10px;border-radius:4px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.9rem">${a.icon} ${a.message}</div>
                  ${a.reason ? `<div style="font-size:0.82rem;color:var(--text-light);margin-top:6px"><strong>Reason:</strong> ${a.reason}</div>` : ''}
                  <div style="font-size:0.75rem;color:var(--text-light);margin-top:6px">
                    ${a.gh ? `<span style="margin-right:12px">🏡 ${a.gh}</span>` : ''}
                    ${a.time ? `<span>🕐 ${typeof a.time === 'string' ? a.time : new Date(a.time).toLocaleString()}</span>` : ''}
                  </div>
                </div>
                <span class="badge badge-${a.severity === 'high' ? 'red' : a.severity === 'medium' ? 'orange' : 'green'}" style="font-size:0.7rem;text-transform:uppercase">${a.type}</span>
              </div>
              ${a.type === 'report' ? `<button onclick="AdminDashboard.showPage('agro-reports')" style="margin-top:10px;padding:6px 12px;background:#9b59b6;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">View Report →</button>` : ''}
            </div>
          `).join('')}
        </div>
        ` : '<div style="margin-bottom:20px;padding:20px;background:var(--green-ultra-pale);border-radius:var(--radius-md);text-align:center">✅ No active alerts - All systems normal!</div>'}
      </div>
      
      <!-- Filters -->
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <div style="font-size:0.85rem;font-weight:600;color:var(--text-mid)">Filters:</div>
          <select id="live-gh-filter" onchange="AdminDashboard.filterLiveStatus()" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);min-width:150px">
            <option value="">All Greenhouses</option>
            ${(AFV.greenhouses || []).map(g => `<option value="${g.id}" ${ghFilter === g.id ? 'selected' : ''}>${g.cropEmoji} ${g.name}</option>`).join('')}
          </select>
          <select id="live-action-filter" onchange="AdminDashboard.filterLiveStatus()" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);min-width:130px">
            <option value="" ${actionFilter === '' ? 'selected' : ''}>All Actions</option>
            <option value="task" ${actionFilter === 'task' ? 'selected' : ''}>Tasks</option>
            <option value="report" ${actionFilter === 'report' ? 'selected' : ''}>Reports</option>
            <option value="harvest" ${actionFilter === 'harvest' ? 'selected' : ''}>Harvest</option>
            <option value="system" ${actionFilter === 'system' ? 'selected' : ''}>System</option>
          </select>
          <select id="live-role-filter" onchange="AdminDashboard.filterLiveStatus()" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);min-width:130px">
            <option value="" ${roleFilter === '' ? 'selected' : ''}>All Roles</option>
            <option value="admin" ${roleFilter === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="supervisor" ${roleFilter === 'supervisor' ? 'selected' : ''}>Supervisor</option>
            <option value="agronomist" ${roleFilter === 'agronomist' ? 'selected' : ''}>Agronomist</option>
            <option value="worker" ${roleFilter === 'worker' ? 'selected' : ''}>Worker</option>
          </select>
          <button onclick="AdminDashboard.clearLiveFilters()" style="padding:8px 12px;background:transparent;border:1px solid var(--green-pale);border-radius:var(--radius-sm);cursor:pointer;font-size:0.8rem;color:var(--text-light)">Clear Filters</button>
        </div>
      </div>
      
      <!-- Activity Feed -->
      <div class="card">
        <div class="section-title">📋 Activity Feed <span style="font-size:0.8rem;font-weight:normal;color:var(--text-light)">(${activities.length} activities)</span></div>
        <div id="live-activity-list" style="max-height:500px;overflow-y:auto">
          ${activities.length === 0 ? '<div style="padding:30px;text-align:center;color:var(--text-light)">No activities match your filters</div>' : 
          activities.map(a => {
            const isRecent = (now - new Date(a.time)) < 3600000;
            const actionType = a.text?.toLowerCase().includes('task') ? 'task' : a.text?.toLowerCase().includes('report') ? 'report' : a.text?.toLowerCase().includes('harvest') ? 'harvest' : 'system';
            const roleType = a.text?.toLowerCase().includes('admin') ? 'admin' : a.text?.toLowerCase().includes('supervisor') ? 'supervisor' : a.text?.toLowerCase().includes('agronomist') ? 'agronomist' : a.text?.toLowerCase().includes('worker') ? 'worker' : '';
            
            // Apply role filter
            if (roleFilter && roleType && roleType !== roleFilter) return '';
            
            return `
              <div style="display:flex;gap:12px;padding:14px;border-bottom:1px solid var(--green-ultra-pale);${isRecent ? 'background:rgba(46,204,113,0.05)' : ''}">
                <div style="font-size:1.3rem;width:40px;text-align:center">${a.icon}</div>
                <div style="flex:1">
                  <div style="font-size:0.9rem;font-weight:500">${a.text}</div>
                  <div style="display:flex;gap:12px;margin-top:4px;font-size:0.72rem;color:var(--text-light)">
                    <span>🕐 ${new Date(a.time).toLocaleString()}</span>
                    ${a.gh ? `<span>🏡 ${a.gh}</span>` : ''}
                  </div>
                </div>
                ${isRecent ? '<span style="font-size:0.65rem;background:var(--green-fresh);color:white;padding:2px 8px;border-radius:10px;height:fit-content">NEW</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // Generate comprehensive admin alerts
  generateAdminAlerts() {
    const alerts = [];
    const now = new Date();
    
    // Check for blocked tasks
    AFV.greenhouses?.forEach(gh => {
      gh.tasks?.forEach(task => {
        if (task.blocked) {
          alerts.push({ 
            type: 'blocked', 
            severity: 'high', 
            icon: '🚨',
            message: `Task "${task.title || task.name}" is blocked`, 
            reason: task.blockedReason, 
            time: task.blockedAt || now,
            gh: gh.name,
            ghId: gh.id
          });
        }
        if (task.dueDate && new Date(task.dueDate) < now && !task.completed) {
          alerts.push({ 
            type: 'overdue', 
            severity: 'high', 
            icon: '⏰',
            message: `Task "${task.title || task.name}" is overdue`, 
            time: task.dueDate, 
            gh: gh.name,
            ghId: gh.id
          });
        }
        if (task.priority === 'high' && !task.assignedTo && !task.completed) {
          alerts.push({ 
            type: 'unassigned', 
            severity: 'medium', 
            icon: '⚠️',
            message: `HIGH priority task "${task.title || task.name}" unassigned`, 
            gh: gh.name,
            ghId: gh.id
          });
        }
      });
    });
    
    // Check for unacknowledged agronomist reports
    const unackedReports = AFV.agronomistReports?.filter(r => !r.acknowledged) || [];
    unackedReports.forEach(r => {
      alerts.push({ 
        type: 'report', 
        severity: 'medium', 
        icon: '📋',
        message: `Agronomist report awaiting acknowledgement`, 
        gh: r.ghId ? AFV.greenhouses?.find(g => g.id === r.ghId)?.name : 'General',
        ghId: r.ghId,
        reportId: r.id
      });
    });
    
    // Check for inventory reorder alerts
    (AFV.inventory || []).forEach(item => {
      if (item.status === 'critical' || (item.qty && item.reorderLevel && item.qty <= item.reorderLevel)) {
        alerts.push({
          type: 'inventory',
          severity: 'high',
          icon: '📦',
          message: `Inventory critically low: ${item.name}`,
          gh: null,
          time: now
        });
      }
    });
    
    // Add recent task completions as info alerts
    const recentCompletions = [];
    AFV.greenhouses?.forEach(gh => {
      gh.tasks?.forEach(task => {
        if (task.completed && task.completedAt) {
          const completedTime = new Date(task.completedAt);
          if ((now - completedTime) < 3600000) { // Last hour
            recentCompletions.push({
              type: 'completed',
              severity: 'low',
              icon: '✅',
              message: `Task "${task.title || task.name}" completed`,
              time: completedTime,
              gh: gh.name,
              ghId: gh.id
            });
          }
        }
      });
    });
    // Add up to 3 recent completions
    alerts.push(...recentCompletions.slice(0, 3));
    
    return alerts;
  },

  attachLiveStatusEvents() {
    // Clear any existing interval
    if (this.liveStatusInterval) {
      clearInterval(this.liveStatusInterval);
    }
    
    // Auto-refresh every 30 seconds
    this.liveStatusInterval = setInterval(() => {
      if (this.currentPage === 'live-status') {
        this.showPage('live-status');
        // Update the time display
        const timeEl = document.getElementById('live-status-time');
        if (timeEl) {
          timeEl.textContent = new Date().toLocaleTimeString();
        }
      }
    }, 30000);
    
    // Make AdminDashboard globally accessible for onclick handlers
    window.AdminDashboard = this;
  },

  filterLiveStatus() {
    this.showPage('live-status');
  },

  clearLiveFilters() {
    // Reset all filter dropdowns
    const ghFilter = document.getElementById('live-gh-filter');
    const actionFilter = document.getElementById('live-action-filter');
    const roleFilter = document.getElementById('live-role-filter');
    
    if (ghFilter) ghFilter.value = '';
    if (actionFilter) actionFilter.value = '';
    if (roleFilter) roleFilter.value = '';
    
    this.showPage('live-status');
  },

  refreshLiveStatus() {
    // Refresh greenhouses data first
    this.fetchGreenhouses().then(() => {
      this.showPage('live-status');
      showToast('Status refreshed', 'success');
    });
  },

  renderGreenhouses() {
    let greenhouses = AFV.greenhouses || [];
    // Ensure we have greenhouses even if fetch failed
    if (greenhouses.length === 0) {
      greenhouses = [
        { id: 'gh_1', name: 'Greenhouse 1', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
        { id: 'gh_2', name: 'Greenhouse 2', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
        { id: 'gh_3', name: 'Greenhouse 3', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
        { id: 'gh_4', name: 'Greenhouse 4', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } },
        { id: 'gh_5', name: 'Greenhouse 5', crop: '', variety: '', cropEmoji: '🏡', plants: 0, area: '', location: '', plantedDate: null, expectedHarvest: null, status: 'active', environment: { temp: '', humidity: '', ph: '', ec: '' }, notes: '', tasks: [], sensors: [], gradePrices: { grade1: 0, grade2: 0, grade3: 0, reject: 0 } }
      ];
      AFV.greenhouses = greenhouses;
    }
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Greenhouses 🏡</div>
          <div class="page-subtitle">Detailed view of all ${greenhouses.length} production units</div>
        </div>
        <div class="header-actions">
          
        </div>
      </div>
      <div class="page-body">
        ${greenhouses.map(gh => this.renderGHDetail(gh)).join('')}
      </div>
      
    `;
  },

  renderGHDetail(gh) {
    const progress = AFV.getOverallProgress ? AFV.getOverallProgress(gh) : 0;
    const status = AFV.getGHStatus ? AFV.getGHStatus(gh) : { cls: 'status-empty', label: 'Not Planted' };
    const pendingTasks = gh.tasks ? gh.tasks.filter(t => !t.completed) : [];
    const doneTasks = gh.tasks ? gh.tasks.filter(t => t.completed) : [];
    
    // Handle empty greenhouse
    const cropLabel = gh.crop ? gh.crop : 'Not planted yet';
    const varietyLabel = gh.variety ? gh.variety : '';
    const areaLabel = gh.area ? gh.area + ' ha' : '-';
    const plantsLabel = gh.plants ? gh.plants.toLocaleString() + ' plants' : '0 plants';
    const plantedLabel = gh.plantedDate ? new Date(gh.plantedDate).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}) : 'Not set';
    const harvestLabel = gh.expectedHarvest ? new Date(gh.expectedHarvest).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}) : 'Not set';
    const tempLabel = gh.environment?.temp || '-';
    const humidityLabel = gh.environment?.humidity || '-';
    const notesLabel = gh.notes || 'No notes yet';
    const taskCount = gh.tasks ? gh.tasks.length : 0;
    const doneCount = doneTasks.length;

    return `
      <div class="card" style="margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-weight:700;color:var(--green-deep);font-size:1rem">${gh.cropEmoji || '🏡'} ${gh.name}</div>
          <button onclick="AdminDashboard.openGreenhouseModal('${gh.id}')" class="btn-secondary" style="font-size:0.78rem;padding:6px 12px">✏️ Edit Greenhouse</button>
        </div>
        <div style="display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap">
          <div class="${gh.bgClass || ''}" style="width:200px;height:130px;border-radius:var(--radius-md);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:4rem;background-size:cover;background-position:center;background-color:var(--green-ultra-pale)">
            ${gh.imageUrl ? `<img src="${gh.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)">` : (gh.cropEmoji || '🏡')}
          </div>
          <div style="flex:1;min-width:200px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
              <div>
                <h2 style="font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--green-deep);margin-bottom:4px">${gh.name} — ${cropLabel}</h2>
                <div style="color:var(--text-light);font-size:0.82rem">${varietyLabel} · ${areaLabel} · ${plantsLabel}</div>
              </div>
              <span class="gh-status-badge ${status.cls}">${status.label}</span>
            </div>
            <div style="display:flex;gap:16px;margin-top:14px;flex-wrap:wrap">
              <div style="background:var(--green-ultra-pale);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Date Planted</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--green-deep)">${plantedLabel}</div>
              </div>
              <div style="background:var(--green-ultra-pale);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Harvest Date</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--green-deep)">${harvestLabel}</div>
              </div>
              <div style="background:rgba(9,132,227,0.08);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Temp</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--blue-water)">${tempLabel}</div>
              </div>
              <div style="background:rgba(9,132,227,0.08);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Humidity</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--blue-water)">${humidityLabel}</div>
              </div>
            </div>
            <div style="margin-top:14px">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-light);margin-bottom:6px">
                <span>Task Progress</span>
                <span>${doneCount}/${taskCount} complete</span>
              </div>
              <div class="gh-progress-bar">
                <div class="gh-progress-fill" style="width:${progress}%"></div>
              </div>
            </div>
          </div>
        </div>
        <div style="background:var(--green-ultra-pale);border-radius:var(--radius-sm);padding:12px;margin-bottom:18px;border-left:3px solid var(--green-fresh)">
          <div style="font-size:0.72rem;font-weight:700;color:var(--green-forest);text-transform:uppercase;margin-bottom:3px">Notes</div>
          <div style="font-size:0.85rem;color:var(--text-dark)">${notesLabel}</div>
        </div>
        <div>
          <div style="font-weight:700;color:var(--green-deep);margin-bottom:12px;font-size:0.9rem">📋 Task Schedule</div>
          <div class="task-list">
            ${(gh.tasks && gh.tasks.length > 0) ? gh.tasks.map((task, i) => `
              <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}">
                <div class="task-check ${task.completed ? 'done' : ''}" onclick="AdminDashboard.toggleTaskComplete('${gh.id}', ${task.id})"></div>
                <div class="task-info">
                  <div class="task-name">${i + 1}. ${task.name || task.title || 'Untitled Task'}</div>
                  <div class="task-meta">
                    <span class="badge badge-${task.category === 'nutrition'?'blue':task.category==='irrigation'?'blue':task.category==='pest'?'red':task.category==='harvest'?'orange':'green'}">${task.category || 'general'}</span>
                    <span>⏱ ${task.duration || '-'}</span>
                    ${task.completed ? `<span style="color:var(--green-fresh)">✅ ${task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-KE') : 'Done'}</span>` : '<span style="color:var(--orange-warn)">⏳ Pending</span>'}
                  </div>
                  ${!task.completed ? `<div style="font-size:0.78rem;color:var(--text-light);margin-top:4px">${task.desc || ''}</div>` : ''}
                </div>
                <span class="task-priority">${(task.priority || 'medium').toUpperCase()}</span>
              </div>`).join('') : '<div style="color:var(--text-light);font-size:0.85rem;padding:12px">No tasks scheduled yet</div>'}
          </div>
        </div>
      </div>`;
  },

  renderAllTasks() {
    const allTasks = [];
    const greenhouses = AFV.greenhouses || [];
    greenhouses.forEach(gh => {
      if (gh.tasks) {
        gh.tasks.forEach(t => allTasks.push({...t, gh}));
      }
    });
    const pending = allTasks.filter(t => !t.completed);
    const done = allTasks.filter(t => t.completed);

    return `
      <div class="page-header">
        <div>
          <div class="page-title">All Tasks 📋</div>
          <div class="page-subtitle">${pending.length} pending · ${done.length} completed</div>
        </div>
        <div class="header-actions">
          <select onchange="AdminDashboard.filterTasks(this.value)" style="font-size:0.85rem">
            <option value="all">All Tasks</option>
            <option value="pending">Pending Only</option>
            <option value="done">Completed</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>
      <div class="page-body">
        <div class="card">
          <div class="section-title">⏳ Pending Tasks (${pending.length})</div>
          <div class="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Duration</th>
                  <th>Assigned To</th>
                  <th>Assigned By</th>
                  <th>Status</th>
                  <th>Agronomist Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(t => {
                  // Check task.assignedTo first, then fallback to assignedGH logic
                  let worker = null;
                  if (t.assignedTo) {
                    // Check in AFV.workers (supervisor-added workers)
                    worker = (AFV.workers || []).find(w => w.uid == t.assignedTo);
                    // Also check in AFV.users
                    if (!worker && AFV.users[t.assignedTo]) {
                      worker = AFV.users[t.assignedTo];
                    }
                  } else {
                    // Fallback: find worker by assignedGH
                    const workerKey = Object.keys(AFV.users).find(k => AFV.users[k].role === 'worker' && AFV.users[k].assignedGH?.includes(t.gh.id));
                    worker = workerKey ? AFV.users[workerKey] : null;
                  }
                  
                  // Agronomist notes
                  const agrNotes = t.agronomistNotes || [];
                  
                  return `
                    <tr>
                      <td><div style="font-weight:600">${t.name}</div><div style="font-size:0.72rem;color:var(--text-light)">${t.desc?.substring(0,60)}...</div></td>
                      <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                      <td><span class="badge badge-green">${t.category}</span></td>
                      <td><span class="badge ${t.priority==='high'?'badge-red':t.priority==='medium'?'badge-orange':'badge-green'}">${t.priority}</span></td>
                      <td>${t.duration}</td>
                      <td>${worker ? worker.name : '—'}</td>
                      <td>${t.assignedTo ? `<span style="font-size:0.7rem;color:${t.assignedBy === 'admin' ? 'var(--orange-warn)' : 'var(--blue-water)'}">${t.assignedBy === 'admin' ? 'Admin' : 'Supervisor'}</span>` : (worker ? '<span style="font-size:0.7rem;color:var(--orange-warn)">Admin</span>' : '—')}</td>
                      <td>${t.verified ? '<span class="badge badge-green" style="font-size:0.65rem">✓ Verified</span>' : t.assignedTo ? '<span class="badge badge-blue" style="font-size:0.65rem">Assigned</span>' : '<span class="badge badge-gray" style="font-size:0.65rem">Pending</span>'}</td>
                      <td>
                        ${agrNotes.length > 0 ? `
                          <div style="max-width:180px">
                            ${agrNotes.map(n => `<div style="font-size:0.65rem;padding:3px 5px;background:rgba(155,89,182,0.1);border-radius:3px;margin-bottom:2px;color:#9b59b6"><strong>${n.addedBy}:</strong> ${n.note.substring(0,30)}${n.note.length > 30 ? '...' : ''}</div>`).join('')}
                          </div>
                        ` : '—'}
                      </td>
                      <td>
                        <button onclick="AdminDashboard.openAssignTaskModal('${t.gh.id}', '${t.id}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">👤 Assign</button>
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          ${pending.length === 0 ? '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-text">All tasks completed!</div></div>' : ''}
        </div>

        <div class="card" style="margin-top:20px">
          <div class="section-title">✅ Completed Tasks (${done.length})</div>
          <div class="scroll-x">
            <table>
              <thead><tr><th>Task</th><th>Greenhouse</th><th>Completed</th><th>By</th><th>Completion Notes</th><th>Agronomist Notes</th></tr></thead>
              <tbody>
                ${done.map(t => {
                  // Check task.assignedTo first, then fallback to completedBy
                  let worker = null;
                  if (t.assignedTo) {
                    worker = (AFV.workers || []).find(w => w.uid == t.assignedTo);
                    if (!worker && AFV.users[t.assignedTo]) {
                      worker = AFV.users[t.assignedTo];
                    }
                  } else if (t.completedBy) {
                    worker = (AFV.workers || []).find(w => w.uid == t.completedBy) || AFV.users[t.completedBy];
                  }
                  
                  // Agronomist notes
                  const agrNotes = t.agronomistNotes || [];
                  
                  return `
                    <tr>
                      <td style="text-decoration:line-through;opacity:0.7">${t.name}</td>
                      <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                      <td>${t.completedAt ? t.completedAt.toLocaleDateString('en-KE') : '—'}</td>
                      <td>${worker ? worker.name : '—'}</td>
                      <td style="max-width:150px;font-size:0.75rem">${t.completionNotes ? t.completionNotes.substring(0,50) + (t.completionNotes.length > 50 ? '...' : '') : '—'}</td>
                      <td>
                        ${agrNotes.length > 0 ? `
                          <div style="max-width:150px">
                            ${agrNotes.map(n => `<div style="font-size:0.65rem;padding:3px 5px;background:rgba(155,89,182,0.1);border-radius:3px;margin-bottom:2px;color:#9b59b6"><strong>${n.addedBy}:</strong> ${n.note.substring(0,25)}${n.note.length > 25 ? '...' : ''}</div>`).join('')}
                          </div>
                        ` : '—'}
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    `;
  },

  renderTaskManagement() {
    const allTasks = [];
    AFV.greenhouses?.forEach(gh => {
      (gh.tasks || []).forEach(t => allTasks.push({...t, ghName: gh.name, ghCropEmoji: gh.cropEmoji, ghId: gh.id}));
    });
    const pending = allTasks.filter(t => !t.completed);
    const done = allTasks.filter(t => t.completed);
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#0d2818,#1a4d2e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">➕ Task Management</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Create and manage tasks</div>
        </div>
        <div class="header-actions">
          <button onclick="AdminDashboard.openTaskModal()" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ Create Task</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-value">${allTasks.length}</div><div class="stat-label">Total Tasks</div></div></div>
          <div class="stat-card"><div class="stat-icon">⏳</div><div><div class="stat-value">${pending.length}</div><div class="stat-label">Pending</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${done.length}</div><div class="stat-label">Completed</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">⏳ Pending Tasks (${pending.length})</div>
          ${pending.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">No pending tasks</div>' : `
          <div class="scroll-x">
            <table>
              <thead><tr><th>Task</th><th>Greenhouse</th><th>Category</th><th>Priority</th><th>Duration</th><th>Actions</th></tr></thead>
              <tbody>
                ${pending.map(t => `
                  <tr>
                    <td><div style="font-weight:600">${t.title || t.name || 'Untitled'}</div></td>
                    <td>${t.ghCropEmoji || '🏡'} ${t.ghName || 'Unknown'}</td>
                    <td><span class="badge badge-green">${t.category || 'general'}</span></td>
                    <td><span class="badge ${t.priority==='high'?'badge-red':t.priority==='medium'?'badge-orange':'badge-green'}">${t.priority || 'medium'}</span></td>
                    <td>${t.duration || '1 hr'}</td>
                    <td>
                      <button onclick="window.AdminDashboard.openTaskModal('${t.ghId}', '${t.id}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">🖊️ Edit</button>
                      <button onclick="AdminDashboard.deleteTaskAdmin('${t.ghId}', '${t.id}')" style="padding:4px 8px;background:var(--red-alert);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">🗑️</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
        
        <div class="card" style="margin-top:20px">
          <div class="section-title">✅ Completed Tasks (${done.length})</div>
          ${done.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">No completed tasks</div>' : `
          <div class="scroll-x">
            <table>
              <thead><tr><th>Task</th><th>Greenhouse</th><th>Completed</th><th>Actions</th></tr></thead>
              <tbody>
                ${done.map(t => `
                  <tr>
                    <td style="text-decoration:line-through;opacity:0.7">${t.title || t.name || 'Untitled'}</td>
                    <td>${t.ghCropEmoji || '🏡'} ${t.ghName || 'Unknown'}</td>
                    <td>${t.completedAt ? new Date(t.completedAt).toLocaleDateString('en-KE') : '—'}</td>
                    <td>
                      <button onclick="window.AdminDashboard.openTaskModal('${t.ghId}', '${t.id}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">🖊️ Edit</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  renderAssignTasks() {
    const allTasks = [];
    AFV.greenhouses.forEach(gh => gh.tasks.forEach(t => allTasks.push({...t, gh})));
    const pending = allTasks.filter(t => !t.completed);
    const workers = AFV.workers || [];
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a4d2e,#2d6a4f);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">📋 Assign Tasks</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Assign pending tasks to workers</div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="AdminDashboard.showPage('tasks')">View All Tasks →</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
          <div class="stat-card"><div class="stat-icon">👥</div><div><div class="stat-value">${workers.length}</div><div class="stat-label">Workers</div></div></div>
          <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-value">${pending.length}</div><div class="stat-label">Pending Tasks</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${pending.filter(t => t.assignedTo).length}</div><div class="stat-label">Assigned</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">⏳ Unassigned Tasks (${pending.filter(t => !t.assignedTo).length})</div>
          ${pending.filter(t => !t.assignedTo).length === 0 ? '<div style="padding:30px;text-align:center;color:var(--text-light)">🎉 All pending tasks are assigned!</div>' : `
          <div class="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Duration</th>
                  <th>Assign To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pending.filter(t => !t.assignedTo).map(t => `
                  <tr>
                    <td><div style="font-weight:600">${t.name}</div><div style="font-size:0.72rem;color:var(--text-light)">${t.desc?.substring(0,50)}...</div></td>
                    <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                    <td><span class="badge badge-green">${t.category || 'General'}</span></td>
                    <td><span class="badge ${t.priority==='high'?'badge-red':t.priority==='medium'?'badge-orange':'badge-green'}">${t.priority}</span></td>
                    <td>${t.duration}</td>
                    <td>
                      <select id="admin-assign-worker-${t.gh.id}-${t.id}" style="padding:6px;border-radius:4px;border:1px solid var(--green-pale);font-size:0.8rem;min-width:100px">
                        <option value="">Select Worker</option>
                        ${workers.map(w => `<option value="${w.uid}">${w.name}</option>`).join('')}
                      </select>
                    </td>
                    <td>
                      <button onclick="AdminDashboard.assignTaskToWorker('${t.gh.id}', '${t.id}')" style="padding:6px 12px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">Assign</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
        
        <div class="card" style="margin-top:20px">
          <div class="section-title">✅ Already Assigned (${pending.filter(t => t.assignedTo).length})</div>
          ${pending.filter(t => t.assignedTo).length === 0 ? '<div style="padding:30px;text-align:center;color:var(--text-light)">No tasks assigned yet</div>' : `
          <div class="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pending.filter(t => t.assignedTo).map(t => {
                  const worker = workers.find(w => w.uid == t.assignedTo) || (AFV.users[t.assignedTo] || {});
                  return `
                    <tr>
                      <td><div style="font-weight:600">${t.name}</div></td>
                      <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                      <td>${worker.name || 'Unknown'}</td>
                      <td>${t.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-blue">Assigned</span>'}</td>
                      <td>
                        ${!t.verified ? `<button onclick="AdminDashboard.unassignTask('${t.gh.id}', '${t.id}')" style="padding:4px 8px;background:var(--red-alert);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">Unassign</button>` : '<span style="color:var(--text-light)">—</span>'}
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  unassignTask(ghId, taskId) {
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    if (gh) {
      const task = gh.tasks.find(t => t.id === taskId || t.id == taskId);
      if (task) {
        task.assignedTo = null;
        task.assignedBy = null;
        AFV.logActivity('📋', `Task "${task.name}" unassigned in ${gh.name}`);
        this.saveState();
        showToast('Task unassigned', 'success');
        AdminDashboard.clearCache();
        this.showPage('assign-tasks');
      }
    }
  },

  deleteTaskAdmin(ghId, taskId) {
    if (!confirm('Delete this task?')) return;
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    if (gh) {
      gh.tasks = gh.tasks.filter(t => t.id != taskId && t.id !== taskId);
        AFV.logActivity('🗑️', `Task deleted from ${gh.name}`);
        this.saveState();
      showToast('Task deleted', 'success');
      this.showPage('task-management');
    }
  },

  renderCategories() {
    const categories = AFV.taskCategories || [];
    const categoryLabels = {
      planting: '🌱 Planting & Establishment',
      irrigation: '💧 Irrigation & Water Management',
      nutrition: '🧪 Nutrition & Fertigation',
      pruning: '✂️ Pruning & Training',
      pest: '🐛 Pest & Disease Control',
      environment: '🌡️ Environment & Infrastructure',
      harvest: '🍅 Harvest & Post-Harvest',
      general: '📋 General & Administrative'
    };
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#0d2818,#1a4d2e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🏷️ Task Categories</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Manage task subsections</div>
        </div>
        <div class="header-actions">
          <button onclick="AdminDashboard.showAddCategoryModal()" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ Add Category</button>
        </div>
      </div>
      <div class="page-body">
        <div class="card">
          <div class="section-title">Task Subsections (${categories.length})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;padding:16px">
            ${categories.map(cat => `
              <div style="background:var(--green-ultra-pale);padding:12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-weight:600;color:var(--green-deep)">${categoryLabels[cat] || cat}</div>
                  <div style="font-size:0.7rem;color:var(--text-light)">${cat}</div>
                </div>
                <div style="display:flex;gap:4px">
                  <button onclick="AdminDashboard.editCategory('${cat}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">✏️</button>
                  <button onclick="AdminDashboard.deleteCategory('${cat}')" style="padding:4px 8px;background:var(--red-alert);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  showAddCategoryModal(existingCategory = null) {
    const isEdit = !!existingCategory;
    const modalHtml = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center" onclick="if(event.target === this) this.remove()">
        <div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:400px;width:90%">
          <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0 0 20px">${isEdit ? 'Edit' : 'Add'} Category</h2>
          <form onsubmit="AdminDashboard.saveCategory(event, ${isEdit ? `'${existingCategory}'` : 'null'})">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Category Name</label>
              <input type="text" id="category-name" value="${existingCategory || ''}" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., pruning, training">
            </div>
            <div style="display:flex;gap:10px">
              <button type="button" onclick="AdminDashboard.closeModal('category-modal')" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
              <button type="submit" style="flex:1;padding:12px;background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">${isEdit ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    const existing = document.getElementById('category-modal');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'category-modal';
    div.innerHTML = modalHtml;
    document.body.appendChild(div);
  },

  editCategory(category) {
    this.showAddCategoryModal(category);
  },

  saveCategory(e, existingCategory) {
    e.preventDefault();
    const name = document.getElementById('category-name').value.trim().toLowerCase();
    if (!name) return;
    
    if (!AFV.taskCategories) AFV.taskCategories = [];
    
    // Remove existing category if editing
    if (existingCategory) {
      const idx = AFV.taskCategories.indexOf(existingCategory);
      if (idx > -1) AFV.taskCategories.splice(idx, 1);
    }
    
    // Add new category if not exists
    if (!AFV.taskCategories.includes(name)) {
      AFV.taskCategories.push(name);
    }
    
    this.saveState();
    
    // Close modal
    const modal = document.getElementById('category-modal');
    if (modal) modal.remove();
    
    showToast(existingCategory ? 'Category updated!' : 'Category added!', 'success');
    this.showPage('categories');
  },

  deleteCategory(category) {
    if (!confirm(`Delete category "${category}"?`)) return;
    
    const idx = AFV.taskCategories.indexOf(category);
    if (idx > -1) {
      AFV.taskCategories.splice(idx, 1);
      this.saveState();
      showToast('Category deleted!', 'success');
      this.showPage('categories');
    }
  },

  renderOrders() {
    const orders = AFV.harvestOrders || [];
    const pending = orders.filter(o => o.status === 'pending');
    const completed = orders.filter(o => o.status === 'completed');
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#0d2818,#1a4d2e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🌱 Harvest Orders</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${pending.length} pending · ${completed.length} completed</div>
        </div>
        <div class="header-actions">
          <button onclick="AdminDashboard.showAddOrderModal()" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ New Harvest Order</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card"><div class="stat-icon">🌱</div><div><div class="stat-value">${orders.length}</div><div class="stat-label">Total Orders</div></div></div>
          <div class="stat-card"><div class="stat-icon">⏳</div><div><div class="stat-value">${pending.length}</div><div class="stat-label">Pending</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${completed.length}</div><div class="stat-label">Completed</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">⏳ Pending Harvest Orders (${pending.length})</div>
          ${pending.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">No pending harvest orders</div>' : `
          <div class="scroll-x">
            <table>
              <thead><tr><th>Greenhouse</th><th>Crop</th><th>Variety</th><th>Buyer</th><th>Phone</th><th>Expected Harvest</th><th>Qty (kg)</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${pending.map(o => {
                  const gh = AFV.greenhouses.find(g => g.id == o.greenhouseId);
                  return `
                    <tr>
                      <td>${gh ? gh.cropEmoji + ' ' + gh.name : '—'}</td>
                      <td>${o.crop || '—'}</td>
                      <td>${o.variety || '—'}</td>
                      <td>${o.buyer || '—'}</td>
                      <td>${o.phone || '—'}</td>
                      <td>${o.expectedHarvest ? new Date(o.expectedHarvest).toLocaleDateString('en-KE') : '—'}</td>
                      <td>${o.qty ? o.qty + ' kg' : '—'}</td>
                      <td><span class="badge badge-orange">Pending</span></td>
                      <td>
                        <button onclick="AdminDashboard.completeOrder('${o.id}')" style="padding:4px 8px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">✓ Complete</button>
                        <button onclick="AdminDashboard.deleteOrder('${o.id}')" style="padding:4px 8px;background:var(--red-alert);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">🗑️</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
        
        <div class="card" style="margin-top:20px">
          <div class="section-title">✅ Completed Harvest Orders (${completed.length})</div>
          ${completed.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">No completed harvest orders</div>' : `
          <div class="scroll-x">
            <table>
              <thead><tr><th>Greenhouse</th><th>Crop</th><th>Variety</th><th>Buyer</th><th>Phone</th><th>Expected Harvest</th><th>Completed</th><th></th></tr></thead>
              <tbody>
                ${completed.map(o => {
                  const gh = AFV.greenhouses.find(g => g.id == o.greenhouseId);
                  return `
                    <tr>
                      <td>${gh ? gh.cropEmoji + ' ' + gh.name : '—'}</td>
                      <td>${o.crop || '—'}</td>
                      <td>${o.variety || '—'}</td>
                      <td>${o.buyer || '—'}</td>
                      <td>${o.phone || '—'}</td>
                      <td>${o.expectedHarvest ? new Date(o.expectedHarvest).toLocaleDateString('en-KE') : '—'}</td>
                      <td>${o.completedAt ? new Date(o.completedAt).toLocaleDateString('en-KE') : '—'}</td>
                      <td><span class="badge badge-green">Completed</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  showAddOrderModal() {
    const modalHtml = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center" onclick="if(event.target === this) this.remove()">
        <div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:450px;width:90%">
          <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0 0 20px">New Harvest Order</h2>
          <form onsubmit="AdminDashboard.saveOrder(event)">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Greenhouse</label>
              <select id="order-gh" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                ${AFV.greenhouses.map(gh => `<option value="${gh.id}">${gh.cropEmoji} ${gh.name}</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Crop</label>
              <input type="text" id="order-crop" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., Tomatoes">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Variety</label>
              <input type="text" id="order-variety" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., Cherry Roma">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Quantity (kg)</label>
              <input type="number" id="order-qty" step="0.01" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="0">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Expected Harvest Date</label>
              <input type="date" id="order-expected" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Buyer Name</label>
              <input type="text" id="order-buyer" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., John Doe">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Buyer Phone</label>
              <input type="tel" id="order-phone" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., 0712345678">
            </div>
            <div style="display:flex;gap:10px">
              <button type="button" onclick="AdminDashboard.closeModal('order-modal')" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
              <button type="submit" style="flex:1;padding:12px;background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">Add Order</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    const existing = document.getElementById('order-modal');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'order-modal';
    div.innerHTML = modalHtml;
    document.body.appendChild(div);
  },

  saveOrder(e) {
    e.preventDefault();
    const greenhouseId = parseInt(document.getElementById('order-gh').value);
    const crop = document.getElementById('order-crop').value.trim();
    const variety = document.getElementById('order-variety').value.trim();
    const qty = document.getElementById('order-qty').value;
    const expectedHarvest = document.getElementById('order-expected').value;
    const buyer = document.getElementById('order-buyer').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    
    if (!AFV.harvestOrders) AFV.harvestOrders = [];
    
    const newOrder = {
      id: Date.now(),
      greenhouseId,
      crop,
      variety,
      qty: qty ? parseFloat(qty) : 0,
      expectedHarvest,
      buyer,
      phone,
      status: 'pending',
      createdBy: AFV.currentUser?.name || 'Admin',
      createdAt: new Date()
    };
    
    AFV.harvestOrders.push(newOrder);
    this.saveState();
    
    const modal = document.getElementById('order-modal');
    if (modal) modal.remove();
    
    showToast('Harvest order added!', 'success');
    this.showPage('orders');
  },

  completeOrder(orderId) {
    if (!confirm('Mark this harvest order as completed?')) return;
    
    const order = AFV.harvestOrders.find(o => o.id == orderId);
    if (order) {
      order.status = 'completed';
      order.completedAt = new Date();
      this.saveState();
      showToast('Harvest order completed!', 'success');
      this.showPage('orders');
    }
  },

  deleteOrder(orderId) {
    if (!confirm('Delete this harvest order?')) return;
    
    const idx = AFV.harvestOrders.findIndex(o => o.id == orderId);
    if (idx > -1) {
      AFV.harvestOrders.splice(idx, 1);
      this.saveState();
      showToast('Harvest order deleted!', 'success');
      this.showPage('orders');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  },

  renderSupervisors() {
    const supervisors = Object.values(AFV.users).filter(u => u.role === 'supervisor');
    const avatars = ['👨‍🌾', '👩‍🌾'];
    const availableAvatars = avatars.filter(a => !supervisors.some(s => s.avatar === a));
    
    if (supervisors.length === 0) {
      return `
        <div class="page-header">
          <div>
            <div class="page-title">Supervisors 👥</div>
            <div class="page-subtitle">Manage your supervisors</div>
          </div>
          <div class="header-actions">
            <button class="btn-primary" onclick="AdminDashboard.openSupervisorModal()">➕ Add Supervisor</button>
          </div>
        </div>
        <div class="page-body">
          <div class="empty-state">
            <div class="empty-icon">👨‍🌾</div>
            <div class="empty-text">No supervisors yet. Click "Add Supervisor" to create one.</div>
          </div>
        </div>`;
    }
    
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Supervisors 👥</div>
          <div class="page-subtitle">Manage your supervisors</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" onclick="AdminDashboard.openSupervisorModal()">➕ Add Supervisor</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid">
          ${supervisors.map(s => {
            const name = s.displayName || s.name || s.uid || 'Unnamed';
            const tasks = AFV.getTasksForWorker(s.uid);
            let assignedGH = s.assignedGH;
            if (typeof assignedGH === 'string') {
              try { assignedGH = JSON.parse(assignedGH); } catch (e) { assignedGH = []; }
            } else if (!Array.isArray(assignedGH)) {
              assignedGH = [];
            }
            // Handle assignedGH as array of objects {id, name} or array of strings
            const assignedGHIds = assignedGH.map(gh => gh.id || gh);
            const totalAssigned = assignedGHIds.reduce((sum, ghId) => {
              const gh = AFV.greenhouses.find(g => String(g.id) === String(ghId));
              return sum + (gh?.tasks?.length || 0);
            }, 0);
            const doneAssigned = assignedGHIds.reduce((sum, ghId) => {
              const gh = AFV.greenhouses.find(g => String(g.id) === String(ghId));
              return sum + (gh?.tasks?.filter(t => t.completed).length || 0);
            }, 0);
            return `
              <div class="card" style="text-align:center;border:1px solid var(--green-pale)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                  <div style="font-size:3rem;">${s.imageUrl ? `<img src="${s.imageUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid var(--green-primary)">` : (s.avatar || '👨‍🌾')}</div>
                  <div style="display:flex;gap:6px">
                    <button onclick="AdminDashboard.openSupervisorModal('${s.uid}')" class="btn-icon" title="Edit worker" style="background:var(--blue-water);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">✏️</button>
                    <button onclick="AdminDashboard.deleteSupervisor('${s.uid}')" class="btn-icon" title="Delete worker" style="background:var(--red-alert);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">🗑️</button>
                  </div>
                </div>
                <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--green-deep)">${s.displayName || s.name || 'Unnamed'}</div>
                <div style="color:var(--text-light);font-size:0.75rem;margin-bottom:14px">${s.email || ''}</div>
                <div style="color:var(--text-light);font-size:0.75rem;margin-bottom:14px">🔑 ${s.password || 'No password'}</div>
                <div style="color:var(--text-light);font-size:0.78rem;margin-bottom:14px">Supervisor</div>
                <div style="margin-bottom:10px">
                  ${assignedGH && assignedGH.length > 0 ? assignedGH.map(gh => {
                    const ghId = gh.id || gh;
                    const ghName = gh.name || ghId;
                    return `<span class="badge badge-green" style="margin:2px">${ghName}</span>`;
                  }).join('') : '<span style="font-size:0.75rem;color:var(--text-light)">No assignments</span>'}
                </div>
                <div style="background:var(--green-ultra-pale);border-radius:var(--radius-sm);padding:10px">
                  <div style="font-size:1.4rem;font-weight:800;color:var(--green-deep)">${tasks.length}</div>
                  <div style="font-size:0.72rem;color:var(--text-light)">Active Next Tasks</div>
                </div>
                <div style="margin-top:10px">
                  <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-light);margin-bottom:4px">
                    <span>Progress</span><span>${doneAssigned}/${totalAssigned}</span>
                  </div>
                  <div class="gh-progress-bar">
                    <div class="gh-progress-fill" style="width:${totalAssigned>0?Math.round((doneAssigned/totalAssigned)*100):0}%"></div>
                  </div>
                </div>
                ${tasks.length > 0 ? `
                  <div style="margin-top:12px;text-align:left">
                    <div style="font-size:0.72rem;font-weight:700;color:var(--text-mid);text-transform:uppercase;margin-bottom:6px">Current Tasks</div>
                    ${tasks.map(({gh, task}) => `
                      <div style="background:${task.priority==='high'?'rgba(214,48,49,0.06)':'var(--green-ultra-pale)'};border-radius:var(--radius-sm);padding:8px;margin-bottom:6px;border-left:3px solid ${task.priority==='high'?'var(--red-alert)':'var(--green-fresh)'}">
                        <div style="font-size:0.8rem;font-weight:600">${task.name}</div>
                        <div style="font-size:0.72rem;color:var(--text-light)">${gh.name} · ${task.duration}</div>
                      </div>`).join('')}
                  </div>` : '<div style="margin-top:12px;font-size:0.82rem;color:var(--green-fresh)">✅ All tasks complete!</div>'}
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  openSupervisorModal(workerId = null) {
    let modal = document.getElementById('supervisor-modal');
    
    if (!modal) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="supervisor-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">
          <div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
              <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0" id="supervisor-modal-title">Add New Supervisor</h2>
              <button onclick="AdminDashboard.closeSupervisorModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
            </div>
            <form id="supervisor-form" onsubmit="AdminDashboard.saveSupervisor(event)">
              <input type="hidden" id="supervisor-id">
              <input type="hidden" id="supervisor-role" value="supervisor">
              <div style="margin-bottom:16px">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Email (Login ID)</label>
                <input type="email" id="supervisor-email" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., worker@example.com">
              </div>
              <div style="margin-bottom:16px">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Display Name</label>
                <input type="text" id="supervisor-name" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., John Doe">
              </div>
              <div style="margin-bottom:16px">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Password</label>
                <input type="password" id="supervisor-password" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Leave blank to keep current">
              </div>
              <div style="margin-bottom:16px">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Assign Greenhouses</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  ${(AFV.greenhouses || []).map(gh => `
                    <label style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--green-ultra-pale);border-radius:6px;cursor:pointer">
                      <input type="checkbox" class="supervisor-gh-checkbox" value="${gh.id}"> ${gh.cropEmoji} ${gh.name}
                    </label>
                  `).join('')}
                </div>
              </div>
              <div style="margin-bottom:16px">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Avatar</label>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                  ${['👨', '👩', '👴', '👵', '🧑', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱'].map(emoji => `
                    <label style="cursor:pointer">
                      <input type="radio" name="supervisor-avatar" value="${emoji}" style="display:none">
                      <span class="avatar-option" style="display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;font-size:1.5rem;border:2px solid var(--green-pale);border-radius:50%">${emoji}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
              <div style="margin-bottom:16px">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Image URL (Optional)</label>
                <input type="url" id="supervisor-image-url" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="https://...">
                <div id="supervisor-image-preview" style="margin-top:8px"></div>
              </div>
              <button type="submit" class="btn-primary" style="width:100%;padding:12px;font-size:1rem">Save Supervisor</button>
            </form>
          </div>
        </div>
      `);
      modal = document.getElementById('supervisor-modal');
    }
    
    const title = document.getElementById('supervisor-modal-title');
    const form = document.getElementById('supervisor-form');
    
    if (!form) {
      console.error('Supervisor form not found in modal');
      return;
    }
    
    form.reset();
    document.querySelectorAll('.avatar-option').forEach(el => el.style.borderColor = 'var(--green-pale)');
    document.getElementById('supervisor-image-preview').innerHTML = '';
    
    if (workerId) {
      const worker = AFV.users[workerId];
      if (worker) {
        title.textContent = 'Edit Supervisor';
        const uid = worker.uid;
        document.getElementById('supervisor-id').value = uid;
        document.getElementById('supervisor-email').value = worker.email || uid;
        document.getElementById('supervisor-name').value = worker.displayName || worker.name || '';
        document.getElementById('supervisor-password').value = worker.password || '';
        document.getElementById('supervisor-image-url').value = worker.imageUrl || '';
        
        // Show existing image preview
        if (worker.imageUrl) {
          document.getElementById('supervisor-image-preview').innerHTML = `<img src="${worker.imageUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:50%"> <button type="button" onclick="AdminDashboard.clearSupervisorImage()" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:8px">Remove</button>`;
        }
        
        // Set avatar
        const avatarInput = document.querySelector(`input[name="supervisor-avatar"][value="${worker.avatar}"]`);
        if (avatarInput) {
          avatarInput.checked = true;
          avatarInput.nextElementSibling.style.borderColor = 'var(--green-fresh)';
        }
        
        // Set greenhouse assignments
        let assignedGH = worker.assignedGH;
        if (typeof assignedGH === 'string') {
          try { assignedGH = JSON.parse(assignedGH); } catch (e) { assignedGH = []; }
        }
        if (!Array.isArray(assignedGH)) assignedGH = [];
        // Handle object format {id, name} or string format
        const assignedGHIds = assignedGH.map(gh => gh.id || gh);
        document.querySelectorAll('.supervisor-gh-checkbox').forEach(cb => {
          cb.checked = assignedGHIds.includes(cb.value);
        });
      }
    } else {
      title.textContent = 'Add New Supervisor';
      document.getElementById('supervisor-id').value = '';
      // Select first available avatar by default
      const firstAvatar = document.querySelector('input[name="supervisor-avatar"]');
      if (firstAvatar) {
        firstAvatar.checked = true;
        firstAvatar.nextElementSibling.style.borderColor = 'var(--green-fresh)';
      }
    }
    
    // Add click handlers for avatar selection
    document.querySelectorAll('input[name="supervisor-avatar"]').forEach(input => {
      input.onchange = function() {
        document.querySelectorAll('.avatar-option').forEach(el => el.style.borderColor = 'var(--green-pale)');
        this.nextElementSibling.style.borderColor = 'var(--green-fresh)';
      };
    });
    
    modal.style.display = 'flex';
  },

  closeSupervisorModal() {
    document.getElementById('supervisor-modal').style.display = 'none';
  },

  handleWorkerImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('worker-image-url').value = e.target.result;
      document.getElementById('worker-image-preview').innerHTML = 
        '<img src="' + e.target.result + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--green-primary)">';
    };
    reader.readAsDataURL(file);
  },

  clearSupervisorImage() {
    document.getElementById('supervisor-image-url').value = '';
    document.getElementById('worker-image-preview').innerHTML = '';
    document.getElementById('worker-image-input').value = '';
  },

  async saveSupervisor(e) {
    e.preventDefault();
    const id = document.getElementById('supervisor-id').value;
    const email = document.getElementById('supervisor-email').value.trim();
    const name = document.getElementById('supervisor-name').value.trim();
    const password = document.getElementById('supervisor-password').value.trim();
    const avatar = document.querySelector('input[name="supervisor-avatar"]:checked')?.value || '👨‍🌾';
    const imageUrl = document.getElementById('supervisor-image-url').value || '';
    const assignedGH = Array.from(document.querySelectorAll('.supervisor-gh-checkbox:checked')).map(cb => cb.value);
    
    if (!email || !name || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Validate email format
    if (!email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Check if email already exists in frontend
    if (AFV.users[email]) {
      showToast('Email already exists. Please choose a different one.', 'error');
      return;
    }
    
    if (id) {
      // Edit existing worker (local only for now)
      if (AFV.users[id]) {
        // If email changed, need to create new user and update references
        if (email !== id) {
          // Update any references in greenhouses tasks
          AFV.greenhouses.forEach(gh => {
            if (gh.tasks) {
              gh.tasks.forEach(task => {
                if (task.completedBy === id) {
                  task.completedBy = email;
                }
              });
            }
          });
          
          // Create new user with new email
          AFV.users[email] = {
            id: email,
            name: name,
            role: 'supervisor',
            password: password,
            avatar: avatar,
            imageUrl: imageUrl,
            assignedGH: assignedGH
          };
          
          // Update current user if it's the same worker
          if (AFV.currentUser?.uid === id) {
            AFV.currentUser = AFV.users[email];
            AFV.currentRole = 'supervisor';
          }
          
          // Delete old user
          delete AFV.users[id];
          AFV.logActivity('✏️', `Worker email changed from ${id} to ${email}: ${name}`);
          showToast(`Worker email changed to "${email}"!`, 'success');
        } else {
          // Update fields
          AFV.users[id].name = name;
          AFV.users[id].password = password;
          AFV.users[id].avatar = avatar;
          AFV.users[id].imageUrl = imageUrl;
          AFV.users[id].assignedGH = assignedGH;
          
          // Update in backend
          await AFV.updateUserGreenhouses(id, assignedGH);
          
          AFV.logActivity('✏️', `Worker updated: ${name}`);
          showToast(`Worker "${name}" updated successfully!`, 'success');
        }
      }
    } else {
      // Add new supervisor - create via backend API
      const success = await AFV.createUserBackend({
        email: email,
        password: password,
        displayName: name,
        role: 'supervisor',
        assignedGH: assignedGH
      });
      
      if (success) {
        // Users are synced from backend in createUserBackend
        AFV.logActivity('➕', `New supervisor added: ${name}`);
        showToast(`Supervisor "${name}" added successfully!`, 'success');
        // Refresh users from backend
        await AFV.fetchUsersFromBackend();
      } else {
        showToast('Failed to create supervisor. Username/email may already exist.', 'error');
        return;
      }
    }
    
    this.closeSupervisorModal();
    this.showPage('supervisors');
  },

  async deleteSupervisor(workerId) {
    const worker = AFV.users[workerId];
    if (!worker) return;
    
    const workerName = worker.displayName || worker.name || workerId;
    
    if (!confirm(`Are you sure you want to delete "${workerName}"? This action cannot be undone.`)) {
      return;
    }
    
    // Delete from backend if it's a supervisor role
    if (worker.role === 'supervisor') {
      await AFV.deleteUserBackend(workerId);
    }
    
    delete AFV.users[workerId];
    this.saveState();
    AFV.logActivity('🗑️', `Worker deleted: ${workerName}`);
    showToast(`Worker "${workerName}" has been deleted`, 'success');
    this.showPage('supervisors');
  },

  renderAgronomists() {
    const agronomists = Object.values(AFV.users).filter(u => u.role === 'agronomist');
    const avatars = ['🔬', '👩‍🔬', '👨‍🔬', '🧑‍🔬', '🌱'];
    const usedAvatars = agronomists.map(a => a.avatar);
    const availableAvatars = avatars.filter(a => !usedAvatars.includes(a));
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">Agronomists 🔬</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Manage agronomist accounts</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" onclick="AdminDashboard.openAgronomistModal()" style="background:#9b59b6;color:white;border:none;padding:10px 20px;border-radius:var(--radius-sm);cursor:pointer">➕ Add Agronomist</button>
        </div>
      </div>
      <div class="page-body">
        ${agronomists.length === 0 ? 
          '<div class="card" style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:16px">🔬</div><div style="font-size:1.1rem;color:var(--text-mid)">No agronomists found. Add one to get started.</div></div>' :
          `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
            ${agronomists.map(a => {
              const reports = AFV.agronomistReports.filter(r => r.authorId === a.uid);
              return `
                <div class="card" style="border:1px solid #e8d5e8;text-align:center">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                    <div style="font-size:3rem;">${a.imageUrl ? `<img src="${a.imageUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #9b59b6">` : a.avatar}</div>
                    <div style="display:flex;gap:6px">
                      <button onclick="AdminDashboard.openAgronomistModal('${a.uid}')" class="btn-icon" title="Edit agronomist" style="background:var(--blue-water);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">✏️</button>
                      <button onclick="AdminDashboard.deleteAgronomist('${a.uid}')" class="btn-icon" title="Delete agronomist" style="background:var(--red-alert);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">🗑️</button>
                    </div>
                  </div>
                  <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:#9b59b6">${a.displayName || a.name || 'Unnamed'}</div>
                  <div style="color:var(--text-light);font-size:0.75rem;margin-bottom:14px">${a.email || ''}</div>
                  <div style="color:var(--text-light);font-size:0.75rem;margin-bottom:14px">🔑 ${a.password || 'No password'}</div>
                  <div style="color:var(--text-light);font-size:0.78rem;margin-bottom:14px">Agronomist</div>
                  <div style="background:rgba(155,89,182,0.08);border-radius:var(--radius-sm);padding:10px">
                    <div style="font-size:1.4rem;font-weight:800;color:#9b59b6">${reports.length}</div>
                    <div style="font-size:0.72rem;color:var(--text-light)">Reports Submitted</div>
                  </div>
                </div>`;
            }).join('')}
          </div>`}
      </div>
      <div id="agronomist-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">
        <div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h2 style="font-family:'Playfair Display',serif;color:#9b59b6;margin:0" id="agronomist-modal-title">Add New Agronomist</h2>
            <button onclick="AdminDashboard.closeAgronomistModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
          </div>
          <form id="agronomist-form" onsubmit="AdminDashboard.saveAgronomist(event)">
            <input type="hidden" id="agronomist-id">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Email (Login ID)</label>
              <input type="email" id="agronomist-email" required style="width:100%;padding:10px;border:1px solid #e8d5e8;border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., agronomist@example.com">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Full Name</label>
              <input type="text" id="agronomist-name" required style="width:100%;padding:10px;border:1px solid #e8d5e8;border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Enter agronomist's full name">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Avatar</label>
              <div id="agronomist-avatar-options" style="display:flex;gap:8px;flex-wrap:wrap">
                ${availableAvatars.length > 0 ? availableAvatars.map(a => `<label style="cursor:pointer"><input type="radio" name="agronomist-avatar" value="${a}" style="display:none"><div class="agronomist-avatar-option" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;border:2px solid #e8d5e8;border-radius:50%;transition:all 0.2s">${a}</div></label>`).join('') : '<span style="font-size:0.85rem;color:var(--text-light)">No avatars available</span>'}
              </div>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Or Upload Photo</label>
              <input type="file" id="agronomist-image-input" accept="image/*" onchange="AdminDashboard.handleAgronomistImageUpload(this)" style="width:100%;padding:10px;border:1px solid #e8d5e8;border-radius:var(--radius-sm);font-size:0.95rem;background:white">
              <input type="hidden" id="agronomist-image-url">
              <div id="agronomist-image-preview" style="margin-top:10px"></div>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Password</label>
              <input type="password" id="agronomist-password" required style="width:100%;padding:10px;border:1px solid #e8d5e8;border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Login password (default: 1234)">
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
              <button type="button" onclick="AdminDashboard.closeAgronomistModal()" style="padding:10px 20px;background:#e8d5e8;color:#9b59b6;border:none;border-radius:var(--radius-sm);cursor:pointer">Cancel</button>
              <button type="submit" style="padding:10px 24px;background:#9b59b6;color:white;border:none;border-radius:var(--radius-sm);cursor:pointer">💾 Save Agronomist</button>
            </div>
          </form>
        </div>
      </div>
      <style>
        .agronomist-avatar-option:hover { transform: scale(1.1); }
        input[name="agronomist-avatar"]:checked + .agronomist-avatar-option { border-color: #9b59b6; background: rgba(155,89,182,0.1); }
      </style>
    `;
  },

  attachAgronomistEvents() {
    // Add click handlers for avatar selection
    document.querySelectorAll('input[name="agronomist-avatar"]').forEach(input => {
      input.onchange = function() {
        document.querySelectorAll('.agronomist-avatar-option').forEach(el => el.style.borderColor = '#e8d5e8');
        this.nextElementSibling.style.borderColor = '#9b59b6';
      };
    });
  },

  openAgronomistModal(agronomistId = null) {
    const modal = document.getElementById('agronomist-modal');
    const title = document.getElementById('agronomist-modal-title');
    const form = document.getElementById('agronomist-form');
    
    form.reset();
    document.querySelectorAll('.agronomist-avatar-option').forEach(el => el.style.borderColor = '#e8d5e8');
    document.getElementById('agronomist-image-preview').innerHTML = '';
    
    if (agronomistId) {
      const agronomist = AFV.users[agronomistId];
      if (agronomist) {
        title.textContent = 'Edit Agronomist';
        document.getElementById('agronomist-id').value = agronomist.uid;
        document.getElementById('agronomist-email').value = agronomist.email || agronomist.uid;
        document.getElementById('agronomist-name').value = agronomist.name;
        document.getElementById('agronomist-password').value = agronomist.password;
        document.getElementById('agronomist-image-url').value = agronomist.imageUrl || '';
        
        // Show existing image preview
        if (agronomist.imageUrl) {
          document.getElementById('agronomist-image-preview').innerHTML = `<img src="${agronomist.imageUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:50%"> <button type="button" onclick="AdminDashboard.clearAgronomistImage()" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:8px">Remove</button>`;
        }
        
        // Set avatar
        const avatarInput = document.querySelector(`input[name="agronomist-avatar"][value="${agronomist.avatar}"]`);
        if (avatarInput) {
          avatarInput.checked = true;
          avatarInput.nextElementSibling.style.borderColor = '#9b59b6';
        }
      }
    } else {
      title.textContent = 'Add New Agronomist';
      document.getElementById('agronomist-id').value = '';
      // Select first available avatar by default
      const firstAvatar = document.querySelector('input[name="agronomist-avatar"]');
      if (firstAvatar) {
        firstAvatar.checked = true;
        firstAvatar.nextElementSibling.style.borderColor = '#9b59b6';
      }
    }
    
    modal.style.display = 'flex';
  },

  closeAgronomistModal() {
    document.getElementById('agronomist-modal').style.display = 'none';
  },

  handleAgronomistImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('agronomist-image-url').value = e.target.result;
      document.getElementById('agronomist-image-preview').innerHTML = 
        '<img src="' + e.target.result + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #9b59b6">';
    };
    reader.readAsDataURL(file);
  },

  clearAgronomistImage() {
    document.getElementById('agronomist-image-url').value = '';
    document.getElementById('agronomist-image-preview').innerHTML = '';
    document.getElementById('agronomist-image-input').value = '';
  },

  async saveAgronomist(e) {
    e.preventDefault();
    const id = document.getElementById('agronomist-id').value;
    const email = document.getElementById('agronomist-email').value.trim();
    const name = document.getElementById('agronomist-name').value.trim();
    const password = document.getElementById('agronomist-password').value.trim();
    const avatar = document.querySelector('input[name="agronomist-avatar"]:checked')?.value || '🔬';
    const imageUrl = document.getElementById('agronomist-image-url').value || '';
    
    if (!email || !name || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Validate email format
    if (!email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    // Check if email already exists in frontend
    if (AFV.users[email]) {
      showToast('Email already exists. Please choose a different one.', 'error');
      return;
    }
    
    if (id) {
      // Edit existing agronomist (local only for now)
      if (AFV.users[id]) {
        // If email changed, need to create new user and update references
        if (email !== id) {
          // Update any references in agronomist reports
          AFV.agronomistReports.forEach(report => {
            if (report.authorId === id) {
              report.authorId = email;
            }
          });
          
          // Create new user with new email
          AFV.users[email] = {
            id: email,
            name: name,
            role: 'agronomist',
            password: password,
            avatar: avatar,
            imageUrl: imageUrl
          };
          
          // Update current user if it's the same agronomist
          if (AFV.currentUser?.uid === id) {
            AFV.currentUser = AFV.users[email];
            AFV.currentRole = 'agronomist';
          }
          
          // Delete old user
          delete AFV.users[id];
          AFV.logActivity('✏️', `Agronomist email changed from ${id} to ${email}: ${name}`);
          showToast(`Agronomist email changed to "${email}"!`, 'success');
        } else {
          // Just update fields
          AFV.users[id].name = name;
          AFV.users[id].password = password;
          AFV.users[id].avatar = avatar;
          AFV.users[id].imageUrl = imageUrl;
          AFV.logActivity('✏️', `Agronomist updated: ${name}`);
          showToast(`Agronomist "${name}" updated successfully!`, 'success');
        }
      }
    } else {
      // Add new agronomist - create via backend API
      const success = await AFV.createUserBackend({
        email: email,
        password: password,
        displayName: name,
        role: 'agronomist'
      });
      
      if (success) {
        // Add to local users as well
        AFV.users[email] = {
          id: email,
          name: name,
          role: 'agronomist',
          password: password,
          avatar: avatar,
          imageUrl: imageUrl
        };
        AFV.logActivity('➕', `New agronomist added: ${name}`);
        showToast(`Agronomist "${name}" added successfully!`, 'success');
      } else {
        showToast('Failed to create agronomist. Email may already exist.', 'error');
        return;
      }
    }
    
    this.closeAgronomistModal();
    this.showPage('agronomists');
  },

  async deleteAgronomist(agronomistId) {
    const agronomist = AFV.users[agronomistId];
    if (!agronomist) return;
    
    const agronomistName = agronomist.displayName || agronomist.name || agronomistId;
    
    if (!confirm(`Are you sure you want to delete "${agronomistName}"? This action cannot be undone.`)) {
      return;
    }
    
    // Delete from backend if it's an agronomist role
    if (agronomist.role === 'agronomist') {
      await AFV.deleteUserBackend(agronomistId);
    }
    
    delete AFV.users[agronomistId];
    AFV.logActivity('🗑️', `Agronomist deleted: ${agronomistName}`);
    showToast(`Agronomist "${agronomistName}" has been deleted`, 'success');
    this.showPage('agronomists');
  },

  renderReportsInbox() {
    const reports = AFV.agronomistReports || [];
    const unread = reports.filter(r => !r.acknowledged);
    const read = reports.filter(r => r.acknowledged);
    
    // Get current filter
    const filterType = document.getElementById('report-filter-type')?.value || 'all';
    
    // Filter based on selection
    let filteredReports = reports;
    if (filterType === 'unread') {
      filteredReports = unread;
    } else if (filterType === 'read') {
      filteredReports = read;
    }
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#4a2d6e,#2d1a3d);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">📥 Reports Inbox</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Acknowledge agronomist reports</div>
        </div>
        <div class="header-actions">
          <div style="display:flex;gap:10px">
            <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;text-align:center">
              <div style="font-size:0.7rem;color:rgba(255,255,255,0.7)">Unread</div>
              <div style="font-size:1.2rem;font-weight:700;color:white">${unread.length}</div>
            </div>
            <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;text-align:center">
              <div style="font-size:0.7rem;color:rgba(255,255,255,0.7)">Total</div>
              <div style="font-size:1.2rem;font-weight:700;color:white">${reports.length}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="page-body">
        <!-- Filter Section -->
        <div class="card" style="margin-bottom:20px">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-mid)">Filter:</div>
            <select id="report-filter-type" onchange="AdminDashboard.showPage('reports-inbox')" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm)">
              <option value="all" ${filterType === 'all' ? 'selected' : ''}>All Reports</option>
              <option value="unread" ${filterType === 'unread' ? 'selected' : ''}>Unread (${unread.length})</option>
              <option value="read" ${filterType === 'read' ? 'selected' : ''}>Acknowledged (${read.length})</option>
            </select>
            <select id="report-type-filter" onchange="AdminDashboard.showPage('reports-inbox')" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm)">
              <option value="">All Types</option>
              <option value="issue">Issues</option>
              <option value="recommendation">Recommendations</option>
              <option value="observation">Observations</option>
            </select>
          </div>
        </div>
        
        ${filteredReports.length === 0 ? `
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-text">No reports in inbox</div>
          </div>
        </div>
        ` : `
        <!-- Unread Reports Section -->
        ${unread.length > 0 && (filterType === 'all' || filterType === 'unread') ? `
        <div class="card" style="margin-bottom:20px;border:2px solid var(--red-alert)">
          <div class="section-title" style="color:var(--red-alert)">📬 Unread Reports (${unread.length})</div>
          ${unread.map(r => {
            const gh = AFV.greenhouses.find(g => g.id === r.ghId);
            return `
              <div style="margin-bottom:16px;padding:16px;background:rgba(155,89,182,0.05);border-radius:var(--radius-md);border-left:4px solid #9b59b6">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px">
                  <div>
                    <div style="font-size:0.75rem;font-weight:700;color:#9b59b6;text-transform:uppercase;margin-bottom:4px">
                      ${r.type === 'issue' ? '⚠️ Issue Report' : r.type === 'recommendation' ? '💡 Recommendation' : '📝 Field Observation'}
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-light)">
                      ${r.author} · ${timeAgo(r.timestamp)} · ${gh ? `${gh.cropEmoji} ${gh.name}` : 'General'}
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;align-items:center">
                    ${r.tags?.map(t => `<span style="font-size:0.7rem;background:rgba(155,89,182,0.15);color:#9b59b6;padding:2px 8px;border-radius:10px">${t}</span>`).join('') || ''}
                  </div>
                </div>
                <div style="font-size:0.9rem;color:var(--text-dark);line-height:1.7;margin-bottom:14px">${r.text}</div>
                <div style="border-top:1px solid rgba(155,89,182,0.2);padding-top:12px;display:flex;gap:10px;flex-wrap:wrap">
                  <button onclick="AdminDashboard.acknowledgeReport(${r.id})" style="padding:10px 20px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">✅ Acknowledge Report</button>
                  <button onclick="AdminDashboard.showPage('greenhouses')" style="padding:10px 16px;background:transparent;border:1px solid var(--green-pale);border-radius:6px;cursor:pointer;font-size:0.85rem">View Greenhouse</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}
        
        <!-- Acknowledged Reports Section -->
        ${read.length > 0 && (filterType === 'all' || filterType === 'read') ? `
        <div class="card">
          <div class="section-title">✅ Acknowledged Reports (${read.length})</div>
          ${read.slice(0, 10).map(r => {
            const gh = AFV.greenhouses.find(g => g.id === r.ghId);
            return `
              <div style="margin-bottom:12px;padding:14px;background:var(--green-ultra-pale);border-radius:var(--radius-md);border-left:3px solid var(--green-fresh)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:8px">
                  <div>
                    <div style="font-size:0.75rem;font-weight:700;color:var(--green-forest);text-transform:uppercase;margin-bottom:4px">
                      ${r.type === 'issue' ? '⚠️ Issue' : r.type === 'recommendation' ? '💡 Recommendation' : '📝 Observation'}
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-light)">
                      ${r.author} · ${timeAgo(r.timestamp)} · ${gh ? `${gh.cropEmoji} ${gh.name}` : 'General'}
                    </div>
                  </div>
                  <span style="font-size:0.7rem;background:var(--green-fresh);color:white;padding:2px 8px;border-radius:10px">✓ Acknowledged</span>
                </div>
                <div style="font-size:0.85rem;color:var(--text-dark);line-height:1.5">${r.text.substring(0, 150)}${r.text.length > 150 ? '...' : ''}</div>
              </div>
            `;
          }).join('')}
          ${read.length > 10 ? `<div style="text-align:center;padding:10px;color:var(--text-light);font-size:0.85rem">Showing 10 of ${read.length} acknowledged reports</div>` : ''}
        </div>
        ` : ''}
        `}
      </div>
    `;
  },

  acknowledgeReport(id) {
    const r = AFV.agronomistReports.find(r => r.id === id);
    if (r) {
      r.acknowledged = true;
      r.acknowledgedAt = new Date();
      r.acknowledgedBy = AFV.currentUser?.name || 'Admin';
      this.saveState();
      AFV.logActivity('✅', `Agronomist report acknowledged by ${AFV.currentUser?.name || 'Admin'}`);
      showToast('Report acknowledged successfully', 'success');
      this.refreshCurrentPage();
    }
  },

  async refreshCurrentPage() {
    await this.showPage(this.currentPage);
  },

  renderAgroReports() {
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Agronomist Reports 🔬</div>
          <div class="page-subtitle">Technical observations and recommendations from Dr. Grace Njeri</div>
        </div>
      </div>
      <div class="page-body">
        ${AFV.agronomistReports.length === 0 ? '<div class="empty-state card"><div class="empty-icon">📋</div><div class="empty-text">No agronomist reports yet.</div></div>' :
          AFV.agronomistReports.map(r => {
            const gh = AFV.greenhouses.find(g => g.id === r.ghId);
            return `
              <div class="card" style="margin-bottom:16px;border-left:4px solid ${r.type==='issue'?'var(--red-alert)':r.type==='recommendation'?'var(--green-fresh)':'var(--orange-warn)'}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px">
                  <div>
                    <div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--green-deep);margin-bottom:4px">
                      ${r.type==='issue'?'⚠️ Issue Report':r.type==='recommendation'?'💡 Recommendation':'📝 Field Observation'}
                      ${!r.acknowledged ? '<span style="font-size:0.68rem;background:rgba(155,89,182,0.15);color:#9b59b6;padding:2px 8px;border-radius:10px;font-weight:700;margin-left:8px">UNREAD</span>' : ''}
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-light)">${r.author} · ${timeAgo(r.timestamp)} · ${gh ? `${gh.cropEmoji} ${gh.name}` : 'General'}</div>
                  </div>
                  <div style="display:flex;gap:8px">
                    ${r.tags.map(t => `<span class="badge badge-purple">${t}</span>`).join('')}
                  </div>
                </div>
                <div style="font-size:0.9rem;color:var(--text-dark);line-height:1.7;margin-bottom:12px">${r.text}</div>
                ${!r.acknowledged ? `
                  <div style="border-top:1px solid var(--green-pale);padding-top:12px;display:flex;gap:10px">
                    <button onclick="AdminDashboard.acknowledgeReport(${r.id})" class="btn-primary" style="font-size:0.82rem;padding:8px 16px">✅ Mark as Reviewed</button>
                    
                  </div>` : `<div style="font-size:0.75rem;color:var(--green-fresh)">✅ Reviewed by admin</div>`}
              </div>`;
          }).join('')}
      </div>
      
    `;
  },

  renderAnalytics() {
    const greenhouses = AFV.greenhouses || [];
    const crops = greenhouses.map(g => g.crop || '');
    const progresses = greenhouses.map(g => AFV.getOverallProgress ? AFV.getOverallProgress(g) : 0);

    return `
      <div class="page-header">
        <div>
          <div class="page-title">Analytics 📈</div>
          <div class="page-subtitle">Farm performance insights</div>
        </div>
      </div>
      <div class="page-body">
        <div class="two-col">
          <div class="card">
            <div class="section-title">📊 Greenhouse Progress</div>
            ${greenhouses.map((gh, i) => `
              <div style="margin-bottom:16px">
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:6px">
                  <span style="font-weight:600">${gh.cropEmoji} ${gh.name}</span>
                  <span style="color:var(--green-forest);font-weight:700">${progresses[i]}%</span>
                </div>
                <div class="gh-progress-bar" style="height:10px">
                  <div class="gh-progress-fill" style="width:${progresses[i]}%;background:${i===0?'linear-gradient(90deg,#e17055,#fd79a8)':i===1?'linear-gradient(90deg,#d63031,#e17055)':i===2?'linear-gradient(90deg,#0984e3,#74b9ff)':i===3?'linear-gradient(90deg,#fdcb6e,#e17055)':'linear-gradient(90deg,#6c5ce7,#a29bfe)'}"></div>
                </div>
                <div style="font-size:0.72rem;color:var(--text-light);margin-top:2px">${gh.crop || '-'} · ${(gh.plants || 0).toLocaleString()} plants · ${gh.daysToHarvest != null ? (gh.daysToHarvest > 0 ? gh.daysToHarvest + ' days to harvest' : 'Harvested') : (gh.expectedHarvest ? Math.ceil((new Date(gh.expectedHarvest) - new Date()) / (1000*60*60*24)) + ' days to harvest' : 'No harvest date')}</div>
              </div>`).join('')}
          </div>
          <div class="card">
            <div class="section-title">🌱 Crop Distribution</div>
            ${[...new Set(AFV.greenhouses.map(g => g.crop))].map(crop => {
              const count = AFV.greenhouses.filter(g => g.crop === crop).length;
              const plants = AFV.greenhouses.filter(g => g.crop === crop).reduce((s,g) => s+g.plants, 0);
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--green-ultra-pale)">
                  <div>
                    <div style="font-weight:600;font-size:0.9rem">${crop}</div>
                    <div style="font-size:0.72rem;color:var(--text-light)">${count} greenhouse${count>1?'s':''}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-weight:700;color:var(--green-deep)">${plants.toLocaleString()}</div>
                    <div style="font-size:0.72rem;color:var(--text-light)">plants</div>
                  </div>
                </div>`;
            }).join('')}
            <div style="margin-top:16px;padding:14px;background:var(--green-ultra-pale);border-radius:var(--radius-sm)">
              <div style="font-size:0.78rem;font-weight:700;color:var(--green-forest);margin-bottom:8px">FARM TOTALS</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div><div style="font-size:1.4rem;font-weight:800;color:var(--green-deep)">${AFV.greenhouses.reduce((s,g)=>s+g.plants,0).toLocaleString()}</div><div style="font-size:0.72rem;color:var(--text-light)">Total Plants</div></div>
                <div><div style="font-size:1.4rem;font-weight:800;color:var(--green-deep)">${AFV.greenhouses.reduce((s,g)=>s+(parseFloat(g.area)),0).toFixed(2)}</div><div style="font-size:0.72rem;color:var(--text-light)">Total Acres</div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="card" style="margin-top:20px">
          <div class="section-title">📅 Harvest Timeline</div>
          <div class="timeline">
            ${[...AFV.greenhouses].filter(gh => gh.expectedHarvest).sort((a,b) => new Date(a.expectedHarvest) - new Date(b.expectedHarvest)).map(gh => {
              const daysLeft = Math.ceil((new Date(gh.expectedHarvest) - new Date()) / (1000*60*60*24));
              return `
                <div class="timeline-item">
                  <div class="timeline-dot ${daysLeft < 30 ? '' : 'pending'}"></div>
                  <div class="timeline-content">
                    <div class="timeline-date">${new Date(gh.expectedHarvest).toLocaleDateString('en-KE',{day:'2-digit',month:'long',year:'numeric'})} · <strong>${daysLeft} days</strong></div>
                    <div class="timeline-title">${gh.cropEmoji || '🏡'} ${gh.name} — ${gh.crop || 'Not planted'} (${gh.variety || '-'})</div>
                    <div class="timeline-desc">${(gh.plants || 0).toLocaleString()} plants · ${gh.area || '-'} · Expected yield: ${Math.round((gh.plants || 0) * 3.5 / 1000)}T estimated</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      
    `;
  },

  renderInventory() {
    const items = AFV.inventory;
    
    // Calculate items that need reordering
    const lowStockItems = items.filter(i => i.status === 'low');
    const criticalItems = items.filter(i => i.status === 'critical');
    const needReorder = [...criticalItems, ...lowStockItems];
    
    // Get categories for filtering
    const categories = [...new Set(items.map(i => i.category))];
    const currentCategory = document.getElementById('inv-category-filter')?.value || '';
    const filteredItems = currentCategory ? items.filter(i => i.category === currentCategory) : items;
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#0d2818,#1a4d2e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">Inventory 📦</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Farm supplies and stock levels</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" onclick="AdminDashboard.openInventoryModal()" style="background:var(--green-fresh);border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:0.9rem;font-weight:600;color:white">➕ Add Item</button>
        </div>
      </div>
      <div class="page-body">
        <!-- Reorder Alerts Section -->
        ${needReorder.length > 0 ? `
        <div class="card" style="margin-bottom:20px;border:2px solid var(--orange-warn)">
          <div class="section-title" style="color:var(--orange-warn)">🚨 Reorder Alerts (${needReorder.length})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:12px">
            ${needReorder.map(i => `
              <div style="background:${i.status === 'critical' ? 'rgba(214,48,49,0.08)' : 'rgba(247,183,51,0.08)'};border-radius:var(--radius-sm);padding:14px;border-left:4px solid ${i.status === 'critical' ? 'var(--red-alert)' : 'var(--orange-warn)'}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                  <div style="font-weight:600;font-size:0.9rem">${i.name}</div>
                  <span class="badge badge-${i.status === 'critical' ? 'red' : 'orange'}" style="font-size:0.7rem">${i.status === 'critical' ? '🔴 Critical' : '⚠️ Low'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-dark);margin-bottom:8px">
                  <span>Current: <strong>${i.qty} ${i.unit}</strong></span>
                  <span style="color:var(--text-light)">Reorder at: ${i.reorder} ${i.unit}</span>
                </div>
                <button onclick="AdminDashboard.reorderItem(${i.id})" style="width:100%;padding:8px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600">📞 Create Reorder Request</button>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-value">${items.length}</div><div class="stat-label">Total Items</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${items.filter(i=>i.status==='good').length}</div><div class="stat-label">Well Stocked</div></div></div>
          <div class="stat-card"><div class="stat-icon">⚠️</div><div><div class="stat-value" style="color:var(--orange-warn)">${items.filter(i=>i.status==='low').length}</div><div class="stat-label">Running Low</div></div></div>
          <div class="stat-card"><div class="stat-icon">🔴</div><div><div class="stat-value" style="color:var(--red-alert)">${items.filter(i=>i.status==='critical').length}</div><div class="stat-label">Critical — Reorder Now</div></div></div>
        </div>
        
        <!-- Category Filter -->
        <div class="card" style="margin-bottom:16px">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-mid)">Filter by Category:</div>
            <select id="inv-category-filter" onchange="AdminDashboard.showPage('inventory')" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);min-width:150px">
              <option value="" ${currentCategory === '' ? 'selected' : ''}>All Categories</option>
              ${categories.map(c => `<option value="${c}" ${currentCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div class="card">
          <div class="scroll-x">
            <table>
              <thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Reorder At</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${filteredItems.map(i => `
                  <tr>
                    <td style="font-weight:600">${i.name}</td>
                    <td><span class="badge badge-green">${i.category}</span></td>
                    <td style="font-family:'JetBrains Mono',monospace">${i.qty} ${i.unit}</td>
                    <td style="font-family:'JetBrains Mono',monospace;color:var(--text-light)">${i.reorder} ${i.unit}</td>
                    <td><span class="badge ${i.status==='good'?'badge-green':i.status==='low'?'badge-orange':'badge-red'}">${i.status==='good'?'✓ Good':i.status==='low'?'⚠ Low':'🔴 Critical'}</span></td>
                    <td>
                      <button onclick="AdminDashboard.openInventoryModal(${i.id})" style="font-size:0.78rem;padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:6px;cursor:pointer;margin-right:4px">✏️ Edit</button>
                      <button onclick="AdminDashboard.deleteInventory(${i.id})" style="font-size:0.78rem;padding:4px 8px;background:var(--red-alert);color:white;border:none;border-radius:6px;cursor:pointer">🗑️</button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="inventory-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">
        <div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0" id="inventory-modal-title">Add Inventory Item</h2>
            <button onclick="AdminDashboard.closeInventoryModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
          </div>
          <form id="inventory-form" onsubmit="AdminDashboard.saveInventory(event)">
            <input type="hidden" id="inventory-id">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Item Name</label>
              <input type="text" id="inventory-name" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Category</label>
              <select id="inventory-category" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                <option value="Fertilizer">Fertilizer</option>
                <option value="Fungicide">Fungicide</option>
                <option value="Pesticide">Pesticide</option>
                <option value="Equipment">Equipment</option>
                <option value="Supplies">Supplies</option>
                <option value="Media">Media</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Chemicals">Chemicals</option>
              </select>
            </div>
            <div style="display:flex;gap:12px">
              <div style="margin-bottom:16px;flex:1">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Quantity</label>
                <input type="number" id="inventory-qty" required min="0" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
              </div>
              <div style="margin-bottom:16px;flex:1">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Unit</label>
                <input type="text" id="inventory-unit" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="kg, L, pcs">
              </div>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Reorder At</label>
              <input type="number" id="inventory-reorder" required min="0" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
              <button type="button" onclick="AdminDashboard.closeInventoryModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button>
              <button type="submit" class="btn-primary" style="padding:10px 24px">💾 Save Item</button>
            </div>
          </form>
        </div>
      </div>
      
    `;
  },

  renderSchedule() {
    const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const greenhouses = AFV.greenhouses || [];

    return `
      <div class="page-header">
        <div>
          <div class="page-title">Schedule 📅</div>
          <div class="page-subtitle">Task timeline and farm calendar</div>
        </div>
      </div>
      <div class="page-body">
        <div class="card" style="margin-bottom:20px">
          <div class="section-title">📌 This Week's Priorities</div>
          ${greenhouses.flatMap(gh => (gh.tasks || []).filter(t => !t.completed).slice(0,1).map(t => ({gh, task: t}))).map(({gh, task}) => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);margin-bottom:8px">
              <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;background-color:var(--green-ultra-pale)">${gh.cropEmoji || '🏡'}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.9rem">${task.name || task.title || '-'}</div>
                <div style="font-size:0.75rem;color:var(--text-light)">${gh.name} · ${task.duration || '-'} · ${(task.priority || 'medium').toUpperCase()} priority</div>
              </div>
              <span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}">${task.priority || 'medium'}</span>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="section-title">📋 Upcoming Harvest Calendar</div>
          <div class="timeline">
            ${greenhouses.filter(gh => gh.expectedHarvest).sort((a,b) => new Date(a.expectedHarvest) - new Date(b.expectedHarvest)).map(gh => {
              const days = Math.ceil((new Date(gh.expectedHarvest) - new Date())/(1000*60*60*24));
              return `
                <div class="timeline-item">
                  <div class="timeline-dot ${days<60?'':'pending'}"></div>
                  <div class="timeline-content">
                    <div class="timeline-date">${new Date(gh.expectedHarvest).toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long'})}</div>
                    <div class="timeline-title">${gh.cropEmoji || '🏡'} ${gh.crop || '-'} — ${gh.name}</div>
                    <div class="timeline-desc">In ${days} days · ${(gh.plants || 0).toLocaleString()} plants · ${gh.area || '-'}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      
    `;
  },

  renderAlerts() {
    const alerts = AFV.alerts || [];
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Alerts 🔔</div>
          <div class="page-subtitle">${alerts.filter(a=>a.level==='critical').length} critical · ${alerts.filter(a=>a.level==='warning').length} warnings</div>
        </div>
      </div>
      <div class="page-body">
        ${alerts.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--text-light)">✅ No alerts</div>' : alerts.map((a, index) => `
          <div style="display:flex;gap:14px;padding:16px;background:${a.level==='critical'?'rgba(214,48,49,0.05)':a.level==='warning'?'rgba(225,112,85,0.05)':'rgba(9,132,227,0.05)'};border:1.5px solid ${a.level==='critical'?'rgba(214,48,49,0.2)':a.level==='warning'?'rgba(225,112,85,0.2)':'rgba(9,132,227,0.15)'};border-radius:var(--radius-md);margin-bottom:12px">
            <div style="font-size:1.8rem;flex-shrink:0">${a.icon}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:0.95rem;color:${a.level==='critical'?'var(--red-alert)':a.level==='warning'?'var(--orange-warn)':'var(--blue-water)'};margin-bottom:4px">${a.title}</div>
              <div style="font-size:0.85rem;color:var(--text-dark);line-height:1.5">${a.desc}</div>
              <div style="font-size:0.72rem;color:var(--text-light);margin-top:6px">🕐 ${a.time}</div>
            </div>
            <button onclick="AdminDashboard.dismissAlert(${index})" style="align-self:flex-start;font-size:0.75rem;padding:4px 12px;background:transparent;border:1px solid var(--green-pale);border-radius:6px;cursor:pointer;color:var(--text-light)">Dismiss</button>
          </div>`).join('')}
      </div>
      
    `;
  },

  dismissAlert(index) {
    AFV.alerts.splice(index, 1);
    localStorage.setItem('afv_alerts', JSON.stringify(AFV.alerts));
    this.showPage('alerts');
  },

  renderActivityLog() {
    const activities = AFV.activityLog || [];
    
    // Get unique action types for filtering
    const actionTypes = [...new Set(activities.map(a => {
      if (a.text?.toLowerCase().includes('task')) return 'task';
      if (a.text?.toLowerCase().includes('report')) return 'report';
      if (a.text?.toLowerCase().includes('harvest')) return 'harvest';
      if (a.text?.toLowerCase().includes('greenhouse')) return 'greenhouse';
      if (a.text?.toLowerCase().includes('login') || a.text?.toLowerCase().includes('logout')) return 'auth';
      return 'other';
    }))];
    
    // Get current filters
    const currentFilter = document.getElementById('activity-type-filter')?.value || '';
    const currentGHFilter = document.getElementById('activity-gh-filter')?.value || '';
    
    // Filter activities
    let filteredActivities = activities;
    if (currentFilter) {
      filteredActivities = activities.filter(a => {
        if (currentFilter === 'task') return a.text?.toLowerCase().includes('task');
        if (currentFilter === 'report') return a.text?.toLowerCase().includes('report');
        if (currentFilter === 'harvest') return a.text?.toLowerCase().includes('harvest');
        if (currentFilter === 'greenhouse') return a.text?.toLowerCase().includes('greenhouse');
        if (currentFilter === 'auth') return a.text?.toLowerCase().includes('login') || a.text?.toLowerCase().includes('logout');
        return true;
      });
    }
    
    // Group activities by date
    const groupedActivities = {};
    filteredActivities.forEach(a => {
      const date = new Date(a.time).toLocaleDateString('en-KE');
      if (!groupedActivities[date]) groupedActivities[date] = [];
      groupedActivities[date].push(a);
    });
    
    const now = new Date();
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#0d2818,#1a4d2e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">📜 Activity Log</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Complete history of farm activities</div>
        </div>
        <div class="header-actions">
          <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;text-align:center">
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.7)">Total Activities</div>
            <div style="font-size:1.2rem;font-weight:700;color:white">${activities.length}</div>
          </div>
        </div>
      </div>
      
      <div class="page-body">
        <!-- Filters -->
        <div class="card" style="margin-bottom:20px">
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-mid)">Filters:</div>
            <select id="activity-type-filter" onchange="AdminDashboard.showPage('activity-log')" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);min-width:140px">
              <option value="" ${currentFilter === '' ? 'selected' : ''}>All Types</option>
              <option value="task" ${currentFilter === 'task' ? 'selected' : ''}>Tasks</option>
              <option value="report" ${currentFilter === 'report' ? 'selected' : ''}>Reports</option>
              <option value="harvest" ${currentFilter === 'harvest' ? 'selected' : ''}>Harvest</option>
              <option value="greenhouse" ${currentFilter === 'greenhouse' ? 'selected' : ''}>Greenhouses</option>
              <option value="auth" ${currentFilter === 'auth' ? 'selected' : ''}>Auth</option>
            </select>
            <select id="activity-gh-filter" onchange="AdminDashboard.showPage('activity-log')" style="padding:8px 12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);min-width:150px">
              <option value="" ${currentGHFilter === '' ? 'selected' : ''}>All Greenhouses</option>
              ${(AFV.greenhouses || []).map(g => `<option value="${g.name}" ${currentGHFilter === g.name ? 'selected' : ''}>${g.cropEmoji} ${g.name}</option>`).join('')}
            </select>
            <button onclick="AdminDashboard.clearActivityFilters()" style="padding:8px 12px;background:transparent;border:1px solid var(--green-pale);border-radius:var(--radius-sm);cursor:pointer;font-size:0.8rem;color:var(--text-light)">Clear</button>
          </div>
        </div>
        
        <!-- Activity Timeline -->
        ${Object.keys(groupedActivities).length === 0 ? `
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon">📜</div>
            <div class="empty-text">No activities match your filters</div>
          </div>
        </div>
        ` : `
        ${Object.entries(groupedActivities).map(([date, dayActivities]) => `
          <div class="card" style="margin-bottom:16px">
            <div class="section-title">📅 ${date}</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${dayActivities.map(a => {
                const isToday = new Date(a.time).toDateString() === now.toDateString();
                const isRecent = (now - new Date(a.time)) < 3600000;
                
                return `
                  <div style="display:flex;gap:14px;padding:14px;background:${isRecent ? 'rgba(46,204,113,0.05)' : 'var(--green-ultra-pale)'};border-radius:var(--radius-sm);border-left:3px solid ${isRecent ? 'var(--green-fresh)' : 'var(--green-pale)'}">
                    <div style="font-size:1.4rem;width:40px;text-align:center">${a.icon}</div>
                    <div style="flex:1">
                      <div style="font-size:0.9rem;font-weight:500">${a.text}</div>
                      <div style="display:flex;gap:12px;margin-top:4px;font-size:0.75rem;color:var(--text-light)">
                        <span>🕐 ${new Date(a.time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
                        ${a.gh ? `<span>🏡 ${a.gh}</span>` : ''}
                      </div>
                    </div>
                    ${isRecent ? '<span style="font-size:0.65rem;background:var(--green-fresh);color:white;padding:2px 8px;border-radius:10px;height:fit-content">JUST NOW</span>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
        `}
      </div>
    `;
  },

  clearActivityFilters() {
    document.getElementById('activity-type-filter').value = '';
    document.getElementById('activity-gh-filter').value = '';
    this.showPage('activity-log');
  },

  renderPasswordResets() {
    const requests = AFV.passwordResetRequests || [];
    const pendingRequests = requests.filter(r => !r.resolved);
    const resolvedRequests = requests.filter(r => r.resolved);

    return `
      <div class="page-header">
        <div>
          <div class="page-title">🔐 Password Reset Requests</div>
          <div class="page-subtitle">Manage password reset requests from users</div>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card"><div class="stat-icon">⏳</div><div><div class="stat-value">${pendingRequests.length}</div><div class="stat-label">Pending Requests</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${resolvedRequests.length}</div><div class="stat-label">Resolved</div></div></div>
        </div>
        
        ${pendingRequests.length > 0 ? `
        <div class="card">
          <div class="section-title">⏳ Pending Requests</div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${pendingRequests.map(r => `
              <div style="padding:16px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);background:rgba(225,112,85,0.05)">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
                  <div>
                    <div style="font-weight:600;font-size:1.1rem">${r.userName}</div>
                    <div style="font-size:0.85rem;color:var(--text-light)">@${r.username} · ${r.userRole}</div>
                    ${r.userEmail ? `<div style="font-size:0.75rem;color:var(--blue-water)">📧 ${r.userEmail}</div>` : ''}
                    <div style="font-size:0.75rem;color:var(--text-light);margin-top:4px">Requested: ${r.requestedAt.toLocaleString('en-KE')}</div>
                  </div>
                  <span class="badge badge-orange">Pending</span>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <input type="password" id="new-password-${r.id}" placeholder="Enter new password" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--blue-pale);font-size:0.9rem">
                  <button onclick="AdminDashboard.resetUserPassword('${r.id}')" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem">🔑 Reset Password</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : `
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon">🔐</div>
            <div class="empty-text">No pending password reset requests</div>
          </div>
        </div>
        `}
        
        ${resolvedRequests.length > 0 ? `
        <div class="card" style="margin-top:20px">
          <div class="section-title">✅ Resolved Requests</div>
          <table>
            <thead><tr><th>User</th><th>Role</th><th>New Password</th><th>Resolved By</th><th>Date</th></tr></thead>
            <tbody>
              ${resolvedRequests.map(r => `
                <tr>
                  <td>${r.userName}</td>
                  <td>${r.userRole}</td>
                  <td><code style="background:var(--blue-pale);padding:2px 6px;border-radius:4px">${r.newPassword}</code></td>
                  <td>${r.resolvedBy}</td>
                  <td>${r.resolvedAt?.toLocaleDateString('en-KE') || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      </div>
    `;
  },

  resetUserPassword(requestId) {
    const newPassword = document.getElementById(`new-password-${requestId}`).value.trim();
    
    if (!newPassword || newPassword.length < 4) {
      showToast('Please enter a valid password (at least 4 characters)', 'error');
      return;
    }
    
    const request = AFV.passwordResetRequests?.find(r => r.id === requestId);
    if (!request) {
      showToast('Request not found', 'error');
      return;
    }
    
    // Update user password
    const user = AFV.users[request.username];
    if (user) {
      user.password = newPassword;
      
      // Mark request as resolved
      request.resolved = true;
      request.resolvedAt = new Date();
      request.newPassword = newPassword;
      request.resolvedBy = AFV.currentUser.name;
      
      this.saveState();
      showToast(`Password reset for ${request.userName}!`, 'success');
      this.showPage('password-resets');
    }
  },

  updateAccountSettings() {
    const email = document.getElementById('admin-email')?.value?.trim();
    const currentPassword = document.getElementById('admin-current-password')?.value;
    const newPassword = document.getElementById('admin-new-password')?.value;
    const confirmPassword = document.getElementById('admin-confirm-password')?.value;

    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    // If changing password, validate
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        showToast('Please enter your current password', 'error');
        return;
      }

      const adminUser = AFV.users.admin || AFV.currentUser;
      if (adminUser.password !== currentPassword) {
        showToast('Current password is incorrect', 'error');
        return;
      }

      if (newPassword.length < 4) {
        showToast('New password must be at least 4 characters', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
    }

    // Update admin user
    const adminUser = AFV.users.admin;
    if (adminUser) {
      adminUser.email = email;
      if (newPassword) {
        adminUser.password = newPassword;
      }
      this.saveState();
      showToast('Account settings updated successfully!', 'success');
    }
  },

  renderSettings() {
    const adminUser = AFV.users.admin || AFV.currentUser;
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Settings ⚙️</div>
          <div class="page-subtitle">Farm configuration and preferences</div>
        </div>
      </div>
      <div class="page-body">
        <div class="two-col">
          <div class="card">
            <div class="section-title">🔐 Account Settings</div>
            <div style="display:flex;flex-direction:column;gap:14px">
              <div class="input-group"><label>Email</label><input type="email" id="admin-email" value="${adminUser?.email || ''}" placeholder="your@email.com"></div>
              <div class="input-group"><label>Current Password</label><input type="password" id="admin-current-password" placeholder="Enter current password"></div>
              <div class="input-group"><label>New Password</label><input type="password" id="admin-new-password" placeholder="Enter new password"></div>
              <div class="input-group"><label>Confirm New Password</label><input type="password" id="admin-confirm-password" placeholder="Confirm new password"></div>
              <button class="btn-primary" onclick="AdminDashboard.updateAccountSettings()">Update Account</button>
            </div>
          </div>
          <div class="card">
            <div class="section-title">🌾 Farm Profile</div>
            <div style="display:flex;flex-direction:column;gap:14px">
              <div class="input-group"><label>Farm Name</label><input type="text" value="Agri-Fine Ventures Ltd"></div>
              <div class="input-group"><label>Location</label><input type="text" value="Naivasha, Nakuru County, Kenya"></div>
              <div class="input-group"><label>Total Area</label><input type="text" value="2.15 acres"></div>
              <div class="input-group"><label>Owner</label><input type="text" value="Admin"></div>
              <button class="btn-primary">Save Farm Profile</button>
            </div>
          </div>

          <div class="card" style="border:2px solid var(--red-alert)">
            <div class="section-title" style="color:var(--red-alert)">⚠️ Reset System</div>
            <p style="font-size:0.85rem;color:var(--text-light);margin-bottom:12px">This will clear ALL data including greenhouses, tasks, workers, supervisors, harvest records, receipts, and more. The system will reset to default values.</p>
            <button onclick="AdminDashboard.resetAllData()" style="padding:10px 20px;background:var(--red-alert);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.9rem;font-weight:600">🗑️ Reset All Data</button>
          </div>
          
        </div>
      </div>
       
    `;
  },

  renderFeedingProgram() {
    const program = AFV.feedingProgram;
    const skipWeeks = program.skipWeeks;
    const hasCalendar = !!program.calendarStartDate;
    const currentWeek = AFV.getCalendarCurrentWeek();
    const currentCycle = AFV.getCurrentCalendarCycle();
    const weekDates = AFV.getCalendarWeekDates(currentWeek);
    
    // Get today's date info
    const today = new Date();
    const dayName = today.toLocaleDateString('en-KE', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a3a1a,#2d5a2d);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🧪 Feeding Program</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${hasCalendar ? `Cycle ${currentCycle} · Week ${currentWeek} of 34-week schedule` : '34-week fertilizer schedule for all greenhouses'}</div>
        </div>
        <div class="header-actions">
          ${hasCalendar ? `
            <button class="btn-primary" style="background:rgba(46,204,113,0.8)" onclick="AdminDashboard.showFeedingCalendar()">🗓️ Calendar</button>
            <button class="btn-secondary" style="background:rgba(214,48,49,0.8);color:white;margin-left:10px" onclick="AdminDashboard.resetFeedingCalendar()">🔄 Reset Cycle</button>
          ` : `
            <button class="btn-primary" style="background:rgba(46,204,113,0.8)" onclick="AdminDashboard.startFeedingCalendar()">🚀 Start 34-Week Cycle</button>
          `}
          <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;margin-left:10px;text-align:center;cursor:pointer" onclick="AdminDashboard.showFeedingCalendar()">
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.7)">${dayName}</div>
            <div style="font-size:0.9rem;font-weight:700">${dateStr}</div>
          </div>
        </div>
      </div>
      ${hasCalendar ? `
      <div class="page-body">
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(46,204,113,0.1),rgba(46,204,113,0.05));border:2px solid var(--green-deep)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
            <div>
              <div class="section-title" style="color:var(--green-deep)">📅 Current Week: ${currentWeek}</div>
              <div style="font-size:0.9rem;color:var(--text-mid)">${weekDates ? `${weekDates.startStr} - ${weekDates.endStr}` : ''}</div>
              <div style="font-size:0.8rem;color:var(--text-light)">Cycle ${currentCycle} · ${currentWeek === 34 ? 'Final week - cycle will restart' : `${34 - currentWeek} weeks remaining`}</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:2.5rem;font-weight:900;color:var(--green-deep)">${currentWeek}</div>
              <div style="font-size:0.7rem;color:var(--text-light)">of 34</div>
            </div>
          </div>
        </div>
      </div>
      ` : ''}
      <div class="page-body">
        <div class="card" style="margin-bottom:20px">
          <div class="section-title">📋 Program Overview</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px">
            <div style="background:var(--green-ultra-pale);padding:14px;border-radius:var(--radius-sm);text-align:center">
              <div style="font-size:1.5rem;font-weight:800;color:var(--green-deep)">34</div>
              <div style="font-size:0.7rem;color:var(--text-light)">TOTAL WEEKS</div>
            </div>
            <div style="background:var(--green-ultra-pale);padding:14px;border-radius:var(--radius-sm);text-align:center">
              <div style="font-size:1.5rem;font-weight:800;color:var(--green-deep)">30</div>
              <div style="font-size:0.7rem;color:var(--text-light)">WEEKS WITH FERTILIZER</div>
            </div>
            <div style="background:rgba(214,48,49,0.08);padding:14px;border-radius:var(--radius-sm);text-align:center">
              <div style="font-size:1.5rem;font-weight:800;color:var(--red-alert)">4</div>
              <div style="font-size:0.7rem;color:var(--text-light)">SKIP WEEKS</div>
            </div>
            <div style="background:var(--green-ultra-pale);padding:14px;border-radius:var(--radius-sm);text-align:center">
              <div style="font-size:1.5rem;font-weight:800;color:var(--blue-water)">4</div>
              <div style="font-size:0.7rem;color:var(--text-light)">FERTILIZER TYPES</div>
            </div>
          </div>
          <div style="margin-top:16px;padding:12px;background:rgba(9,132,227,0.06);border-radius:var(--radius-sm);border-left:3px solid var(--blue-water)">
            <div style="font-size:0.78rem;font-weight:700;color:var(--blue-water);margin-bottom:4px">ℹ️ SCHEDULE INFO</div>
            <div style="font-size:0.85rem;color:var(--text-mid)">
              <strong>N.P.K</strong> and <strong>Magnesium Sulphate</strong> are applied every week (weeks 1-34).<br>
              <strong>Calcium Carbonate</strong> and <strong>Potassium Sulphate</strong> are skipped in weeks: <strong>${skipWeeks.join(', ')}</strong>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="section-title">⚙️ Configure Fertilizer Amounts</div>
          <div style="font-size:0.85rem;color:var(--text-light);margin-bottom:16px">Set the amount of each fertilizer to be applied per greenhouse. You can enter amounts in grams (g) or kilograms (kg).</div>
          
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
            <div style="background:var(--green-ultra-pale);padding:16px;border-radius:var(--radius-sm)">
              <div style="font-weight:700;color:var(--green-deep);margin-bottom:4px">🌱 N.P.K</div>
              <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:10px">Applied every week</div>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="fert-npk-amount" value="${program.configuredAmounts.npk || program.weeklyFertilizers.npk.defaultAmount}" style="width:80px;padding:8px;border:1px solid var(--green-pale);border-radius:var(--radius-sm)">
                <select id="fert-npk-unit" style="padding:8px;border:1px solid var(--green-pale);border-radius:var(--radius-sm)">
                  <option value="kg" selected>kg</option>
                  <option value="g">g</option>
                </select>
                <button onclick="updateFertilizerAmount('npk')" style="padding:8px 14px;background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer">Save</button>
              </div>
            </div>
            
            <div style="background:var(--green-ultra-pale);padding:16px;border-radius:var(--radius-sm)">
              <div style="font-weight:700;color:var(--green-deep);margin-bottom:4px">🌿 Magnesium Sulphate</div>
              <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:10px">Applied every week</div>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="fert-mg-amount" value="${program.configuredAmounts.magnesiumSulphate || program.weeklyFertilizers.magnesiumSulphate.defaultAmount}" style="width:80px;padding:8px;border:1px solid var(--green-pale);border-radius:var(--radius-sm)">
                <select id="fert-mg-unit" style="padding:8px;border:1px solid var(--green-pale);border-radius:var(--radius-sm)">
                  <option value="kg" selected>kg</option>
                  <option value="g">g</option>
                </select>
                <button onclick="updateFertilizerAmount('mg')" style="padding:8px 14px;background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer">Save</button>
              </div>
            </div>
            
            <div style="background:rgba(9,132,227,0.06);padding:16px;border-radius:var(--radius-sm)">
              <div style="font-weight:700;color:var(--blue-water);margin-bottom:4px">🧪 Calcium Carbonate</div>
              <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:10px">Skipped weeks: 1, 11, 21, 31</div>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="fert-ca-amount" value="${program.configuredAmounts.calciumCarbonate || program.periodicFertilizers.calciumCarbonate.defaultAmount}" style="width:80px;padding:8px;border:1px solid var(--blue-water);border-radius:var(--radius-sm)">
                <select id="fert-ca-unit" style="padding:8px;border:1px solid var(--blue-water);border-radius:var(--radius-sm)">
                  <option value="kg" selected>kg</option>
                  <option value="g">g</option>
                </select>
                <button onclick="updateFertilizerAmount('ca')" style="padding:8px 14px;background:var(--blue-water);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer">Save</button>
              </div>
            </div>
            
            <div style="background:rgba(155,89,182,0.08);padding:16px;border-radius:var(--radius-sm)">
              <div style="font-weight:700;color:#9b59b6;margin-bottom:4px">⚡ Potassium Sulphate</div>
              <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:10px">Skipped weeks: 1, 11, 21, 31</div>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="fert-k-amount" value="${program.configuredAmounts.potassiumSulphate || program.periodicFertilizers.potassiumSulphate.defaultAmount}" style="width:80px;padding:8px;border:1px solid #9b59b6;border-radius:var(--radius-sm)">
                <select id="fert-k-unit" style="padding:8px;border:1px solid #9b59b6;border-radius:var(--radius-sm)">
                  <option value="kg" selected>kg</option>
                  <option value="g">g</option>
                </select>
                <button onclick="updateFertilizerAmount('k')" style="padding:8px 14px;background:#9b59b6;color:white;border:none;border-radius:var(--radius-sm);cursor:pointer">Save</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">📅 Weekly Schedule Preview</div>
          <div style="overflow-x:auto">
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>N.P.K</th>
                  <th>Magnesium Sulphate</th>
                  <th>Calcium Carbonate</th>
                  <th>Potassium Sulphate</th>
                </tr>
              </thead>
              <tbody>
                ${[...Array(34)].map((_, i) => {
                  const week = i + 1;
                  const schedule = AFV.getWeekSchedule(week);
                  const isSkipped = schedule.skippedFertilizers?.length > 0;
                  const npk = schedule.fertilizers.find(f => f.name === 'N.P.K');
                  const mg = schedule.fertilizers.find(f => f.name === 'Magnesium Sulphate');
                  const ca = schedule.fertilizers.find(f => f.name === 'Calcium Carbonate');
                  const k = schedule.fertilizers.find(f => f.name === 'Potassium Sulphate');
                  return `
                    <tr style="${isSkipped ? 'background:rgba(214,48,49,0.05)' : ''}">
                      <td style="font-weight:600">Week ${week} ${isSkipped ? '<span style="color:var(--red-alert)">(Skip)</span>' : ''}</td>
                      <td>${npk ? npk.amount + ' ' + npk.unit : '—'}</td>
                      <td>${mg ? mg.amount + ' ' + mg.unit : '—'}</td>
                      <td>${ca ? ca.amount + ' ' + ca.unit : '<span style="color:var(--text-light)">—</span>'}</td>
                      <td>${k ? k.amount + ' ' + k.unit : '<span style="color:var(--text-light)">—</span>'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  attachFeedingEvents() {
    // Events are handled by global functions
  },

  acknowledgeReport(id) {
    const r = AFV.agronomistReports.find(r => r.id === id);
    if (r) { r.acknowledged = true; showToast('Report marked as reviewed', 'success'); this.showPage(this.currentPage); }
  },

  attachPageEvents(page) {
    if (page === 'settings') {
      const keyInput = document.getElementById('settings-apikey');
      if (keyInput && AFV.aiSettings.apiKey) keyInput.value = AFV.aiSettings.apiKey;
    }
    
    // Make AdminDashboard globally accessible
    window.AdminDashboard = this;
    
    // Add event listeners for edit task buttons
    var btns = document.querySelectorAll('.edit-task-btn');
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        btn.onclick = function() {
          var ghId = btn.getAttribute('data-gh-id');
          var taskId = btn.getAttribute('data-task-id');
          AdminDashboard.openTaskModal(ghId, taskId);
        };
      })(btns[i]);
    }
  },

  filterTasks(filter) {
    // re-render with filter — simplified
    this.showPage('tasks');
  },

  // ============================================
  // GREENHOUSE EDIT MODAL
  // ============================================
  openGreenhouseModal(ghId) {
    const gh = AFV.greenhouses.find(g => g.id === ghId);
    if (!gh) return;
    
    const modal = document.getElementById('greenhouse-modal');
    if (!modal) {
      this.insertGreenhouseModal();
    }
    
    // Populate form
    document.getElementById('gh-id').value = gh.id;
    document.getElementById('gh-name').value = gh.name;
    document.getElementById('gh-crop').value = gh.crop;
    document.getElementById('gh-crop-emoji').value = gh.cropEmoji;
    document.getElementById('gh-variety').value = gh.variety;
    document.getElementById('gh-image-url').value = gh.imageUrl || '';
    
    // Show image preview if exists
    const preview = document.getElementById('gh-image-preview');
    if (gh.imageUrl) {
      preview.innerHTML = `<img src="${gh.imageUrl}" style="width:100px;height:100px;object-fit:cover;border-radius:8px"> <button type="button" onclick="AdminDashboard.clearGreenhouseImage()" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:8px">Remove</button>`;
    } else {
      preview.innerHTML = '';
    }
    document.getElementById('gh-area').value = gh.area || '';
    document.getElementById('gh-plants').value = gh.plants || 0;
    document.getElementById('gh-planted-date').value = gh.plantedDate ? gh.plantedDate.toISOString().split('T')[0] : '';
    document.getElementById('gh-harvest-date').value = gh.expectedHarvest ? gh.expectedHarvest.toISOString().split('T')[0] : '';
    document.getElementById('gh-notes').value = gh.notes || '';
    document.getElementById('gh-temp').value = gh.environment?.temp || '';
    document.getElementById('gh-humidity').value = gh.environment?.humidity || '';
    document.getElementById('gh-light').value = gh.environment?.light || '';
    
    document.getElementById('greenhouse-modal').style.display = 'flex';
    document.getElementById('greenhouse-modal').dataset.mode = 'edit';
  },

  openAddGreenhouseModal() {
    const modal = document.getElementById('greenhouse-modal');
    if (!modal) {
      this.insertGreenhouseModal();
    }
    
    // Set modal title for adding new
    document.getElementById('gh-modal-title').textContent = 'Add New Greenhouse';
    document.getElementById('gh-id').value = '';
    
    // Reset form
    document.getElementById('gh-name').value = '';
    document.getElementById('gh-crop').value = '';
    document.getElementById('gh-crop-emoji').value = '🌱';
    document.getElementById('gh-variety').value = '';
    document.getElementById('gh-image-url').value = '';
    document.getElementById('gh-image-preview').innerHTML = '';
    document.getElementById('gh-area').value = '0.5';
    document.getElementById('gh-plants').value = '1000';
    
    const today = new Date();
    document.getElementById('gh-planted-date').value = today.toISOString().split('T')[0];
    
    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + 90);
    document.getElementById('gh-harvest-date').value = harvestDate.toISOString().split('T')[0];
    
    document.getElementById('gh-notes').value = '';
    document.getElementById('gh-temp').value = '24°C';
    document.getElementById('gh-humidity').value = '70%';
    document.getElementById('gh-light').value = 'Optimal';
    
    // Update form submission to handle new greenhouse
    document.getElementById('greenhouse-modal').dataset.mode = 'add';
    
    document.getElementById('greenhouse-modal').style.display = 'flex';
  },

  insertGreenhouseModal() {
    const modal = document.createElement('div');
    modal.id = 'greenhouse-modal';
    modal.className = 'modal';
    modal.style = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center';
    modal.innerHTML = `
      <div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:560px;width:90%;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0" id="gh-modal-title">Edit Greenhouse</h2>
          <button onclick="AdminDashboard.closeGreenhouseModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
        </div>
        <form id="greenhouse-form" onsubmit="AdminDashboard.saveGreenhouse(event)">
          <input type="hidden" id="gh-id">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Greenhouse Name</label>
              <input type="text" id="gh-name" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Crop</label>
              <input type="text" id="gh-crop" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Emoji</label>
              <input type="text" id="gh-crop-emoji" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="🌱">
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Variety</label>
              <input type="text" id="gh-variety" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Upload Image (optional)</label>
            <input type="file" id="gh-image" accept="image/*" onchange="AdminDashboard.handleGreenhouseImageUpload(this)" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;background:white">
            <input type="hidden" id="gh-image-url">
            <div id="gh-image-preview" style="margin-top:10px"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Area (sq meters)</label>
              <input type="text" id="gh-area" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Number of Plants</label>
              <input type="number" id="gh-plants" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Planted Date</label>
              <input type="date" id="gh-planted-date" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Expected Harvest</label>
              <input type="date" id="gh-harvest-date" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Notes</label>
            <textarea id="gh-notes" rows="3" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;font-family:inherit"></textarea>
          </div>
          <div style="background:var(--green-ultra-pale);padding:12px;border-radius:var(--radius-sm);margin-bottom:16px">
            <div style="font-size:0.85rem;font-weight:600;color:var(--green-deep);margin-bottom:10px">🌡️ Environment Settings</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
              <div>
                <label style="display:block;font-size:0.75rem;color:var(--text-light);margin-bottom:4px">Temperature</label>
                <input type="text" id="gh-temp" style="width:100%;padding:8px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.85rem">
              </div>
              <div>
                <label style="display:block;font-size:0.75rem;color:var(--text-light);margin-bottom:4px">Humidity</label>
                <input type="text" id="gh-humidity" style="width:100%;padding:8px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.85rem">
              </div>
              <div>
                <label style="display:block;font-size:0.75rem;color:var(--text-light);margin-bottom:4px">Light</label>
                <input type="text" id="gh-light" style="width:100%;padding:8px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.85rem">
              </div>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
            <button type="button" onclick="AdminDashboard.closeGreenhouseModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button>
            <button type="submit" class="btn-primary" style="padding:10px 24px">💾 Save Changes</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  },

  closeGreenhouseModal() {
    const modal = document.getElementById('greenhouse-modal');
    if (modal) modal.style.display = 'none';
  },

  saveGreenhouse(e) {
    e.preventDefault();
    const id = document.getElementById('gh-id').value;
    const modal = document.getElementById('greenhouse-modal');
    const isNew = !id || modal?.dataset?.mode === 'add';
    
    const plantedDateVal = document.getElementById('gh-planted-date').value;
    const harvestDateVal = document.getElementById('gh-harvest-date').value;
    
    const updates = {
      name: document.getElementById('gh-name').value.trim(),
      crop: document.getElementById('gh-crop').value.trim(),
      cropEmoji: document.getElementById('gh-crop-emoji').value.trim(),
      variety: document.getElementById('gh-variety').value.trim(),
      imageUrl: document.getElementById('gh-image-url').value || '',
      area: document.getElementById('gh-area').value.trim(),
      plants: parseInt(document.getElementById('gh-plants').value) || 0,
      plantedDate: plantedDateVal ? new Date(plantedDateVal) : null,
      expectedHarvest: harvestDateVal ? new Date(harvestDateVal) : null,
      notes: document.getElementById('gh-notes').value.trim(),
      environment: {
        temp: document.getElementById('gh-temp').value.trim(),
        humidity: document.getElementById('gh-humidity').value.trim(),
        light: document.getElementById('gh-light').value.trim()
      },
      status: 'active',
      location: 'Limuru, Kiambu, Kenya'
    };
    
    if (isNew) {
      // Create new greenhouse
      const newId = 'gh_' + Date.now();
      const newGreenhouse = {
        id: newId,
        ...updates,
        tasks: [],
        sensors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        gradePrices: { grade1: 200, grade2: 150, grade3: 100, reject: 0 }
      };
      
      AFV.greenhouses.push(newGreenhouse);
      AFV.save();
      AFV.logActivity('➕', `New greenhouse added: ${updates.name} (${updates.crop})`);
      showToast('Greenhouse added successfully!', 'success');
      
      // Sync to backend
      AFV_API.createGreenhouse(newGreenhouse).catch(err => console.log('Backend sync error:', err));
    } else {
      // Update existing greenhouse - use string ID
      const existingGh = AFV.greenhouses.find(g => g.id === id);
      if (existingGh) {
        Object.assign(existingGh, updates);
        existingGh.updatedAt = new Date();
        AFV.save();
        
        // Sync to backend
        AFV_API.updateGreenhouse(id, existingGh).catch(err => console.log('Backend sync error:', err));
      }
      AFV.logActivity('✏️', `Greenhouse updated: ${updates.name}`);
      showToast('Greenhouse updated successfully!', 'success');
    }
    
    this.closeGreenhouseModal();
    this.showPage('greenhouses');
  },

  handleGreenhouseImageUpload(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('gh-image-url').value = e.target.result;
        document.getElementById('gh-image-preview').innerHTML = `<img src="${e.target.result}" style="width:100px;height:100px;object-fit:cover;border-radius:8px"> <button type="button" onclick="AdminDashboard.clearGreenhouseImage()" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:8px">Remove</button>`;
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  clearGreenhouseImage() {
    document.getElementById('gh-image-url').value = '';
    document.getElementById('gh-image').value = '';
    document.getElementById('gh-image-preview').innerHTML = '';
  },

  // ============================================
  // TASK EDIT MODAL
  // ============================================
  openTaskModal(ghId = null, taskId = null) {
    console.log('openTaskModal called with:', ghId, taskId);
    
    // Always remove existing modal and insert fresh to ensure all elements are available
    const existingModal = document.getElementById('task-modal');
    if (existingModal) {
      existingModal.remove();
    }
    this.insertTaskModal();
    
    const title = document.getElementById('task-modal-title');
    
    if (taskId && ghId) {
      // Edit existing task - find by string ID
      const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
      const task = gh?.tasks?.find(t => t.id == taskId || t.id === taskId);
      if (!task) {
        console.log('Task not found:', ghId, taskId, 'Available:', gh?.tasks);
        return;
      }
      
      title.textContent = 'Edit Task';
      document.getElementById('task-gh-id').value = ghId;
      document.getElementById('task-id').value = taskId;
      document.getElementById('task-name').value = task.title || task.name || '';
      document.getElementById('task-desc').value = task.desc || '';
      document.getElementById('task-category').value = task.category || 'general';
      document.getElementById('task-priority').value = task.priority || 'medium';
      document.getElementById('task-duration').value = task.duration || '1 hour';
      
      // Show delete button for existing tasks
      document.getElementById('task-delete-btn').style.display = 'inline-block';
    } else {
      // Add new task
      title.textContent = 'Add New Task';
      document.getElementById('task-gh-id').value = ghId || AFV.greenhouses[0]?.id;
      document.getElementById('task-id').value = '';
      document.getElementById('task-name').value = '';
      document.getElementById('task-desc').value = '';
      document.getElementById('task-category').value = 'general';
      document.getElementById('task-priority').value = 'medium';
      document.getElementById('task-duration').value = '1 hour';
      
      // Hide delete button for new tasks
      document.getElementById('task-delete-btn').style.display = 'none';
    }
    
    // Populate greenhouse dropdown
    const ghSelect = document.getElementById('task-gh-select');
    ghSelect.innerHTML = AFV.greenhouses.map(gh => 
      `<option value="${gh.id}" ${gh.id == (ghId || AFV.greenhouses[0]?.id) ? 'selected' : ''}>${gh.cropEmoji} ${gh.name}</option>`
    ).join('');
    
    document.getElementById('task-modal').style.display = 'flex';
  },

  insertTaskModal() {
    const modal = document.createElement('div');
    modal.id = 'task-modal';
    modal.className = 'modal';
    modal.style = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center';
    modal.innerHTML = `
      <div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0" id="task-modal-title">Edit Task</h2>
          <button onclick="AdminDashboard.closeTaskModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
        </div>
        <form id="task-form" onsubmit="AdminDashboard.saveTask(event)">
          <input type="hidden" id="task-gh-id">
          <input type="hidden" id="task-id">
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Greenhouse</label>
            <select id="task-gh-select" onchange="document.getElementById('task-gh-id').value = this.value" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
              ${AFV.greenhouses.map(gh => `<option value="${gh.id}">${gh.cropEmoji} ${gh.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Task Name</label>
            <input type="text" id="task-name" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Description</label>
            <textarea id="task-desc" rows="2" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;font-family:inherit"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Category</label>
              <select id="task-category" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                ${(() => {
                  const categoryLabels = {
                    planting: '🌱 Planting & Establishment',
                    irrigation: '💧 Irrigation & Water Management',
                    nutrition: '🧪 Nutrition & Fertigation',
                    pruning: '✂️ Pruning & Training',
                    pest: '🐛 Pest & Disease Control',
                    environment: '🌡️ Environment & Infrastructure',
                    harvest: '🍅 Harvest & Post-Harvest',
                    general: '📋 General & Administrative'
                  };
                  return (AFV.taskCategories || []).map(cat => `<option value="${cat}">${categoryLabels[cat] || cat}</option>`).join('');
                })()}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Priority</label>
              <select id="task-priority" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Duration</label>
            <input type="text" id="task-duration" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., 1 hour, 30 mins">
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
            <button type="button" id="task-delete-btn" onclick="AdminDashboard.deleteCurrentTask()" style="padding:10px 20px;background:var(--red-alert);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;margin-right:auto;display:none">🗑️ Delete</button>
            <button type="button" onclick="AdminDashboard.closeTaskModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button>
            <button type="submit" class="btn-primary" style="padding:10px 24px">💾 Save Task</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  },

  closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.style.display = 'none';
  },

  openAssignTaskModal(ghId, taskId) {
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    const task = gh?.tasks.find(t => t.id === taskId || t.id == taskId);
    if (!gh || !task) return;
    
    // Get all available workers
    const allWorkers = [...(AFV.workers || []), ...Object.values(AFV.users || {}).filter(u => u.role === 'worker')];
    const uniqueWorkers = allWorkers.filter((w, i, a) => a.findIndex(x => x.id === w.uid) === i);
    
    const modal = document.createElement('div');
    modal.id = 'assign-task-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000';
    modal.innerHTML = `
      <div style="background:white;border-radius:var(--radius-lg);width:90%;max-width:400px;max-height:90vh;overflow:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--green-ultra-pale)">
          <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0">👤 Assign Task</h2>
          <button onclick="AdminDashboard.closeAssignTaskModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
        </div>
        <div style="padding:20px">
          <div style="margin-bottom:16px">
            <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:4px">Task</div>
            <div style="font-weight:600;color:var(--green-deep)">${task.title || task.name}</div>
          </div>
          <div style="margin-bottom:16px">
            <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:4px">Greenhouse</div>
            <div style="font-weight:600">${gh.cropEmoji} ${gh.name}</div>
          </div>
          <form onsubmit="event.preventDefault(); AdminDashboard.assignTaskToWorkerModal('${ghId}', '${taskId}')">
            <div style="margin-bottom:20px">
              <label style="display:block;font-size:0.75rem;color:var(--text-light);margin-bottom:4px">Select Worker</label>
              <select id="assign-worker-select" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.9rem" required>
                <option value="">-- Select a worker --</option>
                ${uniqueWorkers.map(w => `<option value="${w.uid}">${w.avatar || '👤'} ${w.name}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end">
              <button type="button" onclick="AdminDashboard.closeAssignTaskModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button>
              <button type="submit" class="btn-primary" style="padding:10px 24px">✓ Assign Task</button>
            </div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(modal);
  },

  closeAssignTaskModal() {
    const modal = document.getElementById('assign-task-modal');
    if (modal) modal.remove();
  },

  assignTaskToWorkerModal(ghId, taskId) {
    const workerId = document.getElementById('assign-worker-select').value;
    if (!workerId) {
      showToast('Please select a worker', 'error');
      return;
    }
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    const task = gh?.tasks.find(t => t.id === taskId || t.id == taskId);
    
    if (gh && task) {
      task.assignedTo = workerId;
      task.assignedAt = new Date().toISOString();
      task.assignedBy = 'admin';
      task.verified = false;
      
      // Find worker name for logging
      const worker = (AFV.workers || []).find(w => w.uid == workerId) || Object.values(AFV.users || {}).find(u => u.uid == workerId);
      const workerName = worker?.name || 'Worker';
      
      this.saveState();
      AFV.logActivity('📋', `Task "${task.title || task.name}" assigned to ${workerName} by Admin`);
      
      showToast(`Task assigned to ${workerName}!`, 'success');
      this.closeAssignTaskModal();
      this.showPage(this.currentPage);
    }
  },

  saveTask(e) {
    e.preventDefault();
    const ghId = document.getElementById('task-gh-id').value;
    const taskId = document.getElementById('task-id').value || null;
    
    const taskData = {
      title: document.getElementById('task-name').value.trim(),
      desc: document.getElementById('task-desc').value.trim(),
      category: document.getElementById('task-category').value,
      priority: document.getElementById('task-priority').value,
      duration: document.getElementById('task-duration').value.trim(),
      completed: false
    };
    
    if (taskId) {
      // Update existing task
      AFV.updateTask(ghId, taskId, taskData);
      showToast('Task updated successfully!', 'success');
    } else {
      // Add new task
      AFV.addTask(ghId, taskData);
      showToast('New task added successfully!', 'success');
    }
    
    // Save state after task modification
    this.saveState();
    
    this.closeTaskModal();
    this.showPage(this.currentPage);
  },

  assignTaskToWorker(ghId, taskId) {
    const select = document.getElementById(`admin-assign-worker-${ghId}-${taskId}`);
    const workerId = select?.value;
    if (!workerId) {
      showToast('Please select a worker', 'error');
      return;
    }
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    const task = gh?.tasks.find(t => t.id === taskId || t.id == taskId);
    
    if (gh && task) {
      task.assignedTo = workerId;
      task.assignedAt = new Date();
      task.assignedBy = 'admin';
      task.verified = false;
      // Find worker name for logging
      const worker = (AFV.workers || []).find(w => w.uid == workerId) || Object.values(AFV.users || {}).find(u => u.uid == workerId);
      const workerName = worker?.name || 'Worker';
      
      AFV.logActivity('📋', `Task "${task.title || task.name}" assigned to ${workerName} by Admin`);
      this.saveState();
      showToast('Task assigned successfully!', 'success');
      this.showPage(this.currentPage);
    }
  },

  deleteCurrentTask() {
    const ghId = document.getElementById('task-gh-id').value;
    const taskId = document.getElementById('task-id').value || null;
    
    if (!taskId) return;
    
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    if (gh) {
      const taskIndex = gh.tasks.findIndex(t => t.id == taskId || t.id === taskId);
      if (taskIndex > -1) {
        const deletedTask = gh.tasks[taskIndex];
        gh.tasks.splice(taskIndex, 1);
        AFV.logActivity('🗑️', `Task "${deletedTask.title || deletedTask.name}" deleted from ${gh.name}`);
        this.saveState();
        showToast('Task deleted successfully!', 'success');
        this.closeTaskModal();
        this.showPage(this.currentPage);
      }
    }
  },

  toggleTaskComplete(ghId, taskId) {
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    if (!gh) return;
    const task = gh.tasks.find(t => t.id === taskId || t.id == taskId);
    if (!task) return;
    
    if (task.completed) {
      // Uncomplete the task
      task.completed = false;
      task.completedAt = null;
      task.completedBy = null;
      AFV.logActivity('↩️', `Task "${task.title || task.name}" marked as incomplete in ${gh.name}`);
    } else {
      // Complete the task
      AFV.completeTask(ghId, taskId);
    }
    
    // Save state after task update
    this.saveState();
    
    this.showPage(this.currentPage);
  },

  // ============================================ FEEDING CALENDAR

  startFeedingCalendar() {
    const startDate = new Date().toISOString().split('T')[0];
    AFV.setFeedingCalendarStart(startDate);
    showToast(`34-Week Cycle Started from ${new Date(startDate).toLocaleDateString()}`, 'success');
    this.showPage('feeding');
  },

  resetFeedingCalendar() {
    if (!confirm('Are you sure you want to reset the 34-week cycle? This will clear the calendar start date and all notes.')) {
      return;
    }
    AFV.feedingProgram.calendarStartDate = null;
    AFV.feedingProgram.calendarNotes = {};
    showToast('Cycle has been reset. You can start a new cycle.', 'success');
    this.showPage('feeding');
  },

  showFeedingCalendar() {
    const skipWeeks = AFV.feedingProgram.skipWeeks;
    const currentWeek = AFV.getCalendarCurrentWeek();
    const currentCycle = AFV.getCurrentCalendarCycle();
    const allNotes = AFV.getAllCalendarNotes();
    
    // Generate weeks for 2 cycles
    const weeks = [];
    const startDate = AFV.feedingProgram.calendarStartDate ? new Date(AFV.feedingProgram.calendarStartDate) : new Date();
    
    for (let cycle = 1; cycle <= 2; cycle++) {
      for (let week = 1; week <= 34; week++) {
        const weekStart = new Date(startDate.getTime() + ((cycle - 1) * 34 + week - 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        weeks.push({
          cycle: cycle,
          weekNum: week,
          start: weekStart,
          end: weekEnd,
          startStr: weekStart.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
          endStr: weekEnd.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
          note: allNotes[`${cycle}-${week}`]
        });
      }
    }
    
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <div class="page-header" style="background:linear-gradient(135deg,#1a3a1a,#2d5a2d);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🗓️ Feeding Calendar</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">34-week cycle calendar with notes · Currently Week ${currentWeek} (Cycle ${currentCycle})</div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="AdminDashboard.showPage('feeding')">← Back</button>
        </div>
      </div>
      <div class="page-body">
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(46,204,113,0.1),rgba(46,204,113,0.05));border:2px solid var(--green-deep)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
            <div>
              <div class="section-title" style="color:var(--green-deep)">📅 Current: Week ${currentWeek}, Cycle ${currentCycle}</div>
              <div style="font-size:0.85rem;color:var(--text-mid)">${currentWeek === 34 ? 'Final week - cycle will restart soon!' : `${34 - currentWeek} weeks remaining in current cycle`}</div>
            </div>
            <div style="display:flex;gap:10px">
              <div style="text-align:center;padding:8px 16px;background:var(--green-deep);color:white;border-radius:var(--radius-sm)">
                <div style="font-size:1.5rem;font-weight:800">${currentWeek}</div>
                <div style="font-size:0.6rem">WEEK</div>
              </div>
              <div style="text-align:center;padding:8px 16px;background:rgba(46,204,113,0.2);color:var(--green-deep);border-radius:var(--radius-sm)">
                <div style="font-size:1.5rem;font-weight:800">${currentCycle}</div>
                <div style="font-size:0.6rem">CYCLE</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom:20px">
          <div class="section-title" style="color:var(--green-deep)">📝 Calendar Notes - Click on a week to add/edit notes</div>
        </div>
        
        ${[1, 2].map(cycle => `
          <div style="margin-bottom:30px">
            <div class="section-title" style="color:var(--green-deep);border-bottom:2px solid var(--green-deep);padding-bottom:8px;margin-bottom:16px">Cycle ${cycle}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
              ${weeks.filter(w => w.cycle === cycle).map(w => {
                const isCurrent = w.weekNum === currentWeek && w.cycle === currentCycle;
                const isSkipped = skipWeeks.includes(w.weekNum);
                return `
                  <div class="card" style="border:${isCurrent ? '2px solid var(--green-deep)' : '1px solid var(--green-pale)'};${isCurrent ? 'background:linear-gradient(135deg,rgba(46,204,113,0.1),white)' : ''}" onclick="AdminDashboard.openWeekNote(${w.weekNum}, ${w.cycle})">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <div style="font-weight:700;color:var(--green-deep)">Week ${w.weekNum}</div>
                      <div style="font-size:0.7rem;color:var(--text-light)">${w.startStr} - ${w.endStr}</div>
                    </div>
                    ${isSkipped ? '<div style="font-size:0.7rem;color:var(--red-alert);margin-bottom:6px">⏭️ Skip Week</div>' : ''}
                    ${w.note ? `
                      <div style="font-size:0.75rem;color:var(--text-mid);background:var(--green-ultra-pale);padding:8px;border-radius:4px;margin-top:6px">
                        <strong>📝 Note:</strong> ${w.note.note.substring(0, 60)}${w.note.note.length > 60 ? '...' : ''}
                      </div>
                    ` : `
                      <div style="font-size:0.7rem;color:var(--text-light);font-style:italic">+ Click to add note</div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  openWeekNote(weekNum, cycle) {
    const note = AFV.getCalendarNote(weekNum, cycle);
    const weekDates = AFV.getCalendarWeekDates(weekNum);
    
    const modal = document.createElement('div');
    modal.id = 'week-note-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000';
    
    modal.innerHTML = `
      <div style="background:white;border-radius:12px;padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <div style="font-size:1.2rem;font-weight:700;color:var(--green-deep)">Week ${weekNum} - Cycle ${cycle}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">${weekDates ? weekDates.startStr + ' - ' + weekDates.endStr : ''}</div>
          </div>
          <button onclick="this.closest('#week-note-modal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer">&times;</button>
        </div>
        
        <div style="margin-bottom:16px">
          <label style="display:block;font-weight:600;margin-bottom:8px;color:var(--text-dark)">📝 Notes for this week:</label>
          <textarea id="week-note-text" rows="6" style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:8px;font-size:0.9rem;resize:vertical" placeholder="Enter tasks, reminders, or notes for this week..."></textarea>
        </div>
        
        ${note ? `
          <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:16px">
            Last updated: ${new Date(note.updatedAt).toLocaleString()} by ${note.updatedBy}
          </div>
        ` : ''}
        
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button onclick="this.closest('#week-note-modal').remove()" style="padding:10px 20px;background:#f0f0f0;border:none;border-radius:8px;cursor:pointer">Cancel</button>
          <button onclick="AdminDashboard.saveWeekNote(${weekNum}, ${cycle})" style="padding:10px 20px;background:var(--green-deep);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">💾 Save Note</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (note) {
      document.getElementById('week-note-text').value = note.note;
    }
    
    modal.onclick = function(e) {
      if (e.target === modal) modal.remove();
    };
  },

  saveWeekNote(weekNum, cycle) {
    const noteText = document.getElementById('week-note-text').value.trim();
    if (!noteText) {
      showToast('Please enter a note', 'error');
      return;
    }
    
    AFV.saveCalendarNote(weekNum, cycle, noteText);
    showToast(`Note saved for Week ${weekNum}`, 'success');
    document.getElementById('week-note-modal').remove();
    this.showFeedingCalendar();
  }
};



// Workers - Database backed (Admin & Supervisor)
AdminDashboard.workersData = [];

AdminDashboard.loadWorkers = async function() {
  try {
    this.workersData = await AFV_API.getWorkers();
  } catch (e) {
    console.error('Failed to load workers:', e);
    this.workersData = [];
  }
};

AdminDashboard.renderSupervisorWorkers = async function() {
  await this.loadWorkers();
  const workers = Array.isArray(this.workersData) ? this.workersData : [];
  const isAdmin = AFV.currentUser?.role === 'admin';
  
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Workers 👷</div>
        <div class="page-subtitle">Track all workers, salary & transactions</div>
      </div>
      <div class="header-actions">
        <button onclick="AdminDashboard.openWorkerModal()" style="padding:8px 16px;background:var(--blue-water);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ Add Worker</button>
      </div>
    </div>
    <div class="page-body">
      <style>
        .workers-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .workers-table th { background: var(--blue-deep); color: white; padding: 12px 8px; text-align: left; font-size: 0.8rem; }
        .workers-table td { padding: 12px 8px; border-bottom: 1px solid var(--blue-pale); font-size: 0.85rem; }
        .workers-table tr:hover { background: rgba(59,130,246,0.05); }
        .workers-card { display: none; }
        @media (max-width: 768px) {
          .workers-table { display: none; }
          .workers-card { display: block; margin-bottom: 12px; background: white; border: 1px solid var(--blue-pale); border-radius: 8px; padding: 14px; }
          .workers-card-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .workers-card-label { font-weight: 600; color: var(--blue-deep); font-size: 0.75rem; }
          .workers-card-value { color: var(--text-dark); font-size: 0.85rem; }
          .workers-card-actions { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end; }
        }
      </style>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👥</div><div><div class="stat-value">${workers.length}</div><div class="stat-label">Total Workers</div></div></div>
        <div class="stat-card"><div class="stat-icon">💰</div><div><div class="stat-value">KES ${workers.reduce((s,w) => s + (parseFloat(w.salary_paid) || 0), 0).toLocaleString()}</div><div class="stat-label">Total Paid</div></div></div>
      </div>
      ${workers.length === 0 ? '<p style="padding:20px;text-align:center;color:var(--text-light)">No workers added yet</p>' : ''}
      <!-- Desktop Table -->
      <table class="workers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Salary (KES)</th>
            <th>Paid (KES)</th>
            <th>Transaction Code</th>
            ${isAdmin ? '<th>Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${workers.map(w => `
            <tr>
              <td><strong>${w.name || '-'}</strong></td>
              <td>${w.phone || '-'} ${w.email ? '<br><small style="color:var(--text-light)">' + w.email + '</small>' : ''}</td>
              <td>${parseFloat(w.salary || 0).toLocaleString()}</td>
              <td><strong>${parseFloat(w.salary_paid || 0).toLocaleString()}</strong></td>
              <td><code style="font-size:0.75rem;background:var(--gray-100);padding:2px 6px;border-radius:4px">${w.transaction_code || '-'}</code></td>
              ${isAdmin ? `
                <td>
                  <button onclick="AdminDashboard.openWorkerModal(${w.uid})" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem;margin-right:4px">✏️</button>
                  <button onclick="AdminDashboard.deleteWorker(${w.uid})" style="padding:4px 8px;background:var(--red-alert);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">🗑️</button>
                </td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <!-- Mobile Cards -->
      ${workers.map(w => `
        <div class="workers-card">
          <div class="workers-card-row"><span class="workers-card-label">Name</span><span class="workers-card-value">${w.name || '-'}</span></div>
          <div class="workers-card-row"><span class="workers-card-label">Phone</span><span class="workers-card-value">${w.phone || '-'}</span></div>
          <div class="workers-card-row"><span class="workers-card-label">Email</span><span class="workers-card-value">${w.email || '-'}</span></div>
          <div class="workers-card-row"><span class="workers-card-label">Salary</span><span class="workers-card-value">KES ${parseFloat(w.salary || 0).toLocaleString()}</span></div>
          <div class="workers-card-row"><span class="workers-card-label">Paid</span><span class="workers-card-value">KES ${parseFloat(w.salary_paid || 0).toLocaleString()}</span></div>
          <div class="workers-card-row"><span class="workers-card-label">Transaction</span><span class="workers-card-value">${w.transaction_code || '-'}</span></div>
          ${isAdmin ? `
            <div class="workers-card-actions">
              <button onclick="AdminDashboard.openWorkerModal(${w.uid})" style="padding:8px 12px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem">✏️ Edit</button>
              <button onclick="AdminDashboard.deleteWorker(${w.uid})" style="padding:8px 12px;background:var(--red-alert);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem">🗑️</button>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ${this.getWorkerModalHtml()}
  `;
};

// Worker Modal HTML
AdminDashboard.getWorkerModalHtml = function() {
  return `
    <div id="worker-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">
      <div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:500px;width:90%;max-height:90vh;overflow-y:auto">
        <h2 style="font-family:'Playfair Display',serif;color:var(--blue-deep);margin:0 0 20px" id="worker-modal-title">Add Worker</h2>
        <form onsubmit="AdminDashboard.saveWorker(event)">
          <input type="hidden" id="worker-id">
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Name *</label>
            <input type="text" id="worker-name" required style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Full name">
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Phone</label>
            <input type="tel" id="worker-phone" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., 0712345678">
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Email</label>
            <input type="email" id="worker-email" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="email@example.com">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Salary (KES)</label>
              <input type="number" id="worker-salary" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="0" min="0">
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Salary Paid (KES)</label>
              <input type="number" id="worker-salary-paid" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="0" min="0">
            </div>
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Transaction Code</label>
            <input type="text" id="worker-transaction-code" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., TXN123456">
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Role</label>
            <select id="worker-role" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem">
              <option value="worker">Worker</option>
              <option value="supervisor">Supervisor</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <div style="margin-bottom:16px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Notes</label>
            <textarea id="worker-notes" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem;min-height:60px" placeholder="Additional notes..."></textarea>
          </div>
          <div style="display:flex;gap:10px">
            <button type="button" onclick="AdminDashboard.closeWorkerModal()" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
            <button type="submit" style="flex:1;padding:12px;background:var(--blue-water);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

AdminDashboard.openWorkerModal = async function(workerId = null) {
  if (!document.getElementById('worker-modal')) {
    const div = document.createElement('div');
    div.innerHTML = this.getWorkerModalHtml();
    document.body.appendChild(div.firstElementChild);
  }
  
  const title = document.getElementById('worker-modal-title');
  const idInput = document.getElementById('worker-id');
  const nameInput = document.getElementById('worker-name');
  const phoneInput = document.getElementById('worker-phone');
  const emailInput = document.getElementById('worker-email');
  const salaryInput = document.getElementById('worker-salary');
  const salaryPaidInput = document.getElementById('worker-salary-paid');
  const txnCodeInput = document.getElementById('worker-transaction-code');
  const roleInput = document.getElementById('worker-role');
  const notesInput = document.getElementById('worker-notes');
  
  // Reload workers to ensure we have latest data
  await this.loadWorkers();
  
  if (workerId) {
    const worker = this.workersData.find(w => w.uid === workerId);
    if (worker) {
      title.textContent = 'Edit Worker';
      idInput.value = worker.uid;
      nameInput.value = worker.name || '';
      phoneInput.value = worker.phone || '';
      emailInput.value = worker.email || '';
      salaryInput.value = worker.salary || 0;
      salaryPaidInput.value = worker.salary_paid || 0;
      txnCodeInput.value = worker.transaction_code || '';
      roleInput.value = worker.role || 'worker';
      notesInput.value = worker.notes || '';
    }
  } else {
    title.textContent = 'Add Worker';
    idInput.value = '';
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    salaryInput.value = 0;
    salaryPaidInput.value = 0;
    txnCodeInput.value = '';
    roleInput.value = 'worker';
    notesInput.value = '';
  }
  
  document.getElementById('worker-modal').style.display = 'flex';
};

AdminDashboard.closeWorkerModal = function() {
  const modal = document.getElementById('worker-modal');
  if (modal) modal.style.display = 'none';
};

AdminDashboard.saveWorker = async function(e) {
  e.preventDefault();
  const id = document.getElementById('worker-id').value;
  const data = {
    name: document.getElementById('worker-name').value.trim(),
    phone: document.getElementById('worker-phone').value.trim(),
    email: document.getElementById('worker-email').value.trim(),
    salary: parseFloat(document.getElementById('worker-salary').value) || 0,
    salary_paid: parseFloat(document.getElementById('worker-salary-paid').value) || 0,
    transaction_code: document.getElementById('worker-transaction-code').value.trim(),
    role: document.getElementById('worker-role').value,
    notes: document.getElementById('worker-notes').value.trim()
  };
  
  try {
    if (id) {
      await AFV_API.updateWorker(parseInt(id), data);
      showToast('Worker updated!', 'success');
    } else {
      await AFV_API.createWorker(data);
      showToast('Worker added!', 'success');
    }
  } catch (err) {
    console.error('Save worker error:', err);
    showToast('Failed to save worker', 'error');
  }
  
  this.closeWorkerModal();
  this.showPage('workers');
};

AdminDashboard.deleteWorker = async function(workerId) {
  if (!confirm('Are you sure you want to delete this worker?')) return;
  
  try {
    await AFV_API.deleteWorker(workerId);
    showToast('Worker deleted!', 'success');
  } catch (err) {
    console.error('Delete worker error:', err);
    showToast('Failed to delete worker', 'error');
  }
  
  this.showPage('workers');
};

// Inventory Management
AdminDashboard.openInventoryModal = function(itemId = null) {
  const modal = document.getElementById('inventory-modal');
  const title = document.getElementById('inventory-modal-title');
  const form = document.getElementById('inventory-form');
  
  form.reset();
  
  if (itemId) {
    const item = AFV.inventory.find(i => i.id === itemId);
    if (item) {
      title.textContent = 'Edit Inventory Item';
      document.getElementById('inventory-id').value = item.id;
      document.getElementById('inventory-name').value = item.name;
      document.getElementById('inventory-category').value = item.category;
      document.getElementById('inventory-qty').value = item.qty;
      document.getElementById('inventory-unit').value = item.unit;
      document.getElementById('inventory-reorder').value = item.reorder;
    }
  } else {
    title.textContent = 'Add Inventory Item';
    document.getElementById('inventory-id').value = '';
  }
  
  modal.style.display = 'flex';
};

AdminDashboard.closeInventoryModal = function() {
  document.getElementById('inventory-modal').style.display = 'none';
};

AdminDashboard.saveInventory = function(e) {
  e.preventDefault();
  const id = document.getElementById('inventory-id').value;
  const name = document.getElementById('inventory-name').value.trim();
  const category = document.getElementById('inventory-category').value;
  const qty = parseInt(document.getElementById('inventory-qty').value);
  const unit = document.getElementById('inventory-unit').value.trim();
  const reorder = parseInt(document.getElementById('inventory-reorder').value);
  
  // Determine status based on quantity vs reorder level
  let status = 'good';
  if (qty <= 0) status = 'critical';
  else if (qty <= reorder) status = 'low';
  
  if (id) {
    // Edit existing item
    const index = AFV.inventory.findIndex(i => i.id === parseInt(id));
    if (index !== -1) {
      AFV.inventory[index] = { id: parseInt(id), name, category, qty, unit, reorder, status };
      AFV.logActivity('✏️', `Inventory updated: ${name}`);
      showToast(`"${name}" updated successfully!`, 'success');
    }
  } else {
    // Add new item
    const newId = Math.max(...AFV.inventory.map(i => i.id), 0) + 1;
    AFV.inventory.push({ id: newId, name, category, qty, unit, reorder, status });
    AFV.logActivity('➕', `Inventory added: ${name}`);
    showToast(`"${name}" added successfully!`, 'success');
  }
  
  // Save state after inventory update
  this.saveState();
  
  this.closeInventoryModal();
  this.showPage('inventory');
};

AdminDashboard.deleteInventory = function(itemId) {
  const item = AFV.inventory.find(i => i.id === itemId);
  if (!item) return;
  
  if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
    return;
  }
  
  AFV.inventory = AFV.inventory.filter(i => i.id !== itemId);
  AFV.logActivity('🗑️', `Inventory deleted: ${item.name}`);
  this.saveState();
  showToast(`"${item.name}" has been deleted`, 'success');
  this.showPage('inventory');
};

AdminDashboard.reorderItem = function(itemId) {
  const item = AFV.inventory.find(i => i.id === itemId);
  if (!item) return;
  
  // Show reorder modal or create a reorder alert
  const reorderQty = item.reorder || Math.ceil(item.qty * 1.5);
  
  if (!confirm(`Create reorder request for ${item.name}?\n\nCurrent stock: ${item.qty} ${item.unit}\nRecommended reorder: ${reorderQty} ${item.unit}`)) {
    return;
  }
  
  // Log the reorder request
  AFV.logActivity('📦', `Reorder requested for ${item.name} (${reorderQty} ${item.unit})`);
  showToast(`Reorder request created for ${item.name}`, 'success');
  
  // Optionally mark the item as "on order"
  item.onOrder = true;
  item.orderQty = reorderQty;
  item.orderDate = new Date();
  this.saveState();
  
  this.showPage('inventory');
};

AdminDashboard.renderRevenue = function() {
  const records = AFV.revenue || [];
  const total = records.reduce((s,r) => s + (r.amount||0), 0);
  return `<div class="page-header"><div><div class="page-title">Revenue 💰</div><div class="page-subtitle">Track income from sales</div></div><div class="header-actions"><button class="btn-primary" onclick="AdminDashboard.openRevenueModal()">+ Add Sale</button></div></div><div class="page-body"><div class="stats-grid"><div class="stat-card"><div class="stat-value">KES ${total.toLocaleString()}</div><div class="stat-label">Total Revenue</div></div></div><div class="card"><div class="scroll-x"><table><thead><tr><th>Date</th><th>Source</th><th>Product</th><th>Amount</th><th>Recorded By</th><th></th></tr></thead><tbody>${records.length===0 ? '<tr><td colspan="6" style="text-align:center;color:var(--text-light)">No sales recorded</td></tr>' : records.sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => `<tr><td>${new Date(r.date).toLocaleDateString()}</td><td>${r.source||'-'}</td><td>${r.product||'-'}</td><td style="font-weight:600;color:var(--green-fresh)">KES ${r.amount.toLocaleString()}</td><td>${r.recordedBy||'Admin'}</td><td><button onclick="AdminDashboard.deleteRevenue(${r.id})" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">🗑️</button></td></tr>`).join('')}</tbody></table></div></div></div><div id="revenue-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000"><div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:400px;width:90%;margin:auto"><h2 style="color:var(--green-deep);margin:0 0 16px">Record Sale</h2><form onsubmit="AdminDashboard.saveRevenue(event)"><select id="revenue-source" required style="width:100%;padding:10px;margin-bottom:12px"><option value="Greenhouse">Greenhouse</option><option value="Milk">Milk</option><option value="Eggs">Eggs</option><option value="Vegetables">Vegetables</option><option value="Other">Other</option></select><input type="text" id="revenue-product" required placeholder="Product" style="width:100%;padding:10px;margin-bottom:12px"><input type="number" id="revenue-amount" required placeholder="Amount (KES)" style="width:100%;padding:10px;margin-bottom:12px"><input type="date" id="revenue-date" required style="width:100%;padding:10px;margin-bottom:16px"><div style="display:flex;gap:10px"><button type="button" onclick="AdminDashboard.closeRevenueModal()" class="btn-secondary" style="flex:1">Cancel</button><button type="submit" class="btn-primary" style="flex:1">Save</button></div></form></div></div>`;
};

AdminDashboard.openRevenueModal = function() {
  const modal = document.getElementById('revenue-modal');
  modal.style.display = 'flex';
  document.getElementById('revenue-date').value = new Date().toISOString().split('T')[0];
  
  // Dynamically populate source dropdown with greenhouse crops
  const sourceSelect = document.getElementById('revenue-source');
  const greenhouses = AFV.greenhouses || [];
  let options = '<option value="Greenhouse">Greenhouse</option>';
  greenhouses.forEach(gh => {
    options += `<option value="${gh.name} - ${gh.crop}">${gh.name} (${gh.crop})</option>`;
  });
  options += '<option value="Milk">Milk</option><option value="Eggs">Eggs</option><option value="Vegetables">Vegetables</option><option value="Other">Other</option>';
  sourceSelect.innerHTML = options;
};

AdminDashboard.closeRevenueModal = function() {
  document.getElementById('revenue-modal').style.display = 'none';
};

AdminDashboard.saveRevenue = function(e) {
  e.preventDefault();
  if(!AFV.revenue) AFV.revenue = [];
  AFV.revenue.push({ id: Date.now(), source: document.getElementById('revenue-source').value, product: document.getElementById('revenue-product').value, amount: parseFloat(document.getElementById('revenue-amount').value), date: new Date(document.getElementById('revenue-date').value) });
  this.saveState();
  this.closeRevenueModal();
  this.showPage('revenue');
};

AdminDashboard.deleteRevenue = function(id) {
  if(!confirm('Delete this record?')) return;
  AFV.revenue = (AFV.revenue||[]).filter(r => r.id !== id);
  this.saveState();
  this.showPage('revenue');
};

// RECEIPTS TRACKING (from Supervisors)
AdminDashboard.renderReceipts = function() {
  const receipts = AFV.receipts || [];
  const total = receipts.reduce((s,r) => s + (parseFloat(r.amount)||0), 0);
  return `<div class="page-header"><div><div class="page-title">🧾 Supervisor Receipts</div><div class="page-subtitle">View and edit sales recorded by supervisors</div></div><div class="header-actions"><button onclick="AdminDashboard.newReceipt()" class="btn-primary" style="padding:10px 20px">➕ Add Receipt</button></div></div><div class="page-body"><div class="stats-grid"><div class="stat-card"><div class="stat-value">KES ${total.toLocaleString()}</div><div class="stat-label">Total from Receipts</div></div><div class="stat-card"><div class="stat-value">${receipts.length}</div><div class="stat-label">Total Receipts</div></div></div><div class="card"><div style="font-weight:700;font-size:1.1rem;margin-bottom:16px">All Receipts</div>${receipts.length === 0 ? '<div style="text-align:center;color:var(--text-light);padding:40px">No receipts recorded by supervisors yet</div>' : '<div class="scroll-x"><table><thead><tr><th>Date</th><th>Product</th><th>Customer</th><th>Amount</th><th>Transaction Code</th><th>Image</th><th>Recorded By</th><th>Actions</th></tr></thead><tbody>' + receipts.sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => `<tr><td>${r.date}</td><td>${escapeHtml(r.product)}</td><td>${escapeHtml(r.customer)||'-'}</td><td style="font-weight:600;color:var(--green-fresh)">KES ${parseFloat(r.amount).toLocaleString()}</td><td>${r.transactionCode||'-'}</td><td>${r.imageUrl ? '<button onclick="AdminDashboard.viewReceiptImage(' + r.id + ')" style="background:var(--blue-water);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">📷 View</button>' : '<button onclick="AdminDashboard.uploadReceiptImage(' + r.id + ')" style="background:var(--green-fresh);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">+ Upload</button>'}</td><td>${r.recordedBy === 'supervisor' ? 'Supervisor' : 'Admin'}</td><td><button onclick="AdminDashboard.editReceipt(${r.id})" style="background:var(--blue-water);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">✏️ Edit</button> <button onclick="AdminDashboard.deleteReceipt(${r.id})" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">🗑️</button></td></tr>`).join('') + '</tbody></table></div>'}</div></div><div id="receipt-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center"><div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0" id="receipt-modal-title">Edit Receipt</h2><button onclick="AdminDashboard.closeReceiptModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button></div><form id="receipt-form" onsubmit="AdminDashboard.saveReceipt(event)"><input type="hidden" id="receipt-id"><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Product/Item Sold</label><input type="text" id="receipt-product" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Amount (KES)</label><input type="number" id="receipt-amount" required min="0" step="0.01" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Date</label><input type="date" id="receipt-date" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Customer</label><input type="text" id="receipt-customer" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Transaction Code</label><input type="text" id="receipt-transaction-code" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Receipt Image</label><input type="file" id="receipt-image-input" accept="image/*" onchange="AdminDashboard.handleReceiptImageUpload(this)" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;background:white"><input type="hidden" id="receipt-image-url"><div id="receipt-image-preview" style="margin-top:10px"></div></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px"><button type="button" onclick="AdminDashboard.closeReceiptModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button><button type="submit" class="btn-primary" style="padding:10px 24px">💾 Save Changes</button></div></form></div></div><div id="receipt-view-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center" onclick="if(event.target === this) this.style.display='none'"><div style="max-width:90%;max-height:90vh"><img id="receipt-view-image" style="max-width:100%;max-height:90vh;border-radius:8px"></div></div>`;
};

AdminDashboard.editReceipt = function(id) {
  const receipt = AFV.receipts.find(r => r.id === id);
  if (!receipt) return;
  
  const modal = document.getElementById('receipt-modal');
  document.getElementById('receipt-modal-title').textContent = 'Edit Receipt';
  document.getElementById('receipt-id').value = receipt.id;
  document.getElementById('receipt-product').value = receipt.product;
  document.getElementById('receipt-amount').value = receipt.amount;
  document.getElementById('receipt-date').value = receipt.date;
  document.getElementById('receipt-customer').value = receipt.customer || '';
  document.getElementById('receipt-transaction-code').value = receipt.transactionCode || '';
  document.getElementById('receipt-image-url').value = receipt.imageUrl || '';
  
  if (receipt.imageUrl) {
    document.getElementById('receipt-image-preview').innerHTML = `<img src="${receipt.imageUrl}" style="max-width:200px;border-radius:8px"> <button type="button" onclick="AdminDashboard.clearReceiptImage()" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:8px">Remove</button>`;
  } else {
    document.getElementById('receipt-image-preview').innerHTML = '';
  }
  
  modal.style.display = 'flex';
};

AdminDashboard.newReceipt = function() {
  const modal = document.getElementById('receipt-modal');
  document.getElementById('receipt-modal-title').textContent = 'Add New Receipt';
  document.getElementById('receipt-id').value = '';
  document.getElementById('receipt-product').value = '';
  document.getElementById('receipt-amount').value = '';
  document.getElementById('receipt-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('receipt-customer').value = '';
  document.getElementById('receipt-transaction-code').value = '';
  document.getElementById('receipt-image-url').value = '';
  document.getElementById('receipt-image-input').value = '';
  document.getElementById('receipt-image-preview').innerHTML = '';
  
  modal.style.display = 'flex';
};

AdminDashboard.closeReceiptModal = function() {
  document.getElementById('receipt-modal').style.display = 'none';
};

AdminDashboard.handleReceiptImageUpload = function(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('receipt-image-url').value = e.target.result;
      document.getElementById('receipt-image-preview').innerHTML = `<img src="${e.target.result}" style="max-width:200px;border-radius:8px"> <button type="button" onclick="AdminDashboard.clearReceiptImage()" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:8px">Remove</button>`;
    };
    reader.readAsDataURL(input.files[0]);
  }
};

AdminDashboard.clearReceiptImage = function() {
  document.getElementById('receipt-image-url').value = '';
  document.getElementById('receipt-image-input').value = '';
  document.getElementById('receipt-image-preview').innerHTML = '';
};

AdminDashboard.saveReceipt = function(e) {
  e.preventDefault();
  const id = document.getElementById('receipt-id').value;
  const product = document.getElementById('receipt-product').value.trim();
  const amount = parseFloat(document.getElementById('receipt-amount').value);
  const date = document.getElementById('receipt-date').value;
  const customer = document.getElementById('receipt-customer').value.trim();
  const transactionCode = document.getElementById('receipt-transaction-code').value.trim();
  const imageUrl = document.getElementById('receipt-image-url').value;
  
  if (!id) {
    // Creating new receipt
    if (!AFV.receipts) AFV.receipts = [];
    const newReceipt = {
      id: Date.now(),
      product,
      amount,
      date,
      customer,
      transactionCode,
      imageUrl,
      recordedBy: 'admin'
    };
    AFV.receipts.push(newReceipt);
    this.saveState();
    AFV.logActivity('🧾', `Receipt added: ${product} - KES ${amount.toLocaleString()}`);
    showToast('Receipt added successfully!', 'success');
  } else {
    // Editing existing receipt
    const receipt = AFV.receipts.find(r => r.id == id);
    if (!receipt) return;
    
    receipt.product = product;
    receipt.amount = amount;
    receipt.date = date;
    receipt.customer = customer;
    receipt.transactionCode = transactionCode;
    receipt.imageUrl = imageUrl;
    
    this.saveState();
    AFV.logActivity('✏️', `Receipt updated: ${receipt.product} - KES ${receipt.amount.toLocaleString()}`);
    showToast('Receipt updated successfully!', 'success');
  }
  
  this.closeReceiptModal();
  this.showPage('receipts');
};

AdminDashboard.deleteReceipt = function(id) {
  if (!confirm('Are you sure you want to delete this receipt?')) return;
  AFV.receipts = AFV.receipts.filter(r => r.id !== id);
  this.saveState();
  AFV.logActivity('🗑️', 'Receipt deleted');
  showToast('Receipt deleted', 'success');
  this.showPage('receipts');
};

AdminDashboard.uploadReceiptImage = function(id) {
  this.editReceipt(id);
};

AdminDashboard.viewReceiptImage = function(id) {
  const receipt = AFV.receipts.find(r => r.id === id);
  if (!receipt || !receipt.imageUrl) return;
  document.getElementById('receipt-view-image').src = receipt.imageUrl;
  document.getElementById('receipt-view-modal').style.display = 'flex';
};

// HARVEST TRACKING
AdminDashboard.renderHarvest = function() {
  const greenhouses = AFV.greenhouses || [];
  const harvest = AFV.harvest || {};
  
  // Ensure modal exists
  if (!document.getElementById('harvest-modal')) {
    this.createHarvestModal();
  }
  
  let html = `<div class="page-header">
    <div>
      <div class="page-title">Harvest 🌾</div>
      <div class="page-subtitle">Track yields per greenhouse</div>
    </div>
    <div class="header-actions">
      <button class="btn-primary" onclick="AdminDashboard.openStandaloneHarvestModal()">+ Add Harvest</button>
    </div>
  </div><div class="page-body">`;
  
  greenhouses.forEach(gh => {
    const records = harvest[gh.id] || [];
    const grade1Harvest = records.filter(r => r.quality === 'grade1').reduce((s,r) => s + r.quantity, 0);
    const grade2Harvest = records.filter(r => r.quality === 'grade2').reduce((s,r) => s + r.quantity, 0);
    const grade3Harvest = records.filter(r => r.quality === 'grade3').reduce((s,r) => s + r.quantity, 0);
    const rejectHarvest = records.filter(r => r.quality === 'reject').reduce((s,r) => s + r.quantity, 0);
    const goodHarvest = grade1Harvest + grade2Harvest;
    const badHarvest = grade3Harvest + rejectHarvest;
    const totalValue = records.reduce((s,r) => s + (r.totalValue||0), 0);
    const total = grade1Harvest + grade2Harvest + grade3Harvest + rejectHarvest;
    
    html += `<div class=\"card\" style=\"margin-bottom:20px\"><h3 style=\"color:var(--green-deep);margin:0 0 12px\">${gh.cropEmoji} ${gh.name} - ${gh.crop}</h3>`;
    html += `<div class=\"stats-grid\" style=\"grid-template-columns:repeat(3,1fr);margin-bottom:12px\"><div class=\"stat-card\"><div class=\"stat-value\">${total.toFixed(2)} ${records[0]?.unit||'kg'}</div><div class=\"stat-label\">Total</div></div><div class=\"stat-card\"><div class=\"stat-value\" style=\"color:var(--green-fresh)\">${goodHarvest.toFixed(2)} ${records[0]?.unit||'kg'}</div><div class=\"stat-label\">Grade 1-2</div></div><div class=\"stat-card\"><div class=\"stat-value\" style=\"color:var(--red-alert)\">${badHarvest.toFixed(2)} ${records[0]?.unit||'kg'}</div><div class=\"stat-label\">Grade 3+Reject</div></div></div>`;
    html += `<button class=\"btn-primary\" onclick=\"AdminDashboard.openHarvestModal('${gh.id}')\">+ Record Harvest</button>`;
    html += `<div class=\"scroll-x\" style=\"margin-top:12px\"><table><thead><tr><th>Date</th><th>Qty</th><th>Quality</th><th>Notes</th><th></th></tr></thead><tbody>`;
    if(records.length === 0) {
      html += `<tr><td colspan=\"5\" style=\"text-align:center;color:var(--text-light)\">No harvests recorded</td></tr>`;
    } else {
      records.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
        html += `<tr><td>${new Date(r.date).toLocaleDateString()}</td><td>${r.quantity} ${r.unit}</td><td><span style=\"color:${r.quality==='grade1'||r.quality==='good'?'var(--green-fresh)':r.quality==='grade2'?'var(--blue-water)':r.quality==='grade3'||r.quality==='bad'?'var(--orange-warn)':'var(--red-alert)'}\">${r.quality==='grade1'?'⭐ Grade 1':r.quality==='good'?'✅ Good':r.quality==='grade2'?'⭐⭐ Grade 2':r.quality==='grade3'?'⭐⭐⭐ Grade 3':r.quality==='good'?'✅ Good':r.quality==='bad'?'❌ Bad':'❌ Reject'}</span></td><td>${r.notes||'-'}</td><td><button onclick=\"AdminDashboard.deleteHarvest('${gh.id}',${r.id})\" style=\"background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer\">🗑️</button></td></tr>`;
      });
    }
    html += `</tbody></table></div></div>`;
  });
  
  return html;
};

AdminDashboard.openHarvestModal = function(ghId) {
  const gh = AFV.greenhouses.find(g => g.id === ghId);
  const gradePrices = gh?.gradePrices || { grade1: 150, grade2: 120, grade3: 80, reject: 0 };
  
  // Ensure modal exists
  if (!document.getElementById('harvest-modal')) {
    this.createHarvestModal();
  }
  
  const modal = document.getElementById('harvest-modal');
  const ghSelect = document.getElementById('harvest-gh-select');
  
  // Populate greenhouse dropdown and select the specific one
  const greenhouses = AFV.greenhouses || [];
  ghSelect.innerHTML = greenhouses.map(g => `<option value="${g.id}">${g.cropEmoji} ${g.name} - ${g.crop || 'Not planted'}</option>`).join('');
  ghSelect.value = ghId;
  
  // Also set hidden field for compatibility
  document.getElementById('harvest-gh-id').value = ghId;
  
  // Store grade prices for this greenhouse
  modal.dataset.gradePrices = JSON.stringify(gradePrices);
  
  modal.style.display = 'flex';
  document.getElementById('harvest-gh-id').value = ghId;
  
  // Update quality dropdown with grades
  const qualitySelect = document.getElementById('harvest-quality');
  qualitySelect.innerHTML = `<option value="grade1">⭐ Grade 1</option><option value="grade2">⭐⭐ Grade 2</option><option value="grade3">⭐⭐⭐ Grade 3</option><option value="reject">❌ Reject</option>`;
  qualitySelect.value = 'grade1';
  
  document.getElementById('harvest-price').value = gradePrices.grade1;
  if(document.getElementById('harvest-price-input')) {
    document.getElementById('harvest-price-input').value = gradePrices.grade1;
  }
  document.getElementById('harvest-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('harvest-qty').value = '';
  document.getElementById('harvest-notes').value = '';
  document.getElementById('harvest-unit').value = 'kg';
  if(document.getElementById('harvest-estimated-value')) {
    document.getElementById('harvest-estimated-value').textContent = 'KES 0';
  }
  
  // Add event listener for real-time price calculation
  const qtyInput = document.getElementById('harvest-qty');
  const priceInput = document.getElementById('harvest-price-input');
  const estValue = document.getElementById('harvest-estimated-value');
  const qualitySelectEl = document.getElementById('harvest-quality');
  
  const updateValue = function() {
    const qty = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput?.value || 0) || 0;
    if(estValue) estValue.textContent = 'KES ' + (qty * price).toLocaleString();
  };
  
  qtyInput.oninput = updateValue;
  if(priceInput) {
    priceInput.oninput = function() {
      document.getElementById('harvest-price').value = this.value;
      updateValue();
    };
  }
  
  // Grade selection (just for recording, doesn't change price)
  qualitySelectEl.onchange = function() {
    updateValue();
  };
};

AdminDashboard.closeHarvestModal = function() {
  document.getElementById('harvest-modal').style.display = 'none';
};

AdminDashboard.createHarvestModal = function() {
  const modal = document.createElement('div');
  modal.id = 'harvest-modal';
  modal.className = 'modal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0,0,0,0.5)';
  modal.style.zIndex = '1000';
  modal.innerHTML = `<div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:400px;width:90%;margin:auto"><h2 style="color:var(--green-deep);margin:0 0 16px">Record Harvest</h2><form onsubmit="AdminDashboard.saveHarvest(event)"><input type="hidden" id="harvest-gh-id"><input type="hidden" id="harvest-price"><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Greenhouse</label><select id="harvest-gh-select" required style="width:100%;padding:10px"></select></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Quantity</label><div style="display:flex;gap:8px"><input type="number" id="harvest-qty" required placeholder="Amount" step="0.01" style="flex:2;padding:10px"><select id="harvest-unit" style="flex:1;padding:10px"><option value="kg">kg</option><option value="g">grams</option></select></div></div><div style="margin-bottom:12px;padding:10px;background:var(--green-ultra-pale);border-radius:var(--radius-sm)"><div style="font-size:0.85rem;color:var(--text-light)">Estimated Value</div><div style="font-size:1.2rem;font-weight:700;color:var(--green-fresh)" id="harvest-estimated-value">KES 0</div></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Price per kg (KES)</label><input type="number" id="harvest-price-input" required placeholder="Price per kg" style="width:100%;padding:10px"></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Grade</label><select id="harvest-quality" required style="width:100%;padding:10px"><option value="grade1">⭐ Grade 1</option><option value="grade2">⭐⭐ Grade 2</option><option value="grade3">⭐⭐⭐ Grade 3</option><option value="reject">❌ Reject</option></select></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Date</label><input type="date" id="harvest-date" required style="width:100%;padding:10px"></div><div style="margin-bottom:16px"><label style="display:block;margin-bottom:4px;color:var(--text)">Notes</label><textarea id="harvest-notes" placeholder="Optional notes..." style="width:100%;padding:10px;min-height:60px"></textarea></div><div style="display:flex;gap:10px"><button type="button" onclick="AdminDashboard.closeHarvestModal()" style="flex:1;padding:12px;background:var(--green-ultra-pale);border:none;border-radius:var(--radius-sm);cursor:pointer">Cancel</button><button type="submit" class="btn-primary" style="flex:1;padding:12px">Save Harvest</button></div></form></div></div>`;
  document.body.appendChild(modal);
};

AdminDashboard.openStandaloneHarvestModal = function() {
  const greenhouses = AFV.greenhouses || [];
  const modal = document.getElementById('harvest-modal');
  
  // Populate greenhouse dropdown
  const ghSelect = document.getElementById('harvest-gh-select');
  ghSelect.innerHTML = greenhouses.map(g => `<option value="${g.id}">${g.cropEmoji} ${g.name} - ${g.crop || 'Not planted'}</option>`).join('');
  
  // Set default prices
  const defaultPrices = { grade1: 150, grade2: 120, grade3: 80, reject: 0 };
  document.getElementById('harvest-price').value = defaultPrices.grade1;
  document.getElementById('harvest-price-input').value = defaultPrices.grade1;
  document.getElementById('harvest-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('harvest-qty').value = '';
  document.getElementById('harvest-notes').value = '';
  document.getElementById('harvest-unit').value = 'kg';
  document.getElementById('harvest-quality').value = 'grade1';
  document.getElementById('harvest-estimated-value').textContent = 'KES 0';
  
  // Set up event listeners
  const qtyInput = document.getElementById('harvest-qty');
  const priceInput = document.getElementById('harvest-price-input');
  const estValue = document.getElementById('harvest-estimated-value');
  const updateValue = function() {
    const qty = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    estValue.textContent = 'KES ' + (qty * price).toLocaleString();
  };
  qtyInput.oninput = updateValue;
  priceInput.oninput = function() {
    document.getElementById('harvest-price').value = this.value;
    updateValue();
  };
  
  modal.style.display = 'flex';
};

AdminDashboard.saveHarvest = function(e) {
  e.preventDefault();
  let ghId = document.getElementById('harvest-gh-id').value;
  // Also check the dropdown if it exists
  const ghSelect = document.getElementById('harvest-gh-select');
  if (ghSelect && ghSelect.value) {
    ghId = ghSelect.value;
  }
  
  const quantity = parseFloat(document.getElementById('harvest-qty').value);
  const unit = document.getElementById('harvest-unit').value;
  const quality = document.getElementById('harvest-quality').value;
  const date = document.getElementById('harvest-date').value;
  const notes = document.getElementById('harvest-notes').value;
  const pricePerKg = parseFloat(document.getElementById('harvest-price-input')?.value || document.getElementById('harvest-price').value) || 0;
  const gh = AFV.greenhouses.find(g => g.id === ghId);
  
  if(!AFV.harvest[ghId]) AFV.harvest[ghId] = [];
  
  // Calculate total value (convert grams to kg if needed)
  const qtyInKg = unit === 'g' ? quantity / 1000 : quantity;
  const totalValue = qtyInKg * pricePerKg;
  
  AFV.harvest[ghId].push({
    id: Date.now(),
    date: date,
    quantity: quantity,
    unit: unit,
    pricePerKg: pricePerKg,
    totalValue: totalValue,
    quality: quality,
    notes: notes,
    recordedBy: AFV.currentUser?.name || 'Admin',
    recordedAt: new Date().toISOString()
  });
  
  // Auto-create revenue entry for grade 1 & 2 harvests (not for reject)
  if((quality === 'grade1' || quality === 'grade2') && totalValue > 0) {
    if(!AFV.revenue) AFV.revenue = [];
    AFV.revenue.push({
      id: Date.now(),
      date: date,
      source: 'Greenhouse',
      product: (gh?.name || 'Greenhouse') + ' - ' + (gh?.crop || ''),
      amount: totalValue,
      recordedBy: AFV.currentUser?.name || 'Admin',
      recordedAt: new Date().toISOString()
    });
  }
  
  this.saveState();
  this.closeHarvestModal();
  this.showPage('harvest');
};

AdminDashboard.deleteHarvest = function(ghId, recordId) {
  if(!confirm('Delete this harvest record?')) return;
  if(AFV.harvest[ghId]) {
    AFV.harvest[ghId] = AFV.harvest[ghId].filter(r => r.id !== recordId);
    this.saveState();
    this.showPage('harvest');
  }
};

AdminDashboard.resetAllData = async function() {
  if (!confirm('Reset ALL data? This clears everything and cannot be undone!')) return;
  if (!confirm('FINAL CONFIRMATION: Are you absolutely sure?')) return;

  await AFV.resetAllData();
  showToast('System reset complete! Reloading...', 'success');
  setTimeout(() => location.reload(), 1500);
};






