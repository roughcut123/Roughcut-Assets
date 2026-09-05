import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS_H, CANVAS_W, TIMING} from '../lib/spec';
import {drawOn} from '../lib/motion';
import {TORN_VARIANTS, tornRectPath} from '../lib/masks';
import {PaperCutFilter, useCutVariant} from '../lib/papercut';

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

const {in: COVER, out: UNCOVER} = TIMING.transition;

/**
 * The uncover starts a fixed distance from the END of the composition, not a
 * fixed distance from the start. A _LOOP variant is this same component with
 * a longer duration, so a hardcoded cover+hold would leave it covering on
 * schedule and then sitting blank for the remainder.
 */
const useUncoverAt = () => useVideoConfig().durationInFrames - UNCOVER;

export type MechanicProps = {
  /** A/B variants differ by seed, so no two runs share a silhouette (§3.4). */
  seed: string;
};

/** 0 -> 1 across the cover phase; 0 -> 1 again across the uncover phase. */
const phases = (frame: number, uncoverAt: number) => ({
  cover: drawOn(frame, 0, COVER),
  uncover: drawOn(frame, uncoverAt, UNCOVER),
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
  const uncoverAt = useUncoverAt();
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
      const outT = drawOn(frame, uncoverAt + random(`${s}-o`) * 10, 14);
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
  const {cover, uncover} = phases(frame, useUncoverAt());

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
 * M3 — Tiling wipe, built from the real pattern.
 *
 * Four full pattern pages, lifted straight out of THE KIT DUFFLE BAG (US
 * Letter), tear in one after another and layer up until the frame is covered;
 * the mark stamps on during the hold; then they lift away. This is literally
 * Jack's own tiling system, at the scale of the screen instead of the floor.
 *
 * The artwork is vendored as SVG in public/pattern — extracted from the PDF
 * with text converted to paths, so a render depends on no font and no network,
 * and recoloured from the pattern's near-black to `--rc-ink` and its grey grid
 * reference to a warm tint that sits on `--rc-paper`. Nothing is redrawn or
 * imitated: these are the pages.
 *
 * COVERAGE IS GEOMETRIC, NOT HOPEFUL, and the arithmetic is the reason the
 * pages are the size they are. A page is 1900 wide, so at 2 degrees of tilt
 * its edge never sits further in than 906px from its centre; three centres at
 * 800 / 1920 / 3040 therefore reach past both sides of a 3840 frame and
 * overlap each other by ~750px, which is twenty times the deepest tear. The
 * page is 2459 tall against a 2160 frame for the same reason — a page exactly
 * frame height leaves a 30px band at the top the moment it tilts. The fourth
 * sheet is laid over the first join purely to layer.
 *
 * The consequence is that you see the full width of each page and about 88%
 * of its height. Whole pages that also cover the frame is not a thing that
 * exists: to see all of a page it can be at most frame height, and at frame
 * height it cannot cover the frame once it tilts.
 */
const PAGE_W = 1900;
const PAGE_H = Math.round((PAGE_W * 11) / 8.5);

/**
 * Which tiles get used, and where each lands. The first three tile across the
 * row left to right, as the pattern's own guide describes; the fourth is laid
 * over the first join.
 */
const PAGE_SLOTS = [
  {cx: 800, cy: 1080, rot: -2.0, fromX: -2600, fromY: -280, paper: 'var(--rc-paper)'},
  {cx: 1920, cy: 1080, rot: 1.6, fromX: -1400, fromY: -900, paper: 'var(--rc-paper-deep)'},
  {cx: 3040, cy: 1080, rot: -1.4, fromX: 2600, fromY: -320, paper: 'var(--rc-paper)'},
  {cx: 1420, cy: 1000, rot: -7.0, fromX: -900, fromY: 2600, paper: 'var(--rc-paper-deep)'},
] as const;

/**
 * Eight tiles are vendored; a variant takes four of them. §6 wants the A and B
 * variants to differ by "underlying imagery", so the seed picks the pages as
 * well as the torn edges — otherwise A and B would be the same four sheets
 * with a different rip, which is not what a viewer would call different.
 */
const TILE_POOL = [
  'tile-A1', 'tile-F2', 'tile-G1', 'tile-D2',
  'tile-L3', 'tile-E2', 'tile-L2', 'tile-D1',
] as const;

const tilesFor = (seed: string) => {
  const offset = Math.floor(random(`${seed}-tiles`) * TILE_POOL.length);
  // Stride 3 against a pool of 8 (coprime), so the four are always distinct
  // and no two slots ever land on the same page.
  return PAGE_SLOTS.map((_, i) => TILE_POOL[(offset + i * 3) % TILE_POOL.length]);
};

export const M3Tiling: React.FC<MechanicProps> = ({seed}) => {
  const frame = useCurrentFrame();
  const uncoverAt = useUncoverAt();
  const tiles = tilesFor(seed);
  const stamp = drawOn(frame, COVER + 2, 6);
  const stampOut = drawOn(frame, uncoverAt, 8);

  return (
    <AbsoluteFill>
      {PAGE_SLOTS.map((page, i) => {
        // Staggered in, and out again in the reverse order — the last sheet
        // laid down is the first one lifted.
        const inT = drawOn(frame, i * 4, COVER - i * 4);
        const outT = drawOn(frame, uncoverAt + (PAGE_SLOTS.length - 1 - i) * 4, UNCOVER - 10);
        if (inT <= 0) return null;

        const v = Math.floor(random(`${seed}-m3-${i}`) * TORN_VARIANTS);
        const dx = (1 - inT) * page.fromX + outT * page.fromX * 1.15;
        const dy = (1 - inT) * page.fromY + outT * page.fromY * 1.15;
        const rot = page.rot + (1 - inT) * -4 + outT * 5;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: page.cx - PAGE_W / 2,
              top: page.cy - PAGE_H / 2,
              width: PAGE_W,
              height: PAGE_H,
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
              transformOrigin: '50% 50%',
              // Hand-torn on every side, a different silhouette per page and
              // per variant seed, so no two transitions share an edge (§3.4).
              clipPath: `path('${tornRectPath({
                w: PAGE_W,
                h: PAGE_H,
                variant: v,
                torn: ['top', 'right', 'bottom', 'left'],
                tornAmp: 26,
                wobble: 14,
                segments: 26,
              })}')`,
              background: page.paper,
            }}
          >
            <Img
              src={staticFile(`pattern/${tiles[i]}.svg`)}
              style={{width: '100%', height: '100%', display: 'block'}}
            />
          </div>
        );
      })}

      {/* The mark, stamped on the covered frame during the hold. */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Img
          src={staticFile('pattern/mark.svg')}
          style={{
            width: 720,
            height: 720,
            opacity: stamp * (1 - stampOut),
            transform: `rotate(${-2.5 + (1 - stamp) * 5}deg) scale(${0.94 + stamp * 0.06})`,
          }}
        />
      </AbsoluteFill>
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
  const {cover, uncover} = phases(frame, useUncoverAt());

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
  const {cover, uncover} = phases(frame, useUncoverAt());

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


/* ------------------------------------------------------------------ M6 */

/**
 * M6 — Bolt unroll. A roll of selvedge denim crosses the frame and the cloth
 * unspools behind it until the screen is covered; it holds; then a second roll
 * crosses the same way and takes the cloth back up, revealing the next chapter.
 *
 * The cloth already laid down never moves — which is what actually happens
 * when you unroll a bolt across a cutting table. Only the two edges travel, so
 * the twill and the selvedge stay put and the motion reads as cloth rather
 * than as a sliding rectangle.
 *
 * THE BOLT HAS TO TURN, or the whole thing is a wipe with a stripe on it. The
 * wound layers are placed at evenly spaced ANGLES and projected — x = cx +
 * R sin(theta) — so they crowd towards the edges the way a cylinder's surface
 * does, and the phase is driven by distance travelled over circumference. It
 * rolls because it is rolling, not because it is sliding with lines on it.
 * A cylinder is also darkest where it turns AWAY from you; shading it the
 * other way round is what makes a roll read as a flat striped band.
 *
 * The contour is the sticker cut (see lib/papercut). It matters here more than
 * anywhere: for most of the shot the only thing the viewer sees against the
 * outgoing footage IS the leading edge, so that edge has to be a torn white
 * paper cut and not a straight line. Once the frame is covered the cut is
 * off-screen, which is the point — it does its work during the wipe. White on
 * indigo is also the strongest reading the cut gets anywhere in the library.
 *
 * The filter region is absolute rather than a percentage of the bounding box.
 * At the start of the wipe the band is a few hundred pixels wide, and 14% of
 * that is less than the cut margin, so a percentage region clips the cut off
 * exactly when it is the only thing on screen.
 */
const ROLL_R = 420;
const ROLL_CIRC = 2 * Math.PI * ROLL_R;
/**
 * The whole thing runs off true by a few degrees. Nobody unrolls a bolt square
 * to the edge of the table, and off-square puts far more of the cut edge on
 * screen for far longer — which is the only part of this the viewer sees
 * against the outgoing footage.
 */
const TILT = -5;
/** Cloth over-covers well past the frame so its long edges never show, tilt
 *  included: 3840 across at 5 degrees drops the far corner by 336px. */
const CLOTH_TOP = -420;
const CLOTH_BOTTOM = CANVAS_H + 420;
/** Travel: fully off one side to fully off the other. */
const RUN_FROM = -900;
const RUN_TO = CANVAS_W + 900;
const TOP = CLOTH_TOP - 80;
const BOT = CLOTH_BOTTOM + 80;

/**
 * Where two widths of denim meet. Selvedge denim comes off the loom about 32
 * inches wide, so covering anything the shape of a screen means laying more
 * than one width and overlapping them at the finished edges — which is the
 * only honest way to get the selvedge ON SCREEN at all. Run the cloth as one
 * piece and both its selvedges are off-frame by definition, because the cloth
 * has to reach past the frame to cover it.
 */
const SELVEDGE_AT = [560, 1780];
const SELVEDGE_W = 84;

/**
 * Denim's surface, in two patterns that layer.
 *
 * TWILL. Right-hand, which is what denim is: the ridge climbs left to right at
 * about 63 degrees, and it is PALE, because only the warp is dyed and the ridge
 * is where the undyed weft crosses. The tile is 20 wide by 40 tall, which IS
 * the angle — 20 across per 40 up. Enlarging the tile without scaling the run
 * to match is what stood the ridge up to nearly vertical on the first attempt,
 * and a vertical ridge is not a twill at all.
 *
 * SLUBS. Raw selvedge denim is flecked with tiny white specks where the weft
 * shows through. A flat indigo field with clean diagonals on it reads as
 * wallpaper; the flecks are the single biggest difference between the first
 * pass and the reference. They need their own, much larger tile — put them in
 * with the twill and they repeat every 20px, which is a grid of dots.
 */
const twill = (id: string) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width={20} height={40}>
    <line x1={0} y1={40} x2={20} y2={0} stroke="var(--rc-paper)" strokeWidth={7} opacity={0.16} />
    <line x1={-20} y1={40} x2={0} y2={0} stroke="var(--rc-paper)" strokeWidth={7} opacity={0.16} />
    <line x1={0} y1={20} x2={20} y2={20} stroke="var(--rc-ink)" strokeWidth={3} opacity={0.09} />
  </pattern>
);

/** Irregular on purpose: a grid of flecks is worse than no flecks. */
const SLUBS: [number, number, number][] = [
  [17, 26, 3.4], [74, 11, 2.4], [126, 44, 3.0], [45, 71, 2.6], [104, 88, 3.6],
  [9, 116, 2.4], [63, 134, 3.2], [141, 155, 2.6], [35, 172, 3.4], [92, 191, 2.4],
  [119, 213, 3.0], [52, 231, 2.6], [14, 249, 3.4], [81, 61, 2.4], [149, 104, 2.8],
  [28, 199, 2.4], [113, 262, 3.2], [66, 279, 2.6], [136, 291, 2.4], [23, 305, 3.0],
];

const slubs = (id: string) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width={160} height={320}>
    {SLUBS.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="var(--rc-paper)" opacity={0.55} />
    ))}
  </pattern>
);

