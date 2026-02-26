/* ============================================================
   SmartAttend — Core App JS
   Handles: routing, auth state, toast system, utilities
   ============================================================ */

'use strict';

// ─── Utility Functions ─────────────────────────────────────────
const Utils = {
  formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  },
  formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  },
  formatDateShort(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  },
  formatElapsed(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },
  avatarColor(id) {
    const num = parseInt(id.replace(/\D/g,''), 10) || 0;
    return `hsl(${(num * 137.5) % 360}, 58%, 44%)`;
  },
  generateAttendanceHistory(days = 60) {
    const history = [];
    const statuses = ['present','absent','late','leave'];
    const weights  = [0.65, 0.10, 0.15, 0.10];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;
      const rand = Math.random();
      let cum = 0, status = 'present';
      for (let j = 0; j < statuses.length; j++) {
        cum += weights[j];
        if (rand < cum) { status = statuses[j]; break; }
      }
      const inH  = status==='present' ? 8+Math.floor(Math.random()*2) : status==='late' ? 10+Math.floor(Math.random()*2) : null;
      const inM  = inH  ? Math.floor(Math.random()*60) : null;
      const outH = inH  ? inH + 8 + Math.floor(Math.random()*2) : null;
      const outM = outH ? Math.floor(Math.random()*60) : null;
      const totalHours = inH && outH ? (outH - inH + (outM - inM)/60).toFixed(1) : '-';
      history.push({
        date: new Date(date),
        status,
        punchIn:  inH  ? `${String(inH).padStart(2,'0')}:${String(inM).padStart(2,'0')} AM` : '-',
        punchOut: outH ? `${String(outH%12||12).padStart(2,'0')}:${String(outM).padStart(2,'0')} PM` : '-',
        totalHours,
      });
    }
    return history.reverse();
  },
};

// ─── Mock Data ─────────────────────────────────────────────────
const MOCK_USERS = {
  admin: { id:'A001', username:'admin', password:'admin123', name:'Sarah Mitchell', role:'admin', position:'HR Manager', avatar:'SM' },
  employees: [
    { id:'E001', username:'alice', password:'pass123', name:'Alice Johnson', role:'employee', department:'Engineering', position:'Senior Developer', avatar:'AJ', salary:95000 },
    { id:'E002', username:'bob',   password:'pass123', name:'Bob Smith',     role:'employee', department:'Design',      position:'UI/UX Designer',   avatar:'BS', salary:78000 },
    { id:'E003', username:'carol', password:'pass123', name:'Carol Williams',role:'employee', department:'Marketing',   position:'Marketing Lead',    avatar:'CW', salary:82000 },
  ]
};

const ALL_EMPLOYEES = [
  { id:'E001', name:'Alice Johnson',   department:'Engineering', position:'Senior Developer',   avatar:'AJ', salary:95000,  status:'present', hoursToday:6.5 },
  { id:'E002', name:'Bob Smith',       department:'Design',      position:'UI/UX Designer',     avatar:'BS', salary:78000,  status:'present', hoursToday:7.0 },
  { id:'E003', name:'Carol Williams',  department:'Marketing',   position:'Marketing Lead',     avatar:'CW', salary:82000,  status:'absent',  hoursToday:0   },
  { id:'E004', name:'David Chen',      department:'Engineering', position:'Backend Engineer',   avatar:'DC', salary:90000,  status:'present', hoursToday:8.0 },
  { id:'E005', name:'Emma Davis',      department:'Sales',       position:'Sales Executive',    avatar:'ED', salary:72000,  status:'late',    hoursToday:5.5 },
  { id:'E006', name:'Frank Miller',    department:'Finance',     position:'Financial Analyst',  avatar:'FM', salary:85000,  status:'present', hoursToday:7.5 },
  { id:'E007', name:'Grace Lee',       department:'HR',          position:'HR Specialist',      avatar:'GL', salary:68000,  status:'present', hoursToday:8.0 },
  { id:'E008', name:'Henry Wilson',    department:'Engineering', position:'DevOps Engineer',    avatar:'HW', salary:92000,  status:'leave',   hoursToday:0   },
  { id:'E009', name:'Iris Taylor',     department:'Design',      position:'Graphic Designer',   avatar:'IT', salary:65000,  status:'present', hoursToday:6.0 },
  { id:'E010', name:'Jack Brown',      department:'Product',     position:'Product Manager',    avatar:'JB', salary:105000, status:'present', hoursToday:7.0 },
  { id:'E011', name:'Kate Anderson',   department:'Engineering', position:'QA Engineer',        avatar:'KA', salary:75000,  status:'present', hoursToday:8.0 },
  { id:'E012', name:'Leo Martinez',    department:'Sales',       position:'Account Manager',    avatar:'LM', salary:77000,  status:'late',    hoursToday:4.5 },
  { id:'E013', name:'Mia Thompson',    department:'Marketing',   position:'Content Strategist', avatar:'MT', salary:70000,  status:'present', hoursToday:7.0 },
  { id:'E014', name:'Nathan White',    department:'Finance',     position:'Accountant',         avatar:'NW', salary:72000,  status:'absent',  hoursToday:0   },
  { id:'E015', name:'Olivia Harris',   department:'HR',          position:'Recruiter',          avatar:'OH', salary:64000,  status:'present', hoursToday:6.5 },
  { id:'E016', name:'Paul Jackson',    department:'Engineering', position:'Frontend Developer', avatar:'PJ', salary:88000,  status:'present', hoursToday:8.0 },
  { id:'E017', name:'Quinn Roberts',   department:'Design',      position:'Product Designer',   avatar:'QR', salary:80000,  status:'leave',   hoursToday:0   },
  { id:'E018', name:'Rachel Green',    department:'Product',     position:'Product Analyst',    avatar:'RG', salary:82000,  status:'present', hoursToday:5.0 },
  { id:'E019', name:'Sam Turner',      department:'Sales',       position:'Sales Manager',      avatar:'ST', salary:95000,  status:'present', hoursToday:7.5 },
  { id:'E020', name:'Tina Moore',      department:'Finance',     position:'Finance Manager',    avatar:'TM', salary:98000,  status:'present', hoursToday:8.0 },
];

