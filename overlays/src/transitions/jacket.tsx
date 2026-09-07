import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS_H, CANVAS_W, TIMING} from '../lib/spec';
import {drawOn} from '../lib/motion';
import {PaperCutFilter, useCutVariant} from '../lib/papercut';
import {DenimFill, DenimPatterns} from './denim';
import {Adjuster, Buckle, Burr, Patch, Pocket, Rivet, TackButton} from './hardware';

/**
 * FULL-FRAME TRANSITIONS FOR THE HERITAGE DENIM JACKET COURSE.
 *
 * Ten mechanics on two engines. The engines exist because the hard part of a
 * cover-and-uncover transition is not the picture, it is PROVING it covers:
 * a transition with a pinhole is worthless, because the cut underneath shows
 * through for a frame. Both engines make coverage a property of the geometry
 * rather than something to hope for and check later.
 *
 *   SWARM — objects land on a grid whose cells they are each large enough to
 *   cover on their own. Union coverage is then guaranteed once every object
 *   has landed, whatever order they arrive in and however they are rotated.
 *
 *   SWEEP — a boundary crosses the frame and the fill trails it. Coverage is
 *   guaranteed by running the boundary well past both edges.
 *
 * Every mechanic wears the sticker cut (lib/papercut) on the UNION of its
 * pieces, not on each piece — one filter pass rather than forty. During the
 * fly-in that reads exactly right: the ragged white edge is the boundary of
 * what has landed so far.
 */

const {in: COVER, out: UNCOVER} = TIMING.transition;
const useUncoverAt = () => useVideoConfig().durationInFrames - UNCOVER;

export type JacketProps = {seed: string};

const INK = 'var(--rc-ink)';
const PAPER = 'var(--rc-paper)';
const DEEP = 'var(--rc-paper-deep)';
const INDIGO = 'var(--rc-indigo)';
const GOLD = 'var(--rc-gold)';
const COPPER = 'var(--rc-terracotta)';
const BACK = 'var(--rc-fresco)';

/* ------------------------------------------------------------------ SWARM */

const COLS = 7;
const ROWS = 4;
const CELL_W = CANVAS_W / COLS;
const CELL_H = CANVAS_H / ROWS;
/** Radius at which one piece covers its whole cell, corners included. */
const COVER_R = Math.hypot(CELL_W / 2, CELL_H / 2);

type Piece = {
  /**
   * Drawn centred on the origin. `cloth` is a paint reference to this
   * instance's denim — passed in rather than imported, because the pattern id
   * is per-render and a flat indigo fill is the difference between a piece
   * that looks cut from cloth and one that looks like a sticker.
   */
  render: (i: number, seed: string, cloth: string) => React.ReactNode;
};

/**
 * Objects fly in from off-frame, land on the covering grid, hold, and leave.
 * Arrival order is seeded, so A and B fill in a different sequence.
 */
