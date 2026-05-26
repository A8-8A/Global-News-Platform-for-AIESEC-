// Admin login (route "/admin/login").
//
// The SEPARATE auth path - not AIESEC OAuth. Admins are platform
// moderators with an email + password this platform manages itself.
// The backend returns the same kind of JWT, with role ADMIN.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      const { token, user } = await api.post('/api/auth/admin', {
        email: email.trim(),
        password,
      });
      completeLogin(token, user);
      navigate('/admin', { replace: true });
    } catch (e) {
      setError(e.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card overflow-hidden anim-scale-in">
        <div
          className="px-8 py-7 text-center"
          style={{ background: 'linear-gradient(140deg,#0d1b2a,#024a91)' }}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
            &#128737;
          </div>
          <h1 className="mt-3 font-display font-black text-xl text-white">
            Admin access
          </h1>
          <p className="text-xs text-white/70 mt-1">
            Platform moderators only
          </p>
        </div>

        <div className="px-8 py-7">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 anim-fade-in">
              {error}
            </div>
          )}

          <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:border-aiesec transition-colors"
          />

          <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-5 outline-none focus:border-aiesec transition-colors"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-3"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
