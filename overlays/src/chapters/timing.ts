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

export const IN = s(1.9);
export const HOLD = s(3.0);
export const OUT = s(0.6);
export const TOTAL = Math.round(IN + HOLD + OUT); // 165

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

/** §4's beat sheet, in seconds, exactly as written. */
export const BEAT = {
  selvedge: [0.0, 0.4],
  stitches: [0.05, 0.5],
  rule: [0.3, 0.6],
  part: [0.4, 0.8],
  number: [0.5, 1.0],
  title: [0.7, 1.2],
  titleStagger: 0.08,
  sub: [1.0, 1.4],
  line: [1.1, 1.5],
  chips: [1.2, 1.8],
  chipStagger: 0.1,
  pieces: [1.5, 1.9],
  /**
   * The brief does not schedule these four. They are the quiet furniture of
   * the card, so they arrive under the beats that are scheduled rather than
   * competing with them: the ghost is up before anything is read, and the
   * footer settles last.
   */
  ghost: [0.1, 0.9],
  groupsLabel: [1.1, 1.5],
  piecesLabel: [1.45, 1.85],
  extra: [1.6, 2.0],
  foot: [1.4, 1.9],
} as const;
