import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS_H, CANVAS_W, TIMING} from '../lib/spec';
import {font, palette} from '../lib/theme';

/**
 * W1 — THE BLOCK. A print being pulled, in real time.
 *
 * Every other transition in the pack is a piece of paper being moved. This one
 * is a piece of paper being PRINTED, and the difference is the whole point: it
 * is for the final garment reveal, so it has to feel like the moment the work
 * is finished rather than the moment the chapter changed.
 *
 * WHY THIS IS THE THING THAT GOT BUILT.
 *
 * The brief was medieval, Japanese woodblock, old scroll, blackletter. Those
 * are not four different references — they are four corners of one idea, which
 * is an object made by hand and printed from a carved surface. A Fraktur page
 * and an ukiyo-e print are the same technology four hundred years apart: cut
 * away everything that is not the picture, ink what is left, press paper onto
 * it. So the transition is not decorated to look like those things; it PERFORMS
 * the process that produced them.
 *
 * Mokuhanga is printed one block per colour. You lay damp paper on the inked
 * block and rub it with a baren, and the image arrives under your hand in a
 * sweep rather than all at once. Then you lift the sheet, re-ink the next
 * block, register it against the kentō marks, and pull again. That is five
 * separate passes, and doing it in the right order with the key block first is
 * what the 25 cover frames actually are:
 *
 *     pass 1  the paper, and the key block — the carved linework
 *     pass 2  the deep sea
 *     pass 3  the mid water
 *     pass 4  the sky
 *     pass 5  the bole ground, and gold over it
 *
 * The passes alternate direction, because that is how a hand moves when it is
 * rubbing, and because five identical sweeps would read as a loading bar.
 *
 * WHITE IS NOT A COLOUR HERE. The foam is unprinted paper — no block carries
 * it. That is how the medium works, and it is also why the foam reads as bright
 * as it does: it is the only thing on the sheet with no ink on it at all.
 *
 * THE REGISTRATION IS DELIBERATELY IMPERFECT. Every colour lands a few pixels
 * off its line, and one of them stays off. A print in which every block is
 * exactly registered is a print made by a machine, and the entire brand is
 * built on the opposite claim.
 */

const {in: COVER, out: UNCOVER} = TIMING.transition;

/* --------------------------------------------------------------- geometry */

type P = [number, number];

/**
 * Catmull-Rom through the points, emitted as beziers.
 *
 * The wave is authored as a handful of points I can reason about — crest here,
 * trough there — rather than as bezier handles, which are impossible to seed
 * and impossible to nudge. The curve is derived from them.
 */
const smooth = (pts: P[], closed = false): string => {
  if (pts.length < 2) return '';
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${p[1][0]} ${p[1][1]}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2];
    d += ` C ${x1 + (x2 - x0) / 6} ${y1 + (y2 - y0) / 6}, ${x2 - (x3 - x1) / 6} ${y2 - (y3 - y1) / 6}, ${x2} ${y2}`;
  }
  return d + (closed ? ' Z' : '');
};

/** Straight segments, for anything carved with a rule rather than freehand. */
const polyPath = (pts: P[], closed = false) =>
  `M ${pts.map((q) => `${q[0]} ${q[1]}`).join(' L ')}${closed ? ' Z' : ''}`;

/**
 * A line with a width PROFILE, built as a closed shape rather than a stroke.
 *
 * A knife cut swells where the blade goes in and tapers where it comes out, so
 * a key line is never one width down its length. SVG cannot vary a stroke, so
 * the line is offset both ways by a profile function and closed. Stroking it
 * instead was the first attempt and looked like a pen drawing — perfectly
 * even, perfectly dead.
 */
