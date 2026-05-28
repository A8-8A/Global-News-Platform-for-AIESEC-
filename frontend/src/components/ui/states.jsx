// Shared utilities + small state components used across screens.
// timeAgo / excerptOf are the production equivalents of the prototype's
// formatAgo / excerpt helpers. Skeleton + spinner styling follows
// screens-misc.jsx.

import { RuleLabel } from './RuleLabel';

/* ---------------- helpers ---------------- */

// Accepts an ISO date string (post.createdAt) OR a minutes-ago number.
export function timeAgo(input) {
  if (input == null) return '';
  let mins;
  if (typeof input === 'number') {
    mins = input;
  } else {
    const then = new Date(input).getTime();
    if (Number.isNaN(then)) return '';
    mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  }
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / (60 * 24))}d ago`;
}

export function excerptOf(text, len = 220) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > len ? `${clean.slice(0, len).trimEnd()}…` : clean;
}

/* ---------------- spinner ---------------- */

export function Spinner({ size = 24, tone = 'accent' }) {
  const ring = tone === 'white' ? 'rgba(255,255,255,0.18)' : 'var(--line-strong)';
  const head = tone === 'white' ? '#fff' : 'var(--accent)';
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        borderRadius: '50%',
        border: `2px solid ${ring}`,
        borderTopColor: head,
        animation: 'spin 1.1s linear infinite',
      }}
    />
  );
}

/* ---------------- skeletons ---------------- */

function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col gap-3" style={{ borderRadius: 8 }}>
      <div className="flex gap-2">
        <div className="rounded-full" style={{ height: 18, width: 64, background: 'var(--paper-deep)' }} />
        <div className="rounded-full" style={{ height: 18, width: 92, background: 'var(--paper-deep)' }} />
      </div>
      <div className="rounded" style={{ height: 22, width: '90%', background: 'var(--paper-deep)' }} />
      <div className="rounded" style={{ height: 14, width: '70%', background: 'var(--paper-soft)' }} />
      <div className="rounded" style={{ height: 14, width: '52%', background: 'var(--paper-soft)' }} />
      <div className="flex items-center gap-2 mt-1">
        <div className="rounded-full" style={{ width: 22, height: 22, background: 'var(--paper-deep)' }} />
        <div className="rounded" style={{ height: 12, width: 120, background: 'var(--paper-soft)' }} />
      </div>
    </div>
  );
}

export function PostSkeleton() {
  return <SkeletonCard />;
}

export function FeedSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-[18px] animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ---------------- inline empty / error (compact) ---------------- */

export function EmptyState({ title = 'Nothing here yet.', body, action }) {
  return (
    <div
      className="relative overflow-hidden rounded-hero border border-accent-light p-12 flex flex-col gap-4"
      style={{ background: 'var(--accent-tint)' }}
    >
      <img
        src="/brand/AIESEC-Human-Blue.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ right: -40, bottom: -60, width: 280, opacity: 0.12 }}
      />
      <div className="relative z-[1] max-w-[480px] flex flex-col gap-3">
        <h3 className="display" style={{ fontSize: 32, color: 'var(--ink)' }}>{title}</h3>
        {body && <p className="font-sans text-ink-soft" style={{ fontSize: 15, lineHeight: 1.6 }}>{body}</p>}
        {action}
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong.', body, action }) {
  return (
    <div className="card p-10 flex flex-col gap-3">
      <RuleLabel>Error</RuleLabel>
      <h3 className="display" style={{ fontSize: 28, color: 'var(--ink)' }}>{title}</h3>
      {body && <p className="font-sans text-ink-soft" style={{ fontSize: 15, lineHeight: 1.6 }}>{body}</p>}
      {action}
    </div>
  );
}
