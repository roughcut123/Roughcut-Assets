import React from 'react';

/**
 * HERITAGE DENIM HARDWARE, drawn.
 *
 * Every piece here is line work in the library's register — no photography, no
 * simulated metal, no gradients (§3.4). A rivet reads as a rivet because of its
 * burr and its set marks, not because it is shiny.
 *
 * Sizes are given as a nominal radius R and everything scales off it, so one
 * number places a piece into a covering grid.
 */

export type PieceProps = {r: number; ink: string; fill: string};

/** Copper rivet, face on: domed head, the ring of the burr, four set marks. */
export const Rivet: React.FC<PieceProps> = ({r, ink, fill}) => (
  <g fill="none" stroke={ink}>
    <circle cx={0} cy={0} r={r} fill={fill} strokeWidth={r * 0.075} />
    <circle cx={0} cy={0} r={r * 0.72} strokeWidth={r * 0.05} opacity={0.7} />
    <circle cx={0} cy={0} r={r * 0.34} strokeWidth={r * 0.07} />
    {[0, 1, 2, 3].map((i) => (
      <line
        key={i}
        x1={Math.cos((i * Math.PI) / 2) * r * 0.44}
        y1={Math.sin((i * Math.PI) / 2) * r * 0.44}
        x2={Math.cos((i * Math.PI) / 2) * r * 0.64}
        y2={Math.sin((i * Math.PI) / 2) * r * 0.64}
        strokeWidth={r * 0.05}
        opacity={0.6}
      />
    ))}
  </g>
);

/**
 * 20mm tack button, face on. The heritage kind: a domed shell with a knurled
 * rim, a recessed centre and the shank showing as a ring behind.
 */
export const TackButton: React.FC<PieceProps> = ({r, ink, fill}) => (
  <g fill="none" stroke={ink}>
    <circle cx={0} cy={0} r={r} fill={fill} strokeWidth={r * 0.08} />
    {/* the knurl — the milled edge that makes it grip */}
    {Array.from({length: 40}).map((_, i) => {
      const a = (i / 40) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={Math.cos(a) * r * 0.86}
          y1={Math.sin(a) * r * 0.86}
          x2={Math.cos(a) * r * 0.98}
          y2={Math.sin(a) * r * 0.98}
          strokeWidth={r * 0.035}
          opacity={0.55}
        />
      );
    })}
    <circle cx={0} cy={0} r={r * 0.8} strokeWidth={r * 0.045} opacity={0.75} />
    <circle cx={0} cy={0} r={r * 0.5} strokeWidth={r * 0.06} />
    <circle cx={0} cy={0} r={r * 0.14} strokeWidth={r * 0.05} opacity={0.8} />
  </g>
);

/** Cinch-back buckle: the frame, the bar and the prong. */
export const Buckle: React.FC<PieceProps> = ({r, ink, fill}) => {
  const w = r * 1.7;
  const h = r * 1.15;
  return (
    <g fill="none" stroke={ink}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} strokeWidth={r * 0.1} />
      <rect x={-w / 2 + r * 0.2} y={-h / 2 + r * 0.2} width={w - r * 0.4} height={h - r * 0.4} strokeWidth={r * 0.07} />
      <line x1={0} y1={-h / 2 + r * 0.2} x2={0} y2={h / 2 - r * 0.2} strokeWidth={r * 0.11} />
      <line x1={-r * 0.62} y1={0} x2={r * 0.3} y2={0} strokeWidth={r * 0.09} />
      <circle cx={-r * 0.62} cy={0} r={r * 0.12} strokeWidth={r * 0.06} />
    </g>
  );
};

/** Slide adjuster — the other half of a cinch back. */
export const Adjuster: React.FC<PieceProps> = ({r, ink, fill}) => {
  const w = r * 1.85;
  const h = r * 0.95;
  return (
    <g fill="none" stroke={ink}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} strokeWidth={r * 0.1} />
      <line x1={-w / 6} y1={-h / 2} x2={-w / 6} y2={h / 2} strokeWidth={r * 0.09} />
      <line x1={w / 6} y1={-h / 2} x2={w / 6} y2={h / 2} strokeWidth={r * 0.09} />
    </g>
  );
};

/** Burr — the washer the rivet is set against. Small, and always in pairs. */
export const Burr: React.FC<PieceProps> = ({r, ink, fill}) => (
  <g fill="none" stroke={ink}>
    <circle cx={0} cy={0} r={r * 0.62} fill={fill} strokeWidth={r * 0.075} />
    <circle cx={0} cy={0} r={r * 0.2} strokeWidth={r * 0.06} />
  </g>
);

/**
 * Patch pocket, as it is cut: hem across the top, the fold lines down the
 * sides, and the bartacks at the mouth that stop it tearing off.
 */
export const Pocket: React.FC<PieceProps> = ({r, ink, fill}) => {
  const w = r * 1.62;
  const h = r * 1.85;
  return (
    <g fill="none" stroke={ink}>
      <path
        d={`M ${-w / 2} ${-h / 2} L ${w / 2} ${-h / 2} L ${w / 2} ${h / 2 - w * 0.18}
            L 0 ${h / 2} L ${-w / 2} ${h / 2 - w * 0.18} Z`}
        fill={fill}
        strokeWidth={r * 0.085}
      />
      <line x1={-w / 2} y1={-h / 2 + r * 0.3} x2={w / 2} y2={-h / 2 + r * 0.3} strokeWidth={r * 0.06} />
      <line x1={-w / 2} y1={-h / 2 + r * 0.42} x2={w / 2} y2={-h / 2 + r * 0.42} strokeWidth={r * 0.045} opacity={0.6} />
      {[-1, 1].map((s) => (
        <line key={s} x1={(s * w) / 2 - s * r * 0.16} y1={-h / 2 + r * 0.14} x2={(s * w) / 2 - s * r * 0.16} y2={-h / 2 + r * 0.46} strokeWidth={r * 0.09} />
      ))}
    </g>
  );
};

/** The leather patch, stamped and stitched on. */
export const Patch: React.FC<PieceProps> = ({r, ink, fill}) => {
  const w = r * 2.1;
  const h = r * 1.25;
  return (
    <g fill="none" stroke={ink}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} strokeWidth={r * 0.08} />
      <rect x={-w / 2 + r * 0.13} y={-h / 2 + r * 0.13} width={w - r * 0.26} height={h - r * 0.26}
        strokeWidth={r * 0.045} strokeDasharray={`${r * 0.1} ${r * 0.08}`} />
      <line x1={-w * 0.3} y1={-r * 0.16} x2={w * 0.3} y2={-r * 0.16} strokeWidth={r * 0.07} opacity={0.8} />
      <line x1={-w * 0.22} y1={r * 0.1} x2={w * 0.22} y2={r * 0.1} strokeWidth={r * 0.05} opacity={0.6} />
      <line x1={-w * 0.14} y1={r * 0.3} x2={w * 0.14} y2={r * 0.3} strokeWidth={r * 0.05} opacity={0.6} />
    </g>
  );
};
