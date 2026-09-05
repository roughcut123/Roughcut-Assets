import type {MarkKind} from './Correction';

/** §9 copy, verbatim. One red mark each; the three kinds are distributed. */
export type CorrectionAsset = {
  id: string;
  file: string;
  label: string;
  lines: string[];
  variant: number;
  mark: MarkKind;
};

export const corrections: CorrectionAsset[] = [
  {
    id: 'RC-CORR-DONTCOPY',
    file: 'RC_CORR_DONTCOPY',
    label: 'Do as I say, not as I do',
    lines: ["This bit didn't go to plan.", 'The right method follows.'],
    variant: 2,
    mark: 'circle',
  },
  {
    id: 'RC-CORR-SEWNSHUT',
    file: 'RC_CORR_SEWNSHUT',
    label: 'Pocket sewn shut',
    lines: ['Add decorative stitching before', 'attaching the pocket, not after.'],
    variant: 3,
    mark: 'strike',
  },
  {
    id: 'RC-CORR-ORDER',
    file: 'RC_CORR_ORDER',
    label: 'Wrong order',
    lines: ['Do this step earlier than I did.'],
    variant: 4,
    mark: 'arrow',
  },
  {
    id: 'RC-CORR-MEASURE',
    file: 'RC_CORR_MEASURE',
    label: 'Measure first',
    lines: ['Cut the ribbing to the pattern piece,', 'not by eye.'],
    variant: 5,
    mark: 'circle',
  },
  {
    id: 'RC-CORR-WRONGSIDE',
    file: 'RC_CORR_WRONGSIDE',
    label: 'Check the side',
    lines: ['Left and right are not', 'interchangeable here.'],
    variant: 6,
    mark: 'strike',
  },
];

export const asides = [
  {id: 'RC-ASIDE-OVERLOCKER', file: 'RC_ASIDE_OVERLOCKER', text: 'The overlocker is still broken.'},
  {id: 'RC-ASIDE-IRON', file: 'RC_ASIDE_IRON', text: 'The iron is still leaking.'},
];
