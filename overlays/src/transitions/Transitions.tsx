import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {PaperCard} from '../lib/paper';
import {HEIGHT, WIDTH, palette, tones, type ToneName} from '../lib/theme';

export const transitionSchema = z.object({
  tone: z.enum(['vellum', 'foxed', 'parchment', 'oxblood', 'nocturne']),
  /** Total length of the sweep. The cut point sits in the middle. */
  seconds: z.number().min(0.4).max(4).step(0.1),
});

export type TransitionProps = z.infer<typeof transitionSchema>;

/**
 * These are full-frame wipes with alpha, meant to sit ON the cut: put the
 * transition clip on the track above, and place your cut between the two
 * shots at the moment the paper fully covers frame - the COVER MARKER in
 * the README says which frame that is.
 *
 * Cover is held for a few frames rather than hit for an instant, so the cut
 * underneath has somewhere to live.
 */
const sweepX = (t: number, coverIn: number, coverOut: number) => {
  const travel = WIDTH * 1.5;
  if (t <= coverIn) {
    return interpolate(t, [0, coverIn], [-travel, 0], {
      easing: Easing.bezier(0.36, 0, 0.12, 1),
    });
  }
  if (t < coverOut) return 0;
  return interpolate(t, [coverOut, 1], [0, travel], {
    easing: Easing.bezier(0.85, 0, 0.6, 1),
  });
};

/** One big sheet thrown across the frame. */
export const PaperSweep: React.FC<TransitionProps> = ({tone}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / (durationInFrames - 1);
  // Only just larger than the frame (plus room for the 2.2 degree tilt), so
  // full coverage is a brief window rather than half the transition.
  const w = WIDTH * 1.1;
  const h = HEIGHT * 1.16;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: (WIDTH - w) / 2,
          top: (HEIGHT - h) / 2,
          transform: `translateX(${sweepX(t, 0.4, 0.56)}px) rotate(-2.2deg)`,
        }}
      >
        <PaperCard
          width={w}
          height={h}
          seed="sweep"
          tone={tone}
          torn={['left', 'right']}
          tornAmp={90}
          grain={false}
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * Six torn strips crossing at staggered times, so the frame is shredded over
 * rather than covered flat. The stagger is deliberately small - the strips
 * must all be across before the cover window opens.
 */
export const PaperStrips: React.FC<TransitionProps> = ({tone}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / (durationInFrames - 1);
  const n = 6;
  const strip = HEIGHT / n;
  const w = WIDTH * 1.16;

  return (
    <AbsoluteFill>
      {Array.from({length: n}).map((_, i) => {
        // Seeded stagger, so the order is fixed rather than re-rolled per frame.
        const lead = random(`strip-${i}`) * 0.07;
        const local = Math.min(1, Math.max(0, (t - lead) / (1 - lead)));
        // Overlap the strips vertically so no seam of video shows between them.
        const overlap = strip * 0.14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (WIDTH - w) / 2,
              top: i * strip - overlap / 2,
              transform: `translateX(${sweepX(local, 0.42, 0.62) * (i % 2 === 0 ? 1 : 1.06)}px)`,
            }}
          >
            <PaperCard
              width={w}
              height={strip + overlap}
              seed={`strip-${i}`}
              tone={tone}
              torn={i === 0 ? ['left', 'right', 'top'] : i === n - 1 ? ['left', 'right', 'bottom'] : ['left', 'right']}
              grain={false}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const transitionDefaults: Record<string, TransitionProps> = {
  PaperSweep: {tone: 'vellum', seconds: 0.9},
  PaperStrips: {tone: 'foxed', seconds: 1.2},
  MosaicBuild: {tone: 'parchment', seconds: 1.6},
  CentreReveal: {tone: 'vellum', seconds: 1.5},
};

export const toneOf = (t: ToneName) => tones[t];

/* ------------------------------------------------------------------ */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;

/** Tesserae are drawn from the gold-ground palette of a Ravenna mosaic:
 *  mostly gilt and parchment, with scattered bole, lapis and verdigris. */
const TESSERA = [
  palette.gilt, palette.gilt, palette.gilt,
  palette.parchment, palette.parchment,
  palette.foxed,
  palette.bole,
  palette.lapis,
  palette.verdigris,
  palette.oxblood,
];

const COLS = 26;
const ROWS = 15;
/** Tiles overlap slightly, so a landed mosaic has no pinholes of video in it. */
const OVERLAP = 10;

/**
 * A mosaic that lays itself: tesserae fly in, settle into a full gold ground,
 * hold, then scatter. From the note on the board about mosaics animating to
 * build a painting.
 *
 * All 390 tiles live in one SVG - giving each its own PaperCard would mean
 * 390 sets of filters per frame, which is not a thing you can render.
 */
export const MosaicBuild: React.FC<TransitionProps> = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / (durationInFrames - 1);

  const tw = WIDTH / COLS;
  const th = HEIGHT / ROWS;

  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const s = `m${i}`;

      const inDelay = random(`${s}-d`) * 0.28;
      const inT = easeOutCubic(clamp01((t - inDelay) / 0.17));
      const outDelay = random(`${s}-o`) * 0.26;
      const outT = easeOutCubic(clamp01((t - 0.62 - outDelay) / 0.16));

      if (inT <= 0) continue;

      const ang = random(`${s}-a`) * Math.PI * 2;
      const dist = 420 + random(`${s}-r`) * 620;
      const ox = Math.cos(ang) * dist * (1 - inT) + Math.cos(ang) * dist * 0.8 * outT;
      const oy = Math.sin(ang) * dist * (1 - inT) + Math.sin(ang) * dist * 0.8 * outT;
      const rot = (random(`${s}-t`) - 0.5) * 90 * (1 - inT) + (random(`${s}-t2`) - 0.5) * 70 * outT;
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
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={3}
          />
        </g>,
      );
    }
  }

  return (
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {tiles}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

/**
 * Opens from the centre of frame, covers, then tears apart to uncover -
 * for revealing the finished garment.
 *
 * It is two sheets throughout, not one that splits: they grow together as a
 * single sheet (they overlap at the middle, so the torn seam between them
 * reads as a join rather than a gap), then part left and right. Building it
 * that way avoids swapping one element for two mid-shot, which always shows.
 */
export const CentreReveal: React.FC<TransitionProps> = ({tone}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / (durationInFrames - 1);

  const grow = interpolate(t, [0, 0.4], [0.04, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.3, 0, 0.15, 1),
  });
  const rot = interpolate(t, [0, 0.4], [-9, -1.2], {extrapolateRight: 'clamp'});
  const part = interpolate(t, [0.58, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    easing: Easing.bezier(0.5, 0, 0.6, 1),
  });

  const halfW = WIDTH * 0.56;
  const h = HEIGHT * 1.25;
  const top = (HEIGHT - h) / 2;
  const OVER = 40;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: 'center center',
          transform: `scale(${grow}) rotate(${rot}deg)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: WIDTH / 2 + OVER - halfW,
            top,
            transform: `translateX(${-part * WIDTH * 0.8}px)`,
          }}
        >
          <PaperCard
            width={halfW}
            height={h}
            seed="centre-left"
            tone={tone}
            torn={['right']}
            tornAmp={95}
            grain={false}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: WIDTH / 2 - OVER,
            top,
            transform: `translateX(${part * WIDTH * 0.8}px)`,
          }}
        >
          <PaperCard
            width={halfW}
            height={h}
            seed="centre-right"
            tone={tone}
            torn={['left']}
            tornAmp={95}
            grain={false}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
