import React from 'react';
import {C, FONT, GROUND, H, SELVEDGE_W, W} from './design';

/**
 * The parts every card shares: the ground, the twill, the selvedge strip.
 */

/**
 * THE GROUND.
 *
 * Flat by default, because that is what the references are — a single unique
 * RGB across an 850x230 empty region, #141C30, which is the exact channel-wise
 * mean of the brief's `indigo` and `indigoDeep`. The brief describes a graded
 * ground (`indigoDeep` is called a "vignette", and `#bg` and `#bg-twill` are
 * both listed as animatable), so both layers are built and can be switched on
 * from GROUND in design.ts. See the note there for why the reference wins.
 */
export const Ground: React.FC<{gradient?: boolean; twill?: boolean}> = ({
  gradient = GROUND.gradient,
  twill = GROUND.twill,
}) => (
  <>
    <defs>
      <radialGradient id="bg-grad" cx="0.42" cy="0.36" r="0.86">
        <stop offset="0" stopColor={C.indigo} />
        <stop offset="1" stopColor={C.indigoDeep} />
      </radialGradient>
      {/* Right-hand twill, the way it runs on a denim bolt. */}
      <pattern id="bg-twill-p" patternUnits="userSpaceOnUse" width={10} height={10}>
        <line x1={0} y1={10} x2={10} y2={0} stroke="#FFFFFF" strokeWidth={2.4} opacity={0.02} />
      </pattern>
    </defs>
    <rect
      id="bg"
      x={0}
      y={0}
      width={W}
      height={H}
      fill={gradient ? 'url(#bg-grad)' : GROUND.flat}
    />
    {twill ? (
      <rect id="bg-twill" x={0} y={0} width={W} height={H} fill="url(#bg-twill-p)" />
    ) : null}
  </>
);

/**
 * THE SELVEDGE STRIP — "the brand's signature ... It should be present on
 * every card and should never move." (§3, §6.4)
 *
 * Every part of it was measured off the reference rather than approximated,
 * because it is on all thirteen cards and a wrong edge would be wrong
 * thirteen times:
 *
 *   - the band is 93px, ecru, with a 2px darker edge at x 91..92;
 *   - the weft is a 1px pick every 3 rows, exactly on y % 3 === 0;
 *   - the red ID line is DASHED, 9 on and 5 off, 5px wide at x 45..49,
 *     starting on a dash at y=0 — that is what makes it read as stitching
 *     rather than a printed rule, and why the brief calls the entry "thread
 *     being sewn";
 *   - the inner fold is NOT a straight line. It is a twisted cord that
 *     oscillates between x=2 and x=10 on a 9-row cycle. Drawing it straight
 *     was the only structural difference left against the reference after
 *     everything else matched, and it showed up as an identical 4,080-pixel
 *     discrepancy on all three cards checked.
 *
 * `wipe` is how much of the strip is present, 0..1, from the top.
 * `sewn` is how far the stitching has been sewn, 0..1, trailing the wipe.
 */

/** The cord's run on each row of its cycle, as [x, width]. Measured. */
const FOLD: [number, number][] = [
  [2, 4],
  [2, 6],
  [6, 4],
  [8, 3],
  [9, 2],
  [9, 2],
  [8, 3],
  [6, 4],
  [2, 6],
];
const FOLD_CYCLE = FOLD.length; // 9
const DASH = 9;
const DASH_GAP = 5;

export const Selvedge: React.FC<{wipe: number; sewn: number}> = ({wipe, sewn}) => {
  const period = DASH + DASH_GAP;
  const n = Math.ceil(H / period) + 1;
  const bandH = H * Math.max(0, Math.min(1, wipe));
  const sewnTo = H * Math.max(0, Math.min(1, sewn));
  const width = SELVEDGE_W + 1; // 93: x 0..92 inclusive

  return (
    <g id="selvedge">
      <defs>
        <pattern id="selvedge-weft" patternUnits="userSpaceOnUse" width={width} height={3}>
          <rect x={0} y={0} width={width} height={1} fill={C.selvedgeWeft} />
        </pattern>
        <pattern
          id="selvedge-fold"
          patternUnits="userSpaceOnUse"
          width={12}
          height={FOLD_CYCLE}
        >
          {FOLD.map(([x, w], i) => (
            <rect key={i} x={x} y={i} width={w} height={1} fill={C.selvedgeFold} />
          ))}
        </pattern>
      </defs>

      <rect x={0} y={0} width={width} height={bandH} fill={C.selvedge} />
      <rect x={0} y={0} width={width} height={bandH} fill="url(#selvedge-weft)" />
      <rect x={0} y={0} width={12} height={bandH} fill="url(#selvedge-fold)" />
      <rect x={91} y={0} width={2} height={bandH} fill={C.selvedgeEdge} />

      {/* The ID line, stitched in sequence so it reads as being sewn. */}
      <g id="selvedge-stitches">
        {Array.from({length: n}).map((_, i) => {
          const y = i * period;
          if (y >= sewnTo) return null;
          // The dash currently under the needle is clipped to how far the
          // stitching has got, so the line grows a stitch at a time instead of
          // popping whole dashes into place.
          const h = Math.min(DASH, sewnTo - y);
          return <rect key={i} x={45} y={y} width={5} height={h} fill={C.red} />;
        })}
      </g>
    </g>
  );
};

/**
 * Collapses runs of whitespace, the way an HTML text node does.
 *
 * The references are inconsistent about this and both behaviours have to be
 * reproduced to match them. The part label, which is composed in code, keeps
 * its double spaces — measured 424 against 425 rendered as-is and 411
 * collapsed. The `pieces` and `extra` strings, which come from chapters.json
 * with double spaces around every separator, are collapsed — measured 589
 * against 590 collapsed and 636 as-is, and the same on all four samples. So
 * whitespace handling is per-field rather than global.
 */
export const collapse = (t: string) => t.replace(/\s+/g, ' ');

/** Left-aligned SVG text at a measured baseline. */
export const T: React.FC<{
  x: number;
  y: number;
  size: number;
  weight: number;
  colour: string;
  track?: number;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
  children: React.ReactNode;
  id?: string;
}> = ({x, y, size, weight, colour, track = 0, anchor = 'start', opacity = 1, children, id}) => (
  <text
    id={id}
    x={x}
    y={y}
    fontFamily={FONT}
    fontSize={size}
    fontWeight={weight}
    letterSpacing={track}
    fill={colour}
    opacity={opacity}
    textAnchor={anchor}
    style={{whiteSpace: 'pre'}}
  >
    {children}
  </text>
);
