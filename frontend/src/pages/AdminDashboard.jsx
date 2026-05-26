// Admin dashboard (route "/admin") - ADMIN only (route-guarded).
// Three tabs: approval queue, MCP activity, audit log.

import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { FeedSkeleton, EmptyState, ErrorState, Spinner, timeAgo } from '../components/ui';
import { Avatar } from '../components/Brand';

const TABS = [
  { id: 'queue', label: 'Approval queue' },
  { id: 'mcps', label: 'MCP activity' },
  { id: 'audit', label: 'Audit log' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('queue');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display font-extrabold text-2xl text-ink">
        Admin dashboard
      </h1>
      <p className="text-sm text-ink-soft mt-0.5">
        Moderate content and keep the feed accurate.
      </p>

      {/* tabs */}
      <div className="flex gap-1 border-b border-line mt-5 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-2.5 text-sm font-bold -mb-px border-b-2 ' +
              (tab === t.id
                ? 'border-aiesec text-aiesec'
                : 'border-transparent text-ink-soft hover:text-ink')
            }
          >
            {t.label}
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
        title="All caught up"
        message="No posts are waiting for review."
      />
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        {pending.length} post{pending.length === 1 ? '' : 's'} exceeded an
        MCP's weekly limit and need a decision.
      </p>
      {pending.map((post) => (
        <div key={post.id} className="card p-5">
          <div className="flex items-center gap-3">
            <Avatar name={post.authorName} size={40} />
            <div className="min-w-0">
              <p className="font-display font-extrabold text-ink truncate">
                {post.authorName}
              </p>
              <p className="text-xs text-ink-soft truncate">
                {post.authorOffice ? `${post.authorOffice} - ` : ''}
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <h3 className="font-display font-extrabold text-base text-ink mt-3">
            {post.title}
          </h3>
          <p className="text-sm text-ink-soft mt-1 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
          {post.mediaUrl && (
            <a
              href={post.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-aiesec mt-1.5 inline-block hover:underline"
            >
              View attachment
            </a>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => decide(post.id, 'approve')}
              disabled={acting === post.id}
              className="btn-primary px-5 py-2 text-sm"
            >
              Approve
            </button>
            <button
              onClick={() => decide(post.id, 'reject')}
              disabled={acting === post.id}
              className="px-5 py-2 text-sm font-bold rounded border border-line text-ink-soft hover:text-ink"
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
    return <EmptyState title="No MCPs yet" message="No MCPs have signed in so far." />;

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1.6fr_repeat(4,1fr)] gap-2 px-4 py-2.5 border-b border-line text-[11px] font-bold uppercase tracking-wide text-ink-soft">
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
            'grid grid-cols-[1.6fr_repeat(4,1fr)] gap-2 px-4 py-3 items-center text-sm ' +
            (i + 1 < rows.length ? 'border-b border-line' : '')
          }
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={r.mcpName} size={30} />
            <div className="min-w-0">
              <p className="font-bold text-ink truncate">{r.mcpName}</p>
              <p className="text-xs text-ink-soft truncate">{r.office || '-'}</p>
            </div>
          </div>
          <span className="text-right font-bold text-ink">{r.totalPosts}</span>
          <span className="text-right font-bold text-ink">{r.approvedPosts}</span>
          <span className="text-right font-bold text-ink">{r.pendingPosts}</span>
          <span className="text-right font-bold text-ink">{r.rejectedPosts}</span>
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
    return <EmptyState title="No actions logged" message="Admin actions will appear here." />;

  return (
    <div className="space-y-2">
      {actions.map((a) => (
        <div key={a.id} className="card px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display font-extrabold text-sm text-ink">
              {a.action}
            </span>
            <span className="text-xs text-ink-soft shrink-0">
              {timeAgo(a.createdAt)}
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-0.5">
            {a.detail || `${a.targetType} #${a.targetId}`}
          </p>
          <p className="text-xs text-ink-soft mt-1">by {a.adminName}</p>
        </div>
      ))}
    </div>
  );
}
