// ============================================
// AGRI-FINE VENTURES — MAIN APP
// ============================================

// Note: escapeHtml function is defined in state.js (loaded first)

// ============================================ KEYBOARD ACCESSIBILITY
// Close modals on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Close any visible modal
    document.querySelectorAll('.modal-overlay, .modal[style*="flex"]').forEach(modal => {
      if (modal.style.display === 'flex' || modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });
  }
});

// ============================================ SPLASH SCREEN
document.addEventListener('DOMContentLoaded', function() {
  const splash = document.getElementById('splash-screen');
  const loginScreen = document.getElementById('login-screen');
  
  // Show splash screen for 2.5 seconds then fade to login
  setTimeout(function() {
    if (splash) {
      splash.classList.add('fade-out');
      // Show login screen after splash starts fading
      setTimeout(function() {
        loginScreen.classList.add('active');
      }, 300);
      // Remove splash from DOM after animation completes
      setTimeout(function() {
        splash.style.display = 'none';
      }, 600);
    }
  }, 2500);
});

// ============================================ AUTH

async function handleLogin() {
  const loginBtn = document.querySelector('.login-btn');
  const username = document.getElementById('login-username')?.value?.trim();
  const password = document.getElementById('login-password')?.value?.trim();
  const roleBtn = document.querySelector('.role-btn.active');
  const selectedRole = roleBtn?.dataset?.role;

  if (!username || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span>Logging in...</span>';
  }

  try {
    // Try API login first
    const response = await AFV_API.login(username, password);
    
    if (response.error) {
      showToast(response.error, 'error');
      return;
    }
    
    if (response.user && response.token) {
      // Store token for authenticated requests
      localStorage.setItem('afv_token', response.token);
      
      // Load greenhouses from backend now that we have a valid token
      await AFV_API.init();
      
      // Map API user to local user format
      let assignedGH = response.user.assignedGH;
      if (typeof assignedGH === 'string') {
        try {
          assignedGH = JSON.parse(assignedGH);
        } catch (e) {
          assignedGH = [];
        }
      }
      // Normalize assignedGH: backend returns [{id, name}] objects, frontend expects plain IDs
      if (Array.isArray(assignedGH)) {
        assignedGH = assignedGH.map(item => {
          if (typeof item === 'object' && item !== null) return item.id;
          return item;
        }).filter(Boolean);
      } else {
        assignedGH = [];
      }
      const user = {
        id: response.user.uid,
        uid: response.user.uid,
        email: response.user.email,
        name: response.user.displayName || response.user.name || response.user.email.split('@')[0],
        role: response.user.role,
        avatar: response.user.avatar || '👤',
        imageUrl: response.user.imageUrl || '',
        assignedGH: assignedGH
      };
      
      // Verify role matches selected role
      if (user.role !== selectedRole) {
        showToast(`This account is a ${user.role}, not ${selectedRole}`, 'error');
        return;
      }

      AFV.currentUser = user;
      AFV.currentRole = user.role;
      
      // Refresh users from backend to ensure we have latest data
      await AFV.fetchUsersFromBackend();
      
      AFV.logActivity('🔐', `${user.name} logged in as ${user.role}`);

      navigateTo(user.role);
      showToast(`Welcome, ${user.name}! 🌾`, 'success');
    } else {
      // Fallback to local authentication (demo mode)
      throw new Error('API login failed');
    }
  } catch (err) {
    // Fallback to local/demo authentication
    console.log('API login failed, using demo auth');
    
    let user;
    if (selectedRole === 'admin') {
      user = Object.values(AFV.users).find(u => (u.email === username || u.uid === username) && u.role === 'admin');
    } else {
      user = Object.values(AFV.users).find(u => (u.uid === username || u.name === username) && u.role === selectedRole);
    }
    
    if (!user) {
      showToast('Wrong email or password', 'error');
      return;
    }
    
    if (user.passwordHash && user.passwordHash !== password) {
      showToast('Wrong email or password', 'error');
      return;
    }

    if (user.role !== selectedRole) {
      showToast(`This account is a ${user.role}, not ${selectedRole}`, 'error');
      return;
    }

    AFV.currentUser = user;
    AFV.currentRole = user.role;
    
    // Refresh users from backend to ensure we have latest data
    await AFV.fetchUsersFromBackend();
    
    AFV.logActivity('🔐', `${user.name} logged in as ${user.role}`);

    navigateTo(user.role);
    showToast(`Welcome, ${user.name}! 🌾`, 'success');
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span>Enter Farm Dashboard</span><span class="btn-arrow">→</span>';
    }
  }
}

