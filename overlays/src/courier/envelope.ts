import {Easing, interpolate} from 'remotion';
import {TOTAL} from '../chapters/timing';
import {FPS} from './design';

/**
 * THE CARD'S OWN ALPHA ENVELOPE.
 *
 * These ship as alpha overlays, so the envelope is not decoration — it is the
 * difference between a card that arrives and leaves, and a card that snaps on
 * and snaps off over somebody's footage. Two things were wrong when the ramps
 * were borrowed from the chapter-card timing helpers:
 *
 * THE FADE IN WAS A HARD CUT. The shared `at()` uses the brief's entrance
 * curve, cubic-bezier(0.22, 1, 0.36, 1) — almost all of its travel is in the
 * first few percent. Over a 0.3s window that put the card at 45% opacity ONE
 * frame in and 72% by the second. That curve is right for an element sliding
 * into place and wrong for a whole-frame opacity: measured on the render, it
 * was a cut with a single soft frame in front of it.
 *
 * THE FADE OUT NEVER REACHED ZERO. The shared `outT` ramps across
 * [TOTAL - OUT, TOTAL], but the last frame rendered is TOTAL - 1, so the clip
 * ended at 11% alpha and popped off. An overlay has to land on nothing.
 *
 * Both are fixed here rather than in chapters/timing.ts, because the Keystone
 * cards are already delivered and shipped against those helpers. This is the
 * Courier set's own envelope and changes nothing that has already gone out.
 */

const IN_FRAMES = Math.round(0.4 * FPS);
const OUT_FRAMES = Math.round(0.6 * FPS);

export const envelope = (frame: number) => {
  const up = interpolate(frame, [0, IN_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  // Lands on exactly zero at the final rendered frame, not one frame past it.
  const down = interpolate(frame, [TOTAL - 1 - OUT_FRAMES, TOTAL - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  return up * down;
};
