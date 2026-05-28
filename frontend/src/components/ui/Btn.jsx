// Button atom. Variants + sizes from ds-atoms.jsx; hover / focus /
// disabled behaviour from the interactions table (§8.1).

const SIZES = {
  sm: { height: 32, padding: '0 14px', fontSize: 13 },
  md: { height: 42, padding: '0 18px', fontSize: 14 },
  lg: { height: 50, padding: '0 22px', fontSize: 15 },
  xl: { height: 58, padding: '0 26px', fontSize: 16 },
};

const VARIANTS = {
  primary: 'bg-accent text-white border border-accent hover:brightness-105',
  dark: 'bg-ink text-white border border-ink hover:brightness-110',
  outline:
    'bg-transparent text-ink border border-line-strong hover:bg-paper-soft',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-paper-soft',
  soft: 'bg-accent-soft text-accent-deep border border-transparent hover:brightness-[0.97]',
  danger:
    'bg-transparent text-danger border hover:bg-[rgba(156,26,26,0.06)]',
};

export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  full = false,
  className = '',
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const dangerBorder = variant === 'danger' ? { borderColor: 'rgba(156,26,26,0.25)' } : null;
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-sans font-bold',
        'transition-[filter,background-color,box-shadow] cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100',
        variantClasses,
        full ? 'w-full' : '',
        className,
      ].join(' ')}
      style={{
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        letterSpacing: '0.01em',
        ...dangerBorder,
        ...style,
      }}
      {...rest}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
      {trailing && <span className="inline-flex opacity-80">{trailing}</span>}
    </button>
  );
}

export default Btn;
