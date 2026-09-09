import {DIGITS, UPEM} from './glyphs';

/**
 * THE SEWING PLAN.
 *
 * Turns a chapter number into the sequence of events a machine would actually
 * perform to sew it: stitches along each contour, a thread jump between
 * contours, and a bar tack to finish.
 *
 * Everything here is pure geometry over baked outlines — no DOM measurement,
 * no path sampling at render time. That is deliberate. Remotion renders each
 * frame independently and often out of order, so anything that depends on a
 * measurement can place a stitch differently between two renders of the same
 * frame. A plan built from constants cannot.
 */

/** One stitch: where it sits, which way it points, and which way is inward. */
export type Stitch = {
  x: number;
  y: number;
  /** Tangent direction in degrees, the direction of travel. */
  a: number;
  /** Unit normal pointing INTO the body of the numeral. */
  nx: number;
  ny: number;
};

export type Event =
  | {kind: 'stitch'; s: Stitch; run: number}
  | {kind: 'jump'; from: Stitch; to: Stitch};

export type Plan = {events: Event[]; total: number};

const TAU = Math.PI * 2;

/** Ray casting. Used to decide which side of a contour is inside it. */
const inside = (pts: number[][], x: number, y: number): boolean => {
  let n = false;
  for (let i = 0, j = pts.length - 2; i < pts.length - 1; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) n = !n;
  }
  return n;
};

/**
 * Resamples a closed polyline at a constant arc length.
 *
 * The walk starts at the point nearest the top-left of the contour, because
 * that is where §3 says the needle drops — "the natural place". The weighting
 * favours top over left so a numeral starts at its crown rather than at
 * whatever happens to be furthest left.
 */
const resample = (pts: number[][], pitch: number): {x: number; y: number; a: number}[] => {
  let startIdx = 0;
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const score = pts[i][1] * 2 + pts[i][0];
    if (score < best) {
      best = score;
      startIdx = i;
    }
  }
  // Rotate so the contour begins at the needle-drop point, and close the loop.
  const n = pts.length - 1;
  const loop: number[][] = [];
  for (let i = 0; i <= n; i++) loop.push(pts[(startIdx + i) % n]);

  const out: {x: number; y: number; a: number}[] = [];
  let carried = 0;
  for (let i = 0; i < loop.length - 1; i++) {
    const [x0, y0] = loop[i];
    const [x1, y1] = loop[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const seg = Math.hypot(dx, dy);
    if (seg < 1e-9) continue;
    const a = (Math.atan2(dy, dx) * 360) / TAU;
    let d = pitch - carried;
    while (d <= seg) {
      out.push({x: x0 + (dx / seg) * d, y: y0 + (dy / seg) * d, a});
      d += pitch;
    }
    carried = (carried + seg) % pitch;
  }
  return out;
};

/**
 * Builds the plan for a number.
 *
 * Contours are already ordered outer-first then counters, which is the order
 * they get sewn: the outline of a digit, then the hole in it, then on to the
 * next digit — each hop a thread jump.
 *
 * `inward` points into the body of the numeral, not into the contour. For an
 * outer contour those are the same thing; for a counter they are opposites,
 * which is why the sign flips. It matters because the second topstitch row is
 * offset along it and has to land on cloth rather than in the hole.
 */
export const buildPlan = (
  digits: string,
  size: number,
  originX: number,
  baseline: number,
  pitch: number,
): Plan => {
  const s = size / UPEM;
  const events: Event[] = [];
  let pen = originX;
  let run = 0;
  let last: Stitch | null = null;

  for (const ch of digits) {
    const g = DIGITS[ch];
    if (!g) continue;
    g.contours.forEach((c, ci) => {
      // Font space is y-up; the card is y-down.
      const scaled = c.map(([fx, fy]) => [pen + fx * s, baseline - fy * s]);
      const pts = resample(scaled, pitch);
      if (pts.length < 3) return;

      // Which normal points into the contour? Test one, then flip for counters.
      const p = pts[0];
      const rad = (p.a * TAU) / 360;
      const cand = {x: -Math.sin(rad), y: Math.cos(rad)};
      const isIn = inside(scaled, p.x + cand.x * 2, p.y + cand.y * 2);
      const sign = (isIn ? 1 : -1) * (ci === 0 ? 1 : -1);

      pts.forEach((q, i) => {
        const r = (q.a * TAU) / 360;
        const st: Stitch = {
          x: q.x,
          y: q.y,
          a: q.a,
          nx: -Math.sin(r) * sign,
          ny: Math.cos(r) * sign,
        };
        if (i === 0 && last) events.push({kind: 'jump', from: last, to: st});
        events.push({kind: 'stitch', s: st, run});
        last = st;
      });
      run += 1;
    });
    pen += g.advance * s;
  }

  /**
   * The bar tack: two or three stitches doubling back over the last few, which
   * is how a seam is actually secured. Without it the run simply stops, and
   * stopping is the one thing a finished seam never looks like.
   */
  const tail = events.filter((e): e is Extract<Event, {kind: 'stitch'}> => e.kind === 'stitch');
  for (let k = 1; k <= 3; k++) {
    const src = tail[tail.length - 1 - (k % 2 === 1 ? 1 : 0)];
    if (src) events.push({kind: 'stitch', s: src.s, run: run - 1});
  }

  return {events, total: events.length};
};

/**
 * How long each event takes, in seconds.
 *
 * §2.6 asks for the stitch rhythm to match the seam the chapter teaches, so
 * the feel is a per-event duration multiplier rather than a single speed. The
 * stitching itself is LINEAR within a feel — a machine runs at constant speed —
 * and only the named feels depart from that, exactly where the brief says they
 * should.
 */
export type Feel = 'steady' | 'hesitate' | 'burst' | 'staccato';

export const eventDurations = (plan: Plan, rate: number, feel: Feel): number[] => {
  const base = 1 / rate;
  let sinceRunStart = 0;
  let lastRun = -1;
  return plan.events.map((e, i) => {
    if (e.kind === 'jump') return base * 2.2; // the needle lifts, travels, drops
    if (e.run !== lastRun) {
      lastRun = e.run;
      sinceRunStart = 0;
    } else {
      sinceRunStart += 1;
    }
    switch (feel) {
      case 'hesitate':
        // "slower, with tiny hesitations at curves" — a curve begins where a
        // contour does, so the first stitches of each run take longer.
        return base * (sinceRunStart < 3 ? 2.2 : 1);
      case 'burst':
        // "short bursts, then pause" — eight down, then two slow.
        return base * (i % 10 < 8 ? 0.75 : 2.5);
      case 'staccato':
        // "not sewing — hammering": punctuated, never even.
        return base * (i % 2 === 0 ? 0.7 : 1.6);
      default:
        return base;
    }
  });
};

/** Cumulative event times, so a frame maps to a stitch count by search. */
export const timeline = (durations: number[]): number[] => {
  const out: number[] = [];
  let t = 0;
  for (const d of durations) {
    t += d;
    out.push(t);
  }
  return out;
};

/** How many events have completed by time `t` seconds into the run. */
export const laidBy = (times: number[], t: number): number => {
  if (t <= 0) return 0;
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
