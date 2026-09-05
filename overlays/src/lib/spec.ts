/**
 * Fixed values from the asset spec. Anything here is quoted from the document,
 * not chosen — if a number looks wrong, the spec is where to change it.
 */

/** §1 delivery */
export const CANVAS_W = 3840;
export const CANVAS_H = 2160;
/** §1: 25 fps. Distinct from the older 30fps pack, which predates the spec. */
export const SPEC_FPS = 25;

/** §13 timing reference, in frames at 25fps. */
export const TIMING = {
  transition: {in: 25, hold: 12, out: 25, total: 62},
  title: {in: 10, hold: 30, out: 10, total: 50},
  popup: {in: 12, hold: 100, out: 25, total: 137},
  correction: {in: 8, hold: 75, out: 12, total: 95},
  crossref: {in: 12, hold: 75, out: 12, total: 99},
  daybreak: {in: 8, hold: 34, out: 8, total: 50},
  reveal: {in: 40, hold: 100, out: 30, total: 170},
} as const;

/** §13: every asset also ships a _LOOP variant with the hold extended to 10s. */
export const LOOP_HOLD_FRAMES = 10 * SPEC_FPS;

/** §8: top-left, 160px margin from both edges, max width 1100px. */
export const POPUP = {
  marginX: 160,
  marginY: 160,
  maxWidth: 1100,
} as const;

/** §3.3: minimum on-screen text size at 4K. Assume a phone viewer. */
export const MIN_TEXT_PX = 48;
