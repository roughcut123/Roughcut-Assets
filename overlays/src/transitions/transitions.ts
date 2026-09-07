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
  // §6 assigns M4 here. Replaced at the client's direction with M6, the bolt
  // unroll — a fabric chapter that opens with a stitch and not with cloth was
  // the wrong picture. M4 still runs FLY and WAISTBAND, so the mechanic is not
  // lost. Logged in NOTES.md.
  {name: 'FABRIC', mechanic: 'M6', chapter: 'fabric segment'},
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

  // The heritage denim jacket course — Keystone jacket / denim jacket tutorial.
  {name: 'RIVETS', mechanic: 'J1', chapter: 'rivets and burrs'},
  {name: 'BUTTONS', mechanic: 'J2', chapter: '20mm tack buttons'},
  // §6 already has RC_TRANS_HARDWARE (M5, into rivets / buttons); this is the
  // buckle-and-adjuster piece, not a replacement for it.
  {name: 'BUCKLES', mechanic: 'J3', chapter: 'buckles and cinch backs'},
  // §6 already has RC_TRANS_POCKETS (M1, into pockets).
  {name: 'PATCHPOCKETS', mechanic: 'J4', chapter: 'patch pockets'},
  {name: 'PANELS', mechanic: 'J5', chapter: 'cutting the panels'},
  {name: 'CHAINSTITCH', mechanic: 'J6', chapter: 'felled seams'},
  {name: 'INDIGO', mechanic: 'J7', chapter: 'indigo and dyeing'},
  {name: 'SELVEDGE', mechanic: 'J8', chapter: 'selvedge widths'},
  {name: 'THREAD', mechanic: 'J9', chapter: 'topstitch thread'},
  {name: 'PATCH', mechanic: 'J10', chapter: 'the leather patch'},
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
