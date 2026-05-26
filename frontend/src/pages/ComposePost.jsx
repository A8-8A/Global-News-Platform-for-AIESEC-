// Compose page (route "/compose") - MCP only (route-guarded).
// Backend decides: within the weekly limit -> published (APPROVED);
// over it -> queued (PENDING). The response status tells us which.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ComposePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      const post = await api.post('/api/posts', {
        title: title.trim(),
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || null,
      });
      setResult(post);
      setTitle('');
      setContent('');
      setMediaUrl('');
    } catch (e) {
      setError(e.message || 'Could not create the post.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const queued = result.status === 'PENDING';
    return (
      <div className="max-w-feed mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <h1 className="font-display font-extrabold text-xl text-ink">
            {queued ? 'Sent for approval' : 'Post published'}
          </h1>
          <p className="mt-2 text-sm text-ink-soft max-w-sm mx-auto leading-relaxed">
            {queued
              ? 'You have reached your weekly limit, so this post was sent to the admin approval queue. It will appear in the feed once approved.'
              : 'Your update is now live in the global feed.'}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => setResult(null)}
              className="btn-outline px-5 py-2.5 text-sm"
            >
              Write another
            </button>
            <Link to="/feed" className="btn-primary px-5 py-2.5 text-sm">
              Go to feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-feed mx-auto px-4 py-8">
      <div className="card p-7">
        <h1 className="font-display font-extrabold text-2xl text-ink">
          New post
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Up to 2 posts per week are published immediately. Further posts go
          to the approval queue.
        </p>

        {error && (
          <div className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mt-5 mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline of your update"
          className="w-full border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-aiesec"
        />

        <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mt-4 mb-1.5">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Share the update with the network"
          className="w-full border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-aiesec resize-y"
        />

        <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mt-4 mb-1.5">
          Media or link (optional)
        </label>
        <input
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-aiesec"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full mt-6 py-3"
        >
          {submitting ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
