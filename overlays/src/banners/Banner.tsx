import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../chapters/design';
import {ClothDefs, ClothFill} from './cloth';

/**
 * THE UNROLLING BANNER — the shell every drop-in reminder is built on.
 *
 * A length of cloth on a bar that drops into a top corner, unrolls, holds, and
 * winds back up. The physics and the furniture live here; what the cloth SAYS
 * is passed in, so a new reminder is a block of text and a colour rather than
 * a second copy of all this.
 *
 * WHY IT BEHAVES AS IT DOES:
 *
 *  - The content is printed ON the cloth and revealed by the unroll, never
 *    faded in separately. That is what makes it read as an object rather than
 *    as a lower third, and it is the whole reason the clip path exists.
 *  - The drop is a spring, so the bolt overshoots and rebounds — cloth has
 *    momentum and card does not.
 *  - The swing is a SHEAR pinned at the bar, not a rotation. Rotating tilts the
 *    bar, which is screwed to a wall, and swings the cloth's top corners off it.
 *    A skew offsets each point in proportion to its depth below the bar: zero
 *    at the bar, most at the loose edge.
 *  - The bar arrives before the cloth can unroll from it and leaves after the
 *    cloth has wound up, so the first and last frames are genuinely empty. An
 *    overlay that pops into existence leaves a hard edge on the cut.
 */

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const IN = Math.round(0.95 * FPS);
export const HOLD = Math.round(4.2 * FPS);
export const OUT = Math.round(0.65 * FPS);
export const TOTAL = IN + HOLD + OUT;

const BAR_IN = 7;
const BAR_TRAVEL = 140;
const CLOTH_DELAY = 4;
const BAR_OUT = 9;

/** Inside a broadcast-safe margin, in whichever corner. */
export const MARGIN = 100;
const ROLLER_Y = 86;
const CLOTH_Y = 99;
/** The cloth starts behind the bar, so a shear can never open a gap up there. */
const TOP = ROLLER_Y - 4;
export const PAD = 44;
/** The selvedge runs down BOTH long edges, because on a bolt that is where it is. */
const SELV = 16;

export type BannerSide = 'left' | 'right';

export type BannerProps = {
  side?: BannerSide;
  width: number;
  height: number;
  base: string;
  deep: string;
  seed: string;
  /** The cloth's contents, given the top-left of the printable area. */
  children: (ctx: {x: number; y: number; w: number; openness: number}) => React.ReactNode;
};

export const Banner: React.FC<BannerProps> = ({
  side = 'left',
  width,
  height,
  base,
  deep,
  seed,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const X0 = side === 'left' ? MARGIN : W - MARGIN - width;

  const open = spring({
    frame: frame - CLOTH_DELAY,
    fps,
    config: {damping: 13, mass: 0.85, stiffness: 115},
    durationInFrames: IN + 14,
  });
  const close = interpolate(frame, [TOTAL - OUT, TOTAL - BAR_OUT], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t * t,
  });
  const barY =
    interpolate(frame, [0, BAR_IN], [-BAR_TRAVEL, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - (1 - t) ** 3,
    }) +
    interpolate(frame, [TOTAL - BAR_OUT, TOTAL - 1], [0, -BAR_TRAVEL], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => t * t,
    });

  const hRaw = height * open * close;
  const h = Math.max(0, hRaw);
  const openness = Math.min(1, h / height);

  const tIn = frame / fps;
  const swingIn = Math.sin(tIn * 9.5) * Math.exp(-tIn * 3.1) * 2.4;
  const tOut = Math.max(0, (frame - (TOTAL - OUT)) / fps);
  const swingOut = tOut > 0 ? Math.sin(tOut * 13) * Math.exp(-tOut * 4) * 1.7 : 0;
  const sway = (swingIn + swingOut) * Math.min(1, open);

  /** The loose edge is driven by the drop's VELOCITY, not its position. */
  const prev =
    height *
    springAt(frame - 1 - CLOTH_DELAY, fps) *
    closeAt(frame - 1);
  const flap = Math.max(-26, Math.min(26, (hRaw - prev) / 12));

  if (barY <= -BAR_TRAVEL + 1 && frame > TOTAL / 2) return null;

  const id = `bn-${seed}`;
  const bottom = CLOTH_Y + h;
  const P = edgePoints(X0, width, bottom, flap);
  const edgeD =
    `M ${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]} ${P[3][0]} ${P[3][1]}`;
  const clip = `${edgeD} L ${X0 + width} ${TOP} L ${X0} ${TOP} Z`;

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <ClothDefs id={id} seed={seed} w={width} h={height} />
          {/* The cloth is still curved where it leaves the bar, so the light
              falls off into it — a gradient, because two stacked rectangles
              left a hard line across the cloth where the second one ended. */}
          <linearGradient id={`${id}-roll`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000000" stopOpacity={0.5} />
            <stop offset="0.55" stopColor="#000000" stopOpacity={0.18} />
            <stop offset="1" stopColor="#000000" stopOpacity={0} />
          </linearGradient>
          <clipPath id={`${id}-clip`}>
            <path d={clip} />
          </clipPath>
        </defs>

        {/* The bar and everything hanging from it move together. */}
        <g transform={`translate(0 ${barY})`}>
          {/* What hangs shears about the bar. The bar itself does not. */}
          <g transform={`translate(0 ${ROLLER_Y}) skewX(${sway}) translate(0 ${-ROLLER_Y})`}>
            <g clipPath={`url(#${id}-clip)`}>
              <ClothFill
                id={id}
                seed={seed}
                base={base}
                deep={deep}
                x={X0}
                y={TOP}
                w={width}
                h={h + 60}
              />
              <rect x={X0} y={TOP} width={width} height={74} fill={`url(#${id}-roll)`} />

              {/* Selvedge down both edges, with its red ID line. */}
              {[X0, X0 + width - SELV].map((sx, i) => (
                <g key={i}>
                  <rect x={sx} y={TOP} width={SELV} height={h + 60} fill={C.selvedge} />
                  <rect x={sx} y={TOP} width={SELV} height={h + 60} fill="#000000" opacity={0.07} />
                  <line
                    x1={sx + SELV / 2}
                    y1={TOP}
                    x2={sx + SELV / 2}
                    y2={TOP + h + 60}
                    stroke={C.red}
                    strokeWidth={3}
                    strokeDasharray="8 6"
                  />
                  <rect
                    x={i === 0 ? sx + SELV : sx - 2}
                    y={TOP}
                    width={2}
                    height={h + 60}
                    fill="#000000"
                    opacity={0.25}
                  />
                </g>
              ))}

              {children({x: X0 + PAD, y: CLOTH_Y, w: width - PAD * 2, openness})}
            </g>

            <path d={edgeD} fill="none" stroke={deep} strokeWidth={3} opacity={0.85} />
            <Fray seed={seed} x0={X0} w={width} bottom={bottom} lift={flap} openness={openness} />
          </g>

          <Roller x0={X0} w={width} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const springAt = (f: number, fps: number) =>
  f < 0
    ? 0
    : spring({
        frame: f,
        fps,
        config: {damping: 13, mass: 0.85, stiffness: 115},
        durationInFrames: IN + 14,
      });

const closeAt = (f: number) =>
  interpolate(f, [TOTAL - OUT, TOTAL - BAR_OUT], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t * t,
  });

