const tokenKey = 'apsc_token';
const userKey = 'apsc_user';

const loginTabBtn = document.querySelector('[data-tab="loginTab"]');
const registerTabBtn = document.querySelector('[data-tab="registerTab"]');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

function switchTab(tab) {
  if (tab === 'loginTab') {
    loginTabBtn.classList.add('active');
    registerTabBtn.classList.remove('active');
    loginTab.classList.remove('hidden');
    registerTab.classList.add('hidden');
  } else {
    loginTabBtn.classList.remove('active');
    registerTabBtn.classList.add('active');
    loginTab.classList.add('hidden');
    registerTab.classList.remove('hidden');
  }
}

loginTabBtn?.addEventListener('click', () => switchTab('loginTab'));
registerTabBtn?.addEventListener('click', () => switchTab('registerTab'));

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginStatus = document.getElementById('loginStatus');
const registerStatus = document.getElementById('registerStatus');

const forgotPasswordButton = document.getElementById('forgotPasswordButton');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotStatus = document.getElementById('forgotStatus');
const closeForgotModal = document.getElementById('closeForgotModal');

function showForgotModal() {
  forgotPasswordModal.classList.remove('hidden');
}

function hideForgotModal() {
  forgotPasswordModal.classList.add('hidden');
  forgotStatus.textContent = '';
}

forgotPasswordButton?.addEventListener('click', showForgotModal);
closeForgotModal?.addEventListener('click', hideForgotModal);

function setFieldError(id, message) {
  const el = document.querySelector(`[data-error-for="${id}"]`);
  if (el) el.textContent = message || '';
}

function clearAllErrors() {
  document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
}

function saveAuth(token, user) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
}

function getStoredUser() {
  const raw = localStorage.getItem(userKey);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

// UPDATED REDIRECT LOGIC
function redirectAfterLogin(user) {
  if (user?.isAdmin) {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'abstracts.html';
  }
}

//---------------------------
// LOGIN
//---------------------------
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();
  loginStatus.textContent = '';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  let hasError = false;
  if (!email) {
    setFieldError('loginEmail', 'Email is required');
    hasError = true;
  }
  if (!password) {
    setFieldError('loginPassword', 'Password is required');
    hasError = true;
  }
  if (hasError) return;

  try {
    loginStatus.textContent = 'Signing in...';
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      loginStatus.textContent = data.message || 'Login failed';
      return;
    }

    saveAuth(data.token, data.user);
    loginStatus.textContent = 'Login successful, redirecting...';

    redirectAfterLogin(data.user);
  } catch (err) {
    loginStatus.textContent = 'Network error. Please try again.';
  }
});

//---------------------------
// REGISTRATION
//---------------------------
registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();
  registerStatus.textContent = '';

  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  let hasError = false;
  if (!email) {
    setFieldError('registerEmail', 'Email is required');
    hasError = true;
  }
  if (!password) {
    setFieldError('registerPassword', 'Password is required');
    hasError = true;
  } else if (password.length < 8) {
    setFieldError('registerPassword', 'Password must be at least 8 characters');
    hasError = true;
  }
  if (!confirmPassword) {
    setFieldError('registerConfirmPassword', 'Please confirm password');
    hasError = true;
  } else if (password !== confirmPassword) {
    setFieldError('registerConfirmPassword', 'Passwords do not match');
    hasError = true;
  }

  if (hasError) return;

  try {
    registerStatus.textContent = 'Creating account...';
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword })
    });

    const data = await res.json();
    if (!res.ok) {
      registerStatus.textContent = data.message || 'Registration failed';
      return;
    }

    saveAuth(data.token, data.user);
    registerStatus.textContent = 'Account created, redirecting...';

    redirectAfterLogin(data.user);
  } catch (err) {
    registerStatus.textContent = 'Network error. Please try again.';
  }
});

//---------------------------
// FORGOT PASSWORD
//---------------------------
forgotPasswordForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFieldError('forgotEmail', '');
  forgotStatus.textContent = '';

  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) {
    setFieldError('forgotEmail', 'Email is required');
    return;
  }

  try {
    forgotStatus.textContent = 'Sending reset link...';
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      forgotStatus.textContent = data.message || 'Error sending reset link';
      return;
    }
    forgotStatus.textContent = data.message;
  } catch (err) {
    forgotStatus.textContent = 'Network error. Please try again.';
  }
});

//---------------------------
// AUTO-REDIRECT IF LOGGED IN
//---------------------------
if (getToken()) {
  const user = getStoredUser();
  if (user?.isAdmin) {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'abstracts.html';
  }
}
