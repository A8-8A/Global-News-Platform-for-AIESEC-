// Feed post cards. FeaturePost is the big 1:1.2 photo+text hero;
// PostRow is the standard list row. Both translated from
// screens-feed.jsx and bound to the real post JSON shape:
//   { id, title, content, excerpt, mediaUrl, tag, status, authorName,
//     authorOffice, officeCode, likeCount, commentCount, likedByMe,
//     createdAt }
// officeCode is not sent by the backend yet, so OfficeTag guards on it.

import { Link } from 'react-router-dom';
import { Photo } from './ui/Photo';
import { Pill } from './ui/Pill';
import { OfficeTag } from './ui/OfficeTag';
import { Avatar } from './ui/Avatar';
import { HeartIcon, CommentIcon } from './ui/Icon';
import { timeAgo, excerptOf } from './ui/states';

function authorRole(post) {
  return post.authorOffice || '';
}

export function FeaturePost({ post }) {
  const excerpt = post.excerpt || excerptOf(post.content);
  return (
    <article className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-start pb-12">
      <Link to={`/feed/${post.id}`} className="block">
        <Photo
          src={post.mediaUrl}
          subject={post.photoSubject}
          tone={post.photo || 'sky'}
          ratio="4 / 5"
          style={{ borderRadius: 4 }}
        />
      </Link>

      <div className="flex flex-col gap-5 pt-1">
        <div className="flex items-center gap-2.5">
          {post.tag && <Pill tone="solid" size="sm">{post.tag}</Pill>}
          {post.officeCode && <OfficeTag code={post.officeCode} mode="chip" />}
        </div>

        <Link to={`/feed/${post.id}`} className="no-underline">
          <h2 className="display" style={{ fontSize: 38, color: 'var(--ink)', lineHeight: 1.05 }}>
            {post.title}
          </h2>
        </Link>

        <p className="font-sans text-ink-soft" style={{ fontSize: 17, lineHeight: 1.55, maxWidth: '52ch' }}>
          {excerpt}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Avatar name={post.authorName} size={36} />
          <div className="flex flex-col">
            <span className="font-sans font-bold text-ink" style={{ fontSize: 13 }}>{post.authorName}</span>
            <span className="font-sans text-ink-faint" style={{ fontSize: 12 }}>
              {authorRole(post)}{authorRole(post) ? ' · ' : ''}{timeAgo(post.createdAt)}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-[18px] text-ink-soft font-sans" style={{ fontSize: 12 }}>
            <span className="inline-flex items-center gap-1.5"><HeartIcon />{post.likeCount ?? 0}</span>
            <span className="inline-flex items-center gap-1.5"><CommentIcon />{post.commentCount ?? 0}</span>
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
    <article
      className={`grid gap-8 items-start py-8 border-t border-line ${
        hasPhoto ? 'grid-cols-1 md:grid-cols-[1fr_240px]' : 'grid-cols-1'
      }`}
    >
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2.5">
          {post.officeCode && <OfficeTag code={post.officeCode} mode="chip" />}
          {post.tag && (
            <span className="font-sans font-bold text-accent-deep" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
              {post.tag}
            </span>
          )}
        </div>

        <Link to={`/feed/${post.id}`} className="no-underline">
          <h3 className="display" style={{ fontSize: 26, color: 'var(--ink)', fontWeight: 700 }}>
            {post.title}
          </h3>
        </Link>

        <p className="font-sans text-ink-soft" style={{ fontSize: 14, lineHeight: 1.55, maxWidth: '60ch' }}>
          {excerpt}
        </p>

        <div className="flex items-center gap-3 mt-1.5 font-sans text-ink-faint" style={{ fontSize: 12 }}>
          <Avatar name={post.authorName} size={22} />
          <span className="text-ink font-bold">{post.authorName}</span>
          <span>·</span>
          <span>{timeAgo(post.createdAt)}</span>
          <span className="ml-auto inline-flex gap-4 text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><HeartIcon />{post.likeCount ?? 0}</span>
            <span className="inline-flex items-center gap-1.5"><CommentIcon />{post.commentCount ?? 0}</span>
          </span>
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
