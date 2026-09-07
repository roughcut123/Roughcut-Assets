import React from 'react';
import {random} from 'remotion';
import {CANVAS_H, CANVAS_W} from '../lib/spec';
import {
  Swarm, Sweep, COVER_R, CELL_W, CELL_H,
  INK, PAPER, DEEP, INDIGO, GOLD, COPPER, BACK,
  Adjuster, Buckle, Burr, Patch, Pocket, Rivet, TackButton,
} from './jacket';
import type {JacketProps} from './jacket';

/**
 * The ten. Each is a skin on one of the two engines, so coverage and the
 * sticker cut come for free and the work is all in the picture.
 */

/* ---------------------------------------------------------------- 1. RIVETS */

/** Copper rivets set into the frame — thrown from every side, barely spinning,
 *  because a rivet is hammered home rather than tossed. */
export const RivetsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={10}
    ground={PAPER}
    throwFrom={(i, s) => {
      const a = random(`${s}-a${i}`) * Math.PI * 2;
      return [Math.cos(a) * CANVAS_W * 0.8, Math.sin(a) * CANVAS_H * 0.9];
    }}
    piece={{render: (i, s) => (
      <g>
        <Rivet r={150 + random(`${s}-p${i}`) * 170} ink={INK} fill={COPPER} />
        <Burr r={70 + random(`${s}-b${i}`) * 70} ink={INK} fill={DEEP} />
      </g>
    )}}
  />
);

/* --------------------------------------------------------------- 2. BUTTONS */

/** 20mm tack buttons tumbling in from above and packing the frame. */
export const ButtonsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={140}
    ground={PAPER}
    throwFrom={(i, s) => [(random(`${s}-x${i}`) - 0.5) * CANVAS_W * 0.5, -CANVAS_H * (1 + random(`${s}-y${i}`))]}
    piece={{render: (i, s) => (
      <TackButton r={155 + random(`${s}-p${i}`) * 145} ink={INK} fill={GOLD} />
    )}}
  />
);

/* -------------------------------------------------------------- 3. HARDWARE */

/** The hardware drawer tipped out: buckles, adjusters, burrs and rivets. */
export const HardwareMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={95}
    ground={PAPER}
    throwFrom={(i, s) => [
      (i % 2 ? 1 : -1) * CANVAS_W * (0.75 + random(`${s}-x${i}`) * 0.5),
      (random(`${s}-y${i}`) - 0.5) * CANVAS_H * 0.7,
    ]}
    piece={{render: (i, s) => {
      const r = 145 + random(`${s}-p${i}`) * 160;
      // Weighted, not uniform: a hardware drawer is mostly buckles and
      // adjusters with a few rivets rolling about, and an even split of four
      // kinds left the frame looking like a tray of washers.
      const k = random(`${s}-k${i}`);
      if (k < 0.38) return <Buckle r={r * 1.2} ink={INK} fill={BACK} />;
      if (k < 0.7) return <Adjuster r={r * 1.15} ink={INK} fill={BACK} />;
      if (k < 0.9) return <Rivet r={r * 0.85} ink={INK} fill={COPPER} />;
      return <Burr r={r * 0.9} ink={INK} fill={DEEP} />;
    }}}
  />
);

/* --------------------------------------------------------------- 4. POCKETS */

/** Patch pockets flying about and settling — cut, hemmed, bartacked. */
export const PocketsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={70}
    ground={DEEP}
    throwFrom={(i, s) => {
      const side = i % 3;
      const d = 0.85 + random(`${s}-d${i}`) * 0.6;
      if (side === 0) return [-CANVAS_W * d, -CANVAS_H * 0.4];
      if (side === 1) return [CANVAS_W * d, CANVAS_H * 0.35];
      return [(random(`${s}-x${i}`) - 0.5) * CANVAS_W, CANVAS_H * d];
    }}
    piece={{render: (i, s) => (
      <Pocket r={175 + random(`${s}-p${i}`) * 135} ink={INK} fill={INDIGO} />
    )}}
  />
);

/* ---------------------------------------------------------------- 5. PANELS */

/**
 * The jacket in its cut pieces: yoke, front, back, sleeve, cuff, collar,
 * pocket flap. Drawn as pattern pieces — seam line, grain arrow, notches —
 * because that is what the viewer has on their table.
 */
const PANELS = [
  // yoke
  'M -300 -90 L 300 -90 L 250 90 L -250 90 Z',
  // front panel
  'M -190 -280 L 190 -280 L 210 280 L -210 280 Z',
  // sleeve
  'M -170 -300 C -60 -350 60 -350 170 -300 L 130 300 L -130 300 Z',
  // cuff
  'M -320 -80 L 320 -80 L 320 80 L -320 80 Z',
  // collar
  'M -300 60 C -220 -80 220 -80 300 60 L 250 110 C 180 10 -180 10 -250 110 Z',
  // pocket flap
  'M -230 -90 L 230 -90 L 230 50 L 0 110 L -230 50 Z',
  // back panel
  'M -230 -300 L 230 -300 L 250 300 L -250 300 Z',
];

