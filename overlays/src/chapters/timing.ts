import {Easing, interpolate} from 'remotion';
import {FPS} from './design';

/**
 * THE CHAPTER-CARD TIMELINE, from §4 of the brief.
 *
 * "These are chapter openers, not transitions. They should feel considered and
 * calm, like a title page in a book. Nothing bouncy, nothing that slides in
 * from off-screen at speed."
 *
 * The brief gives a beat sheet in seconds and a duration of "2.5-3.5 seconds
 * on screen, plus in and out". Its last element lands at 1.9s, so: 1.9s in,
 * 3.0s fully formed, 0.6s out — 5.5 seconds, 165 frames at 30.
 *
 * Times below are the brief's, in seconds, converted here rather than
 * hand-counted into frames, so changing the frame rate cannot desynchronise
 * the sequence from the document that specifies it.
 */
export const s = (sec: number) => sec * FPS;

export const IN = s(2.15);
export const HOLD = s(3.0);
export const OUT = s(0.6);
export const TOTAL = Math.round(IN + HOLD + OUT); // 173

/** "cubic-bezier(0.22, 1, 0.36, 1) for entries. Nothing with overshoot." */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/** 0 before `from`, 1 after `to`, eased between. */
export const at = (frame: number, from: number, to: number) =>
  interpolate(frame, [s(from), s(to)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });

/**
 * The card's own fade-out. The brief offers "whole card fades, or the selvedge
 * wipes off in the direction it came from" — this does both, because the card
 * is delivered with an alpha channel and a plain dip to nothing looked like a
 * dip to black when there is no footage under it.
 */
export const outT = (frame: number) =>
  interpolate(frame, [TOTAL - OUT, TOTAL], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.7, 0.4),
  });

/**
 * §4's beat sheet from the STITCH brief, in seconds, exactly as written.
 *
 * This supersedes the original card timeline. The number now begins sewing
 * BEFORE the title arrives and finishes as the title settles — "They should
 * overlap, not queue" — which is why the title moved from 0.7 to 1.10 and the
 * whole card got 0.25s longer.
 */
export const BEAT = {
  selvedge: [0.0, 0.45],
  stitches: [0.05, 0.45],
  rule: [0.3, 0.55],
  part: [0.4, 0.8],
  /** The hero moment. The number sews from here; see NUMBER_SEW. */
  number: [0.55, 1.6],
  title: [1.1, 1.55],
  titleStagger: 0.08,
  sub: [1.45, 1.75],
  line: [1.5, 1.8],
  chips: [1.6, 2.1],
  chipStagger: 0.1,
  pieces: [1.85, 2.15],
  /**
   * Not scheduled by the brief. Quiet furniture, kept under the beats that are
   * scheduled: the ghost is up before anything is read, the footer settles
   * last.
   */
  ghost: [0.1, 0.9],
  groupsLabel: [1.5, 1.9],
  piecesLabel: [1.8, 2.1],
  extra: [1.95, 2.25],
  foot: [1.7, 2.1],
} as const;

/** When the needle drops, and when the seam has become the numeral. */
export const NUMBER_SEW = {start: 0.55, resolve: 1.72};

/** Seconds elapsed at a given frame — the stitch engine works in seconds. */
export const secs = (frame: number) => frame / FPS;
