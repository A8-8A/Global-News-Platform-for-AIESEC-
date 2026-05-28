// Section divider: an eyebrow kicker, a 1px hairline filling the row,
// and an optional right-aligned meta label. From ds-atoms.jsx.

export function RuleLabel({ children, right, className = '' }) {
  return (
    <div className={`flex items-center gap-3.5 my-1 ${className}`}>
      <span
        className="font-sans font-bold uppercase text-accent-deep shrink-0"
        style={{ fontSize: 11, letterSpacing: '0.16em' }}
      >
        {children}
      </span>
      <div className="flex-1 border-t border-line" />
      {right && (
        <span
          className="font-sans font-medium text-ink-faint shrink-0"
          style={{ fontSize: 11, letterSpacing: '0.08em' }}
        >
          {right}
        </span>
      )}
    </div>
  );
}

export default RuleLabel;
