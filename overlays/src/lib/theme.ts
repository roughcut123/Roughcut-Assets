/**
 * Roughcut overlay design system.
 *
 * Everything is authored at 4K (3840x2160). All sizes below are in 4K pixels,
 * so a value of 100px is ~4.6% of frame height. To render a 1080p version,
 * reuse the same composition with `--scale=0.25` instead of editing numbers.
 */

export const FPS = 30;
export const WIDTH = 3840;
export const HEIGHT = 2160;

/** Where the top-left overlay zone begins, in 4K px. */
export const MARGIN_X = 210;
export const MARGIN_Y = 180;

/** Entrance / exit lengths in frames. Hold is per-composition (a prop). */
export const IN_FRAMES = 26;
export const OUT_FRAMES = 20;
export const DEFAULT_HOLD_SECONDS = 2.8;

/**
 * Palette pulled from the studio footage: warm dark wood, raw calico, kraft
 * paper, tailor's chalk, and the rust / indigo that recur in the prints.
 */
export const palette = {
  ink: '#17130F',
  inkSoft: '#4B4238',
  inkFaint: '#8C7F6E',

  /** Pattern tissue - the default card. */
  tissue: '#F3EDE0',
  tissueEdge: '#D9CDB6',

  /** Manila pattern card - heavier, warmer. */
  manila: '#E7D6B2',
  manilaEdge: '#C9B084',

  /** Kraft swing tag. */
  kraft: '#C6A277',
  kraftEdge: '#A4805A',

  /** Dark card, for when the shot behind is bright/blown out. */
  slate: '#221E19',
  slateEdge: '#3E372E',

  /** Accents. */
  thread: '#B03E29',
  indigo: '#2E4A5C',
  ochre: '#C2872C',
  chalk: '#F7F4EC',
} as const;

export type ToneName = 'tissue' | 'manila' | 'kraft' | 'slate';

export type Tone = {
  base: string;
  edge: string;
  /** Text colour that reads on this tone. */
  text: string;
  textSoft: string;
};

export const tones: Record<ToneName, Tone> = {
  tissue: {
    base: palette.tissue,
    edge: palette.tissueEdge,
    text: palette.ink,
    textSoft: palette.inkSoft,
  },
  manila: {
    base: palette.manila,
    edge: palette.manilaEdge,
    text: palette.ink,
    textSoft: palette.inkSoft,
  },
  kraft: {
    base: palette.kraft,
    edge: palette.kraftEdge,
    text: palette.ink,
    textSoft: '#5A4632',
  },
  slate: {
    base: palette.slate,
    edge: palette.slateEdge,
    text: palette.chalk,
    textSoft: '#B3A896',
  },
};

export const font = {
  display: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  mono: '"IBM Plex Mono", "SF Mono", Menlo, monospace',
} as const;

/** Type scale, in 4K px. */
export const type = {
  eyebrow: 34,
  eyebrowTrack: 7,
  headline: 116,
  headlineSm: 92,
  note: 44,
  big: 300,
  bigSm: 220,
  unit: 78,
} as const;
