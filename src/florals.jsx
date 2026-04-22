// Hand-drawn-feel floral SVG components. Flat, pastel, loose.
// Colors read from CSS variables so they respect palette tweaks.

export const FloralDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
    <defs>
      <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" />
        <feOffset dx="0" dy="1" result="off" />
        <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  </svg>
);

// Single 5-petal daisy
export const Daisy = ({ size = 40, petal = 'var(--c-ivory)', center = 'var(--c-butter)', style, className }) => (
  <svg viewBox="-50 -50 100 100" width={size} height={size} style={style} className={className}>
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i * 360) / 10;
      return (
        <ellipse
          key={i}
          cx="0" cy="-24" rx="7" ry="18"
          fill={petal}
          stroke="rgba(90,50,40,0.15)"
          strokeWidth="0.8"
          transform={`rotate(${a})`}
        />
      );
    })}
    <circle cx="0" cy="0" r="9" fill={center} />
    <circle cx="0" cy="0" r="9" fill="url(#daisyDot)" opacity="0.25" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * 360) / 8;
      const rad = (a * Math.PI) / 180;
      return <circle key={i} cx={Math.cos(rad) * 4.5} cy={Math.sin(rad) * 4.5} r="1" fill="rgba(120,70,20,0.5)" />;
    })}
  </svg>
);

// Full rose (concentric spiraled petals)
export const Rose = ({ size = 60, color = 'var(--c-blush)', leaf = 'var(--c-sage)', style, className }) => (
  <svg viewBox="-50 -50 100 100" width={size} height={size} style={style} className={className}>
    {/* leaves */}
    <path d="M -30 15 Q -45 5 -40 -15 Q -25 -5 -28 12 Z" fill={leaf} opacity="0.9" />
    <path d="M 30 18 Q 46 8 42 -12 Q 26 -2 28 15 Z" fill={leaf} opacity="0.85" />
    {/* outer petals */}
    {[0, 60, 120, 180, 240, 300].map((a, i) => (
      <ellipse key={i} cx="0" cy="-18" rx="16" ry="22" fill={color} opacity="0.85"
        transform={`rotate(${a})`} stroke="rgba(90,30,40,0.12)" strokeWidth="0.6" />
    ))}
    {/* mid petals */}
    {[30, 90, 150, 210, 270, 330].map((a, i) => (
      <ellipse key={i} cx="0" cy="-10" rx="10" ry="14" fill={color} opacity="0.95"
        transform={`rotate(${a})`} />
    ))}
    {/* center bud */}
    <circle cx="0" cy="0" r="8" fill={color} />
    <path d="M -4 -2 Q 0 -8 4 -2 Q 4 4 0 4 Q -4 4 -4 -2 Z" fill="rgba(120,30,50,0.25)" />
  </svg>
);

// Small cosmos / wildflower
export const Cosmos = ({ size = 38, color = 'var(--c-coral)', center = 'var(--c-butter)', style, className }) => (
  <svg viewBox="-50 -50 100 100" width={size} height={size} style={style} className={className}>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * 360) / 8;
      return (
        <path key={i}
          d="M 0 -8 Q -10 -25 -4 -38 Q 0 -42 4 -38 Q 10 -25 0 -8 Z"
          fill={color}
          opacity="0.9"
          transform={`rotate(${a})`}
          stroke="rgba(90,30,40,0.1)" strokeWidth="0.6"
        />
      );
    })}
    <circle cx="0" cy="0" r="7" fill={center} />
    <circle cx="0" cy="0" r="4" fill="rgba(150,90,30,0.4)" />
  </svg>
);

