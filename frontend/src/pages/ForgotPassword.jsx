import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Spinner from '../components/ui/Spinner';
import api from '../utils/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a reset link to your inbox.">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            If <strong>{email}</strong> has an account, you'll receive a password reset email shortly. Check your spam folder too.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="No worries — we'll send you a reset link.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? <Spinner /> : 'Send reset link'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
        <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>← Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;