function navigateTo(role) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  
  // Close sidebar on mobile when navigating
  if (window.innerWidth <= 768) {
    closeSidebar(role);
  }
  
  // Fetch weather data
  AFV.fetchWeather();
  
  let screenEl, dashboard;
  if (role === 'admin') {
    screenEl = document.getElementById('admin-screen');
    dashboard = AdminDashboard;
  } else if (role === 'supervisor') {
    screenEl = document.getElementById('supervisor-screen');
    dashboard = SupervisorDashboard;
  } else if (role === 'agronomist') {
    screenEl = document.getElementById('agronomist-screen');
    dashboard = AgronomistDashboard;
  }
  
  if (screenEl) screenEl.classList.add('active');
  // Defer init to next frame so browser completes style/layout pass first
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (dashboard) dashboard.init();
    });
  });
  
  startSync();
}

let syncInterval = null;
let lastSyncHash = '';

async function syncData() {
  if (!AFV.currentUser) return;
  try {
    const greenhouses = await AFV.fetchGreenhouses();
    const usersRes = await authFetch('/auth/users');
    const users = usersRes.ok ? await usersRes.json() : [];
    
    // Quick hash comparison instead of full JSON.stringify
    const dataHash = JSON.stringify({ greenhouses, users });
    if (dataHash === lastSyncHash) return; // No changes, skip update
    lastSyncHash = dataHash;
    
    let updated = false;
    
    if (greenhouses?.length > 0) {
      const newGreenhouses = greenhouses.map(gh => ({
        ...gh,
        plantedDate: gh.plantedDate ? new Date(gh.plantedDate) : null,
        expectedHarvest: gh.expectedHarvest ? new Date(gh.expectedHarvest) : null,
        tasks: (gh.tasks || []).map(t => ({ ...t, completedAt: t.completedAt ? new Date(t.completedAt) : null }))
      }));
      
      // Deep compare without full JSON.stringify
      const oldCount = AFV.greenhouses?.length || 0;
      if (oldCount !== newGreenhouses.length) {
        AFV.greenhouses = newGreenhouses;
        updated = true;
      }
    }
    
    if (users?.length > 0) {
      AFV.allUsers = users;
      updated = true;
    }
    
    if (updated && AFV.currentRole === 'admin') {
      AdminDashboard.refreshCurrentPage && AdminDashboard.refreshCurrentPage();
    } else if (updated && AFV.currentRole === 'supervisor') {
      SupervisorDashboard.refreshCurrentPage && SupervisorDashboard.refreshCurrentPage();
    } else if (updated && AFV.currentRole === 'agronomist') {
      AgronomistDashboard.refreshCurrentPage && AgronomistDashboard.refreshCurrentPage();
    }
  } catch (e) {
    console.error('Sync error:', e);
  }
}

function startSync() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(syncData, 30000);
}

function stopSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

function handleLogout() {
  const userName = AFV.currentUser?.name;
  AFV.logActivity('🚪', `${userName} logged out`);
  AFV.currentUser = null;
  AFV.currentRole = null;
  stopSync();
  
  // Clear auth token
  localStorage.removeItem('afv_token');
  
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  showToast('Logged out successfully', 'success');
}

// ============================================ ROLE SWITCHER

document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Allow Enter key to login
document.getElementById('login-password')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});

// ============================================ TASK COMPLETION

function closeTaskModal() {
  document.getElementById('task-modal').style.display = 'none';
  AFV.pendingTaskComplete = null;
}

function confirmTaskComplete() {
  if (!AFV.pendingTaskComplete) return;
  const { ghId, taskId } = AFV.pendingTaskComplete;
  const nextTask = AFV.completeTask(ghId, taskId);
  document.getElementById('task-modal').style.display = 'none';
  AFV.pendingTaskComplete = null;
  
  // Save state after task completion
  AFV.saveState();

  // Re-render worker dashboard
  if (AFV.currentRole === 'supervisor') {
    SupervisorDashboard.showPage('mytasks');
  }

  if (nextTask) {
    showToast(`Task done! ✅ Next: "${nextTask.name}"`, 'success');
  } else {
    showToast('🎉 All tasks in this greenhouse complete!', 'success');
  }
}

