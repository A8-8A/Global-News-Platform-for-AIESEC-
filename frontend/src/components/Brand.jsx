// Brand assets as components.
//
// The actual image files live in /public/brand/ - official AIESEC
// assets supplied by the user. Centralising them here means every
// page references the brand consistently and swapping an asset is
// a one-line change.

/**
 * The AIESEC wordmark logo.
 * variant: 'blue' (blue on light) | 'mono' uses the same file.
 */
export function Logo({ className = 'h-7' }) {
  return (
    <img
      src="/brand/logo.png"
      alt="AIESEC"
      className={className}
      draggable="false"
    />
  );
}

/**
 * The iconic AIESEC "human" walking figure. Used as an accent,
 * loading mark, empty-state illustration and avatar fallback.
 */
export function Human({ className = 'h-10', float = false }) {
  return (
    <img
      src="/brand/human-blue.png"
      alt=""
      aria-hidden="true"
      draggable="false"
      className={`${className} ${float ? 'anim-float' : ''}`}
    />
  );
}

/**
 * A circular avatar. AIESEC users have no uploaded photo, so we render
 * their initials on a brand-blue disc - clean and consistent.
 */
export function Avatar({ name, size = 44 }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-display font-extrabold shrink-0 select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: 'linear-gradient(135deg, #037EF3, #024a91)',
      }}
    >
      {initials}
    </div>
  );
}
