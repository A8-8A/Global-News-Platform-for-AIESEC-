// Editorial image. When a real `src` (post.mediaUrl) is present we
// render it; otherwise we fall back to the AIESEC-blue gradient
// placeholder with diagonal weave, soft vignette and the walking-human
// watermark. Palette + treatment translated from ds-atoms.jsx.

const PALETTES = {
  blue: { from: '#0263C2', mid: '#037EF3', to: '#9BC8F8' },
  deep: { from: '#0A2C5C', mid: '#0263C2', to: '#4A9CF0' },
  sky: { from: '#037EF3', mid: '#65A8F2', to: '#D4E7FB' },
  warm: { from: '#6E4A1F', mid: '#B57E3F', to: '#E8C994' },
  mono: { from: '#1A2233', mid: '#4A5468', to: '#A8AFBE' },
  // back-compat aliases used by the seed data
  cream: { from: '#0263C2', mid: '#3A8EE0', to: '#9BC8F8' },
  sand: { from: '#0A2C5C', mid: '#0263C2', to: '#4A9CF0' },
  rose: { from: '#6E4A1F', mid: '#B57E3F', to: '#E8C994' },
  forest: { from: '#0E4D3D', mid: '#2E8C70', to: '#9BC8B2' },
};

export function Photo({
  src,
  alt = '',
  subject = '',
  tone = 'blue',
  ratio = '16 / 9',
  style,
  className = '',
}) {
  const c = PALETTES[tone] || PALETTES.blue;

  if (src) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: ratio, ...style }}
      >
        <img
          src={src}
          alt={alt || subject}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {subject && (
          <span
            className="absolute font-mono uppercase"
            style={{
              bottom: 12,
              left: 14,
              fontSize: 10,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.14em',
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {subject}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: ratio,
        background: `linear-gradient(135deg, ${c.from} 0%, ${c.mid} 55%, ${c.to} 100%)`,
        ...style,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(115deg, transparent 0 28px, rgba(255,255,255,0.04) 28px 29px)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.14), transparent 55%)',
        }}
      />
      <img
        src="/brand/AIESEC-Human-White.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{ right: '-8%', bottom: '-12%', width: '55%', opacity: 0.1 }}
      />
      {subject && (
        <span
          className="absolute font-mono uppercase"
          style={{
            bottom: 12,
            left: 14,
            fontSize: 10,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.14em',
          }}
        >
          {subject}
        </span>
      )}
    </div>
  );
}

export default Photo;
