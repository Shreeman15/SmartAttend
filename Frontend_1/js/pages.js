/* ============================================================
   SmartAttend — Page Renderers
   Each function renders a page into #app and wires up events
   ============================================================ */

'use strict';

const root = () => document.getElementById('app');

/* ════════════════════════════════════════════════════════════
   LOGIN PAGE
   ════════════════════════════════════════════════════════════ */
function renderLogin() {
  LiveClock.stopAll();
  root().innerHTML = `
    <div class="login-page">
      <div class="login-bg-blob login-bg-blob-1"></div>
      <div class="login-bg-blob login-bg-blob-2"></div>

      <div class="login-card animate-up">
        <div class="login-logo-wrap">
          <div class="login-logo-icon">⚡</div>
          <div class="login-title">Smart<span style="color:var(--accent-primary)">Attend</span></div>
          <div class="login-subtitle">Attendance Management System</div>
        </div>

        <div class="card">
          <!-- Role toggle -->
          <div class="role-toggle mb-6" id="roleToggle">
            <button class="role-btn active" data-role="employee" onclick="Login.setRole('employee')">👤 Employee</button>
            <button class="role-btn"        data-role="admin"    onclick="Login.setRole('admin')">⚙ Admin</button>
          </div>

          <!-- Form -->
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="loginUsername" class="input-field" placeholder="alice, bob, carol" autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="loginPassword" class="input-field" placeholder="••••••••" autocomplete="current-password" />
          </div>

          <div id="loginError" style="display:none" class="error-msg mb-4"></div>

          <button class="btn btn-primary btn-full" id="loginBtn" onclick="Login.submit()">Sign In</button>

          <div class="fill-demo mt-3">
            <button onclick="Login.fillDemo()">Fill demo credentials →</button>
          </div>
        </div>

        <div class="login-hint mt-4">
          Demo: <span>alice / pass123</span> &nbsp;·&nbsp; <span>admin / admin123</span>
        </div>
      </div>
    </div>`;

  // Allow Enter key to submit
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') Login.submit();
  });
}

const Login = {
  role: 'employee',
  setRole(r) {
    this.role = r;
    document.querySelectorAll('.role-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.role === r);
    });
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginUsername').placeholder =
      r === 'admin' ? 'admin' : 'alice, bob, carol';
    document.getElementById('loginError').style.display = 'none';
  },
  fillDemo() {
    const creds = this.role === 'admin'
      ? { username:'admin', password:'admin123' }
      : { username:'alice', password:'pass123' };
    document.getElementById('loginUsername').value = creds.username;
    document.getElementById('loginPassword').value = creds.password;
    document.getElementById('loginError').style.display = 'none';
  },
  async submit() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl    = document.getElementById('loginError');
    const btn      = document.getElementById('loginBtn');

    errEl.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Authenticating...';

    await new Promise(r => setTimeout(r, 650));

    const user = Auth.login(username, password);
    if (user) {
      Auth.setUser(user);
      Router.navigate(user.role === 'admin' ? '#admin' : '#dashboard');
    } else {
      errEl.textContent = 'Invalid username or password. Try the demo credentials.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  }
};
window.Login = Login;

/* ════════════════════════════════════════════════════════════
   EMPLOYEE DASHBOARD
   ════════════════════════════════════════════════════════════ */