// Tiny cluster of forget-me-nots
export const Cluster = ({ size = 44, color = 'var(--c-peri)', style, className }) => (
  <svg viewBox="-50 -50 100 100" width={size} height={size} style={style} className={className}>
    {[[-15, -10], [12, -15], [0, 8], [-18, 15], [18, 12], [-5, -22]].map(([cx, cy], i) => (
      <g key={i} transform={`translate(${cx} ${cy})`}>
        {[0, 72, 144, 216, 288].map((a, j) => (
          <circle key={j} cx="0" cy="-6" r="4" fill={color} opacity="0.9" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="2" fill="var(--c-butter)" />
      </g>
    ))}
  </svg>
);

// Leafy stem
export const Stem = ({ width = 120, height = 200, color = 'var(--c-sage)', style, className, flip }) => (
  <svg viewBox="0 0 120 200" width={width} height={height} style={style} className={className}
    preserveAspectRatio="none">
    <g transform={flip ? 'scale(-1,1) translate(-120,0)' : ''}>
      <path d="M 60 200 Q 55 150 65 100 Q 75 50 60 0" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 62 160 Q 30 155 18 135 Q 40 130 64 148 Z" fill={color} opacity="0.85" />
      <path d="M 68 120 Q 100 115 110 95 Q 88 90 66 108 Z" fill={color} opacity="0.8" />
      <path d="M 60 80 Q 30 75 20 55 Q 42 52 64 70 Z" fill={color} opacity="0.85" />
      <path d="M 66 40 Q 96 35 104 18 Q 82 14 62 30 Z" fill={color} opacity="0.8" />
    </g>
  </svg>
);

// Single petal (for confetti)
export const Petal = ({ size = 20, color = 'var(--c-blush)', style }) => (
  <svg viewBox="-20 -20 40 40" width={size} height={size} style={style}>
    <path d="M 0 -18 Q 14 -6 10 10 Q 0 18 -10 10 Q -14 -6 0 -18 Z"
      fill={color} stroke="rgba(90,30,40,0.12)" strokeWidth="0.6" />
  </svg>
);

// Location pin shaped like a flower — a teardrop outline with a 5-petal
// daisy as the inner glyph instead of the usual solid dot.
//
// viewBox is deliberately padded (-14 -16 28 32) so neither the top curve
// nor the stroke get clipped. The natural aspect ratio is 28:32 ≈ 7:8.
export const FloralPin = ({ size = 18, color = 'var(--c-wine)', petal = 'var(--c-ivory)', center = 'var(--c-butter)', style, className }) => (
  <svg viewBox="-14 -16 28 32" width={size} height={size * (32 / 28)} style={style} className={className} aria-hidden overflow="visible">
    {/* teardrop body — classic map pin silhouette */}
    <path
      d="M 0 14 C -8 4 -10 -2 -10 -4 A 10 10 0 1 1 10 -4 C 10 -2 8 4 0 14 Z"
      fill={color}
      stroke={color}
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
    {/* 5-petal flower where the dot usually goes */}
    <g transform="translate(0 -4) scale(0.55)">
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={i} cx="0" cy="-5" rx="2.4" ry="4.2"
          fill={petal}
          stroke="rgba(90,30,40,0.2)" strokeWidth="0.4"
          transform={`rotate(${a})`} />
      ))}
      <circle cx="0" cy="0" r="2" fill={center} />
    </g>
  </svg>
);

// Armenian ornamental divider — a khachkar-inspired horizontal line
export const ArmDivider = ({ width = 200, color = 'var(--c-gold)' }) => (
  <svg viewBox="0 0 200 24" width={width} height={24} style={{ display: 'block' }}>
    <g stroke={color} strokeWidth="1" fill="none">
      <line x1="0" y1="12" x2="72" y2="12" />
      <line x1="128" y1="12" x2="200" y2="12" />
      <circle cx="100" cy="12" r="5" />
      <circle cx="100" cy="12" r="2" fill={color} />
      <path d="M 82 12 Q 90 4 100 7" />
      <path d="M 82 12 Q 90 20 100 17" />
      <path d="M 118 12 Q 110 4 100 7" />
      <path d="M 118 12 Q 110 20 100 17" />
      <circle cx="78" cy="12" r="1.5" fill={color} />
      <circle cx="122" cy="12" r="1.5" fill={color} />
    </g>
  </svg>
);

// Wreath — arranged flowers in an arc/circle. Used around hero.
export const Wreath = ({ width = 700, height = 700, density = 1 }) => {
  const items = [
    { x: 50, y: 18, r: -15, c: Rose, s: 110, p: { color: 'var(--c-blush)' } },
    { x: 82, y: 28, r: 20, c: Cosmos, s: 70, p: { color: 'var(--c-coral)' } },
    { x: 92, y: 52, r: 45, c: Daisy, s: 56, p: {} },
    { x: 88, y: 76, r: 80, c: Rose, s: 90, p: { color: 'var(--c-butter)' } },
    { x: 70, y: 90, r: 130, c: Cosmos, s: 56, p: { color: 'var(--c-peri)' } },
    { x: 45, y: 94, r: 170, c: Daisy, s: 48, p: { petal: 'var(--c-ivory)' } },
    { x: 22, y: 88, r: 200, c: Cluster, s: 70, p: {} },
    { x: 10, y: 70, r: 230, c: Rose, s: 100, p: { color: 'var(--c-blush)' } },
    { x: 6, y: 46, r: 260, c: Cosmos, s: 64, p: { color: 'var(--c-coral)' } },
    { x: 14, y: 24, r: 300, c: Daisy, s: 52, p: {} },
    { x: 28, y: 12, r: 330, c: Cluster, s: 62, p: { color: 'var(--c-peri)' } },
    // inner accents
    { x: 38, y: 34, r: 10, c: Daisy, s: 34, p: {} },
    { x: 66, y: 68, r: 200, c: Daisy, s: 32, p: {} },
  ];
  return (
    <div style={{ position: 'relative', width, height }}>
      {items.slice(0, Math.ceil(items.length * density)).map((it, i) => {
        const Comp = it.c;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${it.x}%`, top: `${it.y}%`,
            transform: `translate(-50%,-50%) rotate(${it.r}deg)`,
          }}>
            <Comp size={it.s} {...it.p} />
          </div>
        );
      })}
    </div>
  );
};
