// ============================================================
// ===== CONFIGURATION =====
// ============================================================

const API_BASE_URL = window.location.origin;

// ============================================================
// ===== PROFESSIONAL TOAST SYSTEM =====
// ============================================================

function showToast(message, type = 'success') {
  const existingToast = document.querySelector('.toast-container');
  if (existingToast) {
    existingToast.remove();
  }

  const container = document.createElement('div');
  container.className = 'toast-container';
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-triangle-exclamation',
    info: 'fa-info-circle'
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  container.innerHTML = `
    <div class="toast-content ${type}">
      <div class="toast-icon" style="color: ${colors[type] || colors.info}">
        <i class="fas ${icons[type] || icons.info}"></i>
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.closest('.toast-container').remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.body.appendChild(container);

  setTimeout(() => {
    if (container.parentNode) {
      container.classList.add('fade-out');
      setTimeout(() => {
        if (container.parentNode) {
          container.remove();
        }
      }, 300);
    }
  }, 4000);
}

// ============================================================
// ===== HELPER FUNCTIONS =====
// ============================================================

function getApiKey() {
  return localStorage.getItem('apiKey');
}

function setAuthData(data) {
  localStorage.setItem('apiKey', data.apiKey);
  localStorage.setItem('userName', data.name);
  localStorage.setItem('userEmail', data.email);
  localStorage.setItem('userAvatar', data.avatarUrl || '');
  localStorage.setItem('user', JSON.stringify(data));
  updateUIButtons();
}

function clearAuthData() {
  localStorage.removeItem('apiKey');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userAvatar');
  localStorage.removeItem('user');
  updateUIButtons();
}

function getUserData() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================================
// ===== API CALLS =====
// ============================================================

async function apiRegister(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return response.json();
}

async function apiLogin(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

async function apiDeleteAccount() {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
    method: 'DELETE',
    headers: { 'X-API-Key': apiKey }
  });
  return response.json();
}

async function apiUpdateName(name) {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/auth/update-name`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ name })
  });
  return response.json();
}

async function apiUpdatePassword(currentPassword, newPassword) {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return response.json();
}

async function apiUpdateAvatar(base64Image) {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/auth/update-avatar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ avatar: base64Image })
  });
  return response.json();
}

async function apiRegenerateKey() {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/auth/regenerate-key`, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey }
  });
  return response.json();
}

async function apiValidatePhone(phoneNumber) {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ phoneNumber })
  });
  return response.json();
}

async function apiGetUsage() {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/usage`, {
    headers: { 'X-API-Key': apiKey }
  });
  return response.json();
}

async function apiGetLogs(limit = 50, offset = 0) {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/logs?limit=${limit}&offset=${offset}`, {
    headers: { 'X-API-Key': apiKey }
  });
  return response.json();
}

async function apiGetChartData() {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/usage/chart`, {
    headers: { 'X-API-Key': apiKey }
  });
  return response.json();
}

