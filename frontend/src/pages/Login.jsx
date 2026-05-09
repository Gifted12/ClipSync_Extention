import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Spinner from '../components/ui/Spinner';
import api from '../utils/api';
import { useStore } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (tokenResponse) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { token: tokenResponse.access_token });
      setAuth(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({ onSuccess: handleGoogle });

  return (
    <AuthLayout title="Sign in" subtitle="Enter your credentials to access your clips.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            className="form-input" type="email" name="email"
            placeholder="you@example.com" value={form.email}
            onChange={handleChange} required autoFocus
          />
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Password</label>
            <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className="form-input" type={showPw ? 'text' : 'password'} name="password"
              placeholder="••••••••" value={form.password}
              onChange={handleChange} required style={{ paddingRight: 44 }}
            />
            <button
              type="button" className="btn btn-ghost"
              onClick={() => setShowPw(p => !p)}
              style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', padding: '6px 8px' }}
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 4, width: '100%' }}>
          {loading ? <Spinner /> : 'Sign in'}
        </button>
      </form>

      <div className="divider" style={{ margin: '24px 0' }}>or</div>

      <button
        className="btn btn-secondary btn-lg"
        onClick={() => googleLogin()}
        disabled={loading}
        style={{ width: '100%', gap: 10 }}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Create one</Link>
      </p>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
