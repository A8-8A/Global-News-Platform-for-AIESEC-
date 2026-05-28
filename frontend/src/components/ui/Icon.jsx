// Inline SVG icon set, taken verbatim from the design system
// (ds-atoms.jsx). Each icon inherits `currentColor` so callers can
// colour them with text utilities. Exposed both as named components
// and as a glyph map `Icon` for terse usage in the screens.

const S = ({ children, size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const ArrowIcon = (p) => (
  <S {...p}>
    <path
      d="M3 8 H 13 M9 4 L 13 8 L 9 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </S>
);

export const CheckIcon = (p) => (
  <S {...p}>
    <path
      d="M3 8 L7 12 L 13 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </S>
);

export const XIcon = (p) => (
  <S {...p}>
    <path
      d="M4 4 L 12 12 M 12 4 L 4 12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </S>
);

export const HeartIcon = (p) => (
  <S {...p}>
    <path
      d="M8 13.5 C 1 9 3 3 6 3 C 7.5 3 8 4.5 8 4.5 C 8 4.5 8.5 3 10 3 C 13 3 15 9 8 13.5 Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </S>
);

export const HeartFillIcon = (p) => (
  <S {...p}>
    <path
      d="M8 13.5 C 1 9 3 3 6 3 C 7.5 3 8 4.5 8 4.5 C 8 4.5 8.5 3 10 3 C 13 3 15 9 8 13.5 Z"
      fill="currentColor"
    />
  </S>
);

export const CommentIcon = (p) => (
  <S {...p}>
    <path
      d="M2 4 a 2 2 0 0 1 2 -2 h 8 a 2 2 0 0 1 2 2 v 5 a 2 2 0 0 1 -2 2 H 7 L 4 13.5 V 11 H 4 a 2 2 0 0 1 -2 -2 Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </S>
);

export const ShareIcon = (p) => (
  <S {...p}>
    <path
      d="M8 2 V 10 M5 5 L 8 2 L 11 5 M3 9 V 13 a 1 1 0 0 0 1 1 H 12 a 1 1 0 0 0 1 -1 V 9"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </S>
);

export const BookmarkIcon = (p) => (
  <S {...p}>
    <path
      d="M4 2 H 12 V 14 L 8 11 L 4 14 Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </S>
);

export const GlobeIcon = (p) => (
  <S {...p}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="8" cy="8" rx="3" ry="6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 8 H 14" stroke="currentColor" strokeWidth="1.4" />
  </S>
);

export const SparkIcon = (p) => (
  <S {...p}>
    <path d="M8 2 L 9 6 L 13 7 L 9 8 L 8 12 L 7 8 L 3 7 L 7 6 Z" fill="currentColor" />
  </S>
);

export const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Glyph map mirroring the prototype's `Icon.arrow` usage.
export const Icon = {
  arrow: <ArrowIcon />,
  check: <CheckIcon />,
  x: <XIcon />,
  heart: <HeartIcon />,
  heartFill: <HeartFillIcon />,
  comment: <CommentIcon />,
  share: <ShareIcon />,
  bookmark: <BookmarkIcon />,
  globe: <GlobeIcon />,
  spark: <SparkIcon />,
  search: <SearchIcon />,
};

export default Icon;
