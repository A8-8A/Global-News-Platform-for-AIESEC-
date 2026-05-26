// OAuth callback (route "/auth/callback").
// AIESEC redirects here with ?code=...; we hand it to the backend,
// which does the token exchange + role detection and returns our JWT.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  const [error, setError] = useState(null);
  // React 18 StrictMode runs effects twice in dev; the code is
  // single-use, so guard against a double exchange.
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(`AIESEC returned an error: ${oauthError}`);
      return;
    }
    if (!code) {
      setError('No authorization code was provided.');
      return;
    }

    api
      .post('/api/auth/aiesec', { code })
      .then(({ token, user }) => {
        completeLogin(token, user);
        navigate(user.role === 'ADMIN' ? '/admin' : '/feed', { replace: true });
      })
      .catch((e) => {
        setError(e.message || 'Login failed. Please try again.');
      });
  }, [searchParams, navigate, completeLogin]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <h1 className="font-display font-extrabold text-xl text-ink">
            Login failed
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary mt-6 px-5 py-2.5 text-sm"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return <Spinner label="Signing you in..." />;
}
