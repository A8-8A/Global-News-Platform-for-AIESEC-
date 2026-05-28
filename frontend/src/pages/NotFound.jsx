// 404 — Not Found (route "*", inside <Layout>). Editorial treatment with
// a giant 404 and a "from today's desk" card pulling the real top 3
// posts. Rebuilt from screens-misc.jsx <NotFoundScreen> (the TopNav +
// footer come from Layout).

import { Link, useNavigate } from 'react-router-dom';
import { useFeed } from '../lib/queries';
import { HumanMark } from '../components/ui/Logo';
import { OfficeTag } from '../components/ui/OfficeTag';
import { RuleLabel } from '../components/ui/RuleLabel';
import { Btn } from '../components/ui/Btn';
import { ArrowIcon } from '../components/ui/Icon';
import { timeAgo } from '../components/ui/states';

export default function NotFound() {
  const navigate = useNavigate();
  const { data } = useFeed({ limit: 3 });
  const posts = (Array.isArray(data) ? data : data?.posts ?? data?.content ?? []).slice(0, 3);

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-feed w-full px-10 py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[80px] items-center">
        {/* left — editorial */}
        <div className="flex flex-col gap-7">
          <span className="eyebrow">Off the desk · not found</span>
          <div className="display flex items-baseline gap-1.5" style={{ fontSize: 220, color: 'var(--accent)', lineHeight: 0.88, letterSpacing: '-0.04em' }}>
            4<span className="display-italic" style={{ color: 'var(--ink)', opacity: 0.95 }}>0</span>4
          </div>

          <h1 className="display" style={{ fontSize: 48, color: 'var(--ink)', lineHeight: 1.04, maxWidth: '16ch' }}>
            This story <span className="display-italic" style={{ color: 'var(--accent)' }}>was never filed.</span>
          </h1>

          <p className="font-sans text-ink-soft" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '52ch' }}>
            The URL you followed doesn't match anything on the desk. The post may have been removed during moderation, or the link may simply be a typo.
          </p>

          <div className="flex gap-3 mt-1.5 flex-wrap">
            <Btn variant="primary" size="lg" trailing={<ArrowIcon />} onClick={() => navigate('/feed')}>Take me to the feed</Btn>
            <Btn variant="outline" size="lg" onClick={() => navigate('/')}>Back to the front page</Btn>
          </div>

          <div className="flex gap-5 mt-3 font-sans text-ink-faint" style={{ paddingTop: 18, borderTop: '1px solid var(--line)', fontSize: 12 }}>
            <span className="font-mono" style={{ letterSpacing: '0.14em' }}>ERR · ROUTE_UNMATCHED</span>
            <span>If you arrived from a shared link, ping the sender — their post may have been pulled.</span>
          </div>
        </div>

        {/* right — related card */}
        <aside
          className="relative overflow-hidden flex flex-col gap-5.5"
          style={{ background: 'var(--paper-soft)', borderRadius: 10, padding: '32px 32px 28px', border: '1px solid var(--line)', gap: 22 }}
        >
          <HumanMark size={220} tone="blue" style={{ position: 'absolute', right: -50, bottom: -60, opacity: 0.08, pointerEvents: 'none' }} />
          <div className="relative z-[1]">
            <RuleLabel right="while you're here">From today's desk</RuleLabel>
            <div className="flex flex-col mt-3">
              {posts.length === 0 ? (
                <p className="font-sans text-ink-faint py-4" style={{ fontSize: 13 }}>Nothing on the desk yet.</p>
              ) : (
                posts.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/feed/${p.id}`}
                    className="grid grid-cols-1 gap-1.5 no-underline cursor-pointer"
                    style={{ padding: '16px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}
                  >
                    <div className="flex gap-2 items-center">
                      {p.officeCode && <OfficeTag code={p.officeCode} mode="chip" />}
                      {p.tag && <span className="font-sans font-bold text-accent-deep" style={{ fontSize: 10, letterSpacing: '0.12em' }}>{p.tag}</span>}
                    </div>
                    <h3 className="display" style={{ fontSize: 17, color: 'var(--ink)', fontWeight: 700, lineHeight: 1.25 }}>{p.title}</h3>
                    <div className="font-sans text-ink-faint" style={{ fontSize: 11 }}>{p.authorName} · {timeAgo(p.createdAt)}</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
