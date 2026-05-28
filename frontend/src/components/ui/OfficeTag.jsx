// Country / entity chip. Office table is the 20-entry set from
// ds-atoms.jsx. `chip` mode is the rounded flag pill used on cards;
// `inline` mode is the bare dateline used in tables and lists.
//
// NOTE: the backend does not yet send `officeCode`. Callers guard with
// `{post.officeCode && <OfficeTag .../>}`, so chips simply don't render
// until the field is added server-side. Unknown codes fall back to a
// white flag + the raw code.

export const OFFICES = {
  MX: { name: 'México', flag: '🇲🇽' },
  BR: { name: 'Brasil', flag: '🇧🇷' },
  VN: { name: 'Việt Nam', flag: '🇻🇳' },
  PL: { name: 'Polska', flag: '🇵🇱' },
  IN: { name: 'India', flag: '🇮🇳' },
  TN: { name: 'Tunisie', flag: '🇹🇳' },
  EG: { name: 'مصر', flag: '🇪🇬' },
  NG: { name: 'Nigeria', flag: '🇳🇬' },
  KE: { name: 'Kenya', flag: '🇰🇪' },
  CO: { name: 'Colombia', flag: '🇨🇴' },
  AR: { name: 'Argentina', flag: '🇦🇷' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  DE: { name: 'Deutschland', flag: '🇩🇪' },
  FR: { name: 'France', flag: '🇫🇷' },
  ID: { name: 'Indonesia', flag: '🇮🇩' },
  TR: { name: 'Türkiye', flag: '🇹🇷' },
  RO: { name: 'România', flag: '🇷🇴' },
  GR: { name: 'Ελλάδα', flag: '🇬🇷' },
  PT: { name: 'Portugal', flag: '🇵🇹' },
  AU: { name: 'Australia', flag: '🇦🇺' },
};

export function OfficeTag({ code, mode = 'inline', className = '' }) {
  if (!code) return null;
  const office = OFFICES[code] || { name: code, flag: '🏳️' };

  if (mode === 'chip') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-paper-soft font-sans font-bold text-ink ${className}`}
        style={{ padding: '3px 10px 3px 6px', fontSize: 11, letterSpacing: '0.06em' }}
      >
        <span style={{ fontSize: 13 }}>{office.flag}</span>
        {code}
      </span>
    );
  }

  return (
    <span
      className={`font-sans font-bold uppercase text-ink-soft ${className}`}
      style={{ fontSize: 11, letterSpacing: '0.12em' }}
    >
      {office.flag} {code} — {office.name}
    </span>
  );
}

export default OfficeTag;
