// Feed — the newsroom (route "/feed"). Rendered inside <Layout>, so the
// TopNav + footer come from the chrome; this page renders the hero band,
// the editorial column (feature + rows), the sticky right rail, and the
// full loading / empty / error states. Rebuilt from screens-feed.jsx.

import { useFeed } from '../lib/queries';
import { FeaturePost, PostRow } from '../components/PostCard';
import { RuleLabel } from '../components/ui/RuleLabel';
import { Btn } from '../components/ui/Btn';
import { HumanMark } from '../components/ui/Logo';
import { FeedSkeleton } from '../components/ui/states';
import { ArrowIcon } from '../components/ui/Icon';
import { useNavigate } from 'react-router-dom';

const TABS = ['Latest', 'For you', 'Following'];

function todayEyebrow() {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return 'Today';
  }
}

/* ---------- Hero band (date + title + tabs) ---------- */
function FeedHero() {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-feed px-10 pt-14 pb-8 flex items-end justify-between gap-6">
        <div>
          <span className="eyebrow">{todayEyebrow()}</span>
          <h1 className="display mt-3.5" style={{ fontSize: 56, color: 'var(--ink)', maxWidth: '14ch' }}>
            The desk, <span className="display-italic" style={{ color: 'var(--accent)' }}>today.</span>
          </h1>
        </div>
        <div className="hidden sm:flex gap-1">
          {TABS.map((t, i) => (
            <span
              key={t}
              className="px-3.5 py-2 rounded-full font-sans font-bold cursor-pointer"
              style={{
                fontSize: 13,
                color: i === 0 ? '#fff' : 'var(--ink-soft)',
                background: i === 0 ? 'var(--ink)' : 'transparent',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Inline MCP-spotlight pull quote ----------
   The design's spotlight has no backend yet. Per the product decision
   (no fake data) we omit the seeded quote, but keep the exact visual
   treatment as a real, generic editorial promo so the column never
   looks half-built. */
function DeskPromo() {
  return (
    <aside
      className="relative overflow-hidden my-10 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center"
      style={{ background: 'var(--accent)', color: '#fff', borderRadius: 6, padding: '40px 48px' }}
    >
      <HumanMark
        size={180}
        tone="white"
        style={{ position: 'absolute', right: -20, bottom: -40, opacity: 0.18, pointerEvents: 'none' }}
      />
      <div className="relative z-[1]">
        <span
          className="font-sans font-bold uppercase"
          style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.75)' }}
        >
          From the desk
        </span>
        <p
          className="display"
          style={{ fontSize: 28, color: '#fff', margin: '14px 0 18px', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.2, maxWidth: '38ch' }}
        >
          One newsroom for 120 entities. Filed by the people running them, read by everyone who cares where the next decade is going.
        </p>
        <span className="font-sans" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
          AIESEC News · an internal publication of the network
        </span>
      </div>
    </aside>
  );
}

/* ---------- Right rail ----------
   Live-pulse and trending widgets have no backend (omitted per product
   decision). The rail keeps the exact editorial card treatment with a
   real, static "About the desk" ink card so it never looks empty. */
function RightRail({ count }) {
  return (
    <aside className="hidden lg:flex flex-col gap-8 pt-1 sticky top-24 self-start">
      <div
        className="relative overflow-hidden flex flex-col gap-2.5"
        style={{ background: 'var(--ink)', color: '#fff', borderRadius: 6, padding: '24px 26px' }}
      >
        <HumanMark
          size={110}
          tone="white"
          style={{ position: 'absolute', right: -16, bottom: -24, opacity: 0.1, pointerEvents: 'none' }}
        />
        <div
          className="flex items-center gap-2 font-sans font-bold uppercase"
          style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)' }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--live)', boxShadow: '0 0 0 3px rgba(91,230,154,0.25)' }} />
          About the desk
        </div>
        <div className="display" style={{ fontSize: 44, color: '#fff', lineHeight: 1 }}>
          {typeof count === 'number' ? count : '—'}
        </div>
        <div className="font-sans" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
          {typeof count === 'number'
            ? <>stories on the feed right now, filed across the AIESEC network.</>
            : <>stories filed across the AIESEC network.</>}
        </div>
      </div>

      <div>
        <RuleLabel right="how it works">Reading the desk</RuleLabel>
        <p className="font-sans text-ink-soft mt-4" style={{ fontSize: 13, lineHeight: 1.6 }}>
          Every Member Committee President can file up to two stories a week. The newest sit at the top. Sign in with AIESEC EXPA to like, comment, and follow the entities you care about.
        </p>
      </div>
    </aside>
  );
}

/* ---------- States ---------- */
function FeedLoading() {
  return (
    <>
      <FeedHero />
      <div className="mx-auto max-w-feed px-10 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-[72px]">
        <main>
          <FeedSkeleton count={4} />
        </main>
        <RightRail />
      </div>
    </>
  );
}

function FeedEmpty() {
  const navigate = useNavigate();
  return (
    <>
      <FeedHero />
      <div className="mx-auto max-w-feed px-10 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-[72px]">
        <main>
          <div
            className="relative overflow-hidden flex flex-col justify-center gap-6"
            style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-light)', borderRadius: 10, padding: '72px 80px', minHeight: 480 }}
          >
            <HumanMark
              size={340}
              tone="blue"
              style={{ position: 'absolute', right: -40, bottom: -80, opacity: 0.14, pointerEvents: 'none' }}
            />
            <div className="relative z-[1] max-w-[480px] flex flex-col gap-[18px]">
              <span
                className="font-mono font-bold uppercase"
                style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent-deep)' }}
              >
                The desk is quiet
              </span>
              <h2 className="display" style={{ fontSize: 56, color: 'var(--ink)', lineHeight: 1.0 }}>
                Nothing's been <span className="display-italic" style={{ color: 'var(--accent)' }}>filed</span> yet.
              </h2>
              <p className="font-sans text-ink-soft" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '52ch' }}>
                No MCP has posted to the feed yet. When entity updates are published you'll see them here, freshest at the top.
              </p>
              <div className="flex gap-3 mt-2 flex-wrap">
                <Btn variant="primary" size="md" trailing={<ArrowIcon />} onClick={() => navigate('/login')}>
                  Sign in with EXPA
                </Btn>
                <Btn variant="outline" size="md" onClick={() => navigate('/')}>
                  Back to the front page
                </Btn>
              </div>
            </div>
          </div>
        </main>
        <RightRail count={0} />
      </div>
    </>
  );
}

