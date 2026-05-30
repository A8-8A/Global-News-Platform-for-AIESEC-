// Landing — the marketing front door (route "/"). Full-bleed, with its
// own absolute-positioned nav over the hero. Rebuilt from
// screens-landing.jsx; the "This week" section pulls the real top 3
// posts from useFeed.

import { Link, useNavigate } from 'react-router-dom';
import { useFeed } from '../lib/queries';
import { Logo, HumanMark } from '../components/ui/Logo';
import { Pill } from '../components/ui/Pill';
import { Avatar } from '../components/ui/Avatar';
import { Photo } from '../components/ui/Photo';
import { OfficeTag } from '../components/ui/OfficeTag';
import { RuleLabel } from '../components/ui/RuleLabel';
import { ArrowIcon, CheckIcon } from '../components/ui/Icon';
import { timeAgo, excerptOf, FeedSkeleton } from '../components/ui/states';



/* ---------- Nav ---------- */
function LandingNav({ onSignIn }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 sm:px-14 py-7 flex items-center justify-between">
      <Logo height={22} tone="white" />
      <div className="flex items-center gap-7">
        <a href="#what" className="hidden md:inline font-sans font-medium cursor-pointer" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>What it is</a>
        <a href="#how" className="hidden md:inline font-sans font-medium cursor-pointer" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Who writes it</a>
        <a href="#this-week" className="hidden md:inline font-sans font-medium cursor-pointer" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>This week</a>
        <span className="hidden md:inline" style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.2)' }} />
        <button
          onClick={onSignIn}
          className="h-[38px] px-[18px] rounded-md font-sans font-bold cursor-pointer text-white"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', fontSize: 13 }}
        >
          Login
        </button>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function LandingHero({ onSignIn }) {
  return (
    <section
      className="relative overflow-hidden text-white flex flex-col justify-center px-6 sm:px-14"
      style={{ background: 'var(--accent)', padding: '160px 56px 120px', minHeight: 760 }}
    >
      <img
        src="/brand/AIESEC-Human-White.png" alt="" aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ right: -80, bottom: -80, width: 760, opacity: 0.12 }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(115deg, transparent 0 36px, rgba(255,255,255,0.025) 36px 37px)' }}
      />
      <div className="mx-auto max-w-feed w-full relative z-[1]">
        <span className="font-sans font-bold uppercase" style={{ fontSize: 12, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.8)' }}>
          A new publication · launching 2026
        </span>
        <h1 className="display" style={{ fontSize: 'clamp(56px, 9vw, 124px)', color: '#fff', margin: '24px 0 0', lineHeight: 0.94, maxWidth: '12ch' }}>
          120 entities.<br />
          <span className="display-italic" style={{ color: '#fff', opacity: 0.85 }}>One</span><br />
          newsroom.
        </h1>
        <p className="font-sans" style={{ fontSize: 20, lineHeight: 1.55, color: 'rgba(255,255,255,0.92)', margin: '36px 0 0', maxWidth: '52ch' }}>
          For the first time, every Member Committee President files entity updates to a single place — and every member of the network reads them in one feed. No more Slack channels, scattered newsletters, or carousels lost to the algorithm.
        </p>
        <div className="flex gap-3.5 flex-wrap" style={{ marginTop: 44 }}>
          
          <button
            onClick={onSignIn}
            className="rounded-md font-sans font-bold cursor-pointer text-white"
            style={{ height: 56, padding: '0 26px', background: 'transparent', border: '1px solid rgba(255,255,255,0.45)', fontSize: 15 }}
          >
            Sign in with EXPA
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-[1] flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center font-mono uppercase px-6 sm:px-14"
        style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '20px 56px', fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)', background: 'rgba(2,99,194,0.4)', backdropFilter: 'blur(4px)' }}
      >
        <span>Vol. I · No. 001 · est. 2026</span>
        <span className="hidden sm:inline">Published from 120 entities · read in 7 languages</span>
        <span>An AIESEC International product</span>
      </div>
    </section>
  );
}

