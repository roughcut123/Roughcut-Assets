import raw from './chapters.json';

/**
 * THE KEYSTONE CHAPTER CARDS — the design system.
 *
 * A SEPARATE deliverable from the §6 transition library: its own palette, its
 * own grid, its own type scale, its own frame rate. All of it comes from
 * `README-BUILD-BRIEF.md` and `chapters.json`, which ship alongside this file.
 *
 * Every number below was MEASURED off the reference PNGs, not read off the
 * brief and hoped for. That matters, because the brief and the references
 * disagree in three places (see TRACKING and Ground). Where they agree, the
 * measurement confirms the brief to the pixel: the 92px selvedge, the 210 and
 * 1220 columns, the footer rule at 948, and all eleven palette colours came
 * back exact.
 *
 * THE FONT. The references were set in real Helvetica. Nimbus Sans — URW's
 * Helvetica clone — reproduces them exactly: '01' at 158px measures 144x118 in
 * both, 'THE FRONT' at 112px measures 637x86 in both, and a 29-character label
 * lands within 1px. Liberation Sans, the Arial clone, is 15% wider on digits
 * and 8% shorter, so it is a fallback and not the target. This is the failure
 * the brief warns about — "make sure Helvetica is available in the render
 * environment, or the metrics will shift" — and Nimbus is how it is avoided
 * without licensing Helvetica.
 */

export type Group = {name: string; colour: string};
export type Card = {
  id: string;
  type: 'contents' | 'chapter';
  title: string;
  sub: string;
  file: string;
  part?: number;
  partName?: string;
  line?: string;
  groups?: string[];
  pieces?: string;
  extra?: string;
  /** Stitches per second for the sewn number. See NOTES 4m for the arithmetic. */
  stitchRate?: number;
  /** Which rhythm the seam runs at — §2.6 of the stitch brief. */
  stitchFeel?: 'steady' | 'hesitate' | 'burst' | 'staccato';
  /** The seam this chapter teaches, in words. Documentation, not used. */
  stitchNote?: string;
};

export const DATA = raw as unknown as {
  meta: {width: number; height: number; fps: number; selvedgeWidth: number};
  groups: Record<string, Group>;
  parts: {roman: string; name: string}[];
  cards: Card[];
};

export const CARDS = DATA.cards;
export const GROUPS = DATA.groups;
export const PARTS = DATA.parts;

export const W = DATA.meta.width;   // 1920
export const H = DATA.meta.height;  // 1080
export const FPS = DATA.meta.fps;   // 30 — the brief's, NOT the library's 25

/**
 * TRACKING, and why it is zero.
 *
 * The brief's type table asks for 2px on the labels and -2px on the titles.
 * The references have neither: fitted against Nimbus with no letter-spacing,
 * a 19-character kicker, a 42-character sub and a 29-character part label all
 * land within 1px of the reference, and 2px of tracking would put the label
 * 56px wide of it. §5 says the PNGs "show exactly how each card should look
 * when static. Match them", so they win over the prose.
 *
 * Set TRACKING to BRIEF to get the table's values instead. It is one constant
 * because it is a live question for the client, not a detail to bury.
 */
export const BRIEF_TRACKING = {label: 2, title: -2, foot: 1};
export const NO_TRACKING = {label: 0, title: 0, foot: 0};
export const TRACKING = NO_TRACKING;

/**
 * THE GROUND, likewise.
 *
 * The references are one flat colour — a single unique RGB across an 850x230
 * empty region — and that colour, #141C30, is the exact channel-wise mean of
 * the brief's `indigo` and `indigoDeep`. The brief calls `indigoDeep` a
 * "vignette" and lists `#bg  ground gradient` and `#bg-twill  diagonal twill
 * texture` among the animatable ids, so the intent is clearly a graded ground.
 * None of it is in the reference.
 *
 * Default is the flat reference. `GROUND.gradient` / `GROUND.twill` turn the
 * brief's version on, and both are drawn as their own layers so the client can
 * see the difference and choose.
 */
export const GROUND = {flat: '#141C30', gradient: false, twill: false};

