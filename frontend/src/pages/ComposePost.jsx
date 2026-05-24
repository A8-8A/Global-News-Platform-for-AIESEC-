// Compose page - MCP only (route-guarded).
//
// Submits a new post. The backend decides what happens next:
//  - within the weekly limit -> published (APPROVED) immediately
//  - over the limit          -> queued (PENDING) for admin approval
// The response tells us which, so we can show the right message.

import { useState } from 'react';
import { api } from '../api/client';

export default function ComposePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { status } | null
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      // Endpoint (to be implemented): POST /api/posts
      //   request:  { title, content, mediaUrl? }
      //   response: { id, status: 'APPROVED' | 'PENDING', ... }
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
      <div className="max-w-lg mx-auto bg-white rounded-lg border border-gray-200 p-6 text-center">
        <h1 className="text-lg font-bold text-gray-900 mb-2">
          {queued ? 'Post sent for approval' : 'Post published'}
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          {queued
            ? 'You have reached your weekly limit, so this post was sent to the admin approval queue.'
            : 'Your post is now live in the feed.'}
        </p>
        <button
          onClick={() => setResult(null)}
          className="text-sm text-aiesec hover:underline"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg border border-gray-200 p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">New post</h1>
      <p className="text-sm text-gray-500 mb-5">
        Up to 2 posts per week are published immediately. Additional posts go
        to the approval queue.
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
        placeholder="Headline of your update"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
        placeholder="What's the update?"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Media / link <span className="text-gray-400">(optional)</span>
      </label>
      <input
        type="url"
        value={mediaUrl}
        onChange={(e) => setMediaUrl(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-5 text-sm"
        placeholder="https://..."
      />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-aiesec text-white px-4 py-2 rounded font-medium hover:bg-aiesec-dark disabled:opacity-50"
      >
        {submitting ? 'Publishing...' : 'Publish'}
      </button>
    </div>
  );
}
