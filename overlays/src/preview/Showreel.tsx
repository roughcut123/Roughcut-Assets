import React from 'react';
import {AbsoluteFill, Img, Series, staticFile} from 'remotion';
import {FPS, HEIGHT, IN_FRAMES, OUT_FRAMES, WIDTH} from '../lib/theme';
import {specs} from '../overlays/specs';
import {Overlay, defaultPropsFor} from '../overlays/Overlay';

/**
 * Preview only - every overlay in order over a still from the workshop, so
 * the motion can be judged without opening the Studio or rendering the pack.
 * `scripts/render-all.mjs` skips this one; it has no alpha channel and is not
 * something you would put on a timeline.
 */
export const SHOWREEL_ITEM_FRAMES =
  Math.round(2.4 * FPS) + IN_FRAMES + OUT_FRAMES;

export const SHOWREEL_DURATION = SHOWREEL_ITEM_FRAMES * specs.length;

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1b1713'}}>
    <Img
      src={staticFile('preview-bg.jpg')}
      style={{width: WIDTH, height: HEIGHT, objectFit: 'cover'}}
    />
    <Series>
      {specs.map((spec) => (
        <Series.Sequence key={spec.id} durationInFrames={SHOWREEL_ITEM_FRAMES}>
          <Overlay {...defaultPropsFor(spec)} spec={spec} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