/** Silhouette of the bolt — what the paper is cut around. */
const boltBody = (cx: number, fill: string) => (
  <rect x={cx - ROLL_R} y={TOP} width={ROLL_R * 2} height={BOT - TOP} fill={fill} />
);

/**
 * The bolt itself, turning. `travel` is how far it has rolled.
 *
 * It is PALE, not indigo, and that is not a legibility fudge — cloth is rolled
 * face-in to protect the face, so the outside of a bolt of denim is the back,
 * and the back of indigo denim is a pale blue-grey because only the warp is
 * dyed. The reference photographs show exactly this: dark navy face, grey back
 * on the outside of the roll. It also happens to solve the problem an earlier
 * pass solved by cheating — an indigo bolt laying indigo cloth simply vanished
 * into it, and got an ink wash to bring it back.
 */
const bolt = (cx: number, travel: number, twillId: string, key: string) => {
  const phase = (travel / ROLL_CIRC) * Math.PI * 2;
  const layers = Array.from({length: 44})
    .map((_, k) => phase + (k * Math.PI) / 22)
    .filter((t) => Math.cos(t) > 0.02);

  return (
    <g key={key}>
      {boltBody(cx, 'var(--rc-fresco)')}
      {boltBody(cx, `url(#${twillId})`)}
      {boltBody(cx, `url(#${twillId}-slub)`)}
      {layers.map((t, i) => (
        <line
          key={i}
          x1={cx + ROLL_R * Math.sin(t)}
          y1={TOP}
          x2={cx + ROLL_R * Math.sin(t)}
          y2={BOT}
          stroke="var(--rc-ink)"
          strokeWidth={3}
          opacity={0.04 + 0.34 * (1 - Math.cos(t))}
        />
      ))}
      <line x1={cx - ROLL_R} y1={TOP} x2={cx - ROLL_R} y2={BOT} stroke="var(--rc-ink)" strokeWidth={8} />
      <line x1={cx + ROLL_R} y1={TOP} x2={cx + ROLL_R} y2={BOT} stroke="var(--rc-ink)" strokeWidth={8} />
    </g>
  );
};

