// Login page (route "/login").
// "Log in with AIESEC" redirects to AIESEC's authorize endpoint; the
// user returns to /auth/callback with a code we exchange server-side.

import { Link } from 'react-router-dom';

const AUTHORIZE_URL = import.meta.env.VITE_AIESEC_AUTHORIZE_URL;
const CLIENT_ID = import.meta.env.VITE_AIESEC_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_AIESEC_REDIRECT_URI;

export default function Login() {
  function loginWithAiesec() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
    });
    window.location.href = `${AUTHORIZE_URL}?${params.toString()}`;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-display font-extrabold text-2xl text-ink">
          Log in
        </h1>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed">
          MCPs and members sign in with their AIESEC account. You will be
          redirected to AIESEC to sign in - this platform never sees or
          stores your AIESEC password.
        </p>

        <button
          onClick={loginWithAiesec}
          className="btn-primary w-full mt-6 py-3"
        >
          Log in with AIESEC
        </button>

        <div className="mt-6 pt-5 border-t border-line">
          <Link
            to="/admin/login"
            className="text-sm font-bold text-ink-soft hover:text-aiesec"
          >
            Admin login
          </Link>
        </div>
      </div>
    </div>
  );
}
