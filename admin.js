// ============================================
// AGRI-FINE VENTURES — ADMIN DASHBOARD
// ============================================

const AdminDashboard = {
  currentPage: 'overview',

  init() {
    this.renderNav();
    this.showPage('overview');
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
        <button class="nav-item" data-page="greenhouses" onclick="AdminDashboard.showPage('greenhouses')">
          <span class="nav-icon">🏡</span><span>Greenhouses</span>
        </button>
        <button class="nav-item" data-page="tasks" onclick="AdminDashboard.showPage('tasks')">
          <span class="nav-icon">📋</span><span>All Tasks</span>
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

  showPage(page) {
    this.currentPage = page;
    document.querySelectorAll('#admin-nav .nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`#admin-nav [data-page="${page}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById('admin-content');
    switch(page) {
      case 'overview': content.innerHTML = this.renderOverview(); break;
      case 'greenhouses': content.innerHTML = this.renderGreenhouses(); break;
      case 'tasks': content.innerHTML = this.renderAllTasks(); break;
      case 'categories': content.innerHTML = this.renderCategories(); break;
      case 'orders': content.innerHTML = this.renderOrders(); break;
      case 'supervisors': content.innerHTML = this.renderSupervisors(); break;
      case 'workers': content.innerHTML = this.renderSupervisorWorkers(); break;
      case 'agronomists': content.innerHTML = this.renderAgronomists(); this.attachAgronomistEvents(); break;
      case 'agro-reports': content.innerHTML = this.renderAgroReports(); break;
      case 'analytics': content.innerHTML = this.renderAnalytics(); break;
      case 'inventory': content.innerHTML = this.renderInventory(); break;
      case 'revenue': content.innerHTML = this.renderRevenue(); break;
      case 'receipts': content.innerHTML = this.renderReceipts(); break;
      case 'harvest': content.innerHTML = this.renderHarvest(); break;
      case 'schedule': content.innerHTML = this.renderSchedule(); break;
      case 'alerts': content.innerHTML = this.renderAlerts(); break;
      case 'feeding': content.innerHTML = this.renderFeedingProgram(); this.attachFeedingEvents(); break;
      case 'password-resets': content.innerHTML = this.renderPasswordResets(); break;
      case 'settings': content.innerHTML = this.renderSettings(); break;
    }
    this.attachPageEvents(page);
  },

  renderOverview() {
    const totalTasks = AFV.greenhouses.reduce((s, g) => s + g.tasks.length, 0);
    const doneTasks = AFV.greenhouses.reduce((s, g) => s + g.tasks.filter(t => t.completed).length, 0);
    const pendingTasks = totalTasks - doneTasks;
    const criticalTasks = AFV.greenhouses.reduce((s, g) => s + g.tasks.filter(t => !t.completed && t.priority === 'high').length, 0);
    const unreadReports = AFV.agronomistReports.filter(r => !r.acknowledged).length;

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
        <div class="weather-bar">
          <div class="weather-item"><span class="weather-icon">🌡️</span><div><div class="weather-val">24°C</div><div class="weather-lbl">Temperature</div></div></div>
          <div class="weather-divider"></div>
          <div class="weather-item"><span class="weather-icon">💧</span><div><div class="weather-val">68%</div><div class="weather-lbl">Humidity</div></div></div>
          <div class="weather-divider"></div>
          <div class="weather-item"><span class="weather-icon">☀️</span><div><div class="weather-val">8.2 hrs</div><div class="weather-lbl">Sunlight Today</div></div></div>
          <div class="weather-divider"></div>
          <div class="weather-item"><span class="weather-icon">💨</span><div><div class="weather-val">12 km/h</div><div class="weather-lbl">Wind Speed</div></div></div>
          <div class="weather-divider"></div>
          <div class="weather-item"><span class="weather-icon">🌧️</span><div><div class="weather-val">0mm</div><div class="weather-lbl">Rainfall</div></div></div>
        </div>

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

  renderGreenhouses() {
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Greenhouses 🏡</div>
          <div class="page-subtitle">Detailed view of all 5 production units</div>
        </div>
        <div class="header-actions">
          
        </div>
      </div>
      <div class="page-body">
        ${AFV.greenhouses.map(gh => this.renderGHDetail(gh)).join('')}
      </div>
      
    `;
  },

  renderGHDetail(gh) {
    const progress = AFV.getOverallProgress(gh);
    const status = AFV.getGHStatus(gh);
    const daysPlanted = Math.floor((new Date() - gh.plantedDate) / (1000*60*60*24));
    const daysToHarvest = Math.ceil((gh.expectedHarvest - new Date()) / (1000*60*60*24));
    const pendingTasks = gh.tasks.filter(t => !t.completed);
    const doneTasks = gh.tasks.filter(t => t.completed);

    return `
      <div class="card" style="margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-weight:700;color:var(--green-deep);font-size:1rem">${gh.cropEmoji} ${gh.name}</div>
          <button onclick="AdminDashboard.openGreenhouseModal(${gh.id})" class="btn-secondary" style="font-size:0.78rem;padding:6px 12px">✏️ Edit Greenhouse</button>
        </div>
        <div style="display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap">
          <div class="${gh.bgClass}" style="width:200px;height:130px;border-radius:var(--radius-md);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:4rem;background-size:cover;background-position:center">
            ${gh.imageUrl ? `<img src="${gh.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)">` : gh.cropEmoji}
          </div>
          <div style="flex:1;min-width:200px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
              <div>
                <h2 style="font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--green-deep);margin-bottom:4px">${gh.name} — ${gh.crop}</h2>
                <div style="color:var(--text-light);font-size:0.82rem">${gh.variety} · ${gh.area} · ${gh.plants.toLocaleString()} plants</div>
              </div>
              <span class="gh-status-badge ${status.cls}">${status.label}</span>
            </div>
            <div style="display:flex;gap:16px;margin-top:14px;flex-wrap:wrap">
              <div style="background:var(--green-ultra-pale);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Planted</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--green-deep)">${gh.plantedDate.toLocaleDateString('en-KE',{day:'2-digit',month:'short'})}</div>
              </div>
              <div style="background:var(--green-ultra-pale);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68px;font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Age</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--green-deep)">${daysPlanted} days</div>
              </div>
              <div style="background:var(--green-ultra-pale);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Harvest in</div>
                <div style="font-size:0.9rem;font-weight:600;color:${daysToHarvest < 30 ? 'var(--orange-warn)' : 'var(--green-deep)'}">${daysToHarvest} days</div>
              </div>
              <div style="background:rgba(9,132,227,0.08);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Temp</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--blue-water)">${gh.environment.temp}</div>
              </div>
              <div style="background:rgba(9,132,227,0.08);padding:8px 14px;border-radius:var(--radius-sm)">
                <div style="font-size:0.68rem;color:var(--text-light);text-transform:uppercase">Humidity</div>
                <div style="font-size:0.9rem;font-weight:600;color:var(--blue-water)">${gh.environment.humidity}</div>
              </div>
            </div>
            <div style="margin-top:14px">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-light);margin-bottom:6px">
                <span>Task Progress</span>
                <span>${doneTasks.length}/${gh.tasks.length} complete</span>
              </div>
              <div class="gh-progress-bar">
                <div class="gh-progress-fill" style="width:${progress}%"></div>
              </div>
            </div>
          </div>
        </div>
        <div style="background:var(--green-ultra-pale);border-radius:var(--radius-sm);padding:12px;margin-bottom:18px;border-left:3px solid var(--green-fresh)">
          <div style="font-size:0.72rem;font-weight:700;color:var(--green-forest);text-transform:uppercase;margin-bottom:3px">Notes</div>
          <div style="font-size:0.85rem;color:var(--text-dark)">${gh.notes}</div>
        </div>
        <div>
          <div style="font-weight:700;color:var(--green-deep);margin-bottom:12px;font-size:0.9rem">📋 Task Schedule</div>
          <div class="task-list">
            ${gh.tasks.map((task, i) => `
              <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}">
                <div class="task-check ${task.completed ? 'done' : ''}" onclick="AdminDashboard.toggleTaskComplete(${gh.id}, ${task.id})"></div>
                <div class="task-info">
                  <div class="task-name">${i + 1}. ${task.name}</div>
                  <div class="task-meta">
                    <span class="badge badge-${task.category === 'nutrition'?'blue':task.category==='irrigation'?'blue':task.category==='pest'?'red':task.category==='harvest'?'orange':'green'}">${task.category}</span>
                    <span>⏱ ${task.duration}</span>
                    ${task.completed ? `<span style="color:var(--green-fresh)">✅ ${task.completedAt ? task.completedAt.toLocaleDateString('en-KE') : 'Done'}</span>` : '<span style="color:var(--orange-warn)">⏳ Pending</span>'}
                  </div>
                  ${!task.completed ? `<div style="font-size:0.78rem;color:var(--text-light);margin-top:4px">${task.desc}</div>` : ''}
                </div>
                <span class="task-priority">${task.priority.toUpperCase()}</span>
                <button onclick="AdminDashboard.openTaskModal('${gh.id}', '${task.id}')" class="btn-icon" title="Edit task" style="background:var(--blue-water);color:white;border:none;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:0.75rem;margin-left:8px">✏️</button>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  },

  renderAllTasks() {
    const allTasks = [];
    AFV.greenhouses.forEach(gh => gh.tasks.forEach(t => allTasks.push({...t, gh})));
    const pending = allTasks.filter(t => !t.completed);
    const done = allTasks.filter(t => t.completed);

    return `
      <div class="page-header">
        <div>
          <div class="page-title">All Tasks 📋</div>
          <div class="page-subtitle">${pending.length} pending · ${done.length} completed</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" onclick="AdminDashboard.openTaskModal()">➕ Add Task</button>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(t => {
                  // Check task.assignedTo first, then fallback to assignedGH logic
                  let worker = null;
                  if (t.assignedTo) {
                    // Check in AFV.workers (supervisor-added workers)
                    worker = (AFV.workers || []).find(w => w.id == t.assignedTo);
                    // Also check in AFV.users
                    if (!worker && AFV.users[t.assignedTo]) {
                      worker = AFV.users[t.assignedTo];
                    }
                  } else {
                    // Fallback: find worker by assignedGH
                    const workerKey = Object.keys(AFV.users).find(k => AFV.users[k].role === 'worker' && AFV.users[k].assignedGH?.includes(t.gh.id));
                    worker = workerKey ? AFV.users[workerKey] : null;
                  }
                  return `
                    <tr>
                      <td><div style="font-weight:600">${t.name}</div><div style="font-size:0.72rem;color:var(--text-light)">${t.desc?.substring(0,60)}...</div></td>
                      <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                      <td><span class="badge badge-green">${t.category}</span></td>
                      <td><span class="badge ${t.priority==='high'?'badge-red':t.priority==='medium'?'badge-orange':'badge-green'}">${t.priority}</span></td>
                      <td>${t.duration}</td>
                      <td>${worker ? worker.name : '—'}</td>
                      <td>${t.assignedTo ? '<span style="font-size:0.7rem;color:var(--blue-water)">Supervisor</span>' : (worker ? '<span style="font-size:0.7rem;color:var(--orange-warn)">Admin</span>' : '—')}</td>
                      <td>${t.verified ? '<span class="badge badge-green" style="font-size:0.65rem">✓ Verified</span>' : t.assignedTo ? '<span class="badge badge-blue" style="font-size:0.65rem">Assigned</span>' : '<span class="badge badge-gray" style="font-size:0.65rem">Pending</span>'}</td>
                      <td>
                        ${!t.assignedTo ? `
                          <select id="admin-assign-worker-${t.gh.id}-${t.id}" style="padding:4px;border-radius:4px;border:1px solid var(--green-pale);font-size:0.75rem;width:100px">
                            <option value="">Select</option>
                            ${(AFV.workers || []).map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                            ${Object.values(AFV.users || {}).filter(u => u.role === 'worker').map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                          </select>
                          <button onclick="AdminDashboard.assignTaskToWorker('${t.gh.id}', '${t.id}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">Assign</button>
                        ` : `
                          <button onclick="AdminDashboard.openTaskModal('${t.gh.id}', '${t.id}')" class="btn-icon" title="Edit task" style="background:var(--blue-water);color:white;border:none;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:0.75rem">✏️</button>
                        `}
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
              <thead><tr><th>Task</th><th>Greenhouse</th><th>Completed</th><th>By</th><th>Actions</th></tr></thead>
              <tbody>
                ${done.map(t => {
                  // Check task.assignedTo first, then fallback to completedBy
                  let worker = null;
                  if (t.assignedTo) {
                    worker = (AFV.workers || []).find(w => w.id == t.assignedTo);
                    if (!worker && AFV.users[t.assignedTo]) {
                      worker = AFV.users[t.assignedTo];
                    }
                  } else if (t.completedBy) {
                    worker = (AFV.workers || []).find(w => w.id == t.completedBy) || AFV.users[t.completedBy];
                  }
                  return `
                    <tr>
                      <td style="text-decoration:line-through;opacity:0.7">${t.name}</td>
                      <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                      <td>${t.completedAt ? t.completedAt.toLocaleDateString('en-KE') : '—'}</td>
                      <td>${worker ? worker.name : '—'}</td>
                      <td><button onclick="AdminDashboard.openTaskModal('${t.gh.id}', '${t.id}')" class="btn-icon" title="Edit task" style="background:var(--blue-water);color:white;border:none;width:26px;height:26px;border-radius:4px;cursor:pointer;font-size:0.75rem">✏️</button></td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    `;
  },

  renderCategories() {
    const categories = AFV.taskCategories || [];
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🏷️ Task Categories</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Manage task categories</div>
        </div>
        <div class="header-actions">
          <button onclick="AdminDashboard.showAddCategoryModal()" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ Add Category</button>
        </div>
      </div>
      <div class="page-body">
        <div class="card">
          <div class="section-title">Categories (${categories.length})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:16px">
            ${categories.map(cat => `
              <div style="background:var(--green-ultra-pale);padding:12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-weight:600;color:var(--green-deep)">${cat}</div>
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
    
    AFV.saveState();
    
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
      AFV.saveState();
      showToast('Category deleted!', 'success');
      this.showPage('categories');
    }
  },

  renderOrders() {
    const orders = AFV.harvestOrders || [];
    const pending = orders.filter(o => o.status === 'pending');
    const completed = orders.filter(o => o.status === 'completed');
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
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
              <thead><tr><th>Greenhouse</th><th>Crop</th><th>Variety</th><th>Buyer</th><th>Phone</th><th>Expected Harvest</th><th>Plants</th><th>Status</th><th>Actions</th></tr></thead>
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
                      <td>${o.plants || '—'}</td>
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
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Number of Plants</label>
              <input type="number" id="order-plants" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="0">
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
    const plants = document.getElementById('order-plants').value;
    const expectedHarvest = document.getElementById('order-expected').value;
    const buyer = document.getElementById('order-buyer').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    
    if (!AFV.harvestOrders) AFV.harvestOrders = [];
    
    const newOrder = {
      id: Date.now(),
      greenhouseId,
      crop,
      variety,
      plants: plants ? parseInt(plants) : 0,
      expectedHarvest,
      buyer,
      phone,
      status: 'pending',
      createdBy: AFV.currentUser?.name || 'Admin',
      createdAt: new Date()
    };
    
    AFV.harvestOrders.push(newOrder);
    AFV.saveState();
    
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
      AFV.saveState();
      showToast('Harvest order completed!', 'success');
      this.showPage('orders');
    }
  },

  deleteOrder(orderId) {
    if (!confirm('Delete this harvest order?')) return;
    
    const idx = AFV.harvestOrders.findIndex(o => o.id == orderId);
    if (idx > -1) {
      AFV.harvestOrders.splice(idx, 1);
      AFV.saveState();
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
            const tasks = AFV.getTasksForWorker(s.id);
            const totalAssigned = s.assignedGH?.reduce((sum, ghId) => {
              const gh = AFV.greenhouses.find(g => g.id === ghId);
              return sum + (gh ? gh.tasks.length : 0);
            }, 0) || 0;
            const doneAssigned = s.assignedGH?.reduce((sum, ghId) => {
              const gh = AFV.greenhouses.find(g => g.id === ghId);
              return sum + (gh ? gh.tasks.filter(t => t.completed).length : 0);
            }, 0) || 0;
            return `
              <div class="card" style="text-align:center;border:1px solid var(--green-pale)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                  <div style="font-size:3rem;">${s.imageUrl ? `<img src="${s.imageUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid var(--green-primary)">` : s.avatar}</div>
                  <div style="display:flex;gap:6px">
                    <button onclick="AdminDashboard.openSupervisorModal('${s.id}')" class="btn-icon" title="Edit worker" style="background:var(--blue-water);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">✏️</button>
                    <button onclick="AdminDashboard.deleteSupervisor('${s.id}')" class="btn-icon" title="Delete worker" style="background:var(--red-alert);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">🗑️</button>
                  </div>
                </div>
                <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--green-deep)">${s.name}</div>
                <div style="color:var(--text-light);font-size:0.78rem;margin-bottom:14px">Supervisor</div>
                <div style="margin-bottom:10px">
                  ${s.assignedGH?.map(ghId => {
                    const gh = AFV.greenhouses.find(g => g.id === ghId);
                    return gh ? `<span class="badge badge-green" style="margin:2px">${gh.cropEmoji} ${gh.name}</span>` : '';
                  }).join('') || '<span style="font-size:0.75rem;color:var(--text-light)">No assignments</span>'}
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
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Username (Login ID)</label>
              <input type="text" id="supervisor-username" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., worker1">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Full Name</label>
              <input type="text" id="supervisor-name" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Enter worker's full name">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Avatar</label>
              <div id="supervisor-avatar-options" style="display:flex;gap:8px;flex-wrap:wrap">
                ${avatars.map(a => `<label style="cursor:pointer"><input type="radio" name="worker-avatar" value="${a}" style="display:none"><div class="avatar-option" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;border:2px solid var(--green-pale);border-radius:50%;transition:all 0.2s">${a}</div></label>`).join('')}
              </div>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Or Upload Photo</label>
              <input type="file" id="supervisor-image-input" accept="image/*" onchange="AdminDashboard.handleWorkerImageUpload(this)" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;background:white">
              <input type="hidden" id="supervisor-image-url">
              <div id="supervisor-image-preview" style="margin-top:10px"></div>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Password</label>
              <input type="password" id="supervisor-password" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Login password (default: 1234)">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Assigned Greenhouses</label>
              <div style="display:flex;flex-direction:column;gap:8px;max-height:150px;overflow-y:auto">
                ${AFV.greenhouses.map(gh => `
                  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px;background:var(--green-ultra-pale);border-radius:var(--radius-sm)">
                    <input type="checkbox" class="supervisor-gh-checkbox" value="${gh.id}" style="width:18px;height:18px">
                    <span style="font-size:1.2rem">${gh.cropEmoji}</span>
                    <span style="font-size:0.9rem;font-weight:500">${gh.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
              <button type="button" onclick="AdminDashboard.closeSupervisorModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button>
              <button type="submit" class="btn-primary" style="padding:10px 24px">💾 Save Supervisor</button>
            </div>
          </form>
        </div>
      </div>
      <style>
        .avatar-option:hover { transform: scale(1.1); }
        input[name="worker-avatar"]:checked + .avatar-option { border-color: var(--green-fresh); background: var(--green-ultra-pale); }
      </style>
      
    `;
  },

  openSupervisorModal(workerId = null) {
    const modal = document.getElementById('supervisor-modal');
    const title = document.getElementById('supervisor-modal-title');
    const form = document.getElementById('supervisor-form');
    
    form.reset();
    document.querySelectorAll('.avatar-option').forEach(el => el.style.borderColor = 'var(--green-pale)');
    document.getElementById('supervisor-image-preview').innerHTML = '';
    
    if (workerId) {
      const worker = AFV.users[workerId];
      if (worker) {
        title.textContent = 'Edit Supervisor';
        document.getElementById('supervisor-id').value = worker.id;
        document.getElementById('supervisor-username').value = worker.id;
        document.getElementById('supervisor-name').value = worker.name;
        document.getElementById('supervisor-password').value = worker.password;
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
        document.querySelectorAll('.supervisor-gh-checkbox').forEach(cb => {
          cb.checked = worker.assignedGH?.includes(parseInt(cb.value));
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

  saveSupervisor(e) {
    e.preventDefault();
    const id = document.getElementById('supervisor-id').value;
    const username = document.getElementById('supervisor-username').value.trim();
    const name = document.getElementById('supervisor-name').value.trim();
    const password = document.getElementById('supervisor-password').value.trim();
    const avatar = document.querySelector('input[name="supervisor-avatar"]:checked')?.value || '👨‍🌾';
    const imageUrl = document.getElementById('supervisor-image-url').value || '';
    const assignedGH = Array.from(document.querySelectorAll('.supervisor-gh-checkbox:checked')).map(cb => parseInt(cb.value));
    
    if (!username || !name || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Check if username already exists
    if (username !== id && AFV.users[username]) {
      showToast('Username already exists. Please choose a different one.', 'error');
      return;
    }
    
    if (id) {
      // Edit existing worker
      if (AFV.users[id]) {
        // If username changed, need to create new user and update references
        if (username !== id) {
          // Update any references in greenhouses tasks
          AFV.greenhouses.forEach(gh => {
            if (gh.tasks) {
              gh.tasks.forEach(task => {
                if (task.completedBy === id) {
                  task.completedBy = username;
                }
              });
            }
          });
          
          // Create new user with new username
          AFV.users[username] = {
            id: username,
            name: name,
            role: 'worker',
            password: password,
            avatar: avatar,
            imageUrl: imageUrl,
            assignedGH: assignedGH
          };
          
          // Update current user if it's the same worker
          if (AFV.currentUser?.id === id) {
            AFV.currentUser = AFV.users[username];
            AFV.currentRole = 'supervisor';
          }
          
          // Delete old user
          delete AFV.users[id];
          AFV.logActivity('✏️', `Worker username changed from ${id} to ${username}: ${name}`);
          showToast(`Worker username changed to "${username}"!`, 'success');
        } else {
          // Just update fields
          AFV.users[id].name = name;
          AFV.users[id].password = password;
          AFV.users[id].avatar = avatar;
          AFV.users[id].imageUrl = imageUrl;
          AFV.users[id].assignedGH = assignedGH;
          AFV.logActivity('✏️', `Worker updated: ${name}`);
          showToast(`Worker "${name}" updated successfully!`, 'success');
        }
      }
    } else {
      // Add new worker
      const newId = username;
      AFV.users[newId] = {
        id: newId,
        name: name,
        role: 'worker',
        password: password,
        avatar: avatar,
        imageUrl: imageUrl,
        assignedGH: assignedGH
      };
      AFV.logActivity('➕', `New worker added: ${name}`);
      showToast(`Worker "${name}" added successfully!`, 'success');
    }
    
    this.closeSupervisorModal();
    this.showPage('workers');
  },

  deleteSupervisor(workerId) {
    const worker = AFV.users[workerId];
    if (!worker) return;
    
    if (!confirm(`Are you sure you want to delete "${worker.name}"? This action cannot be undone.`)) {
      return;
    }
    
    delete AFV.users[workerId];
    AFV.logActivity('🗑️', `Worker deleted: ${worker.name}`);
    showToast(`Worker "${worker.name}" has been deleted`, 'success');
    this.showPage('workers');
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
              const reports = AFV.agronomistReports.filter(r => r.authorId === a.id);
              return `
                <div class="card" style="border:1px solid #e8d5e8;text-align:center">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                    <div style="font-size:3rem;">${a.imageUrl ? `<img src="${a.imageUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #9b59b6">` : a.avatar}</div>
                    <div style="display:flex;gap:6px">
                      <button onclick="AdminDashboard.openAgronomistModal('${a.id}')" class="btn-icon" title="Edit agronomist" style="background:var(--blue-water);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">✏️</button>
                      <button onclick="AdminDashboard.deleteAgronomist('${a.id}')" class="btn-icon" title="Delete agronomist" style="background:var(--red-alert);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">🗑️</button>
                    </div>
                  </div>
                  <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:#9b59b6">${a.name}</div>
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
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Username (Login ID)</label>
              <input type="text" id="agronomist-username" required style="width:100%;padding:10px;border:1px solid #e8d5e8;border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., agronomist1">
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
        document.getElementById('agronomist-id').value = agronomist.id;
        document.getElementById('agronomist-username').value = agronomist.id;
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

  saveAgronomist(e) {
    e.preventDefault();
    const id = document.getElementById('agronomist-id').value;
    const username = document.getElementById('agronomist-username').value.trim();
    const name = document.getElementById('agronomist-name').value.trim();
    const password = document.getElementById('agronomist-password').value.trim();
    const avatar = document.querySelector('input[name="agronomist-avatar"]:checked')?.value || '🔬';
    const imageUrl = document.getElementById('agronomist-image-url').value || '';
    
    if (!username || !name || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Check if username already exists
    if (username !== id && AFV.users[username]) {
      showToast('Username already exists. Please choose a different one.', 'error');
      return;
    }
    
    if (id) {
      // Edit existing agronomist
      if (AFV.users[id]) {
        // If username changed, need to create new user and update references
        if (username !== id) {
          // Update any references in agronomist reports
          AFV.agronomistReports.forEach(report => {
            if (report.authorId === id) {
              report.authorId = username;
            }
          });
          
          // Create new user with new username
          AFV.users[username] = {
            id: username,
            name: name,
            role: 'agronomist',
            password: password,
            avatar: avatar,
            imageUrl: imageUrl
          };
          
          // Update current user if it's the same agronomist
          if (AFV.currentUser?.id === id) {
            AFV.currentUser = AFV.users[username];
            AFV.currentRole = 'agronomist';
          }
          
          // Delete old user
          delete AFV.users[id];
          AFV.logActivity('✏️', `Agronomist username changed from ${id} to ${username}: ${name}`);
          showToast(`Agronomist username changed to "${username}"!`, 'success');
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
      // Add new agronomist
      const newId = username;
      AFV.users[newId] = {
        id: newId,
        name: name,
        role: 'agronomist',
        password: password,
        avatar: avatar,
        imageUrl: imageUrl
      };
      AFV.logActivity('➕', `New agronomist added: ${name}`);
      showToast(`Agronomist "${name}" added successfully!`, 'success');
    }
    
    this.closeAgronomistModal();
    this.showPage('agronomists');
  },

  deleteAgronomist(agronomistId) {
    const agronomist = AFV.users[agronomistId];
    if (!agronomist) return;
    
    if (!confirm(`Are you sure you want to delete "${agronomist.name}"? This action cannot be undone.`)) {
      return;
    }
    
    delete AFV.users[agronomistId];
    AFV.logActivity('🗑️', `Agronomist deleted: ${agronomist.name}`);
    showToast(`Agronomist "${agronomist.name}" has been deleted`, 'success');
    this.showPage('agronomists');
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
    const crops = AFV.greenhouses.map(g => g.crop);
    const progresses = AFV.greenhouses.map(g => AFV.getOverallProgress(g));

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
            ${AFV.greenhouses.map((gh, i) => `
              <div style="margin-bottom:16px">
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:6px">
                  <span style="font-weight:600">${gh.cropEmoji} ${gh.name}</span>
                  <span style="color:var(--green-forest);font-weight:700">${progresses[i]}%</span>
                </div>
                <div class="gh-progress-bar" style="height:10px">
                  <div class="gh-progress-fill" style="width:${progresses[i]}%;background:${i===0?'linear-gradient(90deg,#e17055,#fd79a8)':i===1?'linear-gradient(90deg,#d63031,#e17055)':i===2?'linear-gradient(90deg,#0984e3,#74b9ff)':i===3?'linear-gradient(90deg,#fdcb6e,#e17055)':'linear-gradient(90deg,#6c5ce7,#a29bfe)'}"></div>
                </div>
                <div style="font-size:0.72rem;color:var(--text-light);margin-top:2px">${gh.crop} · ${gh.plants.toLocaleString()} plants · ${Math.ceil((gh.expectedHarvest - new Date()) / (1000*60*60*24))} days to harvest</div>
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
            ${[...AFV.greenhouses].sort((a,b) => a.expectedHarvest - b.expectedHarvest).map(gh => {
              const daysLeft = Math.ceil((gh.expectedHarvest - new Date()) / (1000*60*60*24));
              return `
                <div class="timeline-item">
                  <div class="timeline-dot ${daysLeft < 30 ? '' : 'pending'}"></div>
                  <div class="timeline-content">
                    <div class="timeline-date">${gh.expectedHarvest.toLocaleDateString('en-KE',{day:'2-digit',month:'long',year:'numeric'})} · <strong>${daysLeft} days</strong></div>
                    <div class="timeline-title">${gh.cropEmoji} ${gh.name} — ${gh.crop} (${gh.variety})</div>
                    <div class="timeline-desc">${gh.plants.toLocaleString()} plants · ${gh.area} · Expected yield: ${Math.round(gh.plants * 3.5 / 1000)}T estimated</div>
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
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Inventory 📦</div>
          <div class="page-subtitle">Farm supplies and stock levels</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" onclick="AdminDashboard.openInventoryModal()">+ Add Item</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${items.filter(i=>i.status==='good').length}</div><div class="stat-label">Well Stocked</div></div></div>
          <div class="stat-card"><div class="stat-icon">⚠️</div><div><div class="stat-value" style="color:var(--orange-warn)">${items.filter(i=>i.status==='low').length}</div><div class="stat-label">Running Low</div></div></div>
          <div class="stat-card"><div class="stat-icon">🔴</div><div><div class="stat-value" style="color:var(--red-alert)">${items.filter(i=>i.status==='critical').length}</div><div class="stat-label">Critical — Reorder Now</div></div></div>
        </div>
        <div class="card">
          <div class="scroll-x">
            <table>
              <thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Reorder At</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                ${items.map(i => `
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
          ${AFV.greenhouses.flatMap(gh => gh.tasks.filter(t => !t.completed).slice(0,1).map(t => ({gh, task: t}))).map(({gh, task}) => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);margin-bottom:8px">
              <div class="${gh.bgClass}" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;background-size:cover;background-position:center">${gh.imageUrl ? `<img src="${gh.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : gh.cropEmoji}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.9rem">${task.name}</div>
                <div style="font-size:0.75rem;color:var(--text-light)">${gh.name} · ${task.duration} · ${task.priority.toUpperCase()} priority</div>
              </div>
              <span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}">${task.priority}</span>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="section-title">📋 Upcoming Harvest Calendar</div>
          <div class="timeline">
            ${AFV.greenhouses.sort((a,b) => a.expectedHarvest - b.expectedHarvest).map(gh => {
              const days = Math.ceil((gh.expectedHarvest - new Date())/(1000*60*60*24));
              return `
                <div class="timeline-item">
                  <div class="timeline-dot ${days<60?'':'pending'}"></div>
                  <div class="timeline-content">
                    <div class="timeline-date">${gh.expectedHarvest.toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long'})}</div>
                    <div class="timeline-title">${gh.cropEmoji} ${gh.crop} — ${gh.name}</div>
                    <div class="timeline-desc">In ${days} days · ${gh.plants.toLocaleString()} plants · ${gh.area}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      
    `;
  },

  renderAlerts() {
    const alerts = [
      { level: 'critical', icon: '🚨', title: 'Vapor Gard Stock Critical', desc: 'Only 2L remaining. GH5 requires application urgently. Reorder immediately.', time: '2 hours ago' },
      { level: 'critical', icon: '🚨', title: 'Abamectin Running Out', desc: 'Pest control chemical at 3L. If spider mites are confirmed in GH1, stock will be insufficient.', time: '3 hours ago' },
      { level: 'warning', icon: '⚠️', title: 'GH2 Magnesium Deficiency', desc: 'Dr. Grace Njeri flagged Mg deficiency signs. Foliar spray task pending since yesterday.', time: '5 hours ago' },
      { level: 'warning', icon: '⚠️', title: 'Mancozeb Low Stock', desc: 'Only 12kg remaining. Fungicide schedule for GH3 coming up next week.', time: '1 day ago' },
      { level: 'info', icon: '💧', title: 'GH4 Drip Rate Adjustment', desc: 'New transplants may need increased irrigation in coming days as temperatures rise.', time: '1 day ago' },
      { level: 'info', icon: '🌡️', title: 'Temperature Spike Yesterday', desc: 'GH4 reached 29°C at 2pm. Vents auto-opened. Monitor during peak afternoon hours.', time: '1 day ago' },
    ];
    return `
      <div class="page-header">
        <div>
          <div class="page-title">Alerts 🔔</div>
          <div class="page-subtitle">${alerts.filter(a=>a.level==='critical').length} critical · ${alerts.filter(a=>a.level==='warning').length} warnings</div>
        </div>
      </div>
      <div class="page-body">
        ${alerts.map(a => `
          <div style="display:flex;gap:14px;padding:16px;background:${a.level==='critical'?'rgba(214,48,49,0.05)':a.level==='warning'?'rgba(225,112,85,0.05)':'rgba(9,132,227,0.05)'};border:1.5px solid ${a.level==='critical'?'rgba(214,48,49,0.2)':a.level==='warning'?'rgba(225,112,85,0.2)':'rgba(9,132,227,0.15)'};border-radius:var(--radius-md);margin-bottom:12px">
            <div style="font-size:1.8rem;flex-shrink:0">${a.icon}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:0.95rem;color:${a.level==='critical'?'var(--red-alert)':a.level==='warning'?'var(--orange-warn)':'var(--blue-water)'};margin-bottom:4px">${a.title}</div>
              <div style="font-size:0.85rem;color:var(--text-dark);line-height:1.5">${a.desc}</div>
              <div style="font-size:0.72rem;color:var(--text-light);margin-top:6px">🕐 ${a.time}</div>
            </div>
            <button style="align-self:flex-start;font-size:0.75rem;padding:4px 12px;background:transparent;border:1px solid var(--green-pale);border-radius:6px;cursor:pointer;color:var(--text-light)">Dismiss</button>
          </div>`).join('')}
      </div>
      
    `;
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
      
      AFV.saveState();
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
      AFV.saveState();
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
          
        </div>
        <div class="card" style="margin-top:20px">
          <div class="section-title">👥 Worker Management</div>
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Assigned Greenhouses</th><th>Status</th></tr></thead>
            <tbody>
              ${Object.values(AFV.users).filter(u=>u.role==='worker').map(w => `
                <tr>
                  <td style="font-weight:600">${w.avatar} ${w.name}</td>
                  <td><span class="badge badge-green">Field Worker</span></td>
                  <td>${w.assignedGH?.map(id => `GH${id}`).join(', ') || '—'}</td>
                  <td><span class="badge badge-green">Active</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
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
    document.getElementById('gh-area').value = gh.area;
    document.getElementById('gh-plants').value = gh.plants;
    document.getElementById('gh-planted-date').value = gh.plantedDate.toISOString().split('T')[0];
    document.getElementById('gh-harvest-date').value = gh.expectedHarvest.toISOString().split('T')[0];
    document.getElementById('gh-notes').value = gh.notes;
    document.getElementById('gh-temp').value = gh.environment.temp;
    document.getElementById('gh-humidity').value = gh.environment.humidity;
    document.getElementById('gh-light').value = gh.environment.light;
    
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
    const id = parseInt(document.getElementById('gh-id').value);
    const updates = {
      name: document.getElementById('gh-name').value.trim(),
      crop: document.getElementById('gh-crop').value.trim(),
      cropEmoji: document.getElementById('gh-crop-emoji').value.trim(),
      variety: document.getElementById('gh-variety').value.trim(),
      imageUrl: document.getElementById('gh-image-url').value || '',
      area: document.getElementById('gh-area').value.trim(),
      plants: parseInt(document.getElementById('gh-plants').value),
      plantedDate: document.getElementById('gh-planted-date').value,
      expectedHarvest: document.getElementById('gh-harvest-date').value,
      notes: document.getElementById('gh-notes').value.trim(),
      environment: {
        temp: document.getElementById('gh-temp').value.trim(),
        humidity: document.getElementById('gh-humidity').value.trim(),
        light: document.getElementById('gh-light').value.trim()
      }
    };
    
    AFV.updateGreenhouse(id, updates);
    showToast('Greenhouse updated successfully!', 'success');
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
    const modal = document.getElementById('task-modal');
    if (!modal) {
      this.insertTaskModal();
    }
    
    const title = document.getElementById('task-modal-title');
    
    if (taskId && ghId) {
      // Edit existing task
      const gh = AFV.greenhouses.find(g => g.id === ghId);
      const task = gh?.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      title.textContent = 'Edit Task';
      document.getElementById('task-gh-id').value = ghId;
      document.getElementById('task-id').value = taskId;
      document.getElementById('task-name').value = task.name;
      document.getElementById('task-desc').value = task.desc || '';
      document.getElementById('task-category').value = task.category;
      document.getElementById('task-priority').value = task.priority;
      document.getElementById('task-duration').value = task.duration;
      
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
                ${(AFV.taskCategories || []).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
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

  saveTask(e) {
    e.preventDefault();
    const ghId = parseInt(document.getElementById('task-gh-id').value);
    const taskId = document.getElementById('task-id').value ? parseInt(document.getElementById('task-id').value) : null;
    
    const taskData = {
      name: document.getElementById('task-name').value.trim(),
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
    AFV.saveState();
    
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
    
    const gh = AFV.greenhouses.find(g => g.id === parseInt(ghId));
    const task = gh?.tasks.find(t => t.id === taskId);
    
    if (gh && task) {
      task.assignedTo = workerId;
      task.assignedAt = new Date();
      task.verified = false;
      // Find worker name for logging
      const worker = (AFV.workers || []).find(w => w.id == workerId) || Object.values(AFV.users || {}).find(u => u.id == workerId);
      const workerName = worker?.name || 'Worker';
      AFV.logActivity('📋', `Task "${task.name}" assigned to ${workerName} by Admin`);
      showToast('Task assigned successfully!', 'success');
      this.showPage(this.currentPage);
    }
  },

  deleteCurrentTask() {
    const ghId = parseInt(document.getElementById('task-gh-id').value);
    const taskId = document.getElementById('task-id').value ? parseInt(document.getElementById('task-id').value) : null;
    
    if (!taskId) return;
    
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    AFV.deleteTask(ghId, taskId);
    AFV.saveState();
    showToast('Task deleted successfully!', 'success');
    this.closeTaskModal();
    this.showPage(this.currentPage);
  },

  toggleTaskComplete(ghId, taskId) {
    const gh = AFV.greenhouses.find(g => g.id === ghId);
    if (!gh) return;
    const task = gh.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (task.completed) {
      // Uncomplete the task
      task.completed = false;
      task.completedAt = null;
      task.completedBy = null;
      AFV.logActivity('↩️', `Task "${task.name}" marked as incomplete in ${gh.name}`);
    } else {
      // Complete the task
      AFV.completeTask(ghId, taskId);
    }
    
    // Save state after task update
    AFV.saveState();
    
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



// Workers added by supervisors
AdminDashboard.renderSupervisorWorkers = function() {
  const workers = AFV.workers || [];
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Workers Added by Supervisors 👷</div>
        <div class="page-subtitle">View workers managed by your supervisors</div>
      </div>
    </div>
    <div class="page-body">
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👥</div><div><div class="stat-value">${workers.length}</div><div class="stat-label">Total Workers</div></div></div>
      </div>
      ${workers.length === 0 ? '<p style="padding:20px;text-align:center;color:var(--text-light)">No workers added by supervisors yet</p>' : ''}
      <div class="stats-grid">
        ${workers.map(w => {
          const tasks = AFV.getTasksForWorker(w.id);
          return `
            <div class="card" style="text-align:center;border:1px solid var(--blue-pale)">
              <div style="font-size:3rem;margin-bottom:8px">${w.avatar}</div>
              <div style="font-weight:700;color:var(--blue-deep)">${w.name}</div>
              <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:10px">Field Worker</div>
              <div style="margin-bottom:10px">
                ${w.assignedGH?.map(ghId => {
                  const gh = AFV.greenhouses.find(g => g.id === ghId);
                  return gh ? '<span class="badge badge-blue" style="margin:2px">' + gh.cropEmoji + '</span>' : '';
                }).join('') || '<span style="font-size:0.75rem;color:var(--text-light)">No assignments</span>'}
              </div>
              <div style="background:rgba(59,130,246,0.1);border-radius:8px;padding:10px">
                <div style="font-size:1.4rem;font-weight:800;color:var(--blue-water)">${tasks.length}</div>
                <div style="font-size:0.72rem;color:var(--text-light)">Pending Tasks</div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
  `;
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
  AFV.saveState();
  
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
  AFV.saveState();
  showToast(`"${item.name}" has been deleted`, 'success');
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
  AFV.saveState();
  this.closeRevenueModal();
  this.showPage('revenue');
};

AdminDashboard.deleteRevenue = function(id) {
  if(!confirm('Delete this record?')) return;
  AFV.revenue = (AFV.revenue||[]).filter(r => r.id !== id);
  AFV.saveState();
  this.showPage('revenue');
};

// RECEIPTS TRACKING (from Supervisors)
AdminDashboard.renderReceipts = function() {
  const receipts = AFV.receipts || [];
  const total = receipts.reduce((s,r) => s + (parseFloat(r.amount)||0), 0);
  return `<div class="page-header"><div><div class="page-title">🧾 Supervisor Receipts</div><div class="page-subtitle">View and edit sales recorded by supervisors</div></div><div class="header-actions"></div></div><div class="page-body"><div class="stats-grid"><div class="stat-card"><div class="stat-value">KES ${total.toLocaleString()}</div><div class="stat-label">Total from Receipts</div></div><div class="stat-card"><div class="stat-value">${receipts.length}</div><div class="stat-label">Total Receipts</div></div></div><div class="card"><div style="font-weight:700;font-size:1.1rem;margin-bottom:16px">All Receipts</div>${receipts.length === 0 ? '<div style="text-align:center;color:var(--text-light);padding:40px">No receipts recorded by supervisors yet</div>' : '<div class="scroll-x"><table><thead><tr><th>Date</th><th>Product</th><th>Customer</th><th>Amount</th><th>Transaction Code</th><th>Image</th><th>Recorded By</th><th>Actions</th></tr></thead><tbody>' + receipts.sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => `<tr><td>${r.date}</td><td>${escapeHtml(r.product)}</td><td>${escapeHtml(r.customer)||'-'}</td><td style="font-weight:600;color:var(--green-fresh)">KES ${parseFloat(r.amount).toLocaleString()}</td><td>${r.transactionCode||'-'}</td><td>${r.imageUrl ? '<button onclick="AdminDashboard.viewReceiptImage(' + r.id + ')" style="background:var(--blue-water);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">📷 View</button>' : '<button onclick="AdminDashboard.uploadReceiptImage(' + r.id + ')" style="background:var(--green-fresh);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">+ Upload</button>'}</td><td>${r.recordedBy === 'supervisor' ? 'Supervisor' : 'Admin'}</td><td><button onclick="AdminDashboard.editReceipt(${r.id})" style="background:var(--blue-water);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">✏️ Edit</button> <button onclick="AdminDashboard.deleteReceipt(${r.id})" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">🗑️</button></td></tr>`).join('') + '</tbody></table></div>'}</div></div><div id="receipt-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center"><div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0" id="receipt-modal-title">Edit Receipt</h2><button onclick="AdminDashboard.closeReceiptModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button></div><form id="receipt-form" onsubmit="AdminDashboard.saveReceipt(event)"><input type="hidden" id="receipt-id"><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Product/Item Sold</label><input type="text" id="receipt-product" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Amount (KES)</label><input type="number" id="receipt-amount" required min="0" step="0.01" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Date</label><input type="date" id="receipt-date" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Customer</label><input type="text" id="receipt-customer" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Transaction Code</label><input type="text" id="receipt-transaction-code" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem"></div><div style="margin-bottom:16px"><label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Receipt Image</label><input type="file" id="receipt-image-input" accept="image/*" onchange="AdminDashboard.handleReceiptImageUpload(this)" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;background:white"><input type="hidden" id="receipt-image-url"><div id="receipt-image-preview" style="margin-top:10px"></div></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px"><button type="button" onclick="AdminDashboard.closeReceiptModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button><button type="submit" class="btn-primary" style="padding:10px 24px">💾 Save Changes</button></div></form></div></div><div id="receipt-view-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center" onclick="if(event.target === this) this.style.display='none'"><div style="max-width:90%;max-height:90vh"><img id="receipt-view-image" style="max-width:100%;max-height:90vh;border-radius:8px"></div></div>`;
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
  const id = parseInt(document.getElementById('receipt-id').value);
  const receipt = AFV.receipts.find(r => r.id === id);
  if (!receipt) return;
  
  receipt.product = document.getElementById('receipt-product').value.trim();
  receipt.amount = parseFloat(document.getElementById('receipt-amount').value);
  receipt.date = document.getElementById('receipt-date').value;
  receipt.customer = document.getElementById('receipt-customer').value.trim();
  receipt.transactionCode = document.getElementById('receipt-transaction-code').value.trim();
  receipt.imageUrl = document.getElementById('receipt-image-url').value;
  
  AFV.saveState();
  AFV.logActivity('✏️', `Receipt updated: ${receipt.product} - KES ${receipt.amount.toLocaleString()}`);
  showToast('Receipt updated successfully!', 'success');
  this.closeReceiptModal();
  this.showPage('receipts');
};

AdminDashboard.deleteReceipt = function(id) {
  if (!confirm('Are you sure you want to delete this receipt?')) return;
  AFV.receipts = AFV.receipts.filter(r => r.id !== id);
  AFV.saveState();
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
  let html = `<div class=\"page-header\"><div><div class=\"page-title\">Harvest 🌾</div><div class=\"page-subtitle\">Track yields per greenhouse</div></div></div><div class=\"page-body\">`;
  
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
    html += `<button class=\"btn-primary\" onclick=\"AdminDashboard.openHarvestModal(${gh.id})\">+ Record Harvest</button>`;
    html += `<div class=\"scroll-x\" style=\"margin-top:12px\"><table><thead><tr><th>Date</th><th>Qty</th><th>Quality</th><th>Notes</th><th></th></tr></thead><tbody>`;
    if(records.length === 0) {
      html += `<tr><td colspan=\"5\" style=\"text-align:center;color:var(--text-light)\">No harvests recorded</td></tr>`;
    } else {
      records.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
        html += `<tr><td>${new Date(r.date).toLocaleDateString()}</td><td>${r.quantity} ${r.unit}</td><td><span style=\"color:${r.quality==='grade1'||r.quality==='good'?'var(--green-fresh)':r.quality==='grade2'?'var(--blue-water)':r.quality==='grade3'||r.quality==='bad'?'var(--orange-warn)':'var(--red-alert)'}\">${r.quality==='grade1'?'⭐ Grade 1':r.quality==='good'?'✅ Good':r.quality==='grade2'?'⭐⭐ Grade 2':r.quality==='grade3'?'⭐⭐⭐ Grade 3':r.quality==='good'?'✅ Good':r.quality==='bad'?'❌ Bad':'❌ Reject'}</span></td><td>${r.notes||'-'}</td><td><button onclick=\"AdminDashboard.deleteHarvest(${gh.id},${r.id})\" style=\"background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer\">🗑️</button></td></tr>`;
      });
    }
    html += `</tbody></table></div></div>`;
  });
  
  return html;
};

AdminDashboard.openHarvestModal = function(ghId) {
  const gh = AFV.greenhouses.find(g => g.id === ghId);
  const gradePrices = gh?.gradePrices || { grade1: 150, grade2: 120, grade3: 80, reject: 0 };
  
  // Get or create the modal elements
  let modal = document.getElementById('harvest-modal');
  if(!modal) {
    // Create modal if it doesn't exist
    modal = document.createElement('div');
    modal.id = 'harvest-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '1000';
    modal.innerHTML = `<div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:400px;width:90%;margin:auto"><h2 style="color:var(--green-deep);margin:0 0 16px">Record Harvest</h2><form onsubmit="AdminDashboard.saveHarvest(event)"><input type="hidden" id="harvest-gh-id"><input type="hidden" id="harvest-price"><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Quantity</label><div style="display:flex;gap:8px"><input type="number" id="harvest-qty" required placeholder="Amount" step="0.01" style="flex:2;padding:10px"><select id="harvest-unit" style="flex:1;padding:10px"><option value="kg">kg</option><option value="g">grams</option></select></div></div><div style="margin-bottom:12px;padding:10px;background:var(--green-ultra-pale);border-radius:var(--radius-sm)"><div style="font-size:0.85rem;color:var(--text-light)">Estimated Value</div><div style="font-size:1.2rem;font-weight:700;color:var(--green-fresh)" id="harvest-estimated-value">KES 0</div></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Price per kg (KES)</label><input type="number" id="harvest-price-input" required placeholder="Price per kg" style="width:100%;padding:10px"></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Grade</label><select id="harvest-quality" required style="width:100%;padding:10px"></select></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Date</label><input type="date" id="harvest-date" required style="width:100%;padding:10px"></div><div style="margin-bottom:16px"><label style="display:block;margin-bottom:4px;color:var(--text)">Notes</label><textarea id="harvest-notes" placeholder="Optional notes..." style="width:100%;padding:10px;min-height:60px"></textarea></div><div style="display:flex;gap:10px"><button type="button" onclick="AdminDashboard.closeHarvestModal()" class="btn-secondary" style="flex:1">Cancel</button><button type="submit" class="btn-primary" style="flex:1">Save</button></div></form></div>`;
    document.body.appendChild(modal);
  }
  
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

AdminDashboard.saveHarvest = function(e) {
  e.preventDefault();
  const ghId = parseInt(document.getElementById('harvest-gh-id').value);
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
  
  AFV.saveState();
  this.closeHarvestModal();
  this.showPage('harvest');
};

AdminDashboard.deleteHarvest = function(ghId, recordId) {
  if(!confirm('Delete this harvest record?')) return;
  if(AFV.harvest[ghId]) {
    AFV.harvest[ghId] = AFV.harvest[ghId].filter(r => r.id !== recordId);
    AFV.saveState();
    this.showPage('harvest');
  }
}






