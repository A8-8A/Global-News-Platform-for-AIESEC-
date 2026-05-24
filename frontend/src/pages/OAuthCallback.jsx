// OAuth callback page.
//
// AIESEC redirects the user here after sign-in, with ?code=<temp code>.
// This page hands that code to OUR backend, which performs the secret
// -bearing code->token exchange, calls the GIS API to identify the
// person + role, creates/updates the local user, and returns our JWT.
//
// The client_secret and the token exchange NEVER happen in the browser.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  const [error, setError] = useState(null);
  // Guard: React 18 StrictMode runs effects twice in dev. We must not
  // POST the (single-use) code twice.
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

    // Hand the code to our backend for the exchange.
    // Backend endpoint (to be implemented): POST /api/auth/aiesec
    //   request:  { code }
    //   response: { token, user: { id, role, fullName, ... } }
    api
      .post('/api/auth/aiesec', { code })
      .then(({ token, user }) => {
        completeLogin(token, user);
        // Send the user somewhere sensible for their role.
        navigate(user.role === 'ADMIN' ? '/admin' : '/', { replace: true });
      })
      .catch((e) => {
        setError(e.message || 'Login failed. Please try again.');
      });
  }, [searchParams, navigate, completeLogin]);

  if (error) {
    return (
      <div className="max-w-sm mx-auto mt-10 bg-white rounded-lg border border-gray-200 p-6 text-center">
        <h1 className="text-lg font-bold text-gray-900 mb-2">Login failed</h1>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-aiesec hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 text-center text-gray-500">Signing you in...</div>
  );
}
