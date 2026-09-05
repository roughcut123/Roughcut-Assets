import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CANVAS_H, CANVAS_W, TIMING} from '../lib/spec';
import {drawOn} from '../lib/motion';
import {tornRectPath} from '../lib/masks';

/**
 * FAMILY A — chapter transitions. Spec §6.
 *
 * "Cover the screen, hold, uncover to the next chapter. Duration 1s cover +
 * 0.5s hold + 1s uncover = 2.5s total (62 frames @ 25fps)." §13 gives the
 * same split as 25 / 12 / 25.
 *
 * Five distinct mechanics so a video does not feel like one effect on repeat.
 * Every one is verified to reach FULL alpha coverage across the hold window,
 * measured off rendered frames rather than assumed — a transition with a
 * pinhole in it is worthless, because the cut underneath shows through.
 */

const {in: COVER, hold: HOLD} = TIMING.transition;
const UNCOVER_AT = COVER + HOLD;

export type MechanicProps = {
  /** A/B variants differ by seed, so no two runs share a silhouette (§3.4). */
  seed: string;
};

/** 0 -> 1 across the cover phase; 0 -> 1 again across the uncover phase. */
const phases = (frame: number) => ({
  cover: drawOn(frame, 0, COVER),
  uncover: drawOn(frame, UNCOVER_AT, TIMING.transition.out),
});

/* ------------------------------------------------------------------ M1 */

/**
 * M1 — Mosaic assembly. The hero mechanic; Jack flagged it himself.
 *
 * Tesserae fly in, resolve, hold, then break apart. §6 says the resolved
 * image is a Pompeii fresco or a Dürer plate; §3.6 requires those to be real
 * public-domain scans and §16 forbids synthesising one, and none are
 * available on this machine. So the tesserae currently resolve to a gold
 * ground in the palette — a Ravenna register rather than a specific plate.
 * Drop a scan into /assets/archive and each tessera takes its colour from
 * the corresponding pixel instead. Logged in NOTES.md.
 */
const TESSERA = [
  'var(--rc-gold)', 'var(--rc-gold)', 'var(--rc-gold)',
  'var(--rc-paper)', 'var(--rc-paper-deep)',
  'var(--rc-terracotta)', 'var(--rc-oxblood)',
  'var(--rc-indigo)', 'var(--rc-fresco)', 'var(--rc-mahogany)',
];

