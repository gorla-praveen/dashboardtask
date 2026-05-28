/**
 * NEXUS DASHBOARD - MAIN APP JS
 * Implements: LocalStorage, SessionStorage, Geolocation, Notification,
 *             Clipboard, Drag & Drop, Speech Recognition, Fullscreen APIs

 */

// ========================
// 1. THEME — LocalStorage API
// ========================
const themeKey = 'nexus_theme';
const sidebarKey = 'nexus_sidebar_state';

function initTheme() {
  const saved = localStorage.getItem(themeKey) || 'dark';
  document.body.setAttribute('data-theme', saved);
  // Sync settings toggle if it exists
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.classList.toggle('on', saved === 'light');
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(themeKey, theme);
  showToast(`Switched to ${theme} mode`, 'info');
}

// ========================
// 2. SESSION — SessionStorage API
// ========================
function initSession() {
  if (!sessionStorage.getItem('nexus_session')) {
    sessionStorage.setItem('nexus_session', JSON.stringify({
      user: 'Admin',
      role: 'Super Admin',
      loginTime: new Date().toISOString()
    }));
  }
  // Track active tab
  const page = window.location.pathname.split('/').pop() || 'index.html';
  sessionStorage.setItem('active_tab', page);
}

// ========================
// 3. SIDEBAR — localStorage persist state
// ========================
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const mobileBtn = document.getElementById('mobileToggle');
  const overlay = document.getElementById('overlay');

  if (!sidebar) return;

  // Restore state
  if (localStorage.getItem(sidebarKey) === 'collapsed') {
    sidebar.classList.add('collapsed');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem(sidebarKey, sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    });
  }

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
      // Close dropdowns
      closeAllDropdowns();
    });
  }

  // Mark active nav
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && (href.endsWith(current) || (current === '' && href === 'index.html'))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ========================
// 4. GEOLOCATION API
// ========================
function initGeolocation() {

  const locText = document.getElementById('locationText');

  if (!locText) return;

  if (!navigator.geolocation) {
    locText.textContent = 'Geolocation not supported';
    return;
  }

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      try {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );

        const data = await response.json();

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state ||
          'Unknown';

        const country =
          data.address.country || '';

        const location = `${city}, ${country}`;

        locText.textContent = location;

        localStorage.setItem(
          'nexus_location',
          location
        );

      } catch (err) {

        console.log(err);

        locText.textContent =
          'Location detected';

      }

    },

    (error) => {

      console.log(error);

      if (error.code === 1) {
        locText.textContent =
          'Permission Denied';
      }
      else if (error.code === 2) {
        locText.textContent =
          'Location Unavailable';
      }
      else if (error.code === 3) {
        locText.textContent =
          'Request Timeout';
      }
      else {
        locText.textContent =
          'Location Error';
      }

    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }

  );

}

// ========================
// 5. NOTIFICATION API
// ========================
async function requestNotifications() {
  if (!('Notification' in window)) {
    showToast('Notifications not supported in this browser', 'error');
    return;
  }
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  return permission;
}

async function sendNotification(title, body, icon = '') {
  const permission = await requestNotifications();
  if (permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || 'https://ui-avatars.com/api/?name=Nexus&background=6c63ff&color=fff',
    });
  } else {
    showToast(`${title}: ${body}`, 'info');
  }
}

function initNotifications() {
  const btn = document.getElementById('notifTestBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      sendNotification('Nexus Dashboard', '🔔 You have 3 pending tasks due today!');
      showToast('Notification sent!', 'success');
    });
  }
  // Auto notification for deadline (simulated)
  setTimeout(() => {
    sendNotification('⚠️ Deadline Reminder', 'Project Apollo is due in 2 days!');
  }, 5000);
}

// ========================
// 6. CLIPBOARD API
// ========================
function initClipboard() {
  const copyBtn = document.getElementById('copyReferral');
  const feedback = document.getElementById('copyFeedback');
  const input = document.getElementById('referralCode');
  if (!copyBtn || !input) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      feedback.textContent = '✓ Copied to clipboard!';
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        feedback.textContent = '';
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
      }, 2500);
    } catch {
      // Fallback
      input.select();
      document.execCommand('copy');
      feedback.textContent = '✓ Copied!';
    }
  });
}

// Copy Employee ID (used in employee table)
async function copyToClipboard(text, label = 'Text') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, 'success');
  } catch {
    showToast('Copy failed', 'error');
  }
}

