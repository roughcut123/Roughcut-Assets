import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../chapters/design';

/**
 * THE PATTERN REMINDER — a bolt of denim unrolled from the top-left corner.
 *
 * A two-hour build is long enough that plenty of people will be watching
 * without having downloaded the pattern. This drops in four or five times to
 * catch them, so it has to do its job in one glance and then get out of the
 * way.
 *
 * WHY IT IS BUILT THIS WAY, since it is deliberately not the chapter cards:
 *
 *  - The text is PRINTED ON THE CLOTH, not animated separately. Everything
 *    else in this library fades or stitches its type in on its own schedule;
 *    here the unroll itself is the reveal, because that is what unrolling a
 *    printed bolt actually does. It is the one thing that makes this read as a
 *    physical object rather than as a lower third.
 *  - It has WEIGHT. The chapter cards were told "nothing bouncy" and that was
 *    right for a title page. A bolt of cloth dropping has momentum: it
 *    overshoots, rebounds, and swings a degree or so before it settles, and
 *    the loose bottom edge lags behind the rest. That is the fun, and it is
 *    physics rather than decoration.
 *  - The bottom is a RAW EDGE with loose weft threads, not a hem. It has just
 *    come off the roll and nobody has finished it yet.
 *
 * It keeps the chapter cards' palette and typeface, because it sits in the
 * same cut as those and should look like it belongs.
 *
 * Delivered with alpha throughout — unlike the chapter cards this is an
 * overlay, so everything outside the cloth is transparent.
 */

export const W = 1920;
export const H = 1080;
export const FPS = 30;

/** 0.95s to unroll, 4.2s to read, 0.65s to wind back up. */
export const IN = Math.round(0.95 * FPS);
export const HOLD = Math.round(4.2 * FPS);
export const OUT = Math.round(0.65 * FPS);
export const TOTAL = IN + HOLD + OUT; // 175

/**
 * The bar arrives before the cloth can unroll from it, and leaves after the
 * cloth has wound back up. Without this the first frame pops a roller into
 * existence and the last frame cuts one away mid-air — measured, the last
 * frame still carried 2.35% coverage. It travels far enough to clear the top
 * of the frame completely.
 */
const BAR_IN = 7;
const BAR_TRAVEL = 140;
/** The cloth starts unrolling once the bar has arrived. */
const CLOTH_DELAY = 4;
/** The cloth is fully wound up this many frames before the bar leaves. */
const BAR_OUT = 9;

/** Top-left, inside a broadcast-safe margin. */
const ROLLER_Y = 86;
const X0 = 100;
const BAN_W = 760;
const Y0 = 99;
const BAN_H = 310;
const PAD = 44;
/** The selvedge runs down BOTH long edges, because on a bolt that is where it is. */
const SELV = 16;

/** The cloth starts behind the bar, so a shear can never open a gap up there. */
const TOP = ROLLER_Y - 4;

const DEEP = '#0E1626';

/** The four control points of the raw edge, at a given droop. */
const edgePoints = (bottom: number, lift: number): [number, number][] => [
  [X0, bottom + lift * 0.15],
  [X0 + BAN_W * 0.3, bottom + lift],
  [X0 + BAN_W * 0.62, bottom - lift * 0.8],
  [X0 + BAN_W, bottom + lift * 0.25],
];

/** A point on that cubic. */
const onEdge = (P: [number, number][], t: number): [number, number] => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0],
    a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1],
  ];
};

type Props = {
  /** Which pattern this is advertising. */
  garment?: string;
  headline?: [string, string];
  sub?: string;
  seed?: string;
};