/**
 * The finished woven band where two widths overlap: the undyed cream edge, the
 * regular tick marks §3.4 asks for, and the ID line woven down it.
 *
 * The ID line is DOTTED. In the reference it is unmistakably a run of dots and
 * dashes rather than a drawn line — it is a thread appearing at intervals
 * through the weave, not something printed on — and getting that wrong is what
 * made the first pass read as a stripe painted on blue paper.
 *
 * It is also `--rc-annotation`, which §3.2 reserves for one mark per asset.
 * That reservation is respected rather than broken: in this transition the one
 * red thing IS the selvedge line. Red-line selvedge is the defining mark of
 * the cloth, and nothing else in the asset is red.
 */
const selvedge = (y: number, key: string) => {
  const ticks = Math.ceil((RUN_TO - RUN_FROM) / 40);
  return (
    <g key={key}>
      <rect x={RUN_FROM} y={y - SELVEDGE_W} width={RUN_TO - RUN_FROM} height={SELVEDGE_W} fill="var(--rc-paper)" />
      <line x1={RUN_FROM} y1={y - SELVEDGE_W} x2={RUN_TO} y2={y - SELVEDGE_W} stroke="var(--rc-ink)" strokeWidth={4} opacity={0.45} />
      {/* the overlapped edge of the width lying on top */}
      <line x1={RUN_FROM} y1={y} x2={RUN_TO} y2={y} stroke="var(--rc-ink)" strokeWidth={6} opacity={0.55} />
      {Array.from({length: ticks}).map((_, i) => (
        <line
          key={i}
          x1={RUN_FROM + i * 40}
          y1={y - SELVEDGE_W + 7}
          x2={RUN_FROM + i * 40}
          y2={y - 7}
          stroke="var(--rc-ink)"
          strokeWidth={5}
          opacity={0.3}
        />
      ))}
      <line
        x1={RUN_FROM}
        y1={y - SELVEDGE_W * 0.46}
        x2={RUN_TO}
        y2={y - SELVEDGE_W * 0.46}
        stroke="var(--rc-annotation)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray="7 17"
      />
    </g>
  );
};