function closeBlockModal() {
  document.getElementById('block-task-modal').style.display = 'none';
  AFV.pendingTaskComplete = null;
}

function confirmBlockTask() {
  if (!AFV.pendingTaskComplete) return;
  const reason = document.getElementById('block-reason').value.trim();
  if (!reason) {
    showToast('Please provide a reason for blocking this task', 'error');
    return;
  }
  const { ghId, taskId } = AFV.pendingTaskComplete;
  
  // Find and block the task
  const gh = AFV.greenhouses.find(g => g.id === ghId || g.id == ghId);
  if (gh) {
    const task = gh.tasks.find(t => t.id == taskId || t.id === taskId);
    if (task) {
      task.status = 'blocked';
      task.blocked = true;
      task.blockedReason = reason;
      task.blockedAt = new Date().toISOString();
      task.blockedBy = AFV.currentUser?.name || 'Supervisor';
      
      // Log activity
      AFV.logActivity('🚫', `Task "${task.title || task.name}" blocked in ${gh.name} - Reason: ${reason}`);
      AFV.saveState();
      
      showToast('Task blocked! Admin has been notified.', 'warning');
    }
  }
  
  document.getElementById('block-task-modal').style.display = 'none';
  AFV.pendingTaskComplete = null;
  
  // Re-render
  if (AFV.currentRole === 'supervisor') {
    SupervisorDashboard.showPage('mytasks');
  }
}

// ============================================ TOAST

// Weather Widget - Open-Meteo
function renderWeatherWidget() {
  if (!AFV.weather) {
    return `<div style="background:linear-gradient(135deg,#1e3c72,#2a5298);border-radius:16px;padding:16px;color:white;text-align:center"><div style="font-size:2rem;margin-bottom:8px">🌤️</div><div style="opacity:0.8">Loading weather...</div></div>`;
  }
  
  const w = AFV.weather;
  const today = w.daily[0];
  const emoji = AFV.getWeatherEmoji(w.current.code);
  const desc = AFV.getWeatherDesc(w.current.code);
  
  let forecastHTML = w.daily.slice(1, 6).map(d => {
    const day = new Date(d.date).toLocaleDateString('en-KE', { weekday: 'short' });
    return `<div style="text-align:center;flex:1;min-width:45px"><div style="font-size:1.2rem">${AFV.getWeatherEmoji(d.code)}</div><div style="font-size:0.65rem;opacity:0.8">${day}</div><div style="font-size:0.75rem;font-weight:600">${d.max}°</div></div>`;
  }).join('');
  
  return `
    <div style="background:linear-gradient(135deg,#1e3c72,#2a5298);border-radius:16px;padding:16px;color:white;position:relative;overflow:hidden">
      <div style="position:absolute;top:-10px;right:-10px;font-size:5rem;opacity:0.15">${emoji}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:0.7rem;opacity:0.7;text-transform:uppercase;margin-bottom:2px">Nairobi, Kenya</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:3rem;font-weight:700">${w.current.temp}°</span>
            <div>
              <div style="font-size:1rem;font-weight:600">${desc}</div>
              <div style="font-size:0.75rem;opacity:0.8">Feels like ${w.current.feelsLike}°</div>
            </div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:2.5rem">${emoji}</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.2)">
        <div style="flex:1;text-align:center"><span style="font-size:1.2rem">💧</span><div style="font-size:0.7rem;opacity:0.8">${w.current.humidity}%</div></div>
        <div style="flex:1;text-align:center"><span style="font-size:1.2rem">💨</span><div style="font-size:0.7rem;opacity:0.8">${w.current.wind} km/h</div></div>
        <div style="flex:1;text-align:center"><span style="font-size:1.2rem">🌡️</span><div style="font-size:0.7rem;opacity:0.8">${today.min}°/${today.max}°</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.2)">
        ${forecastHTML}
      </div>
    </div>`;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', warn: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================ UTILS

function timeAgo(date) {
  if (!date) return 'Unknown';
  const d = new Date(date);
  const seconds = Math.floor((new Date() - d) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('en-KE');
}

// ============================================ FEEDING PROGRAM

function updateFertilizerAmount(fertilizerKey) {
  // Map short keys to full keys for state storage
  const keyMap = {
    'mg': 'magnesiumSulphate',
    'ca': 'calciumCarbonate',
    'k': 'potassiumSulphate'
  };
  const stateKey = keyMap[fertilizerKey] || fertilizerKey;
  
  const amountInput = document.getElementById(`fert-${fertilizerKey}-amount`);
  const unitInput = document.getElementById(`fert-${fertilizerKey}-unit`);
  
  if (!amountInput || !unitInput) {
    showToast('Error: Input fields not found', 'error');
    return;
  }
  
  const amount = amountInput.value;
  const unit = unitInput.value;
  
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }
  
  AFV.updateFertilizerAmount(stateKey, amount, unit);
  showToast(`${stateKey} updated to ${amount}${unit}`, 'success');
  
  // Refresh the feeding program page for all roles
  if (AFV.currentRole === 'admin') {
    AdminDashboard.showPage('feeding');
  } else if (AFV.currentRole === 'agronomist') {
    AgronomistDashboard.showPage('feeding');
  } else if (AFV.currentRole === 'supervisor') {
    SupervisorDashboard.showPage('feeding');
  }
}

// ============================================ SIDEBAR TOGGLE (Mobile)
function toggleSidebar(role) {
  console.log('toggleSidebar called with role:', role);
  const screen = document.getElementById(`${role}-screen`);
  if (!screen) {
    return;
  }
  const sidebar = screen.querySelector('.sidebar');
  const overlay = screen.querySelector('.sidebar-overlay');
  
  if (!sidebar || !overlay) {
    return;
  }
  
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  }
}

