// OAuth callback page (route "/auth/callback").
//
// AIESEC redirects here after sign-in with ?code=<temp code>. We hand
// that code to our backend, which does the secret-bearing token
// exchange, calls the GIS API to identify the person + role, and
// returns our JWT. The secret and the exchange never touch the browser.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Human } from '../components/Brand';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  const [error, setError] = useState(null);
  // React 18 StrictMode runs effects twice in dev; the OAuth code is
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
        <div className="card anim-scale-in flex flex-col items-center text-center px-8 py-12">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-3xl mb-4">
            &#9888;
          </div>
          <h1 className="font-display font-black text-xl text-ink">
            Login failed
          </h1>
          <p className="mt-2 text-sm text-ink-soft max-w-xs">{error}</p>
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

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-aiesec/15" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-aiesec anim-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Human className="h-9" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-display font-extrabold text-lg text-ink">
          Signing you in
        </p>
        <p className="text-sm text-ink-soft mt-0.5">
          Verifying your AIESEC account...
        </p>
      </div>
    </div>
  );
}
