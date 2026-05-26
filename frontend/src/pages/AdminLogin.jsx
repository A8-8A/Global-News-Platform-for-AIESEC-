// Admin login (route "/admin/login").
// Separate auth path - not AIESEC OAuth. Email + password the platform
// manages itself. Backend returns the same JWT, with role ADMIN.

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
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display font-extrabold text-2xl text-ink">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          For platform moderators only.
        </p>

        {error && (
          <div className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mt-5 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-aiesec"
        />

        <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mt-4 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-aiesec"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full mt-6 py-3"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
