// A single post in the feed: title, content, author (MCP identity),
// optional media, and engagement metrics.

export default function PostCard({ post }) {
  return (
    <article className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>

      {/* Author = MCP identity. Office name helps readers place the update. */}
      <p className="text-xs text-gray-500 mt-0.5">
        {post.authorName}
        {post.authorOffice ? ` · ${post.authorOffice}` : ''}
        {post.createdAt ? ` · ${formatDate(post.createdAt)}` : ''}
      </p>

      <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.mediaUrl && (
        <a
          href={post.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-aiesec hover:underline mt-2 inline-block"
        >
          View attachment
        </a>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
        <span>{post.likeCount ?? 0} likes</span>
        <span>{post.commentCount ?? 0} comments</span>
      </div>
    </article>
  );
}

function formatDate(iso) {
  // Backend sends UTC; the browser renders it in the viewer's locale.
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '';
  }
}
