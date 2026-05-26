// Brand assets as components.
// Official AIESEC assets live in /public/brand/.

/** The AIESEC wordmark logo. */
export function Logo({ className = 'h-7' }) {
  return (
    <img src="/brand/logo.png" alt="AIESEC" className={className} draggable="false" />
  );
}

/**
 * Circular avatar with initials on a flat brand-blue disc.
 * AIESEC users have no uploaded photo, so initials stand in.
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
      style={{ width: size, height: size, fontSize: size * 0.4, background: '#037EF3' }}
    >
      {initials}
    </div>
  );
}
