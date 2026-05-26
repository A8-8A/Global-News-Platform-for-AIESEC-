// Login page (route "/login").
//
// "Log in with AIESEC" does NOT submit a form - it redirects the browser
// to AIESEC's authorize endpoint. AIESEC signs the user in and returns
// them to /auth/callback with a ?code=..., which OAuthCallback exchanges
// (via our backend) for a session.

import { Link } from 'react-router-dom';
import { Human } from '../components/Brand';

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
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card overflow-hidden anim-scale-in">
        {/* branded top */}
        <div
          className="relative px-8 pt-9 pb-12 text-center overflow-hidden"
          style={{ background: 'linear-gradient(140deg,#037EF3,#024a91)' }}
        >
          <div className="blob" style={{ width: 180, height: 180, background: '#7cc0ff', top: -70, left: -40, opacity: 0.5 }} />
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Human className="h-9" float />
            </div>
            <h1 className="mt-4 font-display font-black text-2xl text-white">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-white/80">
              The Global AIESEC News Platform
            </p>
          </div>
        </div>

        {/* body */}
        <div className="px-8 py-8 -mt-6 bg-white rounded-t-2xl relative">
          <p className="text-sm text-ink-soft text-center">
            MCPs and members sign in securely with their AIESEC account.
          </p>

          <button
            onClick={loginWithAiesec}
            className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2"
          >
            <Human className="h-5" />
            Log in with AIESEC
          </button>

          <p className="mt-4 text-[11px] text-ink-soft/70 text-center leading-relaxed">
            You will be redirected to AIESEC to sign in. We never see or
            store your AIESEC password.
          </p>

          <div className="mt-6 pt-5 border-t border-line text-center">
            <Link
              to="/admin/login"
              className="text-sm font-bold text-ink-soft hover:text-aiesec transition-colors"
            >
              Admin login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
