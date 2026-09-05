import {random} from 'remotion';

/**
 * An organic hand-cut paper shape — NOT a rectangle with a decorated edge.
 *
 * The §8 blocks are cut-down rectangles, which is right for a field sheet.
 * This is the other thing: a torn scrap, closer to round than square, with no
 * two edges alike. Built by perturbing a radius around a centre rather than
 * by wobbling the sides of a box, because a box perturbed at the edges still
 * reads as a box.
 *
 * Angular spacing is jittered as well as radius, so the facets vary in width
 * the way hand-cut ones do.
 */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth noise around a circle: wraps, so the shape closes without a seam. */
const angularNoise = (seed: string, t: number, freq: number): number => {
  const x = t * freq;
  const i0 = Math.floor(x);
  const f = x - i0;
  const s = f * f * (3 - 2 * f);
  const a = random(`${seed}-${i0 % freq}`) - 0.5;
  const b = random(`${seed}-${(i0 + 1) % freq}`) - 0.5;
  return lerp(a, b, s) * 2;
};

export const papercutPath = ({
  w,
  h,
  seed,
  points = 21,
  /** How far the edge wanders, as a fraction of the radius. */
  amount = 0.17,
  safe,
}: {
  w: number;
  h: number;
  seed: string;
  points?: number;
  amount?: number;
  /**
   * Half-width and half-height of a rectangle, centred, that the edge may
   * never cut inside. The shape wobbles freely everywhere else.
   *
   * Without this the content has to be guessed against the BOUNDING BOX while
   * the real outline is irregular, and a caption drops off whichever lobe
   * happened to come in short on that seed. Clamping the radius makes the
   * overflow impossible rather than unlikely.
   */
  safe?: {hw: number; hh: number; margin?: number};
}): string => {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const pts: string[] = [];

  for (let i = 0; i < points; i++) {
    const base = i / points;
    // Jittered spacing: facets of uneven width, as a hand cut gives.
    const t = base + (random(`${seed}-a-${i}`) - 0.5) * (0.55 / points);
    const th = t * Math.PI * 2;

    // Big lobes first, then a finer ripple, then per-facet grit. Weighting it
    // toward the low frequency is what makes it read as torn rather than as a
    // polygon with rounded corners.
    const wander =
      angularNoise(`${seed}-lo`, t, 3) * 1.0 +
      angularNoise(`${seed}-md`, t, 7) * 0.42 +
      (random(`${seed}-g-${i}`) - 0.5) * 0.34;

    const k = 1 + wander * amount * 2;
    let px = Math.cos(th) * rx * k;
    let py = Math.sin(th) * ry * k;

    if (safe) {
      const m = safe.margin ?? 1.06;
      const c = Math.abs(Math.cos(th));
      const sn = Math.abs(Math.sin(th));
      // Distance from centre to the safe rectangle's edge along this angle.
      const needed =
        Math.min(c > 1e-6 ? safe.hw / c : Infinity, sn > 1e-6 ? safe.hh / sn : Infinity) * m;
      const have = Math.hypot(px, py);
      if (have < needed) {
        const g = needed / have;
        px *= g;
        py *= g;
      }
    }

    pts.push(`${(cx + px).toFixed(1)} ${(cy + py).toFixed(1)}`);
  }

  return `M ${pts.join(' L ')} Z`;
};

/** Stop-motion boil: re-cut every few frames from a small set of variants. */
export const BOIL_EVERY = 4;
export const BOIL_VARIANTS = 3;
export const boilSeed = (seed: string, frame: number) =>
  `${seed}-v${Math.floor(frame / BOIL_EVERY) % BOIL_VARIANTS}`;