async function apiGetHistory() {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE_URL}/api/usage/history`, {
    headers: { 'X-API-Key': apiKey }
  });
  return response.json();
}

// ============================================================
// ===== UI UPDATE FUNCTIONS =====
// ============================================================

function updateDashboardUI(user) {
  const name = user.name || 'User';
  const avatar = name.charAt(0).toUpperCase();
  
  const dashName = document.getElementById('dashName');
  const dashAvatar = document.getElementById('dashAvatar');
  const dashEmail = document.getElementById('dashEmail');
  const heroName = document.getElementById('heroName');
  
  if (dashName) dashName.textContent = name;
  if (dashEmail) dashEmail.textContent = user.email || '';
  if (dashAvatar) {
    dashAvatar.textContent = avatar;
    if (user.avatarUrl) {
      dashAvatar.style.backgroundImage = `url(${user.avatarUrl})`;
      dashAvatar.style.backgroundSize = 'cover';
      dashAvatar.textContent = '';
    }
  }
  if (heroName) heroName.textContent = name;
  
  updateUsageStats(user);
}

function updateUsageStats(user) {
  const used = user.usageCount || 0;
  const limit = user.requestLimit || 10;
  const remaining = limit - used;
  const percentage = Math.round((used / limit) * 100);
  
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length >= 4) {
    statNumbers[0].textContent = used;
    statNumbers[1].textContent = used;
    statNumbers[2].textContent = remaining;
    statNumbers[3].textContent = `${percentage}%`;
  }
  
  const creditsLeft = document.getElementById('creditsLeft');
  const requests = document.getElementById('requests');
  const success = document.getElementById('success');
  const failed = document.getElementById('failed');
  const progressText = document.getElementById('creditProgressText');
  const progressBar = document.getElementById('creditProgressBar');
  
  if (creditsLeft) creditsLeft.textContent = remaining;
  if (requests) requests.textContent = used;
  if (success) success.textContent = used;
  if (failed) failed.textContent = 0;
  if (progressText) progressText.textContent = `${used} / ${limit}`;
  if (progressBar) progressBar.style.width = `${percentage}%`;
}

// ============================================================
// ===== UI BUTTONS UPDATE =====
// ============================================================

function updateUIButtons() {
  const user = getUserData();
  const openAuthBtn = document.getElementById('openAuthBtn');
  const heroAuthBtn = document.getElementById('heroAuthBtn');
  
  if (user && user.apiKey) {
    if (openAuthBtn) {
      openAuthBtn.innerHTML = '<i class="fas fa-th-large"></i> Dashboard';
      openAuthBtn.className = 'cta-nav dashboard-btn';
      openAuthBtn.onclick = function(e) {
        e.preventDefault();
        showDashboard();
        initializeDashboard();
      };
    }
    if (heroAuthBtn) {
      heroAuthBtn.innerHTML = '<i class="fas fa-th-large"></i> Dashboard →';
      heroAuthBtn.className = 'btn-primary dashboard-btn';
      heroAuthBtn.onclick = function(e) {
        e.preventDefault();
        showDashboard();
        initializeDashboard();
      };
    }
  } else {
    if (openAuthBtn) {
      openAuthBtn.innerHTML = 'Get Started';
      openAuthBtn.className = 'cta-nav';
      openAuthBtn.onclick = function(e) {
        e.preventDefault();
        const authOverlay = document.getElementById('authOverlay');
        if (authOverlay) {
          authOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      };
    }
    if (heroAuthBtn) {
      heroAuthBtn.innerHTML = 'Get Started →';
      heroAuthBtn.className = 'btn-primary';
      heroAuthBtn.onclick = function(e) {
        e.preventDefault();
        const authOverlay = document.getElementById('authOverlay');
        if (authOverlay) {
          authOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      };
    }
  }

  // ===== MOBILE NAV BUTTON =====
  const mobileAuth = document.getElementById('navAuthMobile');
  if (mobileAuth) {
    if (user && user.apiKey) {
      mobileAuth.innerHTML = `<a style="cursor:pointer;color:#059669;font-weight:700;" onclick="document.getElementById('navLinks').classList.remove('active');showDashboard();initializeDashboard();">Dashboard</a>`;
    } else {
      mobileAuth.innerHTML = `<a style="cursor:pointer;color:#4f46e5;font-weight:700;" onclick="document.getElementById('navLinks').classList.remove('active');document.getElementById('authOverlay').classList.add('active');document.body.style.overflow='hidden';">Get Started</a>`;
    }
  }
}

// ============================================================
// ===== CHART FUNCTIONS =====
// ============================================================

async function fetchChartData() {
  try {
    const data = await apiGetChartData();
    if (data && data.labels && data.values) {
      updateChart(data.labels, data.values);
    }
  } catch (error) {
    console.error('Chart data fetch error:', error);
  }
}

function updateChart(labels, values) {
  const ctx = document.getElementById('usageChart');
  if (!ctx) return;

  if (window.usageChartInstance) {
    window.usageChartInstance.destroy();
  }

  window.usageChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'API Requests',
        data: values,
        borderColor: '#5b63ff',
        backgroundColor: 'rgba(91,99,255,.12)',
        fill: true,
        tension: .4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#5b63ff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 }, 
          grid: { color: '#eef2ff' } 
        }
      }
    }
  });
}

// ============================================================
// ===== RECENT ACTIVITY FUNCTIONS =====
// ============================================================

async function fetchRecentActivity() {
  try {
    const data = await apiGetLogs(5, 0);
    if (data && data.logs) {
      updateRecentActivity(data.logs);
    }
  } catch (error) {
    console.error('Recent activity fetch error:', error);
  }
}

function updateRecentActivity(logs) {
  const activityList = document.querySelector('.activity-list');
  if (!activityList) return;

  if (!logs || logs.length === 0) {
    activityList.innerHTML = `
      <div class="activity-item">
        <div class="act-icon blue"><i class="fas fa-info-circle"></i></div>
        <div class="act-info">
          <div class="act-text">No recent activity</div>
          <div class="act-time">—</div>
        </div>
        <span class="act-status pending">—</span>
      </div>
    `;
    return;
  }

  activityList.innerHTML = logs.map(log => {
    const statusClass = log.status === 'success' ? 'success' : 'failed';
    const statusText = log.status === 'success' ? 'Success' : 'Failed';
    const icon = log.status === 'success' ? 'check' : 'times';
    const iconClass = log.status === 'success' ? 'green' : 'red';
    
    return `
      <div class="activity-item">
        <div class="act-icon ${iconClass}"><i class="fas fa-${icon}"></i></div>
        <div class="act-info">
          <div class="act-text">Phone ${log.phone_number} validated</div>
          <div class="act-time">${timeAgo(log.created_at)}</div>
        </div>
        <span class="act-status ${statusClass}">${statusText}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// ===== DAILY HISTORY FUNCTIONS =====
