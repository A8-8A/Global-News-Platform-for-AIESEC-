// Post detail — full article + comments (route "/feed/:id"). Inside <Layout>.
// Article byline and comment author names/avatars link to /profile/:id.

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePost, useToggleLike, usePostComment } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Photo } from '../components/ui/Photo';
import { Pill } from '../components/ui/Pill';
import { OfficeTag } from '../components/ui/OfficeTag';
import { Avatar } from '../components/ui/Avatar';
import { Btn } from '../components/ui/Btn';
import { RuleLabel } from '../components/ui/RuleLabel';
import { FeedSkeleton, timeAgo, excerptOf } from '../components/ui/states';
import { HeartIcon, HeartFillIcon, CommentIcon, ShareIcon, BookmarkIcon, ArrowIcon } from '../components/ui/Icon';

function flagEmoji(code) {
  if (!code || code.length !== 2) return null;
  const upper = code.toUpperCase();
  return String.fromCodePoint(...upper.split('').map((c) => 0x1f1e0 - 65 + c.charCodeAt(0)));
}

function ArticleBody({ content }) {
  const paras = String(content || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (!paras.length) return (
    <p className="font-sans text-ink-soft" style={{ fontSize: 18, lineHeight: 1.7 }}>No further detail was filed with this story.</p>
  );
  return paras.map((p, i) => (
    <p key={i} className="font-sans text-ink" style={{ fontSize: 18, lineHeight: 1.7, margin: i === paras.length - 1 ? 0 : '0 0 22px' }}>{p}</p>
  ));
}

function Comment({ c, isFirst }) {
  const name = c.authorName || c.author || 'Member';
  const to = c.authorId ? `/profile/${c.authorId}` : null;
  const flag = flagEmoji(c.officeCode || null);

  return (
    <div className="grid grid-cols-[40px_1fr] gap-3.5 py-5" style={{ borderTop: isFirst ? 'none' : '1px solid var(--line)' }}>
      {to ? (
        <Link to={to}><Avatar name={name} src={c.authorPhotoUrl || undefined} size={40} /></Link>
      ) : (
        <Avatar name={name} src={c.authorPhotoUrl || undefined} size={40} />
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {to ? (
            <Link to={to} className="font-sans font-bold text-ink no-underline hover:underline" style={{ fontSize: 13 }}>
              {name}
            </Link>
          ) : (
            <span className="font-sans font-bold text-ink" style={{ fontSize: 13 }}>{name}</span>
          )}
          {flag && <span style={{ fontSize: 16 }}>{flag}</span>}
          {c.authorOffice && (
            <span className="font-sans font-bold text-ink-soft" style={{ fontSize: 11, letterSpacing: '0.08em' }}>· {c.authorOffice}</span>
          )}
          {c.authorRole === 'ADMIN' && <Pill tone="accent" size="sm">moderator</Pill>}
          <span className="ml-auto font-mono text-ink-faint" style={{ fontSize: 11 }}>{timeAgo(c.createdAt)}</span>
        </div>
        <p className="font-sans text-ink" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{c.content}</p>
        <div className="flex gap-[18px] mt-1 font-sans text-ink-soft" style={{ fontSize: 12 }}>
          <span className="inline-flex items-center gap-1 cursor-pointer hover:text-accent-deep"><HeartIcon /> <span>{c.likeCount ?? 0}</span></span>
          <span className="cursor-pointer hover:text-accent-deep">Reply</span>
        </div>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data, isLoading, isError, refetch } = usePost(id);
  const toggleLike = useToggleLike(id);
  const postComment = usePostComment(id);
  const [draft, setDraft] = useState('');

  if (isLoading) return (
    <div className="mx-auto max-w-article px-10 py-12"><FeedSkeleton count={3} /></div>
  );

  if (isError || !data) return (
    <div className="mx-auto max-w-article px-10 py-20 flex flex-col items-center gap-5 text-center">
      <h1 className="display" style={{ fontSize: 40, color: 'var(--ink)' }}>
        We couldn't <span className="display-italic" style={{ color: 'var(--danger)' }}>load</span> this story.
      </h1>
      <p className="font-sans text-ink-soft" style={{ fontSize: 16, maxWidth: '46ch' }}>
        The server may be waking up, or the post may have been removed during moderation.
      </p>
      <div className="flex gap-3">
        <Btn variant="primary" trailing={<ArrowIcon />} onClick={() => refetch()}>Try again</Btn>
        <Btn variant="outline" onClick={() => navigate('/feed')}>Back to the feed</Btn>
      </div>
    </div>
  );

  const post = data.post ?? data;
  const comments = data.comments ?? post.comments ?? [];
  const excerpt = post.excerpt || excerptOf(post.content);
  const liked = !!post.likedByMe;
  const flag = flagEmoji(post.officeCode || null);

  function submitComment() {
    const text = draft.trim();
    if (!text) return;
    postComment.mutate(text, { onSuccess: () => setDraft('') });
  }

  const authorTo = post.authorId ? `/profile/${post.authorId}` : null;

  return (
    <div className="bg-paper">
      {/* breadcrumb */}
      <div className="border-b border-line bg-paper-soft">
        <div className="mx-auto max-w-[1080px] px-10 py-3.5 flex items-center justify-between font-mono uppercase text-ink-faint" style={{ fontSize: 11, letterSpacing: '0.14em' }}>
          <span>
            <Link to="/feed" className="text-ink-soft">Feed</Link>
            <span className="mx-2.5">›</span>
            {post.officeCode && <><span className="text-ink-soft">{post.officeCode}</span><span className="mx-2.5">›</span></>}
            <span className="text-ink">Story #{post.id}</span>
          </span>
          <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
        </div>
      </div>

      {/* article header */}
      <article className="mx-auto max-w-article px-10 pt-12 pb-4">
        <div className="flex items-center gap-2.5" style={{ marginBottom: 18 }}>
          {post.tag && <Pill tone="solid" size="sm">{post.tag}</Pill>}
          {post.officeCode && <OfficeTag code={post.officeCode} mode="chip" />}
          <span className="font-mono text-ink-faint" style={{ fontSize: 11, letterSpacing: '0.1em' }}>· {timeAgo(post.createdAt)}</span>
        </div>

        <h1 className="display" style={{ fontSize: 56, color: 'var(--ink)', lineHeight: 1.04, letterSpacing: '-0.015em' }}>
          {post.title}
        </h1>

        {excerpt && (
          <p className="font-sans text-ink-soft" style={{ fontSize: 20, lineHeight: 1.55, margin: '24px 0 0', maxWidth: '54ch' }}>
            {excerpt}
          </p>
        )}

        {/* byline — author avatar + name clickable */}
        <div className="flex items-center gap-3.5 pt-4.5 mt-7" style={{ paddingTop: 18, borderTop: '1px solid var(--line)' }}>
          {authorTo ? (
            <Link to={authorTo}><Avatar name={post.authorName} src={post.authorPhotoUrl || undefined} size={44} /></Link>
          ) : (
            <Avatar name={post.authorName} src={post.authorPhotoUrl || undefined} size={44} />
          )}
          <div className="flex flex-col">
            {authorTo ? (
              <Link to={authorTo} className="font-sans font-bold text-ink no-underline hover:underline" style={{ fontSize: 14 }}>
                {post.authorName}
              </Link>
            ) : (
              <span className="font-sans font-bold text-ink" style={{ fontSize: 14 }}>{post.authorName}</span>
            )}
            <span className="font-sans text-ink-faint" style={{ fontSize: 12 }}>
              {post.authorOffice || ''}
              {flag && <span className="ml-1.5" style={{ fontSize: 14 }}>{flag}</span>}
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            <Btn variant="outline" size="sm" icon={<BookmarkIcon />}>Save</Btn>
            <Btn variant="outline" size="sm" icon={<ShareIcon />} onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}>Share</Btn>
          </div>
        </div>
      </article>

      {/* hero photo */}
      <div className="mx-auto max-w-[960px] px-10 mt-8">
        <Photo src={post.mediaUrl} subject={post.photoSubject} tone="sky" ratio="16 / 9" style={{ borderRadius: 4 }} />
      </div>

      {/* body */}
      <div className="mx-auto max-w-body px-10 mt-10">
        <ArticleBody content={post.content} />
      </div>

      {/* engagement bar */}
      <div className="mx-auto max-w-body px-10 mt-12">
        <div className="flex items-center gap-3.5" style={{ padding: '18px 22px', borderRadius: 8, background: 'var(--accent-tint)', border: '1px solid var(--accent-light)' }}>
          <button
            type="button"
            onClick={() => (isAuthenticated ? toggleLike.mutate() : navigate('/login'))}
            className="inline-flex items-center gap-2 rounded-full font-sans font-bold cursor-pointer transition-[filter] hover:brightness-105 disabled:opacity-60"
            style={{ padding: '8px 14px', fontSize: 13, background: liked ? 'var(--accent)' : '#fff', color: liked ? '#fff' : 'var(--accent-deep)', border: liked ? 'none' : '1px solid var(--accent-light)' }}
          >
            {liked ? <HeartFillIcon /> : <HeartIcon />} {liked ? 'Liked' : 'Like'} · {post.likeCount ?? 0}
          </button>
          <span className="font-sans text-ink-soft inline-flex items-center gap-1.5" style={{ fontSize: 13 }}>
            <CommentIcon /> <span>{post.commentCount ?? comments.length} comments</span>
          </span>
        </div>
      </div>

      {/* comments */}
      <section className="mx-auto max-w-body px-10 mt-10 pb-20">
        <RuleLabel right={`${comments.length}${post.commentCount && post.commentCount > comments.length ? ` of ${post.commentCount}` : ''}`}>
          Comments
        </RuleLabel>

        {/* compose box */}
        <div className="mt-4.5 flex gap-3.5 items-start" style={{ marginTop: 18, padding: 18, background: '#fff', border: '1px solid var(--line-strong)', borderRadius: 8 }}>
          <Avatar name={user?.fullName || 'You'} src={user?.photoUrl || undefined} size={36} />
          <div className="flex-1 flex flex-col gap-2.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isAuthenticated ? 'Add a comment — sign off with your entity' : 'Sign in with AIESEC EXPA to comment'}
              disabled={!isAuthenticated}
              className="w-full border-none outline-none bg-transparent font-sans text-ink resize-y disabled:opacity-60"
              style={{ minHeight: 72, fontSize: 14, lineHeight: 1.55 }}
            />
            <div className="flex items-center justify-between">
              <span className="font-sans text-ink-faint" style={{ fontSize: 11 }}>Comments are public and signed with your AIESEC EXPA name.</span>
              {isAuthenticated ? (
                <Btn variant="primary" size="sm" trailing={<ArrowIcon />} onClick={submitComment} disabled={postComment.isPending || !draft.trim()}>
                  {postComment.isPending ? 'Posting…' : 'Post comment'}
                </Btn>
              ) : (
                <Btn variant="primary" size="sm" trailing={<ArrowIcon />} onClick={() => navigate('/login')}>Sign in to comment</Btn>
              )}
            </div>
          </div>
        </div>

        {/* thread */}
        <div className="mt-6 flex flex-col">
          {comments.length === 0 ? (
            <p className="font-sans text-ink-faint py-8 text-center" style={{ fontSize: 14 }}>No comments yet. Be the first to respond.</p>
          ) : (
            comments.map((c, i) => <Comment key={c.id ?? i} c={c} isFirst={i === 0} />)
          )}
        </div>
      </section>
    </div>
  );
}
