// Admin login — moderators only (route "/admin/login"). Full-bleed dark
// console card. Email + password POST to /api/auth/admin (separate from
// EXPA). Rebuilt from screens-auth.jsx <AdminLoginScreen>; login logic
// preserved from the original.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Field, Input } from '../components/ui/Field';
import { Btn } from '../components/ui/Btn';
import { ArrowIcon } from '../components/ui/Icon';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const { token, user } = await api.post('/api/auth/admin', { email, password });
      completeLogin(token, user);
      navigate('/admin', { replace: true });
    } catch (e) {
      setError(e.message || 'Sign in failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--ink)', padding: 40 }}
    >
      <img
        src="/brand/AIESEC-Human-White.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ right: -120, bottom: -120, width: 520, opacity: 0.05 }}
      />

      {/* top bar */}
      <div className="absolute flex justify-between items-center" style={{ top: 28, left: 36, right: 36 }}>
        <Logo height={20} tone="white" />
        <Link to="/feed" className="font-sans font-bold underline" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textUnderlineOffset: 3 }}>
          ← Back to the feed
        </Link>
      </div>

      {/* card */}
      <div
        className="relative z-[1] flex flex-col gap-6 bg-white"
        style={{ width: 440, borderRadius: 8, padding: '40px 40px 32px', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 11, letterSpacing: '0.2em' }}>/admin</span>
          <span className="inline-flex items-center gap-1.5 font-sans font-bold" style={{ fontSize: 10, color: 'var(--danger)', letterSpacing: '0.14em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />
            RESTRICTED
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="display" style={{ fontSize: 32, color: 'var(--ink)' }}>Moderators only.</h2>
          <p className="font-sans text-ink-soft" style={{ fontSize: 13, lineHeight: 1.55 }}>
            Email + password. This account is separate from AIESEC EXPA.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Email">
            <Input
              type="email"
              placeholder="you@aiesec.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
          <Field label="Password" error={error} hint={error ? undefined : 'Use the credentials issued to your moderator account.'}>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
        </div>

        <Btn variant="dark" size="lg" full trailing={<ArrowIcon />} onClick={submit} disabled={busy || !email || !password}>
          {busy ? 'Signing in…' : 'Sign in to console'}
        </Btn>

        <div className="flex justify-between items-center font-sans text-ink-faint" style={{ borderTop: '1px solid var(--line)', paddingTop: 18, fontSize: 12 }}>
          <span>Trouble signing in? <a className="font-bold text-accent-deep underline">Contact IT</a></span>
          <span className="font-mono">v3.142</span>
        </div>
      </div>
    </div>
  );
}
