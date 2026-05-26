// A single post in the feed.
//
// Interactive: the like button hits POST /api/posts/{id}/like, comments
// expand inline and post to /api/posts/{id}/comments. Engagement state
// is optimistic - the UI updates immediately, then reconciles with the
// server response.

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
  const [likePulse, setLikePulse] = useState(false);
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
    if (next) {
      setLikePulse(true);
      setTimeout(() => setLikePulse(false), 420);
    }

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
    <article className="card card-hover overflow-hidden">
      <div className="flex items-center gap-3 px-6 pt-6">
        <Avatar name={post.authorName} size={46} />
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

      <div className="px-6 pt-4">
        <h2 className="font-display font-extrabold text-xl text-ink leading-snug">
          {post.title}
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {post.mediaUrl && (
          <a
            href={post.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-aiesec hover:gap-3 transition-all"
          >
            View attachment
          </a>
        )}
      </div>

      <div className="px-6 mt-4 flex items-center gap-3 text-xs text-ink-soft">
        {likeCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-aiesec text-white text-[9px] flex items-center justify-center">
              &#9829;
            </span>
            {likeCount}
          </span>
        )}
        {commentCount > 0 && (
          <span>{commentCount} comment{commentCount === 1 ? '' : 's'}</span>
        )}
      </div>

      <div className="mt-3 px-3 py-1.5 border-t border-line flex">
        <button
          onClick={toggleLike}
          className={
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ' +
            (liked ? 'text-aiesec bg-aiesec/8' : 'text-ink-soft hover:bg-aiesec-tint')
          }
        >
          <span className={likePulse ? 'anim-pop' : ''}>
            {liked ? '\u2665' : '\u2661'}
          </span>
          Like
        </button>
        <button
          onClick={openComments}
          className={
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ' +
            (showComments ? 'text-aiesec bg-aiesec/8' : 'text-ink-soft hover:bg-aiesec-tint')
          }
        >
          Comment
        </button>
      </div>

      {showComments && (
        <div className="bg-aiesec-tint border-t border-line px-6 py-4 anim-fade-in">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder={isAuthenticated ? 'Write a comment...' : 'Log in to comment'}
              disabled={!isAuthenticated || posting}
              className="flex-1 bg-white border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-aiesec transition-colors"
            />
            <button
              onClick={submitComment}
              disabled={!isAuthenticated || posting || !draft.trim()}
              className="btn-primary px-4 py-2.5 text-sm"
            >
              {posting ? '...' : 'Send'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {comments === null && (
              <p className="text-sm text-ink-soft">Loading comments...</p>
            )}
            {comments !== null && comments.length === 0 && (
              <p className="text-sm text-ink-soft py-2">
                No comments yet - be the first to reply.
              </p>
            )}
            {comments?.map((c) => (
              <div key={c.id} className="flex gap-2.5 anim-fade-up">
                <Avatar name={c.authorName} size={34} />
                <div className="bg-white border border-line rounded-2xl px-3.5 py-2 flex-1">
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
