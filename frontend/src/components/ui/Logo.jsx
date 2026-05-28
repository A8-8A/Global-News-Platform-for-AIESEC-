// Brand wordmark + "NEWS" sub-mark, and the walking-human watermark.
// Translated from ds-atoms.jsx — the PNGs are the source of truth and
// live in public/brand/.

export function Logo({ height = 22, tone = 'color', className = '' }) {
  const src = tone === 'white' ? '/brand/White-Blue-Logo.png' : '/brand/Blue-Logo.png';
  const dividerColor = tone === 'white' ? 'rgba(255,255,255,0.25)' : 'rgba(26,34,51,0.18)';
  const subColor = tone === 'white' ? 'rgba(255,255,255,0.85)' : 'var(--ink)';
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img src={src} alt="AIESEC" style={{ height, width: 'auto' }} className="block" />
      <span style={{ width: 1, height: height * 0.7, background: dividerColor }} />
      <span
        className="font-sans font-bold uppercase"
        style={{ fontSize: height * 0.6, letterSpacing: '0.18em', color: subColor }}
      >
        News
      </span>
    </div>
  );
}

// Decorative walking-human silhouette. Never foreground content —
// callers pass low opacity via style/className.
export function HumanMark({ size = 80, tone = 'blue', style, className = '' }) {
  const src = tone === 'white' ? '/brand/AIESEC-Human-White.png' : '/brand/AIESEC-Human-Blue.png';
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`block ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}

export default Logo;
