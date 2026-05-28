// OAuth callback (route "/auth/callback"). The exchange logic is
// unchanged: read ?code, POST /api/auth/aiesec, store token+user, route
// by role. Only the presentation is redesigned — the blue "Signing you
// in." card and the failure card from screens-misc.jsx.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Logo, HumanMark } from '../components/ui/Logo';
import { Btn } from '../components/ui/Btn';
import { ArrowIcon } from '../components/ui/Icon';

/* ---------- Signing-in (loading) ---------- */
function OAuthSigningIn({ sessionIssued }) {
  const steps = [
    { l: 'Verifying code', done: true },
    { l: 'Pulling entity', done: true },
    { l: 'Issuing session', done: sessionIssued },
  ];
  return (
    <div className="min-h-full relative overflow-hidden flex flex-col" style={{ background: 'var(--accent)', color: '#fff' }}>
      <img src="/brand/AIESEC-Human-White.png" alt="" aria-hidden="true" className="absolute pointer-events-none" style={{ right: -100, bottom: -80, width: 640, opacity: 0.1 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(115deg, transparent 0 36px, rgba(255,255,255,0.025) 36px 37px)' }} />

      <header className="relative z-[1] flex items-center justify-between" style={{ padding: '28px 56px' }}>
        <Logo height={22} tone="white" />
        <span className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.65)' }}>/auth/callback</span>
      </header>

      <div className="relative z-[1] flex-1 flex items-center justify-center" style={{ padding: 40 }}>
        <div
          className="flex flex-col gap-6 items-start"
          style={{ width: 540, padding: '52px 56px 44px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', borderRadius: 10 }}
        >
          {/* orbit loader */}
          <div className="relative" style={{ width: 80, height: 80 }}>
            <div className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.18)' }} />
            <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ border: '2px solid transparent', borderTopColor: '#fff' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <HumanMark size={42} tone="white" />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-sans font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)' }}>
              Handing off to AIESEC EXPA
            </span>
            <h1 className="display" style={{ fontSize: 44, color: '#fff', lineHeight: 1.02 }}>
              Signing you <span className="display-italic" style={{ opacity: 0.85 }}>in.</span>
            </h1>
            <p className="font-sans" style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)', maxWidth: 380 }}>
              We're checking your AIESEC account, pulling your entity, and confirming your term. This usually takes a second.
            </p>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.14em' }}>
            {steps.map((s) => (
              <div
                key={s.l}
                className="flex items-center gap-2"
                style={{
                  padding: '8px 10px', borderRadius: 4,
                  background: s.done ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid ' + (s.done ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)'),
                  color: s.done ? '#fff' : 'rgba(255,255,255,0.55)',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.done ? 'var(--live)' : 'rgba(255,255,255,0.4)' }} />
                {s.l}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative z-[1] flex justify-between items-center font-mono uppercase"
        style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '16px 56px', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', background: 'rgba(2,99,194,0.4)' }}
      >
        <span>Secure handoff · OAuth 2.0</span>
        <span>Never posts on your behalf</span>
        <span>© AIESEC International</span>
      </div>
    </div>
  );
}

/* ---------- Failed ---------- */
function OAuthFailed({ detail, onRetry, onGuest }) {
  return (
    <div className="min-h-full flex flex-col bg-paper">
      <header className="flex items-center justify-between bg-white" style={{ borderBottom: '1px solid var(--line)', padding: '20px 56px' }}>
        <Logo height={22} />
        <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.18em' }}>/auth/callback · failed</span>
      </header>

      <div className="flex-1 flex items-center justify-center" style={{ padding: 40 }}>
        <div
          className="flex flex-col gap-5.5 bg-white"
          style={{ width: 540, borderRadius: 10, border: '1px solid var(--line)', boxShadow: '0 24px 60px -28px rgba(26,34,51,0.18)', padding: '40px 44px 32px', gap: 22 }}
        >
          <div
            className="flex items-center gap-2.5 self-start"
            style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(192,40,40,0.07)', border: '1px solid rgba(192,40,40,0.18)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
            <span className="font-mono font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--danger)' }}>
              AIESEC returned · sign-in failed
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <h1 className="display" style={{ fontSize: 40, color: 'var(--ink)', lineHeight: 1.04 }}>
              That didn't <span className="display-italic" style={{ color: 'var(--accent)' }}>quite</span> work.
            </h1>
            <p className="font-sans text-ink-soft" style={{ fontSize: 15, lineHeight: 1.6 }}>
              We couldn't exchange the AIESEC code for a session. Most often this means the link timed out, or it was opened twice in the same browser tab.
            </p>
          </div>

          <div
            className="font-mono text-ink-soft"
            style={{ fontSize: 12, background: 'var(--paper-soft)', borderRadius: 6, padding: '12px 14px', border: '1px solid var(--line)', lineHeight: 1.55, wordBreak: 'break-word' }}
          >
            <span className="text-ink-faint">POST</span> /api/auth/aiesec → <span style={{ color: 'var(--danger)', fontWeight: 700 }}>error</span>
            <br />
            <span className="text-ink-faint">detail</span> · {detail || 'invalid_grant'}
          </div>

          <div className="flex gap-2.5 mt-1">
            <Btn variant="primary" size="md" trailing={<ArrowIcon />} onClick={onRetry}>Try signing in again</Btn>
            <Btn variant="outline" size="md" onClick={onGuest}>Read as guest</Btn>
          </div>

          <div className="flex justify-between items-center font-sans text-ink-faint" style={{ borderTop: '1px solid var(--line)', paddingTop: 14, fontSize: 12 }}>
            <span>Still stuck? <a className="font-bold text-accent-deep underline">Contact the desk</a></span>
            <span className="font-mono" style={{ letterSpacing: '0.14em' }}>v3.142</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Controller ---------- */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  const [error, setError] = useState(null);
  const [sessionIssued, setSessionIssued] = useState(false);
  // StrictMode runs effects twice in dev; the OAuth code is single-use.
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(oauthError);
      return;
    }
    if (!code) {
      setError('no authorization code was provided');
      return;
    }

    api
      .post('/api/auth/aiesec', { code })
      .then(({ token, user }) => {
        setSessionIssued(true);
        completeLogin(token, user);
        navigate(user.role === 'ADMIN' ? '/admin' : '/feed', { replace: true });
      })
      .catch((e) => setError(e.message || 'login failed'));
  }, [searchParams, navigate, completeLogin]);

  if (error) {
    return (
      <OAuthFailed
        detail={error}
        onRetry={() => navigate('/login')}
        onGuest={() => navigate('/feed')}
      />
    );
  }

  return <OAuthSigningIn sessionIssued={sessionIssued} />;
}
