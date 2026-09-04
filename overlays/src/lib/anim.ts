import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {IN_FRAMES, OUT_FRAMES} from './theme';

export type AnimStyle = 'slide' | 'stamp' | 'unfold' | 'cut' | 'drop';

export type Reveal = {
  /** 0 -> 1 springy entrance progress. */
  enter: number;
  /** 0 -> 1 exit progress, only non-zero in the final OUT_FRAMES. */
  exit: number;
  frame: number;
};

export const useReveal = (): Reveal => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    durationInFrames: IN_FRAMES,
    config: {damping: 15, mass: 0.9, stiffness: 130},
  });

  const exit = interpolate(frame, [durationInFrames - OUT_FRAMES, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  return {enter, exit, frame};
};

/**
 * Maps an animation style to the CSS that moves the card.
 *
 * `restAngle` is the tiny angle the card settles at (a fraction of a degree).
 * It is what stops these reading as flat UI chrome - real paper laid on a
 * bench is never perfectly square.
 */
export const revealStyle = ({
  style,
  enter,
  exit,
  width,
  restAngle,
}: {
  style: AnimStyle;
  enter: number;
  exit: number;
  width: number;
  restAngle: number;
}): React.CSSProperties => {
  // A generous negative inset keeps the drop shadow alive on the sides that
  // are not being wiped.
  const SH = 200;
  const base: React.CSSProperties = {
    // Chromium renders sub-pixel text more consistently with this on.
    willChange: 'transform, opacity',
  };

  switch (style) {
    case 'slide': {
      const x = interpolate(enter, [0, 1], [-(width + 420), 0]);
      const outX = exit * -(width + 420);
      const rot = interpolate(enter, [0, 1], [-3.2, restAngle]);
      return {
        ...base,
        transform: `translateX(${x + outX}px) rotate(${rot}deg)`,
        opacity: interpolate(exit, [0.6, 1], [1, 0], {extrapolateLeft: 'clamp'}),
      };
    }

    case 'stamp': {
      const scale = interpolate(enter, [0, 1], [1.22, 1]) * interpolate(exit, [0, 1], [1, 0.93]);
      const rot = interpolate(enter, [0, 1], [-3.6, restAngle]);
      const y = exit * -70;
      return {
        ...base,
        transformOrigin: '18% 40%',
        transform: `translateY(${y}px) scale(${scale}) rotate(${rot}deg)`,
        opacity: interpolate(enter, [0, 0.35], [0, 1], {extrapolateRight: 'clamp'}) *
          interpolate(exit, [0, 1], [1, 0]),
      };
    }

    case 'unfold': {
      // Hinged on its top edge, like a sheet folding down onto the bench.
      const rx = interpolate(enter, [0, 1], [-88, 0]) + exit * -88;
      return {
        ...base,
        transformOrigin: 'top left',
        perspective: 2600,
        transform: `perspective(2600px) rotateX(${rx}deg) rotate(${restAngle}deg)`,
        opacity: interpolate(enter, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}),
      };
    }

    case 'cut': {
      // Revealed left-to-right as though a blade opened it, then closed off
      // from the same side on the way out.
      const right = (1 - enter) * 100;
      const left = exit * 100;
      const x = interpolate(enter, [0, 1], [-70, 0]);
      return {
        ...base,
        clipPath: `inset(-${SH}px ${Math.max(right, 0)}% -${SH}px ${left}%)`,
        transform: `translateX(${x}px) rotate(${restAngle}deg)`,
      };
    }

    case 'drop': {
      const y = interpolate(enter, [0, 1], [-320, 0]) + exit * 90;
      const rot = interpolate(enter, [0, 1], [2.8, restAngle]);
      return {
        ...base,
        transform: `translateY(${y}px) rotate(${rot}deg)`,
        opacity: interpolate(enter, [0, 0.2], [0, 1], {extrapolateRight: 'clamp'}) *
          interpolate(exit, [0.15, 1], [1, 0], {extrapolateLeft: 'clamp'}),
      };
    }
  }
};

/**
 * Progress for details that should land *after* the card itself, so the card
 * arrives and then the stitching/annotation draws on. Delay is in frames.
 */
export const useDetail = (delay: number, length = 22) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    durationInFrames: length,
    config: {damping: 200, mass: 1, stiffness: 100},
  });
};
