// employee-sidebar.js
function injectSidebar() {
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
      <a href="dashboard.html"   class="nav-item"><span class="nav-icon">🏠</span> My Dashboard</a>
      <a href="attendance.html"  class="nav-item"><span class="nav-icon">📋</span> My Attendance</a>
      <a href="leaves.html"      class="nav-item"><span class="nav-icon">🌿</span> My Leaves</a>
      <a href="salary.html"      class="nav-item"><span class="nav-icon">💰</span> My Salary</a>
      <a href="profile.html"     class="nav-item"><span class="nav-icon">👤</span> My Profile</a>
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
document.addEventListener('DOMContentLoaded', () => { injectSidebar(); initSidebar(); });
