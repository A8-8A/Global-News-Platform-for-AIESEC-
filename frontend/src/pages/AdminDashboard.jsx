// Admin dashboard (route "/admin") - ADMIN only (route-guarded).
//
// Three tabs over the backend's admin capabilities:
//   Queue     - pending posts; approve / reject
//   MCPs      - per-MCP posting activity
//   Audit log - the full trail of admin actions

import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import {
  FeedSkeleton,
  EmptyState,
  ErrorState,
  Spinner,
  timeAgo,
} from '../components/ui';
import { Avatar } from '../components/Brand';

const TABS = [
  { id: 'queue', label: 'Approval queue', icon: '\u{1F4E5}' },
  { id: 'mcps', label: 'MCP activity', icon: '\u{1F4CA}' },
  { id: 'audit', label: 'Audit log', icon: '\u{1F4DC}' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('queue');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div
        className="rounded-2xl px-6 py-6 mb-5 relative overflow-hidden anim-fade-up"
        style={{ background: 'linear-gradient(135deg,#0d1b2a,#024a91)' }}
      >
        <div className="blob" style={{ width: 180, height: 180, background: '#037EF3', top: -70, right: -40, opacity: 0.5 }} />
        <div className="relative">
          <h1 className="font-display font-black text-2xl text-white">
            Admin dashboard
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Moderate content and keep the feed trustworthy.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ' +
              (tab === t.id
                ? 'bg-aiesec text-white shadow-glow'
                : 'bg-white border border-line text-ink-soft hover:border-aiesec/40')
            }
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'queue' && <ApprovalQueue />}
      {tab === 'mcps' && <McpActivity />}
      {tab === 'audit' && <AuditLog />}
    </div>
  );
}

function ApprovalQueue() {
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState('loading');
  const [acting, setActing] = useState(null);

  const load = useCallback(() => {
    setStatus('loading');
    api
      .get('/api/admin/posts/pending')
      .then((data) => { setPending(data || []); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(load, [load]);

  async function decide(postId, decision) {
    setActing(postId);
    try {
      await api.post(`/api/admin/posts/${postId}/${decision}`);
      setPending((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      load();
    } finally {
      setActing(null);
    }
  }

  if (status === 'loading') return <FeedSkeleton count={3} />;
  if (status === 'error')
    return <ErrorState message="Could not load the approval queue." onRetry={load} />;
  if (pending.length === 0)
    return (
      <EmptyState
        icon={'\u2705'}
        title="All caught up"
        message="No posts are waiting for review. The queue is clear."
      />
    );

  return (
    <div className="space-y-4 stagger">
      <p className="text-sm text-ink-soft">
        {pending.length} post{pending.length === 1 ? '' : 's'} exceeded an
        MCP's weekly limit and need a decision.
      </p>
      {pending.map((post) => (
        <div key={post.id} className="card p-6">
          <div className="flex items-center gap-3">
            <Avatar name={post.authorName} size={42} />
            <div className="min-w-0">
              <p className="font-display font-extrabold text-ink truncate">
                {post.authorName}
              </p>
              <p className="text-xs text-ink-soft truncate">
                {post.authorOffice ? `${post.authorOffice} - ` : ''}
                {timeAgo(post.createdAt)}
              </p>
            </div>
            <span className="ml-auto text-[11px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Pending
            </span>
          </div>

          <h3 className="font-display font-extrabold text-lg text-ink mt-4">
            {post.title}
          </h3>
          <p className="text-sm text-ink-soft mt-1.5 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
          {post.mediaUrl && (
            <a
              href={post.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-aiesec mt-2 inline-block"
            >
              View attachment
            </a>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={() => decide(post.id, 'approve')}
              disabled={acting === post.id}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              {acting === post.id ? '...' : 'Approve'}
            </button>
            <button
              onClick={() => decide(post.id, 'reject')}
              disabled={acting === post.id}
              className="px-5 py-2.5 text-sm font-bold rounded-xl border border-line text-ink-soft hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function McpActivity() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(() => {
    setStatus('loading');
    api
      .get('/api/admin/mcp-activity')
      .then((data) => { setRows(data || []); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(load, [load]);

  if (status === 'loading') return <Spinner label="Loading MCP activity..." />;
  if (status === 'error')
    return <ErrorState message="Could not load MCP activity." onRetry={load} />;
  if (rows.length === 0)
    return (
      <EmptyState
        icon={'\u{1F465}'}
        title="No MCPs yet"
        message="No MCPs have signed in to the platform so far."
      />
    );

  return (
    <div className="card overflow-hidden anim-fade-up">
      <div className="grid grid-cols-[1.6fr_repeat(4,1fr)] gap-2 px-5 py-3 bg-aiesec-tint text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        <span>MCP</span>
        <span className="text-right">Total</span>
        <span className="text-right">Live</span>
        <span className="text-right">Pending</span>
        <span className="text-right">Rejected</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.mcpId}
          className={
            'grid grid-cols-[1.6fr_repeat(4,1fr)] gap-2 px-5 py-3.5 items-center text-sm ' +
            (i % 2 ? 'bg-white' : 'bg-aiesec-tint/40')
          }
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={r.mcpName} size={32} />
            <div className="min-w-0">
              <p className="font-bold text-ink truncate">{r.mcpName}</p>
              <p className="text-xs text-ink-soft truncate">{r.office || '-'}</p>
            </div>
          </div>
          <span className="text-right font-bold text-ink">{r.totalPosts}</span>
          <span className="text-right text-aiesec font-bold">{r.approvedPosts}</span>
          <span className="text-right text-amber-600 font-bold">{r.pendingPosts}</span>
          <span className="text-right text-ink-soft font-bold">{r.rejectedPosts}</span>
        </div>
      ))}
    </div>
  );
}

function AuditLog() {
  const [actions, setActions] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(() => {
    setStatus('loading');
    api
      .get('/api/admin/audit-log')
      .then((data) => { setActions(data || []); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(load, [load]);

  if (status === 'loading') return <Spinner label="Loading audit log..." />;
  if (status === 'error')
    return <ErrorState message="Could not load the audit log." onRetry={load} />;
  if (actions.length === 0)
    return (
      <EmptyState
        icon={'\u{1F4DC}'}
        title="No actions logged"
        message="Admin actions will be recorded here as they happen."
      />
    );

  return (
    <div className="space-y-2.5 stagger">
      {actions.map((a) => (
        <div key={a.id} className="card px-5 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display font-extrabold text-sm text-aiesec">
              {a.action}
            </span>
            <span className="text-xs text-ink-soft/70 shrink-0">
              {timeAgo(a.createdAt)}
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-0.5">
            {a.detail || `${a.targetType} #${a.targetId}`}
          </p>
          <p className="text-xs text-ink-soft/70 mt-1">by {a.adminName}</p>
        </div>
      ))}
    </div>
  );
}