export const PatternDrop: React.FC<Props> = ({
  garment = 'THE KEYSTONE JACKET',
  headline = ['PATTERN AVAILABLE', 'TO DOWNLOAD'],
  sub = 'Check the description for the link',
  seed = 'A',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  /**
   * The drop. A spring rather than an ease, because a roll of cloth released
   * from a bar does not decelerate smoothly into place — it falls, overshoots
   * a little and rebounds. Damping is set low enough to see that once and no
   * more; any softer and it wobbles like jelly, which is the wrong material.
   */
  const open = spring({
    frame: frame - CLOTH_DELAY,
    fps,
    config: {damping: 13, mass: 0.85, stiffness: 115},
    durationInFrames: IN + 14,
  });

  /** Winding back up is faster than falling and accelerates into the roller. */
  const close = interpolate(frame, [TOTAL - OUT, TOTAL - BAR_OUT], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t * t,
  });

  /** The bar drops in, then lifts back out of frame at the end. */
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

  const hRaw = BAN_H * open * close;
  const h = Math.max(0, hRaw);
  const openness = Math.min(1, h / BAN_H);

  /**
   * Swing — as a SHEAR pinned at the bar, not a rotation of the whole thing.
   *
   * Rotating the group was the obvious move and it was wrong twice over. It
   * tilted the roller, which is screwed to a wall and cannot tilt; and it swung
   * the cloth's top corners away from the bar, opening a gap on one side of up
   * to thirteen pixels. A skewX about the bar's own height offsets every point
   * in proportion to how far below the bar it is — which is zero at the bar and
   * greatest at the loose bottom edge. That is how a hanging cloth actually
   * moves, and it keeps the top pinned for free.
   */
  const tIn = frame / fps;
  const swingIn = Math.sin(tIn * 9.5) * Math.exp(-tIn * 3.1) * 2.4;
  const tOut = Math.max(0, (frame - (TOTAL - OUT)) / fps);
  const swingOut = tOut > 0 ? Math.sin(tOut * 13) * Math.exp(-tOut * 4) * 1.7 : 0;
  // More cloth hanging, more swing in it.
  const sway = (swingIn + swingOut) * Math.min(1, (BAN_H * open) / BAN_H);

  /**
   * The loose bottom edge lags whatever the rest of the cloth is doing. Driven
   * by the drop's VELOCITY rather than its position, so the edge whips while
   * the bolt is moving and lies still once it has arrived — which is the
   * difference between cloth and cardboard.
   */
  const vel = (hRaw - BAN_H * springAt(frame - 1 - CLOTH_DELAY, fps) * closeAt(frame - 1)) / 12;
  const flap = Math.max(-26, Math.min(26, vel));

  // Nothing left to draw once the bar has cleared the top of the frame.
  if (barY <= -BAR_TRAVEL + 1 && frame > TOTAL / 2) return null;

  const id = `pd-${seed}`;
  const bottom = Y0 + Math.max(0, h);

  /**
   * The raw edge: a shallow wave that deepens while the cloth is moving. Kept
   * as its four control points so the fray can be hung from the curve itself
   * rather than from an approximation of it — threads that float off the hem
   * are the first thing that gives an effect away.
   */
  const P = edgePoints(bottom, flap);
  const edgeD =
    `M ${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]} ${P[3][0]} ${P[3][1]}`;
  const clip = `${edgeD} L ${X0 + BAN_W} ${TOP} L ${X0} ${TOP} Z`;

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          {/* Right-hand twill, the way it runs on a bolt. */}
          <pattern id={`${id}-twill`} patternUnits="userSpaceOnUse" width={9} height={9}>
            <line x1={0} y1={9} x2={9} y2={0} stroke="#FFFFFF" strokeWidth={2.2} opacity={0.035} />
          </pattern>
          {/* Undyed flecks in the yarn. */}
          <pattern id={`${id}-slub`} patternUnits="userSpaceOnUse" width={140} height={190}>
            {Array.from({length: 18}).map((_, i) => (
              <circle
                key={i}
                cx={random(`${seed}-sx${i}`) * 140}
                cy={random(`${seed}-sy${i}`) * 190}
                r={0.8 + random(`${seed}-sr${i}`) * 1.5}
                fill="#FFFFFF"
                opacity={0.1}
              />
            ))}
          </pattern>
          {/* The cloth is still curved where it leaves the bar, so the light
              falls off into it. A gradient rather than two stacked rectangles,
              which left a hard line across the cloth where the second one
              ended. */}
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
        {/* Everything that hangs shears about the bar. The bar itself does not. */}
        <g transform={`translate(0 ${ROLLER_Y}) skewX(${sway}) translate(0 ${-ROLLER_Y})`}>
          {/* ---- the cloth ------------------------------------------------ */}
          <g clipPath={`url(#${id}-clip)`}>
            <rect x={X0} y={TOP} width={BAN_W} height={h + 60} fill={C.indigo} />
            <rect x={X0} y={TOP} width={BAN_W} height={h + 60} fill={DEEP} opacity={0.55} />
            <rect x={X0} y={TOP} width={BAN_W} height={h + 60} fill={`url(#${id}-twill)`} />
            <rect x={X0} y={TOP} width={BAN_W} height={h + 60} fill={`url(#${id}-slub)`} />

            <rect x={X0} y={TOP} width={BAN_W} height={74} fill={`url(#${id}-roll)`} />

            {/* Selvedge down both edges, with its red ID line. */}
            {[X0, X0 + BAN_W - SELV].map((sx, i) => (
              <g key={i}>
                <rect x={sx} y={TOP} width={SELV} height={h + 60} fill={C.selvedge} />
                <rect x={sx} y={TOP} width={SELV} height={h + 60} fill="#000000" opacity={0.07} />
                <g stroke={C.red} strokeWidth={3} strokeDasharray="8 6">
                  <line x1={sx + SELV / 2} y1={TOP} x2={sx + SELV / 2} y2={TOP + h + 60} />
                </g>
                <rect x={i === 0 ? sx + SELV : sx - 2} y={TOP} width={2} height={h + 60}
                  fill="#000000" opacity={0.25} />
              </g>
            ))}

            {/* ---- what it says. Printed on the cloth, so the unroll is the
                     reveal — no separate fade. -------------------------- */}
            <text
              x={X0 + PAD}
              y={Y0 + 58}
              fontFamily={FONT}
              fontSize={24}
              fontWeight={700}
              letterSpacing={2}
              fill={C.gold}
            >
              {garment}
            </text>
            <rect x={X0 + PAD} y={Y0 + 76} width={64} height={4} fill={C.gold} />

            {headline.map((l, i) => (
              <text
                key={i}
                x={X0 + PAD}
                y={Y0 + 146 + i * 66}
                fontFamily={FONT}
                fontSize={60}
                fontWeight={700}
                fill={C.cream}
              >
                {l}
              </text>
            ))}

            <text
              x={X0 + PAD}
              y={Y0 + 262}
              fontFamily={FONT}
              fontSize={30}
              fontWeight={400}
              fill={C.sub}
            >
              {sub}
            </text>

            {/* An arrow pointing the way the description actually is. It bobs,
                because a static arrow asking you to look down is a sign and a
                moving one is a nudge. */}
            <Arrow
              x={X0 + BAN_W - 96}
              y={Y0 + 232}
              t={frame / fps}
              show={Math.max(0, Math.min(1, (openness - 0.86) / 0.1))}
            />
          </g>

          {/* ---- the raw edge, and the threads hanging off it -------------- */}
          <path d={edgeD} fill="none" stroke={DEEP} strokeWidth={3} opacity={0.85} />
          <Fray seed={seed} bottom={bottom} lift={flap} openness={openness} />
        </g>

        {/* The bar does not tilt, however hard the cloth swings. */}
        <Roller />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Spring position at an arbitrary frame, for the velocity estimate. */
const springAt = (f: number, fps: number) =>
  f < 0 ? 0 : spring({frame: f, fps, config: {damping: 13, mass: 0.85, stiffness: 115}, durationInFrames: IN + 14});

const closeAt = (f: number) =>
  interpolate(f, [TOTAL - OUT, TOTAL - BAR_OUT], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => t * t,
  });

