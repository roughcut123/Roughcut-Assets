import raw from './courier.json';

/**
 * THE COURIER BAG — chapter card design system.
 *
 * Same job as the Keystone cards and deliberately the same bones: left strip,
 * part label, marker, title, a line of plain English, group chips, piece codes,
 * ghost marker, footer rule. A viewer who has watched the jacket build should
 * recognise the furniture immediately. Everything else is different.
 *
 * WHERE THE PALETTE COMES FROM.
 *
 * roughcutpatterns.com is unreachable from this machine — the egress proxy
 * blocks it — so the colours are not guesses dressed up as research. They are
 * SAMPLED off the Courier Bag brief PDF, which is set in the current
 * roughcutpatterns.com system and carries that domain in its own footer. Pixel
 * frequencies off page 2:
 *
 *     #2A2A30   33%   page ground
 *     #2F2F36   55%   panel ground
 *     #22C55E  0.7%   the accent, on labels and rules
 *     #3B3B42 / #4B4B53  hairline rules
 *     #D6D6DB / #F5F5F7  body text and headings
 *
 * So the house style is already a cool near-black grey with one bright green.
 * That is most of "grey space theme" before anything is invented. What is
 * added for Hoth is COLD rather than blue: the greys are pulled a few degrees
 * toward slate, the accent keeps its green, and the ice in the background is
 * desaturated almost to white so the card never reads as a blue card.
 */

export type Group = {name: string; colour: string};
export type Card = {
  id: string;
  type: 'contents' | 'chapter';
  title: string;
  sub: string;
  file: string;
  letter: string;
  number: string;
  part?: number;
  line?: string;
  groups?: string[];
  pieces?: string;
  extra?: string;
  stitchRate?: number;
  stitchFeel?: 'steady' | 'hesitate' | 'burst' | 'staccato';
  stitchNote?: string;
};

export const DATA = raw as unknown as {
  meta: {width: number; height: number; fps: number; stripWidth: number; pattern: string; garment: string};
  parts: {roman: string; name: string}[];
  groups: Record<string, Group>;
  cards: Card[];
};

export const CARDS = DATA.cards;
export const GROUPS = DATA.groups;
export const PARTS = DATA.parts;

export const W = DATA.meta.width;
export const H = DATA.meta.height;
export const FPS = DATA.meta.fps;
export const STRIP = DATA.meta.stripWidth;

/**
 * THE MARKER IS A PROP, NOT A CONSTANT.
 *
 * The brief for this build asked for chapters numbered 1-7. The tutorial audio
 * says letters: "working through a all the way to h", "this is F in letters",
 * "the final letter is G". Those cannot both be on screen, and the audio is the
 * one that cannot be re-cut.
 *
 * Rather than decide that silently, every card carries both and this switch
 * picks which one is drawn. Flip it and re-render; nothing else changes. Note
 * that there are EIGHT chapters, so a numbered set runs 1-8 — assembly and
 * binding is a real chapter in the video even though it has no pattern pieces.
 */
export type MarkerMode = 'letter' | 'number';

export const C = {
  /** The ground, and the deeper vignette behind it. */
  ground: '#23252B',
  groundDeep: '#17181C',
  /** Panels and chips sit a step up from the ground. */
  panel: '#2F2F36',
  panelSoft: '#2A2A30',
  /** Hairlines, in the two weights the brief uses. */
  rule: '#3B3B42',
  ruleSoft: '#4B4B53',
  /** Type. */
  white: '#F5F5F7',
  text: '#D6D6DB',
  mute: '#8A8F99',
  faint: '#5C626C',
  /** The one accent. Roughcut green, unchanged from the brief. */
  green: '#22C55E',
  greenDeep: '#15803D',
  /** Hoth: ice, kept almost colourless so the card stays grey. */
  ice: '#D8E3EA',
  iceDim: '#9AAAB6',
} as const;

/**
 * Nimbus Sans first, for the same reason as the Keystone cards: fontconfig
 * aliases "Helvetica" to Liberation Sans, whose digits are 15% wider. Asking
 * for Helvetica by name never reaches the right metrics.
 */
export const FONT = '"Nimbus Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';

export const TYPE = {
  marker: 158,
  ghost: 520,
  title: 112,
  titleSm: 92,
  sub: 34,
  line: 30,
  label: 22,
  chip: 24,
  code: 26,
  footer: 22,
} as const;

/** Columns, matching the Keystone grid so the two sets cut together. */
export const GRID = {
  left: 210,
  right: 1220,
  rightEdge: 1710,
  footerRule: 948,
} as const;

export const partOf = (c: Card) => (c.part === undefined ? undefined : PARTS[c.part]);
