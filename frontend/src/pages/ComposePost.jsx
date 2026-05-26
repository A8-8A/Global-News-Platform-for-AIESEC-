// Compose page (route "/compose") - MCP only (route-guarded).
//
// Submits a new post. The backend decides: within the weekly limit ->
// published immediately (APPROVED); over the limit -> queued (PENDING).
// The response status tells us which, so we show the right outcome.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Human } from '../components/Brand';

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

  /* ---- success screen ---- */
  if (result) {
    const queued = result.status === 'PENDING';
    return (
      <div className="max-w-feed mx-auto px-4 py-12">
        <div className="card anim-scale-in flex flex-col items-center text-center px-8 py-12">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
            style={{ background: queued ? '#fff4e0' : 'var(--aiesec-light)' }}
          >
            {queued ? '\u23F3' : '\uD83C\uDF89'}
          </div>
          <h1 className="font-display font-black text-2xl text-ink">
            {queued ? 'Sent for approval' : 'Post published!'}
          </h1>
          <p className="mt-2 text-sm text-ink-soft max-w-sm leading-relaxed">
            {queued
              ? 'You have reached your weekly limit, so this post was sent to the admin approval queue. It will appear in the feed once approved.'
              : 'Your update is now live in the global feed for the whole network to see.'}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setResult(null)}
              className="px-5 py-2.5 text-sm font-bold rounded-xl border border-line text-ink-soft hover:bg-aiesec-tint transition-colors"
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

  /* ---- composer ---- */
  return (
    <div className="max-w-feed mx-auto px-4 py-8">
      <div className="card overflow-hidden anim-fade-up">
        <div
          className="px-7 py-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#037EF3,#024a91)' }}
        >
          <Human className="h-14 absolute right-4 bottom-0 opacity-20" />
          <div className="relative">
            <h1 className="font-display font-black text-2xl text-white">
              Share an update
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Up to 2 posts per week publish instantly. Extra posts go to the
              approval queue.
            </p>
          </div>
        </div>

        <div className="px-7 py-7">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 anim-fade-in">
              {error}
            </div>
          )}

          <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline of your update"
            className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:border-aiesec transition-colors"
          />

          <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="What's the update? Share the story with the network..."
            className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:border-aiesec transition-colors resize-y"
          />

          <label className="block text-xs font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Media or link <span className="text-ink-soft/50 normal-case">(optional)</span>
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-6 outline-none focus:border-aiesec transition-colors"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-3.5"
          >
            {submitting ? 'Publishing...' : 'Publish update'}
          </button>
        </div>
      </div>
    </div>
  );
}