/**
 * Loose weft threads off the cut edge. They follow the same wave the edge
 * does and swing a beat behind it, and no two are the same length — a row of
 * identical threads reads as a fringe trim, which is the opposite of the point.
 */
const Fray: React.FC<{seed: string; bottom: number; lift: number; openness: number}> = ({
  seed,
  bottom,
  lift,
  openness,
}) => {
  const n = 88;
  const P = edgePoints(bottom, lift);
  return (
    <g opacity={Math.min(1, openness * 1.6)}>
      {Array.from({length: n}).map((_, i) => {
        // Spread across the cloth between the two selvedges, which do not fray
        // — a finished edge is the whole point of a selvedge.
        const p = (i + 0.5) / n;
        const t = (SELV + p * (BAN_W - SELV * 2)) / BAN_W;
        const [x, y] = onEdge(P, t);
        // Squared, so most fibres are short and a few pull long. A uniform
        // distribution gives every thread a similar length and the edge reads
        // as grass rather than as cloth someone has cut.
        const r = random(`${seed}-f${i}`);
        const len = 3 + r * r * 18;
        // Threads trail the edge's movement, and not all by the same amount.
        const drift = lift * 0.3 * (0.3 + random(`${seed}-d${i}`));
        // Each also hangs at its own angle. Without this they are all plumb
        // and evenly spaced, which reads as a comb rather than as a cut edge.
        // A raw denim edge sheds BOTH yarns, so roughly a third of them are
        // the dark warp rather than the pale weft.
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
const Roller: React.FC = () => {
  const x1 = X0 - 30;
  const x2 = X0 + BAN_W + 30;
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

const Arrow: React.FC<{x: number; y: number; t: number; show: number}> = ({x, y, t, show}) => {
  const bob = Math.sin(t * 3.4) * 5;
  return (
    <g opacity={show * 0.95} transform={`translate(${x} ${y + bob})`}>
      <line x1={0} y1={-26} x2={0} y2={20} stroke={C.gold} strokeWidth={5} strokeLinecap="round"
        strokeDasharray="9 7" />
      <path d="M -15 10 L 0 28 L 15 10" fill="none" stroke={C.gold} strokeWidth={6}
        strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
