// Admin login - the SEPARATE authentication path (not AIESEC OAuth).
//
// Admins are platform moderators, not AIESEC EXPA users. They sign in
// with an email + password that this platform manages itself. The
// backend verifies the credentials and returns the same kind of JWT
// the OAuth path issues - just with role ADMIN.

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
      // Endpoint (to be implemented): POST /api/auth/admin
      //   request:  { email, password }
      //   response: { token, user: { id, role: 'ADMIN', email, ... } }
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
    <div className="max-w-sm mx-auto mt-10 bg-white rounded-lg border border-gray-200 p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Admin login</h1>
      <p className="text-sm text-gray-500 mb-6">
        For platform moderators only.
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-5 text-sm"
      />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-aiesec text-white py-2.5 rounded font-medium hover:bg-aiesec-dark disabled:opacity-50"
      >
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>
    </div>
  );
}