// ============================================================

async function fetchDailyHistory() {
  try {
    const data = await apiGetHistory();
    if (data && data.history) {
      updateHistoryTable(data.history);
    }
  } catch (error) {
    console.error('History fetch error:', error);
  }
}

function updateHistoryTable(history) {
  const tbody = document.getElementById('historyBody');
  if (!tbody) return;

  if (!history || history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:30px;color:#94a3b8;">
          No data available
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = history.map(day => `
    <tr>
      <td>${day.date}</td>
      <td>${day.requests}</td>
      <td>${day.credits_used}</td>
      <td>${day.success}</td>
      <td>${day.failed}</td>
    </tr>
  `).join('');
}

// ============================================================
// ===== API LOGS FUNCTIONS =====
// ============================================================

async function fetchAndUpdateLogs() {
  try {
    const data = await apiGetLogs(50, 0);
    if (data && data.logs) {
      renderLogs(data.logs);
      updateLogsStats(data.logs);
    }
  } catch (error) {
    console.error('Failed to fetch logs:', error);
  }
}

function renderLogs(logs) {
  const tbody = document.getElementById('logsTableBody');
  if (!tbody) return;

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:40px;color:#94a3b8;">
          No logs available
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs.map(log => `
    <tr>
      <td>#${log.id ? log.id.slice(0, 8) : 'N/A'}</td>
      <td>${log.phone_number || '—'}</td>
      <td>${log.country || '—'}</td>
      <td>${log.carrier || '—'}</td>
      <td>
        <span class="${log.status === 'success' ? 'success' : 'failed'}">
          ${log.status === 'success' ? 'Success' : 'Failed'}
        </span>
      </td>
      <td>${log.response_time || '—'} ms</td>
      <td>${new Date(log.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function updateLogsStats(logs) {
  const total = logs.length || 0;
  const success = logs.filter(l => l.status === 'success').length;
  const failed = logs.filter(l => l.status === 'failed').length;
  
  const logsTotal = document.getElementById('logsTotal');
  const logsSuccess = document.getElementById('logsSuccess');
  const logsFailed = document.getElementById('logsFailed');
  const logsAvg = document.getElementById('logsAvg');
  
  if (logsTotal) logsTotal.textContent = total;
  if (logsSuccess) logsSuccess.textContent = success;
  if (logsFailed) logsFailed.textContent = failed;
  if (logsAvg) logsAvg.textContent = total > 0 ? '0.18s' : '—';
}

// ============================================================
// ===== INITIALIZE DASHBOARD =====
// ============================================================

async function initializeDashboard() {
  const user = getUserData();
  if (!user) return;

  updateDashboardUI(user);
  await fetchChartData();
  await fetchRecentActivity();
  await fetchDailyHistory();
  await fetchAndUpdateLogs();
}

// ============================================================
// ===== DELETE ACCOUNT HANDLER =====
// ============================================================

const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener('click', async function() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const data = await apiDeleteAccount();
      
      if (data.success) {
        showToast('Account deleted successfully', 'success');
        clearAuthData();
        
        const dashboardPage = document.getElementById('dashboardPage');
        if (dashboardPage) dashboardPage.classList.remove('active');
        
        const hero = document.querySelector('.hero');
        const features = document.querySelector('.features-section');
        const faq = document.querySelector('.faq-section');
        const footer = document.querySelector('.footer');
        
        if (hero) hero.style.display = 'flex';
        if (features) features.style.display = 'block';
        if (faq) faq.style.display = 'block';
        if (footer) footer.style.display = 'block';
        
        document.body.style.overflow = '';
        window.location.reload();
      } else {
        showToast(data.error || 'Failed to delete account', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  });
}

// ============================================================
// ===== BACK TO HOME (NO POP-UP) =====
// ============================================================

const backBtn = document.getElementById('backToHomeBtn');
if (backBtn) {
  backBtn.addEventListener('click', function() {
    const dashboardPage = document.getElementById('dashboardPage');
    if (dashboardPage) dashboardPage.classList.remove('active');
    
    const hero = document.querySelector('.hero');
    const features = document.querySelector('.features-section');
    const faq = document.querySelector('.faq-section');
    const footer = document.querySelector('.footer');
    
    if (hero) hero.style.display = 'flex';
    if (features) features.style.display = 'block';
    if (faq) faq.style.display = 'block';
    if (footer) footer.style.display = 'block';
    
    document.body.style.overflow = '';
    window.scrollTo({ top: 0 });
  });
}

// ============================================================
// ===== AUTH HANDLERS =====
// ============================================================

// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName')?.value.trim() || '';
    const email = document.getElementById('regEmail')?.value.trim() || '';
    const password = document.getElementById('regPassword')?.value || '';
    const confirm = document.getElementById('regConfirm')?.value || '';
    
    if (!name || !email || !password || !confirm) {
      showToast('Please fill all fields', 'error');
      return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      const data = await apiRegister(name, email, password);
      if (data.success) {
        setAuthData(data.user);
        showToast('Account created successfully', 'success');
        const authOverlay = document.getElementById('authOverlay');
        if (authOverlay) authOverlay.classList.remove('active');
        document.body.style.overflow = '';
        showDashboard();
        initializeDashboard();
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value.trim() || '';
    const password = document.getElementById('loginPassword')?.value || '';
    
    if (!email || !password) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    try {
      const data = await apiLogin(email, password);
      if (data.success) {
        setAuthData(data.user);
        showToast('Login successful', 'success');
        const authOverlay = document.getElementById('authOverlay');
        if (authOverlay) authOverlay.classList.remove('active');
        document.body.style.overflow = '';
        showDashboard();
        initializeDashboard();
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  });
}

// ============================================================
// ===== PROFILE HANDLERS =====
// ============================================================

// Update Username
const changeUsernameBtn = document.getElementById('changeUsernameBtn');
if (changeUsernameBtn) {
  changeUsernameBtn.addEventListener('click', async function() {
    const username = document.getElementById('profileUsername')?.value.trim() || '';
    if (username.length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return;
    }
    
    try {
      const data = await apiUpdateName(username);
      if (data.success) {
        const user = getUserData();
        user.name = data.user.name;
        setAuthData(user);
        updateDashboardUI(user);
        showToast('Username updated successfully', 'success');
      } else {
        showToast(data.error || 'Failed to update username', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  });
}

// Update Password
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
if (updatePasswordBtn) {
  updatePasswordBtn.addEventListener('click', async function() {
    const current = document.getElementById('currentPass')?.value || '';
    const newPass = document.getElementById('newPass')?.value || '';
    const confirm = document.getElementById('confirmPass')?.value || '';
    
    if (!current || !newPass || !confirm) {
      showToast('Please fill all password fields', 'error');
      return;
    }
    if (newPass !== confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      const data = await apiUpdatePassword(current, newPass);
      if (data.success) {
        showToast('Password updated successfully', 'success');
        const cp = document.getElementById('currentPass');
        const np = document.getElementById('newPass');
        const cf = document.getElementById('confirmPass');
        if (cp) cp.value = '';
        if (np) np.value = '';
        if (cf) cf.value = '';
      } else {
        showToast(data.error || 'Failed to update password', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  });
}

// Upload Avatar
const uploadInput = document.getElementById('upload');
if (uploadInput) {
  uploadInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be less than 2MB', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const data = await apiUpdateAvatar(e.target.result);
        if (data.success) {
          const preview = document.getElementById('preview');
          if (preview) preview.src = data.avatarUrl;
          const user = getUserData();
          user.avatarUrl = data.avatarUrl;
          setAuthData(user);
          updateDashboardUI(user);
          showToast('Profile picture updated', 'success');
        } else {
          showToast(data.error || 'Failed to upload image', 'error');
        }
      } catch (error) {
        showToast('Server error. Please try again.', 'error');
      }
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================
// ===== PHONE VALIDATOR =====
// ============================================================

// Country Selector
(function() {
  const countries = [
    { name: 'Pakistan', code: '+92', flag: 'https://flagcdn.com/w40/pk.png' },
    { name: 'India', code: '+91', flag: 'https://flagcdn.com/w40/in.png' },
    { name: 'United States', code: '+1', flag: 'https://flagcdn.com/w40/us.png' },
    { name: 'United Kingdom', code: '+44', flag: 'https://flagcdn.com/w40/gb.png' },
    { name: 'UAE', code: '+971', flag: 'https://flagcdn.com/w40/ae.png' },
    { name: 'Saudi Arabia', code: '+966', flag: 'https://flagcdn.com/w40/sa.png' },
    { name: 'Canada', code: '+1', flag: 'https://flagcdn.com/w40/ca.png' },
    { name: 'Australia', code: '+61', flag: 'https://flagcdn.com/w40/au.png' },
    { name: 'Germany', code: '+49', flag: 'https://flagcdn.com/w40/de.png' },
    { name: 'Japan', code: '+81', flag: 'https://flagcdn.com/w40/jp.png' }
  ];
  
  const dropdown = document.getElementById('dropdown');
  const button = document.getElementById('countryBtn');
  const list = document.getElementById('countryList');
  const search = document.getElementById('searchCountry');
  
  function renderCountries(data) {
    if (!list) return;
    list.innerHTML = '';
    data.forEach(country => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${country.flag}" alt="${country.name}" style="width:24px;">
          <span>${country.name}</span>
        </div>
        <strong>${country.code}</strong>
      `;
      li.onclick = () => selectCountry(country);
      list.appendChild(li);
    });
  }
  
  renderCountries(countries);
  
  function selectCountry(country) {
    const countryName = document.getElementById('countryName');
    const flagImg = document.querySelector('.selectBox img');
    const dialCode = document.getElementById('dialCode');
    const countryResult = document.getElementById('countryResult');
    
    if (countryName) countryName.innerText = country.name;
    if (flagImg) flagImg.src = country.flag;
    if (dialCode) dialCode.value = country.code;
    if (countryResult) countryResult.innerText = country.name;
    if (dropdown) dropdown.classList.remove('show');
    if (button) button.classList.remove('active');
  }
  
  if (button) {
    button.onclick = (e) => {
      e.stopPropagation();
      if (dropdown) dropdown.classList.toggle('show');
      button.classList.toggle('active');
    };
  }
  
  if (search) {
    search.addEventListener('keyup', () => {
      const keyword = search.value.toLowerCase();
      const filtered = countries.filter(c => c.name.toLowerCase().includes(keyword));
      renderCountries(filtered);
    });
  }
  
  document.addEventListener('click', (e) => {
    if (button && dropdown && !button.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
      button.classList.remove('active');
    }
  });
})();

