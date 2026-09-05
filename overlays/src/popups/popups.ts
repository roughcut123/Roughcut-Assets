import type {FieldSheetProps} from './FieldSheet';

/**
 * Popup copy is quoted verbatim from spec §8. Per §16 the wording is drawn
 * from what Jack actually says on camera and must not be reworded.
 *
 * §8.1 rounding convention, locked: 1/4in is 6.35mm, Jack says 6mm on camera,
 * so every asset states 6 mm. Never 6.35, never "approx 6".
 */
/**
 * `id` is the Remotion composition id, which may only contain a-z A-Z 0-9 and
 * hyphen. `file` is the delivered filename in the spec §2 convention. The
 * render script maps one to the other.
 */
export type PopupSpec = FieldSheetProps & {id: string; file: string};

export const popups: PopupSpec[] = [
  {
    id: 'RC-POPUP-SEAMALLOWANCE',
    file: 'RC_POPUP_SEAMALLOWANCE',
    label: 'Seam allowance',
    lines: [
      '¼ in — 6 mm — unless stated otherwise',
      'Already included in the pattern.',
      'Do not add more when cutting.',
      'Use the guide beside your presser foot.',
    ],
    variant: 0,
    angle: 1.5,
    // The locked measurement is the one thing marked in red on this sheet.
    annotateLine: 0,
  },
];