function FeedError({ onRetry }) {
  const navigate = useNavigate();
  return (
    <>
      <FeedHero />
      <div className="mx-auto max-w-feed px-10 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[72px] items-start">
        <div className="flex flex-col gap-[22px]">
          <span className="eyebrow" style={{ color: 'var(--danger)' }}>The presses are jammed</span>
          <h1 className="display" style={{ fontSize: 56, color: 'var(--ink)', lineHeight: 1.02 }}>
            We couldn't <span className="display-italic" style={{ color: 'var(--danger)' }}>load</span> the feed.
          </h1>
          <p className="font-sans text-ink-soft" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '52ch' }}>
            The server may be waking up from sleep — first load can take fifteen seconds or so. Give it a moment, then try again.
          </p>
          <div className="flex gap-3 mt-2">
            <Btn variant="primary" size="lg" trailing={<ArrowIcon />} onClick={onRetry}>Try loading again</Btn>
            <Btn variant="outline" size="lg" onClick={() => navigate('/')}>Read the front page</Btn>
          </div>
          <div
            className="mt-3 font-mono"
            style={{ padding: '18px 22px', borderRadius: 8, background: 'var(--ink)', color: 'rgba(255,255,255,0.86)', fontSize: 12, lineHeight: 1.7 }}
          >
            <div><span style={{ color: '#5BE69A' }}>$</span> GET /api/feed</div>
            <div><span style={{ color: '#FFB347' }}>→</span> waiting for response …</div>
            <div><span style={{ color: '#FF6B6B' }}>✗</span> service unavailable · upstream cold</div>
          </div>
        </div>

        <div>
          <RuleLabel right="cached preview">What you'd be reading</RuleLabel>
          <div className="mt-4">
            <FeedSkeleton count={3} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Page ---------- */
export default function Feed() {
  const { data, isLoading, isError, refetch } = useFeed();

  if (isLoading) return <FeedLoading />;
  if (isError) return <FeedError onRetry={refetch} />;

  const posts = Array.isArray(data) ? data : data?.posts ?? data?.content ?? [];
  if (!posts.length) return <FeedEmpty />;

  const [feature, ...rest] = posts;
  const firstBatch = rest.slice(0, 2);
  const secondBatch = rest.slice(2);

  return (
    <>
      <FeedHero />
      <div className="mx-auto max-w-feed px-10 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-[72px]">
        <main>
          <FeaturePost post={feature} />

          {rest.length > 0 && <RuleLabel right="filed by MCP">From the entities</RuleLabel>}

          {firstBatch.map((p) => <PostRow key={p.id} post={p} />)}

          {rest.length > 0 && <DeskPromo />}

          {secondBatch.map((p) => <PostRow key={p.id} post={p} />)}

          {posts.length >= 6 && (
            <div className="flex justify-center mt-10">
              <Btn variant="outline">Load earlier stories</Btn>
            </div>
          )}
        </main>

        <RightRail count={posts.length} />
      </div>
    </>
  );
}