// Validate Phone
const validateBtn = document.querySelector('.validateBtn');
if (validateBtn) {
  validateBtn.addEventListener('click', async function() {
    const phone = document.getElementById('phone')?.value.trim() || '';
    const dialCode = document.getElementById('dialCode')?.value || '+92';
    const fullNumber = dialCode + phone;
    
    if (phone.length < 6) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }
    
    try {
      const data = await apiValidatePhone(fullNumber);
      
      const status = document.getElementById('statusText');
      const carrier = document.getElementById('carrier');
      const region = document.getElementById('region');
      
      if (data.success && data.valid) {
        if (status) {
          status.innerHTML = 'Valid';
          status.style.color = '#22c55e';
        }
        if (carrier) carrier.innerHTML = data.carrier || '—';
        if (region) region.innerHTML = data.region || '—';
        const countryResult = document.getElementById('countryResult');
        if (countryResult) countryResult.innerHTML = data.country || '—';
        
        const user = getUserData();
        user.usageCount = data.usageUsed;
        setAuthData(user);
        updateDashboardUI(user);
        
        await initializeDashboard();
        showToast(`Phone validated successfully. ${data.usageLeft} credits remaining`, 'success');
      } else {
        if (status) {
          status.innerHTML = 'Invalid';
          status.style.color = '#ef4444';
        }
        if (carrier) carrier.innerHTML = '—';
        if (region) region.innerHTML = '—';
        showToast(data.error || 'Invalid phone number', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  });
}

const phoneInput = document.getElementById('phone');
if (phoneInput && validateBtn) {
  phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      validateBtn.click();
    }
  });
}

