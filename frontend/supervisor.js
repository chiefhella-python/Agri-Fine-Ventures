// ============================================
// AGRI-FINE VENTURES — SUPERVISOR DASHBOARD
// ============================================

const SupervisorDashboard = {
  currentPage: 'mygreenhouses',
  pageCache: new Map(),
  lastNavTime: 0,

  // Refresh current page
  async refreshCurrentPage() {
    if (this.currentPage) {
      await this.showPage(this.currentPage);
      console.log('SupervisorDashboard: Refreshed page after remote sync');
    }
  },

  init() {
    try {
      window.SupervisorDashboard = this;
      this.renderNav();
      this.createHarvestModal();
      document.getElementById('supervisor-content').innerHTML = '<div style="text-align:center;padding:40px">Loading greenhouses...</div>';
      // Fetch users from backend to ensure fresh data
      AFV.fetchUsersFromBackend().then(() => {
        this.fetchGreenhouses().then(async () => {
          await this.showPage('mygreenhouses');
        });
      });
    } catch (error) {
      console.error('SupervisorDashboard.init() error:', error);
      // Render a basic error message in the content area
      const content = document.getElementById('supervisor-content');
      if (content) {
        content.innerHTML = `<div style="padding:40px;text-align:center"><h2>Error Loading Dashboard</h2><p>${error.message}</p><button onclick="location.reload()" class="btn-primary">Reload Page</button></div>`;
      }
    }
  },

  async fetchGreenhouses() {
    const greenhouses = await AFV.fetchGreenhouses();
    if (greenhouses && greenhouses.length > 0) {
      console.log('Supervisor loaded greenhouses:', greenhouses.length);
    }
  },

  renderNav() {
    const nav = document.getElementById('supervisor-nav');
    nav.innerHTML = `
      <div class="sidebar-logo">
        <img src="/logo.png" alt="Agri-Fine" style="width:50px;height:50px;object-fit:contain;margin-bottom:6px">
        <div class="sidebar-logo-title">Agri-Fine</div>
        <div class="sidebar-logo-sub">Supervisor</div>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar" style="background:var(--blue-water)">${AFV.currentUser.imageUrl ? `<img src="${AFV.currentUser.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : (AFV.currentUser.avatar || '👨‍🌾')}</div>
        <div>
          <div class="user-name">${AFV.currentUser.name || 'Supervisor'}</div>
          <div class="user-role">Supervisor</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">My Work</div>
        <button class="nav-item active" data-page="mygreenhouses" onclick="SupervisorDashboard.showPage('mygreenhouses')">
          <span class="nav-icon">🏡</span><span>My Greenhouses</span>
        </button>
        <button class="nav-item" data-page="harvest" onclick="SupervisorDashboard.showPage('harvest')">
          <span class="nav-icon">🌾</span><span>Harvest</span>
        </button>
        <button class="nav-item" data-page="sales" onclick="SupervisorDashboard.showPage('sales')">
          <span class="nav-icon">🧾</span><span>Sales & Receipts</span>
        </button>
        <div class="nav-section-label">Task Management</div>
        <button class="nav-item" data-page="pending-tasks" onclick="SupervisorDashboard.showPage('pending-tasks')">
          <span class="nav-icon">⏳</span><span>Pending Tasks</span>
        </button>
        <button class="nav-item" data-page="completed-tasks" onclick="SupervisorDashboard.showPage('completed-tasks')">
          <span class="nav-icon">✅</span><span>Completed Tasks</span>
        </button>
        <button class="nav-item" data-page="create-task" onclick="SupervisorDashboard.showPage('create-task')">
          <span class="nav-icon">➕</span><span>Create Task</span>
        </button>
        <button class="nav-item" data-page="completion-history" onclick="SupervisorDashboard.showPage('completion-history')">
          <span class="nav-icon">📜</span><span>Completion History</span>
        </button>
        <button class="nav-item" data-page="weekly-reports" onclick="SupervisorDashboard.showPage('weekly-reports')">
          <span class="nav-icon">📊</span><span>Weekly Reports</span>
        </button>
        <div class="nav-section-label">Team Management</div>
        <button class="nav-item" data-page="workers" onclick="SupervisorDashboard.showPage('workers')">
          <span class="nav-icon">👥</span><span>My Workers</span>
        </button>
        <button class="nav-item" data-page="assign-tasks" onclick="SupervisorDashboard.showPage('assign-tasks')">
          <span class="nav-icon">📋</span><span>Assign Tasks</span>
        </button>
        <div class="nav-section-label">Resources</div>
        <button class="nav-item" data-page="guide" onclick="SupervisorDashboard.showPage('guide')">
          <span class="nav-icon">📖</span><span>Task Guide</span>
        </button>
        <button class="nav-item" data-page="feeding" onclick="SupervisorDashboard.showPage('feeding')">
          <span class="nav-icon">🧪</span><span>Feeding Program</span>
        </button>
        <button class="nav-item" data-page="tasks" onclick="SupervisorDashboard.showPage('tasks')">
          <span class="nav-icon">📋</span><span>Tasks</span>
        </button>
        <button class="nav-item" data-page="categories" onclick="SupervisorDashboard.showPage('categories')">
          <span class="nav-icon">🏷️</span><span>Categories</span>
        </button>
        <button class="nav-item" data-page="orders" onclick="SupervisorDashboard.showPage('orders')">
          <span class="nav-icon">🌱</span><span>Harvest Orders</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" onclick="handleLogout()">🚪 <span>Sign Out</span></button>
      </div>
    `;
  },

  saveState() {
    this.saveState();
    this.pageCache.clear();
  },

  async showPage(page) {
    // Debounce rapid navigation
    const now = Date.now();
    if (now - this.lastNavTime < 100) return;
    this.lastNavTime = now;
    
    this.currentPage = page;
    document.querySelectorAll('#supervisor-nav .nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`#supervisor-nav [data-page="${page}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById('supervisor-content');
    
    // Cache static pages
    const cachedPages = ['mygreenhouses', 'harvest', 'sales', 'guide', 'workers', 'assign-tasks', 'pending-tasks', 'completed-tasks', 'create-task', 'completion-history', 'weekly-reports', 'feeding', 'tasks', 'categories', 'orders'];
    if (cachedPages.includes(page) && this.pageCache.has(page)) {
      content.innerHTML = this.pageCache.get(page);
      return;
    }
    
    switch(page) {
      case 'mygreenhouses': content.innerHTML = this.renderMyGreenhouses(); this.pageCache.set('mygreenhouses', content.innerHTML); break;
      case 'harvest': content.innerHTML = this.renderHarvest(); this.pageCache.set('harvest', content.innerHTML); break;
      case 'sales': content.innerHTML = this.renderSales(); this.pageCache.set('sales', content.innerHTML); break;
      case 'guide': content.innerHTML = this.renderGuide(); this.pageCache.set('guide', content.innerHTML); break;
      case 'workers': content.innerHTML = await this.renderWorkers(); this.pageCache.set('workers', content.innerHTML); break;
      case 'assign-tasks': content.innerHTML = this.renderAssignTasks(); this.pageCache.set('assign-tasks', content.innerHTML); break;
      case 'pending-tasks': content.innerHTML = this.renderPendingTasks(); this.pageCache.set('pending-tasks', content.innerHTML); break;
      case 'completed-tasks': content.innerHTML = this.renderCompletedTasks(); this.pageCache.set('completed-tasks', content.innerHTML); break;
      case 'create-task': content.innerHTML = this.renderCreateTask(); this.pageCache.set('create-task', content.innerHTML); break;
      case 'completion-history': content.innerHTML = this.renderCompletionHistory(); this.pageCache.set('completion-history', content.innerHTML); break;
      case 'weekly-reports': content.innerHTML = this.renderWeeklyReports(); this.pageCache.set('weekly-reports', content.innerHTML); break;
      case 'feeding': content.innerHTML = this.renderFeeding(); this.pageCache.set('feeding', content.innerHTML); break;
      case 'tasks': content.innerHTML = this.renderTasks(); this.pageCache.set('tasks', content.innerHTML); break;
      case 'categories': content.innerHTML = this.renderCategories(); this.pageCache.set('categories', content.innerHTML); break;
      case 'orders': content.innerHTML = this.renderOrders(); this.pageCache.set('orders', content.innerHTML); break;
    }
  },

  renderMyTasks() {
    const user = AFV.currentUser;
    const tasks = AFV.getTasksForWorker(user.uid);
    const doneTasks = (user.assignedGH || []).reduce((s, ghId) => {
      const gh = AFV.greenhouses.find(g => g.id === ghId);
      return s + (gh ? gh.tasks.filter(t => t.completed).length : 0);
    }, 0);

    const totalTasks = (user.assignedGH || []).reduce((s, ghId) => {
      const gh = AFV.greenhouses.find(g => g.id === ghId);
      return s + (gh ? gh.tasks.length : 0);
    }, 0);

    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">👋 Hello, ${user.name.split(' ')[0]}!</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${new Date().toLocaleDateString('en-KE', {weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div class="header-actions">
          
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div><div class="stat-value">${tasks.length}</div><div class="stat-label">Total Pending Tasks</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div><div class="stat-value">${doneTasks}</div><div class="stat-label">Completed Today/Total</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div><div class="stat-value">${totalTasks>0?Math.round((doneTasks/totalTasks)*100):0}%</div><div class="stat-label">My Progress</div></div>
          </div>
        </div>

        ${AFV.weather ? `
        <div style="background:linear-gradient(135deg,#1e3c72,#2a5298);border-radius:16px;padding:16px;color:white;margin-bottom:16px;position:relative;overflow:hidden">
          <div style="position:absolute;top:-10px;right:-10px;font-size:4rem;opacity:0.15">${AFV.getWeatherEmoji(AFV.weather.current.code)}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:0.7rem;opacity:0.7;text-transform:uppercase">Nairobi Weather</div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:2.5rem;font-weight:700">${AFV.weather.current.temp}°</span>
                <div>
                  <div style="font-size:0.9rem;font-weight:600">${AFV.getWeatherDesc(AFV.weather.current.code)}</div>
                  <div style="font-size:0.7rem;opacity:0.8">Feels ${AFV.weather.current.feelsLike}° · Humidity ${AFV.weather.current.humidity}%</div>
                </div>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:2rem">${AFV.getWeatherEmoji(AFV.weather.current.code)}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.2)">
            ${AFV.weather.daily.slice(1, 5).map(d => {
              const day = new Date(d.date).toLocaleDateString('en-KE', { weekday: 'short' });
              return `<div style="text-align:center;flex:1"><div style="font-size:1rem">${AFV.getWeatherEmoji(d.code)}</div><div style="font-size:0.6rem;opacity:0.8">${day}</div><div style="font-size:0.7rem;font-weight:600">${d.max}°</div></div>`;
            }).join('')}
          </div>
        </div>
        ` : ''}

        ${tasks.length === 0 ? `
          <div class="worker-task-hero">
            <div class="hero-label">Task Status</div>
            <div class="hero-task">🎉 All Tasks Complete!</div>
            <div style="opacity:0.8;font-size:0.9rem;margin-top:8px">You've completed all assigned tasks. Excellent work! Check back for new assignments.</div>
          </div>` : `
          <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px">
            ${tasks.map(({gh, task}, i) => `
              <div class="worker-task-hero" style="background:linear-gradient(135deg,#2a1a1a 0%,#4a2d2d 100%);position:relative">
                <div class="hero-label">
                  ${gh.cropEmoji} ${gh.name}
                </div>
                <div class="hero-gh"><span>${gh.crop}</span></div>
                <div class="hero-task">${task.name}</div>
                <div class="hero-time">⏱ Estimated: ${task.duration} · Priority: <strong style="color:${task.priority==='high'?'#ff7675':task.priority==='medium'?'#fdcb6e':'#55efc4'}">${task.priority.toUpperCase()}</strong></div>
                <div style="margin-top:14px;background:rgba(255,255,255,0.08);border-radius:var(--radius-sm);padding:14px;font-size:0.85rem;line-height:1.6">
                  <div style="font-size:0.72rem;font-weight:700;opacity:0.6;text-transform:uppercase;margin-bottom:6px">📝 Instructions</div>
                  ${escapeHtml(task.desc)}
                </div>
                ${task.blocked ? `
                  <div style="background:rgba(214,48,49,0.2);border:1px solid var(--red-alert);border-radius:var(--radius-sm);padding:12px;margin-bottom:12px">
                    <div style="font-size:0.75rem;font-weight:600;color:var(--red-alert)">🚫 BLOCKED</div>
                    <div style="font-size:0.85rem;margin-top:4px">${task.blockedReason}</div>
                  </div>
                ` : ''}
                ${(task.agronomistNotes && task.agronomistNotes.length > 0) ? `
                  <div style="background:rgba(155,89,182,0.15);border:1px solid #9b59b6;border-radius:var(--radius-sm);padding:12px;margin-bottom:12px">
                    <div style="font-size:0.75rem;font-weight:600;color:#9b59b6">📝 Agronomist Notes</div>
                    ${task.agronomistNotes.map(n => `<div style="font-size:0.8rem;margin-top:6px">${n.note}</div><div style="font-size:0.65rem;color:var(--text-light);margin-top:2px">— ${n.addedBy}</div>`).join('')}
                  </div>
                ` : ''}
                <div style="display:flex;gap:8px;margin-top:12px">
                  ${task.status !== 'in-progress' ? `
                  <button class="btn-secondary" style="flex:1;background:#3498db;color:white;border:none" onclick="SupervisorDashboard.initiateInProgress('${gh.id}', '${task.id}', '${task.name.replace(/'/g,"\\'")}')">
                    ▶️ Start
                  </button>` : ''}
                  <button class="hero-complete-btn" style="flex:1" onclick="SupervisorDashboard.initiateComplete('${gh.id}', '${task.id}', '${task.name.replace(/'/g,"\\'")}')">
                    ✅ Complete
                  </button>
                  <button class="btn-secondary" style="flex:1;background:var(--red-alert);color:white;border:none" onclick="SupervisorDashboard.initiateBlock('${gh.id}', '${task.id}', '${task.name.replace(/'/g,"\\'")}')">
                    🚫 Block
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        ${(user.assignedGH || []).map(ghId => {
          const gh = AFV.greenhouses.find(g => g.id === ghId);
          if (!gh) return '';
          const progress = AFV.getOverallProgress(gh);
          const pending = gh.tasks.filter(t => !t.completed);
          return `
            <div class="card" style="margin-bottom:16px">
              <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
                <div class="${gh.bgClass}" style="width:48px;height:48px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;background-size:cover;background-position:center">${gh.imageUrl ? `<img src="${gh.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm)">` : gh.cropEmoji}</div>
                <div style="flex:1">
                  <div style="font-weight:700;color:var(--green-deep)">${gh.name} — ${gh.crop}</div>
                  <div style="font-size:0.75rem;color:var(--text-light)">${gh.variety} · ${gh.plants.toLocaleString()} plants · ${pending.length} pending</div>
                </div>
                <div style="font-size:1.1rem;font-weight:800;color:var(--green-forest)">${progress}%</div>
              </div>
              <div class="gh-progress-bar" style="margin-bottom:14px">
                <div class="gh-progress-fill" style="width:${progress}%"></div>
              </div>
              <div class="task-list">
                ${gh.tasks.map((t, idx) => `
                  <div class="task-item priority-${t.priority} ${t.completed ? 'completed' : ''}">
                    <div class="task-check ${t.completed ? 'done' : ''}"></div>
                    <div class="task-info">
                      <div class="task-name">${idx+1}. ${t.name}</div>
                      <div class="task-meta">
                        <span>${t.duration}</span>
                        ${t.completed ? `<span style="color:var(--green-fresh)">✅ Done</span>` : idx===0 || gh.tasks.slice(0,idx).every(prev => prev.completed) ? '<span style="color:var(--orange-warn)">⏳ Your turn</span>' : '<span style="color:var(--text-light)">🔒 Waiting for previous</span>'}
                      </div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
      
    `;
  },

  renderMyGreenhouses() {
    const user = AFV.currentUser;
    // Normalize assignedGH: ensure it's an array of ID strings (not objects)
    let assignedGH = user.assignedGH || [];
    if (Array.isArray(assignedGH)) {
      assignedGH = assignedGH.map(item => {
        if (typeof item === 'object' && item !== null) return item.id;
        return item;
      }).filter(Boolean);
    } else {
      assignedGH = [];
    }
    console.log('Rendering MyGreenhouses - assignedGH:', assignedGH);
    console.log('AFV.greenhouses:', AFV.greenhouses);
    
    if (assignedGH.length === 0) {
      return `
        <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
          <div>
            <div class="page-title" style="color:white">My Greenhouses 🏡</div>
            <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Your assigned production units</div>
          </div>
        </div>
        <div class="page-body">
          <div style="text-align:center;padding:40px">
            <div style="font-size:3rem;margin-bottom:16px">🏡</div>
            <div style="font-size:1.1rem;color:var(--text-dark);margin-bottom:8px">No Greenhouses Assigned</div>
            <div style="font-size:0.85rem;color:var(--text-light)">Contact admin to assign greenhouses to your account</div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">My Greenhouses 🏡</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Your assigned production units</div>
        </div>
      </div>
      <div class="page-body">
        ${assignedGH.map(ghId => {
          const gh = AFV.greenhouses.find(g => g.id === ghId);
          if (!gh) return '';
          const plantedDate = gh.plantedDate ? new Date(gh.plantedDate) : null;
          const expectedHarvest = gh.expectedHarvest ? new Date(gh.expectedHarvest) : null;
          const daysPlanted = (gh.ageDays != null) ? gh.ageDays : (plantedDate ? Math.floor((new Date() - plantedDate)/(1000*60*60*24)) : null);
          const daysToHarvest = (gh.daysToHarvest != null) ? gh.daysToHarvest : (expectedHarvest ? Math.ceil((expectedHarvest - new Date())/(1000*60*60*24)) : null);
          
          // Calculate growth stage
          const totalCycle = (expectedHarvest && plantedDate) ? Math.ceil((expectedHarvest - plantedDate) / (1000*60*60*24)) : null;
          const cycleProgress = (totalCycle && daysPlanted != null) ? Math.min(100, Math.round((daysPlanted / totalCycle) * 100)) : 0;
          
          let stage = '🌱 Seedling';
          let stageColor = '#6b8e23';
          if (daysPlanted != null && daysPlanted > 20) { stage = '🌿 Vegetative'; stageColor = '#228b22'; }
          if (daysPlanted != null && daysPlanted > 35) { stage = '🌸 Flowering'; stageColor = '#da70d6'; }
          if (daysPlanted != null && daysPlanted > 50) { stage = '🍅 Fruiting'; stageColor = '#ff6347'; }
          if (totalCycle && daysPlanted != null && daysPlanted >= totalCycle - 7) { stage = '🎯 Harvest Ready'; stageColor = '#ffd700'; }
          
          const expectedMonth = gh.expectedHarvest 
            ? new Date(gh.expectedHarvest).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) 
            : 'Not scheduled';
          
          // Performance score
          const perfScore = AFV.getPerformanceScore(gh);
          const gradeInfo = AFV.getPerformanceGrade(perfScore);
          
          return `
            <div class="card" style="margin-bottom:20px">
              <div style="display:flex;gap:16px;flex-wrap:wrap">
                <div class="${gh.bgClass}" style="width:120px;height:90px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:3rem;flex-shrink:0;background-size:cover;background-position:center">${gh.imageUrl ? `<img src="${gh.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)">` : gh.cropEmoji}</div>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                      <h3 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin-bottom:6px">${gh.name} — ${gh.crop}</h3>
                      <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:10px">${gh.variety} · ${gh.area} · ${gh.plants.toLocaleString()} plants</div>
                    </div>
                    <div style="background:${gradeInfo.color}20;color:${gradeInfo.color};padding:6px 14px;border-radius:20px;font-size:0.85rem;font-weight:700">🏆 ${perfScore} (${gradeInfo.grade})</div>
                  </div>
                  <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div style="background:var(--green-ultra-pale);padding:8px 12px;border-radius:var(--radius-sm);text-align:center">
                      <div style="font-weight:700;color:var(--green-deep)">${gh.plantedDate ? new Date(gh.plantedDate).toLocaleDateString('en-KE', {day:'numeric',month:'short',year:'numeric'}) : '—'}</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">Date Planted</div>
                    </div>
                    <div style="background:var(--green-ultra-pale);padding:8px 12px;border-radius:var(--radius-sm);text-align:center">
                      <div style="font-weight:700;color:${daysToHarvest != null && daysToHarvest < 40 ? 'var(--orange-warn)' : 'var(--green-deep)'}">${gh.expectedHarvest ? new Date(gh.expectedHarvest).toLocaleDateString('en-KE', {day:'numeric',month:'short',year:'numeric'}) : '—'}</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">Harvest Date</div>
                    </div>
                    <div style="background:${stageColor}15;padding:8px 12px;border-radius:var(--radius-sm);text-align:center;border:1px solid ${stageColor}30">
                      <div style="font-weight:700;color:${stageColor};font-size:0.85rem">${stage}</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">Stage</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="margin-top:14px">
                <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-light);margin-bottom:4px">
                  <span>Growth Progress</span>
                  <span>${cycleProgress}%</span>
                </div>
                <div style="background:linear-gradient(90deg,#6b8e23,#228b22,#da70d6,#ff6347,#ffd700);height:6px;border-radius:3px;position:relative">
                  <div style="position:absolute;left:${cycleProgress}%;top:-2px;width:10px;height:10px;background:white;border-radius:50%;border:2px solid ${stageColor};transform:translateX(-50%)"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--text-light);margin-top:2px">
                  <span>🌱</span><span>🌿</span><span>🌸</span><span>🍅</span><span>🎯</span>
                </div>
              </div>
              <div style="margin-top:14px;background:rgba(9,132,227,0.05);border-radius:var(--radius-sm);padding:12px;border-left:3px solid var(--blue-water)">
                <div style="font-size:0.72rem;font-weight:700;color:var(--blue-water);margin-bottom:3px">NOTES FROM MANAGER</div>
                <div style="font-size:0.85rem;color:var(--text-dark)">${escapeHtml(gh.notes)}</div>
              </div>
            </div>`;
        }).join('')}
      </div>
      
    `;
  },

  renderHarvest() {
    const user = AFV.currentUser;
    // Normalize assignedGH: ensure it's an array of ID strings (not objects)
    let assignedGH = user.assignedGH || [];
    if (Array.isArray(assignedGH)) {
      assignedGH = assignedGH.map(item => {
        if (typeof item === 'object' && item !== null) return item.id;
        return item;
      }).filter(Boolean);
    } else {
      assignedGH = [];
    }
    console.log('Supervisor assignedGH:', assignedGH);
    console.log('AFV.greenhouses IDs:', AFV.greenhouses?.map(g => g.id));
    const greenhouses = AFV.greenhouses.filter(g => assignedGH.includes(g.id));
    console.log('Filtered greenhouses:', greenhouses.length);
    const harvest = AFV.harvest || {};
    
    // Ensure modal exists
    if (!document.getElementById('supervisor-harvest-modal')) {
      this.createHarvestModal();
    }
    
    let html = `<div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
      <div>
        <div class="page-title" style="color:white">Harvest 🌾</div>
        <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Track yields for your greenhouses</div>
      </div>
      <div class="header-actions">
        <button class="btn-primary" onclick="SupervisorDashboard.openStandaloneHarvestModal()">+ Add Harvest</button>
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
      const total = goodHarvest + badHarvest;
      
      html += `<div class="card" style="margin-bottom:20px"><h3 style="color:var(--green-deep);margin:0 0 12px">${gh.cropEmoji} ${gh.name} - ${gh.crop}</h3>`;
      html += `<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px"><div class="stat-card"><div class="stat-value">${total.toFixed(2)} ${records[0]?.unit||'kg'}</div><div class="stat-label">Total</div></div><div class="stat-card"><div class="stat-value" style="color:var(--green-fresh)">${goodHarvest.toFixed(2)} ${records[0]?.unit||'kg'}</div><div class="stat-label">Good</div></div><div class="stat-card"><div class="stat-value" style="color:var(--red-alert)">${badHarvest.toFixed(2)} ${records[0]?.unit||'kg'}</div><div class="stat-label">Bad</div></div></div>`;
      html += `<button class="btn-primary" onclick="SupervisorDashboard.openHarvestModal('${gh.id}')">+ Record Harvest</button>`;
      html += `<div class="scroll-x" style="margin-top:12px"><table><thead><tr><th>Date</th><th>Qty</th><th>Quality</th><th>Notes</th><th></th></tr></thead><tbody>`;
      if(records.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No harvests recorded</td></tr>`;
      } else {
        records.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
          html += `<tr><td>${r.date ? new Date(r.date).toLocaleDateString() : '—'}</td><td>${r.quantity} ${r.unit}</td><td><span style="color:${r.quality==='grade1'?'var(--green-fresh)':r.quality==='grade2'?'var(--blue-water)':r.quality==='grade3'?'var(--orange-warn)':'var(--red-alert)'}">${r.quality==='grade1'?'⭐ Grade 1':r.quality==='grade2'?'⭐⭐ Grade 2':r.quality==='grade3'?'⭐⭐⭐ Grade 3':'❌ Reject'}</span></td><td>${r.notes||'-'}</td><td><button onclick="SupervisorDashboard.deleteHarvest('${gh.id}',${r.id})" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">🗑️</button></td></tr>`;
        });
      }
      html += `</tbody></table></div></div>`;
    });
    
    if (greenhouses.length === 0) {
      html += `<div style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:16px">🌾</div><div style="font-size:1.1rem;color:var(--text-dark);margin-bottom:8px">No Greenhouses to Harvest</div><div style="font-size:0.85rem;color:var(--text-light)">Contact admin to assign greenhouses to your account</div></div>`;
    }
    
    html += `</div>`;
    
    return html;
  },

  openHarvestModal(ghId) {
    const gh = AFV.greenhouses.find(g => g.id === ghId);
    const gradePrices = gh?.gradePrices || { grade1: 150, grade2: 120, grade3: 80, reject: 0 };
    const modal = document.getElementById('supervisor-harvest-modal');
    
    // Update greenhouse dropdown and select the specific one
    const user = AFV.currentUser;
    let assignedGH = user.assignedGH || [];
    if (Array.isArray(assignedGH)) {
      assignedGH = assignedGH.map(item => {
        if (typeof item === 'object' && item !== null) return item.id;
        return item;
      }).filter(Boolean);
    } else {
      assignedGH = [];
    }
    const greenhouses = AFV.greenhouses.filter(g => assignedGH.includes(g.id));
    const ghSelect = document.getElementById('supervisor-harvest-gh-select');
    ghSelect.innerHTML = greenhouses.map(g => `<option value="${g.id}">${g.cropEmoji} ${g.name} - ${g.crop || 'Not planted'}</option>`).join('');
    ghSelect.value = ghId;
    
    // Update the quality dropdown with grades
    const qualitySelect = document.getElementById('supervisor-harvest-quality');
    qualitySelect.innerHTML = `<option value="grade1">⭐ Grade 1</option><option value="grade2">⭐⭐ Grade 2</option><option value="grade3">⭐⭐⭐ Grade 3</option><option value="reject">❌ Reject</option>`;
    
    modal.style.display = 'flex';
    document.getElementById('supervisor-harvest-gh-id').value = ghId;
    document.getElementById('supervisor-harvest-quality').value = 'grade1';
    document.getElementById('supervisor-harvest-price').value = gradePrices.grade1;
    document.getElementById('supervisor-harvest-price-input').value = gradePrices.grade1;
    document.getElementById('supervisor-harvest-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('supervisor-harvest-qty').value = '';
    document.getElementById('supervisor-harvest-notes').value = '';
    document.getElementById('supervisor-harvest-unit').value = 'kg';
    if(document.getElementById('supervisor-harvest-estimated-value')) {
      document.getElementById('supervisor-harvest-estimated-value').textContent = 'KES 0';
    }
    
    // Store grade prices for this greenhouse
    modal.dataset.gradePrices = JSON.stringify(gradePrices);
    
    const qtyInput = document.getElementById('supervisor-harvest-qty');
    const priceInput = document.getElementById('supervisor-harvest-price-input');
    const estValue = document.getElementById('supervisor-harvest-estimated-value');
    
    const updateValue = function() {
      const qty = parseFloat(qtyInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      if(estValue) estValue.textContent = 'KES ' + (qty * price).toLocaleString();
    };
    
    qtyInput.oninput = updateValue;
    priceInput.oninput = function() {
      document.getElementById('supervisor-harvest-price').value = this.value;
      updateValue();
    };
    
    // Grade selection (just for recording, doesn't change price)
    qualitySelect.onchange = function() {
      updateValue();
    };
  },

  closeHarvestModal() {
    document.getElementById('supervisor-harvest-modal').style.display = 'none';
  },

  createHarvestModal() {
    if (document.getElementById('supervisor-harvest-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'supervisor-harvest-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '1000';
    modal.innerHTML = `<div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:400px;width:90%;margin:auto"><h2 style="color:var(--green-deep);margin:0 0 16px">Record Harvest</h2><form onsubmit="SupervisorDashboard.saveHarvest(event)"><input type="hidden" id="supervisor-harvest-gh-id"><input type="hidden" id="supervisor-harvest-price"><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Greenhouse</label><select id="supervisor-harvest-gh-select" required style="width:100%;padding:10px"></select></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Quantity</label><div style="display:flex;gap:8px"><input type="number" id="supervisor-harvest-qty" required placeholder="Amount" step="0.01" style="flex:2;padding:10px"><select id="supervisor-harvest-unit" style="flex:1;padding:10px"><option value="kg">kg</option><option value="g">grams</option></select></div></div><div style="margin-bottom:12px;padding:10px;background:var(--green-ultra-pale);border-radius:var(--radius-sm)"><div style="font-size:0.85rem;color:var(--text-light)">Estimated Value</div><div style="font-size:1.2rem;font-weight:700;color:var(--green-fresh)" id="supervisor-harvest-estimated-value">KES 0</div></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Price per kg (KES)</label><input type="number" id="supervisor-harvest-price-input" required placeholder="Price per kg" style="width:100%;padding:10px"></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Grade</label><select id="supervisor-harvest-quality" required style="width:100%;padding:10px"><option value="grade1">⭐ Grade 1</option><option value="grade2">⭐⭐ Grade 2</option><option value="grade3">⭐⭐⭐ Grade 3</option><option value="reject">❌ Reject</option></select></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Date</label><input type="date" id="supervisor-harvest-date" required style="width:100%;padding:10px"></div><div style="margin-bottom:16px"><label style="display:block;margin-bottom:4px;color:var(--text)">Notes</label><textarea id="supervisor-harvest-notes" placeholder="Optional notes..." style="width:100%;padding:10px;min-height:60px"></textarea></div><div style="display:flex;gap:10px"><button type="button" onclick="SupervisorDashboard.closeHarvestModal()" style="flex:1;padding:12px;background:var(--green-ultra-pale);border:none;border-radius:var(--radius-sm);cursor:pointer">Cancel</button><button type="submit" class="btn-primary" style="flex:1;padding:12px">Save Harvest</button></div></form></div></div>`;
    document.body.appendChild(modal);
  },

  openStandaloneHarvestModal() {
    const user = AFV.currentUser;
    let assignedGH = user.assignedGH || [];
    if (Array.isArray(assignedGH)) {
      assignedGH = assignedGH.map(item => {
        if (typeof item === 'object' && item !== null) return item.id;
        return item;
      }).filter(Boolean);
    } else {
      assignedGH = [];
    }
    const greenhouses = AFV.greenhouses.filter(g => assignedGH.includes(g.id));
    const modal = document.getElementById('supervisor-harvest-modal');
    
    // Populate greenhouse dropdown
    const ghSelect = document.getElementById('supervisor-harvest-gh-select');
    ghSelect.innerHTML = greenhouses.map(g => `<option value="${g.id}">${g.cropEmoji} ${g.name} - ${g.crop || 'Not planted'}</option>`).join('');
    
    // Set default values
    const defaultPrices = { grade1: 150, grade2: 120, grade3: 80, reject: 0 };
    document.getElementById('supervisor-harvest-gh-id').value = greenhouses[0]?.id || '';
    document.getElementById('supervisor-harvest-price').value = defaultPrices.grade1;
    document.getElementById('supervisor-harvest-price-input').value = defaultPrices.grade1;
    document.getElementById('supervisor-harvest-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('supervisor-harvest-qty').value = '';
    document.getElementById('supervisor-harvest-notes').value = '';
    document.getElementById('supervisor-harvest-unit').value = 'kg';
    document.getElementById('supervisor-harvest-quality').value = 'grade1';
    document.getElementById('supervisor-harvest-estimated-value').textContent = 'KES 0';
    
    // Set up event listeners
    const qtyInput = document.getElementById('supervisor-harvest-qty');
    const priceInput = document.getElementById('supervisor-harvest-price-input');
    const estValue = document.getElementById('supervisor-harvest-estimated-value');
    const updateValue = function() {
      const qty = parseFloat(qtyInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      estValue.textContent = 'KES ' + (qty * price).toLocaleString();
    };
    qtyInput.oninput = updateValue;
    priceInput.oninput = function() {
      document.getElementById('supervisor-harvest-price').value = this.value;
      updateValue();
    };
    
    modal.style.display = 'flex';
  },

  saveHarvest(e) {
    e.preventDefault();
    let ghId = document.getElementById('supervisor-harvest-gh-id').value;
    // Also check the dropdown if it exists
    const ghSelect = document.getElementById('supervisor-harvest-gh-select');
    if (ghSelect && ghSelect.value) {
      ghId = ghSelect.value;
    }
    
    const quantity = parseFloat(document.getElementById('supervisor-harvest-qty').value);
    const unit = document.getElementById('supervisor-harvest-unit').value;
    const quality = document.getElementById('supervisor-harvest-quality').value;
    const date = document.getElementById('supervisor-harvest-date').value;
    const notes = document.getElementById('supervisor-harvest-notes').value;
    const pricePerKg = parseFloat(document.getElementById('supervisor-harvest-price-input').value) || 0;
    const gh = AFV.greenhouses.find(g => g.id === ghId);
    
    if(!AFV.harvest) AFV.harvest = {};
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
      recordedBy: AFV.currentUser?.name || 'Supervisor',
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
        recordedBy: AFV.currentUser?.name || 'Supervisor',
        recordedAt: new Date().toISOString()
      });
    }
    
    this.saveState();
    this.closeHarvestModal();
    this.showPage('harvest');
  },

  deleteHarvest(ghId, recordId) {
    if(!confirm('Delete this harvest record?')) return;
    if(AFV.harvest[ghId]) {
      AFV.harvest[ghId] = AFV.harvest[ghId].filter(r => r.id !== recordId);
      this.saveState();
      this.showPage('harvest');
    }
  },

  renderHistory() {
    const user = AFV.currentUser;
    const done = (user.assignedGH || []).flatMap(ghId => {
      const gh = AFV.greenhouses.find(g => g.id === ghId);
      return gh ? gh.tasks.filter(t => t.completed && t.completedBy === user.uid).map(t => ({...t, gh})) : [];
    });
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">Task History 📜</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${done.length} tasks completed by you</div>
        </div>
      </div>
      <div class="page-body">
        <div class="card">
          ${done.length === 0 ? '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No completed tasks yet. Go complete your first task!</div></div>' :
            done.map(t => `
              <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--green-ultra-pale)">
                <div style="color:var(--green-fresh);font-size:1.3rem">✅</div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.9rem">${t.name}</div>
                  <div style="font-size:0.75rem;color:var(--text-light)">${t.gh.name} · ${t.gh.crop} · ${t.duration}</div>
                </div>
                <div style="font-size:0.75rem;color:var(--text-light);font-family:'JetBrains Mono',monospace">${t.completedAt?.toLocaleDateString('en-KE') || 'Done'}</div>
              </div>`).join('')}
        </div>
      </div>
      
    `;
  },

  renderSales() {
    const receipts = AFV.receipts || [];
    const supervisorReceipts = receipts.filter(r => r.recordedBy === 'supervisor' || r.role === 'supervisor');
    const totalSales = supervisorReceipts.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a472a,#2d6a4f);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🧾 Sales & Receipts</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Record and track all sales transactions</div>
        </div>
        <div class="header-actions">
          <div style="background:rgba(255,255,255,0.15);padding:8px 16px;border-radius:20px;font-size:0.85rem">
            <span style="opacity:0.7">Total:</span> 
            <strong>KES ${totalSales.toLocaleString()}</strong>
          </div>
        </div>
      </div>
      <div class="page-body">
        <!-- Add New Receipt Form -->
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,#f8fff8,#e8f5e9);border:2px solid var(--green-fresh)">
          <div style="font-weight:700;font-size:1.1rem;margin-bottom:16px;color:var(--green-forest)">📝 Record New Sale</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
            <div class="input-group" style="margin:0">
              <label style="font-size:0.8rem;color:var(--text-light)">Product/Item Sold</label>
              <input type="text" id="receipt-product" placeholder="e.g., Tomatoes, Cucumbers..." style="background:white;border:1px solid var(--green-pale)">
            </div>
            <div class="input-group" style="margin:0">
              <label style="font-size:0.8rem;color:var(--text-light)">Amount (KES)</label>
              <input type="number" id="receipt-amount" placeholder="0.00" min="0" step="0.01" style="background:white;border:1px solid var(--green-pale)">
            </div>
            <div class="input-group" style="margin:0">
              <label style="font-size:0.8rem;color:var(--text-light)">Transaction Code</label>
              <input type="text" id="receipt-transaction-code" placeholder="e.g., M-Pesa code" style="background:white;border:1px solid var(--green-pale)">
            </div>
            <div class="input-group" style="margin:0">
              <label style="font-size:0.8rem;color:var(--text-light)">Date</label>
              <input type="date" id="receipt-date" value="${new Date().toISOString().split('T')[0]}" style="background:white;border:1px solid var(--green-pale)">
            </div>
            <div class="input-group" style="margin:0">
              <label style="font-size:0.8rem;color:var(--text-light)">Customer (Optional)</label>
              <input type="text" id="receipt-customer" placeholder="Customer name" style="background:white;border:1px solid var(--green-pale)">
            </div>
          </div>
          <div style="margin-top:12px">
            <label style="font-size:0.8rem;color:var(--text-light)">Receipt Image (Optional)</label>
            <input type="file" id="receipt-image" accept="image/*" style="width:100%;padding:10px;background:white;border:1px solid var(--green-pale);border-radius:6px">
          </div>
          <button onclick="SupervisorDashboard.addReceipt()" class="btn-primary" style="margin-top:16px;width:100%;background:linear-gradient(135deg,var(--green-forest),var(--green-fresh))">
            💾 Save Receipt
          </button>
        </div>
        
        <!-- Receipts List -->
        <div class="card">
          <div style="font-weight:700;font-size:1.1rem;margin-bottom:16px;color:var(--green-forest)">📋 Recorded Receipts <span style="font-size:0.8rem;font-weight:400;color:var(--text-light)">(${supervisorReceipts.length} receipts)</span></div>
          ${supervisorReceipts.length === 0 ? 
            '<div class="empty-state"><div class="empty-icon">🧾</div><div class="empty-text">No receipts recorded yet. Use the form above to record your first sale!</div></div>' :
            supervisorReceipts.map(r => `
              <div style="display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid var(--green-ultra-pale);background:${r.isAdmin ? 'linear-gradient(90deg,rgba(155,89,182,0.05),transparent)' : 'white'}">
                ${r.imageUrl ? `<img src="${r.imageUrl}" style="width:48px;height:48px;border-radius:8px;object-fit:cover" onclick="SupervisorDashboard.viewReceiptImage('${r.id}')">` : `<div style="width:48px;height:48px;background:linear-gradient(135deg,${r.isAdmin ? '#9b59b6' : 'var(--green-fresh)'},${r.isAdmin ? '#8e44ad' : 'var(--green-forest)'});border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:white">🧾</div>`}
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.95rem">${escapeHtml(r.product)}</div>
                  <div style="font-size:0.75rem;color:var(--text-light)">
                    ${r.customer ? '👤 ' + r.customer + ' · ' : ''}${r.date} · Recorded by ${r.isAdmin ? 'Admin' : 'Supervisor'}
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700;font-size:1.1rem;color:var(--green-forest);font-family:'JetBrains Mono',monospace">KES ${parseFloat(r.amount).toLocaleString()}</div>
                  <div style="font-size:0.7rem;color:var(--text-light)">${r.transactionCode ? '🔢 ' + r.transactionCode + ' · ' : ''}${r.recordedAt}</div>
                </div>
                <div style="color:var(--green-fresh);font-size:1rem" title="Cannot be removed">🔒</div>
              </div>`).join('')
          }
        </div>
      </div>
      <div id="supervisor-receipt-view-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center" onclick="if(event.target === this) this.style.display='none'">
        <div style="max-width:90%;max-height:90vh"><img id="supervisor-receipt-view-image" style="max-width:100%;max-height:90vh;border-radius:8px"></div>
      </div>
    `;
  },

  addReceipt() {
    const product = document.getElementById('receipt-product').value.trim();
    const amount = document.getElementById('receipt-amount').value.trim();
    const date = document.getElementById('receipt-date').value;
    const customer = document.getElementById('receipt-customer').value.trim();
    const transactionCode = document.getElementById('receipt-transaction-code').value.trim();
    const imageInput = document.getElementById('receipt-image');
    
    if (!product || !amount || !date) {
      showToast('Please fill in product, amount, and date', 'error');
      return;
    }
    
    const receiptAmount = parseFloat(amount);
    
    // Handle image upload
    let imageUrl = '';
    if (imageInput && imageInput.files && imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imageUrl = e.target.result;
        saveReceiptWithImage();
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      saveReceiptWithImage();
    }
    
    function saveReceiptWithImage() {
      // Save to receipts array (for supervisor view)
      if (!AFV.receipts) AFV.receipts = [];
      const receipt = {
        id: Date.now(),
        product,
        amount: receiptAmount,
        date,
        customer: customer || 'Walk-in Customer',
        transactionCode: transactionCode || '',
        recordedBy: 'supervisor',
        role: 'supervisor',
        recordedAt: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        imageUrl: imageUrl
      };
      AFV.receipts.push(receipt);
      
      // Also save to revenue array (for admin view)
      if (!AFV.revenue) AFV.revenue = [];
      AFV.revenue.push({
        id: Date.now() + 1,
        date: date,
        source: 'Supervisor Sales',
        product: product,
        amount: receiptAmount,
        recordedBy: 'supervisor',
        customer: customer || 'Walk-in Customer',
        transactionCode: transactionCode || '',
        imageUrl: imageUrl
      });
      
      this.saveState();
      AFV.logActivity('🧾', `Sale recorded: ${product} - KES ${receiptAmount.toLocaleString()}`);
      
      showToast('Receipt saved successfully!', 'success');
      SupervisorDashboard.showPage('sales');
    }
  },

  viewReceiptImage(id) {
    const receipt = AFV.receipts.find(r => r.id == id);
    if (!receipt || !receipt.imageUrl) return;
    document.getElementById('supervisor-receipt-view-image').src = receipt.imageUrl;
    document.getElementById('supervisor-receipt-view-modal').style.display = 'flex';
  },

  renderGuide() {
    const tips = [
      { icon: '🍅', title: 'Tomato Training', body: 'Always train tomatoes to a single stem. Remove all lateral shoots (suckers) that emerge between the main stem and leaf petioles. This directs energy to fruit production.' },
      { icon: '💧', title: 'Irrigation Best Practice', body: 'Water early morning (6–8am) to reduce evaporation. Check soil moisture at 10cm depth — should feel like a wrung-out sponge. Never let media dry completely.' },
      { icon: '🌿', title: 'Fertilizer Application', body: 'Always dissolve fertilizers completely before application. Mix in a clean bucket first. Apply through drip (fertigation) for even distribution. Never fertilize stressed plants.' },
      { icon: '🐛', title: 'Pest Identification', body: 'Check undersides of leaves. Spider mites cause silver speckling. Whitefly adults fly up when disturbed. Thrips cause silvery streaks. Report any unusual findings immediately.' },
      { icon: '✂️', title: 'Pruning Safety', body: 'Always use clean, sharp scissors. Disinfect tools with 70% alcohol between plants to prevent disease spread. Cut at 45° angle. Remove cut material from greenhouse immediately.' },
      { icon: '🧪', title: 'Foliar Spraying', body: 'Spray early morning or late evening — never in direct sunlight. Cover both leaf surfaces. Use correct concentration. Add spreader-sticker (Silwet) for better adhesion.' },
    ];
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">Task Guide 📖</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Best practices for field operations</div>
        </div>
      </div>
      <div class="page-body">
        <div class="greenhouses-grid">
          ${tips.map(t => `
            <div class="card" style="border:1px solid var(--green-pale)">
              <div style="font-size:2rem;margin-bottom:10px">${t.icon}</div>
              <div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--green-deep);margin-bottom:8px">${t.title}</div>
              <div style="font-size:0.85rem;color:var(--text-mid);line-height:1.6">${t.body}</div>
            </div>`).join('')}
        </div>
        
      </div>
      
    `;
  },

  renderFeeding() {
    const user = AFV.currentUser;
    const assignedGH = (user.assignedGH || []).map(id => AFV.greenhouses.find(g => g.id === id)).filter(Boolean);
    const hasCalendar = !!AFV.feedingProgram.calendarStartDate;
    
    // Get current week number - use calendar if available
    let currentWeek = hasCalendar ? AFV.getCalendarCurrentWeek() : 1;
    const currentCycle = AFV.getCurrentCalendarCycle();
    const weekDates = AFV.getCalendarWeekDates(currentWeek);
    
    // Get today's date info
    const today = new Date();
    const dayName = today.toLocaleDateString('en-KE', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
    
    let oldestGH = null;
    let hasPlantedGH = false;
    if (assignedGH.length > 0) {
      assignedGH.forEach(gh => {
        const week = hasCalendar ? AFV.getCalendarCurrentWeek() : AFV.getCurrentWeek(gh.plantedDate);
        if (week > currentWeek) {
          currentWeek = week;
          oldestGH = gh;
        }
        if (gh.plantedDate) {
          hasPlantedGH = true;
        }
      });
    }
    
    // Fallback if no calendar and no planted
    if (!hasCalendar && !hasPlantedGH) {
      currentWeek = 1;
    }
    
    const schedule = AFV.getWeekSchedule(currentWeek);
    const skipWeeks = AFV.feedingProgram.skipWeeks;
    const isSkippedWeek = skipWeeks.includes(currentWeek);
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🧪 Feeding Program</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${hasCalendar ? `Cycle ${currentCycle} · Week ${currentWeek} of 34-week schedule` : 'Fertilizer schedule for your greenhouses'}</div>
        </div>
        <div class="header-actions">
          ${hasCalendar ? `
            <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="SupervisorDashboard.showFeedingCalendar()">🗓️ Calendar</button>
          ` : ''}
          <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;margin-left:10px;text-align:center;cursor:pointer" onclick="${hasCalendar ? 'SupervisorDashboard.showFeedingCalendar()' : ''}">
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.7)">${dayName}</div>
            <div style="font-size:0.9rem;font-weight:700">${dateStr}</div>
          </div>
        </div>
      </div>
      <div class="page-body">
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,var(--green-ultra-pale),white)">
          <div style="text-align:center;padding:10px">
            <div style="font-size:0.75rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px">${hasCalendar ? `Cycle ${currentCycle}` : 'Current Week'}</div>
            <div style="font-size:3rem;font-weight:900;color:var(--green-deep)">${currentWeek}</div>
            <div style="font-size:0.85rem;color:var(--text-mid)">of 34-week program${hasCalendar && currentCycle > 1 ? ` (Cycle ${currentCycle})` : ''}</div>
            ${weekDates ? `<div style="font-size:0.75rem;color:var(--text-light);margin-top:4px">${weekDates.startStr} - ${weekDates.endStr}</div>` : ''}
            ${!hasCalendar && !hasPlantedGH ? '<div style="margin-top:8px;padding:6px 12px;background:rgba(214,48,49,0.1);color:var(--red-alert);border-radius:20px;font-size:0.8rem;font-weight:600">⚠️ No planted greenhouses</div>' : ''}
            ${isSkippedWeek ? '<div style="margin-top:8px;padding:6px 12px;background:rgba(214,48,49,0.1);color:var(--red-alert);border-radius:20px;font-size:0.8rem;font-weight:600">⚠️ Skip Week - No Ca/K</div>' : ''}
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="section-title">🌱 This Week's Fertilizers</div>
          <div style="font-size:0.85rem;color:var(--text-light);margin-bottom:16px">
            Apply the following fertilizers to all assigned greenhouses this week:
          </div>
          
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
            ${schedule.fertilizers.map(f => `
              <div style="background:${f.type === 'weekly' ? 'var(--green-ultra-pale)' : 'rgba(9,132,227,0.06)'};padding:16px;border-radius:var(--radius-sm);border-left:4px solid ${f.type === 'weekly' ? 'var(--green-deep)' : 'var(--blue-water)'}">
                <div style="font-weight:700;font-size:1.1rem;color:var(--text-dark)">${f.name}</div>
                <div style="font-size:1.5rem;font-weight:800;color:var(--green-deep);margin:8px 0">${f.amount} <span style="font-size:0.9rem;font-weight:400;color:var(--text-light)">${f.unit}</span></div>
                <div style="font-size:0.7rem;color:var(--text-light);text-transform:uppercase">${f.type === 'weekly' ? 'Every week' : 'This week'}</div>
              </div>
            `).join('')}
            ${isSkippedWeek ? `
              <div style="grid-column:span 2;background:rgba(214,48,49,0.06);padding:14px;border-radius:var(--radius-sm);border-left:4px solid var(--red-alert)">
                <div style="font-weight:700;color:var(--red-alert);margin-bottom:6px">⏭️ Skipped This Week</div>
                <div style="font-size:0.85rem;color:var(--text-mid)">Calcium Carbonate and Potassium Sulphate are not applied during weeks ${skipWeeks.join(', ')}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="card">
          <div class="section-title">🏡 Your Assigned Greenhouses</div>
          ${assignedGH.length === 0 ? '<div class="empty-state"><div class="empty-icon">🏡</div><div class="empty-text">No greenhouses assigned yet.</div></div>' : 
            assignedGH.map(gh => {
              const week = hasCalendar ? AFV.getCalendarCurrentWeek() : AFV.getCurrentWeek(gh.plantedDate);
              return `
                <div style="padding:14px;border-bottom:1px solid var(--green-pale);display:flex;justify-content:space-between;align-items:center">
                  <div>
                    <div style="font-weight:700;color:var(--green-deep)">${gh.cropEmoji} ${gh.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-light)">${gh.crop} · ${gh.variety}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-weight:700;color:var(--blue-water)">Week ${week}</div>
                    <div style="font-size:0.7rem;color:var(--text-light)">${gh.plantedDate && !hasCalendar ? 'Planted ' + Math.floor((new Date() - new Date(gh.plantedDate))/(1000*60*60*24)) + ' days ago' : (hasCalendar ? `Cycle ${currentCycle}` : 'Not planted')}</div>
                  </div>
                </div>
              `;
            }).join('')
          }
        </div>

        <div class="card" style="margin-top:20px">
          <div class="section-title">📋 Program Details</div>
          <div style="font-size:0.85rem;color:var(--text-mid);line-height:1.7">
            <div style="margin-bottom:10px"><strong>N.P.K</strong> and <strong>Magnesium Sulphate</strong> are applied every week (1-34).</div>
            <div><strong>Calcium Carbonate</strong> and <strong>Potassium Sulphate</strong> are skipped in weeks: <strong>${skipWeeks.join(', ')}</strong></div>
          </div>
        </div>
      </div>
      
    `;
  },

  initiateComplete(ghId, taskId, taskName) {
    AFV.pendingTaskComplete = { ghId, taskId };
    document.getElementById('task-modal-title').textContent = 'Complete Task?';
    document.getElementById('task-modal-msg').textContent = `Are you sure you have fully completed "${taskName}"? This will unlock the next task in the queue.`;
    document.getElementById('task-modal').style.display = 'flex';
  },

  initiateBlock(ghId, taskId, taskName) {
    AFV.pendingTaskComplete = { ghId, taskId };
    document.getElementById('block-reason').value = '';
    document.getElementById('block-task-modal').style.display = 'flex';
  },

  initiateInProgress(ghId, taskId, taskName) {
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    if (gh) {
      const task = gh.tasks.find(t => t.id == taskId || t.id === taskId);
      if (task) {
        task.status = 'in-progress';
        task.startedAt = new Date().toISOString();
        AFV.logActivity('▶️', `Task "${task.title || task.name}" started in ${gh.name}`);
        this.saveState();
        showToast('Task marked as In Progress!', 'success');
        this.showPage('pending-tasks');
      }
    }
  },

  // ============================================ WORKERS MANAGEMENT (Database backed)
  // Supervisor: Can view all workers, add new workers (cannot edit/delete)

  workersData: [],

  loadWorkers: async function() {
    try {
      this.workersData = await AFV_API.getWorkers();
    } catch (e) {
      console.error('Failed to load workers:', e);
      this.workersData = [];
    }
  },

  renderWorkers: async function() {
    await this.loadWorkers();
    const workers = Array.isArray(this.workersData) ? this.workersData : [];
    
    return `
      <div class="page-header">
        <div>
          <div class="page-title">All Workers 👥</div>
          <div class="page-subtitle">View worker details, salary & transactions</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" onclick="SupervisorDashboard.openWorkerModal()">➕ Add Worker</button>
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
          </div>
        `).join('')}
      </div>
      ${this.getWorkerModalHtml()}
    `;
  },

  getWorkerModalHtml: function() {
    return `
      <div id="supervisor-worker-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">
        <div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:500px;width:90%;max-height:90vh;overflow-y:auto">
          <h2 style="font-family:'Playfair Display',serif;color:var(--blue-deep);margin:0 0 20px" id="supervisor-worker-modal-title">Add Worker</h2>
          <form onsubmit="SupervisorDashboard.saveWorker(event)">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Name *</label>
              <input type="text" id="supervisor-worker-name" required style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Full name">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Phone</label>
              <input type="tel" id="supervisor-worker-phone" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., 0712345678">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Email</label>
              <input type="email" id="supervisor-worker-email" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="email@example.com">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Salary (KES)</label>
                <input type="number" id="supervisor-worker-salary" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="0" min="0">
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Salary Paid (KES)</label>
                <input type="number" id="supervisor-worker-salary-paid" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="0" min="0">
              </div>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Transaction Code</label>
              <input type="text" id="supervisor-worker-txn" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., TXN123456">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Role</label>
              <select id="supervisor-worker-role" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                <option value="worker">Worker</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Notes</label>
              <textarea id="supervisor-worker-notes" style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem;min-height:60px" placeholder="Additional notes..."></textarea>
            </div>
            <div style="display:flex;gap:10px">
              <button type="button" onclick="SupervisorDashboard.closeWorkerModal()" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
              <button type="submit" style="flex:1;padding:12px;background:var(--blue-water);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  openWorkerModal: function() {
    // Supervisor can only ADD new workers (no edit functionality)
    if (!document.getElementById('supervisor-worker-modal')) {
      const div = document.createElement('div');
      div.innerHTML = this.getWorkerModalHtml();
      document.body.appendChild(div.firstElementChild);
    }
    
    // Reset form
    document.getElementById('supervisor-worker-modal-title').textContent = 'Add Worker';
    document.getElementById('supervisor-worker-name').value = '';
    document.getElementById('supervisor-worker-phone').value = '';
    document.getElementById('supervisor-worker-email').value = '';
    document.getElementById('supervisor-worker-salary').value = 0;
    document.getElementById('supervisor-worker-salary-paid').value = 0;
    document.getElementById('supervisor-worker-txn').value = '';
    document.getElementById('supervisor-worker-role').value = 'worker';
    document.getElementById('supervisor-worker-notes').value = '';
    
    document.getElementById('supervisor-worker-modal').style.display = 'flex';
  },

  closeWorkerModal: function() {
    const modal = document.getElementById('supervisor-worker-modal');
    if (modal) modal.style.display = 'none';
  },

  saveWorker: async function(e) {
    e.preventDefault();
    
    const data = {
      name: document.getElementById('supervisor-worker-name').value.trim(),
      phone: document.getElementById('supervisor-worker-phone').value.trim(),
      email: document.getElementById('supervisor-worker-email').value.trim(),
      salary: parseFloat(document.getElementById('supervisor-worker-salary').value) || 0,
      salary_paid: parseFloat(document.getElementById('supervisor-worker-salary-paid').value) || 0,
      transaction_code: document.getElementById('supervisor-worker-txn').value.trim(),
      role: document.getElementById('supervisor-worker-role').value,
      notes: document.getElementById('supervisor-worker-notes').value.trim()
    };
    
    try {
      await AFV_API.createWorker(data);
      showToast('Worker added!', 'success');
    } catch (err) {
      console.error('Save worker error:', err);
      showToast('Failed to add worker', 'error');
    }
    
    this.closeWorkerModal();
    this.showPage('workers');
  },

  // Supervisor cannot delete workers - only Admin can
  // ============================================ ASSIGN TASKS

  renderAssignTasks() {
    const workers = AFV.workers || [];
    const greenhouses = AFV.greenhouses || [];
    
    // Get unassigned tasks only that need to be assigned
    const allTasks = [];
    greenhouses.forEach(gh => {
      gh.tasks.filter(t => !t.completed && !t.assignedTo).forEach(task => {
        allTasks.push({ gh, task });
      });
    });
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">Assign Tasks 📋</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Assign unassigned tasks to workers</div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="SupervisorDashboard.showPage('pending-tasks')">View All Pending →</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);gap:10px">
          <div class="stat-card" style="padding:12px"><div class="stat-icon" style="font-size:1.2rem">👥</div><div><div class="stat-value" style="font-size:1.2rem">${workers.length}</div><div class="stat-label" style="font-size:0.65rem">Workers</div></div></div>
          <div class="stat-card" style="padding:12px"><div class="stat-icon" style="font-size:1.2rem">📋</div><div><div class="stat-value" style="font-size:1.2rem">${allTasks.length}</div><div class="stat-label" style="font-size:0.65rem">Unassigned</div></div></div>
          <div class="stat-card" style="padding:12px"><div class="stat-icon" style="font-size:1.2rem">✅</div><div><div class="stat-value" style="font-size:1.2rem">${greenhouses.reduce((s, gh) => s + gh.tasks.filter(t => t.completed).length, 0)}</div><div class="stat-label" style="font-size:0.65rem">Done</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title" style="font-size:0.95rem">⏳ Tasks Needing Assignment (${allTasks.length})</div>
          ${allTasks.length === 0 ? '<div style="padding:30px;text-align:center"><div style="font-size:2rem">🎉</div><div style="font-size:1rem;color:var(--text-dark);margin-top:10px">All tasks are assigned!</div></div>' : `
          <!-- Desktop Table View -->
          <div class="scroll-x" style="display:block">
            <table class="desktop-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Duration</th>
                  <th>Priority</th>
                  <th>Assign To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allTasks.map(({gh, task}) => {
                  return `
                    <tr>
                      <td><div style="font-weight:600;font-size:0.85rem">${task.name}</div><div style="font-size:0.65rem;color:var(--text-light)">${task.desc?.substring(0,40)}...</div></td>
                      <td style="font-size:0.8rem">${gh.cropEmoji} ${gh.name}</td>
                      <td style="font-size:0.8rem">${task.duration}</td>
                      <td><span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}" style="font-size:0.65rem">${task.priority}</span></td>
                      <td>
                        <select id="assign-worker-${gh.id}-${task.id}" style="padding:6px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.75rem;min-width:100px">
                          <option value="">Select Worker</option>
                          ${workers.map(w => `<option value="${w.uid}">${w.name}</option>`).join('')}
                        </select>
                      </td>
                      <td>
                        <button onclick="SupervisorDashboard.assignTask('${gh.id}', '${task.id}')" style="padding:6px 12px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">Assign</button>
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Mobile Card View -->
          <div class="mobile-cards" style="display:none">
            ${allTasks.map(({gh, task}) => {
              const assignedTo = task.assignedTo ? AFV.workers.find(w => w.uid === task.assignedTo) : null;
              return `
                <div style="background:var(--green-ultra-pale);border-radius:8px;padding:12px;margin-bottom:10px;border-left:3px solid ${task.priority==='high'?'var(--red-alert)':task.priority==='medium'?'var(--orange-warn)':'var(--green-fresh)'}">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                    <div style="flex:1">
                      <div style="font-weight:600;font-size:0.9rem;color:var(--green-deep)">${task.name}</div>
                      <div style="font-size:0.7rem;color:var(--text-light)">${gh.cropEmoji} ${gh.name} · ${task.duration}</div>
                    </div>
                    <span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}" style="font-size:0.6rem">${task.priority}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="font-size:0.7rem;color:var(--text-light)">Unassigned</span>
                    <div style="display:flex;gap:4px;align-items:center">
                      <select id="assign-worker-mobile-${gh.id}-${task.id}" style="padding:6px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.75rem;width:90px">
                        <option value="">Worker</option>
                        ${workers.map(w => `<option value="${w.uid}">${w.name}</option>`).join('')}
                      </select>
                      <button onclick="SupervisorDashboard.assignTask('${gh.id}', '${task.id}')" style="padding:6px 10px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">Assign</button>
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>`}
        </div>
        
        <div class="card" style="margin-top:16px;background:linear-gradient(135deg,#fff8e8,#fff3cd);border:2px solid #f0ad4e">
          <div class="section-title" style="font-size:0.9rem;margin-bottom:12px;color:#8a6d3b">➕ Add New Task</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <select id="add-task-gh" style="padding:10px;border-radius:6px;border:1px solid #ddd;font-size:0.85rem">
              <option value="">Select Greenhouse</option>
              ${greenhouses.map(gh => `<option value="${gh.id}">${gh.cropEmoji} ${gh.name}</option>`).join('')}
            </select>
            <input type="text" id="add-task-name" placeholder="Task name..." style="padding:10px;border-radius:6px;border:1px solid #ddd;font-size:0.85rem">
            <input type="text" id="add-task-desc" placeholder="Task description..." style="padding:10px;border-radius:6px;border:1px solid #ddd;font-size:0.85rem">
            <div style="display:flex;gap:8px">
              <select id="add-task-priority" style="padding:10px;border-radius:6px;border:1px solid #ddd;font-size:0.85rem;flex:1">
                <option value="high">🔴 High Priority</option>
                <option value="medium" selected>🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
              <select id="add-task-duration" style="padding:10px;border-radius:6px;border:1px solid #ddd;font-size:0.85rem;flex:1">
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="5 hours">5 hours</option>
                <option value="6 hours">6 hours</option>
                <option value="8 hours">8 hours</option>
              </select>
            </div>
            <button onclick="SupervisorDashboard.addNewTask()" style="padding:12px;background:linear-gradient(135deg,#f0ad4e,#ec971f);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.9rem;font-weight:600">➕ Add Task</button>
          </div>
        </div>
        
        <style>
          @media (max-width: 768px) {
            .desktop-table { display: none !important; }
            .mobile-cards { display: block !important; }
            .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
        </style>
      </div>
    `;
  },

  assignTask(ghId, taskId) {
    // Try desktop first, then mobile
    let select = document.getElementById(`assign-worker-${ghId}-${taskId}`);
    if (!select) select = document.getElementById(`assign-worker-mobile-${ghId}-${taskId}`);
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
      task.assignedBy = 'supervisor';
      task.verified = false;
      AFV.logActivity('📋', `Task "${task.title || task.name}" assigned to worker`);
      showToast('Task assigned successfully!', 'success');
      this.showPage('assign-tasks');
    }
  },

  verifyTask(ghId, taskId) {
    const comment = prompt('Add verification comment (optional):');
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    const task = gh?.tasks.find(t => t.id === taskId || t.id == taskId);
    
    if (gh && task) {
      task.completed = true;
      task.completedAt = new Date();
      task.verified = true;
      task.verifiedBy = AFV.currentUser.name;
      task.verificationComment = comment || '';
      AFV.logActivity('✅', `Task "${task.title || task.name}" verified by supervisor`);
      showToast('Task verified and completed!', 'success');
      this.showPage('assign-tasks');
    }
  },

  addComment() {
    const ghId = document.getElementById('comment-gh').value;
    const taskId = document.getElementById('comment-task').value;
    const comment = document.getElementById('comment-text').value.trim();
    
    if (!ghId || !taskId || !comment) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    const task = gh?.tasks.find(t => t.id === taskId || t.id == taskId);
    
    if (gh && task) {
      task.comment = comment;
      task.commentBy = AFV.currentUser.name;
      task.commentAt = new Date();
      AFV.logActivity('💬', `Comment added to "${task.title || task.name}": ${comment}`);
      showToast('Comment added!', 'success');
      this.showPage('assign-tasks');
    }
  },

  addNewTask() {
    const ghId = document.getElementById('add-task-gh')?.value;
    const name = document.getElementById('add-task-name')?.value?.trim();
    const desc = document.getElementById('add-task-desc')?.value?.trim();
    const priority = document.getElementById('add-task-priority')?.value || 'medium';
    const duration = document.getElementById('add-task-duration')?.value || '2 hours';
    
    if (!ghId || !name) {
      showToast('Please select greenhouse and enter task name', 'error');
      return;
    }
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    if (!gh) {
      showToast('Greenhouse not found', 'error');
      return;
    }
    
    const newTask = {
      id: 'task_' + Date.now(),
      title: name,
      desc: desc || '',
      category: 'general',
      priority: priority,
      duration: duration,
      completed: false,
      addedBy: AFV.currentUser.name,
      addedByRole: 'supervisor',
      addedAt: new Date()
    };
    
    gh.tasks.push(newTask);
    this.saveState();
    AFV.logActivity('➕', `Supervisor added task "${name}" to ${gh.name}`);
    
    showToast('Task added successfully! Admin will be notified.', 'success');
    this.showPage('assign-tasks');
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
    
    const content = document.getElementById('supervisor-content');
    content.innerHTML = `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🗓️ Feeding Calendar</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">34-week cycle calendar with notes · Currently Week ${currentWeek} (Cycle ${currentCycle})</div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="SupervisorDashboard.showPage('feeding')">← Back</button>
        </div>
      </div>
      <div class="page-body">
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(45,74,110,0.2),rgba(45,74,110,0.1));border:2px solid var(--blue-water)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
            <div>
              <div class="section-title" style="color:var(--blue-water)">📅 Current: Week ${currentWeek}, Cycle ${currentCycle}</div>
              <div style="font-size:0.85rem;color:var(--text-mid)">${currentWeek === 34 ? 'Final week - cycle will restart soon!' : `${34 - currentWeek} weeks remaining in current cycle`}</div>
            </div>
            <div style="display:flex;gap:10px">
              <div style="text-align:center;padding:8px 16px;background:var(--blue-water);color:white;border-radius:var(--radius-sm)">
                <div style="font-size:1.5rem;font-weight:800">${currentWeek}</div>
                <div style="font-size:0.6rem">WEEK</div>
              </div>
              <div style="text-align:center;padding:8px 16px;background:rgba(45,74,110,0.2);color:var(--blue-water);border-radius:var(--radius-sm)">
                <div style="font-size:1.5rem;font-weight:800">${currentCycle}</div>
                <div style="font-size:0.6rem">CYCLE</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom:20px">
          <div class="section-title" style="color:var(--blue-water)">📝 Calendar Notes</div>
        </div>
        
        ${[1, 2].map(cycle => `
          <div style="margin-bottom:30px">
            <div class="section-title" style="color:var(--blue-water);border-bottom:2px solid var(--blue-water);padding-bottom:8px;margin-bottom:16px">Cycle ${cycle}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
              ${weeks.filter(w => w.cycle === cycle).map(w => {
                const isCurrent = w.weekNum === currentWeek && w.cycle === currentCycle;
                const isSkipped = skipWeeks.includes(w.weekNum);
                return `
                  <div class="card" style="border:${isCurrent ? '2px solid var(--blue-water)' : '1px solid rgba(45,74,110,0.2)'};${isCurrent ? 'background:linear-gradient(135deg,rgba(45,74,110,0.1),white)' : ''}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <div style="font-weight:700;color:var(--blue-water)">Week ${w.weekNum}</div>
                      <div style="font-size:0.7rem;color:var(--text-light)">${w.startStr} - ${w.endStr}</div>
                    </div>
                    ${isSkipped ? '<div style="font-size:0.7rem;color:var(--red-alert);margin-bottom:6px">⏭️ Skip Week</div>' : ''}
                    ${w.note ? `
                      <div style="font-size:0.75rem;color:var(--text-mid);background:rgba(45,74,110,0.08);padding:8px;border-radius:4px;margin-top:6px">
                        <strong>📝 Note:</strong> ${w.note.note}
                      </div>
                    ` : `
                      <div style="font-size:0.7rem;color:var(--text-light)">No notes</div>
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

  renderPendingTasks() {
    const workers = AFV.workers || [];
    const greenhouses = AFV.greenhouses || [];
    
    // Get all pending tasks (not completed)
    const allTasks = [];
    greenhouses.forEach(gh => {
      gh.tasks.filter(t => !t.completed).forEach(task => {
        allTasks.push({ gh, task });
      });
    });
    
    const pending = allTasks.filter(t => !t.task.verified);

    return `
      <div class="page-header">
        <div>
          <div class="page-title">Pending Tasks ⏳</div>
          <div class="page-subtitle">Add comments and monitor pending tasks</div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" onclick="SupervisorDashboard.showPage('assign-tasks')">← Assign Tasks</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-value">${pending.length}</div><div class="stat-label">Pending Tasks</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${greenhouses.reduce((s, gh) => s + gh.tasks.filter(t => t.completed).length, 0)}</div><div class="stat-label">Completed</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">All Pending Tasks</div>
          ${allTasks.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">All tasks completed!</div>' : `
          <div class="scroll-x">
            <table class="desktop-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allTasks.map(({gh, task}) => {
                  const assignedTo = task.assignedTo ? AFV.workers.find(w => w.uid === task.assignedTo) : null;
                  return `
                    <tr>
                      <td><div style="font-weight:600">${task.name}</div><div style="font-size:0.72rem;color:var(--text-light)">${task.desc?.substring(0,40)}...</div></td>
                      <td>${gh.cropEmoji} ${gh.name}</td>
                      <td><span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}">${task.priority}</span></td>
                      <td>${task.verified ? '<span class="badge badge-green">✓ Verified</span>' : '<span class="badge badge-blue">Pending</span>'}</td>
                      <td>
                        <input type="text" id="comment-${gh.id}-${task.id}" placeholder="Add comment..." value="${task.supervisorComment || ''}" style="padding:4px 8px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.75rem;width:180px">
                        <button onclick="SupervisorDashboard.saveTaskComment('${gh.id}', '${task.id}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem;margin-left:2px">💾</button>
                      </td>
                      <td>
                        ${task.assignedTo && !task.verified ? `
                          <button onclick="SupervisorDashboard.verifyTask('${gh.id}', '${task.id}')" style="padding:4px 8px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">✅ Verify</button>
                        ` : task.verified ? '<span class="badge badge-green">✓ Done</span>' : '<span style="color:var(--text-light);font-size:0.7rem">—</span>'}
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Mobile Card View -->
          <div class="mobile-cards" style="display:none">
            ${allTasks.map(({gh, task}) => {
              return `
                <div style="background:var(--green-ultra-pale);border-radius:8px;padding:12px;margin-bottom:10px;border-left:3px solid ${task.priority==='high'?'var(--red-alert)':task.priority==='medium'?'var(--orange-warn)':'var(--green-fresh)'}">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                    <div style="flex:1">
                      <div style="font-weight:600;font-size:0.9rem;color:var(--green-deep)">${task.name}</div>
                      <div style="font-size:0.7rem;color:var(--text-light)">${gh.cropEmoji} ${gh.name}</div>
                    </div>
                    <span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}" style="font-size:0.6rem">${task.priority}</span>
                  </div>
                  <div style="font-size:0.75rem;margin-bottom:8px">${task.desc?.substring(0,60)}...</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <span style="font-size:0.7rem;color:var(--text-light)">${task.verified ? '✓ Verified' : 'Pending'}</span>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px">
                    <input type="text" id="comment-mobile-${gh.id}-${task.id}" placeholder="Add comment..." value="${task.supervisorComment || ''}" style="padding:8px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.8rem;width:100%;box-sizing:border-box">
                    <div style="display:flex;gap:6px">
                      <button onclick="SupervisorDashboard.saveTaskCommentMobile('${gh.id}', '${task.id}')" style="flex:1;padding:8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">💾 Save Comment</button>
                      ${task.assignedTo && !task.verified ? `
                        <button onclick="SupervisorDashboard.verifyTask('${gh.id}', '${task.id}')" style="flex:1;padding:8px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">✅ Verify</button>
                      ` : ''}
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
          
          <style>
            @media (max-width: 768px) {
              .desktop-table { display: none !important; }
              .mobile-cards { display: block !important; }
              .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
          </style>`}
        </div>
      </div>
    `;
  },

  saveTaskCommentMobile(ghId, taskId) {
    const input = document.getElementById(`comment-mobile-${ghId}-${taskId}`);
    const comment = input.value.trim();
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    const task = gh?.tasks.find(t => t.id === taskId || t.id == taskId);
    
    if (task) {
      task.supervisorComment = comment;
      task.commentAt = new Date();
      showToast('Comment saved!', 'success');
      this.showPage('pending-tasks');
    }
  },

  saveTaskComment(ghId, taskId) {
    const input = document.getElementById(`comment-${ghId}-${taskId}`);
    const comment = input.value.trim();
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    const task = gh?.tasks.find(t => t.id === taskId || t.id == taskId);
    
    if (task) {
      task.supervisorComment = comment;
      task.commentAt = new Date();
      showToast('Comment saved!', 'success');
      this.showPage('pending-tasks');
    }
  },

  renderCreateTask() {
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
    const categories = AFV.taskCategories || ['planting', 'irrigation', 'nutrition', 'pruning', 'pest', 'environment', 'harvest', 'general'];
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">➕ Create New Task</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Add a new task to any greenhouse</div>
        </div>
      </div>
      
      <div class="page-body">
        <div class="card" style="max-width:700px;margin:0 auto">
          <form id="create-task-form" onsubmit="SupervisorDashboard.saveNewTask(event)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Greenhouse *</label>
                <select id="task-gh" required style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                  <option value="">Select Greenhouse</option>
                  ${(AFV.greenhouses || []).map(g => `<option value="${g.id}">${g.cropEmoji} ${g.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Task Name *</label>
                <input type="text" id="task-name" required style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., Foliar Spray Calcium Nitrate">
              </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Category/Subsection *</label>
                <select id="task-category" required style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                  <option value="">Select Category</option>
                  ${categories.map(c => `<option value="${c}">${categoryLabels[c] || c}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Priority *</label>
                <select id="task-priority" required style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                  <option value="high">🔴 HIGH</option>
                  <option value="medium" selected>🟡 MEDIUM</option>
                  <option value="low">🟢 LOW</option>
                </select>
              </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Estimated Duration</label>
                <input type="text" id="task-duration" style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., 1 hr, 2 hrs, Half day">
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Due Date</label>
                <input type="date" id="task-due-date" style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
              </div>
            </div>
            
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Description with Full Instructions *</label>
              <textarea id="task-desc" required rows="5" style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;resize:vertical" placeholder="Provide detailed instructions for completing this task..."></textarea>
            </div>
            
            <div style="display:flex;gap:12px;justify-content:flex-end">
              <button type="button" onclick="SupervisorDashboard.showPage('pending-tasks')" style="padding:12px 24px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
              <button type="submit" style="padding:12px 24px;background:var(--green-fresh);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">➕ Create Task</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  saveNewTask(e) {
    e.preventDefault();
    
    const ghId = document.getElementById('task-gh').value;
    const name = document.getElementById('task-name').value.trim();
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const duration = document.getElementById('task-duration').value.trim() || '1 hr';
    const dueDate = document.getElementById('task-due-date').value;
    const desc = document.getElementById('task-desc').value.trim();
    
    const gh = AFV.greenhouses.find(g => g.id === ghId);
    if (!gh) {
      showToast('Greenhouse not found', 'error');
      return;
    }
    
    // Create new task
    const newTask = {
      id: Date.now(),
      title: name,
      name: name,
      category: category,
      priority: priority,
      duration: duration,
      desc: desc,
      description: desc,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      completed: false,
      status: 'pending',
      createdBy: AFV.currentUser?.name || 'Supervisor',
      createdAt: new Date().toISOString()
    };
    
    if (!gh.tasks) gh.tasks = [];
    gh.tasks.push(newTask);
    
    AFV.logActivity('➕', `New task created: "${name}" in ${gh.name} by ${AFV.currentUser?.name}`);
    this.saveState();
    
    showToast(`Task "${name}" created successfully in ${gh.name}!`, 'success');
    this.showPage('pending-tasks');
  },

  renderCompletionHistory() {
    const user = AFV.currentUser;
    const allCompleted = [];
    
    // Get all completed tasks from assigned greenhouses
    (user.assignedGH || []).forEach(ghId => {
      const gh = AFV.greenhouses.find(g => g.id === ghId);
      if (gh && gh.tasks) {
        gh.tasks.filter(t => t.completed).forEach(task => {
          allCompleted.push({ gh, task });
        });
      }
    });
    
    // Sort by completion date (most recent first)
    allCompleted.sort((a, b) => new Date(b.task.completedAt) - new Date(a.task.completedAt));
    
    // Group by date
    const grouped = {};
    allCompleted.forEach(({ gh, task }) => {
      const date = new Date(task.completedAt).toLocaleDateString('en-KE');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push({ gh, task });
    });
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">📜 Completion History</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${allCompleted.length} tasks completed</div>
        </div>
      </div>
      
      <div class="page-body">
        ${allCompleted.length === 0 ? `
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon">📜</div>
            <div class="empty-text">No completed tasks yet</div>
          </div>
        </div>
        ` : `
        ${Object.entries(grouped).map(([date, items]) => `
          <div class="card" style="margin-bottom:16px">
            <div class="section-title">📅 ${date}</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${items.map(({ gh, task }) => `
                <div style="display:flex;gap:14px;padding:14px;background:var(--green-ultra-pale);border-radius:var(--radius-sm);border-left:3px solid var(--green-fresh)">
                  <div style="font-size:1.4rem">✅</div>
                  <div style="flex:1">
                    <div style="font-weight:600;font-size:0.95rem">${task.title || task.name}</div>
                    <div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">
                      🏡 ${gh.name} · ${gh.crop}
                    </div>
                    <div style="font-size:0.75rem;color:var(--text-light);margin-top:4px">
                      ⏱ ${task.duration || '—'} · ${task.category || 'general'} · ${task.priority?.toUpperCase() || 'MEDIUM'} Priority
                    </div>
                    ${task.completionNotes ? `
                    <div style="margin-top:8px;padding:8px;background:white;border-radius:var(--radius-sm);font-size:0.8rem;color:var(--text-dark)">
                      <strong>Notes:</strong> ${task.completionNotes}
                    </div>
                    ` : ''}
                    <div style="font-size:0.7rem;color:var(--green-forest);margin-top:8px">
                      Completed: ${new Date(task.completedAt).toLocaleString('en-KE')} ${task.completedBy ? `by ${task.completedBy}` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        `}
      </div>
    `;
  },

  renderCompletedTasks() {
    const greenhouses = AFV.greenhouses || [];
    
    // Get all completed/verified tasks
    const completedTasks = [];
    greenhouses.forEach(gh => {
      gh.tasks.filter(t => t.completed || t.verified).forEach(task => {
        completedTasks.push({ gh, task });
      });
    });
    
    // Sort by completion date (most recent first)
    completedTasks.sort((a, b) => {
      const dateA = a.task.completedAt || a.task.verifiedAt || new Date(0);
      const dateB = b.task.completedAt || b.task.verifiedAt || new Date(0);
      return dateB - dateA;
    });

    return `
      <div class="page-header">
        <div>
          <div class="page-title">Completed Tasks ✅</div>
          <div class="page-subtitle">Tasks that have been verified as complete</div>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${completedTasks.length}</div><div class="stat-label">Total Completed</div></div></div>
          <div class="stat-card"><div class="stat-icon">📊</div><div><div class="stat-value">${completedTasks.filter(t => t.task.verified).length}</div><div class="stat-label">Verified</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">Completed Task History</div>
          ${completedTasks.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">No completed tasks yet!</div>' : `
          <div class="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Assigned To</th>
                  <th>Verified By</th>
                  <th>Completed</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                ${completedTasks.map(({gh, task}) => {
                  const assignedTo = task.assignedTo ? AFV.workers.find(w => w.uid === task.assignedTo) : null;
                  const completedDate = task.completedAt ? task.completedAt.toLocaleDateString('en-KE') : (task.verifiedAt ? task.verifiedAt.toLocaleDateString('en-KE') : '—');
                  return `
                    <tr>
                      <td style="text-decoration:line-through;opacity:0.7"><div style="font-weight:600">${task.name}</div></td>
                      <td>${gh.cropEmoji} ${gh.name}</td>
                      <td>${assignedTo ? `<div style="text-align:center"><div style="font-weight:600;font-size:0.8rem">${assignedTo.name}</div></div>` : '<span style="color:var(--text-light)">—</span>'}</td>
                      <td>${task.verifiedBy || '—'}</td>
                      <td>${completedDate}</td>
                      <td>${task.supervisorComment || task.verificationComment || '—'}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  renderWeeklyReports() {
    const reports = AFV.weeklyReports || [];
    const userId = AFV.currentUser?.uid;
    const myReports = reports.filter(r => r.supervisorId === userId);
    
    // Get current week info
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekLabel = `${startOfWeek.toLocaleDateString('en-KE', {month:'short', day:'numeric'})} - ${endOfWeek.toLocaleDateString('en-KE', {month:'short', day:'numeric'})}`;
    
    // Check if report exists for current week
    const currentWeekReport = myReports.find(r => {
      const reportDate = new Date(r.weekStart);
      return reportDate.getTime() === startOfWeek.getTime();
    });

    return `
      <div class="page-header">
        <div>
          <div class="page-title">Weekly Reports 📊</div>
          <div class="page-subtitle">Write and review weekly progress reports</div>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card"><div class="stat-icon">📝</div><div><div class="stat-value">${myReports.length}</div><div class="stat-label">Reports Submitted</div></div></div>
          <div class="stat-card"><div class="stat-icon">📅</div><div><div class="stat-value">${weekLabel}</div><div class="stat-label">Current Week</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">📅 Submit Weekly Report</div>
          <div style="padding:16px;background:rgba(59,130,246,0.05);border-radius:var(--radius-sm);margin-bottom:16px">
            <div style="font-weight:600;margin-bottom:8px">Week of ${weekLabel}</div>
            ${currentWeekReport ? `
              <div style="padding:12px;background:var(--green-fresh);color:white;border-radius:6px;margin-bottom:8px">✓ Report already submitted for this week</div>
              <div style="font-size:0.85rem;margin-bottom:8px"><strong>Summary:</strong> ${currentWeekReport.summary}</div>
              <div style="font-size:0.85rem;margin-bottom:8px"><strong>Challenges:</strong> ${currentWeekReport.challenges || 'None'}</div>
              <div style="font-size:0.85rem"><strong>Submitted:</strong> ${new Date(currentWeekReport.submittedAt).toLocaleString('en-KE')}</div>
            ` : `
              <div style="display:flex;flex-direction:column;gap:12px">
                <div>
                  <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:6px">Weekly Summary</label>
                  <textarea id="report-summary" rows="4" placeholder="Describe what was accomplished this week..." style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--blue-pale);font-size:0.9rem;resize:vertical"></textarea>
                </div>
                <div>
                  <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:6px">Challenges Faced</label>
                  <textarea id="report-challenges" rows="3" placeholder="Any challenges or issues encountered..." style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--blue-pale);font-size:0.9rem;resize:vertical"></textarea>
                </div>
                <div>
                  <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:6px">Next Week Goals</label>
                  <textarea id="report-goals" rows="3" placeholder="What are the goals for next week..." style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--blue-pale);font-size:0.9rem;resize:vertical"></textarea>
                </div>
                <button onclick="SupervisorDashboard.submitWeeklyReport()" style="padding:12px 24px;background:var(--blue-water);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.9rem;font-weight:600">📤 Submit Report</button>
              </div>
            `}
          </div>
        </div>
        
        ${myReports.length > 0 ? `
        <div class="card" style="margin-top:20px">
          <div class="section-title">📜 Previous Reports</div>
          ${myReports.filter(r => !currentWeekReport || r.weekStart !== currentWeekReport?.weekStart).map(r => {
            const reportDate = new Date(r.weekStart);
            const reportWeek = `${reportDate.toLocaleDateString('en-KE', {month:'short', day:'numeric'})}`;
            return `
              <div style="padding:16px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <div style="font-weight:600">📅 ${reportWeek}</div>
                  <div style="font-size:0.75rem;color:var(--text-light)">Submitted ${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-KE') : '—'}</div>
                </div>
                <div style="font-size:0.85rem;margin-bottom:6px"><strong>Summary:</strong> ${r.summary}</div>
                ${r.challenges ? `<div style="font-size:0.85rem;margin-bottom:6px"><strong>Challenges:</strong> ${r.challenges}</div>` : ''}
                ${r.goals ? `<div style="font-size:0.85rem"><strong>Goals:</strong> ${r.goals}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}
      </div>
    `;
  },

  renderTasks() {
    // Get all tasks from greenhouses
    const allTasks = [];
    AFV.greenhouses.forEach(gh => {
      gh.tasks.forEach(t => {
        allTasks.push({...t, gh});
      });
    });
    const pending = allTasks.filter(t => !t.completed);
    const done = allTasks.filter(t => t.completed);
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">📋 Tasks</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${pending.length} pending · ${done.length} completed</div>
        </div>
        <div class="header-actions">
          <button onclick="SupervisorDashboard.showAddTaskForm()" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ Add Task</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card"><div class="stat-icon">📥</div><div><div class="stat-value">${pending.length}</div><div class="stat-label">Pending</div></div></div>
          <div class="stat-card"><div class="stat-icon">🔄</div><div><div class="stat-value">${done.length}</div><div class="stat-label">Completed</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${allTasks.length}</div><div class="stat-label">Total</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">⏳ Pending Tasks (${pending.length})</div>
          ${pending.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">No pending tasks</div>' : `
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(t => {
                  const worker = t.assignedTo ? (AFV.workers.find(w => w.uid === t.assignedTo) || AFV.users?.[t.assignedTo]) : null;
                  return `
                    <tr>
                      <td><div style="font-weight:600">${t.name}</div><div style="font-size:0.7rem;color:var(--text-light)">${t.desc?.substring(0,40)}...</div></td>
                      <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                      <td><span class="badge badge-green">${t.category || 'general'}</span></td>
                      <td><span class="badge ${t.priority==='high'?'badge-red':t.priority==='medium'?'badge-orange':'badge-green'}">${t.priority}</span></td>
                      <td>${t.duration}</td>
                      <td>${worker ? worker.name : '—'}</td>
                      <td>${t.verified ? '<span class="badge badge-green">✓ Verified</span>' : t.assignedTo ? '<span class="badge badge-blue">Assigned</span>' : '<span class="badge badge-gray">Pending</span>'}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
        
        <div class="card" style="margin-top:20px">
          <div class="section-title">✅ Completed Tasks (${done.length})</div>
          ${done.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">No completed tasks</div>' : `
          <div class="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Completed</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                ${done.map(t => {
                  const worker = t.assignedTo ? (AFV.workers.find(w => w.uid === t.assignedTo) || AFV.users?.[t.assignedTo]) : null;
                  return `
                    <tr>
                      <td style="text-decoration:line-through;opacity:0.7">${t.name}</td>
                      <td>${t.gh.cropEmoji} ${t.gh.name}</td>
                      <td>${t.completedAt ? t.completedAt.toLocaleDateString('en-KE') : '—'}</td>
                      <td>${worker ? worker.name : '—'}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`}
        </div>
      </div>
    `;
  },

  startTask(taskId) {
    const task = AFV.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'in-progress';
      task.startedAt = new Date().toISOString();
      this.saveState();
      showToast('Task started!', 'success');
      this.navigate('tasks');
    }
  },

  completeTask(taskId) {
    const task = AFV.tasks.find(t => t.id === taskId);
    if (task) {
      // Show completion notes modal
      const modal = document.createElement('div');
      modal.id = 'completion-notes-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center';
      modal.innerHTML = `
        <div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:450px;width:90%">
          <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0 0 16px 0">✅ Complete Task</h2>
          <p style="color:var(--text-light);margin-bottom:16px;font-size:0.95rem">${task.title || task.name}</p>
          <div style="margin-bottom:20px">
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Completion Notes (optional but recommended)</label>
            <textarea id="completion-notes" rows="4" style="width:100%;padding:12px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;resize:vertical" placeholder="Document what was done, observations, issues encountered, etc."></textarea>
          </div>
          <div style="display:flex;gap:10px">
            <button type="button" onclick="document.getElementById('completion-notes-modal').remove()" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
            <button type="button" onclick="SupervisorDashboard.confirmCompleteTask(${taskId})" style="flex:1;padding:12px;background:var(--green-fresh);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">✅ Mark Complete</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  },

  confirmCompleteTask(taskId) {
    const task = AFV.tasks.find(t => t.id === taskId);
    const notesEl = document.getElementById('completion-notes');
    const completionNotes = notesEl ? notesEl.value.trim() : '';
    
    if (task) {
      task.status = 'completed';
      task.completed = true;
      task.completedAt = new Date().toISOString();
      task.completedBy = AFV.currentUser?.name || 'Supervisor';
      if (completionNotes) {
        task.completionNotes = completionNotes;
      }
      
      // Log activity
      AFV.logActivity('✅', `Task completed: "${task.title || task.name}" by ${task.completedBy}`);
      
      // Close modal
      document.getElementById('completion-notes-modal')?.remove();
      
      this.saveState();
      showToast('Task completed!', 'success');
      this.navigate('tasks');
    }
  },

  showAddTaskForm() {
    // Remove any existing modal
    const existingForm = document.getElementById('supervisor-add-task-form');
    if (existingForm) {
      existingForm.remove();
    }
    
    const formHtml = `
      <div id="supervisor-add-task-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center">
        <div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h2 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin:0">Add New Task</h2>
            <button type="button" onclick="SupervisorDashboard.closeAddTaskForm()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
          </div>
          <form onsubmit="SupervisorDashboard.saveNewTask(event)">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Greenhouse</label>
              <select id="supervisor-task-gh" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                ${AFV.greenhouses.map(gh => `<option value="${gh.id}">${gh.cropEmoji} ${gh.name}</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Task Name</label>
              <input type="text" id="supervisor-task-name" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Description</label>
              <textarea id="supervisor-task-desc" rows="2" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem;font-family:inherit"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Category</label>
                <select id="supervisor-task-category" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
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
                <select id="supervisor-task-priority" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
                  <option value="high">🔴 High</option>
                  <option value="medium" selected>🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom:20px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Duration</label>
              <input type="text" id="supervisor-task-duration" value="1 hour" style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem">
            </div>
            <div style="display:flex;gap:10px">
              <button type="button" onclick="SupervisorDashboard.closeAddTaskForm()" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
              <button type="submit" style="flex:1;padding:12px;background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">Add Task</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    const formDiv = document.createElement('div');
    formDiv.id = 'supervisor-add-task-form';
    formDiv.innerHTML = formHtml;
    document.body.appendChild(formDiv);
  },

  closeAddTaskForm() {
    const formDiv = document.getElementById('supervisor-add-task-form');
    if (formDiv) {
      formDiv.remove();
    }
    this.showPage('tasks');
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
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🏷️ Task Categories</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Manage task subsections</div>
        </div>
        <div class="header-actions">
          <button onclick="SupervisorDashboard.showAddCategoryModal()" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ Add Category</button>
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
                  <button onclick="SupervisorDashboard.editCategory('${cat}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">✏️</button>
                  <button onclick="SupervisorDashboard.deleteCategory('${cat}')" style="padding:4px 8px;background:var(--red-alert);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">🗑️</button>
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
          <form onsubmit="SupervisorDashboard.saveCategory(event, ${isEdit ? `'${existingCategory}'` : 'null'})">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Category Name</label>
              <input type="text" id="supervisor-category-name" value="${existingCategory || ''}" required style="width:100%;padding:10px;border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., pruning, training">
            </div>
            <div style="display:flex;gap:10px">
              <button type="button" onclick="SupervisorDashboard.closeModal('supervisor-category-modal')" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
              <button type="submit" style="flex:1;padding:12px;background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">${isEdit ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    const existing = document.getElementById('supervisor-category-modal');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'supervisor-category-modal';
    div.innerHTML = modalHtml;
    document.body.appendChild(div);
  },

  editCategory(category) {
    this.showAddCategoryModal(category);
  },

  saveCategory(e, existingCategory) {
    e.preventDefault();
    const name = document.getElementById('supervisor-category-name').value.trim().toLowerCase();
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
    const modal = document.getElementById('supervisor-category-modal');
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
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🌱 Harvest Orders</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${pending.length} pending · ${completed.length} completed</div>
        </div>
        <div class="header-actions">
          <button onclick="SupervisorDashboard.showAddOrderModal()" style="padding:8px 16px;background:var(--green-fresh);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600">➕ New Harvest Order</button>
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
                      <td>${o.qty ? o.qty + ' kg' : '—'}</td>
                      <td><span class="badge badge-orange">Pending</span></td>
                      <td>
                        <button onclick="SupervisorDashboard.completeOrder('${o.id}')" style="padding:4px 8px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">✓ Complete</button>
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
          <form onsubmit="SupervisorDashboard.saveOrder(event)">
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
              <button type="button" onclick="SupervisorDashboard.closeModal('supervisor-order-modal')" style="flex:1;padding:12px;background:var(--gray-100);color:var(--text-dark);border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem">Cancel</button>
              <button type="submit" style="flex:1;padding:12px;background:var(--green-deep);color:white;border:none;border-radius:var(--radius-sm);cursor:pointer;font-size:0.95rem;font-weight:600">Add Order</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    const existing = document.getElementById('supervisor-order-modal');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.id = 'supervisor-order-modal';
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
      createdBy: AFV.currentUser?.name || 'Supervisor',
      createdAt: new Date()
    };
    
    AFV.harvestOrders.push(newOrder);
    this.saveState();
    
    const modal = document.getElementById('supervisor-order-modal');
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

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  },

  submitWeeklyReport() {
    const summary = document.getElementById('report-summary').value.trim();
    const challenges = document.getElementById('report-challenges').value.trim();
    const goals = document.getElementById('report-goals').value.trim();
    
    if (!summary) {
      showToast('Please enter a weekly summary', 'error');
      return;
    }
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    
    if (!AFV.weeklyReports) AFV.weeklyReports = [];
    
    const report = {
      id: 'report_' + Date.now(),
      supervisorId: AFV.currentUser.uid,
      supervisorName: AFV.currentUser.name,
      weekStart: startOfWeek.toISOString(),
      summary,
      challenges,
      goals,
      submittedAt: new Date()
    };
    
    AFV.weeklyReports.push(report);
    this.saveState();
    showToast('Weekly report submitted successfully!', 'success');
    this.showPage('weekly-reports');
  }
};