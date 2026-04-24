const API_BASE_URL = 'https://pay-per-api-3.onrender.com';

const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.padding = '14px 18px';
  toast.style.borderRadius = '16px';
  toast.style.color = '#ffffff';
  toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
  toast.style.boxShadow = '0 24px 60px rgba(0,0,0,0.25)';
  toast.style.zIndex = '9999';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
};

const saveAuth = (token, user) => {
  localStorage.setItem('payperapi_token', token);
  localStorage.setItem('payperapi_user', JSON.stringify(user));
};

const getAuthToken = () => localStorage.getItem('payperapi_token');
const getCurrentUser = () => JSON.parse(localStorage.getItem('payperapi_user') || 'null');
const logout = () => {
  localStorage.removeItem('payperapi_token');
  localStorage.removeItem('payperapi_user');
  window.location.href = 'login.html';
};

const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  return res.json();
};

const initLanding = () => {
  // no special logic for landing page
};

const initLogin = () => {
  const loginForm = document.getElementById('login-form');
  const passwordToggle = document.getElementById('toggle-login-password');

  passwordToggle.addEventListener('click', () => {
    const input = document.getElementById('login-password');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.token) {
        saveAuth(data.token, data.user);
        showToast('Login successful');
        window.location.href = 'dashboard.html';
      } else {
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to the server. Please try again later.', 'error');
    }
  });
};

const initSignup = () => {
  const signupForm = document.getElementById('signup-form');
  const passwordToggle = document.getElementById('toggle-signup-password');

  passwordToggle.addEventListener('click', () => {
    const input = document.getElementById('signup-password');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const firstName = document.getElementById('signup-firstName').value.trim();
    const lastName = document.getElementById('signup-lastName').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      if (data.token) {
        saveAuth(data.token, data.user);
        showToast('Account created successfully');
        window.location.href = 'dashboard.html';
      } else {
        showToast(data.message || 'Signup failed', 'error');
      }
    } catch (error) {
      showToast('Unable to connect to the server. Please try again later.', 'error');
    }
  });
};

const renderUsage = (items) => {
  const container = document.getElementById('usage-list');
  if (!container) return;
  container.innerHTML = items.length
    ? items.map((item) => `
      <div class="usage-item">
        <strong>${item.endpoint}</strong>
        <div>Used at: ${new Date(item.createdAt).toLocaleString()}</div>
        <div>Credits: ${item.creditsUsed}</div>
      </div>
    `).join('')
    : '<div class="usage-item">No usage yet. Make your first API call!</div>';
};

const initDashboard = async () => {
  const user = getCurrentUser();
  if (!user) return logout();

  document.getElementById('dashboard-user').textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById('dashboard-firstName').textContent = user.firstName;
  document.getElementById('dashboard-email').textContent = user.email;
  document.getElementById('dashboard-credits').textContent = user.credits;
  document.getElementById('dashboard-apiKey').textContent = user.apiKey;

  document.getElementById('logout-button').addEventListener('click', logout);

  const refreshUsageButton = document.getElementById('refresh-usage');
  refreshUsageButton.addEventListener('click', loadUsage);

  document.getElementById('regenerate-key').addEventListener('click', async () => {
    const data = await apiRequest('/api/auth/regenerate-api-key', { method: 'POST' });
    if (data.success) {
      showToast('API key regenerated');
      document.getElementById('dashboard-apiKey').textContent = data.apiKey;
      user.apiKey = data.apiKey;
      saveAuth(getAuthToken(), user);
    } else {
      showToast(data.message || 'Could not regenerate key', 'error');
    }
  });

  document.getElementById('call-protected-api').addEventListener('click', async () => {
    const response = await fetch(`${API_BASE_URL}/api/protected-data`, {
      headers: { 'x-api-key': user.apiKey }
    });
    const data = await response.json();
    if (data.success) {
      document.getElementById('api-response').textContent = `${data.message} Remaining credits: ${data.data.remainingCredits}`;
      showToast('Protected API called successfully');
      document.getElementById('dashboard-credits').textContent = data.data.remainingCredits;
      user.credits = data.data.remainingCredits;
      saveAuth(getAuthToken(), user);
      loadUsage();
    } else {
      showToast(data.message || 'Call failed', 'error');
    }
  });

  document.getElementById('call-weather-api').addEventListener('click', async () => {
    const city = document.getElementById('weather-city').value.trim() || 'London';
    const data = await apiRequest(`/api/weather?city=${encodeURIComponent(city)}`);

    if (data.success) {
      document.getElementById('weather-response').textContent = `Weather in ${data.city}: ${data.weather}, ${data.temperature}°C. Remaining credits: ${data.remainingCredits}`;
      showToast('Weather API call successful');
      document.getElementById('dashboard-credits').textContent = data.remainingCredits;
      user.credits = data.remainingCredits;
      saveAuth(getAuthToken(), user);
      loadUsage();
    } else {
      showToast(data.message || 'Weather API failed', 'error');
    }
  });

  await loadUsage();
};

const loadUsage = async () => {
  const data = await apiRequest('/api/dashboard/usage');
  if (data.success) {
    renderUsage(data.history || []);
  } else {
    showToast(data.message || 'Could not load usage', 'error');
  }
};

const pageMap = {
  landing: initLanding,
  login: initLogin,
  signup: initSignup,
  dashboard: initDashboard
};

const pageName = document.body.dataset.page;
if (pageMap[pageName]) {
  pageMap[pageName]();
}
