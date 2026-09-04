import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {FPS, HEIGHT, IN_FRAMES, OUT_FRAMES, WIDTH, palette} from '../lib/theme';
import {specs} from '../overlays/specs';
import {Overlay, defaultPropsFor} from '../overlays/Overlay';

/**
 * A painted ground, generated rather than photographed: a warm underpainting
 * scumbled over with indigo and bengara washes and finished with canvas
 * tooth. It stands in for footage so the reel shows the cards against
 * something in the right key, with no image assets in the repo.
 */
const PaintedGround: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#241C15'}}>
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="ground" cx="0.38" cy="0.34" r="0.85">
          <stop offset="0%" stopColor="#5A422C" />
          <stop offset="45%" stopColor="#33261A" />
          <stop offset="100%" stopColor="#140F0B" />
        </radialGradient>
        <radialGradient id="washA" cx="0.78" cy="0.22" r="0.5">
          <stop offset="0%" stopColor={palette.lapis} stopOpacity="0.55" />
          <stop offset="100%" stopColor={palette.lapis} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="washB" cx="0.2" cy="0.85" r="0.55">
          <stop offset="0%" stopColor={palette.sanguine} stopOpacity="0.4" />
          <stop offset="100%" stopColor={palette.sanguine} stopOpacity="0" />
        </radialGradient>
        <filter id="tooth" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="5" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#ground)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#washA)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#washB)" />
      <rect width={WIDTH} height={HEIGHT} filter="url(#tooth)" opacity={0.2}
        style={{mixBlendMode: 'overlay'}} />
    </svg>
  </AbsoluteFill>
);

/**
 * Preview only - every overlay in order over a painted ground, so the motion
 * can be judged without opening the Studio. `scripts/render-all.mjs` skips
 * this one; it has no alpha channel and is not something you would put on a
 * timeline.
 */
export const SHOWREEL_ITEM_FRAMES = Math.round(2.4 * FPS) + IN_FRAMES + OUT_FRAMES;
export const SHOWREEL_DURATION = SHOWREEL_ITEM_FRAMES * specs.length;

export const Showreel: React.FC = () => (
  <AbsoluteFill>
    <PaintedGround />
    <Series>
      {specs.map((spec) => (
        <Series.Sequence key={spec.id} durationInFrames={SHOWREEL_ITEM_FRAMES}>
          <Overlay {...defaultPropsFor(spec)} spec={spec} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
