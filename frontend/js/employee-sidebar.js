// employee-sidebar.js

/* ── 3D Icon SVGs ─────────────────────────────────────────── */
const EMP_ICONS = {
  dashboard: `
    <span class="nav-icon ni ni-dashboard">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
    </span>`,
  attendance: `
    <span class="nav-icon ni ni-attendance">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
    </span>`,
  leaves: `
    <span class="nav-icon ni ni-leaves">
      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/></svg>
    </span>`,
  salary: `
    <span class="nav-icon ni ni-salary">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 14.5c0 1.1.9 2 2.5 2s2.5-.9 2.5-2-1-1.8-2.5-2.2S9.5 11 9.5 9.5 10.4 7.5 12 7.5s2.5.9 2.5 2"/><line x1="12" y1="6" x2="12" y2="7.5"/><line x1="12" y1="16.5" x2="12" y2="18"/></svg>
    </span>`,
  profile: `
    <span class="nav-icon ni ni-profile">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    </span>`,
};

/* ── CSS injected once ────────────────────────────────────── */
function injectEmpStyles() {
  if (document.getElementById('emp-sidebar-styles')) return;
  const style = document.createElement('style');
  style.id = 'emp-sidebar-styles';
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

    /* ── Per-icon colours ── */
    .ni-dashboard {
      background: linear-gradient(145deg, #7c6fff, #4b3fd6);
      box-shadow: 0 4px 12px rgba(108,99,255,.55),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-attendance {
      background: linear-gradient(145deg, #2dd4bf, #0ba89e);
      box-shadow: 0 4px 12px rgba(0,212,170,.45),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-leaves {
      background: linear-gradient(145deg, #fb923c, #d44e18);
      box-shadow: 0 4px 12px rgba(251,146,60,.45),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-salary {
      background: linear-gradient(145deg, #facc15, #d4970d);
      box-shadow: 0 4px 12px rgba(250,204,21,.4),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }
    .ni-profile {
      background: linear-gradient(145deg, #f472b6, #c0196c);
      box-shadow: 0 4px 12px rgba(244,114,182,.45),
                  inset 0 1px 1px rgba(255,255,255,.22),
                  inset 0 -2px 4px rgba(0,0,0,.28);
    }

    /* ── Active item highlight ── */
    .nav-item.active .ni-dashboard  { box-shadow: 0 6px 18px rgba(108,99,255,.7),  inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-attendance { box-shadow: 0 6px 18px rgba(0,212,170,.65),  inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-leaves     { box-shadow: 0 6px 18px rgba(251,146,60,.65), inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-salary     { box-shadow: 0 6px 18px rgba(250,204,21,.6),  inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
    .nav-item.active .ni-profile    { box-shadow: 0 6px 18px rgba(244,114,182,.65),inset 0 1px 1px rgba(255,255,255,.25), inset 0 -2px 4px rgba(0,0,0,.3); }
  `;
  document.head.appendChild(style);
}

/* ── Sidebar HTML ─────────────────────────────────────────── */
function injectSidebar() {
  injectEmpStyles();

  const html = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-mark">
        <div class="logo-icon">🏢</div>
        <div>
          <div class="logo-text">HRFlow</div>
          <div class="logo-sub">Employee Portal</div>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title">My Portal</div>

      <a href="dashboard.html"  class="nav-item">${EMP_ICONS.dashboard}  My Dashboard</a>
      <a href="attendance.html" class="nav-item">${EMP_ICONS.attendance} My Attendance</a>
      <a href="leaves.html"     class="nav-item">${EMP_ICONS.leaves}     My Leaves</a>
      <a href="salary.html"     class="nav-item">${EMP_ICONS.salary}     My Salary</a>
      <a href="profile.html"    class="nav-item">${EMP_ICONS.profile}    My Profile</a>
    </nav>

    <div class="sidebar-footer">
      <div style="padding:8px 10px;margin-bottom:8px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:6px;font-size:0.72rem;text-align:center;color:var(--cyan);font-weight:700;letter-spacing:1px">
        👤 EMPLOYEE PORTAL
      </div>
      <div class="user-card">
        <div class="user-avatar" id="sidebar-avatar">?</div>
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