// ─── Auth ──────────────────────────────────────────────────────
const Auth = {
  getUser() {
    try { return JSON.parse(localStorage.getItem('smartattend_user')); }
    catch { return null; }
  },
  setUser(u) { localStorage.setItem('smartattend_user', JSON.stringify(u)); },
  clearUser() { localStorage.removeItem('smartattend_user'); },
  isAdmin() { const u = this.getUser(); return u?.role === 'admin'; },
  login(username, password) {
    if (username === MOCK_USERS.admin.username && password === MOCK_USERS.admin.password)
      return MOCK_USERS.admin;
    return MOCK_USERS.employees.find(e => e.username === username && e.password === password) || null;
  },
};

// ─── Toast ─────────────────────────────────────────────────────
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show({ title, description = '', type = 'info' }) {
    const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]||'ℹ️'}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${description ? `<div class="toast-desc">${description}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// ─── Router ────────────────────────────────────────────────────
const Router = {
  routes: {},
  register(hash, fn) { this.routes[hash] = fn; },
  navigate(hash) { window.location.hash = hash; },
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  },
  render() {
    const hash  = window.location.hash || '#login';
    const user  = Auth.getUser();

    // Auth guard
    if (hash !== '#login' && !user) { this.navigate('#login'); return; }
    if (hash === '#login' && user)  { this.navigate(user.role==='admin' ? '#admin' : '#dashboard'); return; }
    if (hash === '#admin' && user && user.role !== 'admin') { this.navigate('#dashboard'); return; }
    if ((hash === '#dashboard' || hash === '#leave' || hash === '#history') && user?.role === 'admin') { this.navigate('#admin'); return; }

    const fn = this.routes[hash] || this.routes['#notfound'];
    if (fn) fn();
  }
};

// ─── Sidebar renderer ──────────────────────────────────────────
function renderSidebar(activeHash) {
  const user = Auth.getUser();
  const isAdmin = user?.role === 'admin';

  const empLinks = [
    { hash:'#dashboard', icon:'🏠', label:'Dashboard' },
    { hash:'#leave',     icon:'📋', label:'Leave Request' },
    { hash:'#history',   icon:'📅', label:'Attendance History' },
  ];
  const adminLinks = [
    { hash:'#admin', icon:'🏛️', label:'HR Dashboard' },
  ];
  const links = isAdmin ? adminLinks : empLinks;

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">⚡</div>
        <div class="sidebar-logo-text">Smart<span>Attend</span></div>
      </div>
      <div class="sidebar-divider"></div>
      <div class="sidebar-label">Navigation</div>
      <nav>
        ${links.map(l => `
          <a href="${l.hash}" class="nav-link ${activeHash===l.hash?'active':''}">
            <span class="icon">${l.icon}</span>
            <span>${l.label}</span>
          </a>`).join('')}
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-user">
          <div class="avatar" style="background:${Utils.avatarColor(user?.id||'0')}">${user?.avatar||'??'}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user?.name||''}</div>
            <div class="sidebar-user-role">${user?.position||user?.role||''}</div>
          </div>
        </div>
        <button class="btn-logout" onclick="App.logout()">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>`;
}

// ─── App shell ─────────────────────────────────────────────────
const App = {
  logout() {
    Auth.clearUser();
    Router.navigate('#login');
  },
};

// ─── Live Clock module ─────────────────────────────────────────
const LiveClock = {
  intervals: [],
  start(elementId, opts = {}) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const tick = () => {
      const now = new Date();
      el.textContent = Utils.formatTime(now);
      if (opts.dateId) {
        const de = document.getElementById(opts.dateId);
        if (de) de.textContent = Utils.formatDate(now);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    this.intervals.push(id);
    return id;
  },
  stopAll() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }
};

// Expose globals
window.App    = App;
window.Auth   = Auth;
window.Router = Router;
window.Toast  = Toast;
window.Utils  = Utils;
window.LiveClock = LiveClock;
window.ALL_EMPLOYEES = ALL_EMPLOYEES;
