import React from 'react';
import {random} from 'remotion';
import {tones, type ToneName} from './theme';

export type Edge = 'top' | 'right' | 'bottom' | 'left';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Smooth value noise built on Remotion's seeded `random`. Interpolating
 * between integer control points gives a wandering line rather than the
 * per-point jitter you get from sampling random directly - which is the
 * difference between an edge that looks torn and one that looks like a
 * saw blade.
 */
const valueNoise = (seed: string, x: number): number => {
  const i0 = Math.floor(x);
  const f = x - i0;
  const s = f * f * (3 - 2 * f); // smoothstep
  const a = random(`${seed}-${i0}`) - 0.5;
  const b = random(`${seed}-${i0 + 1}`) - 0.5;
  return lerp(a, b, s) * 2; // roughly -1 .. 1
};

/**
 * Builds the outline of a hand-cut piece of paper.
 *
 * Every offset comes from Remotion's `random(seed)`, never `Math.random()`.
 * That matters: Remotion renders frames across several parallel processes, so
 * an unseeded random would give each frame a different edge and the paper
 * would boil/flicker in the exported video.
 *
 * Torn edges layer a slow wander, a faster fibre and a little per-point grit.
 * Cut edges get only the slow wander, so they read as a steady hand rather
 * than a shaky one. Corners stay exactly on the rectangle (the `taper` term
 * goes to 0 at both ends of each edge) so the card is still a crisp rectangle.
 */
export const cutRectPath = ({
  w,
  h,
  seed,
  wobble = 6,
  torn = [],
  tornAmp,
  segments = 20,
}: {
  w: number;
  h: number;
  seed: string;
  /** Deviation on cleanly scissor-cut edges, in px. */
  wobble?: number;
  /** Which edges are torn rather than cut. */
  torn?: Edge[];
  /** Deviation on torn edges, in px. */
  tornAmp?: number;
  segments?: number;
}): string => {
  const amplitude = tornAmp ?? 22;
  const edges: {name: Edge; from: [number, number]; to: [number, number]; normal: [number, number]}[] = [
    {name: 'top', from: [0, 0], to: [w, 0], normal: [0, -1]},
    {name: 'right', from: [w, 0], to: [w, h], normal: [1, 0]},
    {name: 'bottom', from: [w, h], to: [0, h], normal: [0, 1]},
    {name: 'left', from: [0, h], to: [0, 0], normal: [-1, 0]},
  ];

  const pts: [number, number][] = [];

  for (const e of edges) {
    const isTorn = torn.includes(e.name);
    const amp = isTorn ? amplitude : wobble;
    const n = isTorn ? segments * 3 : segments;
    const s = `${seed}-${e.name}`;

    for (let i = 0; i < n; i++) {
      // Jitter each sample along the edge so the facets vary in width.
      const jitter = isTorn ? (random(`${s}-j-${i}`) - 0.5) * (0.8 / n) : 0;
      const t = Math.min(1, Math.max(0, i / n + jitter));

      const x = lerp(e.from[0], e.to[0], t);
      const y = lerp(e.from[1], e.to[1], t);

      // Fade the deviation to zero at the corners.
      const taper = Math.min(1, Math.sin(Math.PI * t) * 1.8);

      const off = isTorn
        ? amp *
          (valueNoise(`${s}-lo`, t * 3.5) * 0.62 +
            valueNoise(`${s}-hi`, t * 14) * 0.3 +
            (random(`${s}-g-${i}`) - 0.5) * 0.34)
        : amp * valueNoise(`${s}-lo`, t * 2.5);

      const r = off * taper;
      pts.push([x + e.normal[0] * r, y + e.normal[1] * r]);
    }
  }

  return `M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`;
};

const safeId = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');

/** A punched hole, as on a swing tag. Rendered as a real hole - the footage
 *  behind the card shows through it. */
export type Punch = {cx: number; cy: number; r: number};

const circleSubpath = ({cx, cy, r}: Punch) =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;

/**
 * A piece of paper: hand-cut outline, paper grain, a soft sheen and a real
 * two-part cast shadow (tight contact + wide ambient). The shadow is what lets
 * the card hold up over both the dark workshop bench and the bright print room.
 */
export const PaperCard: React.FC<{
  width: number;
  height: number;
  seed: string;
  tone?: ToneName;
  torn?: Edge[];
  punch?: Punch;
  /** Paper grain. Off for very large sheets - feTurbulence is per-pixel. */
  grain?: boolean;
  /** Tear depth in px. Scale this up on large sheets or the tear vanishes. */
  tornAmp?: number;
  children?: React.ReactNode;
  contentStyle?: React.CSSProperties;
}> = ({width, height, seed, tone = 'tissue', torn = ['right'], punch, grain = true, tornAmp, children, contentStyle}) => {
  const t = tones[tone];
  const pad = 160;
  const outline = cutRectPath({w: width, h: height, seed, torn, tornAmp});
  // Appending the hole as a second subpath and filling even-odd punches a real
  // hole through the card rather than painting a fake one on top.
  const d = punch ? `${outline} ${circleSubpath(punch)}` : outline;
  const gid = `pc${safeId(seed)}`;

  return (
    <div style={{position: 'relative', width, height}}>
      <svg
        width={width + pad * 2}
        height={height + pad * 2}
        viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
        style={{
          position: 'absolute',
          left: -pad,
          top: -pad,
          overflow: 'visible',
          filter:
            'drop-shadow(0 8px 10px rgba(0,0,0,0.30)) drop-shadow(0 42px 66px rgba(0,0,0,0.36))',
        }}
      >
        <defs>
          <clipPath id={`${gid}clip`}>
            <path d={d} clipRule="evenodd" />
          </clipPath>
          <linearGradient id={`${gid}sheen`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
          </linearGradient>
          <filter id={`${gid}grain`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="11" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
          </filter>
        </defs>

        <path d={d} fill={t.base} fillRule="evenodd" />
        {grain ? <rect
          x={0}
          y={0}
          width={width}
          height={height}
          clipPath={`url(#${gid}clip)`}
          filter={`url(#${gid}grain)`}
          opacity={tone === 'slate' ? 0.16 : 0.11}
          style={{mixBlendMode: tone === 'slate' ? 'screen' : 'multiply'}}
        /> : null}
        <path d={d} fill={`url(#${gid}sheen)`} fillRule="evenodd" />
        {/* Clipped stroke: only its inner half shows, reading as the pale
            fibrous core you see along the thickness of a cut sheet. */}
        <path
          d={d}
          fill="none"
          stroke={tone === 'slate' ? '#000000' : '#ffffff'}
          strokeOpacity={0.5}
          strokeWidth={11}
          clipPath={`url(#${gid}clip)`}
        />
        <path d={d} fill="none" stroke={t.edge} strokeWidth={3} strokeOpacity={0.9} />
      </svg>

      <div style={{position: 'absolute', inset: 0, ...contentStyle}}>{children}</div>
    </div>
  );
};
