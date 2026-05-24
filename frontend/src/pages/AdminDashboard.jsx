// Admin dashboard - ADMIN only (route-guarded).
//
// Three tabs, matching the backend's admin capabilities:
//   Queue     - pending posts; approve / reject
//   MCPs      - per-MCP posting activity summary
//   Audit log - the full trail of admin actions
//
// Backend endpoints used (all under /api/admin, ADMIN-only):
//   GET    /api/admin/posts/pending
//   POST   /api/admin/posts/{id}/approve
//   POST   /api/admin/posts/{id}/reject
//   DELETE /api/admin/posts/{id}
//   GET    /api/admin/mcp-activity
//   GET    /api/admin/audit-log

import { useEffect, useState } from 'react';
import { api } from '../api/client';

const TABS = [
  { id: 'queue', label: 'Approval queue' },
  { id: 'mcps', label: 'MCP activity' },
  { id: 'audit', label: 'Audit log' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('queue');

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Admin dashboard</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-2 text-sm font-medium -mb-px border-b-2 ' +
              (tab === t.id
                ? 'border-aiesec text-aiesec'
                : 'border-transparent text-gray-500 hover:text-gray-700')
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

// ---------------------------------------------------------------------
// Tab 1: Approval queue
// ---------------------------------------------------------------------

function ApprovalQueue() {
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState('loading');

  function load() {
    setStatus('loading');
    api
      .get('/api/admin/posts/pending')
      .then((data) => {
        setPending(data || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(load, []);

  async function decide(postId, decision) {
    try {
      await api.post(`/api/admin/posts/${postId}/${decision}`);
      setPending((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      load();
    }
  }

  if (status === 'loading') return <Muted>Loading...</Muted>;
  if (status === 'error') return <Muted>Could not load the queue.</Muted>;
  if (pending.length === 0) return <Muted>Nothing pending. All caught up.</Muted>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Posts that exceeded an MCP's weekly limit. Approve to publish, reject
        to send back to the MCP.
      </p>
      {pending.map((post) => (
        <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900">{post.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {post.authorName}
            {post.authorOffice ? ` · ${post.authorOffice}` : ''}
            {post.createdAt ? ` · ${fmt(post.createdAt)}` : ''}
          </p>
          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
            {post.content}
          </p>
          {post.mediaUrl && (
            <a
              href={post.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-aiesec hover:underline mt-1 inline-block"
            >
              View attachment
            </a>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => decide(post.id, 'approve')}
              className="bg-aiesec text-white px-3 py-1.5 rounded text-sm hover:bg-aiesec-dark"
            >
              Approve
            </button>
            <button
              onClick={() => decide(post.id, 'reject')}
              className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// Tab 2: MCP activity
// ---------------------------------------------------------------------

function McpActivity() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api
      .get('/api/admin/mcp-activity')
      .then((data) => {
        setRows(data || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <Muted>Loading...</Muted>;
  if (status === 'error') return <Muted>Could not load MCP activity.</Muted>;
  if (rows.length === 0) return <Muted>No MCPs have signed in yet.</Muted>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-2 font-medium">MCP</th>
            <th className="px-4 py-2 font-medium">Office</th>
            <th className="px-4 py-2 font-medium text-right">Total</th>
            <th className="px-4 py-2 font-medium text-right">Approved</th>
            <th className="px-4 py-2 font-medium text-right">Pending</th>
            <th className="px-4 py-2 font-medium text-right">Rejected</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.mcpId} className="border-t border-gray-100">
              <td className="px-4 py-2 text-gray-900">{r.mcpName}</td>
              <td className="px-4 py-2 text-gray-500">{r.office || '—'}</td>
              <td className="px-4 py-2 text-right">{r.totalPosts}</td>
              <td className="px-4 py-2 text-right">{r.approvedPosts}</td>
              <td className="px-4 py-2 text-right">{r.pendingPosts}</td>
              <td className="px-4 py-2 text-right">{r.rejectedPosts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------
// Tab 3: Audit log
// ---------------------------------------------------------------------

function AuditLog() {
  const [actions, setActions] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api
      .get('/api/admin/audit-log')
      .then((data) => {
        setActions(data || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <Muted>Loading...</Muted>;
  if (status === 'error') return <Muted>Could not load the audit log.</Muted>;
  if (actions.length === 0) return <Muted>No admin actions recorded yet.</Muted>;

  return (
    <div className="space-y-2">
      {actions.map((a) => (
        <div
          key={a.id}
          className="bg-white rounded border border-gray-200 px-4 py-2.5 text-sm"
        >
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">{a.action}</span>
            <span className="text-gray-400">{fmt(a.createdAt)}</span>
          </div>
          <p className="text-gray-600 mt-0.5">
            {a.detail || `${a.targetType} #${a.targetId}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">by {a.adminName}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------

function Muted({ children }) {
  return <p className="text-gray-500">{children}</p>;
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '';
  }
}