const edgePoints = (x0: number, w: number, bottom: number, lift: number): [number, number][] => [
  [x0, bottom + lift * 0.15],
  [x0 + w * 0.3, bottom + lift],
  [x0 + w * 0.62, bottom - lift * 0.8],
  [x0 + w, bottom + lift * 0.25],
];

const onEdge = (P: [number, number][], t: number): [number, number] => {
  const u = 1 - t;
  return [
    u ** 3 * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t ** 3 * P[3][0],
    u ** 3 * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t ** 3 * P[3][1],
  ];
};

/**
 * Loose weft threads off the cut edge — a raw edge, not a hem, because it has
 * just come off the roll.
 *
 * It took three goes. Evenly spaced plumb threads read as a comb; giving them a
 * lean and a uniform length turned them into grass. What works is a SQUARED
 * length distribution, so most fibres are short and a few pull long, and about
 * a third drawn as the dark warp rather than the pale weft — a raw denim edge
 * sheds both yarns.
 */
const Fray: React.FC<{
  seed: string;
  x0: number;
  w: number;
  bottom: number;
  lift: number;
  openness: number;
}> = ({seed, x0, w, bottom, lift, openness}) => {
  const n = Math.round((w / 820) * 88);
  const P = edgePoints(x0, w, bottom, lift);
  return (
    <g opacity={Math.min(1, openness * 1.6)}>
      {Array.from({length: n}).map((_, i) => {
        const p = (i + 0.5) / n;
        const t = (SELV + p * (w - SELV * 2)) / w;
        const [x, y] = onEdge(P, t);
        const r = random(`${seed}-f${i}`);
        const len = 3 + r * r * 18;
        const drift = lift * 0.3 * (0.3 + random(`${seed}-d${i}`));
        const lean = (random(`${seed}-a${i}`) - 0.5) * 5;
        return (
          <line
            key={i}
            x1={x}
            y1={y - 2}
            x2={x + drift + lean}
            y2={y + len}
            stroke={random(`${seed}-c${i}`) > 0.62 ? '#5A6478' : C.selvedge}
            strokeWidth={1 + random(`${seed}-w${i}`) * 0.8}
            opacity={0.3 + random(`${seed}-o${i}`) * 0.45}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** The bar it hangs from. Turned wood with brass caps — not a machine. */
const Roller: React.FC<{x0: number; w: number}> = ({x0, w}) => {
  const x1 = x0 - 30;
  const x2 = x0 + w + 30;
  return (
    <g>
      <rect x={x1} y={ROLLER_Y - 13} width={x2 - x1} height={26} rx={13} fill="#6B4A2B" />
      <rect x={x1} y={ROLLER_Y - 13} width={x2 - x1} height={11} rx={5} fill="#FFFFFF" opacity={0.16} />
      <rect x={x1} y={ROLLER_Y + 3} width={x2 - x1} height={9} rx={4} fill="#000000" opacity={0.28} />
      {[x1 + 9, x2 - 9].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={ROLLER_Y} r={17} fill={C.gold} />
          <circle cx={cx} cy={ROLLER_Y} r={17} fill="#000000" opacity={0.18} />
          <circle cx={cx - 2} cy={ROLLER_Y - 3} r={13} fill={C.gold} />
          <circle cx={cx} cy={ROLLER_Y} r={4.5} fill="#000000" opacity={0.45} />
        </g>
      ))}
    </g>
  );
};

/** A bobbing arrow. A static arrow asking you to look down is a sign; a moving
 *  one is a nudge. */
export const Arrow: React.FC<{x: number; y: number; t: number; show: number; colour: string}> = ({
  x,
  y,
  t,
  show,
  colour,
}) => {
  const bob = Math.sin(t * 3.4) * 5;
  return (
    <g opacity={show * 0.95} transform={`translate(${x} ${y + bob})`}>
      <line
        x1={0}
        y1={-26}
        x2={0}
        y2={20}
        stroke={colour}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray="9 7"
      />
      <path
        d="M -15 10 L 0 28 L 15 10"
        fill="none"
        stroke={colour}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};