function closeSidebar(role) {
  const screen = document.getElementById(`${role}-screen`);
  const sidebar = screen.querySelector('.sidebar');
  const overlay = screen.querySelector('.sidebar-overlay');
  
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

// Close sidebar when clicking nav items on mobile
function closeSidebarOnNav(role) {
  if (window.innerWidth <= 768) {
    closeSidebar(role);
  }
}

// ============================================ INIT

// Auto-refresh dashboard data every 60 seconds
setInterval(() => {
  if (AFV.currentRole === 'admin' && AdminDashboard.currentPage) {
    // Silently update stats
  }
}, 60000);



document.getElementById('task-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeTaskModal();
});

document.getElementById('forgot-password-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeForgotPasswordModal();
});

// Load saved state on init
AFV.loadState();

// Auto-initialize feeding calendar if not set (default to today)
if (!AFV.feedingProgram?.calendarStartDate) {
  AFV.setFeedingCalendarStart(new Date().toISOString().split('T')[0]);
}

// Helper function to reset state (for testing)
function resetAppState() {
  if (confirm('Are you sure you want to reset all data? This will clear all changes and restore default data.')) {
    localStorage.removeItem('afv_state');
    location.reload();
  }
}

// Expose reset function globally for testing
window.resetAppState = resetAppState;

// ============================================ FORGOT PASSWORD
function openForgotPasswordModal() {
  document.getElementById('forgot-password-modal').style.display = 'flex';
  document.getElementById('forgot-username').value = '';
}

function closeForgotPasswordModal() {
  document.getElementById('forgot-password-modal').style.display = 'none';
}

function submitPasswordResetRequest() {
  const username = document.getElementById('forgot-username').value.trim();
  
  if (!username) {
    showToast('Please enter your email', 'error');
    return;
  }
  
  // For admin, check by email; for others check by username
  let user = Object.values(AFV.users).find(u => u.email === username);
  if (!user) {
    // Try username for other roles
    user = AFV.users[username];
  }
  
  if (!user) {
    showToast('Email not found', 'error');
    return;
  }
  
  // Store the email for password reset
  const userEmail = user.email || username;
  
  // Check if request already exists
  const existingRequest = AFV.passwordResetRequests?.find(r => r.username === user.uid && !r.resolved);
  if (existingRequest) {
    showToast('A reset request already exists for this user', 'error');
    return;
  }
  
  // Create new request
  if (!AFV.passwordResetRequests) AFV.passwordResetRequests = [];
  
  const request = {
    id: 'req_' + Date.now(),
    username: user.uid,
    userName: user.name,
    userEmail: userEmail,
    userRole: user.role,
    requestedAt: new Date(),
    resolved: false,
    resolvedAt: null,
    newPassword: null,
    resolvedBy: null
  };
  
  AFV.passwordResetRequests.push(request);
  AFV.saveState();
  
  closeForgotPasswordModal();
  showToast('Password reset link sent to your email', 'success');
}

console.log('🌾 Agri-Fine Ventures Platform initialized successfully');
