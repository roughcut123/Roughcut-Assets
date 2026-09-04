import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {PaperCard} from '../lib/paper';
import {HEIGHT, WIDTH, tones, type ToneName} from '../lib/theme';

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
};

export const toneOf = (t: ToneName) => tones[t];
