// Login — members + MCPs (route "/login"). Full-bleed, two-column.
// The SSO button redirects to the AIESEC authorize endpoint (the OAuth
// flow itself is unchanged from the original implementation). Rebuilt
// from screens-auth.jsx <LoginScreen>.

import { Link, useNavigate } from 'react-router-dom';
import { Logo, HumanMark } from '../components/ui/Logo';
import { SparkIcon, ArrowIcon } from '../components/ui/Icon';

const AUTHORIZE_URL = import.meta.env.VITE_AIESEC_AUTHORIZE_URL;
const CLIENT_ID = import.meta.env.VITE_AIESEC_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_AIESEC_REDIRECT_URI;

function loginWithAiesec() {
  // response_type=code → authorization-code flow. client_secret + token
  // exchange happen server-side; the browser only carries the public id.
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  });
  window.location.href = `${AUTHORIZE_URL}?${params.toString()}`;
}

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-paper grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Left — AIESEC blue hero */}
      <div
        className="relative overflow-hidden flex flex-col"
        style={{ background: 'var(--accent)', color: '#fff', padding: '40px 56px' }}
      >
        <img
          src="/brand/AIESEC-Human-White.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{ right: -80, bottom: -60, width: 560, opacity: 0.1 }}
        />
        <Logo height={26} tone="white" />

        <div className="relative z-[1] flex flex-col gap-7 my-auto" style={{ maxWidth: 520 }}>
          <span className="font-sans font-bold uppercase" style={{ fontSize: 12, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.8)' }}>
            The MCP desk · 2026
          </span>
          <h1 className="display" style={{ fontSize: 64, color: '#fff', lineHeight: 1.0 }}>
            The world,<br />
            <span className="display-italic" style={{ color: '#fff', opacity: 0.85 }}>filed</span> by the<br />
            people running it.
          </h1>
          <p className="font-sans" style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,0.88)', maxWidth: 460 }}>
            A single newsroom for 120 AIESEC entities — written by the MCPs themselves, read by everyone who cares where the next decade is going.
          </p>
        </div>

        <div className="relative z-[1] font-sans font-bold" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)' }}>
          © 2026 · AN AIESEC INTERNATIONAL PRODUCT
        </div>
      </div>

      {/* Right — sign in */}
      <div className="flex flex-col" style={{ padding: '40px 64px' }}>
        <div className="flex justify-end font-sans text-ink-soft" style={{ fontSize: 13 }}>
          <span>
            No AIESEC account?{' '}
            <Link to="/feed" className="font-bold text-accent-deep underline" style={{ textUnderlineOffset: 3 }}>
              Read as guest
            </Link>
          </span>
        </div>

        <div className="my-auto w-full flex flex-col gap-7" style={{ maxWidth: 420 }}>
          <div className="flex flex-col gap-3">
            <span className="eyebrow">Members only</span>
            <h2 className="display" style={{ fontSize: 44, color: 'var(--ink)' }}>Sign in.</h2>
            <p className="font-sans text-ink-soft" style={{ fontSize: 15, lineHeight: 1.55 }}>
              We hand you off to <strong className="text-ink">AIESEC EXPA</strong> to verify it's you. One click — no password to remember.
            </p>
          </div>

          {/* SSO button */}
          <button
            type="button"
            onClick={loginWithAiesec}
            className="w-full flex items-center gap-3.5 rounded-md font-sans font-bold cursor-pointer transition-[filter] hover:brightness-105"
            style={{ height: 60, padding: '0 24px', background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)', fontSize: 15 }}
          >
            <span
              className="inline-flex items-center justify-center overflow-hidden"
              style={{ width: 32, height: 32, borderRadius: 4, background: 'rgba(255,255,255,0.18)' }}
            >
              <HumanMark size={26} tone="white" style={{ marginTop: 2 }} />
            </span>
            <span className="flex-1 text-left">Continue with AIESEC EXPA</span>
            <span className="opacity-85"><ArrowIcon /></span>
          </button>

          <div
            className="flex items-start gap-3 font-sans text-ink-soft"
            style={{ padding: '16px 18px', borderRadius: 6, background: 'var(--paper-soft)', fontSize: 13, lineHeight: 1.55 }}
          >
            <span className="text-accent inline-flex" style={{ marginTop: 1 }}><SparkIcon /></span>
            <span>
              <strong className="text-ink font-bold">EXPA is the only way in.</strong> Your AIESEC International account already knows your entity, your role, and your term — no separate sign-up needed.
            </span>
          </div>

          <p className="font-sans text-ink-faint text-center" style={{ fontSize: 12, lineHeight: 1.55 }}>
            By continuing you agree to the <a className="text-ink-soft underline" style={{ textUnderlineOffset: 2 }}>terms</a> and <a className="text-ink-soft underline" style={{ textUnderlineOffset: 2 }}>privacy policy</a>. We never post on your behalf.
          </p>
        </div>

        <div className="flex justify-between items-center font-sans text-ink-faint" style={{ fontSize: 12 }}>
          <span>© 2026 AIESEC News</span>
          <button type="button" onClick={() => navigate('/admin/login')} className="font-bold text-ink-soft underline" style={{ textUnderlineOffset: 3 }}>
            Admin login →
          </button>
        </div>
      </div>
    </div>
  );
}
