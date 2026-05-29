// Feed — the newsroom (route "/feed"). Inside <Layout>.
// Two-column on lg+: left = editorial column, right = interactive globe.
// States (loading / empty / error) stay single-column.

import { useFeed } from '../lib/queries';
import { FeaturePost, PostRow } from '../components/PostCard';
import { RuleLabel } from '../components/ui/RuleLabel';
import { Btn } from '../components/ui/Btn';
import { HumanMark } from '../components/ui/Logo';
import { FeedSkeleton } from '../components/ui/states';
import { ArrowIcon } from '../components/ui/Icon';
import GlobeRail from '../components/GlobeRail';
import { useNavigate } from 'react-router-dom';

function todayEyebrow() {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    }).format(new Date());
  } catch { return 'Today'; }
}

function FeedHero() {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-feed px-10 pt-14 pb-8">
        <span className="eyebrow">{todayEyebrow()}</span>
        <h1 className="display mt-3.5" style={{ fontSize: 56, color: 'var(--ink)', maxWidth: '14ch' }}>
          The desk, <span className="display-italic" style={{ color: 'var(--accent)' }}>today.</span>
        </h1>
      </div>
    </div>
  );
}

function FeedLoading() {
  return (
    <>
      <FeedHero />
      <div className="mx-auto max-w-feed px-10 pt-8 pb-16">
        <FeedSkeleton count={4} />
      </div>
    </>
  );
}

function FeedEmpty() {
  const navigate = useNavigate();
  return (
    <>
      <FeedHero />
      <div className="mx-auto max-w-feed px-10 pt-8 pb-16">
        <div
          className="relative overflow-hidden flex flex-col justify-center gap-6"
          style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-light)', borderRadius: 10, padding: '72px 80px', minHeight: 480 }}
        >
          <HumanMark size={340} tone="blue" style={{ position: 'absolute', right: -40, bottom: -80, opacity: 0.14, pointerEvents: 'none' }} />
          <div className="relative z-[1] max-w-[480px] flex flex-col gap-[18px]">
            <span className="font-mono font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent-deep)' }}>The desk is quiet</span>
            <h2 className="display" style={{ fontSize: 56, color: 'var(--ink)', lineHeight: 1.0 }}>
              Nothing's been <span className="display-italic" style={{ color: 'var(--accent)' }}>filed</span> yet.
            </h2>
            <p className="font-sans text-ink-soft" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '52ch' }}>
              No MCP has posted to the feed yet. When entity updates are published you'll see them here, freshest at the top.
            </p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <Btn variant="primary" size="md" trailing={<ArrowIcon />} onClick={() => navigate('/login')}>Sign in with EXPA</Btn>
              <Btn variant="outline" size="md" onClick={() => navigate('/')}>Back to the front page</Btn>
            </div>
          </div>
        </div>
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
            The server may be waking up from sleep — first load can take fifteen seconds.
          </p>
          <div className="flex gap-3 mt-2">
            <Btn variant="primary" size="lg" trailing={<ArrowIcon />} onClick={onRetry}>Try loading again</Btn>
            <Btn variant="outline" size="lg" onClick={() => navigate('/')}>Read the front page</Btn>
          </div>
          <div className="mt-3 font-mono" style={{ padding: '18px 22px', borderRadius: 8, background: 'var(--ink)', color: 'rgba(255,255,255,0.86)', fontSize: 12, lineHeight: 1.7 }}>
            <div><span style={{ color: '#5BE69A' }}>$</span> GET /api/feed</div>
            <div><span style={{ color: '#FFB347' }}>→</span> waiting for response …</div>
            <div><span style={{ color: '#FF6B6B' }}>✗</span> service unavailable · upstream cold</div>
          </div>
        </div>
        <div>
          <RuleLabel right="cached preview">What you'd be reading</RuleLabel>
          <div className="mt-4"><FeedSkeleton count={3} /></div>
        </div>
      </div>
    </>
  );
}

export default function Feed() {
  const { data, isLoading, isError, refetch } = useFeed();

  if (isLoading) return <FeedLoading />;
  if (isError)   return <FeedError onRetry={refetch} />;

  const posts = Array.isArray(data) ? data : data?.posts ?? data?.content ?? [];
  if (!posts.length) return <FeedEmpty />;

  const [feature, ...rest] = posts;

  return (
    <>
      <FeedHero />
      <div className="mx-auto max-w-feed px-10 pt-8 pb-16 flex gap-[72px] items-start">
        {/* editorial column */}
        <main className="flex-1 min-w-0">
          <FeaturePost post={feature} />
          {rest.length > 0 && <RuleLabel right="filed by MCP">From the entities</RuleLabel>}
          {rest.map(p => <PostRow key={p.id} post={p} />)}
          {posts.length >= 6 && (
            <div className="flex justify-center mt-10">
              <Btn variant="outline">Load earlier stories</Btn>
            </div>
          )}
        </main>

        {/* globe rail — hidden below lg, sticky */}
        <GlobeRail />
      </div>
    </>
  );
}