function renderEmployeeDashboard() {
  LiveClock.stopAll();
  const user = Auth.getUser();
  const monthStats = { present:18, absent:2, late:3, leave:2, totalHours:154.5 };
  const attendanceRate = Math.round((monthStats.present / 22) * 100);
  const circumference  = 2 * Math.PI * 32;
  const offset = circumference * (1 - attendanceRate / 100);

  const weekData = [
    { day:'Mon', hours:8.5, status:'present' },
    { day:'Tue', hours:7.0, status:'present' },
    { day:'Wed', hours:0,   status:'absent'  },
    { day:'Thu', hours:9.0, status:'present' },
    { day:'Fri', hours:6.5, status:'late'    },
  ];

  const barColor = s =>
    s==='present' ? '#0ea5e9' : s==='late' ? '#f59e0b' : '#f43f5e';

  root().innerHTML = `
    ${renderSidebar('#dashboard')}
    <div class="main-content">
      <!-- Header -->
      <div class="page-header animate-up">
        <div>
          <div class="page-pre">Welcome back,</div>
          <h1 class="page-title">${user?.name}</h1>
          <div class="page-sub">${user?.position} · ${user?.department}</div>
        </div>
        <div class="text-right">
          <div class="live-clock lg" id="mainClock"></div>
          <div class="live-clock-date" id="mainClockDate"></div>
        </div>
      </div>

      <!-- Punch Card -->
      <div class="punch-card animate-up-d1">
        <div class="live-clock md mb-3" id="punchClock"></div>

        <div id="timerBlock" style="display:none" class="mb-4">
          <div class="timer-display" id="timerDisplay">00:00:00</div>
          <div class="text-sm text-secondary mt-1">Session started · <span id="punchInLabel"></span></div>
        </div>

        <div class="punch-buttons">
          <button class="punch-btn-in"  id="punchInBtn"  onclick="Punch.in()">▶ Punch In</button>
          <button class="punch-btn-out" id="punchOutBtn" onclick="Punch.out()" disabled>■ Punch Out</button>
        </div>

        <div class="punch-status mt-3">
          <span class="badge badge-danger" id="statusBadge">
            <span class="badge-dot" style="background:var(--accent-danger)"></span>
            Not Clocked In
          </span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-4 mb-6 animate-up-d2">
        ${[
          { label:'Present Days', value:`${monthStats.present}<span style="font-size:14px;color:var(--text-secondary)">/22</span>`, color:'#22d3ee' },
          { label:'Absent Days',  value:`${monthStats.absent}<span style="font-size:14px;color:var(--text-secondary)"> days</span>`, color:'#f43f5e' },
          { label:'Late Arrivals',value:`${monthStats.late}<span style="font-size:14px;color:var(--text-secondary)"> times</span>`, color:'#f59e0b' },
          { label:'Total Hours',  value:`${monthStats.totalHours}<span style="font-size:14px;color:var(--text-secondary)">h</span>`, color:'#0ea5e9' },
        ].map(s => `
          <div class="stat-card">
            <div class="stat-label mb-2">${s.label}</div>
            <div class="stat-value" style="color:${s.color}">${s.value}</div>
          </div>`).join('')}
      </div>

      <!-- Bottom Row -->
      <div class="grid grid-2 animate-up-d3">
        <!-- Donut chart -->
        <div class="card">
          <div class="section-title">Monthly Attendance Rate</div>
          <div class="flex items-center gap-6">
            <div class="ring-wrap" style="width:88px;height:88px;flex-shrink:0">
              <svg width="88" height="88" viewBox="0 0 80 80" style="transform:rotate(-90deg)">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-elevated)" stroke-width="8"/>
                <circle cx="40" cy="40" r="32" fill="none" stroke="#0ea5e9" stroke-width="8"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}"
                  stroke-linecap="round"
                  style="transition:stroke-dashoffset 1s ease"/>
              </svg>
              <span class="ring-label">${attendanceRate}%</span>
            </div>
            <div>
              ${[
                ['#22d3ee', `Present: ${monthStats.present} days`],
                ['#f43f5e', `Absent: ${monthStats.absent} days`],
                ['#f59e0b', `Late: ${monthStats.late} days`],
                ['#0ea5e9', `Leave: ${monthStats.leave} days`],
              ].map(([c,l]) => `
                <div class="flex items-center gap-2 mb-2">
                  <span style="width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;flex-shrink:0"></span>
                  <span class="text-sm text-secondary">${l}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- This Week bars -->
        <div class="card">
          <div class="section-title">This Week</div>
          ${weekData.map(d => `
            <div class="week-bar-row">
              <span class="week-day-label">${d.day}</span>
              <div class="week-bar-track">
                <div class="week-bar-fill" style="width:${(d.hours/10)*100}%;background:${barColor(d.status)}"></div>
              </div>
              <span class="week-bar-hrs">${d.hours > 0 ? d.hours+'h' : '-'}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  LiveClock.start('mainClock',  { dateId:'mainClockDate' });
  LiveClock.start('punchClock', {});
  Punch.reset();
}

const Punch = {
  active: false,
  startTime: null,
  elapsed: 0,
  timerRef: null,
  reset() {
    this.active   = false;
    this.startTime = null;
    this.elapsed   = 0;
    clearInterval(this.timerRef);
  },
  in() {
    if (this.active) return;
    this.active    = true;
    this.startTime = new Date();
    this.elapsed   = 0;
    document.getElementById('timerBlock').style.display = 'block';
    document.getElementById('punchInLabel').textContent = Utils.formatTime(this.startTime);
    document.getElementById('punchInBtn').disabled  = true;
    document.getElementById('punchOutBtn').disabled = false;
    const badge = document.getElementById('statusBadge');
    badge.className  = 'badge badge-success';
    badge.innerHTML  = '<span class="badge-dot" style="background:#22d3ee;animation:pulse 2s infinite"></span> Currently Active';
    this.timerRef = setInterval(() => {
      this.elapsed++;
      const el = document.getElementById('timerDisplay');
      if (el) el.textContent = Utils.formatElapsed(this.elapsed);
    }, 1000);
    Toast.show({ title:'Punched In', description:`Started at ${Utils.formatTime(this.startTime)}`, type:'success' });
  },
  out() {
    if (!this.active) return;
    clearInterval(this.timerRef);
    const dur = Utils.formatElapsed(this.elapsed);
    this.reset();
    document.getElementById('timerBlock').style.display  = 'none';
    document.getElementById('punchInBtn').disabled  = false;
    document.getElementById('punchOutBtn').disabled = true;
    const badge = document.getElementById('statusBadge');
    badge.className = 'badge badge-danger';
    badge.innerHTML = '<span class="badge-dot" style="background:var(--accent-danger)"></span> Not Clocked In';
    Toast.show({ title:'Punched Out', description:`Session: ${dur}`, type:'info' });
  }
};
window.Punch = Punch;

/* ════════════════════════════════════════════════════════════
   LEAVE REQUEST PAGE
   ════════════════════════════════════════════════════════════ */
function renderLeavePage() {
  LiveClock.stopAll();
  const leaveTypes = [
    'Annual Leave','Sick Leave','Personal Leave',
    'Maternity/Paternity Leave','Bereavement Leave',
    'Unpaid Leave','Emergency Leave',
  ];

  const existingRequests = [
    { id:1, type:'Annual Leave',   from:'2024-12-20', to:'2024-12-27', days:6, status:'approved', reason:'Family vacation' },
    { id:2, type:'Sick Leave',     from:'2024-11-14', to:'2024-11-15', days:2, status:'approved', reason:'Flu'             },
    { id:3, type:'Personal Leave', from:'2025-01-10', to:'2025-01-10', days:1, status:'pending',  reason:'Personal matters' },
  ];

  const balances = [
    { label:'Annual Leave',   used:4, total:14, color:'#0ea5e9' },
    { label:'Sick Leave',     used:2, total:10, color:'#22d3ee' },
    { label:'Personal Leave', used:1, total:5,  color:'#f59e0b' },
  ];

  const statusBadge = s =>
    s==='approved' ? 'badge-success' : s==='pending' ? 'badge-warning' : 'badge-danger';

  root().innerHTML = `
    ${renderSidebar('#leave')}
    <div class="main-content">
      <div class="animate-up mb-6">
        <a href="#dashboard" class="back-btn" onclick="event.preventDefault();Router.navigate('#dashboard')">← Back</a>
        <h1 class="page-title">Leave Request</h1>
        <div class="page-sub">Submit and manage your leave applications</div>
      </div>

      <!-- Balance cards -->
      <div class="grid grid-3 mb-6 animate-up-d1">
        ${balances.map(b => `
          <div class="stat-card">
            <div class="stat-label mb-3">${b.label}</div>
            <div class="leave-balance-row">
              <span class="stat-value" style="color:${b.color}">${b.total - b.used}</span>
              <span class="text-xs text-muted">/${b.total} days left</span>
            </div>
            <div class="progress-thin">
              <div class="progress-bar" style="width:${((b.total-b.used)/b.total)*100}%;background:${b.color}"></div>
            </div>
          </div>`).join('')}
      </div>

      <div class="grid grid-2 animate-up-d2">
        <!-- Form -->
        <div class="card">
          <div class="section-title">New Request</div>
          <div class="form-group">
            <label class="form-label">Leave Type <span class="req">*</span></label>
            <select id="leaveType" class="select-field">
              <option value="">Select leave type...</option>
              ${leaveTypes.map(t => `<option>${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-row form-group">
            <div>
              <label class="form-label">From <span class="req">*</span></label>
              <input type="date" id="leaveFrom" class="input-field" onchange="LeaveForm.updateDays()" />
            </div>
            <div>
              <label class="form-label">To <span class="req">*</span></label>
              <input type="date" id="leaveTo" class="input-field" onchange="LeaveForm.updateDays()" />
            </div>
          </div>
          <div id="dayCallout" style="display:none" class="day-callout mb-4"></div>
          <div class="form-group">
            <label class="form-label">Reason <span class="req">*</span></label>
            <textarea id="leaveReason" class="textarea-field" placeholder="Brief reason for your leave request..."></textarea>
          </div>
          <button class="btn btn-primary btn-full" id="leaveSubmitBtn" onclick="LeaveForm.submit()">Submit Request</button>
        </div>

        <!-- History -->
        <div class="card">
          <div class="section-title">Recent Requests</div>
          ${existingRequests.map(r => `
            <div class="leave-req-card">
              <div class="flex justify-between items-start mb-2">
                <span class="font-syne font-bold text-primary text-sm">${r.type}</span>
                <span class="badge ${statusBadge(r.status)}">${r.status}</span>
              </div>
              <div class="text-xs text-secondary mb-1">
                ${r.from} → ${r.to} · <span style="color:var(--accent-primary)">${r.days} day${r.days>1?'s':''}</span>
              </div>
              <div class="text-xs text-muted">${r.reason}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

const LeaveForm = {
  updateDays() {
    const from = document.getElementById('leaveFrom').value;
    const to   = document.getElementById('leaveTo').value;
    const dc   = document.getElementById('dayCallout');
    if (from && to) {
      const diff = Math.max(0, Math.floor((new Date(to) - new Date(from)) / 86400000) + 1);
      if (diff > 0) {
        dc.style.display = 'block';
        dc.textContent   = `${diff} working day${diff>1?'s':''} requested`;
        return;
      }
    }
    dc.style.display = 'none';
  },
  async submit() {
    const type   = document.getElementById('leaveType').value;
    const from   = document.getElementById('leaveFrom').value;
    const to     = document.getElementById('leaveTo').value;
    const reason = document.getElementById('leaveReason').value.trim();
    if (!type || !from || !to || !reason) {
      Toast.show({ title:'Missing Fields', description:'Please fill in all required fields.', type:'error' });
      return;
    }
    const btn = document.getElementById('leaveSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Submitting...';
    await new Promise(r => setTimeout(r, 800));
    document.getElementById('leaveType').value   = '';
    document.getElementById('leaveFrom').value   = '';
    document.getElementById('leaveTo').value     = '';
    document.getElementById('leaveReason').value = '';
    document.getElementById('dayCallout').style.display = 'none';
    btn.disabled = false;
    btn.textContent = 'Submit Request';
    Toast.show({ title:'Leave Requested', description:'Your request has been submitted for approval.', type:'success' });
  }
};
window.LeaveForm = LeaveForm;

/* ════════════════════════════════════════════════════════════
   ATTENDANCE HISTORY PAGE
   ════════════════════════════════════════════════════════════ */
const HistoryState = {
  data: [],
  filter: 'all',
  search: '',
  page: 1,
  PER_PAGE: 15,
};

function renderHistory() {
  LiveClock.stopAll();
  HistoryState.data   = Utils.generateAttendanceHistory(60);
  HistoryState.filter = 'all';
  HistoryState.search = '';
  HistoryState.page   = 1;

  root().innerHTML = `
    ${renderSidebar('#history')}
    <div class="main-content">
      <div class="animate-up mb-6">
        <a href="#dashboard" class="back-btn" onclick="event.preventDefault();Router.navigate('#dashboard')">← Back</a>
        <h1 class="page-title">Attendance History</h1>
        <div class="page-sub">Last 60 days attendance records</div>
      </div>

      <div class="grid grid-4 mb-6 animate-up-d1" id="historySummary"></div>

      <div class="card animate-up-d2">
        <div class="filter-strip mb-4" id="historyFilters">
          ${['all','present','absent','late','leave'].map(f => `
            <button class="filter-btn${f==='all'?' active':''}" data-filter="${f}"
              onclick="HistoryPage.setFilter('${f}')">
              ${f==='all' ? 'All' : f.charAt(0).toUpperCase()+f.slice(1)}
            </button>`).join('')}
          <input type="text" class="search-input ml-auto" placeholder="Search by date..."
            oninput="HistoryPage.setSearch(this.value)" style="width:180px" />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>${['Date','Day','Status','Punch In','Punch Out','Hours'].map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody id="historyTableBody"></tbody>
          </table>
          <div class="empty-state" id="historyEmpty" style="display:none">No records found</div>
        </div>

        <div class="pagination" id="historyPagination"></div>
      </div>
    </div>`;

  HistoryPage.renderSummary();
  HistoryPage.renderTable();
}

const statusCfg = {
  present: { label:'Present', cls:'badge-success' },
  absent:  { label:'Absent',  cls:'badge-danger'  },
  late:    { label:'Late',    cls:'badge-warning'  },
  leave:   { label:'Leave',   cls:'badge-info'     },
};

const HistoryPage = {
  filtered() {
    return HistoryState.data.filter(r => {
      if (HistoryState.filter !== 'all' && r.status !== HistoryState.filter) return false;
      if (HistoryState.search && !Utils.formatDateShort(r.date).toLowerCase().includes(HistoryState.search.toLowerCase())) return false;
      return true;
    });
  },
  renderSummary() {
    const d = HistoryState.data;
    const counts = {
      present: d.filter(r=>r.status==='present').length,
      absent:  d.filter(r=>r.status==='absent').length,
      late:    d.filter(r=>r.status==='late').length,
      leave:   d.filter(r=>r.status==='leave').length,
    };
    document.getElementById('historySummary').innerHTML = [
      { label:'Present', count:counts.present, color:'#22d3ee' },
      { label:'Absent',  count:counts.absent,  color:'#f43f5e' },
      { label:'Late',    count:counts.late,    color:'#f59e0b' },
      { label:'Leave',   count:counts.leave,   color:'#0ea5e9' },
    ].map(s => `
      <div class="stat-card text-center">
        <div class="stat-value" style="color:${s.color}">${s.count}</div>
        <div class="stat-label mt-1">${s.label}</div>
      </div>`).join('');
  },
  renderTable() {
    const filtered   = this.filtered();
    const totalPages = Math.ceil(filtered.length / HistoryState.PER_PAGE);
    const page       = HistoryState.page;
    const slice      = filtered.slice((page-1)*HistoryState.PER_PAGE, page*HistoryState.PER_PAGE);

    const tbody = document.getElementById('historyTableBody');
    const empty = document.getElementById('historyEmpty');
    const pg    = document.getElementById('historyPagination');

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      pg.innerHTML    = '';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = slice.map(row => `
      <tr>
        <td style="color:var(--text-primary)">${Utils.formatDateShort(row.date)}</td>
        <td class="text-muted">${row.date.toLocaleDateString('en-US',{weekday:'short'})}</td>
        <td><span class="badge ${statusCfg[row.status].cls}">${statusCfg[row.status].label}</span></td>
        <td class="font-mono">${row.punchIn}</td>
        <td class="font-mono">${row.punchOut}</td>
        <td class="font-mono" style="color:var(--accent-primary)">${row.totalHours}</td>
      </tr>`).join('');

    const start = (page-1)*HistoryState.PER_PAGE+1;
    const end   = Math.min(page*HistoryState.PER_PAGE, filtered.length);
    pg.innerHTML = totalPages > 1 ? `
      <span class="pagination-info">Showing ${start}–${end} of ${filtered.length}</span>
      <div class="pagination-btns">
        <button class="page-btn" onclick="HistoryPage.goPage(${page-1})" ${page===1?'disabled':''}>←</button>
        <span class="page-current">${page}/${totalPages}</span>
        <button class="page-btn" onclick="HistoryPage.goPage(${page+1})" ${page===totalPages?'disabled':''}>→</button>
      </div>` : '';
  },
  setFilter(f) {
    HistoryState.filter = f;
    HistoryState.page   = 1;
    document.querySelectorAll('.filter-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.filter === f));
    this.renderTable();
  },
  setSearch(v) {
    HistoryState.search = v;
    HistoryState.page   = 1;
    this.renderTable();
  },
  goPage(p) {
    HistoryState.page = p;
    this.renderTable();
  },
};
window.HistoryPage = HistoryPage;

/* ════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ════════════════════════════════════════════════════════════ */
const AdminState = {
  search:       '',
  dept:         'All',
  status:       'all',
  sortBy:       'name',
  selectedId:   null,
};

function renderAdmin() {
  LiveClock.stopAll();
  const user    = Auth.getUser();
  const summary = {
    total:   ALL_EMPLOYEES.length,
    present: ALL_EMPLOYEES.filter(e=>e.status==='present').length,
    absent:  ALL_EMPLOYEES.filter(e=>e.status==='absent').length,
    late:    ALL_EMPLOYEES.filter(e=>e.status==='late').length,
    leave:   ALL_EMPLOYEES.filter(e=>e.status==='leave').length,
    payroll: ALL_EMPLOYEES.reduce((s,e)=>s+e.salary,0),
  };
  const depts = ['All', ...[...new Set(ALL_EMPLOYEES.map(e=>e.department))]];

  root().innerHTML = `
    ${renderSidebar('#admin')}
    <div class="main-content">
      <!-- Header -->
      <div class="page-header animate-up">
        <div>
          <div class="page-pre">Administration</div>
          <h1 class="page-title">HR Dashboard</h1>
          <div class="page-sub">Welcome, ${user?.name}</div>
        </div>
        <div class="text-right">
          <div class="stat-label mb-1">Annual Payroll</div>
          <div class="text-2xl font-syne font-bold text-accent">${Utils.formatCurrency(summary.payroll)}</div>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-5 mb-6 animate-up-d1">
        ${[
          {label:'Total Staff', value:summary.total,   color:'#f8fafc'},
          {label:'Present',     value:summary.present, color:'#22d3ee'},
          {label:'Absent',      value:summary.absent,  color:'#f43f5e'},
          {label:'Late',        value:summary.late,    color:'#f59e0b'},
          {label:'On Leave',    value:summary.leave,   color:'#0ea5e9'},
        ].map(s=>`
          <div class="stat-card text-center">
            <div class="stat-value" style="color:${s.color}">${s.value}</div>
            <div class="stat-label mt-1">${s.label}</div>
          </div>`).join('')}
      </div>

      <!-- Filters -->
      <div class="card mb-4 animate-up-d2">
        <div class="flex flex-wrap gap-3 items-center">
          <input type="text" class="search-input" placeholder="Search employees..."
            oninput="AdminPage.setSearch(this.value)" style="width:200px" />
          <select class="select-field" style="width:150px" onchange="AdminPage.setDept(this.value)">
            ${depts.map(d=>`<option>${d}</option>`).join('')}
          </select>
          <select class="select-field" style="width:140px" onchange="AdminPage.setStatus(this.value)">
            ${['all','present','absent','late','leave'].map(s=>`
              <option value="${s}">${s==='all'?'All Status':s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
          </select>
          <select class="select-field" style="width:140px" onchange="AdminPage.setSort(this.value)">
            <option value="name">Sort: Name</option>
            <option value="salary">Sort: Salary</option>
            <option value="hours">Sort: Hours</option>
          </select>
          <span class="ml-auto text-xs text-muted" id="empCount"></span>
        </div>
      </div>

      <!-- Table -->
      <div class="card animate-up-d3 table-wrap">
        <table>
          <thead>
            <tr>${['Employee','ID','Department','Position','Status','Today','Salary',''].map(h=>`<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody id="adminTableBody"></tbody>
        </table>
        <div class="empty-state" id="adminEmpty" style="display:none">No employees match your filters</div>
      </div>

      <!-- Detail panel -->
      <div id="adminDetail"></div>
    </div>`;

  AdminPage.renderTable();
}

const AdminPage = {
  getFiltered() {
    return ALL_EMPLOYEES
      .filter(e => {
        if (AdminState.dept !== 'All' && e.department !== AdminState.dept) return false;
        if (AdminState.status !== 'all' && e.status !== AdminState.status) return false;
        if (AdminState.search && !e.name.toLowerCase().includes(AdminState.search.toLowerCase()) &&
            !e.id.toLowerCase().includes(AdminState.search.toLowerCase())) return false;
        return true;
      })
      .sort((a,b) => {
        if (AdminState.sortBy === 'name')   return a.name.localeCompare(b.name);
        if (AdminState.sortBy === 'salary') return b.salary - a.salary;
        if (AdminState.sortBy === 'hours')  return b.hoursToday - a.hoursToday;
        return 0;
      });
  },
  renderTable() {
    const filtered = this.getFiltered();
    document.getElementById('empCount').textContent = `${filtered.length} of ${ALL_EMPLOYEES.length} employees`;

    const tbody = document.getElementById('adminTableBody');
    const empty = document.getElementById('adminEmpty');

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = filtered.map((emp,i) => {
      const sc = {
        present:{ label:'Present', cls:'badge-success' },
        absent: { label:'Absent',  cls:'badge-danger'  },
        late:   { label:'Late',    cls:'badge-warning'  },
        leave:  { label:'Leave',   cls:'badge-info'     },
      }[emp.status];
      const isSelected = AdminState.selectedId === emp.id;
      return `
        <tr style="animation-delay:${i*0.02}s">
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar avatar-sm" style="background:${Utils.avatarColor(emp.id)}">${emp.avatar}</div>
              <span class="font-syne font-bold text-primary">${emp.name}</span>
            </div>
          </td>
          <td class="font-mono text-muted">${emp.id}</td>
          <td>${emp.department}</td>
          <td>${emp.position}</td>
          <td><span class="badge ${sc.cls}">${sc.label}</span></td>
          <td class="font-mono" style="color:var(--accent-primary)">${emp.hoursToday>0?emp.hoursToday+'h':'-'}</td>
          <td class="font-syne font-bold" style="color:#22d3ee">${Utils.formatCurrency(emp.salary)}</td>
          <td>
            <button class="btn btn-ghost btn-sm"
              onclick="AdminPage.toggleDetail('${emp.id}')">
              ${isSelected ? 'Close' : 'View'}
            </button>
          </td>
        </tr>`;
    }).join('');
  },
  toggleDetail(id) {
    AdminState.selectedId = AdminState.selectedId === id ? null : id;
    this.renderTable();
    const panel = document.getElementById('adminDetail');
    if (!AdminState.selectedId) { panel.innerHTML=''; return; }
    const emp = ALL_EMPLOYEES.find(e=>e.id===id);
    const sc  = { present:'badge-success', absent:'badge-danger', late:'badge-warning', leave:'badge-info' }[emp.status];
    const statusLabel = { present:'Present', absent:'Absent', late:'Late', leave:'Leave' }[emp.status];
    panel.innerHTML = `
      <div class="detail-panel">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="avatar avatar-lg" style="background:${Utils.avatarColor(emp.id)}">${emp.avatar}</div>
            <div>
              <div class="font-syne font-bold text-xl text-primary">${emp.name}</div>
              <div class="text-secondary text-sm">${emp.position} · ${emp.department}</div>
              <div class="font-mono text-muted text-xs mt-1">${emp.id}</div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="AdminPage.toggleDetail(null)">✕ Close</button>
        </div>
        <div class="grid grid-4">
          ${[
            { label:'Status Today',  content:`<span class="badge ${sc}">${statusLabel}</span>` },
            { label:'Hours Today',   content:`<span class="text-xl font-syne font-bold text-accent">${emp.hoursToday||'-'}h</span>` },
            { label:'Annual Salary', content:`<span class="text-xl font-syne font-bold" style="color:#22d3ee">${Utils.formatCurrency(emp.salary)}</span>` },
            { label:'Monthly Pay',   content:`<span class="text-xl font-syne font-bold" style="color:#22d3ee">${Utils.formatCurrency(emp.salary/12)}</span>` },
          ].map(c=>`
            <div style="background:var(--bg-secondary);border-radius:var(--radius-md);padding:14px 16px">
              <div class="stat-label mb-2">${c.label}</div>
              ${c.content}
            </div>`).join('')}
        </div>
      </div>`;
  },
  setSearch(v) { AdminState.search = v;    this.renderTable(); },
  setDept(v)   { AdminState.dept   = v;    this.renderTable(); },
  setStatus(v) { AdminState.status = v;    this.renderTable(); },
  setSort(v)   { AdminState.sortBy = v;    this.renderTable(); },
};
window.AdminPage = AdminPage;

/* ════════════════════════════════════════════════════════════
   NOT FOUND PAGE
   ════════════════════════════════════════════════════════════ */
function renderNotFound() {
  LiveClock.stopAll();
  root().innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;text-align:center">
      <div style="font-size:72px">404</div>
      <div class="page-title">Page Not Found</div>
      <div class="text-secondary text-sm">The page you're looking for doesn't exist.</div>
      <button class="btn btn-primary mt-4" onclick="Router.navigate(Auth.getUser()?.role==='admin'?'#admin':'#dashboard')">
        Go Home
      </button>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   REGISTER ROUTES & BOOT
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();

  Router.register('#login',     renderLogin);
  Router.register('#dashboard', renderEmployeeDashboard);
  Router.register('#leave',     renderLeavePage);
  Router.register('#history',   renderHistory);
  Router.register('#admin',     renderAdmin);
  Router.register('#notfound',  renderNotFound);

  Router.init();
});