const ribbon = (pts: P[], profile: (t: number) => number, seed: string, variant: number): string => {
  const n = pts.length;
  const up: P[] = [];
  const dn: P[] = [];
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[Math.max(0, i - 1)];
    const [nx, ny] = pts[Math.min(n - 1, i + 1)];
    let dx = nx - px;
    let dy = ny - py;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const t = i / (n - 1);
    const w = profile(t) * (0.8 + random(`${seed}-rw${variant}-${i}`) * 0.4);
    up.push([x - dy * w, y + dx * w]);
    dn.push([x + dy * w, y - dx * w]);
  }
  return `${smooth(up)} ${smooth(dn.reverse()).replace(/^M/, 'L')} Z`;
};

/** A carved key line: swells through the middle, tapers off both ends. */
const carved = (pts: P[], w0: number, w1: number, seed: string, variant: number): string =>
  ribbon(pts, (t) => (w0 + (w1 - w0) * t) * Math.sin(Math.PI * t) ** 0.55, seed, variant);

/** A foam finger: full width at the base, sharpened to nothing at the tip. */
const spike = (pts: P[], w: number, seed: string, variant: number): string =>
  ribbon(pts, (t) => w * (1 - t) ** 0.75, seed, variant);

/** Seeded wobble along a line's normal — the hand that held the knife. */
const wobble = (pts: P[], amp: number, seed: string, variant: number): P[] =>
  pts.map(([x, y], i) => {
    const a = (random(`${seed}-wx${variant}-${i}`) - 0.5) * amp;
    const b = (random(`${seed}-wy${variant}-${i}`) - 0.5) * amp;
    return [x + a, y + b] as P;
  });

/* ------------------------------------------------------------------- foam */

/**
 * One foam finger, and its children.
 *
 * Hokusai's foam is the reason that print is famous: the crest does not break
 * into spray, it breaks into FINGERS, and each finger breaks into smaller
 * fingers with the same hooked silhouette. It is self-similar, so it is drawn
 * recursively — which is also the only sane way to get sixty of them without
 * placing sixty of them by hand.
 *
 * The finger is walked out as a centreline that TURNS as it goes, which is what
 * makes the hook. The first version tried to place the tip and the two side
 * curves directly and produced self-intersecting tangles — a hook is a path
 * that curves, not three points you can guess.
 */
type Finger = {pts: P[]; w: number; depth: number};

const finger = (
  x: number,
  y: number,
  len: number,
  ang: number,
  turn: number,
  depth: number,
  seed: string,
  out: Finger[],
) => {
  if (depth > 2 || len < 40) return;
  const N = 9;
  const step = len / N;
  const pts: P[] = [];
  let cx = x;
  let cy = y;
  let a = ang;
  for (let i = 0; i <= N; i++) {
    pts.push([cx, cy]);
    cx += Math.cos(a) * step;
    cy += Math.sin(a) * step;
    a += turn / N;
  }
  out.push({pts, w: len * 0.19, depth});

  const kids = depth === 0 ? 3 : 2;
  for (let i = 0; i < kids; i++) {
    const at = 0.3 + random(`${seed}-ka${i}`) * 0.45;
    const j = Math.floor(at * N);
    finger(
      pts[j][0],
      pts[j][1],
      len * (0.36 + random(`${seed}-kl${i}`) * 0.22),
      ang + (turn * at) + (random(`${seed}-kd${i}`) - 0.5) * 1.5,
      turn * (0.8 + random(`${seed}-kt${i}`) * 0.7),
      depth + 1,
      `${seed}-${i}`,
      out,
    );
  }
};

/* ------------------------------------------------------------- the design */

/** Washi: warmer and softer than the vellum used for the cut-paper overlays. */
const WASHI = '#E7DAC0';
const WASHI_DEEP = '#D6C5A4';

/**
 * The picture, authored once at 4K and then printed block by block.
 *
 * The crest enters from the left, rises, and BREAKS to the right — over the top
 * and hooking back down, so there is a hollow under it. The first attempt drew
 * the crest as a single rising arc and got a swoosh, because a wave that does
 * not curl back on itself is just a diagonal. The curl is the whole silhouette.
 *
 * The break lands left of centre, which leaves the calm upper right for the
 * cartouche — the same division of the frame Hokusai used, for the same reason:
 * the title has to sit where the water is not.
 */