// ============================================================
// ===== DASHBOARD & NAVIGATION =====
// ============================================================

function showDashboard() {
  const user = getUserData();
  if (user) {
    const dashboardPage = document.getElementById('dashboardPage');
    if (dashboardPage) dashboardPage.classList.add('active');
    updateDashboardUI(user);
    
    const hero = document.querySelector('.hero');
    const features = document.querySelector('.features-section');
    const faq = document.querySelector('.faq-section');
    const footer = document.querySelector('.footer');
    if (hero) hero.style.display = 'none';
    if (features) features.style.display = 'none';
    if (faq) faq.style.display = 'none';
    if (footer) footer.style.display = 'none';
  }
}

// Sidebar Navigation
document.querySelectorAll('.sidebar-nav a[data-page]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    document.querySelectorAll('.sidebar-nav a[data-page]').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    
    const page = this.dataset.page;
    document.querySelectorAll('[id^="page-"]').forEach(p => p.style.display = 'none');
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = 'block';
    
    if (page === 'dashboard') {
      initializeDashboard();
    }
    if (page === 'logs') {
      fetchAndUpdateLogs();
    }
    if (page === 'profile') {
      const user = getUserData();
      if (user) {
        const profileUsername = document.getElementById('profileUsername');
        if (profileUsername) profileUsername.value = user.name || '';
      }
    }
    
    const names = {
      dashboard: '<i class="fas fa-th-large"></i> <span>Dashboard</span>',
      validator: '<i class="fas fa-mobile-alt"></i> <span>Phone Validator</span>',
      logs: '<i class="fas fa-list-ul"></i> <span>API Logs</span>',
      usage: '<i class="fas fa-chart-pie"></i> <span>API Usage</span>',
      profile: '<i class="fas fa-user"></i> <span>Profile</span>'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.innerHTML = names[page] || '<i class="fas fa-th-large"></i> <span>Dashboard</span>';
    
    const sidebar = document.getElementById('dashboardSidebar');
    if (window.innerWidth <= 768 && sidebar) {
      sidebar.classList.remove('open');
    }
  });
});

