// ============================================
// AGRI-FINE VENTURES — MAIN APP
// ============================================

// Initialize AI Assistant
AIAssistant.init();

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

function handleLogin() {
  const username = document.getElementById('login-username')?.value?.trim();
  const password = document.getElementById('login-password')?.value?.trim();
  const roleBtn = document.querySelector('.role-btn.active');
  const selectedRole = roleBtn?.dataset?.role;

  if (!username || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  // For admin, check by email; for others, check by id/username
  let user;
  if (selectedRole === 'admin') {
    user = Object.values(AFV.users).find(u => (u.email === username || u.id === username) && u.role === 'admin');
  } else {
    user = AFV.users[username];
  }
  
  if (!user || user.password !== password) {
    showToast('Wrong email or password', 'error');
    return;
  }

  if (user.role !== selectedRole) {
    showToast(`This account is a ${user.role}, not ${selectedRole}`, 'error');
    return;
  }

  AFV.currentUser = user;
  AFV.currentRole = user.role;
  AFV.logActivity('🔐', `${user.name} logged in as ${user.role}`);

  navigateTo(user.role);
  showToast(`Welcome, ${user.name}! 🌾`, 'success');
}

function navigateTo(role) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  
  // Close sidebar on mobile when navigating
  if (window.innerWidth <= 768) {
    closeSidebar(role);
  }

  if (role === 'admin') {
    document.getElementById('admin-screen').classList.add('active');
    AdminDashboard.init();
  } else if (role === 'supervisor') {
    document.getElementById('supervisor-screen').classList.add('active');
    SupervisorDashboard.init();
  } else if (role === 'agronomist') {
    document.getElementById('agronomist-screen').classList.add('active');
    AgronomistDashboard.init();
  }
}

function handleLogout() {
  const userName = AFV.currentUser?.name;
  AFV.logActivity('🚪', `${userName} logged out`);
  AFV.currentUser = null;
  AFV.currentRole = null;
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

// ============================================ TOAST

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
  const screen = document.getElementById(`${role}-screen`);
  const sidebar = screen.querySelector('.sidebar');
  const overlay = screen.querySelector('.sidebar-overlay');
  
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

// Close modal on overlay click
document.getElementById('ai-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeAIModal();
});

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
  const existingRequest = AFV.passwordResetRequests?.find(r => r.username === user.id && !r.resolved);
  if (existingRequest) {
    showToast('A reset request already exists for this user', 'error');
    return;
  }
  
  // Create new request
  if (!AFV.passwordResetRequests) AFV.passwordResetRequests = [];
  
  const request = {
    id: 'req_' + Date.now(),
    username: user.id,
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
console.log('Demo accounts: admin/1234 | worker1/1234 | agronomist/1234');