const design = (seed: string) => {
  const r = (k: string) => random(`${seed}-${k}`);

  /* The crest line: up the back of the wave, over the top, and hooking back
     underneath. This is the path the foam hangs from. The break lands left of
     centre so the curl is never behind the cartouche. */
  const crest: P[] = [
    [-300, 1800 + r('c0') * 70],
    [230, 1600 + r('c1') * 80],
    [700, 1330 + r('c2') * 90],
    [1080, 980 + r('c3') * 90],
    [1400, 670 + r('c4') * 80],
    [1690, 470 + r('c5') * 70],
    [1975, 420 + r('c6') * 60],
    [2200, 520 + r('c7') * 60],
    [2325, 730 + r('c8') * 60],
    [2300, 955 + r('c9') * 60],
    [2140, 1085 + r('ca') * 50],
    [1915, 1105 + r('cb') * 50],
  ];

  /* Where the sea surface continues past the wave: the horizon. */
  const horizon: P[] = [
    [2360, 1210],
    [2900, 1255],
    [3450, 1230],
    [4140, 1265],
  ];

  /**
   * The sea is ONE polygon — everything below the crest and the horizon, down
   * to the bottom of the sheet.
   *
   * It was two before, and the seam between them opened a band of bare paper
   * across the middle of the print. Worse, the first version listed the crest,
   * then the wave's underside, then the bottom corners, which closes across
   * itself: the fill rule then punched a wedge out of the water. A silhouette
   * that doubles back has to be authored as one boundary walked in one
   * direction, not as two edges hoping to meet.
   */
  const body: P[] = [...crest, ...horizon, [4140, 2360], [-300, 2360]];

  /* The lit face inside the wave — the mid tone following the crest down, so
     the wall of water has a front and a belly rather than one flat colour. */
  const face: P[] = [
    [-300, 1940],
    [430, 1760],
    [980, 1500],
    [1360, 1160],
    [1650, 810],
    [1890, 620],
    [2090, 660],
    [2180, 840],
    [2080, 990],
    [1850, 1020],
    [1560, 1160],
    [1150, 1390],
    [600, 1620],
    [-300, 1820],
  ];

  /* Foam, hung off the crest from the point it starts to break. */
  const foam: Finger[] = [];
  for (let i = 0; i < 10; i++) {
    const t = 0.34 + (i / 9) * 0.62;
    const f = t * (crest.length - 1);
    const idx = Math.min(crest.length - 2, Math.floor(f));
    const u = f - idx;
    const x = crest[idx][0] + (crest[idx + 1][0] - crest[idx][0]) * u;
    const y = crest[idx][1] + (crest[idx + 1][1] - crest[idx][1]) * u;
    finger(
      x,
      y - 14,
      230 + r(`fl${i}`) * 260,
      -1.5 + (i / 9) * 2.4 + (r(`fa${i}`) - 0.5) * 0.4,
      1.1 + r(`ft${i}`) * 1.5,
      0,
      `${seed}-f${i}`,
      foam,
    );
  }

  /* Two swells in the foreground, so the sea has depth instead of one edge. */
  const swellA: P[] = [
    [-300, 1980],
    [600, 1900],
    [1400, 1960],
    [2200, 1880],
    [3000, 1960],
    [3700, 1900],
    [4140, 1970],
  ];
  const swellB: P[] = [
    [-300, 2150],
    [800, 2080],
    [1700, 2140],
    [2700, 2070],
    [3600, 2140],
    [4140, 2090],
  ];

  return {crest, body, face, foam, horizon, swellA, swellB};
};

/* ------------------------------------------------------------- the passes */

/**
 * One pass of the baren.
 *
 * The ink arrives behind a soft diagonal front rather than fading up, because
 * fading up is what a computer does and rubbing is what a printer does. The
 * front is angled and the softness is wide — a baren is a pad, not a blade.
 */
