import React from 'react';
import {random} from 'remotion';

/**
 * THE MATERIAL, from the Keystone jacket photographs.
 *
 * Ten shots of the real garment said the same three things, and they are what
 * separate "blue rectangle" from "denim":
 *
 *   1. The topstitch is DOUBLE and it is ochre. Two rows about 12px apart at
 *      this scale, lockstitch-dashed, and on the yoke and pocket mouth it goes
 *      to three. It is the loudest thing in every photograph — louder than the
 *      hardware — and drawing it as one thin gold line was the single biggest
 *      reason the first pass read as a diagram.
 *   2. Bartacks are an X in a box, not a blob. They are at every stress point:
 *      strap ends, placket, pocket mouth.
 *   3. The hardware is antique BRASS, warm and slightly green-brown. Steel-blue
 *      buckles were simply the wrong metal.
 *
 * The cloth itself is deep — much deeper than `--rc-indigo` alone — and it is
 * streaked vertically where the warp slubs, not evenly toned. All of that is
 * built from the §3.2 palette by tonal overlay, the way the fabric swatches
 * do it, so no colour is invented.
 */

export const OCHRE = 'var(--rc-gold)';
export const BRASS = 'var(--rc-gold)';
export const CLOTH = 'var(--rc-indigo)';
export const INK = 'var(--rc-ink)';
export const ECRU = 'var(--rc-paper)';

/** Right-hand twill and the undyed flecks, as two tiled patterns. */
export const DenimPatterns: React.FC<{id: string}> = ({id}) => (
  <>
    <pattern id={`${id}-twill`} patternUnits="userSpaceOnUse" width={14} height={28}>
      <line x1={0} y1={28} x2={14} y2={0} stroke={ECRU} strokeWidth={5} opacity={0.13} />
      <line x1={-14} y1={28} x2={0} y2={0} stroke={ECRU} strokeWidth={5} opacity={0.13} />
    </pattern>
    <pattern id={`${id}-slub`} patternUnits="userSpaceOnUse" width={150} height={310}>
      {[
        [17, 26, 3.0], [74, 11, 2.2], [126, 44, 2.6], [45, 71, 2.3], [104, 88, 3.1],
        [9, 116, 2.2], [63, 134, 2.8], [141, 155, 2.3], [35, 172, 3.0], [92, 191, 2.2],
        [119, 213, 2.6], [52, 231, 2.3], [14, 249, 3.0], [81, 61, 2.2], [66, 279, 2.4],
        [23, 295, 2.7],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={ECRU} opacity={0.5} />
      ))}
    </pattern>
  </>
);

/**
 * The cloth as a single tileable fill, for places that need a paint rather
 * than a painted rectangle — the chips a swarm rides in on, for instance.
 * The tile is wide so the warp streaking does not read as a repeat.
 */
export const DenimFill: React.FC<{id: string; seed: string}> = ({id, seed}) => (
  <pattern id={`${id}-cloth`} patternUnits="userSpaceOnUse" width={620} height={640}>
    <rect x={0} y={0} width={620} height={640} fill={CLOTH} />
    <rect x={0} y={0} width={620} height={640} fill={INK} opacity={0.34} />
    {Array.from({length: 14}).map((_, i) => (
      <rect
        key={i}
        x={i * 45}
        y={0}
        width={45}
        height={640}
        fill={random(`${seed}-fs${i}`) > 0.5 ? ECRU : INK}
        opacity={0.02 + random(`${seed}-fo${i}`) * 0.05}
      />
    ))}
    <rect x={0} y={0} width={620} height={640} fill={`url(#${id}-twill)`} />
    <rect x={0} y={0} width={620} height={640} fill={`url(#${id}-slub)`} />
  </pattern>
);

/**
 * Paints a shape as denim: the deepened ground, the vertical slub streaking
 * the warp leaves, the twill and the flecks. Pass the same shape as `clip`.
 */
export const Denim: React.FC<{id: string; seed: string; x: number; y: number; w: number; h: number}> = ({
  id, seed, x, y, w, h,
}) => (
  <>
    <rect x={x} y={y} width={w} height={h} fill={CLOTH} />
    {/* Raw indigo is deeper than the token on its own. */}
    <rect x={x} y={y} width={w} height={h} fill={INK} opacity={0.34} />
    {/* Streaked down the warp, never evenly toned. */}
    {Array.from({length: Math.ceil(w / 46)}).map((_, i) => (
      <rect
        key={i}
        x={x + i * 46}
        y={y}
        width={46}
        height={h}
        fill={random(`${seed}-st${i}`) > 0.5 ? ECRU : INK}
        opacity={0.02 + random(`${seed}-so${i}`) * 0.055}
      />
    ))}
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-twill)`} />
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-slub)`} />
  </>
);

/**
 * Double-row ochre topstitch along a path. This is the jacket's signature, so
 * it is a primitive rather than something each mechanic redraws.
 */
