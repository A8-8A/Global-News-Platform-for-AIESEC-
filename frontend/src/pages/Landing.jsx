// Landing page (route "/").
//
// The public front door: introduces the platform and previews what it
// does BEFORE asking anyone to log in. Standalone - it brings its own
// header/footer rather than using the app shell Layout.

import { Link } from 'react-router-dom';
import { Logo, Human } from '../components/Brand';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <LandingHeader isAuthenticated={isAuthenticated} />
      <Hero isAuthenticated={isAuthenticated} />
      <Stats />
      <Features />
      <FeedPreview />
      <RoleStrip />
      <CTA isAuthenticated={isAuthenticated} />
      <LandingFooter />
    </div>
  );
}

/* ------------------------------------------------------------ */
/* Header                                                        */
/* ------------------------------------------------------------ */
function LandingHeader({ isAuthenticated }) {
  return (
    <header className="absolute top-0 inset-x-0 z-30">
      <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
        <span className="bg-white rounded-xl px-3 py-2 shadow-lg">
          <Logo className="h-6" />
        </span>
        <Link
          to={isAuthenticated ? '/feed' : '/login'}
          className="bg-white/95 text-aiesec font-extrabold text-sm px-5 py-2.5 rounded-xl hover:shadow-glow-lg hover:-translate-y-0.5 transition-all"
        >
          {isAuthenticated ? 'Go to feed' : 'Log in'}
        </Link>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ */
/* Hero                                                          */
/* ------------------------------------------------------------ */
function Hero({ isAuthenticated }) {
  return (
    <section
      className="relative pt-36 pb-28 px-5 overflow-hidden"
      style={{
        background:
          'linear-gradient(150deg, #024a91 0%, #037EF3 60%, #0a92ff 100%)',
      }}
    >
      {/* decorative blobs */}
      <div className="blob" style={{ width: 380, height: 380, background: '#7cc0ff', top: -120, right: -80 }} />
      <div className="blob" style={{ width: 320, height: 320, background: '#024a91', bottom: -140, left: -100, opacity: 0.7 }} />

      {/* faint human watermark */}
      <img
        src="/brand/human-tile.png"
        alt=""
        aria-hidden="true"
        className="hidden lg:block absolute right-10 bottom-0 w-[300px] opacity-10 select-none"
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        {/* copy */}
        <div className="anim-fade-up">
          <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold tracking-wide uppercase px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white anim-float" />
            Global Platform - MVP
          </span>

          <h1 className="mt-5 text-white font-display font-black leading-[1.05] text-5xl sm:text-6xl">
            One feed for
            <br />
            <span className="text-white/55">all of AIESEC.</span>
          </h1>

          <p className="mt-5 text-white/85 text-lg max-w-md leading-relaxed">
            Entity updates scattered across committees, now in one place.
            MCPs publish, members engage, the whole network stays aligned.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={isAuthenticated ? '/feed' : '/login'}
              className="bg-white text-aiesec font-extrabold px-7 py-3.5 rounded-xl hover:shadow-glow-lg hover:-translate-y-1 transition-all"
            >
              {isAuthenticated ? 'Open the feed' : 'Log in with AIESEC'}
            </Link>
            <a
              href="#features"
              className="text-white font-bold px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* hero card cluster */}
        <div className="relative anim-scale-in">
          <div className="card p-5 rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#037EF3,#024a91)' }}
              >
                <Human className="h-6" />
              </div>
              <div>
                <div className="h-2.5 w-28 rounded bg-ink/15" />
                <div className="h-2 w-16 rounded bg-ink/10 mt-1.5" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2.5 w-full rounded bg-ink/10" />
              <div className="h-2.5 w-5/6 rounded bg-ink/10" />
              <div className="h-2.5 w-2/3 rounded bg-ink/10" />
            </div>
            <div className="mt-4 flex gap-4 text-aiesec font-bold text-sm">
              <span>♥ 128</span>
              <span>💬 24</span>
            </div>
          </div>

          <div className="card p-4 -rotate-3 -mt-6 ml-10 w-56 hover:rotate-0 transition-transform duration-500 anim-float">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-aiesec/15" />
              <div className="h-2 w-20 rounded bg-ink/10" />
            </div>
            <div className="h-2 w-full rounded bg-ink/10 mt-3" />
            <div className="h-2 w-3/4 rounded bg-ink/10 mt-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Stats strip                                                   */
/* ------------------------------------------------------------ */
function Stats() {
  const stats = [
    ['1', 'Global feed'],
    ['3', 'Roles, one platform'],
    ['∞', 'Entity updates'],
  ];
  return (
    <section className="bg-white border-b border-line">
      <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-3 gap-4 stagger">
        {stats.map(([n, label]) => (
          <div key={label} className="text-center">
            <div className="font-display font-black text-3xl sm:text-4xl text-aiesec">
              {n}
            </div>
            <div className="text-xs sm:text-sm text-ink-soft font-bold mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Features                                                      */
/* ------------------------------------------------------------ */
function Features() {
  const features = [
    {
      icon: '📣',
      title: 'MCPs publish',
      body: 'Member Committee Presidents post entity updates straight to the global feed - title, story, and media.',
    },
    {
      icon: '💙',
      title: 'Members engage',
      body: 'Every member can like and comment, turning announcements into real conversation across the network.',
    },
    {
      icon: '🛡️',
      title: 'Admins moderate',
      body: 'A review queue, content controls, and a full audit log keep the feed trustworthy and on-brand.',
    },
    {
      icon: '⚖️',
      title: 'Fair posting',
      body: 'A weekly limit per MCP keeps the feed balanced - extra posts route to an approval queue automatically.',
    },
  ];

  return (
    <section id="features" className="max-w-5xl mx-auto px-5 py-20">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-ink">
          Built for how AIESEC works
        </h2>
        <p className="mt-3 text-ink-soft">
          Three roles, one shared space. Here is what each can do.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 gap-5 stagger">
        {features.map((f) => (
          <div key={f.title} className="card card-hover p-6 flex gap-4">
            <div className="text-3xl shrink-0">{f.icon}</div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-ink">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Feed preview                                                  */
/* ------------------------------------------------------------ */
function FeedPreview() {
  return (
    <section className="bg-aiesec-tint border-y border-line py-20 px-5">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-aiesec font-extrabold text-xs uppercase tracking-widest">
            The feed
          </span>
          <h2 className="mt-2 font-display font-black text-3xl sm:text-4xl text-ink">
            A familiar feed, made for AIESEC
          </h2>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Approved posts, newest first. Each card shows who posted,
            from which entity, and how the network is responding -
            likes and comments, right where you expect them.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Author identity on every post',
              'Like and comment inline',
              'Newest updates surface first',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm font-bold text-ink">
                <span className="w-5 h-5 rounded-full bg-aiesec text-white text-xs flex items-center justify-center">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* mock post card */}
        <div className="card p-6 anim-fade-up">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#037EF3,#024a91)' }}
            >
              <Human className="h-7" />
            </div>
            <div>
              <p className="font-display font-extrabold text-ink">MC Lebanon</p>
              <p className="text-xs text-ink-soft">National Committee - just now</p>
            </div>
          </div>
          <h4 className="mt-4 font-display font-extrabold text-lg text-ink">
            Summer Peak season is live
          </h4>
          <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
            Our biggest exchange season opens this week. Here is what
            every member should know before applications go out...
          </p>
          <div className="mt-4 pt-4 border-t border-line flex gap-5 text-sm font-bold">
            <span className="text-aiesec">♥ 86 likes</span>
            <span className="text-ink-soft">💬 19 comments</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Role strip                                                    */
/* ------------------------------------------------------------ */
function RoleStrip() {
  const roles = [
    ['MCP', 'Publishes entity updates to the global feed.'],
    ['Member', 'Reads, likes and comments on every update.'],
    ['Admin', 'Moderates content and keeps the feed clean.'],
  ];
  return (
    <section className="max-w-5xl mx-auto px-5 py-20">
      <h2 className="text-center font-display font-black text-3xl sm:text-4xl text-ink">
        Who is it for?
      </h2>
      <div className="mt-10 grid sm:grid-cols-3 gap-5 stagger">
        {roles.map(([role, body]) => (
          <div
            key={role}
            className="rounded-2xl p-6 text-white relative overflow-hidden card-hover"
            style={{ background: 'linear-gradient(140deg,#037EF3,#024a91)' }}
          >
            <div className="blob" style={{ width: 140, height: 140, background: '#7cc0ff', top: -50, right: -40, opacity: 0.4 }} />
            <div className="relative">
              <div className="font-display font-black text-2xl">{role}</div>
              <p className="mt-2 text-sm text-white/85 leading-relaxed">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Final CTA                                                     */
/* ------------------------------------------------------------ */
function CTA({ isAuthenticated }) {
  return (
    <section className="px-5 pb-20">
      <div
        className="max-w-5xl mx-auto rounded-3xl px-8 py-14 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg,#024a91,#037EF3)' }}
      >
        <div className="blob" style={{ width: 300, height: 300, background: '#7cc0ff', top: -120, left: -60 }} />
        <img
          src="/brand/human-tile.png"
          alt=""
          aria-hidden="true"
          className="absolute right-6 -bottom-6 w-40 opacity-15"
        />
        <div className="relative">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
            Ready to see what is happening?
          </h2>
          <p className="mt-3 text-white/85 max-w-md mx-auto">
            Log in with your AIESEC account and join the global conversation.
          </p>
          <Link
            to={isAuthenticated ? '/feed' : '/login'}
            className="inline-block mt-7 bg-white text-aiesec font-extrabold px-8 py-3.5 rounded-xl hover:shadow-glow-lg hover:-translate-y-1 transition-all"
          >
            {isAuthenticated ? 'Open the feed' : 'Log in with AIESEC'}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Footer                                                        */
/* ------------------------------------------------------------ */
function LandingFooter() {
  return (
    <footer className="bg-white border-t border-line">
      <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Logo className="h-5 opacity-80" />
        <p className="text-xs text-ink-soft">
          Global AIESEC News Platform - entity updates, shared across the world.
        </p>
      </div>
    </footer>
  );
}
