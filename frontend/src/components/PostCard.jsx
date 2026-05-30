// Feed post cards with inline like/comment actions.

import { Link, useNavigate } from 'react-router-dom';
import { Photo } from './ui/Photo';
import { Pill } from './ui/Pill';
import { OfficeTag } from './ui/OfficeTag';
import { Avatar } from './ui/Avatar';
import { HeartIcon, HeartFillIcon, CommentIcon } from './ui/Icon';
import { timeAgo, excerptOf } from './ui/states';
import { useToggleLike } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

function FlagEmoji({ code }) {
  if (!code || code.length !== 2) return null;
  const emoji = String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E0 - 65 + c.charCodeAt(0))
  );
  return <span style={{ fontSize: 14 }}>{emoji}</span>;
}

function LikeButton({ post }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toggle = useToggleLike(post.id);
  const liked = !!post.likedByMe;

  function handleLike(e) {
    e.preventDefault(); // don't navigate to article
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    toggle.mutate();
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={toggle.isPending}
      className="inline-flex items-center gap-1.5 font-sans transition-colors disabled:opacity-60"
      style={{ fontSize: 12, color: liked ? 'var(--accent)' : 'var(--ink-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      {liked ? <HeartFillIcon /> : <HeartIcon />}
      {post.likeCount ?? 0}
    </button>
  );
}

function AuthorLink({ post, size = 36, showOffice = true }) {
  const to = post.authorId ? `/profile/${post.authorId}` : null;
  const inner = (
    <div className="flex items-center gap-2.5">
      <Avatar name={post.authorName} src={post.authorPhotoUrl || undefined} size={size} />
      <div className="flex flex-col">
        <span className="font-sans font-bold text-ink" style={{ fontSize: size > 28 ? 13 : 12 }}>
          {post.authorName}
        </span>
        {showOffice && (
          <span className="font-sans text-ink-faint" style={{ fontSize: 11 }}>
            {post.authorOffice || ''}
            {post.authorOffice && post.createdAt ? ' · ' : ''}
            {timeAgo(post.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
  if (!to) return inner;
  return <Link to={to} className="no-underline hover:opacity-80 transition-opacity">{inner}</Link>;
}

export function FeaturePost({ post }) {
  const excerpt = post.excerpt || excerptOf(post.content);
  return (
    <article className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-start pb-12">
      <Link to={`/feed/${post.id}`} className="block">
        <Photo src={post.mediaUrl} tone={post.photo || 'sky'} ratio="4 / 5" style={{ borderRadius: 4 }} />
      </Link>
      <div className="flex flex-col gap-5 pt-1">
        <div className="flex items-center gap-2.5">
          {post.officeCode && <FlagEmoji code={post.officeCode} />}
          {post.tag && <Pill tone="solid" size="sm">{post.tag}</Pill>}
          {post.officeCode && <OfficeTag code={post.officeCode} mode="chip" />}
        </div>
        <Link to={`/feed/${post.id}`} className="no-underline">
          <h2 className="display" style={{ fontSize: 38, color: 'var(--ink)', lineHeight: 1.05 }}>{post.title}</h2>
        </Link>
        <p className="font-sans text-ink-soft" style={{ fontSize: 17, lineHeight: 1.55, maxWidth: '52ch' }}>{excerpt}</p>
        <div className="flex items-center gap-3 mt-2">
          <AuthorLink post={post} size={36} />
          <div className="ml-auto flex items-center gap-4">
            <LikeButton post={post} />
            <Link to={`/feed/${post.id}`} className="inline-flex items-center gap-1.5 font-sans text-ink-faint no-underline" style={{ fontSize: 12 }}>
              <CommentIcon />{post.commentCount ?? 0}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PostRow({ post }) {
  const excerpt = post.excerpt || excerptOf(post.content);
  const hasPhoto = !!(post.mediaUrl || post.photo);
  return (
    <article className={`grid gap-8 items-start py-8 border-t border-line ${hasPhoto ? 'grid-cols-1 md:grid-cols-[1fr_200px]' : 'grid-cols-1'}`}>
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2">
          {post.officeCode && <FlagEmoji code={post.officeCode} />}
          {post.officeCode && <OfficeTag code={post.officeCode} mode="chip" />}
          {post.tag && <span className="font-sans font-bold text-accent-deep" style={{ fontSize: 11, letterSpacing: '0.1em' }}>{post.tag}</span>}
        </div>
        <Link to={`/feed/${post.id}`} className="no-underline">
          <h3 className="display" style={{ fontSize: 24, color: 'var(--ink)', fontWeight: 700 }}>{post.title}</h3>
        </Link>
        <p className="font-sans text-ink-soft" style={{ fontSize: 14, lineHeight: 1.55, maxWidth: '60ch' }}>{excerpt}</p>
        <div className="flex items-center gap-3 mt-1 font-sans text-ink-faint" style={{ fontSize: 12 }}>
          <AuthorLink post={post} size={22} showOffice={false} />
          <span>·</span>
          <span>{timeAgo(post.createdAt)}</span>
          <div className="ml-auto flex items-center gap-4">
            <LikeButton post={post} />
            <Link to={`/feed/${post.id}`} className="inline-flex items-center gap-1.5 text-ink-faint no-underline" style={{ fontSize: 12 }}>
              <CommentIcon />{post.commentCount ?? 0}
            </Link>
          </div>
        </div>
      </div>
      {hasPhoto && (
        <Link to={`/feed/${post.id}`} className="block">
          <Photo src={post.mediaUrl} tone={post.photo || 'sky'} ratio="4 / 3" style={{ borderRadius: 4 }} />
        </Link>
      )}
    </article>
  );
}

export default PostRow;
