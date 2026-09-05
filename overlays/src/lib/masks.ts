import {random} from 'remotion';

/**
 * Torn-edge mask generator — spec §3.4.
 *
 * "Every mask must be non-repeating. Generate at minimum 6 torn-edge variants
 * and cycle them so the same silhouette never appears twice in one video."
 *
 * Variants are addressed by index rather than generated randomly, so an asset
 * declares which silhouette it uses and gets the same one on every render.
 * Offsets come from Remotion's seeded `random`, never `Math.random()` —
 * Remotion renders frames across parallel processes, so an unseeded random
 * would give each frame a different edge.
 */
export const TORN_VARIANTS = 8;

export type Edge = 'top' | 'right' | 'bottom' | 'left';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth value noise: a wandering line, not per-point jitter. */
const valueNoise = (seed: string, x: number): number => {
  const i0 = Math.floor(x);
  const f = x - i0;
  const s = f * f * (3 - 2 * f);
  const a = random(`${seed}-${i0}`) - 0.5;
  const b = random(`${seed}-${i0 + 1}`) - 0.5;
  return lerp(a, b, s) * 2;
};

export const tornRectPath = ({
  w,
  h,
  variant,
  torn = ['right'],
  wobble = 13,
  tornAmp = 30,
  segments = 20,
}: {
  w: number;
  h: number;
  /** 0 .. TORN_VARIANTS-1. Distinct silhouette per index. */
  variant: number;
  torn?: Edge[];
  /** Deviation on cleanly cut edges, px. */
  wobble?: number;
  /** Deviation on torn edges, px. */
  tornAmp?: number;
  segments?: number;
}): string => {
  const seedBase = `torn-v${variant % TORN_VARIANTS}`;

  const edges: {name: Edge; from: [number, number]; to: [number, number]; normal: [number, number]}[] = [
    {name: 'top', from: [0, 0], to: [w, 0], normal: [0, -1]},
    {name: 'right', from: [w, 0], to: [w, h], normal: [1, 0]},
    {name: 'bottom', from: [w, h], to: [0, h], normal: [0, 1]},
    {name: 'left', from: [0, h], to: [0, 0], normal: [-1, 0]},
  ];

  const pts: [number, number][] = [];

  for (const e of edges) {
    const isTorn = torn.includes(e.name);
    const amp = isTorn ? tornAmp : wobble;
    const n = isTorn ? segments * 3 : segments;
    const s = `${seedBase}-${e.name}`;

    for (let i = 0; i < n; i++) {
      const jitter = isTorn ? (random(`${s}-j-${i}`) - 0.5) * (0.8 / n) : 0;
      const t = Math.min(1, Math.max(0, i / n + jitter));
      const x = lerp(e.from[0], e.to[0], t);
      const y = lerp(e.from[1], e.to[1], t);
      // Corners keep about a quarter of the deviation. Pinning them exactly to
      // the rectangle is what makes an edge read as decoration on a box.
      const taper = 0.24 + 0.76 * Math.min(1, Math.sin(Math.PI * t) * 1.8);
      const off = isTorn
        ? amp *
          (valueNoise(`${s}-lo`, t * 3.5) * 0.62 +
            valueNoise(`${s}-hi`, t * 14) * 0.3 +
            (random(`${s}-g-${i}`) - 0.5) * 0.34)
        : amp * (valueNoise(`${s}-lo`, t * 2.5) * 0.8 + valueNoise(`${s}-md`, t * 6) * 0.3);
      const r = off * taper;
      pts.push([x + e.normal[0] * r, y + e.normal[1] * r]);
    }
  }

  return `M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`;
};
