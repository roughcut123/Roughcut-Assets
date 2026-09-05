import type {FieldSheetProps} from './FieldSheet';

/**
 * Popup copy is quoted verbatim from spec §8. Per §16 the wording is drawn
 * from what Jack actually says on camera and must not be reworded — the only
 * editing here is splitting each entry's body at its own sentence breaks so
 * it sets as separate ruled lines on the field sheet.
 *
 * §8.1 rounding convention, locked: ¼in is 6.35mm, Jack says 6mm on camera,
 * so every asset states 6 mm. Never 6.35, never "approx 6".
 *
 * `id` is the Remotion composition id (a-z A-Z 0-9 and hyphen only); `file`
 * is the delivered filename in the §2 convention. See NOTES.md §2.1.
 *
 * Torn-mask variants are assigned in sequence and cycle through the eight in
 * masks.ts, so §3.4's "the same silhouette never appears twice in one video"
 * holds across a whole build.
 */
export type PopupSpec = FieldSheetProps & {id: string; file: string};

let v = 0;
const nextVariant = () => v++ % 8;

const popup = (
  id: string,
  label: string,
  lines: string[],
  extra: Partial<FieldSheetProps> = {},
): PopupSpec => ({
  id: `RC-POPUP-${id}`,
  file: `RC_POPUP_${id}`,
  label,
  lines,
  variant: nextVariant(),
  angle: 1.2 + ((v * 0.37) % 0.8),
  ...extra,
});

/** §8.1 — the single most repeated statement on the channel. */
const CRITICAL: PopupSpec[] = [
  popup(
    'SEAMALLOWANCE',
    'Seam allowance',
    [
      '¼ in — 6 mm — unless stated otherwise',
      'Already included in the pattern.',
      'Do not add more when cutting.',
      'Use the guide beside your presser foot.',
    ],
    {annotateLine: 0},
  ),
];

/** §8.2 — pattern literacy. Fire during the booklet walkthrough. */
const LITERACY: PopupSpec[] = [
  popup('TESTSQUARE', '2 × 2 in test square', [
    'Print page one first. Measure it.',
    "If it isn't 2 inches, nothing else",
    'will be true to size.',
  ]),
  popup('TILING', 'Tiling', [
    'Overlap each page to the black bleed line.',
    'Never butt the pages together.',
  ]),
  popup('BULLSEYE', 'Alignment darts', [
    'The corner bullseyes should sit',
    'directly on top of each other.',
  ]),
  popup('FORMATS', 'Formats', [
    'A4 — most of the world.',
    'US Letter — US, Canada, Mexico.',
    'A0 — large format, no tiling.',
  ]),
  popup('CUTTWOMIRRORED', 'Cut two mirrored', [
    'Good sides of the fabric facing each other.',
    'Gives you a left and a right.',
  ]),
  popup('GRAINLINE', 'Grain line', [
    'Run the arrow parallel to the selvedge.',
    'Keeps stretch consistent across every panel.',
  ]),
  popup('SIZING', 'Final garment measurements', [
    'Not body measurements.',
    'Measure an existing garment that fits.',
  ]),
  popup('HEMALLOWANCE', '½ in hem allowance', [
    'Add this to the fabric only.',
    'Never to the paper pattern.',
  ]),
];

/** §8.2 skill level — parameterised 1–5, filled bar in gold. */
const SKILL: PopupSpec[] = [1, 2, 3, 4, 5].map((n) => ({
  id: `RC-POPUP-SKILLLEVEL-${n}`,
  file: `RC_POPUP_SKILLLEVEL_${n}`,
  label: 'Skill level',
  lines: [`${n} of 5`],
  variant: (7 + n) % 8,
  angle: 1.3 + n * 0.12,
  bar: {value: n, max: 5},
}));

/** §8.3 — technique. Fire mid-build. */
const TECHNIQUE: PopupSpec[] = [
  popup('FACINGS', 'Why facings', [
    'Sew face to face, turn out, press.',
    'You get the true pattern shape',
    'without ironing curves.',
  ]),
  popup('FLATFELL', 'Flat felled seam', [
    'Bad sides together. Stitch.',
    'Trim one seam edge. Fold twice.',
    'Two rows of stitching.',
  ]),
  popup('TOPSTITCH', 'Top stitch', [
    'Fold the seam to one side and stitch',
    'through all three layers.',
    'Keep the fold facing the same',
    'direction throughout.',
  ]),
  popup('BARTACK', 'Bar tack', [
    'A short back-and-forth stitch.',
    'Reinforces pocket corners and stress points.',
  ]),
  popup('TRIMCORNERS', 'Trim the corners', [
    'Before turning out.',
    'Less bulk, sharper points.',
  ]),
  popup('PINCHROLL', 'Pinch and roll', [
    'Damp fingertips, pinch the seam, roll it out.',
    'The no-iron method.',
  ]),
  popup('HAMMER', 'Hammer the bulk', [
    'Flatten heavy seams before they reach the needle.',
    'Saves broken needles.',
  ]),
  popup('PRESSERFOOT', 'Presser foot as guide', [
    'Run the foot edge along your last stitch line',
    'for consistent spacing.',
  ]),
  popup('ZIPPULLER', 'Moving the puller', [
    'Needle down. Foot up.',
    'Slide the puller past. Carry on.',
  ]),
  popup('SELVEDGE', 'Selvedge ID', [
    'The finished loom edge.',
    "Won't fray — cut outseams and fly pieces on it.",
  ]),
  popup('WAXPEN', 'Wax pen, not chalk', [
    'Irons straight off.',
    'Holds a sharper line.',
  ]),
  popup('BURRRIVETS', 'Burr rivets', [
    'Cut, set, burr the end.',
    'These will outlast the fabric.',
  ]),
  popup('OVERLOCKER', 'Overlocker optional', [
    'Every build in this series is completed',
    'on a straight stitch machine.',
  ]),
  popup('DOMESTIC', 'Domestic machine is fine', [
    'Every pattern on this channel',
    'has been built on one.',
  ]),
];

/**
 * §8.4 — variable data. Same component, different props. The values shipped
 * here are the spec's own examples; §14 flags these as parameterised, so
 * expect them to arrive in multiple versions per build.
 */
const VARIABLE: PopupSpec[] = [
  popup('ZIPLENGTH', 'Zip length', ['7½ in closed end']),
  popup('THREAD', 'Thread', ['Tex 60', 'Heavier thread so top stitching shows.']),
  popup('FABRICWEIGHT', 'Fabric weight', ['14 oz Japanese selvedge denim']),
  popup('PIECECODE', 'Piece code', ['KSS-019 · WAISTBAND']),
];

export const popups: PopupSpec[] = [
  ...CRITICAL,
  ...LITERACY,
  ...SKILL,
  ...TECHNIQUE,
  ...VARIABLE,
];
