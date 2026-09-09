import {CARDS, Card} from './design';

/**
 * §2 naming for this family: RC_CHAPTER_<nn>_<SLUG>.
 *
 * The slug comes from the brief's own filenames (`01-the-front`), upper-cased,
 * so a file in Vince's bin can be matched back to the card it came from
 * without a lookup table.
 */
export type ChapterAsset = {id: string; file: string; card: Card};

const slug = (file: string) =>
  file.replace(/^\d+-/, '').replace(/-/g, '_').toUpperCase();

export const chapterAssets: ChapterAsset[] = CARDS.map((card) => ({
  id: `RC-CHAPTER-${card.id}-${slug(card.file).replace(/_/g, '-')}`,
  file: `RC_CHAPTER_${card.id}_${slug(card.file)}`,
  card,
}));