// ========================
// 7. FULLSCREEN API
// ========================
function initFullscreen() {
  const btn = document.getElementById('fullscreenBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        btn.querySelector('i').className = 'fa-solid fa-compress';
        showToast('Fullscreen mode on', 'info');
      });
    } else {
      document.exitFullscreen().then(() => {
        btn.querySelector('i').className = 'fa-solid fa-expand';
        showToast('Exited fullscreen', 'info');
      });
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && btn) {
      btn.querySelector('i').className = 'fa-solid fa-expand';
    }
  });
}

// ========================
// 8. SPEECH RECOGNITION API
// ========================
function initSpeech() {
  const btn = document.getElementById('speechBtn');
  if (!btn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    btn.title = 'Speech recognition not supported';
    btn.style.opacity = '0.5';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  btn.addEventListener('click', () => {
    recognition.start();
    btn.querySelector('i').className = 'fa-solid fa-microphone-lines';
    showToast('Listening... Speak now', 'info');
  });

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    // Search in the page
    const searchInput = document.getElementById('searchInput') || document.querySelector('.search-box input');
    if (searchInput) {
      searchInput.value = transcript;
      searchInput.dispatchEvent(new Event('input'));
    }
    showToast(`Heard: "${transcript}"`, 'success');
    btn.querySelector('i').className = 'fa-solid fa-microphone';
  };

  recognition.onerror = () => {
    btn.querySelector('i').className = 'fa-solid fa-microphone';
    showToast('Speech not recognized', 'error');
  };
}

// ========================
// 9. DRAG AND DROP API
// ========================
function initDragDrop() {
  const list = document.getElementById('taskList');
  if (!list) return;

  let dragItem = null;

  list.querySelectorAll('.drag-task').forEach(item => {
    item.addEventListener('dragstart', () => {
      dragItem = item;
      setTimeout(() => item.style.opacity = '0.4', 0);
    });
    item.addEventListener('dragend', () => {
      item.style.opacity = '1';
      list.querySelectorAll('.drag-task').forEach(i => i.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      list.querySelectorAll('.drag-task').forEach(i => i.classList.remove('drag-over'));
      item.classList.add('drag-over');
    });
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragItem !== item) {
        const items = [...list.querySelectorAll('.drag-task')];
        const from = items.indexOf(dragItem);
        const to = items.indexOf(item);
        if (from < to) list.insertBefore(dragItem, item.nextSibling);
        else list.insertBefore(dragItem, item);
      }
    });
    // Keyboard support
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        showToast('Use mouse to drag-and-drop tasks', 'info');
      }
    });
  });
}

// ========================
// 10. CHARTS — Chart.js
// ========================
function initCharts() {
  const revenueCtx = document.getElementById('revenueChart');
  const donutCtx = document.getElementById('projectDonut');

  const isDark = document.body.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#8890b5' : '#4a5080';

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    revenue: [52, 61, 55, 78, 72, 85, 80, 92, 88, 95, 89, 102],
    expenses: [30, 35, 32, 42, 45, 50, 48, 55, 52, 58, 55, 62]
  };
  const quarterlyData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    revenue: [168, 235, 260, 290],
    expenses: [97, 137, 155, 175]
  };

  let revenueChart = null;
  let activeData = monthlyData;

  function buildRevenueChart(data) {
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Revenue (₹L)',
            data: data.revenue,
            backgroundColor: 'rgba(108,99,255,0.7)',
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Expenses (₹L)',
            data: data.expenses,
            backgroundColor: 'rgba(255,107,107,0.5)',
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'DM Sans' } } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  if (revenueCtx) {
    buildRevenueChart(activeData);
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        activeData = btn.dataset.period === 'quarterly' ? quarterlyData : monthlyData;
        buildRevenueChart(activeData);
      });
    });
  }

  if (donutCtx) {
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [18, 12, 6],
          backgroundColor: ['rgba(0,214,143,0.8)', 'rgba(77,184,255,0.8)', 'rgba(255,170,0,0.8)'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// ========================
// 11. STAT COUNTER ANIMATION
// ========================
function animateCounters() {
  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + current + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ========================
// 12. DROPDOWNS
// ========================
function closeAllDropdowns() {
  const notifDropdown = document.getElementById('notifDropdown');
  const profileDropdown = document.getElementById('profileDropdown');
  const notifBtn = document.getElementById('notifBtn');
  const profileBtn = document.getElementById('profileBtn');
  if (notifDropdown) { notifDropdown.hidden = true; if (notifBtn) notifBtn.setAttribute('aria-expanded', 'false'); }
  if (profileDropdown) { profileDropdown.hidden = true; if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false'); }
}

function initDropdowns() {
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const markAllRead = document.getElementById('markAllRead');
  const notifCount = document.getElementById('notifCount');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !notifDropdown.hidden;
      closeAllDropdowns();
      notifDropdown.hidden = open;
      notifBtn.setAttribute('aria-expanded', String(!open));
    });
  }

  if (markAllRead && notifCount) {
    markAllRead.addEventListener('click', () => {
      document.querySelectorAll('.notif-item.unread').forEach(i => i.classList.remove('unread'));
      notifCount.style.display = 'none';
      showToast('All notifications marked as read', 'success');
    });
  }

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !profileDropdown.hidden;
      closeAllDropdowns();
      profileDropdown.hidden = open;
      profileBtn.setAttribute('aria-expanded', String(!open));
    });
  }

  document.addEventListener('click', closeAllDropdowns);

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.clear();
      showToast('Logged out successfully', 'info');
      setTimeout(() => window.location.href = 'index.html', 1200);
    });
  }
}

