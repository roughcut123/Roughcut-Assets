/**
 * §7 chapter title cards — one per chapter in §6, plus a parameterised
 * version so future patterns need no new render pipeline.
 *
 * Garment name and skill level default to the spec's own example; both are
 * props, so a build with a different garment re-renders from the same
 * composition.
 */
export type TitleAsset = {id: string; file: string; chapter: string; variant: number};

const CHAPTERS = [
  'Pattern',
  'Fabric',
  'Cutting',
  'Pockets',
  'Fly',
  'Back panel',
  'Sleeves',
  'Lining',
  'Collar',
  'Construction',
  'Waistband',
  'Hardware',
  'Reveal',
];

export const DEFAULT_GARMENT = 'Yard Jacket';
export const DEFAULT_SKILL = 3;

export const titles: TitleAsset[] = CHAPTERS.map((c, i) => ({
  id: `RC-TITLE-${c.replace(/[^A-Za-z]/g, '').toUpperCase()}`,
  file: `RC_TITLE_${c.replace(/[^A-Za-z]/g, '').toUpperCase()}`,
  chapter: c,
  variant: i % 8,
}));
