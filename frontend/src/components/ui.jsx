// Small shared UI building blocks used across pages.

import { Human } from './Brand';

/* ------------------------------------------------------------ */
/* Spinner - the AIESEC human as a loading mark                  */
/* ------------------------------------------------------------ */
export function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-aiesec/15" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-aiesec anim-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Human className="h-6" />
        </div>
      </div>
      {label && <p className="text-sm text-ink-soft font-bold">{label}</p>}
    </div>
  );
}

/* ------------------------------------------------------------ */
/* EmptyState - designed "nothing here" panel, never a bare line */
/* ------------------------------------------------------------ */
export function EmptyState({ title, message, icon = '📭', action }) {
  return (
    <div className="card anim-scale-in flex flex-col items-center text-center px-8 py-14">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
        style={{ background: 'var(--aiesec-light)' }}
      >
        {icon}
      </div>
      <h3 className="font-display font-extrabold text-xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft max-w-sm leading-relaxed">
        {message}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ */
/* ErrorState - failed load                                      */
/* ------------------------------------------------------------ */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="card anim-scale-in flex flex-col items-center text-center px-8 py-14">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5 bg-red-50">
        ⚠️
      </div>
      <h3 className="font-display font-extrabold text-xl text-ink">
        Something went wrong
      </h3>
      <p className="mt-2 text-sm text-ink-soft max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 btn-primary px-5 py-2.5 text-sm"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ */
/* PostSkeleton - shimmer placeholder shaped like a post card    */
/* ------------------------------------------------------------ */
export function PostSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-2.5 w-20 mt-2" />
        </div>
      </div>
      <div className="skeleton h-4 w-3/4 mt-5" />
      <div className="mt-3 space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-2/3" />
      </div>
      <div className="flex gap-4 mt-5 pt-4 border-t border-line">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}

/** A column of N post skeletons. */
export function FeedSkeleton({ count = 4 }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ */
/* timeAgo - compact relative time                               */
/* ------------------------------------------------------------ */
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
