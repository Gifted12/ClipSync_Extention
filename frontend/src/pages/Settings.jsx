import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useStore } from '../store';
import Spinner from '../components/ui/Spinner';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, updateUser, setTheme, logout } = useStore();
  const [tab, setTab] = useState('profile');

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div  className={styles.backLink}>
          <Link to="/dashboard"><p style={{display:"flex", alignItems:"center", gap:".5rem"}}><span  className="material-symbols-outlined">arrow_left_alt </span> Back </p></Link>
        </div>
        <div className={styles.brand}>Settings</div>
        <nav className={styles.nav}>
          {[
            { id: 'profile', label: 'Profile', icon: <span  className="material-symbols-outlined">person </span> },
            { id: 'appearance', label: 'Appearance', icon: <span  className="material-symbols-outlined">palette</span> },
            { id: 'security', label: 'Security', icon: <span  className="material-symbols-outlined">security </span> },
          ].map(t => (
            <button key={t.id} className={`${styles.navItem} ${tab === t.id ? styles.navActive : ''}`}
              onClick={() => setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <button className={styles.logoutBtn} onClick={() => { logout(); window.location.href = '/login'; }}>
            <span  className="material-symbols-outlined">logout </span> Sign out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {tab === 'profile' && <ProfileTab user={user} updateUser={updateUser} />}
        {tab === 'appearance' && <AppearanceTab user={user} updateUser={updateUser} setTheme={setTheme} />}
        {tab === 'security' && <SecurityTab user={user} />}
      </main>
    </div>
  );
}

function ProfileTab({ user, updateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.avatar?.url || '');
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (file) fd.append('avatar', file);
      const { data } = await api.put('/users/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Profile</h2>
      <p className={styles.sectionDesc}>Update your name and profile picture.</p>

      <div className={styles.avatarRow}>
        <div className={styles.avatarWrap}>
          {preview ? (
            <img src={preview} alt="Avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          )}
          <button className={styles.avatarEdit} onClick={() => fileRef.current?.click()}><span style={{fontSize:"1.1rem"}}  className="material-symbols-outlined">edit</span></button>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}
            onClick={() => fileRef.current?.click()}>
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 24, maxWidth: 400 }}>
        <label className="form-label">Display name</label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="form-group" style={{ maxWidth: 400 }}>
        <label className="form-label">Email address</label>
        <input className="form-input" value={user?.email || ''} disabled
          style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email cannot be changed.</span>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? <Spinner /> : 'Save changes'}
      </button>
    </div>
  );
}

function AppearanceTab({ user, updateUser, setTheme }) {
  const currentTheme = user?.theme || 'light';
  const [saving, setSaving] = useState(false);

  const applyTheme = async (t) => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { name: user.name, theme: t });
      updateUser(data);
      setTheme(t);
      toast.success(`${t === 'dark' ? 'Dark' : 'Light'} mode activated`);
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Appearance</h2>
      <p className={styles.sectionDesc}>Choose your preferred theme.</p>

      <div className={styles.themeRow}>
        {[
          { id: 'light', label: 'Light', preview: '#F8F7F4', text: '#0D0D0D' },
          { id: 'dark', label: 'Dark', preview: '#0A0A0F', text: '#F0EDE8' },
        ].map(t => (
          <button key={t.id} className={`${styles.themeCard} ${currentTheme === t.id ? styles.themeActive : ''}`}
            onClick={() => applyTheme(t.id)} disabled={saving}>
            <div className={styles.themePreview} style={{ background: t.preview }}>
              <div style={{ background: t.id === 'dark' ? '#141420' : '#fff', borderRadius: 4, padding: '6px 10px', marginBottom: 6, opacity: 0.9 }}>
                <div style={{ background: t.id === 'dark' ? '#1A1A24' : '#F0EDE8', height: 6, borderRadius: 3, width: '60%', marginBottom: 4 }} />
                <div style={{ background: t.id === 'dark' ? '#1A1A24' : '#F0EDE8', height: 6, borderRadius: 3, width: '40%' }} />
              </div>
            </div>
            <div className={styles.themeLabel}>
              {currentTheme === t.id && <span className={styles.themeCheck}>✓</span>}
              {t.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SecurityTab({ user }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Min. 6 characters');
    setLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (user?.provider === 'google') {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Security</h2>
        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', maxWidth: 400 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔐</div>
          <div style={{ fontWeight: 600 }}>Signed in with Google</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Your account uses Google for authentication. Password management is handled by Google.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Security</h2>
      <p className={styles.sectionDesc}>Change your account password.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
        <div className="form-group">
          <label className="form-label">Current password</label>
          <input className="form-input" type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">New password</label>
          <input className="form-input" type="password" name="newPassword" placeholder="Min. 6 characters" value={form.newPassword} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm new password</label>
          <input className="form-input" type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: 'fit-content' }}>
          {loading ? <Spinner /> : 'Update password'}
        </button>
      </form>
    </div>
  );
}
