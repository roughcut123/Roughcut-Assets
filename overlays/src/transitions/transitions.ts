import type {MechanicName} from './mechanics';

/**
 * §6 chapter transitions. The mechanic assignment is the spec's table,
 * unchanged — §6 says "Assign as listed — do not use one mechanic for
 * everything."
 *
 * "Each ships in two variants (A/B) with different underlying imagery, so a
 * long build using the same chapter twice doesn't repeat exactly." Variants
 * differ by seed, which drives the torn silhouette, the tessera colours, the
 * drift edge and the stitch spacing.
 */
export type TransitionAsset = {
  id: string;
  file: string;
  mechanic: MechanicName;
  seed: string;
  /** The chapter it leads into, for README_VINCE.md. */
  chapter: string;
};

const T: {name: string; mechanic: MechanicName; chapter: string}[] = [
  {name: 'PATTERN', mechanic: 'M3', chapter: 'pattern walkthrough'},
  {name: 'FABRIC', mechanic: 'M4', chapter: 'fabric segment'},
  {name: 'CUTTING', mechanic: 'M5', chapter: 'cutting'},
  {name: 'POCKETS', mechanic: 'M1', chapter: 'pockets'},
  {name: 'FLY', mechanic: 'M4', chapter: 'fly / zip'},
  {name: 'BACK', mechanic: 'M1', chapter: 'back panel'},
  {name: 'SLEEVES', mechanic: 'M5', chapter: 'sleeves / legs'},
  {name: 'LINING', mechanic: 'M2', chapter: 'lining'},
  {name: 'COLLAR', mechanic: 'M1', chapter: 'collar / hood / ribbing'},
  {name: 'CONSTRUCTION', mechanic: 'M2', chapter: 'joining'},
  {name: 'WAISTBAND', mechanic: 'M4', chapter: 'waistband / hem'},
  {name: 'HARDWARE', mechanic: 'M5', chapter: 'rivets / buttons'},
  {name: 'REVEAL', mechanic: 'M1', chapter: 'final reveal'},
];

export const transitions: TransitionAsset[] = T.flatMap((t) =>
  (['A', 'B'] as const).map((v) => ({
    id: `RC-TRANS-${t.name}-${v}`,
    file: `RC_TRANS_${t.name}_${v}`,
    mechanic: t.mechanic,
    seed: `${t.name}-${v}`,
    chapter: t.chapter,
  })),
);
