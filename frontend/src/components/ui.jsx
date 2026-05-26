// Shared UI building blocks. Static - no animation, no emoji.

/* ---- Spinner: a simple ring ---- */
export function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className="w-8 h-8 rounded-full border-[3px] border-line"
        style={{ borderTopColor: '#037EF3' }}
      />
      {label && <p className="text-sm text-ink-soft">{label}</p>}
    </div>
  );
}

/* ---- EmptyState: a quiet, plain panel ---- */
export function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center text-center px-8 py-14">
      <h3 className="font-display font-extrabold text-lg text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft max-w-sm leading-relaxed">
        {message}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---- ErrorState ---- */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center text-center px-8 py-14">
      <h3 className="font-display font-extrabold text-lg text-ink">
        Something went wrong
      </h3>
      <p className="mt-2 text-sm text-ink-soft max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-6 px-5 py-2.5 text-sm">
          Try again
        </button>
      )}
    </div>
  );
}

/* ---- PostSkeleton: plain neutral placeholder ---- */
export function PostSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <div className="skeleton w-11 h-11 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-2.5 w-20 mt-2" />
        </div>
      </div>
      <div className="skeleton h-4 w-3/4 mt-5" />
      <div className="mt-3 space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
      </div>
      <div className="flex gap-4 mt-5 pt-4 border-t border-line">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

/* ---- timeAgo: compact relative time ---- */
export function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
