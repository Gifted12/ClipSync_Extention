const API_BASE = 'http://localhost:5000/api'; 


let state = {
  token: null,
  user: null,
  clips: [],
  activeTab: 'clips',   
  clipType: 'text',
  loading: false,
  theme: 'light',
};


const save = (key, val) => chrome.storage.local.set({ [key]: val });
const load = (key) => new Promise(r => chrome.storage.local.get(key, d => r(d[key])));


async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${state.token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

function showToast(msg, duration = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('toast-show');
  setTimeout(() => el.classList.remove('toast-show'), duration);
}


function render() {
  const app = document.getElementById('app');
  document.documentElement.setAttribute('data-theme', state.theme);

  if (!state.token) {
    app.innerHTML = renderAuth();
    attachAuthHandlers();
    return;
  }

  app.innerHTML = renderMain();
  attachMainHandlers();
}


function renderAuth() {
  return `
    <div class="auth-screen">
      <div class="auth-logo">
        ${logoSVG(36)}
        <span class="logo-text">ClipSync</span>
      </div>
      <p class="auth-tagline">Sign in to access your clips from any device.</p>
      <form class="form" id="loginForm">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="authEmail" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="authPassword" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary" id="loginBtn">Sign in</button>
      </form>
      <p style="font-size:11px;color:var(--text-muted);text-align:center">
        Don't have an account? <a href="http://localhost:5173/register" target="_blank" style="color:var(--text);font-weight:600">Sign up on the web</a>
      </p>
    </div>
    <div id="toast" class="toast"></div>
  `;
}

function attachAuthHandlers() {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const btn = document.getElementById('loginBtn');
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      state.token = data.token;
      state.user = data.user;
      state.theme = data.user.theme || 'light';
      await save('token', data.token);
      await save('user', data.user);
      await loadClips();
      render();
    } catch (err) {
      showToast('❌ ' + err.message);
      btn.innerHTML = 'Sign in';
      btn.disabled = false;
    }
  });
}


function renderMain() {
  return `
    <div class="popup-header">
      <div class="header-brand">
        ${logoSVG(22)}
        ClipSync
      </div>
      <div class="header-actions">
        <div class="user-info">
          ${state.user?.avatar?.url
            ? `<img src="${state.user.avatar.url}" class="user-avatar" alt="" />`
            : `<div class="user-avatar">${state.user?.name?.[0]?.toUpperCase() || 'U'}</div>`}
        </div>
        <button class="btn btn-ghost btn-icon" id="settingsToggle" title="Settings">⚙</button>
        <button class="btn btn-ghost btn-icon" id="logoutBtn" title="Sign out">→</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab ${state.activeTab === 'clips' ? 'tab-active' : ''}" data-tab="clips">All Clips</button>
      <button class="tab ${state.activeTab === 'add' ? 'tab-active' : ''}" data-tab="add">+ Add</button>
      ${state.activeTab === 'settings' ? '<button class="tab tab-active" data-tab="settings">Settings</button>' : ''}
    </div>

    ${state.activeTab === 'add' ? renderAddPanel() : ''}
    ${state.activeTab === 'clips' ? renderClipsList() : ''}
    ${state.activeTab === 'settings' ? renderSettings() : ''}

    <div class="popup-footer">ClipSync · Your universal clipboard</div>
    <div id="toast" class="toast"></div>
  `;
}

function renderAddPanel() {
  return `
    <div class="add-panel">
      <div class="type-select">
        <button class="type-btn ${state.clipType === 'text' ? 'type-btn-active' : ''}" data-type="text">📝 Text</button>
        <button class="type-btn ${state.clipType === 'image' ? 'type-btn-active' : ''}" data-type="image">🖼 Image</button>
        <button class="type-btn ${state.clipType === 'document' ? 'type-btn-active' : ''}" data-type="document">📄 Doc</button>
      </div>
      ${state.clipType === 'text' ? `
        <textarea id="clipContent" rows="5" placeholder="Paste or type text to sync…"></textarea>
        <div class="add-actions">
          <button class="btn btn-ghost btn-icon" id="pasteBtn" title="Paste from clipboard">📋 Paste</button>
          <button class="btn btn-primary" id="saveClipBtn" style="padding:7px 14px">Save</button>
        </div>
      ` : `
        <div style="padding:20px;text-align:center;background:var(--bg);border:1.5px dashed var(--border);border-radius:var(--radius)">
          <div style="font-size:28px;margin-bottom:8px">${state.clipType === 'image' ? '🖼' : '📄'}</div>
          <p style="font-size:12px;color:var(--text-muted)">File uploads are available on the<br><a href="http://localhost:5173" target="_blank" style="color:var(--text);font-weight:600">full web app</a></p>
        </div>
      `}
    </div>
    ${renderClipsList()}
  `;
}

