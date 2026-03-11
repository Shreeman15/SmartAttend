// admin-sidebar.js

/* ── 3D Icon SVGs ─────────────────────────────────────────── */
const ADMIN_ICONS = {
  dashboard: `
    <span class="nav-icon ni ni-adm-dashboard">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
    </span>`,
  employees: `
    <span class="nav-icon ni ni-adm-employees">
      <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3.5"/><path d="M2 21c0-3.5 3.1-6 7-6s7 2.5 7 6"/><circle cx="19" cy="8" r="2.5"/><path d="M22 21c0-2.5-1.8-4.5-4.5-5"/></svg>
    </span>`,
  addEmployee: `
    <span class="nav-icon ni ni-adm-add">
      <svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="4"/><path d="M2 21c0-3.5 3.1-6 8-6"/><line x1="19" y1="11" x2="19" y2="17"/><line x1="16" y1="14" x2="22" y2="14"/></svg>
    </span>`,
  attendance: `
    <span class="nav-icon ni ni-adm-attendance">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
    </span>`,
  leaves: `
    <span class="nav-icon ni ni-adm-leaves">
      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="8 15 11 18 16 13"/></svg>
    </span>`,
  salary: `
    <span class="nav-icon ni ni-adm-salary">
      <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
    </span>`,
  reports: `
    <span class="nav-icon ni ni-adm-reports">
      <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></svg>
    </span>`,
};

/* ── CSS injected once ────────────────────────────────────── */
function injectAdminStyles() {
  if (document.getElementById('adm-sidebar-styles')) return;
  const style = document.createElement('style');
  style.id = 'adm-sidebar-styles';
  style.textContent = `
    /* ── 3D nav icon base ── */
    .ni {
      width: 34px; height: 34px;
      border-radius: 10px;
      display: inline-grid;
      place-items: center;
      flex-shrink: 0;
      transition: transform .22s ease, box-shadow .22s ease;
    }
    .nav-item:hover .ni { transform: translateY(-2px); }

    .ni svg {
      width: 16px; height: 16px;
      fill: none;
      stroke: rgba(255,255,255,.92);
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.45));
    }

    /* ── Per-icon colours (Admin — warmer/bolder palette) ── */
    .ni-adm-dashboard {
      background: linear-gradient(145deg, #f87171, #c0202a);
      box-shadow: 0 4px 12px rgba(233,69,96,.55),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-adm-employees {
      background: linear-gradient(145deg, #60a5fa, #2563cc);
      box-shadow: 0 4px 12px rgba(59,130,246,.5),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-adm-add {
      background: linear-gradient(145deg, #34d399, #059669);
      box-shadow: 0 4px 12px rgba(16,185,129,.5),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-adm-attendance {
      background: linear-gradient(145deg, #a78bfa, #6d28d9);
      box-shadow: 0 4px 12px rgba(139,92,246,.5),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-adm-leaves {
      background: linear-gradient(145deg, #fb923c, #c2410c);
      box-shadow: 0 4px 12px rgba(249,115,22,.5),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-adm-salary {
      background: linear-gradient(145deg, #fbbf24, #b45309);
      box-shadow: 0 4px 12px rgba(245,158,11,.48),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-adm-reports {
      background: linear-gradient(145deg, #22d3ee, #0e7490);
      box-shadow: 0 4px 12px rgba(6,182,212,.5),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }

    /* ── Active glow boost ── */
    .nav-item.active .ni-adm-dashboard  { box-shadow: 0 6px 20px rgba(233,69,96,.7),   inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-adm-employees  { box-shadow: 0 6px 20px rgba(59,130,246,.7),  inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-adm-add        { box-shadow: 0 6px 20px rgba(16,185,129,.7),  inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-adm-attendance { box-shadow: 0 6px 20px rgba(139,92,246,.7),  inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-adm-leaves     { box-shadow: 0 6px 20px rgba(249,115,22,.7),  inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-adm-salary     { box-shadow: 0 6px 20px rgba(245,158,11,.65), inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-adm-reports    { box-shadow: 0 6px 20px rgba(6,182,212,.7),   inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
  `;
  document.head.appendChild(style);
}

/* ── Sidebar HTML ─────────────────────────────────────────── */
function injectSidebar() {
  injectAdminStyles();

  const html = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-mark">
        <div class="logo-icon">🏢</div>
        <div>
          <div class="logo-text">HRFlow</div>
          <div class="logo-sub" style="color:#ff9800">Admin Panel</div>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title">Overview</div>
      <a href="dashboard.html"    class="nav-item">${ADMIN_ICONS.dashboard}   Dashboard</a>

      <div class="nav-section-title" style="margin-top:10px">Manage</div>
      <a href="employees.html"    class="nav-item">${ADMIN_ICONS.employees}   All Employees</a>
      <a href="add-employee.html" class="nav-item">${ADMIN_ICONS.addEmployee} Add Employee</a>
      <a href="attendance.html"   class="nav-item">${ADMIN_ICONS.attendance}  Attendance</a>
      <a href="leaves.html"       class="nav-item">${ADMIN_ICONS.leaves}      Leave Approvals</a>

      <div class="nav-section-title" style="margin-top:10px">Reports</div>
      <a href="salary.html"       class="nav-item">${ADMIN_ICONS.salary}      Salary Report</a>
      <a href="reports.html"      class="nav-item">${ADMIN_ICONS.reports}     Attendance Report</a>
    </nav>

    <div class="sidebar-footer">
      <div style="padding:8px 10px;margin-bottom:8px;background:rgba(255,152,0,0.1);border:1px solid rgba(255,152,0,0.25);border-radius:6px;font-size:0.72rem;text-align:center;color:#ff9800;font-weight:700;letter-spacing:1px">
        🔐 ADMIN MODE
      </div>
      <div class="user-card">
        <div class="user-avatar" id="sidebar-avatar" style="background:linear-gradient(135deg,#ff9800,#f44336)">?</div>
        <div class="user-info">
          <div class="user-name" id="sidebar-name">Loading...</div>
          <div class="user-role" id="sidebar-role">—</div>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm w-full" id="logout-btn" style="justify-content:center;margin-top:10px">
        🚪 Logout
      </button>
    </div>
  </aside>`;

  const layout = document.getElementById('app-layout');
  if (layout) layout.insertAdjacentHTML('afterbegin', html);
}

/* ── Active link highlight ────────────────────────────────── */
function setActiveLink() {
  const page = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar .nav-item').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectSidebar();
  setActiveLink();
  if (typeof initSidebar === 'function') initSidebar();
});