export const M6Unroll: React.FC<MechanicProps> = ({seed}) => {
  const frame = useCurrentFrame();
  const uncoverAt = useUncoverAt();
  const variant = useCutVariant();
  const fid = `unroll-${seed}-${variant}`;
  const tid = `twill-${seed}`;

  // Constant speed, then a short settle — a bolt rolls at whatever speed you
  // push it, and stops when it runs out of push. drawOn's ease-out is right
  // for paper being placed and wrong here: it puts two thirds of the run into
  // the first third of the shot, so the wipe bolts across and then stalls.
  const roll = (start: number, dur: number) =>
    interpolate(frame, [start, start + dur - 5, start + dur], [0, 0.94, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  const head = RUN_FROM + roll(0, COVER) * (RUN_TO - RUN_FROM);
  const tail = RUN_FROM + roll(uncoverAt, UNCOVER) * (RUN_TO - RUN_FROM);
  if (head <= tail) return null;

  const clothW = head - tail;
  const headIn = head < RUN_TO;
  const tailIn = tail > RUN_FROM;

  // Fold lines are set ON THE CLOTH, not on the frame, so they stay put while
  // the edges travel. Seeded, so a variant is folded differently.
  const folds = Array.from({length: 9}).map(
    (_, i) => RUN_FROM + 480 + i * 470 + random(`${seed}-c${i}`) * 110,
  );

  return (
    <AbsoluteFill>
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      >
        <defs>
          {twill(tid)}
          {slubs(`${tid}-slub`)}
          <PaperCutFilter
            id={fid}
            variant={variant}
            blur={40}
            tear={56}
            userSpace
            region={{x: -520, y: -520, width: CANVAS_W + 1040, height: CANVAS_H + 1040}}
          />
          <clipPath id={`${fid}-cloth`}>
            <rect x={tail} y={CLOTH_TOP} width={clothW} height={CLOTH_BOTTOM - CLOTH_TOP} />
          </clipPath>
          {/* The selvedge runs the length of the cloth, so it carries on over
              the roll — the band wraps the bolt at the same height it lies at
              on the laid piece. Clipping to the cloth alone would stop it dead
              at the roll's edge, which is the one place the eye checks. */}
          <clipPath id={`${fid}-all`}>
            <rect x={tail} y={CLOTH_TOP} width={clothW} height={CLOTH_BOTTOM - CLOTH_TOP} />
            {headIn ? <rect x={head - ROLL_R} y={TOP} width={ROLL_R * 2} height={BOT - TOP} /> : null}
            {tailIn ? <rect x={tail - ROLL_R} y={TOP} width={ROLL_R * 2} height={BOT - TOP} /> : null}
          </clipPath>
        </defs>

        {/* PASS 1 — the paper, cut from the cloth's own outline. */}
        <g transform={`rotate(${TILT} ${CANVAS_W / 2} ${CANVAS_H / 2})`} filter={`url(#${fid})`}>
          <rect
            x={tail}
            y={CLOTH_TOP}
            width={clothW}
            height={CLOTH_BOTTOM - CLOTH_TOP}
            fill="#FFFFFF"
          />
          {headIn ? boltBody(head, '#FFFFFF') : null}
          {tailIn ? boltBody(tail, '#FFFFFF') : null}
        </g>

        {/* PASS 2 — the denim. */}
        <g transform={`rotate(${TILT} ${CANVAS_W / 2} ${CANVAS_H / 2})`}>
          <rect
            x={tail}
            y={CLOTH_TOP}
            width={clothW}
            height={CLOTH_BOTTOM - CLOTH_TOP}
            fill="var(--rc-indigo)"
          />
          <g clipPath={`url(#${fid}-cloth)`}>
            {/* Raw denim is deeper than the token on its own. Tonal
                separation from the palette rather than a new colour, the way
                the fabric swatches do it. */}
            <rect
              x={tail}
              y={CLOTH_TOP}
              width={clothW}
              height={CLOTH_BOTTOM - CLOTH_TOP}
              fill="var(--rc-ink)"
              opacity={0.22}
            />
            <rect
              x={RUN_FROM}
              y={CLOTH_TOP}
              width={RUN_TO - RUN_FROM}
              height={CLOTH_BOTTOM - CLOTH_TOP}
              fill={`url(#${tid})`}
            />
            <rect
              x={RUN_FROM}
              y={CLOTH_TOP}
              width={RUN_TO - RUN_FROM}
              height={CLOTH_BOTTOM - CLOTH_TOP}
              fill={`url(#${tid}-slub)`}
            />
            {/* The folds it was wound on, and the drape they leave: a wound
                bolt does not come off flat, so the fold lines bow. Lighter
                than the ground, because a crease in indigo is where the dye
                has worn off the ridge. */}
            {folds.map((x, i) => {
              const bow = (random(`${seed}-b${i}`) - 0.5) * 150;
              return (
                <path
                  key={`f${i}`}
                  d={`M ${x} ${CLOTH_TOP} C ${x + bow} ${CLOTH_TOP + 700} ${x - bow} ${
                    CLOTH_BOTTOM - 700
                  } ${x + bow * 0.3} ${CLOTH_BOTTOM}`}
                  fill="none"
                  stroke="var(--rc-paper)"
                  strokeWidth={9}
                  opacity={0.11}
                />
              );
            })}
          </g>

          {headIn ? bolt(head, head - RUN_FROM, tid, 'H') : null}
          {tailIn ? bolt(tail, tail - RUN_FROM, tid, 'T') : null}

          <g clipPath={`url(#${fid}-all)`}>
            {SELVEDGE_AT.map((y, i) => selvedge(y, `s${i}`))}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const MECHANICS = {
  M1: M1Mosaic,
  M2: M2Excavation,
  M3: M3Tiling,
  M4: M4Stitch,
  M5: M5Torn,
  M6: M6Unroll,
} as const;

export type MechanicName = keyof typeof MECHANICS;