// ============================================================
// ===== THEME TOGGLE =====
// ============================================================

const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    try { localStorage.setItem('verifyline_theme', isDark ? 'dark' : 'light'); } catch(e) {}
  });
}

try {
  if (localStorage.getItem('verifyline_theme') === 'dark') {
    document.body.classList.add('dark');
    if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }
} catch(e) {}

// ============================================================
// ===== SIDEBAR TOGGLE (Mobile) =====
// ============================================================

const sidebarToggleTheme = document.getElementById('sidebarToggleTheme');
if (sidebarToggleTheme) {
  sidebarToggleTheme.addEventListener('click', function() {
    if (themeBtn) themeBtn.click();
  });
}

// ============================================================
// ===== QUICK ACTIONS =====
// ============================================================

const qv1 = document.getElementById('quickValidate');
if (qv1) {
  qv1.addEventListener('click', function() {
    const link = document.querySelector('.sidebar-nav a[data-page="validator"]');
    if (link) link.click();
  });
}

const qv2 = document.getElementById('quickValidateSecondary');
if (qv2) {
  qv2.addEventListener('click', function() {
    const link = document.querySelector('.sidebar-nav a[data-page="validator"]');
    if (link) link.click();
  });
}

const qau = document.getElementById('quickApiUsage');
if (qau) {
  qau.addEventListener('click', function() {
    const link = document.querySelector('.sidebar-nav a[data-page="usage"]');
    if (link) link.click();
  });
}

