// ============================================
// AGRI-FINE VENTURES — SUPERVISOR DASHBOARD
// ============================================

const SupervisorDashboard = {
  currentPage: 'mytasks',

  init() {
    this.renderNav();
    // Add harvest modal to body
    if(!document.getElementById('supervisor-harvest-modal')) {
      const modal = document.createElement('div');
      modal.id = 'supervisor-harvest-modal';
      modal.className = 'modal';
      modal.style.display = 'none';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.background = 'rgba(0,0,0,0.5)';
      modal.style.zIndex = '1000';
      modal.innerHTML = `<div style="background:white;border-radius:var(--radius-md);padding:24px;max-width:400px;width:90%;margin:auto"><h2 style="color:var(--green-deep);margin:0 0 16px">Record Harvest</h2><form onsubmit="SupervisorDashboard.saveHarvest(event)"><input type="hidden" id="supervisor-harvest-gh-id"><input type="hidden" id="supervisor-harvest-price"><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Price per kg (KES)</label><input type="number" id="supervisor-harvest-price-input" required placeholder="Price per kg" style="width:100%;padding:10px"></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Quantity</label><div style="display:flex;gap:8px"><input type="number" id="supervisor-harvest-qty" required placeholder="Amount" step="0.01" style="flex:2;padding:10px"><select id="supervisor-harvest-unit" style="flex:1;padding:10px"><option value="kg">kg</option><option value="g">grams</option></select></div></div><div style="margin-bottom:12px;padding:10px;background:var(--green-ultra-pale);border-radius:var(--radius-sm)"><div style="font-size:0.85rem;color:var(--text-light)">Estimated Value</div><div style="font-size:1.2rem;font-weight:700;color:var(--green-fresh)" id="supervisor-harvest-estimated-value">KES 0</div></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Quality</label><select id="supervisor-harvest-quality" required style="width:100%;padding:10px"><option value="grade1">⭐ Grade 1 (Premium)</option><option value="grade2">⭐⭐ Grade 2</option><option value="grade3">⭐⭐⭐ Grade 3</option><option value="reject">❌ Reject</option></select></div><div style="margin-bottom:12px"><label style="display:block;margin-bottom:4px;color:var(--text)">Date</label><input type="date" id="supervisor-harvest-date" required style="width:100%;padding:10px"></div><div style="margin-bottom:16px"><label style="display:block;margin-bottom:4px;color:var(--text)">Notes</label><textarea id="supervisor-harvest-notes" placeholder="Optional notes..." style="width:100%;padding:10px;min-height:60px"></textarea></div><div style="display:flex;gap:10px"><button type="button" onclick="SupervisorDashboard.closeHarvestModal()" class="btn-secondary" style="flex:1">Cancel</button><button type="submit" class="btn-primary" style="flex:1">Save</button></div></form></div>`;
      document.body.appendChild(modal);
    }
    this.showPage('mytasks');
    
    // Render AI Helper widget
    document.getElementById('ai-widget-container').innerHTML = '';
    document.getElementById('ai-widget-container').innerHTML = SupervisorDashboard.renderAIHelper();
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
        <div class="user-avatar" style="background:var(--blue-water)">${AFV.currentUser.imageUrl ? `<img src="${AFV.currentUser.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : AFV.currentUser.avatar}</div>
        <div>
          <div class="user-name">${AFV.currentUser.name}</div>
          <div class="user-role">Supervisor</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">My Work</div>
        <button class="nav-item active" data-page="mytasks" onclick="SupervisorDashboard.showPage('mytasks')">
          <span class="nav-icon">🎯</span><span>My Tasks</span>
        </button>
        <button class="nav-item" data-page="mygreenhouses" onclick="SupervisorDashboard.showPage('mygreenhouses')">
          <span class="nav-icon">🏡</span><span>My Greenhouses</span>
        </button>
        <button class="nav-item" data-page="harvest" onclick="SupervisorDashboard.showPage('harvest')">
          <span class="nav-icon">🌾</span><span>Harvest</span>
        </button>
        <button class="nav-item" data-page="history" onclick="SupervisorDashboard.showPage('history')">
          <span class="nav-icon">📜</span><span>Task History</span>
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
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" onclick="handleLogout()">🚪 <span>Sign Out</span></button>
      </div>
    `;
  },

  showPage(page) {
    this.currentPage = page;
    document.querySelectorAll('#supervisor-nav .nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`#supervisor-nav [data-page="${page}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById('supervisor-content');
    switch(page) {
      case 'mytasks': content.innerHTML = this.renderMyTasks(); break;
      case 'mygreenhouses': content.innerHTML = this.renderMyGreenhouses(); break;
      case 'harvest': content.innerHTML = this.renderHarvest(); break;
      case 'history': content.innerHTML = this.renderHistory(); break;
      case 'sales': content.innerHTML = this.renderSales(); break;
      case 'guide': content.innerHTML = this.renderGuide(); break;
      case 'workers': content.innerHTML = this.renderWorkers(); break;
      case 'assign-tasks': content.innerHTML = this.renderAssignTasks(); break;
      case 'pending-tasks': content.innerHTML = this.renderPendingTasks(); break;
      case 'completed-tasks': content.innerHTML = this.renderCompletedTasks(); break;
      case 'weekly-reports': content.innerHTML = this.renderWeeklyReports(); break;
      case 'feeding': content.innerHTML = this.renderFeeding(); break;
      case 'tasks': content.innerHTML = this.renderTasks(); break;
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
                <button class="hero-complete-btn" onclick="SupervisorDashboard.initiateComplete(${gh.id}, '${task.id}', '${task.name.replace(/'/g,"\\'")}')">
                  ✅ Mark as Complete
                </button>
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
          
          // Calculate growth stage
          const totalCycle = Math.ceil((gh.expectedHarvest - gh.plantedDate) / (1000*60*60*24));
          const cycleProgress = Math.min(100, Math.round((daysPlanted / totalCycle) * 100));
          
          let stage = '🌱 Seedling';
          let stageColor = '#6b8e23';
          if (daysPlanted > 20) { stage = '🌿 Vegetative'; stageColor = '#228b22'; }
          if (daysPlanted > 35) { stage = '🌸 Flowering'; stageColor = '#da70d6'; }
          if (daysPlanted > 50) { stage = '🍅 Fruiting'; stageColor = '#ff6347'; }
          if (daysPlanted >= totalCycle - 7) { stage = '🎯 Harvest Ready'; stageColor = '#ffd700'; }
          
          const expectedMonth = gh.expectedHarvest.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
          
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
                      <div style="font-weight:700;color:var(--green-deep)">${daysPlanted}d</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">Age</div>
                    </div>
                    <div style="background:var(--green-ultra-pale);padding:8px 12px;border-radius:var(--radius-sm);text-align:center">
                      <div style="font-weight:700;color:${daysToHarvest<40?'var(--orange-warn)':'var(--green-deep)'}">${daysToHarvest}d</div>
                      <div style="font-size:0.68rem;color:var(--text-light)">To Harvest</div>
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
                  <span>Growth Cycle (${totalCycle} days)</span>
                  <span>${cycleProgress}%</span>
                </div>
                <div style="background:linear-gradient(90deg,#6b8e23,#228b22,#da70d6,#ff6347,#ffd700);height:6px;border-radius:3px;position:relative">
                  <div style="position:absolute;left:${cycleProgress}%;top:-2px;width:10px;height:10px;background:white;border-radius:50%;border:2px solid ${stageColor};transform:translateX(-50%)"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--text-light);margin-top:2px">
                  <span>🌱</span><span>🌿</span><span>🌸</span><span>🍅</span><span>🎯</span>
                </div>
              </div>
              <div style="margin-top:10px;background:linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,165,0,0.1));padding:8px 12px;border-radius:var(--radius-sm);border-left:3px solid #ffd700;display:inline-block">
                <span style="font-size:0.7rem;color:var(--text-light)">🌾 Expected Harvest:</span>
                <span style="font-weight:700;color:var(--green-deep);margin-left:6px">${expectedMonth}</span>
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
    const assignedGH = user.assignedGH || [];
    const greenhouses = AFV.greenhouses.filter(g => assignedGH.includes(g.id));
    const harvest = AFV.harvest || {};
    
    let html = `<div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none"><div><div class="page-title" style="color:white">Harvest 🌾</div><div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Track yields for your greenhouses</div></div></div><div class="page-body">`;
    
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
      html += `<button class="btn-primary" onclick="SupervisorDashboard.openHarvestModal(${gh.id})">+ Record Harvest</button>`;
      html += `<div class="scroll-x" style="margin-top:12px"><table><thead><tr><th>Date</th><th>Qty</th><th>Quality</th><th>Notes</th><th></th></tr></thead><tbody>`;
      if(records.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center;color:var(--text-light)">No harvests recorded</td></tr>`;
      } else {
        records.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(r => {
          html += `<tr><td>${new Date(r.date).toLocaleDateString()}</td><td>${r.quantity} ${r.unit}</td><td><span style="color:${r.quality==='grade1'?'var(--green-fresh)':r.quality==='grade2'?'var(--blue-water)':r.quality==='grade3'?'var(--orange-warn)':'var(--red-alert)'}">${r.quality==='grade1'?'⭐ Grade 1':r.quality==='grade2'?'⭐⭐ Grade 2':r.quality==='grade3'?'⭐⭐⭐ Grade 3':'❌ Reject'}</span></td><td>${r.notes||'-'}</td><td><button onclick="SupervisorDashboard.deleteHarvest(${gh.id},${r.id})" style="background:var(--red-alert);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">🗑️</button></td></tr>`;
        });
      }
      html += `</tbody></table></div></div>`;
    });
    
    html += `</div>`;
    
    return html;
  },

  openHarvestModal(ghId) {
    const gh = AFV.greenhouses.find(g => g.id === ghId);
    const gradePrices = gh?.gradePrices || { grade1: 150, grade2: 120, grade3: 80, reject: 0 };
    const modal = document.getElementById('supervisor-harvest-modal');
    
    // Update the quality dropdown with grade prices
    const qualitySelect = document.getElementById('supervisor-harvest-quality');
    qualitySelect.innerHTML = `<option value="grade1">⭐ Grade 1 (KES ${gradePrices.grade1}/kg)</option><option value="grade2">⭐⭐ Grade 2 (KES ${gradePrices.grade2}/kg)</option><option value="grade3">⭐⭐⭐ Grade 3 (KES ${gradePrices.grade3}/kg)</option><option value="reject">❌ Reject (No value)</option>`;
    
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
    
    // Update price when grade changes
    qualitySelect.onchange = function() {
      const prices = JSON.parse(modal.dataset.gradePrices);
      const newPrice = prices[this.value] || 0;
      document.getElementById('supervisor-harvest-price').value = newPrice;
      document.getElementById('supervisor-harvest-price-input').value = newPrice;
      updateValue();
    };
  },

  closeHarvestModal() {
    document.getElementById('supervisor-harvest-modal').style.display = 'none';
  },

  saveHarvest(e) {
    e.preventDefault();
    const ghId = parseInt(document.getElementById('supervisor-harvest-gh-id').value);
    const quantity = parseFloat(document.getElementById('supervisor-harvest-qty').value);
    const unit = document.getElementById('supervisor-harvest-unit').value;
    const quality = document.getElementById('supervisor-harvest-quality').value;
    const date = document.getElementById('supervisor-harvest-date').value;
    const notes = document.getElementById('supervisor-harvest-notes').value;
    const pricePerKg = parseFloat(document.getElementById('supervisor-harvest-price-input').value) || 0;
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
    
    AFV.saveState();
    this.closeHarvestModal();
    this.showPage('harvest');
  },

  deleteHarvest(ghId, recordId) {
    if(!confirm('Delete this harvest record?')) return;
    if(AFV.harvest[ghId]) {
      AFV.harvest[ghId] = AFV.harvest[ghId].filter(r => r.id !== recordId);
      AFV.saveState();
      this.showPage('harvest');
    }
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
              <input type="date" id="receipt-date" value="${new Date().toISOString().split('T')[0]}" style="background:white;border:1px solid var(--green-pale)">
            </div>
            <div class="input-group" style="margin:0">
              <label style="font-size:0.8rem;color:var(--text-light)">Customer (Optional)</label>
              <input type="text" id="receipt-customer" placeholder="Customer name" style="background:white;border:1px solid var(--green-pale)">
            </div>
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
                <div style="width:48px;height:48px;background:linear-gradient(135deg,${r.isAdmin ? '#9b59b6' : 'var(--green-fresh)'},${r.isAdmin ? '#8e44ad' : 'var(--green-forest)'});border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:white">🧾</div>
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
    `;
  },

  addReceipt() {
    const product = document.getElementById('receipt-product').value.trim();
    const amount = document.getElementById('receipt-amount').value.trim();
    const date = document.getElementById('receipt-date').value;
    const customer = document.getElementById('receipt-customer').value.trim();
    const transactionCode = document.getElementById('receipt-transaction-code').value.trim();
    
    if (!product || !amount || !date) {
      showToast('Please fill in product, amount, and date', 'error');
      return;
    }
    
    if (!AFV.receipts) AFV.receipts = [];
    
    const receipt = {
      id: Date.now(),
      product,
      amount: parseFloat(amount),
      date,
      customer: customer || 'Walk-in Customer',
      transactionCode: transactionCode || '',
      recordedBy: 'supervisor',
      role: 'supervisor',
      recordedAt: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    
    AFV.receipts.push(receipt);
    AFV.saveState();
    AFV.logActivity('🧾', `Sale recorded: ${product} - KES ${parseFloat(amount).toLocaleString()}`);
    
    showToast('Receipt saved successfully!', 'success');
    this.showPage('sales');
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

  // ============================================ WORKERS MANAGEMENT

  renderWorkers() {
    const workers = AFV.workers || [];
    const avatars = ['👨‍🌾', '👩‍🌾', '👨‍💻', '👩‍💻', '🧑‍🌾'];
    return `
      <div class="page-header">
        <div>
          <div class="page-title">My Workers 👥</div>
          <div class="page-subtitle">Manage your field workers</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" onclick="SupervisorDashboard.openWorkerModal()">➕ Add Worker</button>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon">👥</div><div><div class="stat-value">${workers.length}</div><div class="stat-label">Total Workers</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${workers.filter(w => w.assignedGH && w.assignedGH.length > 0).length}</div><div class="stat-label">Assigned</div></div></div>
          <div class="stat-card"><div class="stat-icon">⏳</div><div><div class="stat-value">${workers.filter(w => !w.assignedGH || w.assignedGH.length === 0).length}</div><div class="stat-label">Unassigned</div></div></div>
        </div>
        <div class="stats-grid">
          ${workers.map(w => {
            const tasks = AFV.getTasksForWorker(w.id);
            return `
              <div class="card" style="text-align:center;border:1px solid var(--blue-pale)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                  <div style="font-size:3rem;">${w.imageUrl ? `<img src="${w.imageUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid var(--blue-water)">` : w.avatar}</div>
                  <div style="display:flex;gap:6px">
                    <button onclick="SupervisorDashboard.openWorkerModal('${w.id}')" class="btn-icon" title="Edit worker" style="background:var(--blue-water);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">✏️</button>
                    <button onclick="SupervisorDashboard.deleteWorker('${w.id}')" class="btn-icon" title="Delete worker" style="background:var(--red-alert);color:white;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:0.8rem">🗑️</button>
                  </div>
                </div>
                <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--blue-deep)">${w.name}</div>
                <div style="color:var(--text-light);font-size:0.78rem;margin-bottom:14px">Field Worker</div>
                <div style="margin-bottom:10px">
                  ${w.assignedGH?.map(ghId => {
                    const gh = AFV.greenhouses.find(g => g.id === ghId);
                    return gh ? `<span class="badge badge-blue" style="margin:2px">${gh.cropEmoji} ${gh.name}</span>` : '';
                  }).join('') || '<span style="font-size:0.75rem;color:var(--text-light)">No assignments</span>'}
                </div>
                <div style="background:rgba(59, 130, 246, 0.1);border-radius:var(--radius-sm);padding:10px">
                  <div style="font-size:1.4rem;font-weight:800;color:var(--blue-water)">${tasks.length}</div>
                  <div style="font-size:0.72rem;color:var(--text-light)">Pending Tasks</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
      <div id="supervisor-worker-modal" class="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center">
        <div class="modal-content" style="background:white;border-radius:var(--radius-md);padding:24px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h2 style="font-family:'Playfair Display',serif;color:var(--blue-deep);margin:0" id="supervisor-worker-modal-title">Add Worker</h2>
            <button onclick="SupervisorDashboard.closeWorkerModal()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light)">×</button>
          </div>
          <form id="supervisor-worker-form" onsubmit="SupervisorDashboard.saveWorker(event)">
            <input type="hidden" id="supervisor-worker-id">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Username (Login ID)</label>
              <input type="text" id="supervisor-worker-username" required style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="e.g., worker1">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Full Name</label>
              <input type="text" id="supervisor-worker-name" required style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Enter worker's full name">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Avatar</label>
              <div id="supervisor-worker-avatar-options" style="display:flex;gap:8px;flex-wrap:wrap">
                ${avatars.map(a => `<label style="cursor:pointer"><input type="radio" name="supervisor-worker-avatar" value="${a}" style="display:none"><div class="avatar-option" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;border:2px solid var(--blue-pale);border-radius:50%;transition:all 0.2s">${a}</div></label>`).join('')}
              </div>
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Password</label>
              <input type="password" id="supervisor-worker-password" required style="width:100%;padding:10px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);font-size:0.95rem" placeholder="Login password (default: 1234)">
            </div>
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-dark);margin-bottom:6px">Assign to Greenhouses</label>
              <div style="display:flex;flex-direction:column;gap:8px;max-height:150px;overflow-y:auto">
                ${AFV.greenhouses.map(gh => `
                  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px;background:rgba(59, 130, 246, 0.1);border-radius:var(--radius-sm)">
                    <input type="checkbox" class="supervisor-worker-gh-checkbox" value="${gh.id}" style="width:18px;height:18px">
                    <span style="font-size:1.2rem">${gh.cropEmoji}</span>
                    <span style="font-size:0.9rem;font-weight:500">${gh.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
              <button type="button" onclick="SupervisorDashboard.closeWorkerModal()" class="btn-secondary" style="padding:10px 20px">Cancel</button>
              <button type="submit" class="btn-primary" style="padding:10px 24px">💾 Save Worker</button>
            </div>
          </form>
        </div>
      </div>
      <style>
        .avatar-option:hover { transform: scale(1.1); }
        input[name="supervisor-worker-avatar"]:checked + .avatar-option { border-color: var(--blue-water); background: rgba(59, 130, 246, 0.1); }
      </style>
    `;
  },

  openWorkerModal(workerId = null) {
    const modal = document.getElementById('supervisor-worker-modal');
    const title = document.getElementById('supervisor-worker-modal-title');
    const form = document.getElementById('supervisor-worker-form');
    
    form.reset();
    document.querySelectorAll('.avatar-option').forEach(el => el.style.borderColor = 'var(--blue-pale)');
    
    if (workerId) {
      const worker = AFV.workers.find(w => w.id === workerId);
      if (worker) {
        title.textContent = 'Edit Worker';
        document.getElementById('supervisor-worker-id').value = worker.id;
        document.getElementById('supervisor-worker-username').value = worker.id;
        document.getElementById('supervisor-worker-name').value = worker.name;
        document.getElementById('supervisor-worker-password').value = worker.password;
        
        // Set avatar
        const avatarInput = document.querySelector(`input[name="supervisor-worker-avatar"][value="${worker.avatar}"]`);
        if (avatarInput) {
          avatarInput.checked = true;
          avatarInput.nextElementSibling.style.borderColor = 'var(--blue-water)';
        }
        
        // Set greenhouse assignments
        document.querySelectorAll('.supervisor-worker-gh-checkbox').forEach(cb => {
          cb.checked = worker.assignedGH?.includes(parseInt(cb.value));
        });
      }
    } else {
      title.textContent = 'Add Worker';
      document.getElementById('supervisor-worker-id').value = '';
      const firstAvatar = document.querySelector('input[name="supervisor-worker-avatar"]');
      if (firstAvatar) {
        firstAvatar.checked = true;
        firstAvatar.nextElementSibling.style.borderColor = 'var(--blue-water)';
      }
    }
    
    modal.style.display = 'flex';
  },

  closeWorkerModal() {
    document.getElementById('supervisor-worker-modal').style.display = 'none';
  },

  saveWorker(e) {
    e.preventDefault();
    const id = document.getElementById('supervisor-worker-id').value;
    const username = document.getElementById('supervisor-worker-username').value.trim();
    const name = document.getElementById('supervisor-worker-name').value.trim();
    const password = document.getElementById('supervisor-worker-password').value.trim();
    const avatar = document.querySelector('input[name="supervisor-worker-avatar"]:checked')?.value || '👨‍🌾';
    const assignedGH = Array.from(document.querySelectorAll('.supervisor-worker-gh-checkbox:checked')).map(cb => parseInt(cb.value));
    
    if (!username || !name || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    if (id) {
      // Edit existing worker
      const index = AFV.workers.findIndex(w => w.id === id);
      if (index !== -1) {
        AFV.workers[index] = { id: username, name, role: 'worker', password, avatar, assignedGH, addedBy: 'supervisor', imageUrl: '' };
        AFV.logActivity('✏️', `Worker updated: ${name}`);
        showToast(`Worker "${name}" updated!`, 'success');
      }
    } else {
      // Add new worker
      AFV.workers.push({ id: username, name, role: 'worker', password, avatar, assignedGH, addedBy: 'supervisor', imageUrl: '' });
      AFV.logActivity('➕', `New worker added: ${name}`);
      showToast(`Worker "${name}" added!`, 'success');
    }
    
    // Save state after worker modification
    AFV.saveState();
    
    this.closeWorkerModal();
    this.showPage('workers');
  },

  deleteWorker(workerId) {
    const worker = AFV.workers.find(w => w.id === workerId);
    if (!worker) return;
    
    if (!confirm(`Are you sure you want to delete "${worker.name}"?`)) {
      return;
    }
    
    AFV.workers = AFV.workers.filter(w => w.id !== workerId);
    AFV.logActivity('🗑️', `Worker deleted: ${worker.name}`);
    AFV.saveState();
    showToast(`Worker "${worker.name}" deleted`, 'success');
    this.showPage('workers');
  },

  // ============================================ ASSIGN TASKS

  renderAssignTasks() {
    const workers = AFV.workers || [];
    const greenhouses = AFV.greenhouses || [];
    
    // Get all tasks that can be assigned (not completed)
    const allTasks = [];
    greenhouses.forEach(gh => {
      gh.tasks.filter(t => !t.completed).forEach(task => {
        allTasks.push({ gh, task });
      });
    });
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">Assign Tasks 📋</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Assign tasks to workers and verify completion</div>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);gap:10px">
          <div class="stat-card" style="padding:12px"><div class="stat-icon" style="font-size:1.2rem">👥</div><div><div class="stat-value" style="font-size:1.2rem">${workers.length}</div><div class="stat-label" style="font-size:0.65rem">Workers</div></div></div>
          <div class="stat-card" style="padding:12px"><div class="stat-icon" style="font-size:1.2rem">📋</div><div><div class="stat-value" style="font-size:1.2rem">${allTasks.length}</div><div class="stat-label" style="font-size:0.65rem">Pending</div></div></div>
          <div class="stat-card" style="padding:12px"><div class="stat-icon" style="font-size:1.2rem">✅</div><div><div class="stat-value" style="font-size:1.2rem">${greenhouses.reduce((s, gh) => s + gh.tasks.filter(t => t.completed).length, 0)}</div><div class="stat-label" style="font-size:0.65rem">Done</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title" style="font-size:0.95rem">Pending Tasks</div>
          ${allTasks.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">All tasks completed!</div>' : `
          <!-- Desktop Table View -->
          <div class="scroll-x" style="display:block">
            <table class="desktop-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Duration</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allTasks.map(({gh, task}) => {
                  const assignedTo = task.assignedTo ? AFV.workers.find(w => w.id === task.assignedTo) : null;
                  return `
                    <tr style="background:${task.assignedTo ? 'rgba(59, 130, 246, 0.05)' : 'white'}">
                      <td><div style="font-weight:600;font-size:0.85rem">${task.name}</div><div style="font-size:0.65rem;color:var(--text-light)">${task.desc?.substring(0,30)}...</div></td>
                      <td style="font-size:0.8rem">${gh.cropEmoji} ${gh.name}</td>
                      <td style="font-size:0.8rem">${task.duration}</td>
                      <td><span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}" style="font-size:0.65rem">${task.priority}</span></td>
                      <td>${assignedTo ? `<div style="text-align:center"><div style="font-size:1rem">${assignedTo.avatar}</div><div style="font-size:0.6rem;color:var(--text-light)">${assignedTo.name}</div></div>` : '<span style="color:var(--text-light);font-size:0.8rem">—</span>'}</td>
                      <td>${task.verified ? '<span class="badge badge-green" style="font-size:0.65rem">✓</span>' : task.assignedTo ? '<span class="badge badge-blue" style="font-size:0.65rem">✓</span>' : '<span class="badge badge-gray" style="font-size:0.65rem">—</span>'}</td>
                      <td>
                        ${!task.assignedTo ? `
                          <div style="display:flex;gap:3px">
                            <select id="assign-worker-${gh.id}-${task.id}" style="padding:3px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.6rem;width:60px">
                              <option value="">Select</option>
                              ${workers.map(w => `<option value="${w.id}">${w.avatar}</option>`).join('')}
                            </select>
                            <button onclick="SupervisorDashboard.assignTask('${gh.id}', '${task.id}')" style="padding:3px 6px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.6rem">→</button>
                          </div>
                        ` : `
                          ${!task.verified ? `<button onclick="SupervisorDashboard.verifyTask('${gh.id}', '${task.id}')" style="padding:3px 6px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.6rem">✓</button>` : '<span style="color:var(--green-fresh);font-size:0.8rem">✓</span>'}
                        `}
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Mobile Card View -->
          <div class="mobile-cards" style="display:none">
            ${allTasks.map(({gh, task}) => {
              const assignedTo = task.assignedTo ? AFV.workers.find(w => w.id === task.assignedTo) : null;
              return `
                <div style="background:${task.assignedTo ? 'rgba(59, 130, 246, 0.08)' : 'var(--green-ultra-pale)'};border-radius:8px;padding:12px;margin-bottom:10px;border-left:3px solid ${task.priority==='high'?'var(--red-alert)':task.priority==='medium'?'var(--orange-warn)':'var(--green-fresh)'}">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                    <div style="flex:1">
                      <div style="font-weight:600;font-size:0.9rem;color:var(--green-deep)">${task.name}</div>
                      <div style="font-size:0.7rem;color:var(--text-light)">${gh.cropEmoji} ${gh.name} · ${task.duration}</div>
                    </div>
                    <span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}" style="font-size:0.6rem">${task.priority}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <div>
                      ${assignedTo ? `<div style="font-size:0.75rem"><span style="font-size:1rem">${assignedTo.avatar}</span> ${assignedTo.name}</div>` : '<span style="font-size:0.7rem;color:var(--text-light)">Unassigned</span>'}
                      <div style="font-size:0.65rem;color:${task.verified ? 'var(--green-fresh)' : task.assignedTo ? 'var(--blue-water)' : 'var(--text-light)'}">${task.verified ? '✓ Verified' : task.assignedTo ? 'Assigned' : 'Pending'}</div>
                    </div>
                    ${!task.assignedTo ? `
                      <div style="display:flex;gap:4px;align-items:center">
                        <select id="assign-worker-mobile-${gh.id}-${task.id}" style="padding:6px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.75rem;width:70px">
                          <option value="">Worker</option>
                          ${workers.map(w => `<option value="${w.id}">${w.avatar} ${w.name.split(' ')[0]}</option>`).join('')}
                        </select>
                        <button onclick="SupervisorDashboard.assignTask('${gh.id}', '${task.id}')" style="padding:6px 10px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">Assign</button>
                      </div>
                    ` : `
                      ${!task.verified ? `<button onclick="SupervisorDashboard.verifyTask('${gh.id}', '${task.id}')" style="padding:6px 12px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem">✓ Verify</button>` : '<span style="color:var(--green-fresh);font-size:1.2rem">✓</span>'}
                    `}
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
        
        <div class="card" style="margin-top:16px">
          <div class="section-title" style="font-size:0.9rem;margin-bottom:12px">💬 Add Comment</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <select id="comment-gh" style="padding:10px;border-radius:6px;border:1px solid var(--blue-pale);font-size:0.85rem">
              <option value="">Select Greenhouse</option>
              ${greenhouses.map(gh => `<option value="${gh.id}">${gh.cropEmoji} ${gh.name}</option>`).join('')}
            </select>
            <select id="comment-task" style="padding:10px;border-radius:6px;border:1px solid var(--blue-pale);font-size:0.85rem">
              <option value="">Select Task</option>
            </select>
            <input type="text" id="comment-text" placeholder="Enter comment..." style="padding:10px;border-radius:6px;border:1px solid var(--blue-pale);font-size:0.85rem">
            <button onclick="SupervisorDashboard.addComment()" style="padding:12px;background:var(--blue-water);color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.9rem;font-weight:600">💬 Add Comment</button>
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
    
    const gh = AFV.greenhouses.find(g => g.id === parseInt(ghId));
    const task = gh.tasks.find(t => t.id === taskId);
    
    if (gh && task) {
      task.assignedTo = workerId;
      task.assignedAt = new Date();
      task.verified = false;
      AFV.logActivity('📋', `Task "${task.name}" assigned to worker`);
      showToast('Task assigned successfully!', 'success');
      this.showPage('assign-tasks');
    }
  },

  verifyTask(ghId, taskId) {
    const comment = prompt('Add verification comment (optional):');
    
    const gh = AFV.greenhouses.find(g => g.id === parseInt(ghId));
    const task = gh.tasks.find(t => t.id === taskId);
    
    if (gh && task) {
      task.completed = true;
      task.completedAt = new Date();
      task.verified = true;
      task.verifiedBy = AFV.currentUser.name;
      task.verificationComment = comment || '';
      AFV.logActivity('✅', `Task "${task.name}" verified by supervisor`);
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
    
    const gh = AFV.greenhouses.find(g => g.id === parseInt(ghId));
    const task = gh.tasks.find(t => t.id === taskId);
    
    if (gh && task) {
      task.comment = comment;
      task.commentBy = AFV.currentUser.name;
      task.commentAt = new Date();
      AFV.logActivity('💬', `Comment added to "${task.name}": ${comment}`);
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
    
    const gh = AFV.greenhouses.find(g => g.id === parseInt(ghId));
    if (!gh) {
      showToast('Greenhouse not found', 'error');
      return;
    }
    
    const newTask = {
      id: 'task_' + Date.now(),
      name: name,
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
    AFV.saveState();
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
    const assigned = allTasks.filter(t => t.task.assignedTo && !t.task.verified);
    const unassigned = allTasks.filter(t => !t.task.assignedTo);

    return `
      <div class="page-header">
        <div>
          <div class="page-title">Pending Tasks ⏳</div>
          <div class="page-subtitle">Assign tasks to workers and verify completion</div>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-value">${pending.length}</div><div class="stat-label">Pending Tasks</div></div></div>
          <div class="stat-card"><div class="stat-icon">👥</div><div><div class="stat-value">${assigned.length}</div><div class="stat-label">Assigned</div></div></div>
          <div class="stat-card"><div class="stat-icon">⏰</div><div><div class="stat-value">${unassigned.length}</div><div class="stat-label">Unassigned</div></div></div>
        </div>
        
        <div class="card">
          <div class="section-title">All Pending Tasks</div>
          ${allTasks.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-light)">All tasks completed!</div>' : `
          <div class="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Greenhouse</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allTasks.map(({gh, task}) => {
                  const assignedTo = task.assignedTo ? AFV.workers.find(w => w.id === task.assignedTo) : null;
                  return `
                    <tr>
                      <td><div style="font-weight:600">${task.name}</div><div style="font-size:0.72rem;color:var(--text-light)">${task.desc?.substring(0,40)}...</div></td>
                      <td>${gh.cropEmoji} ${gh.name}</td>
                      <td><span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}">${task.priority}</span></td>
                      <td>${assignedTo ? `<div style="text-align:center"><div style="font-size:1.2rem">${assignedTo.avatar}</div><div style="font-size:0.7rem;color:var(--text-light)">${assignedTo.name}</div></div>` : '<span style="color:var(--text-light)">—</span>'}</td>
                      <td>${task.verified ? '<span class="badge badge-green">✓ Verified</span>' : task.assignedTo ? '<span class="badge badge-blue">Assigned</span>' : '<span class="badge badge-gray">Unassigned</span>'}</td>
                      <td>
                        <input type="text" id="comment-${gh.id}-${task.id}" placeholder="Add comment..." value="${task.supervisorComment || ''}" style="padding:4px 8px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.75rem;width:120px">
                        <button onclick="SupervisorDashboard.saveTaskComment('${gh.id}', '${task.id}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem;margin-left:2px">💾</button>
                      </td>
                      <td>
                        ${!task.assignedTo ? `
                          <div style="display:flex;gap:4px">
                            <select id="assign-worker-${gh.id}-${task.id}" style="padding:4px;border-radius:4px;border:1px solid var(--blue-pale);font-size:0.7rem;width:80px">
                              <option value="">Select</option>
                              ${workers.map(w => `<option value="${w.id}">${w.avatar} ${w.name}</option>`).join('')}
                            </select>
                            <button onclick="SupervisorDashboard.assignTask('${gh.id}', '${task.id}')" style="padding:4px 8px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">Assign</button>
                          </div>
                        ` : task.assignedTo && !task.verified ? `
                          <button onclick="SupervisorDashboard.verifyTask('${gh.id}', '${task.id}')" style="padding:4px 8px;background:var(--green-fresh);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.7rem">✅ Verify</button>
                        ` : '<span class="badge badge-green">✓ Done</span>'}
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

  saveTaskComment(ghId, taskId) {
    const input = document.getElementById(`comment-${ghId}-${taskId}`);
    const comment = input.value.trim();
    
    const gh = AFV.greenhouses.find(g => g.id === parseInt(ghId));
    const task = gh?.tasks.find(t => t.id === taskId);
    
    if (task) {
      task.supervisorComment = comment;
      task.commentAt = new Date();
      showToast('Comment saved!', 'success');
      this.showPage('pending-tasks');
    }
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
                  const assignedTo = task.assignedTo ? AFV.workers.find(w => w.id === task.assignedTo) : null;
                  const completedDate = task.completedAt ? task.completedAt.toLocaleDateString('en-KE') : (task.verifiedAt ? task.verifiedAt.toLocaleDateString('en-KE') : '—');
                  return `
                    <tr>
                      <td style="text-decoration:line-through;opacity:0.7"><div style="font-weight:600">${task.name}</div></td>
                      <td>${gh.cropEmoji} ${gh.name}</td>
                      <td>${assignedTo ? `<div style="text-align:center"><div style="font-size:1rem">${assignedTo.avatar}</div><div style="font-size:0.7rem;color:var(--text-light)">${assignedTo.name}</div></div>` : '<span style="color:var(--text-light)">—</span>'}</td>
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
    const userId = AFV.currentUser?.id;
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
                  <div style="font-size:0.75rem;color:var(--text-light)">Submitted ${new Date(r.submittedAt).toLocaleDateString('en-KE')}</div>
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
    const tasks = AFV.tasks || [];
    const userId = AFV.currentUser?.id;
    const myTasks = tasks.filter(t => t.assignedTo === userId && t.status !== 'completed');
    
    // Get pending and completed counts
    const pendingTasks = myTasks.filter(t => t.status === 'pending');
    const inProgressTasks = myTasks.filter(t => t.status === 'in-progress');
    
    return `
      <div class="page-header">
        <div>
          <div class="page-title">📋 My Tasks</div>
          <div class="page-subtitle">View and manage your assigned tasks</div>
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat-card"><div class="stat-icon">📥</div><div><div class="stat-value">${pendingTasks.length}</div><div class="stat-label">Pending</div></div></div>
          <div class="stat-card"><div class="stat-icon">🔄</div><div><div class="stat-value">${inProgressTasks.length}</div><div class="stat-label">In Progress</div></div></div>
          <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-value">${myTasks.filter(t => t.status === 'completed').length}</div><div class="stat-label">Completed</div></div></div>
        </div>
        
        ${myTasks.length === 0 ? `
          <div class="card">
            <div style="text-align:center;padding:40px;color:var(--text-light)">
              <div style="font-size:3rem;margin-bottom:16px">📋</div>
              <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px">No Tasks Assigned</div>
              <div style="font-size:0.9rem">You don't have any tasks assigned yet.</div>
            </div>
          </div>
        ` : `
          ${['pending', 'in-progress'].map(status => {
            const statusTasks = myTasks.filter(t => t.status === status);
            if (statusTasks.length === 0) return '';
            const statusLabel = status === 'pending' ? '📥 Pending Tasks' : '🔄 In Progress';
            return `
              <div class="card" style="margin-top:20px">
                <div class="section-title">${statusLabel}</div>
                ${statusTasks.map(task => `
                  <div style="padding:16px;border:1px solid var(--blue-pale);border-radius:var(--radius-sm);margin-bottom:12px">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                      <div style="font-weight:600">${task.title}</div>
                      <span style="padding:4px 10px;background:${status === 'pending' ? 'rgba(241,196,15,0.15)' : 'rgba(52,152,219,0.15)'};color:${status === 'pending' ? '#f39c12' : '#3498db'};border-radius:12px;font-size:0.75rem;font-weight:600">${status === 'pending' ? 'Pending' : 'In Progress'}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-mid);margin-bottom:8px">${task.description}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div style="font-size:0.75rem;color:var(--text-light)">Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-KE') : 'No due date'}</div>
                      ${status === 'pending' ? `
                        <button onclick="SupervisorDashboard.startTask('${task.id}')" style="padding:6px 12px;background:var(--blue-water);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem">Start Task</button>
                      ` : `
                        <button onclick="SupervisorDashboard.completeTask('${task.id}')" style="padding:6px 12px;background:var(--green-deep);color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem">Mark Complete</button>
                      `}
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}
        `}
      </div>
    `;
  },

  startTask(taskId) {
    const task = AFV.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'in-progress';
      task.startedAt = new Date().toISOString();
      AFV.saveState();
      showToast('Task started!', 'success');
      this.navigate('tasks');
    }
  },

  completeTask(taskId) {
    const task = AFV.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      AFV.saveState();
      showToast('Task completed!', 'success');
      this.navigate('tasks');
    }
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
      supervisorId: AFV.currentUser.id,
      supervisorName: AFV.currentUser.name,
      weekStart: startOfWeek.toISOString(),
      summary,
      challenges,
      goals,
      submittedAt: new Date()
    };
    
    AFV.weeklyReports.push(report);
    AFV.saveState();
    showToast('Weekly report submitted successfully!', 'success');
    this.showPage('weekly-reports');
  }
};

// ============================================
// AI HELPER FOR SUPERVISOR
// ============================================
SupervisorDashboard.renderAIHelper = function() {
  return `
    <div id="ai-helper-widget" style="position:fixed;bottom:20px;right:20px;z-index:9999">
      <button onclick="SupervisorDashboard.toggleAIChat()" style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#1a2e4a,#2d4a6e);border:none;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3);font-size:1.8rem">🤖</button>
    </div>
    <div id="ai-chat-modal" style="display:none;position:fixed;bottom:90px;right:20px;width:380px;max-width:90vw;background:white;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.2);z-index:9999;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a2e4a,#2d4a6e);color:white;padding:14px 16px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-weight:700;font-size:0.95rem">🤖 AgriBot AI Helper</div>
        <button onclick="SupervisorDashboard.toggleAIChat()" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;padding:0;line-height:1">×</button>
      </div>
      <div id="ai-chat-messages" style="height:300px;overflow-y:auto;padding:14px;background:#f0f4f8">
        <div style="background:white;padding:12px;border-radius:12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <div style="font-size:0.8rem;color:#1a2e4a;font-weight:600;margin-bottom:4px">🤖 AgriBot</div>
          <div style="font-size:0.9rem;color:#333">Hello! I'm your AI assistant powered by NVIDIA Nemotron. Ask me about your assigned greenhouses, tasks, or farming advice!</div>
        </div>
      </div>
      <div style="padding:12px;border-top:1px solid #eee;display:flex;gap:8px">
        <input id="ai-chat-input" type="text" placeholder="Ask about your tasks..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:0.9rem" onkeypress="if(event.key==='Enter')SupervisorDashboard.sendAIChat()">
        <button onclick="SupervisorDashboard.sendAIChat()" style="background:#1a2e4a;color:white;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:600">Send</button>
      </div>
    </div>
  `;
};

SupervisorDashboard.toggleAIChat = function() {
  const modal = document.getElementById('ai-chat-modal');
  modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
};

SupervisorDashboard.sendAIChat = async function() {
  const input = document.getElementById('ai-chat-input');
  const messages = document.getElementById('ai-chat-messages');
  const question = input.value.trim();
  if (!question) return;

  messages.innerHTML += `
    <div style="background:#1a2e4a;color:white;padding:10px 14px;border-radius:12px;margin-bottom:10px;margin-left:40px;box-shadow:0 1px 3px rgba(0,0,0,0.15)">
      <div style="font-size:0.75rem;opacity:0.8;margin-bottom:2px">You</div>
      <div style="font-size:0.9rem">${question}</div>
    </div>
  `;

  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  messages.innerHTML += `
    <div id="ai-loading" style="background:white;padding:12px;border-radius:12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
      <div style="font-size:0.8rem;color:#1a2e4a;font-weight:600;margin-bottom:4px">🤖 AgriBot</div>
      <div style="font-size:0.9rem;color:#666">Thinking...</div>
    </div>
  `;
  messages.scrollTop = messages.scrollHeight;

  const result = await AFV.askAI(question, 'Supervisor user asking about their assigned greenhouses and tasks');

  document.getElementById('ai-loading').remove();
  
  if (result.error) {
    messages.innerHTML += `
      <div style="background:#fee2e2;padding:12px;border-radius:12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        <div style="font-size:0.8rem;color:#dc2626;font-weight:600;margin-bottom:4px">🤖 AgriBot</div>
        <div style="font-size:0.9rem;color:#333">${result.error}</div>
      </div>
    `;
  } else {
    messages.innerHTML += `
      <div style="background:white;padding:12px;border-radius:12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        <div style="font-size:0.8rem;color:#1a2e4a;font-weight:600;margin-bottom:4px">🤖 AgriBot</div>
        <div style="font-size:0.9rem;color:#333;white-space:pre-wrap">${result.response}</div>
      </div>
    `;
  }
  messages.scrollTop = messages.scrollHeight;
};