type Pass = {from: number; to: number; dir: 1 | -1};

const passMask = (p: Pass, frame: number) => {
  const t = interpolate(frame, [p.from, p.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Travels far enough past both ends that the soft edge clears the frame.
  const SOFT = 0.22;
  const head = -SOFT + t * (1 + SOFT * 2);
  return {head, soft: SOFT, dir: p.dir, done: t >= 1, before: frame <= p.from};
};

/* ----------------------------------------------------------------- the peel */

/** Clip a convex polygon to the half-plane x + y <= c (or >= c). */
const clipHalf = (poly: P[], c: number, keepBelow: boolean): P[] => {
  const inside = (p: P) => (keepBelow ? p[0] + p[1] <= c : p[0] + p[1] >= c);
  const out: P[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ia = inside(a);
    const ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) {
      // Where the edge crosses x + y = c.
      const sa = a[0] + a[1];
      const sb = b[0] + b[1];
      const u = (c - sa) / (sb - sa);
      out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    }
  }
  return out;
};

const poly = (pts: P[]) => (pts.length ? `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(' L ')} Z` : 'M 0 0');

/* ------------------------------------------------------------------- W1 */

export type WoodblockProps = {
  seed: string;
  /** Blackletter display line. Short — Fraktur is read as a shape, not letter by letter. */
  gothic?: string;
  /** Roman capitals under it, where the actual information goes. */
  roman?: string;
};

export const W1Woodblock: React.FC<WoodblockProps> = ({
  seed,
  gothic = 'Behold',
  roman = 'THE FINISHED PIECE',
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const uncoverAt = durationInFrames - UNCOVER;
  const id = `wb-${seed}`;
  const D = design(seed);

  // The stop-motion boil: the cut is re-carved every few frames from a small
  // set of seeded variants, so the linework breathes the way a hand-pulled
  // print does when you flick through a stack of them.
  const variant = Math.floor(frame / 4) % 3;
  const v = (k: string) => `${seed}-${k}`;

  // Five passes, alternating direction, finishing exactly on cover.
  const passes: Record<string, Pass> = {
    key: {from: 0, to: 11, dir: 1},
    sea: {from: 8, to: 16, dir: -1},
    mid: {from: 11, to: 18, dir: 1},
    sky: {from: 13, to: 20, dir: -1},
    gold: {from: 16, to: COVER - 2, dir: 1},
  };

  // Registration. Each block lands a few pixels off and settles — except the
  // sky, which stays off, because one block always does.
  const reg = (k: string, p: Pass, restX: number, restY: number): [number, number] => {
    const settle = interpolate(frame, [p.to - 3, p.to + 5], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const offX = (random(v(`${k}rx`)) - 0.5) * 34;
    const offY = (random(v(`${k}ry`)) - 0.5) * 26;
    return [restX + offX * settle, restY + offY * settle];
  };

  /* --- the peel ------------------------------------------------------- */
  // s = x + y runs 0 at the top-left corner to 6000 at the bottom-right.
  // The fold sweeps from beyond the bottom-right back past the top-left.
  const SHEET: P[] = [
    [-700, -700],
    [CANVAS_W + 700, -700],
    [CANVAS_W + 700, CANVAS_H + 700],
    [-700, CANVAS_H + 700],
  ];
  const peel = interpolate(frame, [uncoverAt, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const C = interpolate(peel, [0, 1], [CANVAS_W + CANVAS_H + 1500, -1500]);
  const peeling = peel > 0;

  // The lifted part is foreshortened rather than folded flat: paper coming up
  // off a block curls toward you, it does not lie down on its own other half.
  // At f = 1 this is a flat fold and the flap covers everything still on the
  // block, which is exactly the bug that made the first version never clear.
  const FORE = 0.13;
  const k = (1 + FORE) / 2;
  // How far back the curl reaches from the fold, in s units — the gradient is
  // anchored to this so the shading always matches the flap's real width.
  const flapDepth = Math.max(1, FORE * (CANVAS_W + CANVAS_H + 1400 - C));
  const flapClip = clipHalf(SHEET, C, false).map(
    ([x, y]) => [x - k * (x + y - C), y - k * (x + y - C)] as P,
  );
  const flatClip = clipHalf(SHEET, C, true);

  return (
    <AbsoluteFill>
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          {/* One mask per block. The front is a hard-ish ramp with a wide soft
              shoulder: ink transfers under pressure, so the edge of a rubbed
              area is gradual on one side and abrupt on the other. */}
          {Object.entries(passes).map(([name, p]) => {
            const m = passMask(p, frame);
            /**
             * Before the pass starts and after it finishes the gradient is
             * flat, explicitly.
             *
             * Computing the two stops and clamping them into 0..1 collapses
             * them onto the same offset at the ends, and a gradient whose
             * stops coincide is undefined at that seam — it left a hairline of
             * ink down the first column of frame zero, which is 0.02% coverage
             * on a frame that has to be empty. Cheaper and exact to say so.
             */
            if (m.before || m.done) {
              const c = m.done ? '#fff' : '#000';
              return (
                <linearGradient key={name} id={`${id}-g-${name}`}>
                  <stop offset="0" stopColor={c} />
                  <stop offset="1" stopColor={c} />
                </linearGradient>
              );
            }
            const a = m.dir === 1 ? m.head - m.soft : 1 - m.head - m.soft;
            const b = m.dir === 1 ? m.head : 1 - m.head;
            const lo = Math.max(0, Math.min(1, Math.min(a, b)));
            const hi = Math.max(0, Math.min(1, Math.max(a, b)));
            return (
              <linearGradient
                key={name}
                id={`${id}-g-${name}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0.34"
                gradientUnits="objectBoundingBox"
              >
                <stop offset={lo} stopColor={m.dir === 1 ? '#fff' : '#000'} />
                <stop offset={Math.max(hi, lo + 0.001)} stopColor={m.dir === 1 ? '#000' : '#fff'} />
              </linearGradient>
            );
          })}
          {Object.keys(passes).map((name) => (
            <mask key={name} id={`${id}-m-${name}`}>
              <rect
                x={-800}
                y={-800}
                width={CANVAS_W + 1600}
                height={CANVAS_H + 1600}
                fill={`url(#${id}-g-${name})`}
              />
            </mask>
          ))}

          {/* Woodgrain. The block is a plank, and the flat areas pick it up
              under the baren — stretched hard along the grain direction. */}
          <filter id={`${id}-grain`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.19" numOctaves="3" seed={7} />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" intercept="0" />
            </feComponentTransfer>
          </filter>

          {/* Washi fibre: short, randomly laid, visible against the light. */}
          <filter id={`${id}-fibre`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7 0.04" numOctaves="4" seed={19} />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" intercept="0" />
            </feComponentTransfer>
          </filter>

          {/* Bokashi: the hand-wiped gradation at the top of a printed sky. */}
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9E5A57" stopOpacity={1} />
            <stop offset="0.55" stopColor={palette.rose} stopOpacity={0.62} />
            <stop offset="1" stopColor={palette.rose} stopOpacity={0.05} />
          </linearGradient>
          {/* Two pulls of the same block, dark over light, which is how depth
              is got in a print — there is no airbrush, only more ink. */}
          <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3D6E92" />
            <stop offset="0.42" stopColor={palette.lapis} />
            <stop offset="1" stopColor="#152B44" />
          </linearGradient>
          {/* The flap's underside: bright along the fold where it catches the
              light, falling away to shadow at the free edge.
              In USER SPACE, anchored to the fold line — as a bounding-box
              gradient it spanned the whole oversized sheet instead of the
              flap, and shaded a curl the width of the frame, which is to say
              not at all. */}
          <linearGradient
            id={`${id}-back`}
            gradientUnits="userSpaceOnUse"
            x1={C / 2}
            y1={C / 2}
            x2={C / 2 - flapDepth / 2}
            y2={C / 2 - flapDepth / 2}
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.62} />
            <stop offset="0.18" stopColor="#FFFFFF" stopOpacity={0.12} />
            <stop offset="0.5" stopColor={palette.ink} stopOpacity={0.12} />
            <stop offset="1" stopColor={palette.ink} stopOpacity={0.55} />
          </linearGradient>

          <clipPath id={`${id}-flat`}>
            <path d={poly(peeling ? flatClip : SHEET)} />
          </clipPath>
          <clipPath id={`${id}-flap`}>
            <path d={poly(peeling ? flapClip : [])} />
          </clipPath>
        </defs>

        {/* ---------------------------------------------- the sheet on the block */}
        <g clipPath={`url(#${id}-flat)`}>
          {/* PASS 1 — the paper, and the key block on it. */}
          <g mask={`url(#${id}-m-key)`}>
            <rect x={-800} y={-800} width={CANVAS_W + 1600} height={CANVAS_H + 1600} fill={WASHI} />
            <rect
              x={-800}
              y={-800}
              width={CANVAS_W + 1600}
              height={CANVAS_H + 1600}
              filter={`url(#${id}-fibre)`}
              opacity={0.5}
              style={{mixBlendMode: 'multiply'}}
            />
          </g>

          {/* PASS 2 — the deep sea: one polygon, crest to horizon to bottom. */}
          <g mask={`url(#${id}-m-sea)`} transform={`translate(${reg('sea', passes.sea, 0, 0).join(' ')})`}>
            <path d={smooth(wobble(D.body, 7, v('body'), variant), true)} fill={`url(#${id}-sea)`} />
            <path
              d={smooth(wobble([...D.swellB, [4140, 2360], [-300, 2360]], 7, v('swb'), variant), true)}
              fill={palette.lapis}
            />
          </g>

          {/* PASS 3 — the mid water: the lit face of the wall, and the swells
              in front. The belly of the wave keeps the deep block, so the water
              has a front and a back rather than one flat colour. */}
          <g mask={`url(#${id}-m-mid)`} transform={`translate(${reg('mid', passes.mid, 0, 0).join(' ')})`}>
            <path d={smooth(wobble(D.face, 9, v('face'), variant), true)} fill={palette.verdigris} />
            <path
              d={smooth(wobble([...D.swellA, [4140, 2360], [-300, 2360]], 7, v('swa'), variant), true)}
              fill={palette.verdigris}
              opacity={0.62}
            />
          </g>

          {/* PASS 4 — the sky. Wiped out toward the horizon. */}
          <g mask={`url(#${id}-m-sky)`} transform={`translate(${reg('sky', passes.sky, 0, 0).join(' ')})`}>
            <rect x={-800} y={-800} width={CANVAS_W + 1600} height={2150} fill={`url(#${id}-sky)`} />
          </g>

          {/* PASS 1 again — the key block sits ON TOP of every colour, because
              that is the order ink lands in. It is masked with the key pass, so
              the linework appears first and the colour arrives beneath it. */}
          <g mask={`url(#${id}-m-key)`}>
            {/* Foam is unprinted paper, so it is knocked back OUT of the colour
                rather than painted in — it is the only thing on the sheet with
                no ink on it at all. Fills first, then every outline over them,
                so a finger's line is never buried by its neighbour's fill. */}
            <g fill={WASHI}>
              {D.foam.map((f, i) => (
                <path key={i} d={spike(f.pts, f.w, v(`ff${i}`), variant)} />
              ))}
            </g>
            <g fill={palette.ink}>
              {D.foam.map((f, i) => (
                <path
                  key={i}
                  d={ribbon(
                    f.pts,
                    (t) => f.w * (1 - t) ** 0.75 + (f.depth === 0 ? 7 : f.depth === 1 ? 5 : 3.5),
                    v(`fo${i}`),
                    variant,
                  )}
                  fillRule="evenodd"
                />
              ))}
            </g>
            <g fill={WASHI}>
              {D.foam.map((f, i) => (
                <path key={i} d={spike(f.pts, f.w, v(`ff${i}`), variant)} />
              ))}
            </g>

            <g fill={palette.ink}>
              {/* the crest, the heaviest cut on the block */}
              <path d={carved(wobble(D.crest, 6, v('kc'), variant), 14, 26, v('kc'), variant)} />
              {/* the underside of the wave, running back into the trough */}
              <path
                d={carved(
                  wobble([[2290, 1130], [2040, 1230], [1700, 1390], [1240, 1560], [700, 1740], [-300, 1930]], 8, v('kb'), variant),
                  20, 8, v('kb'), variant,
                )}
              />
              {/* the lit face, a lighter cut */}
              <path d={carved(wobble(D.face.slice(0, 9), 7, v('kf'), variant), 7, 12, v('kf'), variant)} />
              {/* horizon and swells */}
              <path d={carved(wobble(D.horizon, 5, v('kh'), variant), 5, 5, v('kh'), variant)} />
              <path d={carved(wobble(D.swellA, 8, v('ka'), variant), 8, 16, v('ka'), variant)} />
              <path d={carved(wobble(D.swellB, 8, v('kd'), variant), 16, 7, v('kd'), variant)} />
            </g>
          </g>

          {/* PASS 5 — the cartouche: bole, then gold over it, then the letters. */}
          <g mask={`url(#${id}-m-gold)`} transform={`translate(${reg('gold', passes.gold, 0, 0).join(' ')})`}>
            <Cartouche id={id} seed={seed} variant={variant} gothic={gothic} roman={roman} frame={frame} />
          </g>

          {/* The woodgrain of the block, over the whole impression. */}
          <rect
            x={-800}
            y={-800}
            width={CANVAS_W + 1600}
            height={CANVAS_H + 1600}
            filter={`url(#${id}-grain)`}
            opacity={0.16}
            style={{mixBlendMode: 'multiply'}}
            mask={`url(#${id}-m-key)`}
          />
        </g>

        {/* ------------------------------------------------- the lifted flap */}
        {peeling ? (
          <g clipPath={`url(#${id}-flap)`}>
            <g transform={`matrix(${1 - k} ${-k} ${-k} ${1 - k} ${k * C} ${k * C})`}>
              <rect x={-800} y={-800} width={CANVAS_W + 1600} height={CANVAS_H + 1600} fill={WASHI_DEEP} />
              <rect
                x={-800}
                y={-800}
                width={CANVAS_W + 1600}
                height={CANVAS_H + 1600}
                filter={`url(#${id}-fibre)`}
                opacity={0.55}
                style={{mixBlendMode: 'multiply'}}
              />
            </g>
            <rect
              x={-800}
              y={-800}
              width={CANVAS_W + 1600}
              height={CANVAS_H + 1600}
              fill={`url(#${id}-back)`}
            />
          </g>
        ) : null}

        {/* The fold itself, catching the light. */}
        {peeling ? (
          <g clipPath={`url(#${id}-flap)`}>
            <path d={poly(clipHalf(SHEET, C - 26, false))} fill="#FFF8E6" opacity={0.6} />
          </g>
        ) : null}

        {/* The flap's shadow, thrown back onto the sheet still on the block. */}
        {peeling ? (
          <g clipPath={`url(#${id}-flat)`}>
            <path
              d={poly(clipHalf(SHEET, C - 230, false))}
              fill={palette.ink}
              opacity={0.3}
            />
            <path d={poly(clipHalf(SHEET, C - 70, false))} fill={palette.ink} opacity={0.24} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- cartouche */

/**
 * The title panel.
 *
 * Ukiyo-e puts its title in a bordered slip in a corner; an illuminated page
 * puts its opening words in a gilt panel. They are the same object, so this is
 * one panel doing both jobs: a carved double border, a bole ground, and gold
 * laid over the bole the way gold leaf actually is — which is why the gilt here
 * has red in its shadows rather than brown.
 */
const Cartouche: React.FC<{
  id: string;
  seed: string;
  variant: number;
  gothic: string;
  roman: string;
  frame: number;
}> = ({id, seed, variant, gothic, roman, frame}) => {
  const X = 2560;
  const Y = 250;
  const W = 1080;
  const H = 780;
  const v = (k: string) => `${seed}-${k}`;

  // The gold catches the light as the sheet settles — a slow sweep, not a
  // glint. Leaf is matte; it turns, it does not flash.
  const sheen = interpolate(frame % 62, [18, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /**
   * The panel edge, walked as STRAIGHT runs with a little jitter.
   *
   * It was four corner points through the same smoothing the wave uses, which
   * rounded it into a lozenge — a Catmull-Rom through four corners cannot do
   * anything else. A cartouche is cut against a rule: the lines are straight
   * and only the hand is not.
   */
  const edge = (inset: number): P[] => {
    const x0 = X + inset;
    const y0 = Y + inset;
    const x1 = X + W - inset;
    const y1 = Y + H - inset;
    const run = (ax: number, ay: number, bx: number, by: number, n: number): P[] =>
      Array.from({length: n}, (_, i) => {
        const t = i / n;
        return [ax + (bx - ax) * t, ay + (by - ay) * t] as P;
      });
    return [
      ...run(x0, y0, x1, y0, 14),
      ...run(x1, y0, x1, y1, 10),
      ...run(x1, y1, x0, y1, 14),
      ...run(x0, y1, x0, y0, 10),
    ];
  };

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset={Math.max(0, sheen - 0.45)} stopColor="#8A6A1E" />
          <stop offset={sheen} stopColor="#E8C863" />
          <stop offset={Math.min(1, sheen + 0.45)} stopColor="#9C7825" />
        </linearGradient>
      </defs>

      {/* bole ground — the red clay gold leaf is laid over, which is why the
          gilt here has red in its shadows and not brown */}
      <path d={polyPath(wobble(edge(0), 7, v('cb'), variant), true)} fill={palette.bole} />
      <path d={polyPath(wobble(edge(0), 7, v('cb'), variant), true)} fill={palette.oxblood} opacity={0.4} />

      {/* the carved double border */}
      <path
        d={ribbon([...wobble(edge(24), 5, v('c1'), variant), [X + 24, Y + 24]], () => 9, v('c1'), variant)}
        fill={`url(#${id}-leaf)`}
      />
      <path
        d={ribbon([...wobble(edge(52), 5, v('c2'), variant), [X + 52, Y + 52]], () => 4, v('c2'), variant)}
        fill={`url(#${id}-leaf)`}
        opacity={0.72}
      />

      {/* the blackletter line, and the roman one that actually informs */}
      <text
        x={X + W / 2}
        y={Y + 430}
        textAnchor="middle"
        fontFamily={font.gothic}
        fontSize={260}
        fill={`url(#${id}-leaf)`}
      >
        {gothic}
      </text>
      <path
        d={ribbon(
          [
            [X + 200, Y + 512],
            [X + W / 2, Y + 512 + (random(v('rule')) - 0.5) * 7],
            [X + W - 200, Y + 512],
          ],
          () => 3,
          v('rule'),
          variant,
        )}
        fill={`url(#${id}-leaf)`}
      />
      <text
        x={X + W / 2}
        y={Y + 625}
        textAnchor="middle"
        fontFamily={font.display}
        fontWeight={700}
        fontSize={62}
        letterSpacing={7}
        fill={palette.chalk}
      >
        {roman}
      </text>
    </g>
  );
};