const qal = document.getElementById('quickApiLogs');
if (qal) {
  qal.addEventListener('click', function() {
    const link = document.querySelector('.sidebar-nav a[data-page="logs"]');
    if (link) link.click();
  });
}

// ============================================================
// ===== REGENERATE API KEY =====
// ============================================================

const regenBtn = document.getElementById('regenApiQuick');
if (regenBtn) {
  regenBtn.addEventListener('click', async function() {
    if (!confirm('Are you sure you want to regenerate your API key?')) return;
    
    try {
      const data = await apiRegenerateKey();
      if (data.success) {
        const user = getUserData();
        user.apiKey = data.apiKey;
        setAuthData(user);
        showToast('API key regenerated successfully', 'success');
      } else {
        showToast(data.error || 'Failed to regenerate API key', 'error');
      }
    } catch (error) {
      showToast('Server error. Please try again.', 'error');
    }
  });
}

// ============================================================
// ===== LOGOUT =====
// ============================================================

const logoutBtn = document.getElementById('logoutSidebarBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
      clearAuthData();
      const dashboardPage = document.getElementById('dashboardPage');
      if (dashboardPage) dashboardPage.classList.remove('active');
      const hero = document.querySelector('.hero');
      const features = document.querySelector('.features-section');
      const faq = document.querySelector('.faq-section');
      const footer = document.querySelector('.footer');
      if (hero) hero.style.display = 'flex';
      if (features) features.style.display = 'block';
      if (faq) faq.style.display = 'block';
      if (footer) footer.style.display = 'block';
      document.body.style.overflow = '';
      showToast('Logged out successfully', 'info');
    }
  });
}

// ============================================================
// ===== AUTH MODAL =====
// ============================================================

const openAuthBtn = document.getElementById('openAuthBtn');
if (openAuthBtn) {
  openAuthBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const user = getUserData();
    if (user) {
      showDashboard();
      initializeDashboard();
    } else {
      const authOverlay = document.getElementById('authOverlay');
      if (authOverlay) {
        authOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  });
}

const heroAuthBtn = document.getElementById('heroAuthBtn');
if (heroAuthBtn) {
  heroAuthBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const user = getUserData();
    if (user) {
      showDashboard();
      initializeDashboard();
    } else {
      const authOverlay = document.getElementById('authOverlay');
      if (authOverlay) {
        authOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  });
}

