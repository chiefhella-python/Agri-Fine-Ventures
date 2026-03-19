// ============================================
// AGRI-FINE VENTURES — AGRONOMIST DASHBOARD
// ============================================

const AgronomistDashboard = {
  currentPage: 'overview',

  // Refresh current page (called when Firebase sync receives remote updates)
  refreshCurrentPage() {
    if (this.currentPage) {
      this.showPage(this.currentPage);
      console.log('AgronomistDashboard: Refreshed page after remote sync');
    }
  },

  init() {
    // Make AgronomistDashboard globally accessible
    window.AgronomistDashboard = this;
    
    this.renderNav();
    this.showPage('overview');
  },

  renderNav() {
    const nav = document.getElementById('agronomist-nav');
    nav.innerHTML = `
      <div class="sidebar-logo">
        <img src="/logo.png" alt="Agri-Fine" style="width:50px;height:50px;object-fit:contain;margin-bottom:6px">
        <div class="sidebar-logo-title">Agri-Fine</div>
        <div class="sidebar-logo-sub">Agronomist Portal</div>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar" style="background:#9b59b6">${AFV.currentUser.imageUrl ? `<img src="${AFV.currentUser.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : AFV.currentUser.avatar}</div>
        <div>
          <div class="user-name">${AFV.currentUser.name}</div>
          <div class="user-role">Lead Agronomist</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Analysis</div>
        <button class="nav-item active" data-page="overview" onclick="AgronomistDashboard.showPage('overview')">
          <span class="nav-icon">📊</span><span>Overview</span>
        </button>
        <button class="nav-item" data-page="gh-analysis" onclick="AgronomistDashboard.showPage('gh-analysis')">
          <span class="nav-icon">🔍</span><span>GH Analysis</span>
        </button>
        <button class="nav-item" data-page="reports" onclick="AgronomistDashboard.showPage('reports')">
          <span class="nav-icon">📝</span><span>My Reports</span>
        </button>
        <button class="nav-item" data-page="add-report" onclick="AgronomistDashboard.showPage('add-report')">
          <span class="nav-icon">✍️</span><span>New Report</span>
        </button>
        <div class="nav-section-label">Tools</div>
        <button class="nav-item" data-page="task-audit" onclick="AgronomistDashboard.showPage('task-audit')">
          <span class="nav-icon">🔎</span><span>Task Audit</span>
        </button>
        <button class="nav-item" data-page="crop-data" onclick="AgronomistDashboard.showPage('crop-data')">
          <span class="nav-icon">🌱</span><span>Crop Data</span>
        </button>
        <button class="nav-item" data-page="feeding" onclick="AgronomistDashboard.showPage('feeding')">
          <span class="nav-icon">🧪</span><span>Feeding Program</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" onclick="handleLogout()">🚪 <span>Sign Out</span></button>
      </div>
    `;
  },

  showPage(page) {
    this.currentPage = page;
    document.querySelectorAll('#agronomist-nav .nav-item').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`#agronomist-nav [data-page="${page}"]`);
    if (btn) btn.classList.add('active');
    const content = document.getElementById('agronomist-content');
    switch(page) {
      case 'overview': content.innerHTML = this.renderOverview(); break;
      case 'gh-analysis': content.innerHTML = this.renderGHAnalysis(); break;
      case 'reports': content.innerHTML = this.renderReports(); break;
      case 'add-report': content.innerHTML = this.renderAddReport(); this.attachReportEvents(); break;
      case 'edit-report': content.innerHTML = this.renderEditReport(); this.attachEditReportEvents(); break;
      case 'task-audit': content.innerHTML = this.renderTaskAudit(); break;
      case 'crop-data': content.innerHTML = this.renderCropData(); break;
      case 'feeding': content.innerHTML = this.renderFeeding(); break;
    }
  },

  renderOverview() {
    const totalPending = AFV.greenhouses.reduce((s,g) => s + g.tasks.filter(t => !t.completed).length, 0);
    const totalDone = AFV.greenhouses.reduce((s,g) => s + g.tasks.filter(t => t.completed).length, 0);
    const issueReports = AFV.agronomistReports.filter(r => r.type === 'issue').length;

    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🔬 Agronomist Dashboard</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Dr. Grace Njeri · ${new Date().toLocaleDateString('en-KE', {weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" style="background:rgba(155,89,182,0.8)" onclick="AgronomistDashboard.showPage('add-report')">✍️ New Report</button>
          
        </div>
      </div>
      <div class="page-body">
        <div class="stats-grid">
          <div class="stat-card agro-stat-card">
            <div class="stat-icon" style="background:rgba(155,89,182,0.1)">📝</div>
            <div><div class="stat-value" style="color:#9b59b6">${AFV.agronomistReports.length}</div><div class="stat-label">Total Reports Filed</div></div>
          </div>
          <div class="stat-card agro-stat-card">
            <div class="stat-icon">⚠️</div>
            <div><div class="stat-value" style="color:var(--red-alert)">${issueReports}</div><div class="stat-label">Active Issues Flagged</div></div>
          </div>
          <div class="stat-card agro-stat-card">
            <div class="stat-icon">⏳</div>
            <div><div class="stat-value" style="color:var(--orange-warn)">${totalPending}</div><div class="stat-label">Pending Farm Tasks</div></div>
          </div>
          <div class="stat-card agro-stat-card">
            <div class="stat-icon">✅</div>
            <div><div class="stat-value">${totalDone}</div><div class="stat-label">Tasks Completed</div></div>
          </div>
        </div>

        ${AFV.weather ? `
        <div style="background:linear-gradient(135deg,#1e3c72,#2a5298);border-radius:16px;padding:16px;color:white;margin-bottom:20px;position:relative;overflow:hidden">
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

        <div class="two-col">
          <div>
            <div class="card" style="margin-bottom:20px;border:1px solid #e8d5e8">
              <div class="section-title">🏡 Greenhouse Health Status</div>
              ${AFV.greenhouses.map(gh => {
                const issues = AFV.agronomistReports.filter(r => r.ghId === gh.id && r.type === 'issue').length;
                const progress = AFV.getOverallProgress(gh);
                const nextTask = gh.tasks ? gh.tasks.find(t => !t.completed) : null;
                return `
                  <div style="margin-bottom:14px;padding:14px;border-radius:var(--radius-sm);background:${issues>0?'rgba(214,48,49,0.03)':'var(--green-ultra-pale)'};border:1px solid ${issues>0?'rgba(214,48,49,0.12)':'var(--green-pale)'}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <div style="font-weight:700;font-size:0.9rem;color:var(--green-deep)">${gh.cropEmoji} ${gh.name} — ${gh.crop}</div>
                      <div style="display:flex;gap:6px">
                        ${issues > 0 ? `<span class="badge badge-red">⚠️ ${issues} Issue${issues>1?'s':''}</span>` : '<span class="badge badge-green">✅ Healthy</span>'}
                      </div>
                    </div>
                    <div class="gh-progress-bar" style="margin-bottom:6px">
                      <div class="gh-progress-fill" style="width:${progress}%"></div>
                    </div>
                    <div style="font-size:0.75rem;color:var(--text-light);display:flex;justify-content:space-between">
                      <span>${progress}% tasks complete</span>
                      <span>${nextTask && nextTask.name ? `Next: ${nextTask.name.substring(0,35)}...` : '✅ All tasks done'}</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-mid);margin-top:8px;font-style:italic">"${escapeHtml(gh.notes)}"</div>
                  </div>`;
              }).join('')}
            </div>
          </div>

          <div>
            <div class="card" style="margin-bottom:20px;border:1px solid #e8d5e8">
              <div class="section-title">📋 Tasks Not Yet Done — Why?</div>
              <div style="margin-bottom:12px;font-size:0.82rem;color:var(--text-light)">Tasks that are overdue or at-risk based on plant age and task sequence</div>
              ${(() => {
                const atRisk = [];
                AFV.greenhouses.forEach(gh => {
                  gh.tasks.forEach((task, idx) => {
                    if (!task.completed) {
                      const prevsDone = gh.tasks.slice(0,idx).every(t => t.completed);
                      const daysPlanted = Math.floor((new Date() - gh.plantedDate)/(1000*60*60*24));
                      const reasonArr = [];
                      if (!prevsDone) reasonArr.push('Previous tasks not yet complete');
                      if (task.priority === 'high') reasonArr.push('High priority — needs attention');
                      atRisk.push({gh, task, reason: reasonArr.join(', ') || 'Scheduled but pending'});
                    }
                  });
                });
                return atRisk.slice(0,6).map(({gh, task, reason}) => `
                  <div style="padding:10px;border-radius:var(--radius-sm);border:1px solid ${task.priority==='high'?'rgba(214,48,49,0.2)':'var(--green-pale)'};margin-bottom:8px;background:${task.priority==='high'?'rgba(214,48,49,0.03)':'transparent'}">
                    <div style="font-size:0.85rem;font-weight:600;margin-bottom:3px">${task.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:4px">${gh.name} · ${task.duration}</div>
                    <div style="font-size:0.75rem;background:rgba(155,89,182,0.08);color:#9b59b6;padding:3px 8px;border-radius:10px;display:inline-block">💡 ${reason}</div>
                  </div>`).join('');
              })()}
            </div>

            <div class="card" style="border:1px solid #e8d5e8">
              <div class="section-title">📝 My Recent Reports</div>
              ${AFV.agronomistReports.slice(0,3).map(r => `
                <div style="padding:10px;border-left:3px solid ${r.type==='issue'?'var(--red-alert)':r.type==='recommendation'?'var(--green-fresh)':'var(--orange-warn)'};margin-bottom:10px;background:var(--green-ultra-pale);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
                  <div style="font-size:0.78rem;font-weight:700;color:${r.type==='issue'?'var(--red-alert)':r.type==='recommendation'?'var(--green-forest)':'var(--orange-warn)'}">
                    ${r.type==='issue'?'⚠️ Issue':r.type==='recommendation'?'💡 Recommendation':'📝 Observation'}
                    ${r.acknowledged ? ' <span style="color:var(--green-fresh);font-size:0.68rem">(Reviewed by Admin)</span>' : ' <span style="color:#9b59b6;font-size:0.68rem">(Pending Review)</span>'}
                  </div>
                  <div style="font-size:0.82rem;color:var(--text-dark);margin-top:4px">${r.text.substring(0,100)}...</div>
                  <div style="font-size:0.7rem;color:var(--text-light);margin-top:4px">${timeAgo(r.timestamp)}</div>
                </div>`).join('')}
              <button class="agro-submit-btn" style="width:100%" onclick="AgronomistDashboard.showPage('add-report')">✍️ Write New Report</button>
            </div>
          </div>
        </div>
      </div>
      
    `;
  },

  renderGHAnalysis() {
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🔍 GH Deep Analysis</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Greenhouse-by-greenhouse technical review</div>
        </div>
      </div>
      <div class="page-body">
        ${AFV.greenhouses.map(gh => {
          const progress = AFV.getOverallProgress(gh);
          const issues = AFV.agronomistReports.filter(r => r.ghId === gh.id && r.type === 'issue');
          const recs = AFV.agronomistReports.filter(r => r.ghId === gh.id && r.type === 'recommendation');
          const daysPlanted = Math.floor((new Date() - gh.plantedDate)/(1000*60*60*24));

          return `
            <div class="agro-report" style="margin-bottom:20px">
              <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
                <div class="${gh.bgClass}" style="width:56px;height:56px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;background-size:cover;background-position:center">${gh.imageUrl ? `<img src="${gh.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)">` : gh.cropEmoji}</div>
                <div style="flex:1">
                  <div style="font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:800;color:var(--green-deep)">${gh.name} — ${gh.crop} (${gh.variety})</div>
                  <div style="font-size:0.78rem;color:var(--text-light)">${daysPlanted} days old · ${gh.plants.toLocaleString()} plants · ${gh.area}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:1.6rem;font-weight:900;color:${progress<50?'var(--orange-warn)':progress<80?'var(--green-forest)':'var(--green-fresh)'}">${progress}%</div>
                  <div style="font-size:0.68rem;color:var(--text-light)">TASKS DONE</div>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
                <div style="background:rgba(9,132,227,0.06);border-radius:var(--radius-sm);padding:10px;text-align:center">
                  <div style="font-size:1.1rem;font-weight:700;color:var(--blue-water)">${gh.environment.temp}</div>
                  <div style="font-size:0.65rem;color:var(--text-light)">TEMPERATURE</div>
                </div>
                <div style="background:rgba(9,132,227,0.06);border-radius:var(--radius-sm);padding:10px;text-align:center">
                  <div style="font-size:1.1rem;font-weight:700;color:var(--blue-water)">${gh.environment.humidity}</div>
                  <div style="font-size:0.65rem;color:var(--text-light)">HUMIDITY</div>
                </div>
                <div style="background:rgba(106,171,94,0.08);border-radius:var(--radius-sm);padding:10px;text-align:center">
                  <div style="font-size:1.1rem;font-weight:700;color:var(--green-forest)">${gh.environment.ph}</div>
                  <div style="font-size:0.65rem;color:var(--text-light)">SUBSTRATE pH</div>
                </div>
                <div style="background:rgba(106,171,94,0.08);border-radius:var(--radius-sm);padding:10px;text-align:center">
                  <div style="font-size:1.1rem;font-weight:700;color:var(--green-forest)">${gh.environment.ec}</div>
                  <div style="font-size:0.65rem;color:var(--text-light)">EC (mS/cm)</div>
                </div>
              </div>

              <div style="font-size:0.85rem;color:var(--text-mid);margin-bottom:14px;font-style:italic;border-left:3px solid #9b59b6;padding-left:10px">"${escapeHtml(gh.notes)}"</div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
                <div>
                  <div style="font-size:0.78rem;font-weight:700;color:var(--red-alert);text-transform:uppercase;margin-bottom:8px">⚠️ Issues (${issues.length})</div>
                  ${issues.length===0?'<div style="font-size:0.8rem;color:var(--green-fresh)">✅ No active issues</div>':issues.map(r=>`<div style="font-size:0.8rem;background:rgba(214,48,49,0.05);padding:8px;border-radius:var(--radius-sm);margin-bottom:6px;border-left:2px solid var(--red-alert)">${r.text.substring(0,100)}...</div>`).join('')}
                </div>
                <div>
                  <div style="font-size:0.78rem;font-weight:700;color:var(--green-forest);text-transform:uppercase;margin-bottom:8px">💡 Recommendations (${recs.length})</div>
                  ${recs.length===0?`<div style="font-size:0.8rem;color:var(--text-light)">No recommendations yet</div>`:recs.map(r=>`<div style="font-size:0.8rem;background:rgba(106,171,94,0.06);padding:8px;border-radius:var(--radius-sm);margin-bottom:6px;border-left:2px solid var(--green-fresh)">${r.text.substring(0,100)}...</div>`).join('')}
                </div>
              </div>
              <button class="agro-submit-btn" style="margin-top:12px;font-size:0.8rem;padding:8px 16px" onclick="AgronomistDashboard.prepareReport('${gh.id}')">
                + Add Report for This GH
              </button>
            </div>`;
        }).join('')}
      </div>
      
    `;
  },

  renderReports() {
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">📝 My Reports</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${AFV.agronomistReports.length} reports filed</div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" style="background:rgba(155,89,182,0.8)" onclick="AgronomistDashboard.showPage('add-report')">+ New Report</button>
        </div>
      </div>
      <div class="page-body">
        ${AFV.agronomistReports.length === 0 ? '<div class="empty-state card"><div class="empty-icon">📋</div><div class="empty-text">No reports yet. Start by filing your first observation.</div></div>' :
          AFV.agronomistReports.map(r => {
            const gh = AFV.greenhouses.find(g => g.id === r.ghId);
            return `
              <div class="agro-report" style="border-left:4px solid ${r.type==='issue'?'var(--red-alert)':r.type==='recommendation'?'var(--green-fresh)':'var(--orange-warn)'}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap;gap:8px">
                  <div>
                    <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:${r.type==='issue'?'var(--red-alert)':r.type==='recommendation'?'var(--green-forest)':'var(--orange-warn)'};margin-bottom:4px">
                      ${r.type==='issue'?'⚠️ Issue Report':r.type==='recommendation'?'💡 Recommendation':'📝 Field Observation'}
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-light)">${gh ? `${gh.cropEmoji} ${gh.name}` : 'General'} · ${timeAgo(r.timestamp)}${r.editedAt ? ' (edited)' : ''}</div>
                  </div>
                  <div style="display:flex;gap:6px;align-items:center">
                    ${r.acknowledged ? '<span class="badge badge-green">✅ Admin Reviewed</span>' : '<span class="badge badge-purple">⏳ Awaiting Review</span>'}
                    <button class="btn-icon" onclick="AgronomistDashboard.editReport(${r.id})" title="Edit Report" style="background:var(--green-fresh);color:white;padding:6px 10px;border-radius:var(--radius-sm);font-size:0.75rem;cursor:pointer;border:none">✏️ Edit</button>
                  </div>
                </div>
                <div style="font-size:0.9rem;color:var(--text-dark);line-height:1.7;margin-bottom:12px">${r.text}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  ${r.tags.map(t => `<span class="badge badge-purple">${t}</span>`).join('')}
                </div>
              </div>`;
          }).join('')}
      </div>
      
    `;
  },

  renderAddReport(preGhId = '') {
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">✍️ New Report</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">File a new observation, issue, or recommendation</div>
        </div>
      </div>
      <div class="page-body">
        <div class="agro-report" style="max-width:700px">
          <div class="section-title" style="color:#9b59b6">📝 New Agronomist Report</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div class="input-group">
              <label>Greenhouse</label>
              <select id="report-gh">
                <option value="">-- Select Greenhouse --</option>
                ${AFV.greenhouses.map(gh => `<option value="${gh.id}" ${preGhId==gh.id?'selected':''}>${gh.cropEmoji} ${gh.name} — ${gh.crop}</option>`).join('')}
              </select>
            </div>
            <div class="input-group">
              <label>Report Type</label>
              <select id="report-type">
                <option value="observation">📝 Field Observation</option>
                <option value="issue">⚠️ Issue / Problem</option>
                <option value="recommendation">💡 Recommendation</option>
              </select>
            </div>
          </div>
          <div class="input-group" style="margin-bottom:14px">
            <label>Report Content</label>
            <textarea id="report-text" class="agro-comment-box" placeholder="Describe your observation in detail. Include: what you observed, likely cause, severity, and urgency. Be specific with measurements, affected areas, or plant counts..." rows="7"></textarea>
          </div>
          <div class="input-group" style="margin-bottom:14px">
            <label>Tags (comma-separated)</label>
            <input type="text" id="report-tags" placeholder="e.g. nutrient-deficiency, magnesium, urgent">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:0.78rem;font-weight:700;color:var(--text-mid);text-transform:uppercase;display:block;margin-bottom:8px">Quick Templates</label>
              <div style="display:flex;flex-direction:column;gap:6px">
                <button onclick="AgronomistDashboard.fillTemplate('nutrient')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🌿 Nutrient Deficiency</button>
                <button onclick="AgronomistDashboard.fillTemplate('pest')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🐛 Pest Infestation</button>
                <button onclick="AgronomistDashboard.fillTemplate('disease')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🍂 Disease / Fungal</button>
                <button onclick="AgronomistDashboard.fillTemplate('harvest')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🍅 Harvest Readiness</button>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;justify-content:flex-end">
              <button id="submit-report-btn" class="agro-submit-btn" style="width:100%;padding:14px">
                📤 Submit Report to Admin
              </button>
              <button onclick="AgronomistDashboard.showPage('reports')" class="btn-secondary" style="margin-top:8px;width:100%">Cancel</button>
            </div>
          </div>
        </div>
      </div>
      
    `;
  },

  attachReportEvents() {
    const btn = document.getElementById('submit-report-btn');
    if (btn) btn.addEventListener('click', () => this.submitReport());
  },

  fillTemplate(type) {
    const templates = {
      nutrient: { type: 'issue', text: 'Observed signs of nutrient deficiency in the greenhouse. Symptoms include interveinal chlorosis on young/old leaves (specify which). Likely deficiency: [Nitrogen/Iron/Magnesium/Calcium]. Recommended action: Foliar application of [specific fertilizer] at [rate] per 20L water. Also check substrate EC and pH — if EC is below 2.0 or pH above 6.8, nutrient uptake will be compromised.', tags: 'nutrient-deficiency, urgent' },
      pest: { type: 'issue', text: 'Pest infestation identified in greenhouse. Pest identified: [Whitefly/Spider Mite/Thrips/Aphid/Leaf Miner]. Infestation level: [Low/Medium/High]. Plants affected: approximately [X]% of crop. Recommended chemical control: [Abamectin/Spirotetramat/Imidacloprid] at label rate. Also increase sticky trap density and consider biological control with [predator species].', tags: 'pest-control, infestation' },
      disease: { type: 'issue', text: 'Fungal/bacterial disease observed in the greenhouse. Disease identified: [Botrytis/Powdery Mildew/Alternaria/Bacterial Wilt]. Affected area: approximately [X] plants in [location within GH]. Likely cause: high humidity + poor air circulation. Immediate action: Remove and destroy infected plant material. Apply [Iprodione/Azoxystrobin/Copper Hydroxide] fungicide. Improve ventilation.', tags: 'disease, fungal, urgent' },
      harvest: { type: 'recommendation', text: 'Greenhouse plants are approaching harvest readiness. Current maturity: [X]% of fruits at correct stage. Recommended harvest date: [date]. Harvesting criteria for this crop: [color/size/firmness parameters]. Brief workers on correct picking technique. Have packaging materials and cold chain ready. Post-harvest: apply preventive fungicide to cut surfaces.', tags: 'harvest, quality, scheduling' }
    };
    const t = templates[type];
    const typeEl = document.getElementById('report-type');
    const textEl = document.getElementById('report-text');
    const tagsEl = document.getElementById('report-tags');
    if (typeEl) typeEl.value = t.type;
    if (textEl) textEl.value = t.text;
    if (tagsEl) tagsEl.value = t.tags;
  },

  submitReport() {
    const ghId = parseInt(document.getElementById('report-gh')?.value);
    const type = document.getElementById('report-type')?.value;
    const text = document.getElementById('report-text')?.value?.trim();
    const tagsStr = document.getElementById('report-tags')?.value?.trim();

    if (!ghId || isNaN(ghId)) { showToast('Please select a greenhouse', 'error'); return; }
    if (!text || text.length < 20) { showToast('Please write a more detailed report (min 20 chars)', 'error'); return; }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
    AFV.addAgronomistReport(ghId, type || 'observation', text, tags);
    AFV.saveState();
    showToast('Report submitted to Admin! 🔬', 'success');
    this.showPage('reports');
  },

  editReport(reportId) {
    const report = AFV.agronomistReports.find(r => r.id === reportId);
    if (!report) { showToast('Report not found', 'error'); return; }
    this.currentEditingReport = report;
    this.showPage('edit-report');
  },

  renderEditReport() {
    const r = this.currentEditingReport;
    if (!r) { this.showPage('reports'); return; }
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">✏️ Edit Report</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Modify your agronomist report</div>
        </div>
      </div>
      <div class="page-body">
        <div class="agro-report" style="max-width:700px">
          <div class="section-title" style="color:#9b59b6">📝 Edit Agronomist Report</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div class="input-group">
              <label>Greenhouse</label>
              <select id="edit-report-gh">
                <option value="">-- Select Greenhouse --</option>
                ${AFV.greenhouses.map(gh => `<option value="${gh.id}" ${r.ghId==gh.id?'selected':''}>${gh.cropEmoji} ${gh.name} — ${gh.crop}</option>`).join('')}
              </select>
            </div>
            <div class="input-group">
              <label>Report Type</label>
              <select id="edit-report-type">
                <option value="observation" ${r.type==='observation'?'selected':''}>📝 Field Observation</option>
                <option value="issue" ${r.type==='issue'?'selected':''}>⚠️ Issue / Problem</option>
                <option value="recommendation" ${r.type==='recommendation'?'selected':''}>💡 Recommendation</option>
              </select>
            </div>
          </div>
          <div class="input-group" style="margin-bottom:14px">
            <label>Report Content</label>
            <textarea id="edit-report-text" class="agro-comment-box" placeholder="Describe your observation in detail..." rows="7">${r.text}</textarea>
          </div>
          <div class="input-group" style="margin-bottom:14px">
            <label>Tags (comma-separated)</label>
            <input type="text" id="edit-report-tags" placeholder="e.g. nutrient-deficiency, magnesium, urgent" value="${r.tags.join(', ')}">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:0.78rem;font-weight:700;color:var(--text-mid);text-transform:uppercase;display:block;margin-bottom:8px">Quick Templates</label>
              <div style="display:flex;flex-direction:column;gap:6px">
                <button onclick="AgronomistDashboard.fillEditTemplate('nutrient')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🌿 Nutrient Deficiency</button>
                <button onclick="AgronomistDashboard.fillEditTemplate('pest')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🐛 Pest Infestation</button>
                <button onclick="AgronomistDashboard.fillEditTemplate('disease')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🍂 Disease / Fungal</button>
                <button onclick="AgronomistDashboard.fillEditTemplate('harvest')" style="padding:7px 12px;background:var(--green-ultra-pale);border:1px solid var(--green-pale);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;text-align:left">🍅 Harvest Readiness</button>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;justify-content:flex-end">
              <button id="update-report-btn" class="agro-submit-btn" style="width:100%;padding:14px">
                💾 Save Changes
              </button>
              <button onclick="AgronomistDashboard.showPage('reports')" class="btn-secondary" style="margin-top:8px;width:100%">Cancel</button>
            </div>
          </div>
        </div>
      </div>
      
    `;
  },

  attachEditReportEvents() {
    const btn = document.getElementById('update-report-btn');
    if (btn) btn.addEventListener('click', () => this.updateReport());
  },

  updateReport() {
    const r = this.currentEditingReport;
    if (!r) { showToast('No report selected for editing', 'error'); return; }

    const ghId = parseInt(document.getElementById('edit-report-gh')?.value);
    const type = document.getElementById('edit-report-type')?.value;
    const text = document.getElementById('edit-report-text')?.value?.trim();
    const tagsStr = document.getElementById('edit-report-tags')?.value?.trim();

    if (!ghId || isNaN(ghId)) { showToast('Please select a greenhouse', 'error'); return; }
    if (!text || text.length < 20) { showToast('Please write a more detailed report (min 20 chars)', 'error'); return; }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
    AFV.updateAgronomistReport(r.id, ghId, type || 'observation', text, tags);
    AFV.saveState();
    showToast('Report updated successfully! 🔬', 'success');
    this.currentEditingReport = null;
    this.showPage('reports');
  },

  fillEditTemplate(type) {
    const templates = {
      nutrient: { type: 'issue', text: 'Observed signs of nutrient deficiency in the greenhouse. Symptoms include interveinal chlorosis on young/old leaves (specify which). Likely deficiency: [Nitrogen/Iron/Magnesium/Calcium]. Recommended action: Foliar application of [specific fertilizer] at [rate] per 20L water. Also check substrate EC and pH — if EC is below 2.0 or pH above 6.8, nutrient uptake will be compromised.', tags: 'nutrient-deficiency, urgent' },
      pest: { type: 'issue', text: 'Pest infestation identified in greenhouse. Pest identified: [Whitefly/Spider Mite/Thrips/Aphid/Leaf Miner]. Infestation level: [Low/Medium/High]. Plants affected: approximately [X]% of crop. Recommended chemical control: [Abamectin/Spirotetramat/Imidacloprid] at label rate. Also increase sticky trap density and consider biological control with [predator species].', tags: 'pest-control, infestation' },
      disease: { type: 'issue', text: 'Fungal/bacterial disease observed in the greenhouse. Disease identified: [Botrytis/Powdery Mildew/Alternaria/Bacterial Wilt]. Affected area: approximately [X] plants in [location within GH]. Likely cause: high humidity + poor air circulation. Immediate action: Remove and destroy infected plant material. Apply [Iprodione/Azoxystrobin/Copper Hydroxide] fungicide. Improve ventilation.', tags: 'disease, fungal, urgent' },
      harvest: { type: 'recommendation', text: 'Greenhouse plants are approaching harvest readiness. Current maturity: [X]% of fruits at correct stage. Recommended harvest date: [date]. Harvesting criteria for this crop: [color/size/firmness parameters]. Brief workers on correct picking technique. Have packaging materials and cold chain ready. Post-harvest: apply preventive fungicide to cut surfaces.', tags: 'harvest, quality, scheduling' }
    };
    const t = templates[type];
    const typeEl = document.getElementById('edit-report-type');
    const textEl = document.getElementById('edit-report-text');
    const tagsEl = document.getElementById('edit-report-tags');
    if (typeEl) typeEl.value = t.type;
    if (textEl) textEl.value = t.text;
    if (tagsEl) tagsEl.value = t.tags;
  },

  renderTaskAudit() {
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🔎 Task Audit</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">What happened and why tasks were not completed</div>
        </div>
      </div>
      <div class="page-body">
        ${AFV.greenhouses.map(gh => {
          const done = gh.tasks.filter(t => t.completed);
          const pending = gh.tasks.filter(t => !t.completed);
          const progress = AFV.getOverallProgress(gh);
          return `
            <div class="card" style="margin-bottom:20px;border:1px solid #e8d5e8">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
                <div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:800;color:var(--green-deep)">${gh.cropEmoji} ${gh.name} — ${gh.crop}</div>
                <div style="display:flex;gap:8px">
                  <span class="badge badge-green">✅ ${done.length} done</span>
                  <span class="badge badge-orange">⏳ ${pending.length} pending</span>
                  <span class="badge badge-purple">${progress}% complete</span>
                </div>
              </div>
              <div class="scroll-x">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Task</th><th>Priority</th><th>Status</th><th>Completed By</th><th>Notes/Reason</th><th>Agronomist Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${gh.tasks.map((task, idx) => {
                      const worker = task.completedBy ? AFV.users[task.completedBy] : null;
                      const prevDone = idx === 0 || gh.tasks.slice(0,idx).every(t => t.completed);
                      
                      // Determine status and reason
                      let statusBadge = '';
                      let reasonText = '';
                      
                      if (task.completed) {
                        statusBadge = '<span class="badge badge-green">✅ Done</span>';
                        reasonText = task.completionNotes ? `<span style="font-size:0.7rem;color:var(--green-deep)">${task.completionNotes.substring(0,50)}${task.completionNotes.length > 50 ? '...' : ''}</span>` : '—';
                      } else if (task.blocked) {
                        statusBadge = '<span class="badge badge-red">🚫 Blocked</span>';
                        reasonText = `<span style="font-size:0.7rem;color:var(--red-alert)">${task.blockedReason || 'Blocked'} by ${task.blockedBy || 'Supervisor'}</span>`;
                      } else if (!prevDone) {
                        statusBadge = '<span class="badge badge-orange">🔒 Waiting</span>';
                        reasonText = '<span style="font-size:0.7rem;color:var(--orange-warn)">Previous tasks pending</span>';
                      } else {
                        statusBadge = '<span class="badge badge-blue">⏳ Pending</span>';
                        reasonText = '—';
                      }
                      
                      // Show agronomist notes
                      const agrNotes = task.agronomistNotes || [];
                      
                      return `
                        <tr style="background:${task.completed?'transparent':'rgba(225,112,85,0.03)'}">
                          <td style="font-family:'JetBrains Mono',monospace;color:var(--text-light)">${idx+1}</td>
                          <td style="${task.completed?'text-decoration:line-through;opacity:0.6':'font-weight:600'}">${task.name}</td>
                          <td><span class="badge ${task.priority==='high'?'badge-red':task.priority==='medium'?'badge-orange':'badge-green'}">${task.priority}</span></td>
                          <td>${statusBadge}</td>
                          <td>${worker ? worker.name : task.completed ? '—' : 'Unassigned'}</td>
                          <td>${reasonText}</td>
                          <td>
                            ${agrNotes.length > 0 ? `
                              <div style="margin-bottom:6px">
                                ${agrNotes.map(n => `<div style="font-size:0.7rem;padding:4px 6px;background:rgba(155,89,182,0.1);border-radius:4px;margin-bottom:2px"><strong>${n.addedBy}:</strong> ${n.note.substring(0,40)}${n.note.length > 40 ? '...' : ''}</div>`).join('')}
                              </div>
                            ` : ''}
                            ${!task.completed ? `<input placeholder="Add agronomist note..." style="font-size:0.75rem;padding:4px 8px;border:1px solid #9b59b6;border-radius:4px;width:160px" onchange="AgronomistDashboard.addTaskNote(${gh.id},'${task.id}',this.value)">` : ''}
                          </td>
                        </tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>`;
        }).join('')}
      </div>
      
    `;
  },

  renderCropData() {
    const cropInfo = [
      { crop: 'Beef Tomatoes', emoji: '🍅', days: 90, ph: '5.8–6.5', ec: '2.5–4.0', temp: '18–27°C', humidity: '60–80%', yield: '20–30 kg/m²', notes: 'Single-stem training. Remove all suckers. Support with string twisting.' },
      { crop: 'Cherry Tomatoes', emoji: '🍒', days: 90, ph: '5.8–6.5', ec: '2.0–3.5', temp: '18–27°C', humidity: '60–75%', yield: '15–25 kg/m²', notes: 'Can use multi-truss harvesting. Very productive variety.' },
      { crop: 'Red Capsicum', emoji: '🌶️', days: 100, ph: '5.5–6.5', ec: '2.0–3.5', temp: '20–28°C', humidity: '60–70%', yield: '8–15 kg/m²', notes: 'Train to 2 stems. Remove all growth below first fork. Watch for Blossom End Rot (Calcium).' },
      { crop: 'Yellow Capsicum', emoji: '🫑', days: 100, ph: '5.5–6.5', ec: '2.0–3.5', temp: '20–28°C', humidity: '60–70%', yield: '8–15 kg/m²', notes: 'Same as red capsicum. Slower to colour — harvest when fully yellow.' },
    ];

    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🌱 Crop Reference Data</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">Technical parameters for all crops grown at Agri-Fine</div>
        </div>
      </div>
      <div class="page-body">
        ${cropInfo.map(c => `
          <div class="card" style="margin-bottom:16px;border:1px solid #e8d5e8">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <div style="font-size:2.5rem">${c.emoji}</div>
              <div>
                <div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:800;color:var(--green-deep)">${c.crop}</div>
                <div style="font-size:0.75rem;color:var(--text-light)">Days to harvest: ~${c.days} · Expected yield: ${c.yield}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
              <div style="background:rgba(9,132,227,0.06);border-radius:var(--radius-sm);padding:10px;text-align:center">
                <div style="font-weight:700;color:var(--blue-water)">${c.ph}</div><div style="font-size:0.65rem;color:var(--text-light)">pH RANGE</div>
              </div>
              <div style="background:rgba(9,132,227,0.06);border-radius:var(--radius-sm);padding:10px;text-align:center">
                <div style="font-weight:700;color:var(--blue-water)">${c.ec}</div><div style="font-size:0.65rem;color:var(--text-light)">EC (mS/cm)</div>
              </div>
              <div style="background:rgba(240,180,41,0.08);border-radius:var(--radius-sm);padding:10px;text-align:center">
                <div style="font-weight:700;color:var(--gold-dark)">${c.temp}</div><div style="font-size:0.65rem;color:var(--text-light)">TEMPERATURE</div>
              </div>
              <div style="background:rgba(106,171,94,0.08);border-radius:var(--radius-sm);padding:10px;text-align:center">
                <div style="font-weight:700;color:var(--green-forest)">${c.humidity}</div><div style="font-size:0.65rem;color:var(--text-light)">HUMIDITY</div>
              </div>
            </div>
            <div style="background:rgba(155,89,182,0.06);border-radius:var(--radius-sm);padding:12px;border-left:3px solid #9b59b6">
              <div style="font-size:0.72rem;font-weight:700;color:#9b59b6;text-transform:uppercase;margin-bottom:4px">KEY NOTES</div>
              <div style="font-size:0.85rem;color:var(--text-dark)">${c.notes}</div>
            </div>
          </div>`).join('')}
      </div>
      
    `;
  },

  renderFeeding() {
    const skipWeeks = AFV.feedingProgram.skipWeeks;
    let currentWeek = AFV.getCalendarCurrentWeek();
    const currentCycle = AFV.getCurrentCalendarCycle();
    const hasCalendar = !!AFV.feedingProgram.calendarStartDate;
    
    // Get week dates if calendar is set
    const weekDates = AFV.getCalendarWeekDates(currentWeek);
    
    // Get today's date info
    const today = new Date();
    const dayName = today.toLocaleDateString('en-KE', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Find oldest greenhouse for fallback
    let oldestDate = null;
    let hasPlantedGH = false;
    
    AFV.greenhouses.forEach(gh => {
      if (gh.plantedDate) {
        hasPlantedGH = true;
        if (!oldestDate || new Date(gh.plantedDate) < new Date(oldestDate)) {
          oldestDate = gh.plantedDate;
        }
      }
    });
    
    // Fallback to greenhouse-based week if no calendar
    if (!hasCalendar && hasPlantedGH) {
      currentWeek = AFV.getCurrentWeek(oldestDate);
    }
    
    const schedule = AFV.getWeekSchedule(currentWeek);
    const isSkippedWeek = skipWeeks.includes(currentWeek);
    
    return `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🧪 Feeding Program</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">${hasCalendar ? `Cycle ${currentCycle} · 34-week fertilizer schedule` : 'Waiting for Admin to start the calendar'}</div>
        </div>
        <div class="header-actions">
          ${hasCalendar ? `<button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="AgronomistDashboard.showFeedingCalendar()">🗓️ Calendar</button>` : ''}
          <div style="background:rgba(255,255,255,0.15);padding:8px 14px;border-radius:8px;margin-left:10px;text-align:center;cursor:pointer" onclick="${hasCalendar ? 'AgronomistDashboard.showFeedingCalendar()' : ''}">
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.7)">${dayName}</div>
            <div style="font-size:0.9rem;font-weight:700">${dateStr}</div>
          </div>
        </div>
      </div>
      <div class="page-body">
        <div class="two-col">
          <div>
            <div class="card" style="margin-bottom:20px;border:1px solid #e8d5e8">
              <div class="section-title">📅 Current Week: ${currentWeek}${currentCycle > 1 ? ` (Cycle ${currentCycle})` : ''}</div>
              ${weekDates ? `<div style="font-size:0.8rem;color:var(--text-light);margin-top:4px">${weekDates.startStr} - ${weekDates.endStr}</div>` : ''}
              <div style="text-align:center;padding:20px">
                <div style="font-size:3rem;font-weight:900;color:#9b59b6">${currentWeek}</div>
                <div style="font-size:0.85rem;color:var(--text-light)">of 34-week cycle ${currentCycle > 1 ? `(${currentCycle}${currentCycle === 2 ? 'nd' : 'rd'} cycle)` : ''}</div>
                ${!hasCalendar && !hasPlantedGH ? '<div style="margin-top:12px;padding:8px 16px;background:rgba(214,48,49,0.1);color:var(--red-alert);border-radius:20px;font-size:0.85rem;font-weight:600">⚠️ No calendar or planted greenhouses</div>' : ''}
                ${isSkippedWeek ? '<div style="margin-top:12px;padding:8px 16px;background:rgba(214,48,49,0.1);color:var(--red-alert);border-radius:20px;font-size:0.85rem;font-weight:600">⚠️ Skip Week</div>' : ''}
              </div>
              
              <div class="section-title" style="margin-top:20px">🧪 This Week's Application</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
                ${schedule.fertilizers.map(f => `
                  <div style="background:${f.type === 'weekly' ? 'var(--green-ultra-pale)' : 'rgba(9,132,227,0.06)'};padding:12px;border-radius:var(--radius-sm);text-align:center">
                    <div style="font-weight:700;color:var(--text-dark);font-size:0.85rem">${f.name}</div>
                    <div style="font-size:1.3rem;font-weight:800;color:var(--green-deep)">${f.amount}</div>
                    <div style="font-size:0.7rem;color:var(--text-light)">${f.unit}</div>
                  </div>
                `).join('')}
              </div>
              
              ${isSkippedWeek ? `
                <div style="margin-top:14px;padding:12px;background:rgba(214,48,49,0.06);border-radius:var(--radius-sm);border-left:3px solid var(--red-alert)">
                  <div style="font-size:0.78rem;font-weight:700;color:var(--red-alert)">⏭️ Not Applied This Week</div>
                  <div style="font-size:0.8rem;color:var(--text-mid);margin-top:4px">Calcium Carbonate & Potassium Sulphate skipped in weeks ${skipWeeks.join(', ')}</div>
                </div>
              ` : ''}
            </div>
            
            <div class="card" style="border:1px solid #e8d5e8">
              <div class="section-title">📊 Program Summary</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
                <div style="background:var(--green-ultra-pale);padding:12px;border-radius:var(--radius-sm);text-align:center">
                  <div style="font-size:1.3rem;font-weight:800;color:var(--green-deep)">34</div>
                  <div style="font-size:0.7rem;color:var(--text-light)">Total Weeks</div>
                </div>
                <div style="background:var(--green-ultra-pale);padding:12px;border-radius:var(--radius-sm);text-align:center">
                  <div style="font-size:1.3rem;font-weight:800;color:var(--green-deep)">30</div>
                  <div style="font-size:0.7rem;color:var(--text-light)">Active Weeks</div>
                </div>
                <div style="background:rgba(214,48,49,0.08);padding:12px;border-radius:var(--radius-sm);text-align:center">
                  <div style="font-size:1.3rem;font-weight:800;color:var(--red-alert)">4</div>
                  <div style="font-size:0.7rem;color:var(--text-light)">Skip Weeks</div>
                </div>
                <div style="background:rgba(9,132,227,0.08);padding:12px;border-radius:var(--radius-sm);text-align:center">
                  <div style="font-size:1.3rem;font-weight:800;color:var(--blue-water)">4</div>
                  <div style="font-size:0.7rem;color:var(--text-light)">Fertilizers</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div class="card" style="border:1px solid #e8d5e8">
              <div class="section-title">🏡 Greenhouse Status</div>
              ${AFV.greenhouses.map(gh => {
                const week = hasCalendar ? AFV.getCalendarCurrentWeek() : AFV.getCurrentWeek(gh.plantedDate);
                const ghSchedule = AFV.getWeekSchedule(week);
                return `
                  <div style="padding:12px;border-bottom:1px solid var(--green-pale)">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <div style="font-weight:700;color:var(--green-deep)">${gh.cropEmoji} ${gh.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-light)">${gh.crop} · Week ${week}</div>
                      </div>
                      <div style="text-align:right">
                        <div style="font-size:0.8rem;color:var(--blue-water);font-weight:600">${ghSchedule.fertilizers.length} fertilizers</div>
                        <div style="font-size:0.65rem;color:var(--text-light)">${ghSchedule.skippedFertilizers ? 'Some skipped' : 'All applied'}</div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            
            <div class="card" style="border:1px solid #e8d5e8;margin-top:20px">
              <div class="section-title">ℹ️ Fertilizer Information</div>
              <div style="font-size:0.8rem;color:var(--text-mid);line-height:1.6;margin-top:10px">
                <div style="margin-bottom:8px"><strong>N.P.K</strong> - Applied every week. Primary nutrient source.</div>
                <div style="margin-bottom:8px"><strong>Magnesium Sulphate</strong> - Applied every week. Provides Mg and S.</div>
                <div style="margin-bottom:8px"><strong>Calcium Carbonate</strong> - Skipped weeks 1,11,21,31. Provides Ca.</div>
                <div><strong>Potassium Sulphate</strong> - Skipped weeks 1,11,21,31. Provides K and S.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    `;
  },

  prepareReport(ghId) {
    this.showPage('add-report');
    setTimeout(() => {
      const el = document.getElementById('report-gh');
      if (el) el.value = ghId;
    }, 100);
  },

  addTaskNote(ghId, taskId, note) {
    if (!note || !note.trim()) {
      showToast('Please enter a note', 'error');
      return;
    }
    
    const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
    if (gh) {
      const task = gh.tasks.find(t => t.id == taskId || t.id === taskId);
      if (task) {
        // Initialize agronomistNotes array if not exists
        if (!task.agronomistNotes) {
          task.agronomistNotes = [];
        }
        
        // Add new note
        task.agronomistNotes.push({
          note: note.trim(),
          addedBy: AFV.currentUser?.name || 'Agronomist',
          addedAt: new Date().toISOString()
        });
        
        // Log activity
        AFV.logActivity('📝', `Agronomist added note to task "${task.title || task.name}" in ${gh.name}`);
        
        AFV.saveState();
        showToast('Agronomic note added! Visible to Admin & Supervisor', 'success');
        this.showPage('task-audit');
      }
    }
  },

  // ============================================ FEEDING CALENDAR

  startFeedingCalendar() {
    const startDate = new Date().toISOString().split('T')[0];
    AFV.setFeedingCalendarStart(startDate);
    showToast(`Feeding calendar started from ${new Date(startDate).toLocaleDateString()}`, 'success');
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
    
    document.getElementById('agronomist-content').innerHTML = `
      <div class="page-header" style="background:linear-gradient(135deg,#2d1a3d,#4a2d6e);color:white;border-bottom:none">
        <div>
          <div class="page-title" style="color:white">🗓️ Feeding Calendar</div>
          <div class="page-subtitle" style="color:rgba(255,255,255,0.65)">34-week cycle calendar with notes · Currently Week ${currentWeek} (Cycle ${currentCycle})</div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:white" onclick="AgronomistDashboard.showPage('feeding')">← Back</button>
        </div>
      </div>
      <div class="page-body">
        <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(155,89,182,0.2),rgba(155,89,182,0.1));border:2px solid #9b59b6">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
            <div>
              <div class="section-title" style="color:#9b59b6">📅 Current: Week ${currentWeek}, Cycle ${currentCycle}</div>
              <div style="font-size:0.85rem;color:var(--text-mid)">${currentWeek === 34 ? 'Final week - cycle will restart soon!' : `${34 - currentWeek} weeks remaining in current cycle`}</div>
            </div>
            <div style="display:flex;gap:10px">
              <div style="text-align:center;padding:8px 16px;background:#9b59b6;color:white;border-radius:var(--radius-sm)">
                <div style="font-size:1.5rem;font-weight:800">${currentWeek}</div>
                <div style="font-size:0.6rem">WEEK</div>
              </div>
              <div style="text-align:center;padding:8px 16px;background:rgba(155,89,182,0.2);color:#9b59b6;border-radius:var(--radius-sm)">
                <div style="font-size:1.5rem;font-weight:800">${currentCycle}</div>
                <div style="font-size:0.6rem">CYCLE</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom:20px">
          <div class="section-title" style="color:#9b59b6">📝 Calendar Notes</div>
        </div>
        
        ${[1, 2].map(cycle => `
          <div style="margin-bottom:30px">
            <div class="section-title" style="color:#9b59b6;border-bottom:2px solid #9b59b6;padding-bottom:8px;margin-bottom:16px">Cycle ${cycle}</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
              ${weeks.filter(w => w.cycle === cycle).map(w => {
                const isCurrent = w.weekNum === currentWeek && w.cycle === currentCycle;
                const isSkipped = skipWeeks.includes(w.weekNum);
                return `
                  <div class="card" style="border:${isCurrent ? '2px solid #9b59b6' : '1px solid #e8d5e8'};${isCurrent ? 'background:linear-gradient(135deg,rgba(155,89,182,0.1),white)' : ''}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <div style="font-weight:700;color:#9b59b6">Week ${w.weekNum}</div>
                      <div style="font-size:0.7rem;color:var(--text-light)">${w.startStr} - ${w.endStr}</div>
                    </div>
                    ${isSkipped ? '<div style="font-size:0.7rem;color:var(--red-alert);margin-bottom:6px">⏭️ Skip Week</div>' : ''}
                    ${w.note ? `
                      <div style="font-size:0.75rem;color:var(--text-mid);background:rgba(155,89,182,0.08);padding:8px;border-radius:4px;margin-top:6px">
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
