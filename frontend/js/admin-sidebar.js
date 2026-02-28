// admin-sidebar.js
function injectSidebar() {
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
      <a href="dashboard.html"   class="nav-item"><span class="nav-icon">📊</span> Dashboard</a>

      <div class="nav-section-title" style="margin-top:10px">Manage</div>
      <a href="employees.html"   class="nav-item"><span class="nav-icon">👥</span> All Employees</a>
      <a href="add-employee.html" class="nav-item"><span class="nav-icon">➕</span> Add Employee</a>
      <a href="attendance.html"  class="nav-item"><span class="nav-icon">📋</span> Attendance</a>
      <a href="leaves.html"      class="nav-item"><span class="nav-icon">🌿</span> Leave Approvals</a>

      <div class="nav-section-title" style="margin-top:10px">Reports</div>
      <a href="salary.html"      class="nav-item"><span class="nav-icon">💰</span> Salary Report</a>
      <a href="reports.html"     class="nav-item"><span class="nav-icon">📈</span> Attendance Report</a>
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
document.addEventListener('DOMContentLoaded', () => { injectSidebar(); initSidebar(); });
