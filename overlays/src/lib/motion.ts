import {Easing, interpolate, random} from 'remotion';

/**
 * Motion primitives — spec §3.5.
 *
 * "Physical and slightly imprecise. Paper being placed on a table, a stamp
 * being pressed, tesserae being set. Not sliding, fading, easing in from
 * off-screen."
 *
 * Everything here is ease-out or ease-in only. §3.4 forbids any easing that
 * reads as UI, which rules out springs, bounce and elastic overshoot — so
 * there is deliberately no spring helper in this file.
 */

/** 0 -> 1, ease-out, no overshoot. Used for draw-on and placement. */
export const drawOn = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

/** 0 -> 1 across the exit window, ease-in. */
export const exitRamp = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

/**
 * §3.5: "Introduce ±1 frame of irregularity on multi-element builds so nothing
 * lands in perfect lockstep." Seeded, so the irregularity is fixed rather than
 * re-rolled per frame across Remotion's parallel render processes.
 */
export const jitter1 = (seed: string) => (random(seed) - 0.5) * 2;

/**
 * §3.5: "Paper elements may have a 1–2° rotation. Never 0°. Never more than 4°."
 * Seeded per element, and clamped into the legal band.
 */
export const paperAngle = (seed: string) => {
  const sign = random(`${seed}-s`) > 0.5 ? 1 : -1;
  return sign * (1 + random(`${seed}-m`));
};