const Swarm: React.FC<{
  seed: string;
  piece: Piece;
  /** Which edge each object comes from and how far — the character of the throw. */
  throwFrom?: (i: number, seed: string) => [number, number];
  spin?: number;
  /**
   * The chip of paper each piece rides in on, radius COVER_R — which is the
   * half-diagonal of a cell, so once every chip has landed the frame is
   * covered whatever shape the pieces are and however they are rotated.
   *
   * This is why the pieces themselves do not have to be cell-sized. Making a
   * rotated buckle cover a rectangular cell means drawing it enormous; a disc
   * is the same in every orientation, so the geometry stays simple and the
   * hardware stays the size hardware should be.
   */
  ground?: string;
}> = ({seed, piece, throwFrom, spin = 26, ground = PAPER}) => {
  const frame = useCurrentFrame();
  const uncoverAt = useUncoverAt();
  const variant = useCutVariant();
  const fid = `swarm-${seed}-${variant}`;
  /** Mechanics ask for 'denim' and get the tiled cloth for this instance. */
  const groundPaint = ground === 'denim' ? `url(#${fid}-cloth)` : ground;
  const n = COLS * ROWS;

  // A seeded arrival order: no two variants fill the frame the same way, and
  // nothing lands in reading order, which would look like a wipe.
  const order = Array.from({length: n}, (_, i) => i).sort(
    (a, b) => random(`${seed}-o${a}`) - random(`${seed}-o${b}`),
  );
  const slot = new Map(order.map((cellIndex, position) => [cellIndex, position]));

  // Each unit is a chip of paper and the piece riding on it. They travel
  // together, but they are DRAWN in two passes — every chip, then every piece.
  // Drawn unit by unit, a chip lands on top of the piece in the cell before it
  // and takes a bite out of it, which is what turned the first attempt into a
  // field of Pac-Men.
  const units = Array.from({length: n}).map((_, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    const pos = slot.get(i) ?? 0;
    const delay = (pos / n) * (COVER * 0.62);
    const inT = drawOn(frame, delay, Math.max(5, COVER - delay));
    const outT = drawOn(frame, uncoverAt + (pos / n) * (UNCOVER * 0.5), UNCOVER * 0.55);
    const [fx, fy] = throwFrom
      ? throwFrom(i, seed)
      : [(random(`${seed}-x${i}`) - 0.5) * 2 * (CANVAS_W * 0.9), -CANVAS_H * 0.9];
    // The exit cannot reuse the entry vector. A piece thrown in from a short
    // distance leaves by the same short distance and is still on screen at the
    // last frame — the patch swarm's bottom row ended the shot sitting in the
    // middle of the frame. Exit along the same DIRECTION, but far enough that
    // no cell can fail: the frame diagonal (4404) plus a chip radius, rounded
    // up. Anything less is a bet on where the piece started.
    const mag = Math.max(1, Math.hypot(fx, fy));
    const ex = (fx / mag) * 5200;
    const ey = (fy / mag) * 5200;
    const rot =
      (random(`${seed}-r${i}`) - 0.5) * 2 * spin * (1 - inT) +
      (random(`${seed}-r${i}`) - 0.5) * 2 * spin * 1.6 * outT +
      (random(`${seed}-s${i}`) - 0.5) * 9;
    const px = CELL_W * (c + 0.5) + (1 - inT) * fx + outT * ex;
    const py = CELL_H * (r + 0.5) + (1 - inT) * fy + outT * ey;
    return {
      i,
      inT,
      px,
      py,
      // The chip stays on the grid — that is what guarantees coverage. Only
      // the piece is scattered, so the hardware looks thrown down while the
      // paper underneath still tiles the frame.
      at: `translate(${CELL_W * (c + 0.5) + (1 - inT) * fx + outT * ex} ${
        CELL_H * (r + 0.5) + (1 - inT) * fy + outT * ey
      })`,
      jitter: `translate(${(random(`${seed}-jx${i}`) - 0.5) * CELL_W * 0.5} ${
        (random(`${seed}-jy${i}`) - 0.5) * CELL_H * 0.5
      }) rotate(${rot})`,
      /** Each scrap is torn off at its own angle, and keeps it as it flies. */
      chipRot: (random(`${seed}-cr${i}`) - 0.5) * 28,
    };
  });

  /**
   * Only units whose chip can still touch the filter region are drawn.
   *
   * Two reasons, one of them a bug. The bug: once every piece has left, Chrome
   * hands an empty input to a userSpaceOnUse filter and floods a solid 126x126
   * white square at the origin — which put a white block in the corner of the
   * last frame of every swarm transition, where the frame is supposed to be
   * completely clear. Culling makes the group genuinely empty and it goes.
   * The other reason is free: nothing off-screen gets drawn or blurred.
   */
  const REGION = 600 + COVER_R + 20;
  const live = units.filter(
    (u) =>
      u.inT > 0 &&
      u.px > -REGION &&
      u.px < CANVAS_W + REGION &&
      u.py > -REGION &&
      u.py < CANVAS_H + REGION,
  );
  if (live.length === 0) return null;

  const body = (
    <>
      <g>
        {live.map((u) =>
          u.inT <= 0 ? null : (
            <g key={`c${u.i}`} transform={`${u.at} rotate(${u.chipRot})`}>
              {/* A SCRAP, not a disc.
                  The chip used to be a circle, and mid-transition the frame
                  filled with ecru coasters with lens-shaped gaps between them —
                  the one thing in the set that read as a shape the animation
                  had invented rather than as paper. A rotated square reads as a
                  torn scrap, matches the paper-cut language the rest of the
                  library is built on, and packs without gaps.
                  Coverage still holds by construction: the square's INSCRIBED
                  circle is COVER_R + 8, so whatever the rotation it still
                  covers its whole cell. */}
              <rect
                x={-(COVER_R + 8)}
                y={-(COVER_R + 8)}
                width={(COVER_R + 8) * 2}
                height={(COVER_R + 8) * 2}
                fill={groundPaint}
              />
            </g>
          ),
        )}
      </g>
      <g>
        {live.map((u) => (
          <g key={`p${u.i}`} transform={`${u.at} ${u.jitter}`}>{piece.render(u.i, seed, `url(#${fid}-cloth)`)}</g>
        ))}
      </g>
    </>
  );

  return (
    <AbsoluteFill>
      <svg width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <DenimPatterns id={fid} />
          <DenimFill id={fid} seed={seed} />
          <PaperCutFilter id={fid} variant={variant} blur={34} tear={48} userSpace
            region={{x: -600, y: -600, width: CANVAS_W + 1200, height: CANVAS_H + 1200}} />
        </defs>
        {/* PASS 1 — the paper, cut from the union of whatever has landed. */}
        <g filter={`url(#${fid})`}>{body}</g>
        {/* PASS 2 — the pieces. */}
        {body}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ SWEEP */

/**
 * A boundary crosses the frame and the fill trails behind it. Runs from well
 * off one edge to well off the other, so coverage is not a question.
 */
const Sweep: React.FC<{
  seed: string;
  /** Drawn in a space where x runs RUN_FROM..RUN_TO and y spans the frame. */
  fill: (x0: number, x1: number, seed: string, cloth: string) => React.ReactNode;
  edge?: (x: number, seed: string) => React.ReactNode;
  tilt?: number;
}> = ({seed, fill, edge, tilt = -4}) => {
  const frame = useCurrentFrame();
  const uncoverAt = useUncoverAt();
  const variant = useCutVariant();
  const fid = `sweep-${seed}-${variant}`;

  const FROM = -900;
  const TO = CANVAS_W + 900;
  // Constant speed with a short settle. drawOn's ease-out puts two thirds of
  // the run in the first third of the shot, which reads as a stall.
  const run = (start: number, dur: number) =>
    interpolate(frame, [start, start + dur - 5, start + dur], [0, 0.94, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  const head = FROM + run(0, COVER) * (TO - FROM);
  const tail = FROM + run(uncoverAt, UNCOVER) * (TO - FROM);
  if (head <= tail) return null;

  const band = (
    <>
      <rect x={tail} y={-500} width={head - tail} height={CANVAS_H + 1000} fill={INDIGO} opacity={0} />
      {fill(tail, head, seed, `url(#${fid}-cloth)`)}
    </>
  );

  return (
    <AbsoluteFill>
      <svg width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <DenimPatterns id={fid} />
          <DenimFill id={fid} seed={seed} />
          <PaperCutFilter id={fid} variant={variant} blur={38} tear={54} userSpace
            region={{x: -600, y: -600, width: CANVAS_W + 1200, height: CANVAS_H + 1200}} />
          <clipPath id={`${fid}-band`}>
            <rect x={tail} y={-500} width={head - tail} height={CANVAS_H + 1000} />
          </clipPath>
        </defs>
        <g transform={`rotate(${tilt} ${CANVAS_W / 2} ${CANVAS_H / 2})`} filter={`url(#${fid})`}>
          <rect x={tail} y={-500} width={head - tail} height={CANVAS_H + 1000} fill="#FFFFFF" />
        </g>
        <g transform={`rotate(${tilt} ${CANVAS_W / 2} ${CANVAS_H / 2})`}>
          <g clipPath={`url(#${fid}-band)`}>{band}</g>
          {edge && head < TO ? edge(head, seed) : null}
          {edge && tail > FROM ? edge(tail, seed) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export {Swarm, Sweep, COVER_R, CELL_W, CELL_H, COLS, ROWS, INK, PAPER, DEEP, INDIGO, GOLD, COPPER, BACK};
export {Adjuster, Buckle, Burr, Patch, Pocket, Rivet, TackButton};
