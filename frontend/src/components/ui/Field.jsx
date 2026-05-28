// Form atoms. Field wraps a label + optional sticker + hint/error.
// Input supports single line, multiline (textarea) and a prefix slot
// (e.g. "https://"). Translated from ds-atoms.jsx; focus state uses the
// accent border per §8.1.

export function Field({ label, hint, error, children, optional, className = '' }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span
          className="flex items-baseline justify-between font-sans font-bold uppercase text-ink"
          style={{ fontSize: 12, letterSpacing: '0.04em' }}
        >
          <span>{label}</span>
          {optional && (
            <span className="italic normal-case text-ink-faint" style={{ fontWeight: 400, letterSpacing: 0 }}>
              optional
            </span>
          )}
        </span>
      )}
      {children}
      {(hint || error) && (
        <span
          className="font-sans leading-snug"
          style={{ fontSize: 12, color: error ? 'var(--danger)' : 'var(--ink-faint)' }}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}

const baseInput =
  'w-full box-border bg-white border border-line-strong rounded-md text-ink outline-none ' +
  'transition-colors focus:border-accent disabled:bg-paper-soft disabled:text-ink-faint';

export function Input({
  placeholder,
  value,
  defaultValue,
  onChange,
  multiline = false,
  rows = 4,
  prefix,
  mono = false,
  className = '',
  style,
  ...rest
}) {
  const fontClass = mono ? 'font-mono' : 'font-sans';

  if (multiline) {
    return (
      <textarea
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${baseInput} ${fontClass} resize-y ${className}`}
        style={{ padding: '12px 14px', fontSize: 14, lineHeight: 1.55, ...style }}
        {...rest}
      />
    );
  }

  if (prefix) {
    return (
      <div className={`${baseInput} flex items-center p-0 ${className}`} style={style}>
        <span
          className="font-mono text-ink-faint"
          style={{ padding: '0 6px 0 14px', fontSize: 13 }}
        >
          {prefix}
        </span>
        <input
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          className={`flex-1 h-11 border-none outline-none bg-transparent text-ink ${fontClass}`}
          style={{ fontSize: 14 }}
          {...rest}
        />
      </div>
    );
  }

  return (
    <input
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseInput} ${fontClass} h-11 ${className}`}
      style={{ padding: '0 14px', fontSize: 14, ...style }}
      {...rest}
    />
  );
}

export default Field;
