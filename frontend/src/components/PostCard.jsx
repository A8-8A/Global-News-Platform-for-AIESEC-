// A single post in the feed.
//
// Interactive: like button hits POST /api/posts/{id}/like; comments
// expand inline and post to /api/posts/{id}/comments. Engagement is
// optimistic - UI updates first, then reconciles with the server.
// Static styling - no animation.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Brand';
import { timeAgo } from './ui';

export default function PostCard({ post }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(!!post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [busyLike, setBusyLike] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  async function toggleLike() {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (busyLike) return;
    setBusyLike(true);

    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));

    try {
      const res = await api.post(`/api/posts/${post.id}/like`);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setBusyLike(false);
    }
  }

  async function openComments() {
    const opening = !showComments;
    setShowComments(opening);
    if (opening && comments === null) {
      try {
        const detail = await api.get(`/api/feed/${post.id}`);
        setComments(detail.comments || []);
        setCommentCount((detail.comments || []).length);
      } catch {
        setComments([]);
      }
    }
  }

  async function submitComment() {
    if (!isAuthenticated) { navigate('/login'); return; }
    const text = draft.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const created = await api.post(`/api/posts/${post.id}/comments`, {
        content: text,
      });
      setComments((cs) => [...(cs || []), created]);
      setCommentCount((c) => c + 1);
      setDraft('');
    } catch {
      /* keep draft for retry */
    } finally {
      setPosting(false);
    }
  }

  return (
    <article className="card overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <Avatar name={post.authorName} size={44} />
        <div className="min-w-0">
          <p className="font-display font-extrabold text-ink leading-tight truncate">
            {post.authorName || 'AIESEC'}
          </p>
          <p className="text-xs text-ink-soft truncate">
            {post.authorOffice ? `${post.authorOffice} - ` : ''}
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>

      {/* body */}
      <div className="px-5 pt-3">
        <h2 className="font-display font-extrabold text-lg text-ink leading-snug">
          {post.title}
        </h2>
        <p className="mt-1.5 text-[15px] text-ink-soft leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {post.mediaUrl && (
          <a
            href={post.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-bold text-aiesec hover:underline"
          >
            View attachment
          </a>
        )}
      </div>

      {/* counts */}
      {(likeCount > 0 || commentCount > 0) && (
        <div className="px-5 mt-3 flex items-center gap-3 text-xs text-ink-soft">
          {likeCount > 0 && <span>{likeCount} like{likeCount === 1 ? '' : 's'}</span>}
          {commentCount > 0 && (
            <span>{commentCount} comment{commentCount === 1 ? '' : 's'}</span>
          )}
        </div>
      )}

      {/* action bar */}
      <div className="mt-3 px-2 py-1 border-t border-line flex">
        <button
          onClick={toggleLike}
          className={
            'flex-1 py-2.5 rounded text-sm font-bold ' +
            (liked ? 'text-aiesec' : 'text-ink-soft hover:bg-[#f4f9ff]')
          }
        >
          {liked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={openComments}
          className={
            'flex-1 py-2.5 rounded text-sm font-bold ' +
            (showComments ? 'text-aiesec' : 'text-ink-soft hover:bg-[#f4f9ff]')
          }
        >
          Comment
        </button>
      </div>

      {/* comments */}
      {showComments && (
        <div className="border-t border-line px-5 py-4 bg-white">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder={isAuthenticated ? 'Write a comment' : 'Log in to comment'}
              disabled={!isAuthenticated || posting}
              className="flex-1 border border-line rounded px-3 py-2 text-sm outline-none focus:border-aiesec"
            />
            <button
              onClick={submitComment}
              disabled={!isAuthenticated || posting || !draft.trim()}
              className="btn-primary px-4 py-2 text-sm"
            >
              Send
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {comments === null && (
              <p className="text-sm text-ink-soft">Loading comments...</p>
            )}
            {comments !== null && comments.length === 0 && (
              <p className="text-sm text-ink-soft py-1">
                No comments yet.
              </p>
            )}
            {comments?.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar name={c.authorName} size={32} />
                <div className="border border-line rounded px-3 py-2 flex-1">
                  <p className="text-xs font-bold text-ink">
                    {c.authorName}
                    <span className="text-ink-soft font-normal ml-2">
                      {timeAgo(c.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm text-ink-soft mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
