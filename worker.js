// ============================================
// AGRI-FINE VENTURES — WORKER DASHBOARD
// ============================================

const WorkerDashboard = {
  currentPage: 'mytasks',

  init() {
    this.renderNav();
    this.showPage('mytasks');
  },

  renderNav() {
    const nav = document.getElementById('worker-nav');
    nav.innerHTML = `
      <div class="sidebar-logo">
        <div style="font-size:1.8rem;margin-bottom:6px">🌾</div>
        <div class="sidebar-logo-title">Agri-Fine</div>
        <div class="sidebar-logo-sub">Field Worker</div>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar" style="background:var(--blue-water)">${AFV.currentUser.imageUrl ? `<img src="${AFV.currentUser.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : AFV.currentUser.avatar}</div>
        <div>
          <div class="user-name">${AFV.currentUser.name}</div>
          <div class="user-role">Field Worker</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">My Work</div>
        <button class="nav-item active" data-page="mytasks" onclick="WorkerDashboard.showPage('mytasks')">
          <span class="nav-icon">🎯</span><span>My Tasks</span>
        </button>
        <button class="nav-item" data-page="mygreenhouses" onclick="WorkerDashboard.showPage('mygreenhouses')">
          <span class="nav-icon">🏡</span><span>My Greenhouses</span>
        </button>
        <button class="nav-item" data-page="history" onclick="WorkerDashboard.showPage('history')">
          <span class="nav-icon">📜</span><span>Task History</span>
        </button>
        <div class="nav-section-label">Resources</div>
        <button class="nav-item" data-page="guide" onclick="WorkerDashboard.showPage('guide')">
          <span class="nav-icon">📖</span><span>Task Guide</span>
        </button>
        <button class="nav-item" data-page="feeding" onclick="WorkerDashboard.showPage('feeding')">
          <span class="nav-icon">🧪</span><span>Feeding Program</span>
        </button>
        <button class="nav-item" data-page="ai" onclick="openAIModal()">
          <span class="nav-icon">🤖</span><span>Ask AI</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" onclick="handleLogout()">🚪 <span>Sign Out</span></button>
      </div>
    `;
  },

  showPage(page) {
    this.currentPage = page;
    document.querySelectorAll('#worker-nav .nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`#worker-nav [data-page="${page}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById('worker-content');
    switch(page) {
      case 'mytasks': content.innerHTML = this.renderMyTasks(); break;
      case 'mygreenhouses': content.innerHTML = this.renderMyGreenhouses(); break;
      case 'history': content.innerHTML = this.renderHistory(); break;
      case 'guide': content.innerHTML = this.renderGuide(); break;
      case 'feeding': content.innerHTML = this.renderFeeding(); break;
    }
  },

  renderMyTasks() {
    const user = AFV.currentUser;
    const tasks = AFV.getTasksForWorker(user.id);
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
          <button class="btn-secondary" onclick="openAIModal()" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white">🤖 Ask AI</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div><div class="stat-value">${tasks.length}</div><div class="stat-label">Active Next Tasks</div></div>
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

        ${tasks.length === 0 ? `
          <div class="worker-task-hero">
            <div class="hero-label">Task Status</div>
            <div class="hero-task">🎉 All Tasks Complete!</div>
            <div style="opacity:0.8;font-size:0.9rem;margin-top:8px">You've completed all assigned tasks. Excellent work! Check back for new assignments.</div>
          </div>` : tasks.map(({gh, task}, i) => `
          <div class="worker-task-hero" style="background:${i===0?'linear-gradient(135deg,#1a2e4a 0%,#2d4a6e 100%)':'linear-gradient(135deg,#2a1a1a 0%,#4a2d2d 100%)'}">
            <div class="hero-label">
              ${i === 0 ? '⚡ YOUR NEXT TASK — DO THIS NOW' : `📋 TASK ${i+1} (After completing task ${i})`}
            </div>
            <div class="hero-gh"><span>${gh.cropEmoji}</span><span>${gh.name} · ${gh.crop}</span></div>
            <div class="hero-task">${task.name}</div>
            <div class="hero-time">⏱ Estimated: ${task.duration} · Priority: <strong style="color:${task.priority==='high'?'#ff7675':task.priority==='medium'?'#fdcb6e':'#55efc4'}">${task.priority.toUpperCase()}</strong></div>
            <div style="margin-top:14px;background:rgba(255,255,255,0.08);border-radius:var(--radius-sm);padding:14px;font-size:0.85rem;line-height:1.6">
              <div style="font-size:0.72rem;font-weight:700;opacity:0.6;text-transform:uppercase;margin-bottom:6px">📝 Instructions</div>
              ${task.desc}
            </div>
            ${i === 0 ? `<button class="hero-complete-btn" onclick="WorkerDashboard.initiateComplete(${gh.id}, '${task.id}', '${task.name.replace(/'/g,"\\'")}')">
              ✅ Mark as Complete
            </button>` : ''}
          </div>`) .join('')}

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
      <button class="ai-float-btn" onclick="openAIModal()" style="background:linear-gradient(135deg,#1a2e4a,#3d6b9e)">🤖</button>
    `;
  },

  renderMyGreenhouses() {
    const user = AFV.currentUser;
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">My Greenhouses 🏡</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Your assigned production units</div>
        </div>
      </div>
      <div class="page-body">
        ${(user.assignedGH || []).map(ghId => {
          const gh = AFV.greenhouses.find(g => g.id === ghId);
          if (!gh) return '';
          const daysPlanted = Math.floor((new Date() - gh.plantedDate)/(1000*60*60*24));
          const daysToHarvest = Math.ceil((gh.expectedHarvest - new Date())/(1000*60*60*24));
          return `
            <div class="card" style="margin-bottom:20px">
              <div style="display:flex;gap:16px;flex-wrap:wrap">
                <div class="${gh.bgClass}" style="width:120px;height:90px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:3rem;flex-shrink:0;background-size:cover;background-position:center">${gh.imageUrl ? `<img src="${gh.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)">` : gh.cropEmoji}</div>
                <div style="flex:1">
                  <h3 style="font-family:'Playfair Display',serif;color:var(--green-deep);margin-bottom:6px">${gh.name} — ${gh.crop}</h3>
                  <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:10px">${gh.variety} · ${gh.area} · ${gh.plants.toLocaleString()} plants</div>
                  <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div style="background:var(--green-ultra-pale);padding:8px 12px;border-radius:var(--radius-sm);text-align:center">
                      <div style="font-weight:700;color:var(--green-deep)">${daysPlanted}d</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">Age</div>
                    </div>
                    <div style="background:var(--green-ultra-pale);padding:8px 12px;border-radius:var(--radius-sm);text-align:center">
                      <div style="font-weight:700;color:${daysToHarvest<40?'var(--orange-warn)':'var(--green-deep)'}">${daysToHarvest}d</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">To Harvest</div>
                    </div>
                    <div style="background:rgba(9,132,227,0.08);padding:8px 12px;border-radius:var(--radius-sm);text-align:center">
                      <div style="font-weight:700;color:var(--blue-water)">${gh.environment.temp}</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">Temp</div>
                    </div>
                    <div style="background:rgba(9,132,227,0.08);padding:8px 12px;border-radius:var(--radius-sm);text-align:center">
                      <div style="font-weight:700;color:var(--blue-water)">${gh.environment.humidity}</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">Humidity</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="margin-top:14px;background:rgba(9,132,227,0.05);border-radius:var(--radius-sm);padding:12px;border-left:3px solid var(--blue-water)">
                <div style="font-size:0.72rem;font-weight:700;color:var(--blue-water);margin-bottom:3px">NOTES FROM MANAGER</div>
                <div style="font-size:0.85rem;color:var(--text-dark)">${gh.notes}</div>
              </div>
            </div>`;
        }).join('')}
      </div>
      <button class="ai-float-btn" onclick="openAIModal()" style="background:linear-gradient(135deg,#1a2e4a,#3d6b9e)">🤖</button>
    `;
  },

  renderHistory() {
    const user = AFV.currentUser;
    const done = (user.assignedGH || []).flatMap(ghId => {
      const gh = AFV.greenhouses.find(g => g.id === ghId);
      return gh ? gh.tasks.filter(t => t.completed && t.completedBy === user.id).map(t => ({...t, gh})) : [];
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
      <button class="ai-float-btn" onclick="openAIModal()" style="background:linear-gradient(135deg,#1a2e4a,#3d6b9e)">🤖</button>
    `;
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
        <div class="card" style="background:linear-gradient(135deg,var(--green-ultra-pale),white)">
          <div class="section-title">🤖 Need More Help?</div>
          <div style="font-size:0.9rem;color:var(--text-mid);margin-bottom:14px">Our AI assistant can answer specific questions about crop diseases, pest treatment, irrigation schedules, and more.</div>
          <button class="btn-primary" onclick="openAIModal()">🤖 Open AI Assistant</button>
        </div>
      </div>
      <button class="ai-float-btn" onclick="openAIModal()" style="background:linear-gradient(135deg,#1a2e4a,#3d6b9e)">🤖</button>
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
            <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="WorkerDashboard.showFeedingCalendar()">🗓️ Calendar</button>
          ` : ''}
          <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;margin-left:10px;text-align:center;cursor:pointer" onclick="${hasCalendar ? 'WorkerDashboard.showFeedingCalendar()' : ''}">
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
      <button class="ai-float-btn" onclick="openAIModal()" style="background:linear-gradient(135deg,#1a2e4a,#3d6b9e)">🤖</button>
    `;
  },

  initiateComplete(ghId, taskId, taskName) {
    AFV.pendingTaskComplete = { ghId, taskId };
    document.getElementById('task-modal-title').textContent = 'Complete Task?';
    document.getElementById('task-modal-msg').textContent = `Are you sure you have fully completed "${taskName}"? This will unlock the next task in the queue.`;
    document.getElementById('task-modal').style.display = 'flex';
  },

  // ============================================ FEEDING CALENDAR

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
    
    const content = document.getElementById('worker-content');
    content.innerHTML = `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🗓️ Feeding Calendar</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">34-week cycle calendar with notes · Currently Week ${currentWeek} (Cycle ${currentCycle})</div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="WorkerDashboard.showPage('feeding')">← Back</button>
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
  }
};