// ========================
// 13. TOAST
// ========================
function showToast(msg, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    document.body.appendChild(toast);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========================
// 14. EXPORT DATA — Bonus
// ========================
function initExport() {
  const btn = document.getElementById('exportBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const session = JSON.parse(sessionStorage.getItem('nexus_session') || '{}');
    const data = {
      exportedAt: new Date().toISOString(),
      user: session.user,
      stats: { employees: 248, clients: 84, projects: 36, revenue: '₹92L' }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nexus_dashboard_export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Dashboard data exported!', 'success');
  });
}

// ========================
// 15. EMPLOYEE TABLE (used on employees.html)
// ========================
const employees = [
  { id: 'EMP001', name: 'Ravi Kumar',    email: 'ravi@nexus.com',    role: 'Developer',   dept: 'Engineering', status: 'active',   joined: '2022-03-15' },
  { id: 'EMP002', name: 'Priya Sharma',  email: 'priya@nexus.com',   role: 'Designer',    dept: 'Design',      status: 'active',   joined: '2022-07-10' },
  { id: 'EMP003', name: 'Arjun Reddy',   email: 'arjun@nexus.com',   role: 'Manager',     dept: 'Management',  status: 'on-leave', joined: '2021-11-01' },
  { id: 'EMP004', name: 'Sneha Patel',   email: 'sneha@nexus.com',   role: 'HR',          dept: 'HR',          status: 'active',   joined: '2023-01-20' },
  { id: 'EMP005', name: 'Kiran Babu',    email: 'kiran@nexus.com',   role: 'Developer',   dept: 'Engineering', status: 'inactive', joined: '2020-06-05' },
  { id: 'EMP006', name: 'Meena Iyer',    email: 'meena@nexus.com',   role: 'Sales',       dept: 'Sales',       status: 'active',   joined: '2023-04-12' },
  { id: 'EMP007', name: 'Suresh Nair',   email: 'suresh@nexus.com',  role: 'DevOps',      dept: 'Engineering', status: 'active',   joined: '2022-09-30' },
  { id: 'EMP008', name: 'Lakshmi Rao',   email: 'lakshmi@nexus.com', role: 'Designer',    dept: 'Design',      status: 'pending',  joined: '2024-02-01' },
  { id: 'EMP009', name: 'Vijay Anand',   email: 'vijay@nexus.com',   role: 'Developer',   dept: 'Engineering', status: 'active',   joined: '2021-08-18' },
  { id: 'EMP010', name: 'Deepa Menon',   email: 'deepa@nexus.com',   role: 'Finance',     dept: 'Finance',     status: 'active',   joined: '2022-05-22' },
];

window.employeeData = employees;

function renderEmployeeTable(data, container) {
  if (!container) return;
  if (!data.length) {
    container.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">No employees found</td></tr>';
    return;
  }
  container.innerHTML = data.map(emp => `
    <tr>
      <td>
        <div class="employee-cell">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=6c63ff&color=fff&size=36" alt="${emp.name}" width="36" height="36" />
          <div>
            <div class="employee-name">${emp.name}</div>
            <div class="employee-email">${emp.email}</div>
          </div>
        </div>
      </td>
      <td>
        <button onclick="copyToClipboard('${emp.id}','Employee ID')" style="font-family:monospace;font-size:0.82rem;color:var(--text-secondary);background:var(--bg-hover);padding:3px 8px;border-radius:4px;border:1px solid var(--border)" title="Click to copy">
          ${emp.id}
        </button>
      </td>
      <td>${emp.role}</td>
      <td>${emp.dept}</td>
      <td><span class="status-badge ${emp.status}">${emp.status.replace('-', ' ')}</span></td>
      <td>${emp.joined}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" title="View Profile" aria-label="View ${emp.name}"><i class="fa-solid fa-eye"></i></button>
          <button class="action-btn edit" title="Edit" aria-label="Edit ${emp.name}" onclick="openEditModal('${emp.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" title="Delete" aria-label="Delete ${emp.name}" onclick="confirmDelete('${emp.id}','${emp.name}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openEditModal(id) {
  const emp = window.employeeData?.find(e => e.id === id);
  if (!emp) return;
  showModal(`Edit Employee — ${emp.name}`, `
    <div class="form-group">
      <label class="form-label" for="editName">Full Name</label>
      <input class="form-input" id="editName" type="text" value="${emp.name}" aria-label="Employee Name" />
    </div>
    <div class="form-group">
      <label class="form-label" for="editRole">Role</label>
      <input class="form-input" id="editRole" type="text" value="${emp.role}" aria-label="Employee Role" />
    </div>
    <div class="form-group">
      <label class="form-label" for="editStatus">Status</label>
      <select class="form-input form-select" id="editStatus" aria-label="Employee Status">
        <option value="active" ${emp.status==='active'?'selected':''}>Active</option>
        <option value="inactive" ${emp.status==='inactive'?'selected':''}>Inactive</option>
        <option value="on-leave" ${emp.status==='on-leave'?'selected':''}>On Leave</option>
        <option value="pending" ${emp.status==='pending'?'selected':''}>Pending</option>
      </select>
    </div>
  `, () => {
    showToast(`${emp.name} updated successfully`, 'success');
  });
}

function confirmDelete(id, name) {
  showModal(`Delete Employee`, `
    <p style="color:var(--text-secondary);font-size:0.9rem">Are you sure you want to delete <strong>${name}</strong>? This action cannot be undone.</p>
  `, () => {
    showToast(`${name} deleted`, 'error');
  }, 'Delete', true);
}

// ========================
// 16. MODAL
// ========================
function showModal(title, bodyHtml, onConfirm, confirmText = 'Save', danger = false) {
  const existing = document.getElementById('globalModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'globalModal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modalTitle');

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 id="modalTitle">${title}</h3>
        <button class="modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Cancel</button>
        <button class="${danger ? 'btn-primary' : 'btn-primary'}" id="modalConfirm" style="${danger ? 'background:var(--accent-2)' : ''}">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modalCancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modalConfirm').addEventListener('click', () => {
    if (onConfirm) onConfirm();
    overlay.remove();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // Trap focus
  overlay.querySelector('#modalConfirm').focus();
}

// ========================
// INIT ALL
// ========================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSession();
  initSidebar();
  initDropdowns();
  initGeolocation();
  initNotifications();
  initClipboard();
  initFullscreen();
  initSpeech();
  initDragDrop();
  initCharts();
  animateCounters();
  initExport();

  // Theme toggle (settings page)
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      themeToggle.classList.toggle('on');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      document.documentElement.style.setProperty('--accent', swatch.dataset.color);
      localStorage.setItem('nexus_accent', swatch.dataset.color);
      showToast('Accent color updated', 'success');
    });
  });

  // Restore accent
  const savedAccent = localStorage.getItem('nexus_accent');
  if (savedAccent) document.documentElement.style.setProperty('--accent', savedAccent);
});


const sidebarToggle = document.getElementById("sidebarToggle");
const mobileToggle = document.getElementById("mobileToggle");

/* DESKTOP SIDEBAR */
if (sidebarToggle) {

  sidebarToggle.addEventListener("click", () => {

    if (window.innerWidth > 991) {

      document.body.classList.toggle("sidebar-collapsed");

    } else {

      document.body.classList.toggle("sidebar-open");

    }

  });

}

/* MOBILE SIDEBAR */
if (mobileToggle) {

  mobileToggle.addEventListener("click", () => {

    document.body.classList.toggle("sidebar-open");

  });

}