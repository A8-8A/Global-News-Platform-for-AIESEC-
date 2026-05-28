// Tag pill. Tones + sizes translated from ds-atoms.jsx.

const TONES = {
  ink: { background: 'var(--paper-soft)', color: 'var(--ink)' },
  accent: { background: 'var(--accent-soft)', color: 'var(--accent-deep)' },
  solid: { background: 'var(--accent)', color: '#fff' },
  paper: { background: 'var(--paper)', color: 'var(--ink)' },
  danger: { background: 'rgba(192,40,40,0.08)', color: '#9C1A1A' },
  warn: { background: 'rgba(184,134,11,0.10)', color: '#7A5A0E' },
  success: { background: 'rgba(15,109,75,0.10)', color: '#0E6A48' },
  outline: {
    background: 'transparent',
    color: 'var(--ink)',
    border: '1px solid var(--line-strong)',
  },
};

export function Pill({ children, tone = 'ink', size = 'md', className = '' }) {
  const c = TONES[tone] || TONES.ink;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-sans font-bold uppercase ${className}`}
      style={{
        padding: size === 'sm' ? '2px 9px' : '4px 11px',
        fontSize: size === 'sm' ? 10 : 11,
        letterSpacing: '0.06em',
        ...c,
      }}
    >
      {children}
    </span>
  );
}

export default Pill;
