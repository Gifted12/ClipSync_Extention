import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Spinner from '../components/ui/Spinner';
import api from '../utils/api';
import { useStore } from '../store';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuth } = useStore();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset! Please sign in again.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label className="form-label">New password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm password</label>
          <input className="form-input" type="password" placeholder="Repeat your password"
            value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? <Spinner /> : 'Set new password'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
        <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>← Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