export const Topstitch: React.FC<{
  d: string;
  gap?: number;
  rows?: number;
  w?: number;
  dash?: string;
  opacity?: number;
}> = ({d, gap = 13, rows = 2, w = 6, dash = '15 9', opacity = 1}) => (
  <g fill="none" stroke={OCHRE} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" opacity={opacity}>
    {Array.from({length: rows}).map((_, i) => (
      <g key={i} transform={`translate(0 ${(i - (rows - 1) / 2) * gap})`}>
        <path d={d} />
      </g>
    ))}
  </g>
);

/**
 * A cut piece of cloth in mid-air throws a shadow onto whatever is behind it,
 * and without one a swarm of panels reads as wallpaper rather than as things
 * flying. One flat offset copy is enough — the light is up and to the left, so
 * the shadow goes down and to the right, matching the brass.
 */
export const Lift: React.FC<{d: string; r: number}> = ({d, r}) => (
  <path d={d} fill={INK} opacity={0.22} transform={`translate(${r * 0.07} ${r * 0.1})`} />
);

/** The X-in-a-box bartack that sits at every stress point on the garment. */
export const Bartack: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 26}) => (
  <g
    transform={`translate(${x} ${y})`}
    fill="none"
    stroke={OCHRE}
    strokeWidth={Math.max(3, s * 0.16)}
    strokeLinecap="round"
  >
    <rect x={-s / 2} y={-s / 2} width={s} height={s} />
    <line x1={-s / 2} y1={-s / 2} x2={s / 2} y2={s / 2} />
    <line x1={s / 2} y1={-s / 2} x2={-s / 2} y2={s / 2} />
  </g>
);

/**
 * CEL SHADING FOR THE BRASS.
 *
 * The first pass drew every rivet and buckle as a flat gold shape with a dark
 * outline, and at 4K they read as coins, not metal. What tells the eye "this
 * is a turned metal dome" is not a gradient — §3.4 rules those out and they
 * would fight the paper cut anyway — it is two flat crescents: the side the
 * light is on, and the side it is not.
 *
 * Both are made without a clip path, because a clip needs a unique id and
 * these draw hundreds of times per frame. Instead the disc is painted dark,
 * then the brass is painted back over it offset TOWARDS the light, which
 * leaves a dark crescent standing on the far side. A smaller, brighter disc
 * offset further the same way gives the lit face. The light is up and to the
 * left throughout, so a frame full of hardware is lit consistently.
 */
const LIT = 'var(--rc-paper)';

/** A brass disc with the recessed dark centre every button and rivet has. */
export const brassFace = (r: number, key?: string) => (
  <g key={key}>
    {/* the shadow side, revealed as a crescent by the brass laid back over it */}
    <circle cx={0} cy={0} r={r} fill={INK} opacity={0.5} />
    <circle cx={-r * 0.055} cy={-r * 0.075} r={r * 0.965} fill={BRASS} />
    {/* the lit face */}
    <circle cx={-r * 0.13} cy={-r * 0.17} r={r * 0.66} fill={LIT} opacity={0.2} />
    {/* the turned rim and the set centre */}
    <circle cx={0} cy={0} r={r * 0.78} fill="none" stroke={INK} strokeWidth={r * 0.05} opacity={0.4} />
    <circle cx={0} cy={0} r={r * 0.3} fill={INK} opacity={0.72} />
    <circle cx={0} cy={0} r={r * 0.13} fill={INK} />
    {/* specular: a short arc at ten o'clock, the one thing that says polished */}
    <path
      d={`M ${-r * 0.62} ${-r * 0.34} A ${r * 0.71} ${r * 0.71} 0 0 1 ${-r * 0.2} ${-r * 0.68}`}
      fill="none"
      stroke={LIT}
      strokeWidth={r * 0.1}
      strokeLinecap="round"
      opacity={0.6}
    />
    <circle cx={0} cy={0} r={r} fill="none" stroke={INK} strokeWidth={r * 0.09} />
  </g>
);

/**
 * The same trick for hardware that is a frame rather than a disc: the path is
 * painted dark, then re-painted in brass offset towards the light. Anything
 * drawn as `children` gets the treatment, so a buckle and an adjuster do not
 * each have to hand-place their own shading.
 */
export const Forged: React.FC<{d: string; r: number; rule?: 'evenodd' | 'nonzero'}> = ({
  d,
  r,
  rule = 'evenodd',
}) => (
  <g>
    <path d={d} fill={INK} fillRule={rule} opacity={0.5} />
    <g transform={`translate(${-r * 0.05} ${-r * 0.07})`}>
      <path d={d} fill={BRASS} fillRule={rule} />
      <path d={d} fill={LIT} fillRule={rule} opacity={0.16} transform={`translate(${-r * 0.03} ${-r * 0.05})`} />
    </g>
    <path d={d} fill="none" fillRule={rule} stroke={INK} strokeWidth={r * 0.1} strokeLinejoin="round" />
  </g>
);