/** §3 of the brief. All eleven verified against the references. */
export const C = {
  indigo: '#172036',
  indigoDeep: '#111828',
  cream: '#F6F1E6',
  gold: '#D6A33C',
  red: '#C4312C',
  mute: '#96A0B6',
  sub: '#C6CFE0',
  line: '#A8B2C6',
  extra: '#9EA8BE',
  foot: '#8C98B0',
  footRule: '#34425F',
  ghost: '#1E2942',
  /** Measured; not in the brief's table. Chip digits are near-black. */
  chipInk: '#12141A',
  /** Measured; not in the brief's table. Dimmer than `mute`. */
  rowNum: '#7886A2',
  selvedge: '#E8E3D6',
  selvedgeWeft: '#DCD6C7',
  selvedgeFold: '#CEC7B6',
  selvedgeEdge: '#C6BEAC',
};

/**
 * Nimbus is named FIRST, ahead of Helvetica itself, and that ordering is
 * load-bearing. fontconfig on Linux aliases "Helvetica" to Liberation Sans —
 * the Arial clone — so a stack that asks for Helvetica first never reaches
 * Nimbus and silently renders 15% wide on digits. Asking for Nimbus first
 * gets the real Helvetica shapes here, and on a machine that actually has
 * Helvetica (where Nimbus is not installed) the stack falls straight through
 * to it.
 */
export const FONT =
  '"Nimbus Sans", "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif';

export const SELVEDGE_W = DATA.meta.selvedgeWidth; // 92
export const LEFT_X = 210;
export const RIGHT_X = 1220;
export const FOOT_RULE_Y = 948;
/** Measured: 210..1802 — equal 117px margins inside the selvedge and the frame. */
export const FOOT_RULE_X2 = 1802;
export const RULE_W = 93;

/**
 * BASELINES. Derived by measuring each element's ink box in the reference and
 * subtracting Nimbus's ink-top offset for that exact string and size, so they
 * are correct rather than approximately correct.
 */
export const Y = {
  part: 139,
  rule: 176,
  number: 322,
  title: 482,
  sub: 564,
  line: 647,
  foot: 994,
};

/** Measured on card 05: a second title line steps exactly one font size. */
export const TITLE_LEAD = 112;

/** The right column. A FLOW: an absent section closes up. */
export const R = {
  labelBase: 229,
  chipTop: 256,
  chipSize: 59,
  chipStep: 74,
  chipRadius: 11,
  chipDigitSize: 27,
  /** Measured: digit baseline sits 35px below the chip's top edge. */
  chipDigitBase: 35,
  nameX: 1297,
  nameBase: 292,
  piecesLabelBase: 373,
  piecesBase: 419,
  extraBase: 471,
  /** Distance a whole chip row adds to everything below it. */
  step: 74,
};

export const TYPE = {
  part: {size: 26, weight: 700, track: TRACKING.label, colour: C.mute},
  number: {size: 158, weight: 700, track: 0, colour: C.gold},
  title: {size: 112, weight: 700, track: TRACKING.title, colour: C.cream},
  sub: {size: 40, weight: 400, track: 0, colour: C.sub},
  line: {size: 31, weight: 400, track: 0, colour: C.line},
  label: {size: 22, weight: 700, track: TRACKING.label, colour: C.mute},
  groupName: {size: 30, weight: 700, track: 0, colour: C.cream},
  pieces: {size: 28, weight: 700, track: 0, colour: C.gold},
  extra: {size: 24, weight: 400, track: 0, colour: C.extra},
  foot: {size: 24, weight: 700, track: TRACKING.foot, colour: C.foot},
  ghost: {size: 300, weight: 700, track: 0, colour: C.ghost},
};

/**
 * Measured on cards 01 and 12, which agree: the ghost is LEFT-aligned at
 * x=1427 with its baseline at 839, not right-aligned as it first appears.
 */
export const GHOST = {x: 1427, baseline: 839};

/**
 * The contents card. Its type scale is NOT the chapter cards' — the kicker is
 * 28 not 26, the title 122 not 112, the sub 34 not 40. Each was fitted against
 * the reference to within 2px rather than assumed to match.
 */
export const CONTENTS = {
  ruleY: 118,
  kickerSize: 28,
  kickerBase: 173,
  titleSize: 122,
  titleBase: 295,
  subSize: 34,
  subBase: 377,
  partSize: 26,
  partBase: 459,
  rowSize: 32,
  rowFirstBase: 522,
  rowStep: 54,
  /** Three columns; the pitch is not uniform, so they are listed as measured. */
  cols: [210, 770, 1300],
  numToTitle: 64,
  /** §5: the rows stitch on in sequence, roughly 60ms apart. */
  rowsFrom: 1.05,
  rowStagger: 0.06,
};
