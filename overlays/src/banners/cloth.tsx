import React from 'react';
import {random} from 'remotion';

/**
 * WOVEN CLOTH, as a reusable material.
 *
 * The first banner painted flat indigo with a diagonal line pattern over it and
 * called that denim. It read as a blue rectangle, because the things that make
 * cloth look like cloth are not the weave — they are everything above it:
 *
 *  1. FOLDS. A hanging length is never flat. Soft vertical bands of light and
 *     shade, a few hundred pixels wide, are the single biggest reason a shape
 *     reads as fabric rather than as card. Nothing else here matters as much.
 *  2. WARP STREAK. Denim is dyed in the rope and woven in the piece, so it is
 *     never evenly toned down its length — there are always faint vertical
 *     stripes where the yarn took differently.
 *  3. GRAIN. A fine noise over everything, because a real surface has one. It
 *     is what stops the flat areas looking printed.
 *  4. The twill itself, which is the LEAST important of the four and wants to
 *     be nearly invisible. Real denim at this scale is about 190 wales across a
 *     banner this wide, so the diagonal is a texture, not a pattern of stripes.
 *  5. Slubs — the undyed flecks in the yarn.
 *
 * The base colour is a prop so the same cloth serves the indigo pattern banner
 * and the green WhatsApp one without the material being rebuilt for each.
 */

export type ClothProps = {
  /** Unique per instance: this emits ids into the document. */
  id: string;
  seed: string;
  /** The dyed colour of the yarn. */
  base: string;
  /** Deepest shade, for the fold shadows and the edges. */
  deep: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/** The defs half. Must be inside an <svg><defs>. */
export const ClothDefs: React.FC<Pick<ClothProps, 'id' | 'seed' | 'w' | 'h'>> = ({id, seed, w}) => (
  <>
    {/*
      Grain. feTurbulence makes its own output, so it does not need a source
      graphic — the rect it is applied to can be empty. Three octaves at a high
      base frequency is a fine, even tooth rather than clouds.
    */}
    <filter id={`${id}-grain`} x="0%" y="0%" width="100%" height="100%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.85"
        numOctaves="4"
        seed={Math.floor(random(`${seed}-grain`) * 9999)}
        result="n"
      />
      <feColorMatrix type="saturate" values="0" />
      {/* Pull the noise in around mid grey so it modulates rather than blows out. */}
      <feComponentTransfer>
        <feFuncR type="linear" slope="0.55" intercept="0.22" />
        <feFuncG type="linear" slope="0.55" intercept="0.22" />
        <feFuncB type="linear" slope="0.55" intercept="0.22" />
        <feFuncA type="linear" slope="0" intercept="1" />
      </feComponentTransfer>
    </filter>

    {/* The twill. 4px wale, which is about 190 across a banner this wide —
        the real count. Two lines per tile, one lit and one shaded, because a
        diagonal rib catches light on one side and hides it on the other. */}
    <pattern id={`${id}-twill`} patternUnits="userSpaceOnUse" width={4} height={4}>
      <line x1={0} y1={4} x2={4} y2={0} stroke="#FFFFFF" strokeWidth={1.1} opacity={0.05} />
      <line x1={-1} y1={3} x2={3} y2={-1} stroke="#000000" strokeWidth={1.1} opacity={0.07} />
    </pattern>

    {/* Undyed flecks in the yarn. */}
    <pattern id={`${id}-slub`} patternUnits="userSpaceOnUse" width={170} height={230}>
      {Array.from({length: 26}).map((_, i) => (
        <circle
          key={i}
          cx={random(`${seed}-sx${i}`) * 170}
          cy={random(`${seed}-sy${i}`) * 230}
          r={0.6 + random(`${seed}-sr${i}`) * 1.4}
          fill="#FFFFFF"
          opacity={0.07 + random(`${seed}-so${i}`) * 0.1}
        />
      ))}
    </pattern>

    {/* The folds: soft vertical bands across the width, placed irregularly. */}
    <linearGradient id={`${id}-folds`} x1="0" y1="0" x2="1" y2="0">
      {foldStops(seed, w)}
    </linearGradient>
  </>
);

/**
 * Fold stops. Deliberately uneven — evenly spaced folds read as corrugation,
 * and that is exactly what five of them at full strength produced on the first
 * try: a pleated curtain rather than a hanging bolt. Three, much softer and
 * much wider, is the difference between cloth that has weight and cloth that
 * has been crimped.
 *
 * Each fold is a shaded trough with a lit crest just off to one side, which is
 * how a fold actually catches light.
 */
const foldStops = (seed: string, w: number) => {
  const stops: React.ReactNode[] = [<stop key="s" offset="0" stopColor="#000000" stopOpacity={0.16} />];
  const n = 3;
  let at = 0;
  for (let i = 0; i < n; i++) {
    const span = (1 / n) * (0.55 + random(`${seed}-fw${i}`) * 0.9);
    const trough = at + span * (0.3 + random(`${seed}-ft${i}`) * 0.4);
    const crest = trough + span * 0.28;
    const deepIt = 0.045 + random(`${seed}-fd${i}`) * 0.075;
    const litIt = 0.018 + random(`${seed}-fl${i}`) * 0.04;
    stops.push(
      <stop key={`t${i}`} offset={Math.min(1, trough)} stopColor="#000000" stopOpacity={deepIt} />,
      <stop key={`c${i}`} offset={Math.min(1, crest)} stopColor="#FFFFFF" stopOpacity={litIt} />,
    );
    at += span;
  }
  stops.push(<stop key="e" offset="1" stopColor="#000000" stopOpacity={0.18} />);
  return stops;
};

/** The paint half. Draw inside whatever clip the cloth is meant to fill. */
export const ClothFill: React.FC<ClothProps> = ({id, seed, base, deep, x, y, w, h}) => (
  <>
    <rect x={x} y={y} width={w} height={h} fill={base} />
    <rect x={x} y={y} width={w} height={h} fill={deep} opacity={0.4} />

    {/* Warp streak: faint vertical stripes down the length, never even. */}
    <g>
      {Array.from({length: Math.ceil(w / 17)}).map((_, i) => {
        const r = random(`${seed}-warp${i}`);
        return (
          <rect
            key={i}
            x={x + i * 17}
            y={y}
            width={17}
            height={h}
            fill={r > 0.5 ? '#FFFFFF' : '#000000'}
            opacity={0.008 + random(`${seed}-warpo${i}`) * 0.022}
          />
        );
      })}
    </g>

    <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-twill)`} />
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-slub)`} />

    {/* Grain, multiplied in so it darkens and lifts rather than fogging. */}
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      filter={`url(#${id}-grain)`}
      opacity={0.3}
      style={{mixBlendMode: 'overlay'}}
    />

    {/* The folds go last so they shade everything beneath them. */}
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-folds)`} />
  </>
);