const closeAuthBtn = document.getElementById('closeAuthBtn');
if (closeAuthBtn) {
  closeAuthBtn.addEventListener('click', function() {
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) {
      authOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

const authOverlay = document.getElementById('authOverlay');
if (authOverlay) {
  authOverlay.addEventListener('click', function(e) {
    if (e.target === this) {
      authOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Auth Tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    const tabName = this.dataset.tab;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.classList.toggle('hidden', tabName !== 'login');
    if (registerForm) registerForm.classList.toggle('hidden', tabName !== 'register');
  });
});

const switchToRegister = document.getElementById('switchToRegister');
if (switchToRegister) {
  switchToRegister.addEventListener('click', function() {
    const tab = document.querySelector('.auth-tab[data-tab="register"]');
    if (tab) tab.click();
  });
}

const switchToLogin = document.getElementById('switchToLogin');
if (switchToLogin) {
  switchToLogin.addEventListener('click', function() {
    const tab = document.querySelector('.auth-tab[data-tab="login"]');
    if (tab) tab.click();
  });
}

// ============================================================
// ===== FAQ ACCORDION =====
// ============================================================

document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  const ans = item.querySelector('.faq-answer');
  const icon = btn ? btn.querySelector('i') : null;
  
  if (btn) {
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const a = i.querySelector('.faq-answer');
        const ic = i.querySelector('.faq-question i');
        if (a) a.style.display = 'none';
        if (ic) ic.style.transform = 'rotate(0deg)';
      });
      if (!isOpen) {
        item.classList.add('active');
        if (ans) ans.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  }
});

// ============================================================
// ===== MOBILE RESPONSIVE FIXES =====
// ============================================================

// ===== 1. NAVBAR HAMBURGER (Mobile) =====
(function() {
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      const icon = this.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      const nav = document.querySelector('nav');
      if (nav && !nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }
})();

// ===== 2. DASHBOARD SIDEBAR TOGGLE (Mobile) =====
(function() {
  let toggleBtn = null;
  let sidebar = null;
  let topbarLeft = null;

  function initSidebarToggle() {
    sidebar = document.getElementById('dashboardSidebar');
    topbarLeft = document.querySelector('.dashboard-topbar .left');
    
    if (!sidebar || !topbarLeft) return;
    
    // Remove existing toggle button
    const existingBtn = document.getElementById('sidebarToggleBtn');
    if (existingBtn) existingBtn.remove();

    // Only show on mobile
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open');
      return;
    }

    // Create toggle button
    toggleBtn = document.createElement('button');
    toggleBtn.id = 'sidebarToggleBtn';
    toggleBtn.className = 'sidebar-toggle-btn';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
    toggleBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 22px;
      color: #1e293b;
      cursor: pointer;
      margin-right: 12px;
      padding: 4px 8px;
      display: inline-block;
    `;
    topbarLeft.prepend(toggleBtn);

    // Dark mode style
    if (document.body.classList.contains('dark')) {
      toggleBtn.style.color = '#e2e8f0';
    }

    // Toggle sidebar
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      const icon = this.querySelector('i');
      if (sidebar.classList.contains('open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
      if (sidebar && toggleBtn && sidebar.classList.contains('open') && 
          !sidebar.contains(e.target) && 
          !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });

    // Close sidebar on resize to desktop
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (toggleBtn) {
          const icon = toggleBtn.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
        }
      }
      // Re-initialize on resize
      initSidebarToggle();
    });
  }

  // Initialize when dashboard loads
  const observer = new MutationObserver(function() {
    const dashboardPage = document.getElementById('dashboardPage');
    if (dashboardPage && dashboardPage.classList.contains('active')) {
      setTimeout(initSidebarToggle, 200);
    }
  });
  observer.observe(document.body, { attributes: true, subtree: true });

  // Also initialize on page load
  document.addEventListener('DOMContentLoaded', initSidebarToggle);
  // Also call after everything loads
  window.addEventListener('load', function() {
    setTimeout(initSidebarToggle, 500);
  });
})();

// ============================================================
// ===== INIT =====
// ============================================================

const savedUser = getUserData();
if (savedUser && savedUser.apiKey) {
  updateDashboardUI(savedUser);
  showDashboard();
  initializeDashboard();
}

updateUIButtons();

console.log('VerifyLine Frontend Connected to Backend');
console.log('API Base URL:', API_BASE_URL);