/* ---------- What it is ---------- */
function LandingWhat() {
  return (
    <section id="what" className="relative bg-paper px-6 sm:px-14" style={{ padding: '120px 56px' }}>
      <div className="mx-auto max-w-feed grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-20 items-start">
        <div className="lg:sticky lg:top-[100px]">
          <span className="eyebrow">Why we built it</span>
          <h2 className="display" style={{ fontSize: 56, color: 'var(--ink)', margin: '18px 0 0', lineHeight: 1 }}>
            One feed.<br />
            <span className="display-italic" style={{ color: 'var(--accent)' }}>Every</span><br />
            entity.
          </h2>
        </div>
        <div className="flex flex-col">
          <p className="font-sans text-ink" style={{ fontSize: 24, lineHeight: 1.5 }}>
            AIESEC has 120 entities and no single place to share what's happening inside them. Updates live in scattered Slack channels, internal newsletters, and Instagram carousels — leading to <strong>poor visibility, weak alignment, and fragmented communication</strong> across the network.
          </p>
          <p className="font-sans text-ink-soft" style={{ fontSize: 24, lineHeight: 1.5, margin: '32px 0 0' }}>
            AIESEC News is the Global Platform MVP that fixes this. One place where MCPs publish entity updates, members consume and engage with them, and admins keep the standard.
          </p>
          <div style={{ marginTop: 56, paddingLeft: 32, borderLeft: '3px solid var(--accent)' }}>
            <p className="display-italic" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1.3 }}>
              "MVP-first. Speed over perfection. The network has waited long enough for one place to read itself."
            </p>
            <span className="font-sans font-bold uppercase text-ink-faint block" style={{ fontSize: 12, letterSpacing: '0.14em', marginTop: 14 }}>
              — from the project brief
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
const ROLES = [
  { tag: 'MCPs', role: 'The authors', summary: 'Publish entity updates. One byline per entity — the President in office.', rules: ['Sign in with AIESEC EXPA', 'Up to 2 posts per week', 'Title + body + optional media', 'Past the limit → approval queue'] },
  { tag: 'Members', role: 'The readers', summary: 'Consume what the network is filing. Sorted by latest, every entity in one feed.', rules: ['Sign in with AIESEC EXPA', 'Like and comment on posts', 'Cannot create posts', 'See engagement · likes, comments'] },
  { tag: 'Admins', role: 'The desk editors', summary: 'Moderate the feed. Approve, reject, or remove. Keep the standard.', rules: ['Separate admin authentication', 'Approve or reject queued posts', 'Delete inappropriate posts / comments', 'View MCP posting activity'] },
];

