// Landing page (route "/").
//
// Public front door. White, static, single blue accent - styled after
// aiesec.org. Standalone: brings its own header and footer rather than
// using the app-shell Layout.

import { Link } from 'react-router-dom';
import { Logo } from '../components/Brand';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryTo = isAuthenticated ? '/feed' : '/login';
  const primaryLabel = isAuthenticated ? 'Go to the feed' : 'Log in with AIESEC';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ---- Header ---- */}
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo className="h-6" />
          <Link to={primaryTo} className="btn-primary px-4 py-2 text-sm">
            {isAuthenticated ? 'Go to feed' : 'Log in'}
          </Link>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="max-w-5xl mx-auto px-5 w-full">
        <div className="grid md:grid-cols-2 gap-10 items-center py-16 md:py-24">
          <div>
            <h1 className="font-display font-black text-4xl md:text-5xl leading-[1.1] text-ink">
              One feed for the
              <br />
              whole AIESEC network
            </h1>
            <p className="mt-5 text-ink-soft text-lg leading-relaxed max-w-md">
              Entity updates used to be scattered across committees and
              channels. This platform brings them into a single place that
              every member can follow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={primaryTo} className="btn-primary px-6 py-3 text-sm">
                {primaryLabel}
              </Link>
              <a href="#how" className="btn-outline px-6 py-3 text-sm">
                How it works
              </a>
            </div>
          </div>

          <div>
            <img
              src="/img/aiesec-way.jpg"
              alt="The AIESEC Way"
              className="w-full rounded-lg border border-line"
            />
          </div>
        </div>
      </section>

      {/* ---- What it is ---- */}
      <section className="border-t border-line bg-white">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink">
            What this platform is
          </h2>
          <p className="mt-4 text-ink-soft leading-relaxed max-w-2xl">
            A centralized news platform for AIESEC. Member Committee
            Presidents publish updates from their entities; members read,
            like, and comment on them; admins keep the feed accurate and
            on-brand. It is built to solve one problem - weak visibility of
            what is happening across the network.
          </p>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how" className="border-t border-line">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink">
            How it works
          </h2>
          <p className="mt-3 text-ink-soft max-w-2xl">
            Three roles share one platform. Each has a clear part to play.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            <RoleCard
              role="MCP"
              body="Member Committee Presidents publish entity updates to the global feed. Up to two posts a week are published immediately; further posts are sent to the admin queue."
            />
            <RoleCard
              role="Member"
              body="Any AIESEC member can read the feed and engage with updates by liking and commenting. Members see approved posts only, newest first."
            />
            <RoleCard
              role="Admin"
              body="Admins review queued posts, approve or reject them, remove inappropriate content, and review a full log of every moderation action."
            />
          </div>
        </div>
      </section>

      {/* ---- Sign-in note ---- */}
      <section className="border-t border-line bg-white">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink">
            Signing in
          </h2>
          <p className="mt-4 text-ink-soft leading-relaxed max-w-2xl">
            MCPs and members sign in with their existing AIESEC account
            through AIESEC's own login. The platform never sees or stores
            your AIESEC password. Your role - MCP or member - is determined
            automatically from your AIESEC profile.
          </p>
          <Link
            to={primaryTo}
            className="inline-block mt-6 btn-primary px-6 py-3 text-sm"
          >
            {primaryLabel}
          </Link>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-line mt-auto">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo className="h-5" />
          <p className="text-xs text-ink-soft">
            Global AIESEC News Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ role, body }) {
  return (
    <div className="card p-6">
      <div className="text-aiesec font-display font-extrabold text-lg">
        {role}
      </div>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