function renderClipsList() {
  if (state.loading) {
    return `<div class="empty"><span class="spinner" style="width:24px;height:24px"></span></div>`;
  }

  const textClips = state.clips;
  if (!textClips.length) {
    return `
      <div class="empty clips-list">
        <div class="empty-icon">◈</div>
        <h3>No clips yet</h3>
        <p>Add text, images, or documents from any device and access them here.</p>
      </div>
    `;
  }

  return `
    <div class="clips-list">
      ${textClips.map(clip => `
        <div class="clip-item" data-id="${clip._id}">
          <div class="clip-type-icon icon-${clip.type}">
            ${clip.type === 'text' ? '📝' : clip.type === 'image' ? '🖼' : '📄'}
          </div>
          <div class="clip-content">
            <div class="clip-title">${escHtml(clip.title || 'Untitled')}</div>
            <div class="clip-preview">${clip.type === 'text'
              ? escHtml(clip.content?.slice(0, 80) + (clip.content?.length > 80 ? '…' : ''))
              : clip.fileName || clip.fileUrl || 'File'}</div>
            <div class="clip-meta">
              <span class="clip-date">${timeAgo(clip.createdAt)}</span>
              <div class="clip-actions">
                ${clip.type === 'text'
                  ? `<button class="btn btn-ghost btn-icon copy-btn" data-content="${escAttr(clip.content)}" title="Copy">📋</button>`
                  : ''}
                ${clip.fileUrl ? `<a href="${clip.fileUrl}" target="_blank" class="btn btn-ghost btn-icon" title="Download">↓</a>` : ''}
                <button class="btn btn-ghost btn-icon delete-btn" data-id="${clip._id}" title="Delete" style="color:#DC2626">🗑</button>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSettings() {
  const isDark = state.theme === 'dark';
  return `
    <div class="settings-panel clips-list" style="overflow-y:auto;flex:1">
      <div class="settings-section">
        <h4>Appearance</h4>
        <div class="setting-row">
          <div>
            <div class="setting-label">Dark mode</div>
            <div class="setting-desc">Switch between light and dark theme</div>
          </div>
          <button class="toggle ${isDark ? 'toggle-on' : ''}" id="themeToggle"></button>
        </div>
      </div>
      <div class="settings-section">
        <h4>Account</h4>
        <div class="setting-row">
          <div>
            <div class="setting-label">${escHtml(state.user?.name || 'User')}</div>
            <div class="setting-desc">${escHtml(state.user?.email || '')}</div>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">Manage profile</div>
          <a href="http://localhost:5173/settings" target="_blank" class="btn btn-secondary" style="padding:5px 10px;font-size:11px;width:auto">Open ↗</a>
        </div>
      </div>
    </div>
  `;
}


function attachMainHandlers() {

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeTab = tab.dataset.tab;
      render();
    });
  });


  document.getElementById('settingsToggle')?.addEventListener('click', () => {
    state.activeTab = state.activeTab === 'settings' ? 'clips' : 'settings';
    render();
  });


  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    state.token = null;
    state.user = null;
    state.clips = [];
    await save('token', null);
    await save('user', null);
    render();
  });


  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.clipType = btn.dataset.type;
      render();
    });
  });


  document.getElementById('pasteBtn')?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById('clipContent').value = text;
    } catch { showToast('Could not access clipboard'); }
  });


  document.getElementById('saveClipBtn')?.addEventListener('click', async () => {
    const content = document.getElementById('clipContent')?.value?.trim();
    if (!content) { showToast('Please enter some text'); return; }
    const btn = document.getElementById('saveClipBtn');
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
    try {
      await apiFetch('/clips', {
        method: 'POST',
        body: JSON.stringify({ type: 'text', title: content.slice(0, 40), content, tags: '[]' }),
      });
      showToast('✓ Clip saved!');
      await loadClips();
      document.getElementById('clipContent').value = '';
      state.activeTab = 'clips';
      render();
    } catch (err) {
      showToast('❌ ' + err.message);
      btn.innerHTML = 'Save';
      btn.disabled = false;
    }
  });


  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.content)
        .then(() => showToast('✓ Copied!'))
        .catch(() => showToast('Copy failed'));
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await apiFetch(`/clips/${btn.dataset.id}`, { method: 'DELETE' });
        state.clips = state.clips.filter(c => c._id !== btn.dataset.id);
        showToast('Clip deleted');
        render();
      } catch (err) { showToast('❌ ' + err.message); }
    });
  });

  
  document.getElementById('themeToggle')?.addEventListener('click', async () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    state.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    await save('theme', newTheme);
    try {
      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name: state.user.name, theme: newTheme }),
      });
    } catch { /* silent */ }
    render();
  });
}


async function loadClips() {
  state.loading = true;
  try {
    const data = await apiFetch('/clips?limit=30');
    state.clips = data.clips;
  } catch (err) {
    console.error('Load clips failed:', err);
  } finally {
    state.loading = false;
  }
}


function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escAttr(str) {
  return String(str || '').replace(/"/g,'&quot;').replace(/'/g,'&#39;').slice(0, 200);
}

function logoSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="var(--accent)"/>
    <circle cx="16" cy="16" r="5" fill="none" stroke="#F8F7F4" stroke-width="2.5"/>
    <circle cx="16" cy="16" r="2" fill="#E8532A"/>
  </svg>`;
}


async function init() {
  const [token, user, theme] = await Promise.all([load('token'), load('user'), load('theme')]);
  if (token && user) {
    state.token = token;
    state.user = user;
    state.theme = user.theme || theme || 'light';
    render();
    await loadClips();
    render();
  } else {
    state.theme = theme || 'light';
    render();
  }
}

init();
