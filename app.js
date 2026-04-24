const API_BASE_URL = 'http://localhost:3001'; // Replace this with your deployed backend URL when ready

const showMessage = (message, type = 'success') => {
  const alertBox = document.getElementById('page-alert');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert-box ${type === 'error' ? 'alert-error' : 'alert-success'}`;
  alertBox.style.display = 'block';
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
};

const clearMessage = () => {
  const alertBox = document.getElementById('page-alert');
  if (alertBox) {
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  }
};

const setLoading = (button, isLoading, label) => {
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<span class="loader"></span> ${label || 'Please wait'}`;
  } else {
    button.disabled = false;
    button.innerHTML = label || button.dataset.defaultText;
  }
};

const getToken = () => localStorage.getItem('payperapi_token');
const getUser = () => JSON.parse(localStorage.getItem('payperapi_user') || 'null');

const saveAuth = (token, user) => {
  localStorage.setItem('payperapi_token', token);
  localStorage.setItem('payperapi_user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('payperapi_token');
  localStorage.removeItem('payperapi_user');
};

const apiRequest = async (url, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const redirectIfLoggedIn = () => {
  if (getToken()) {
    window.location.href = 'dashboard.html';
  }
};

const requireAuth = () => {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
};

const initLanding = () => {
  redirectIfLoggedIn();
};

const initLogin = () => {
  redirectIfLoggedIn();
  const form = document.getElementById('login-form');
  const button = document.getElementById('login-button');
  button.dataset.defaultText = 'Login';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      setLoading(button, true, 'Signing in...');
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveAuth(data.token, data.user);
      showMessage('Login successful! Redirecting...', 'success');
      window.setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(button, false);
    }
  });
};

const initSignup = () => {
  redirectIfLoggedIn();
  const form = document.getElementById('signup-form');
  const button = document.getElementById('signup-button');
  button.dataset.defaultText = 'Signup';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const firstName = document.getElementById('signup-first-name').value.trim();
    const lastName = document.getElementById('signup-last-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
      setLoading(button, true, 'Creating account...');
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      saveAuth(data.token, data.user);
      showMessage('Signup successful! Redirecting...', 'success');
      window.setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(button, false);
    }
  });
};

const loadDashboardUser = async () => {
  try {
    const data = await apiRequest('/api/auth/me');
    saveAuth(getToken(), data.user);
    return data.user;
  } catch (error) {
    clearAuth();
    window.location.href = 'login.html';
    return null;
  }
};

const renderDashboard = (user) => {
  const name = `${user.firstName} ${user.lastName}`;
  document.getElementById('dashboard-user-name').textContent = name;
  document.getElementById('dashboard-email').textContent = user.email;
  document.getElementById('dashboard-credits').textContent = user.credits;
  document.getElementById('dashboard-api-key').textContent = user.apiKey || 'N/A';
};

const initDashboard = async () => {
  if (!requireAuth()) return;

  const user = await loadDashboardUser();
  if (!user) return;

  renderDashboard(user);

  document.getElementById('logout-button').addEventListener('click', () => {
    clearAuth();
    window.location.href = 'login.html';
  });

  document.getElementById('weather-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const button = document.getElementById('weather-button');
    button.dataset.defaultText = 'Get Weather';
    const city = document.getElementById('weather-city').value.trim();
    const weatherResult = document.getElementById('weather-result');

    if (!city) {
      showMessage('Please enter a city name.', 'error');
      return;
    }

    try {
      setLoading(button, true, 'Fetching weather...');
      weatherResult.textContent = '';
      const data = await apiRequest(`/api/weather?city=${encodeURIComponent(city)}`);
      weatherResult.innerHTML = `
        <div class="fw-semibold">${data.city}</div>
        <div>${data.weather}</div>
        <div>${data.temperature}°C</div>
        <div class="text-muted">Credits left: ${data.remainingCredits}</div>
      `;

      const updatedUser = { ...user, credits: data.remainingCredits };
      saveAuth(getToken(), updatedUser);
      renderDashboard(updatedUser);
      showMessage('Weather loaded successfully.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(button, false);
    }
  });
};

const pageMap = {
  landing: initLanding,
  login: initLogin,
  signup: initSignup,
  dashboard: initDashboard,
};

const pageName = document.body.dataset.page;
if (pageMap[pageName]) {
  pageMap[pageName]();
}
