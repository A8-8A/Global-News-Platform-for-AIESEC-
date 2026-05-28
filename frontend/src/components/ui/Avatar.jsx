// Initials avatar on a deterministic oklch tint derived from the name.
// Translated from ds-atoms.jsx.

export function Avatar({ name, size = 32, tone, className = '' }) {
  const initials = (name || '?')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const hue =
    (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const bg = tone || `oklch(0.86 0.04 ${hue})`;
  const fg = `oklch(0.32 0.06 ${hue})`;
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-sans font-bold shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

export default Avatar;
