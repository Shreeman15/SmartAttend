// =============================================
//  HR System — api.js (shared)
// =============================================
const BASE_URL = 'http://localhost:5001/api';


const getToken  = () => localStorage.getItem('hr_token');
const getUser   = () => { try { return JSON.parse(localStorage.getItem('hr_user')); } catch { return null; } };

const setAuth   = (token, user) => { localStorage.setItem('hr_token', token); localStorage.setItem('hr_user', JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem('hr_token'); localStorage.removeItem('hr_user'); };

// Determine current folder (admin/ or employee/)
const isAdminPage    = () => window.location.pathname.includes('/admin/');
const isEmployeePage = () => window.location.pathname.includes('/employee/');

function requireAuth() {
  const token = getToken(), user = getUser();
  if (!token || !user) { window.location.href = '../index.html'; return null; }
  return user;
}

function requireAdmin() {
  const user = requireAuth();
  if (!user) return null;
  if (user.role !== 'admin' && user.role !== 'manager') {
    alert('Access denied. Admin only.');
    window.location.href = '../employee/dashboard.html';
    return null;
  }
  return user;
}

function requireEmployee() {
  return requireAuth(); // any logged in user can access employee pages
}

// After login, redirect based on role
function redirectByRole(user) {
  if (user.role === 'admin' || user.role === 'manager') {
    window.location.href = 'admin/dashboard.html';
  } else {
    window.location.href = 'employee/dashboard.html';
  }
}

async function apiFetch(endpoint, options = {}) {
  const token   = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res  = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch'))
      throw new Error('Cannot reach server. Make sure backend is running on port 5000.');
    throw err;
  }
}

const api = {
  get:    (url)       => apiFetch(url),
  post:   (url, body) => apiFetch(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (url, body) => apiFetch(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (url)       => apiFetch(url, { method: 'DELETE' }),
};

// Toast
function showToast(message, type = 'info') {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className   = `toast ${type}`;
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(100%)'; t.style.transition='0.3s'; setTimeout(()=>t.remove(),300); }, 3500);
}

// Helpers
function statusBadge(status) {
  const map = { Present:'badge-present', Absent:'badge-absent', 'Half-day':'badge-halfday', 'On Leave':'badge-leave', Weekend:'badge-weekend', Pending:'badge-pending', Approved:'badge-approved', Rejected:'badge-rejected' };
  return `<span class="badge ${map[status]||''}">${status}</span>`;
}
function fmtDate(d) {
  if (!d) return '—';
  // Strip time part if already a full ISO string (e.g. "2024-01-15T00:00:00.000Z")
  // so we always work with just "YYYY-MM-DD" before adding T00:00:00
  const dateOnly = String(d).split('T')[0];
  const parsed = new Date(dateOnly + 'T00:00:00');
  if (isNaN(parsed)) return '—';
  return parsed.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
}
function fmtCurrency(n) {
  return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);
}
async function populateEmployeeDropdown(selectId, includeAll = true) {
  try {
    const res    = await api.get('/employees');
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = includeAll ? '<option value="">— All Employees —</option>' : '<option value="">— Select Employee —</option>';
    (res.data||[]).forEach(emp => {
      const o = document.createElement('option');
      o.value       = emp._id;
      o.textContent = `${emp.name} (${emp.department})`;
      select.appendChild(o);
    });
  } catch (err) { console.error('Dropdown error:', err); }
}

// Sidebar init
function initSidebar() {
  const user = getUser();
  if (!user) return;
  const initials = user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const av = document.getElementById('sidebar-avatar');
  const nm = document.getElementById('sidebar-name');
  const rl = document.getElementById('sidebar-role');
  if (av) av.textContent = initials;
  if (nm) nm.textContent = user.name;
  if (rl) rl.textContent = user.role.charAt(0).toUpperCase()+user.role.slice(1)+' · '+user.department;

  const cur = window.location.pathname;
  document.querySelectorAll('.nav-item[href]').forEach(item => {
    const href = item.getAttribute('href').replace('.html','').split('/').pop();
    if (href && cur.includes(href)) item.classList.add('active');
  });

  const ham = document.getElementById('hamburger');
  const sb  = document.getElementById('sidebar');
  if (ham && sb) {
    ham.addEventListener('click', e => { e.stopPropagation(); sb.classList.toggle('open'); });
    document.addEventListener('click', e => { if (sb && !sb.contains(e.target)) sb.classList.remove('open'); });
  }
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { clearAuth(); window.location.href='../index.html'; });
}
