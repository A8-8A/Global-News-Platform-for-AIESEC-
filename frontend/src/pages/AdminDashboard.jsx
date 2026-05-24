// Admin dashboard - ADMIN only (route-guarded).
//
// MVP scope for this screen: the approval queue. An admin sees posts
// with status PENDING and approves or rejects each one.
//
// Other admin powers from the spec (delete posts/comments, view MCP
// posting activity) will get their own sections - kept minimal here.

import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  function load() {
    setStatus('loading');
    // Endpoint (to be implemented): GET /api/admin/posts/pending
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
    // Endpoint (to be implemented):
    //   POST /api/admin/posts/{id}/approve
    //   POST /api/admin/posts/{id}/reject
    try {
      await api.post(`/api/admin/posts/${postId}/${decision}`);
      // Drop the resolved post from the list.
      setPending((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // keep it simple for the scaffold; refresh on failure
      load();
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Approval queue</h1>
      <p className="text-sm text-gray-500 mb-5">
        Posts that exceeded an MCP's weekly limit. Approve to publish, reject
        to discard.
      </p>

      {status === 'loading' && (
        <p className="text-gray-500">Loading...</p>
      )}

      {status === 'error' && (
        <p className="text-gray-500">Could not load the queue.</p>
      )}

      {status === 'ready' && pending.length === 0 && (
        <p className="text-gray-500">Nothing pending. All caught up.</p>
      )}

      {status === 'ready' && pending.length > 0 && (
        <div className="space-y-4">
          {pending.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <h2 className="font-bold text-gray-900">{post.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {post.authorName}
                {post.authorOffice ? ` · ${post.authorOffice}` : ''}
              </p>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                {post.content}
              </p>

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
      )}
    </div>
  );
}