export const PanelsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={34}
    // Paper pieces on a deeper ground. Pattern paper on pattern paper left the
    // pieces readable only by their outlines, which is not enough at speed.
    ground={DEEP}
    throwFrom={(i, s) => [
      (random(`${s}-x${i}`) - 0.5) * 2 * CANVAS_W * 0.8,
      (random(`${s}-y${i}`) - 0.5) * 2 * CANVAS_H * 0.8,
    ]}
    piece={{render: (i, s) => {
      const d = PANELS[i % PANELS.length];
      const k = 0.62 + random(`${s}-p${i}`) * 0.72;
      return (
        <g transform={`scale(${k})`} fill="none" stroke={INK}>
          <path d={d} fill={PAPER} strokeWidth={11} />
          {/* seam allowance, run inside the cut line */}
          <path d={d} strokeWidth={4} opacity={0.45} transform="scale(0.9)" />
          {/* grain arrow */}
          <path d="M 0 -150 L 0 150 M -22 -118 L 0 -156 L 22 -118 M -22 118 L 0 156 L 22 118"
            strokeWidth={6} opacity={0.8} />
          {/* notches */}
          <path d="M -150 -60 l 0 34 M 150 -60 l 0 34" strokeWidth={6} opacity={0.7} />
        </g>
      );
    }}}
  />
);

/* ------------------------------------------------------------ 6. CHAINSTITCH */

/** The chainstitch that closes a felled seam, running across the frame with
 *  the fell following it. */
export const ChainstitchMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-3}
    fill={(x0, x1) => {
      const rows = Math.ceil((CANVAS_H + 1000) / 210);
      return (
        <g>
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={INDIGO} />
          {Array.from({length: rows}).map((_, r) => {
            const y = -500 + r * 210;
            return (
              <g key={r}>
                {/* the felled seam: two rows of topstitch */}
                <line x1={x0} y1={y} x2={x1} y2={y} stroke={GOLD} strokeWidth={11}
                  strokeDasharray="46 26" strokeLinecap="round" />
                <line x1={x0} y1={y + 30} x2={x1} y2={y + 30} stroke={GOLD} strokeWidth={9}
                  strokeDasharray="46 26" strokeLinecap="round" opacity={0.85} />
                {/* the fold the fell is pressed to */}
                <line x1={x0} y1={y + 62} x2={x1} y2={y + 62} stroke={INK} strokeWidth={5} opacity={0.28} />
              </g>
            );
          })}
        </g>
      );
    }}
  />
);

/* ------------------------------------------------------------- 7. INDIGO DIP */

/** Rope-dyed indigo flooding across — the dye takes in bands, because it is
 *  dipped again and again rather than soaked once. */
export const IndigoMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-6}
    fill={(x0, x1, s) => (
      <g>
        <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={INDIGO} />
        {Array.from({length: 26}).map((_, i) => {
          const y = -500 + i * 130;
          return (
            <rect key={i} x={x0} y={y} width={x1 - x0} height={64 + random(`${s}-b${i}`) * 46}
              fill={INK} opacity={0.14 + random(`${s}-o${i}`) * 0.24} />
          );
        })}
        {/* the streaks the rope leaves */}
        {Array.from({length: 40}).map((_, i) => {
          const y = -500 + random(`${s}-sy${i}`) * (CANVAS_H + 1000);
          return (
            <line key={`s${i}`} x1={x0} y1={y} x2={x1} y2={y} stroke={PAPER}
              strokeWidth={4 + random(`${s}-sw${i}`) * 9} opacity={0.2 + random(`${s}-so${i}`) * 0.16} />
          );
        })}
      </g>
    )}
  />
);

/* --------------------------------------------------------------- 8. SELVEDGE */

/** Widths of selvedge denim laid one after another, each finished edge with
 *  its undyed band and dotted ID line. */
export const SelvedgeMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-5}
    fill={(x0, x1) => {
      const pitch = 430;
      const rows = Math.ceil((CANVAS_H + 1000) / pitch);
      return (
        <g>
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={INDIGO} />
          {Array.from({length: rows}).map((_, r) => {
            const y = -500 + r * pitch;
            return (
              <g key={r}>
                <rect x={x0} y={y} width={x1 - x0} height={72} fill={PAPER} />
                <line x1={x0} y1={y} x2={x1} y2={y} stroke={INK} strokeWidth={4} opacity={0.45} />
                <line x1={x0} y1={y + 72} x2={x1} y2={y + 72} stroke={INK} strokeWidth={6} opacity={0.55} />
                <line x1={x0} y1={y + 36} x2={x1} y2={y + 36} stroke="var(--rc-annotation)"
                  strokeWidth={10} strokeDasharray="7 17" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      );
    }}
  />
);

/* ----------------------------------------------------------------- 9. THREAD */

/** Gold topstitch thread unspooling across the frame in long loops. */
export const ThreadMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-2}
    fill={(x0, x1, s) => {
      const rows = Math.ceil((CANVAS_H + 1000) / 118);
      return (
        <g>
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={INDIGO} />
          {Array.from({length: rows}).map((_, r) => {
            const y = -500 + r * 118;
            const amp = 26 + random(`${s}-a${r}`) * 22;
            const step = 150;
            let d = `M ${x0} ${y}`;
            for (let x = x0; x < x1; x += step) {
              d += ` q ${step / 2} ${r % 2 ? amp : -amp} ${step} 0`;
            }
            return <path key={r} d={d} fill="none" stroke={GOLD} strokeWidth={17} opacity={0.95} />;
          })}
        </g>
      );
    }}
  />
);

/* ------------------------------------------------------------------ 10. PATCH */

/** The leather patch stamped onto the frame: it lands small, presses out to
 *  full size, holds, and is lifted away. A press, not a slide (§3.5). */
export const PatchMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={16}
    ground={DEEP}
    throwFrom={(i, s) => [
      (random(`${s}-x${i}`) - 0.5) * CANVAS_W * 0.35,
      -CANVAS_H * (0.6 + random(`${s}-y${i}`) * 0.6),
    ]}
    piece={{render: (i, s) => (
      <Patch r={165 + random(`${s}-p${i}`) * 145} ink={INK} fill={COPPER} />
    )}}
  />
);
