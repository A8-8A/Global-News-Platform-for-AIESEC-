// Admin console — moderation (route "/admin", guarded ADMIN). Full-bleed
// with its own dark-sidebar chrome (bypasses Layout). Three tabs, each
// backed by its own React Query hook against the live admin endpoints.
// Approve / reject go through mutations; the queue supports ⌘↩ / ⌘⌫.
// Rebuilt from screens-admin.jsx.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePendingPosts, useApprovePost, useRejectPost, useMcpActivity, useAuditLog,
} from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Avatar } from '../components/ui/Avatar';
import { Btn } from '../components/ui/Btn';
import { Pill } from '../components/ui/Pill';
import { OfficeTag } from '../components/ui/OfficeTag';
import { RuleLabel } from '../components/ui/RuleLabel';
import { Spinner, timeAgo, excerptOf } from '../components/ui/states';
import { CheckIcon } from '../components/ui/Icon';

const NAV = [
  { id: 'queue', label: 'Approval queue' },
  { id: 'mcps', label: 'MCP activity' },
  { id: 'audit', label: 'Audit log' },
];

const TAB_TITLE = {
  queue: 'Approval queue',
  mcps: 'MCP activity, last 30 days',
  audit: 'Audit log',
};

/* ============================== Chrome ============================== */
function AdminChrome({ tab, setTab, pendingCount, stats, children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full bg-paper grid grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* sidebar */}
      <aside className="flex flex-col gap-8" style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '28px 22px' }}>
        <Logo height={20} tone="white" />

        <div className="flex flex-col gap-1.5">
          <span className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(248,246,241,0.4)' }}>Console</span>
          {NAV.map((it) => {
            const isActive = it.id === tab;
            const count = it.id === 'queue' ? pendingCount : null;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setTab(it.id)}
                className="flex items-center justify-between cursor-pointer text-left"
                style={{
                  padding: '8px 10px', borderRadius: 6,
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  color: isActive ? 'var(--paper)' : 'rgba(248,246,241,0.65)',
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: isActive ? 500 : 400,
                }}
              >
                <span>{it.label}</span>
                {count != null && count > 0 && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 999,
                      background: !isActive ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                      color: !isActive ? '#fff' : 'inherit',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-3" style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.fullName || 'Admin'} size={32} />
            <div className="flex flex-col">
              <span className="font-sans" style={{ fontSize: 12, color: 'var(--paper)', fontWeight: 500 }}>{user?.fullName || 'Moderator'}</span>
              <span className="font-mono" style={{ fontSize: 10, color: 'rgba(248,246,241,0.5)', letterSpacing: '0.1em' }}>ADMIN</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); navigate('/admin/login', { replace: true }); }}
            className="font-sans underline text-left"
            style={{ fontSize: 11, color: 'rgba(248,246,241,0.55)', textUnderlineOffset: 3 }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between bg-white" style={{ borderBottom: '1px solid var(--line)', padding: '20px 32px' }}>
          <div>
            <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.16em' }}>Admin console — moderation</span>
            <h1 className="display" style={{ fontSize: 26, letterSpacing: '-0.012em', margin: '4px 0 0', color: 'var(--ink)' }}>{TAB_TITLE[tab]}</h1>
          </div>
          <div className="flex items-center gap-3">{stats}</div>
        </div>

        <div className="flex-1" style={{ padding: '28px 32px 64px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ============================== Queue ============================== */
function QueueTab({ pendingCount, setTab }) {
  const { data, isLoading, isError, refetch } = usePendingPosts();
  const approve = useApprovePost();
  const reject = useRejectPost();
  const posts = Array.isArray(data) ? data : data?.posts ?? data?.content ?? [];

  const doApprove = useCallback((id) => approve.mutate(id), [approve]);
  const doReject = useCallback((id) => {
    const note = window.prompt('Optional note to the author (leave blank to skip):') || undefined;
    reject.mutate({ id, note });
  }, [reject]);

  // ⌘↩ approve / ⌘⌫ reject on the focused queue card.
  useEffect(() => {
    function onKey(e) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const card = e.target.closest?.('[data-queue-card]') || document.activeElement?.closest?.('[data-queue-card]');
      if (!card) return;
      const id = card.getAttribute('data-queue-card');
      if (e.key === 'Enter') { e.preventDefault(); doApprove(id); }
      if (e.key === 'Backspace') { e.preventDefault(); doReject(id); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doApprove, doReject]);

  return (
    <AdminChrome
      tab="queue"
      setTab={setTab}
      pendingCount={pendingCount}
      stats={<Btn variant="outline" size="sm" onClick={() => refetch()}>Refresh</Btn>}
    >
      <p className="font-sans text-ink-soft" style={{ fontSize: 13, maxWidth: 640, margin: '0 0 24px', lineHeight: 1.5 }}>
        These posts exceeded an MCP's <strong>2-per-week</strong> publishing quota and are held for review. <strong className="text-ink">Approve</strong> to publish to the feed, or <strong className="text-ink">reject</strong> to return to the author with notes.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-3 text-ink-soft"><Spinner /> Loading queue…</div>
      ) : isError ? (
        <div className="card p-8 flex flex-col gap-3">
          <h3 className="display" style={{ fontSize: 24 }}>Couldn't load the queue.</h3>
          <Btn variant="primary" onClick={() => refetch()}>Try again</Btn>
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-10 flex flex-col gap-2">
          <RuleLabel right="all clear">Nothing pending</RuleLabel>
          <h3 className="display" style={{ fontSize: 28, color: 'var(--ink)' }}>The queue is empty.</h3>
          <p className="font-sans text-ink-soft" style={{ fontSize: 14 }}>Every filed story is live. Nothing is waiting on review.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {posts.map((p, i) => (
            <article
              key={p.id}
              data-queue-card={p.id}
              tabIndex={0}
              className="bg-white grid grid-cols-1 md:grid-cols-[60px_1fr_200px] gap-6 focus:outline-none focus:ring-2 focus:ring-accent"
              style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 24 }}
            >
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-ink-faint" style={{ fontSize: 11, letterSpacing: '0.08em' }}>{String(i + 1).padStart(2, '0')}</span>
                {p.tag === 'STATEMENT' ? <Pill tone="danger" size="sm">SENSITIVE</Pill> : <Pill tone="warn" size="sm">QUOTA</Pill>}
              </div>

              <div className="flex flex-col gap-2.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.tag && <Pill tone="ink" size="sm">{p.tag}</Pill>}
                  {p.officeCode && <OfficeTag code={p.officeCode} mode="chip" />}
                  <span className="font-mono text-ink-faint" style={{ fontSize: 11 }}>submitted {timeAgo(p.createdAt)}</span>
                </div>
                <h3 className="display" style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.25, letterSpacing: '-0.005em', color: 'var(--ink)' }}>{p.title}</h3>
                <p className="font-sans text-ink-soft" style={{ fontSize: 13, lineHeight: 1.55 }}>{p.excerpt || excerptOf(p.content)}</p>
                <div className="flex items-center gap-2.5 mt-1">
                  <Avatar name={p.authorName} size={22} />
                  <span className="font-sans text-ink" style={{ fontSize: 12, fontWeight: 500 }}>{p.authorName}</span>
                  {p.authorOffice && <span className="font-sans text-ink-faint" style={{ fontSize: 11 }}>· {p.authorOffice}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Btn variant="primary" size="md" full trailing={<CheckIcon />} onClick={() => doApprove(p.id)} disabled={approve.isPending}>Approve</Btn>
                <Btn variant="danger" size="md" full onClick={() => doReject(p.id)} disabled={reject.isPending}>Reject</Btn>
                <div className="font-mono text-ink-faint text-center mt-1" style={{ fontSize: 10, letterSpacing: '0.08em' }}>⌘↩ approve · ⌘⌫ reject</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminChrome>
  );
}

/* ============================== MCP activity ============================== */
function McpTab({ pendingCount, setTab }) {
  const { data, isLoading, isError, refetch } = useMcpActivity('30d');
  const rows = Array.isArray(data) ? data : data?.rows ?? data?.mcps ?? [];

  const totals = rows.reduce(
    (a, r) => ({
      active: a.active + 1,
      filed: a.filed + (r.total ?? 0),
      pending: a.pending + (r.pending ?? 0),
    }),
    { active: 0, filed: 0, pending: 0 }
  );

  const kpis = [
    { label: 'Active MCPs', value: totals.active || '—' },
    { label: 'Stories filed', value: totals.filed || '—' },
    { label: 'Currently pending', value: totals.pending || 0, tone: 'warn' },
    { label: 'Window', value: '30d' },
  ];

  return (
    <AdminChrome
      tab="mcps"
      setTab={setTab}
      pendingCount={pendingCount}
      stats={<Btn variant="outline" size="sm" onClick={() => refetch()}>Refresh</Btn>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white flex flex-col gap-1.5" style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '18px 20px' }}>
            <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.16em' }}>{k.label}</span>
            <span className="display" style={{ fontSize: 32, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.012em' }}>{k.value}</span>
            <span className="font-sans" style={{ fontSize: 11, color: k.tone === 'warn' ? 'var(--warn)' : 'var(--ink-soft)' }}>{k.tone === 'warn' ? 'awaiting review' : 'last 30 days'}</span>
          </div>
        ))}
      </div>

      <RuleLabel right={`${rows.length} MCPs`}>Activity by MCP</RuleLabel>

      {isLoading ? (
        <div className="flex items-center gap-3 text-ink-soft mt-4"><Spinner /> Loading activity…</div>
      ) : isError ? (
        <div className="card p-8 mt-4 flex flex-col gap-3">
          <h3 className="display" style={{ fontSize: 24 }}>Couldn't load activity.</h3>
          <Btn variant="primary" onClick={() => refetch()}>Try again</Btn>
        </div>
      ) : rows.length === 0 ? (
        <p className="font-sans text-ink-faint mt-6" style={{ fontSize: 14 }}>No MCP activity in this window yet.</p>
      ) : (
        <div className="bg-white overflow-hidden mt-4" style={{ border: '1px solid var(--line)', borderRadius: 8 }}>
          <div
            className="hidden md:grid font-mono uppercase text-ink-soft"
            style={{ gridTemplateColumns: '40px 1.4fr 0.9fr 100px 100px 100px 100px', padding: '12px 18px', background: 'var(--paper)', borderBottom: '1px solid var(--line)', fontSize: 10, letterSpacing: '0.12em' }}
          >
            <span>#</span><span>MCP</span><span>Entity</span>
            <span className="text-right">Total</span><span className="text-right">Approved</span><span className="text-right">Pending</span><span className="text-right">Rejected</span>
          </div>
          {rows.map((r, i) => {
            const total = r.total ?? 0;
            const approved = r.approved ?? 0;
            const ratio = total ? approved / total : 0;
            const name = r.mcpName || r.name || r.authorName || 'Unknown MCP';
            return (
              <div
                key={name + i}
                className="grid items-center font-sans text-ink"
                style={{ gridTemplateColumns: '40px 1.4fr 0.9fr 100px 100px 100px 100px', padding: '14px 18px', borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--line)', fontSize: 13 }}
              >
                <span className="font-mono text-ink-faint" style={{ fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="flex items-center gap-2.5"><Avatar name={name} size={26} /><span style={{ fontWeight: 500 }}>{name}</span></span>
                <span>{r.officeCode ? <OfficeTag code={r.officeCode} mode="inline" /> : <span className="text-ink-faint">{r.office || '—'}</span>}</span>
                <span className="text-right font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {total}
                  <span className="inline-block align-middle overflow-hidden" style={{ width: 60, marginLeft: 8, height: 4, background: 'rgba(11,18,32,0.08)', borderRadius: 2 }}>
                    <span className="block h-full" style={{ width: `${ratio * 100}%`, background: 'var(--accent)' }} />
                  </span>
                </span>
                <span className="text-right font-mono text-ink">{approved}</span>
                <span className="text-right font-mono" style={{ color: r.pending ? 'var(--warn)' : 'var(--ink-faint)' }}>{r.pending || '—'}</span>
                <span className="text-right font-mono" style={{ color: r.rejected ? 'var(--danger)' : 'var(--ink-faint)' }}>{r.rejected || '—'}</span>
              </div>
            );
          })}
        </div>
      )}
    </AdminChrome>
  );
}

/* ============================== Audit log ============================== */
const TONE_FOR = (action = '') => {
  const a = action.toUpperCase();
  if (a.includes('APPROV')) return 'success';
  if (a.includes('REJECT') || a.includes('DELETE')) return 'danger';
  if (a.includes('FLAG') || a.includes('QUOTA')) return 'warn';
  if (a.includes('POLICY') || a.includes('INVITE')) return 'info';
  return 'muted';
};
const TONES = {
  success: { dot: 'var(--success)', label: 'rgba(15,109,75,0.10)', fg: 'var(--success)' },
  danger: { dot: 'var(--danger)', label: 'rgba(192,40,40,0.10)', fg: 'var(--danger)' },
  warn: { dot: 'var(--warn)', label: 'rgba(184,134,11,0.10)', fg: 'var(--warn)' },
  info: { dot: 'var(--accent)', label: 'var(--accent-soft)', fg: 'var(--accent-deep)' },
  muted: { dot: 'var(--ink-faint)', label: 'rgba(11,18,32,0.05)', fg: 'var(--ink-soft)' },
};

function AuditTab({ pendingCount, setTab }) {
  const { data, isLoading, isError, refetch } = useAuditLog();
  const entries = Array.isArray(data) ? data : data?.entries ?? data?.actions ?? [];

  return (
    <AdminChrome
      tab="audit"
      setTab={setTab}
      pendingCount={pendingCount}
      stats={<Btn variant="outline" size="sm" onClick={() => refetch()}>Refresh</Btn>}
    >
      <p className="font-sans text-ink-soft" style={{ fontSize: 13, maxWidth: 640, margin: '0 0 28px', lineHeight: 1.5 }}>
        Every action taken by a moderator or the system. Append-only — entries cannot be deleted.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-3 text-ink-soft"><Spinner /> Loading log…</div>
      ) : isError ? (
        <div className="card p-8 flex flex-col gap-3">
          <h3 className="display" style={{ fontSize: 24 }}>Couldn't load the audit log.</h3>
          <Btn variant="primary" onClick={() => refetch()}>Try again</Btn>
        </div>
      ) : entries.length === 0 ? (
        <p className="font-sans text-ink-faint" style={{ fontSize: 14 }}>No moderation actions recorded yet.</p>
      ) : (
        <div className="flex flex-col">
          {entries.map((a, i) => {
            const action = a.action || a.type || 'ACTION';
            const tone = TONES[TONE_FOR(action)] || TONES.muted;
            const who = a.adminName || a.actorName || a.who || 'system';
            const isSystem = who === 'system';
            const note = a.note || a.detail || a.message || '';
            const target = a.target || (a.postId ? `post#${a.postId}` : a.targetId || '');
            const when = a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (a.t || '');
            return (
              <div
                key={a.id ?? i}
                className="grid items-center"
                style={{ gridTemplateColumns: '70px 24px 180px 1fr 200px', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--line)' }}
              >
                <span className="font-mono text-ink-soft" style={{ fontSize: 12 }}>{when}</span>
                <span className="justify-self-center" style={{ width: 10, height: 10, borderRadius: '50%', background: tone.dot, boxShadow: `0 0 0 4px ${tone.label}` }} />
                <span className="font-mono justify-self-start" style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: tone.label, color: tone.fg, letterSpacing: '0.04em' }}>{action}</span>
                <span className="font-sans text-ink" style={{ fontSize: 13 }}>
                  {note}
                  {target && <span className="font-mono text-ink-faint" style={{ marginLeft: 8, fontSize: 11 }}>→ {target}</span>}
                </span>
                <span className="flex items-center gap-2 justify-self-end">
                  {isSystem ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-ink-faint" style={{ fontSize: 11, letterSpacing: '0.08em' }}>⚙ SYSTEM</span>
                  ) : (
                    <><Avatar name={who} size={20} /><span className="font-sans text-ink-soft" style={{ fontSize: 12 }}>{who}</span></>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </AdminChrome>
  );
}

/* ============================== Page ============================== */
export default function AdminDashboard() {
  const [tab, setTab] = useState('queue');
  const { data: pending } = usePendingPosts();
  const pendingCount = (Array.isArray(pending) ? pending : pending?.posts ?? pending?.content ?? []).length;

  if (tab === 'mcps') return <McpTab pendingCount={pendingCount} setTab={setTab} />;
  if (tab === 'audit') return <AuditTab pendingCount={pendingCount} setTab={setTab} />;
  return <QueueTab pendingCount={pendingCount} setTab={setTab} />;
}