export const M1Mosaic: React.FC<MechanicProps> = ({seed}) => {
  const frame = useCurrentFrame();
  const cols = 26;
  const rows = 15;
  const tw = CANVAS_W / cols;
  const th = CANVAS_H / rows;
  const OVERLAP = 10; // no pinholes of video between landed tesserae

  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const s = `${seed}-m1-${i}`;
      // Every tile must be home by the end of the cover phase.
      const inDelay = random(`${s}-d`) * (COVER * 0.5);
      const inT = drawOn(frame, inDelay, COVER - inDelay);
      const outT = drawOn(frame, UNCOVER_AT + random(`${s}-o`) * 10, 14);
      if (inT <= 0) continue;

      const ang = random(`${s}-a`) * Math.PI * 2;
      const dist = 420 + random(`${s}-r`) * 640;
      const ox = Math.cos(ang) * dist * (1 - inT) + Math.cos(ang) * dist * 0.85 * outT;
      const oy = Math.sin(ang) * dist * (1 - inT) + Math.sin(ang) * dist * 0.85 * outT;
      const rot = (random(`${s}-t`) - 0.5) * 85 * (1 - inT) + (random(`${s}-t2`) - 0.5) * 65 * outT;
      const scale = (0.3 + 0.7 * inT) * (1 - 0.75 * outT);

      const x = c * tw - OVERLAP / 2;
      const y = r * th - OVERLAP / 2;
      const w = tw + OVERLAP;
      const h = th + OVERLAP;
      const j = (k: string) => (random(`${s}-${k}`) - 0.5) * 9;

      tiles.push(
        <g
          key={i}
          transform={`translate(${x + w / 2 + ox} ${y + h / 2 + oy}) rotate(${rot}) scale(${scale}) translate(${-w / 2} ${-h / 2})`}
          opacity={Math.min(inT * 2, 1) * (1 - outT)}
        >
          <path
            d={`M ${j('a')} ${j('b')} L ${w + j('c')} ${j('d')} L ${w + j('e')} ${h + j('f')} L ${j('g')} ${h + j('h')} Z`}
            fill={TESSERA[Math.floor(random(`${s}-col`) * TESSERA.length)]}
            stroke="rgba(0,0,0,0.32)"
            strokeWidth={3}
          />
        </g>,
      );
    }
  }

  return (
    <AbsoluteFill>
      <svg width={CANVAS_W} height={CANVAS_H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {tiles}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ M2 */

/**
 * M2 — Excavation wipe. Sand sweeps across and clears, as in the sphinx
 * image: warm grain, --rc-paper-deep into --rc-mahogany. The leading edge is
 * a drift, not a straight line, and flecks run ahead of the front.
 */
export const M2Excavation: React.FC<MechanicProps> = ({seed}) => {
  const frame = useCurrentFrame();
  const {cover, uncover} = phases(frame);

  // The drift front: an irregular vertical boundary that advances, then
  // retreats off the far side.
  const front = cover * (CANVAS_W + 700) - 350;
  const exit = uncover * (CANVAS_W + 900);

  const pts: string[] = [];
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const wob =
      (random(`${seed}-d-${Math.floor(t * 9)}`) - 0.5) * 260 +
      (random(`${seed}-f-${i}`) - 0.5) * 90;
    pts.push(`${(front + wob).toFixed(1)},${(t * CANVAS_H).toFixed(1)}`);
  }
  const drift = `M ${-900} ${CANVAS_H} L ${-900} 0 L ${pts.join(' L ')} Z`;

  return (
    <AbsoluteFill>
      <svg width={CANVAS_W} height={CANVAS_H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          {/* §3.4 forbids gradient as DECORATION; here the tonal run is the
              subject - §6 specifies paper-deep into mahogany. */}
          <linearGradient id={`${seed}-soil`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="var(--rc-paper-deep)" />
            <stop offset="100%" stopColor="var(--rc-mahogany)" />
          </linearGradient>
          <filter id={`${seed}-grain`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" seed="9" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
          </filter>
          <clipPath id={`${seed}-clip`}>
            <path d={drift} />
          </clipPath>
        </defs>

        <g transform={`translate(${exit} 0)`}>
          <g clipPath={`url(#${seed}-clip)`}>
            <rect x={-900} y={0} width={CANVAS_W + 1800} height={CANVAS_H} fill={`url(#${seed}-soil)`} />
            <rect
              x={-900}
              y={0}
              width={CANVAS_W + 1800}
              height={CANVAS_H}
              filter={`url(#${seed}-grain)`}
              opacity={0.22}
              style={{mixBlendMode: 'multiply'}}
            />
          </g>
          {/* Flecks thrown ahead of the drift. */}
          {Array.from({length: 90}).map((_, i) => {
            const t = random(`${seed}-p-${i}`);
            const y = random(`${seed}-py-${i}`) * CANVAS_H;
            const x = front + 30 + t * 320;
            const r = 4 + random(`${seed}-pr-${i}`) * 12;
            return <circle key={i} cx={x} cy={y} r={r} fill="var(--rc-mahogany)" opacity={0.5 * (1 - t)} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ M3 */

/**
 * M3 — Tiling wipe. Literally Jack's own tiling system: pattern pages land
 * left to right, each overlapping onto the black bleed line of the one
 * before — never butted — with alignment bullseyes at the corners. Then the
 * pages lift away.
 */
export const M3Tiling: React.FC<MechanicProps> = ({seed}) => {
  const frame = useCurrentFrame();
  const cols = 5;
  const rows = 3;
  const pw = CANVAS_W / cols;
  const ph = CANVAS_H / rows;
  const BLEED = 52;

  const pages = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const s = `${seed}-m3-${i}`;
      // Column by column, so the frame fills left to right as pages are laid.
      const order = c * rows + r;
      const delay = (order / (cols * rows)) * (COVER * 0.7);
      const inT = drawOn(frame, delay, Math.max(4, COVER - delay));
      const outT = drawOn(frame, UNCOVER_AT + random(`${s}-o`) * 9, 15);
      if (inT <= 0) continue;

      const x = c * pw - BLEED / 2;
      const y = r * ph - BLEED / 2;
      const w = pw + BLEED;
      const h = ph + BLEED;
      const ang = (random(`${s}-a`) - 0.5) * 2.2;
      const drop = (1 - inT) * -90 + outT * -160;

      pages.push(
        <g
          key={i}
          transform={`translate(${x + w / 2} ${y + h / 2 + drop}) rotate(${ang}) translate(${-w / 2} ${-h / 2})`}
          opacity={Math.min(inT * 2.5, 1) * (1 - outT)}
        >
          <rect x={0} y={0} width={w} height={h} fill="var(--rc-paper)" />
          {/* the black bleed line the next page overlaps onto */}
          <rect x={0} y={0} width={w} height={h} fill="none" stroke="var(--rc-ink)" strokeWidth={5} />
          {/* alignment bullseyes at the corners (§8.2 ALIGNMENT DARTS) */}
          {[
            [BLEED, BLEED],
            [w - BLEED, BLEED],
            [BLEED, h - BLEED],
            [w - BLEED, h - BLEED],
          ].map(([bx, by], k) => (
            <g key={k} fill="none" stroke="var(--rc-ink)" strokeWidth={4}>
              <circle cx={bx} cy={by} r={26} />
              <circle cx={bx} cy={by} r={11} />
              <line x1={bx - 42} y1={by} x2={bx + 42} y2={by} />
              <line x1={bx} y1={by - 42} x2={bx} y2={by + 42} />
            </g>
          ))}
        </g>,
      );
    }
  }

  return (
    <AbsoluteFill>
      <svg width={CANVAS_W} height={CANVAS_H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {pages}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ M4 */

/**
 * M4 — Stitch wipe. A running stitch draws across the frame and the fabric
 * follows the needle. Stitch spacing is sashiko-irregular rather than even.
 */
export const M4Stitch: React.FC<MechanicProps> = ({seed}) => {
  const frame = useCurrentFrame();
  const {cover, uncover} = phases(frame);

  const needle = cover * (CANVAS_W + 420) - 210;
  const exit = uncover * (CANVAS_W + 900);

  // Irregular running stitch along the needle line.
  const stitches = [];
  let y = -40;
  let k = 0;
  while (y < CANVAS_H + 40) {
    const len = 54 + random(`${seed}-sl-${k}`) * 46;
    const gap = 30 + random(`${seed}-sg-${k}`) * 26;
    const wob = (random(`${seed}-sw-${k}`) - 0.5) * 26;
    stitches.push(
      <line
        key={k}
        x1={needle + wob}
        y1={y}
        x2={needle + wob}
        y2={y + len}
        stroke="var(--rc-paper)"
        strokeWidth={9}
        strokeLinecap="round"
      />,
    );
    y += len + gap;
    k++;
  }

  return (
    <AbsoluteFill>
      <svg width={CANVAS_W} height={CANVAS_H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <pattern id={`${seed}-twill`} width={22} height={22} patternUnits="userSpaceOnUse">
            <line x1={-22} y1={22} x2={22} y2={-22} stroke="var(--rc-fresco)" strokeWidth={4} opacity={0.22} />
            <line x1={0} y1={22} x2={44} y2={-22} stroke="var(--rc-fresco)" strokeWidth={4} opacity={0.22} />
          </pattern>
        </defs>
        <g transform={`translate(${-exit} 0)`}>
          {/* the cloth the needle drags behind it */}
          <rect x={needle - CANVAS_W - 400} y={0} width={CANVAS_W + 400} height={CANVAS_H} fill="var(--rc-indigo)" />
          <rect x={needle - CANVAS_W - 400} y={0} width={CANVAS_W + 400} height={CANVAS_H} fill={`url(#${seed}-twill)`} />
          {stitches}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ M5 */

/**
 * M5 — Torn paper wipe. A sheet tears diagonally across the frame and the
 * tear edge is the wipe boundary.
 */
export const M5Torn: React.FC<MechanicProps> = ({seed}) => {
  const frame = useCurrentFrame();
  const {cover, uncover} = phases(frame);

  // The sheet is oversized and rotated so its torn edge crosses the frame
  // on the diagonal rather than vertically.
  const W = CANVAS_W * 1.7;
  const H = CANVAS_H * 1.9;
  const travel = CANVAS_W * 1.75;
  const x = -travel + cover * travel + uncover * travel;
  const variant = Math.floor(random(`${seed}-v`) * 8);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: (CANVAS_W - W) / 2,
          top: (CANVAS_H - H) / 2,
          transform: `translateX(${x}px) rotate(-14deg)`,
        }}
      >
        <svg width={W} height={H} style={{overflow: 'visible'}}>
          <path
            d={tornRectPath({w: W, h: H, variant, torn: ['right'], tornAmp: 120, wobble: 20})}
            fill="var(--rc-paper)"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const MECHANICS = {
  M1: M1Mosaic,
  M2: M2Excavation,
  M3: M3Tiling,
  M4: M4Stitch,
  M5: M5Torn,
} as const;

export type MechanicName = keyof typeof MECHANICS;
