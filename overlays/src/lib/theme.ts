/**
 * Roughcut overlay design system.
 *
 * Authored at 4K (3840x2160). All sizes are in 4K pixels, so 100px is ~4.6%
 * of frame height. For a 1080p version, render the same composition with
 * `--scale=0.25` rather than editing these numbers.
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
 * The palette is taken from the Roughcut board: the gilt Roman lettering on
 * the oxblood "relic" cover, the washed paper of the Durer and manuscript
 * scans, the tea-stained map, and the deep end of the oil paintings and
 * ukiyo-e prints - oxblood, gilt, verdigris, rose, lapis.
 *
 * These are pigment names rather than screen names on purpose: the point of
 * reference is a paint box and a print shop, not a colour picker.
 */
export const palette = {
  /* --- washed papers, as they come off a scan --- */
  /** Pale vellum: the engraving plates. */
  vellum: '#EDE2CA',
  vellumEdge: '#D2C3A2',
  /** Foxed and yellowed. */
  foxed: '#DFCEAB',
  foxedEdge: '#C0AA7E',
  /** Tea-stained parchment: the map, the certificate. */
  parchment: '#CDB894',
  parchmentEdge: '#AB9268',

  /* --- deep grounds --- */
  /** The oxblood of the relic cover. */
  oxblood: '#4A1E1B',
  oxbloodEdge: '#6B322C',
  /** Night blue-black, from the darkest of the paintings. */
  nocturne: '#141A22',
  nocturneEdge: '#2B3644',

  /* --- pigments --- */
  /** Gilt: the Roman capitals, the halo, the frames. */
  gilt: '#C0982F',
  /** Sanguine: red chalk, terracotta. */
  sanguine: '#A85C43',
  /** Bole: the red-brown under gold leaf. */
  bole: '#6E2B26',
  /** Verdigris: the teal of the woodblock waves. */
  verdigris: '#2F5F58',
  /** Rose: the pink of the woodblock sky. */
  rose: '#B4726C',
  /** Lapis: deep blue. */
  lapis: '#274A70',

  /* --- inks --- */
  /** Iron gall: warm brown-black, never neutral. */
  ink: '#241C14',
  inkSoft: '#5E4F3D',
  /** Chalk white, for text on the deep grounds. */
  chalk: '#F0E6D2',
  chalkSoft: '#B9A98D',
} as const;

export type ToneName = 'vellum' | 'foxed' | 'parchment' | 'oxblood' | 'nocturne';

export type Tone = {
  base: string;
  edge: string;
  text: string;
  textSoft: string;
  /** True for the deep grounds - some effects invert. */
  dark: boolean;
};

export const tones: Record<ToneName, Tone> = {
  vellum: {base: palette.vellum, edge: palette.vellumEdge, text: palette.ink, textSoft: palette.inkSoft, dark: false},
  foxed: {base: palette.foxed, edge: palette.foxedEdge, text: palette.ink, textSoft: palette.inkSoft, dark: false},
  parchment: {base: palette.parchment, edge: palette.parchmentEdge, text: palette.ink, textSoft: '#584732', dark: false},
  oxblood: {base: palette.oxblood, edge: palette.oxbloodEdge, text: palette.chalk, textSoft: '#C7A98F', dark: true},
  nocturne: {base: palette.nocturne, edge: palette.nocturneEdge, text: palette.chalk, textSoft: '#9FAAB8', dark: true},
};

export const font = {
  /** Cinzel - Roman inscriptional capitals, after the gilt "RELIC" lettering. */
  display: '"Cinzel", "Trajan Pro", Georgia, serif',
  /** EB Garamond - the old-style text of the engraving plates. */
  text: '"EB Garamond", Georgia, "Times New Roman", serif',
  /** Pinyon Script - the engraved hand of the authentication certificate. */
  script: '"Pinyon Script", "Snell Roundhand", cursive',
  /** Textura blackletter - the RoughCut wordmark. Used only for the name. */
  gothic: '"UnifrakturMaguntia", "Blackletter", serif',
} as const;

/**
 * Type scale, in 4K px. Cinzel is set in caps and wants tracking; Garamond
 * and Pinyon both have small x-heights, so the text sizes run larger than a
 * sans would.
 */
export const type = {
  script: 68,
  gothic: 66,
  headline: 104,
  headlineSm: 86,
  /** Roman capitals need air between them. */
  headlineTrack: 0.02,
  note: 52,
  big: 300,
  bigSm: 220,
  unit: 78,
} as const;