function LandingHow() {
  return (
    <section id="how" className="relative overflow-hidden bg-paper-soft px-6 sm:px-14" style={{ padding: '120px 56px' }}>
      <div className="mx-auto max-w-feed relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10" style={{ marginBottom: 64 }}>
          <div>
            <span className="eyebrow">How it works</span>
            <h2 className="display" style={{ fontSize: 56, color: 'var(--ink)', margin: '18px 0 0', lineHeight: 1, maxWidth: '14ch' }}>
              Three roles. <span className="display-italic" style={{ color: 'var(--accent)' }}>One contract.</span>
            </h2>
          </div>
          <p className="font-sans text-ink-soft" style={{ fontSize: 17, lineHeight: 1.55, maxWidth: 420 }}>
            Every person on the platform falls into one of three roles. Each has a clear job and a hard boundary on what they can do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px overflow-hidden rounded-md border border-line" style={{ background: 'var(--line)' }}>
          {ROLES.map((r, i) => (
            <div key={r.tag} className="bg-white flex flex-col gap-[18px]" style={{ padding: '36px 32px', minHeight: 360 }}>
              <div className="flex items-center justify-between">
                <Pill tone={i === 0 ? 'solid' : i === 1 ? 'accent' : 'ink'} size="sm">{r.tag}</Pill>
                <span className="font-mono text-ink-faint" style={{ fontSize: 11, letterSpacing: '0.16em' }}>0{i + 1}</span>
              </div>
              <h3 className="display" style={{ fontSize: 32, color: 'var(--ink)', lineHeight: 1.05 }}>{r.role}</h3>
              <p className="font-sans text-ink-soft" style={{ fontSize: 15, lineHeight: 1.55 }}>{r.summary}</p>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5" style={{ marginTop: 6 }}>
                {r.rules.map((rule) => (
                  <li key={rule} className="flex gap-2.5 font-sans text-ink" style={{ fontSize: 13, lineHeight: 1.4 }}>
                    <span className="text-accent shrink-0" style={{ marginTop: 2 }}><CheckIcon /></span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}

/* ---------- The rules ---------- */
const PRINCIPLES = [
  { n: '01', title: 'Two posts a week. Per entity.', body: 'Each MCP can publish up to two posts every seven days. The counter resets weekly, on a rolling window from the entity\u2019s timezone.' },
  { n: '02', title: 'Over the limit → the queue.', body: 'A third post in the same week doesn\u2019t publish immediately. It enters the approval queue. An admin can approve, reject, or send it back for changes.' },
  { n: '03', title: 'EXPA is the only login for members.', body: 'MCPs and members sign in through AIESEC OAuth (EXPA). The system pulls your entity and role from there. No new passwords, no parallel rosters.' },
  { n: '04', title: 'Admins moderate, not edit.', body: 'Admin auth is separate from EXPA. Admins can approve or reject, delete posts and comments, and view MCP activity — but every action is logged. No rewriting of bylines.' },
];

function LandingWhy() {
  return (
    <section id="why" className="relative bg-paper px-6 sm:px-14" style={{ padding: '120px 56px' }}>
      <div className="mx-auto max-w-feed">
        <div style={{ marginBottom: 64, maxWidth: 720 }}>
          <span className="eyebrow">The rules</span>
          <h2 className="display" style={{ fontSize: 56, color: 'var(--ink)', margin: '18px 0 0', lineHeight: 1 }}>
            Four constraints.<br />
            <span className="display-italic" style={{ color: 'var(--accent)' }}>That's the whole system.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px overflow-hidden rounded-md border border-line" style={{ background: 'var(--line)' }}>
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="bg-white flex flex-col gap-3.5" style={{ padding: '40px 44px', minHeight: 240 }}>
              <span className="display" style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--accent)' }}>{p.n}</span>
              <h3 className="display" style={{ fontSize: 30, color: 'var(--ink)', lineHeight: 1.1 }}>{p.title}</h3>
              <p className="font-sans text-ink-soft" style={{ fontSize: 15, lineHeight: 1.55, maxWidth: '46ch' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- This week (real data) ---------- */
function LandingThisWeek() {
  const { data, isLoading } = useFeed({ limit: 3 });
  const posts = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <section id="this-week" className="relative bg-paper-soft px-6 sm:px-14" style={{ padding: '120px 56px' }}>
      <div className="mx-auto max-w-feed">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-10" style={{ marginBottom: 56 }}>
          <div>
            <span className="eyebrow">This week on the desk</span>
            <h2 className="display" style={{ fontSize: 56, color: 'var(--ink)', margin: '18px 0 0', lineHeight: 1 }}>
              A taste, <span className="display-italic" style={{ color: 'var(--accent)' }}>on the house.</span>
            </h2>
          </div>
          <Link to="/login" className="font-sans font-bold text-accent-deep" style={{ fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 4 }}>
            Login to read everything →
          </Link>
        </div>

        {isLoading ? (
          <FeedSkeleton count={3} />
        ) : posts.length === 0 ? (
          <p className="font-sans text-ink-faint" style={{ fontSize: 15 }}>
            The desk is quiet right now — be the first to file once you sign in.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((p) => (
              <div key={p.id} onClick={onSignIn} className="bg-white rounded-md overflow-hidden flex flex-col border border-line no-underline cursor-pointer">
                <Photo src={p.mediaUrl} tone="sky" ratio="16 / 10" />
                <div className="flex flex-col gap-3 flex-1" style={{ padding: '24px 24px 26px' }}>
                  <div className="flex items-center gap-2">
                    {p.officeCode && <OfficeTag code={p.officeCode} mode="chip" />}
                    {p.tag && <span className="font-sans font-bold text-accent-deep" style={{ fontSize: 10, letterSpacing: '0.12em' }}>{p.tag}</span>}
                  </div>
                  <h3 className="display" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 700, lineHeight: 1.2 }}>{p.title}</h3>
                  <p className="font-sans text-ink-soft" style={{ fontSize: 14, lineHeight: 1.55 }}>
                    {(p.excerpt || excerptOf(p.content, 110))}
                  </p>
                  <div className="mt-auto flex items-center gap-2.5 font-sans text-ink-faint" style={{ paddingTop: 14, fontSize: 12 }}>
                    <Avatar name={p.authorName} size={22} />
                    <span className="text-ink font-bold">{p.authorName}</span>
                    <span>·</span>
                    <span>{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function LandingCTA({ onSignIn }) {
  return (
    <section className="relative overflow-hidden text-white px-6 sm:px-14" style={{ background: 'var(--ink)', padding: '120px 56px' }}>
      <img src="/brand/AIESEC-Human-White.png" alt="" aria-hidden="true" className="absolute pointer-events-none" style={{ right: -100, top: -60, width: 580, opacity: 0.08 }} />
      <img src="/brand/AIESEC-Human-White.png" alt="" aria-hidden="true" className="absolute pointer-events-none" style={{ left: -120, bottom: -80, width: 480, opacity: 0.06, transform: 'scaleX(-1)' }} />
      <div className="mx-auto text-center relative z-[1]" style={{ maxWidth: 980 }}>
        <span className="font-sans font-bold uppercase" style={{ fontSize: 12, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.7)' }}>Members only</span>
        <h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 88px)', color: '#fff', margin: '24px 0 0', lineHeight: 0.98, letterSpacing: '-0.02em' }}>
          Step inside <span className="display-italic" style={{ opacity: 0.85 }}>the room</span> where<br />
          the network is written.
        </h2>
        <p className="font-sans mx-auto" style={{ fontSize: 18, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)', margin: '32px auto 0', maxWidth: 580 }}>
          Sign in with your AIESEC EXPA account. No new password, no separate roster — your entity and term are already verified.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap" style={{ marginTop: 48 }}>
          <button onClick={onSignIn} className="inline-flex items-center gap-3 rounded-md font-sans font-bold cursor-pointer text-white" style={{ height: 60, padding: '0 32px', background: 'var(--accent)', fontSize: 15 }}>
            Login with AIESEC EXPA
          </button>
          
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function LandingFooter() {
  return (
    <footer className="bg-paper border-t border-line" style={{ padding: '40px 56px' }}>
      <div className="mx-auto max-w-feed flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo height={22} />
          <p className="font-sans text-ink-soft" style={{ fontSize: 13, lineHeight: 1.55, maxWidth: 320 }}>
            An internal publication of the AIESEC network. Filed by 120 Member Committee Presidents. Read everywhere.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 font-sans text-ink-faint" style={{ fontSize: 12 }}>
          <span>© 2026 AIESEC International. All bylines belong to their authors.</span>
          <span className="font-mono" style={{ letterSpacing: '0.14em' }}>VOL. I · ISS. 001</span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const onSignInNav = () => navigate('/login');

  // Redirect authenticated users straight to the feed
  if (isAuthenticated) {
    navigate('/feed', { replace: true });
    return null;
  }
  return (
    <div className="bg-paper min-h-full relative">
      <LandingNav onSignIn={onSignInNav} />
      <LandingHero onSignIn={onSignInNav}  />
      <LandingWhat />
      <LandingHow />
      <LandingWhy />
      <LandingThisWeek />
      <LandingCTA onSignIn={onSignInNav}  />
      <LandingFooter />
    </div>
  );
}
