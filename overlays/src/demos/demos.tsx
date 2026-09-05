import React from 'react';
import {DemoFrame} from './DemoFrame';
import {
  BackstitchDemo,
  GrainlineDemo,
  PressSeamsDemo,
  RightSidesDemo,
  SeamAllowanceDemo,
} from './diagrams';
import {
  BullseyeDemo,
  FormatsDemo,
  SizingDemo,
  TestSquareDemo,
  TilingDemo,
} from './pattern';

/**
 * The demonstration popups: five universal techniques that apply to every
 * build, and five pattern-literacy beats from the booklet walkthrough — all
 * rebuilt as standalone animations rather than field-sheet captions.
 *
 * Copy stays within §8's wording where §8 covers it, so the voice does not
 * drift between the two registers.
 */
export type DemoAsset = {id: string; file: string; render: () => React.ReactNode};

const demo = (
  name: string,
  label: string,
  sub: string,
  Body: React.FC,
  /** Top and bottom of the ink within the 940x560 authoring box. */
  extent: [number, number],
): DemoAsset => ({
  id: `RC-DEMO-${name}`,
  file: `RC_DEMO_${name}`,
  render: () => (
    <DemoFrame label={label} sub={sub} seed={name} extent={extent}>
      <Body />
    </DemoFrame>
  ),
});

export const demos: DemoAsset[] = [
  demo('SEAMALLOWANCE', 'Seam allowance', '¼ in — 6 mm — unless stated otherwise', SeamAllowanceDemo, [50, 560]),
  demo('RIGHTSIDESTOGETHER', 'Right sides together', 'Print faces print.', RightSidesDemo, [10, 460]),
  demo('BACKSTITCH', 'Backstitch both ends', 'Three forward, three back.', BackstitchDemo, [180, 300]),
  demo('GRAINLINE', 'Grain line', 'Run the arrow parallel to the selvedge.', GrainlineDemo, [55, 510]),
  demo('PRESSSEAMSOPEN', 'Press seams open', 'Lift and lower. Never drag the iron.', PressSeamsDemo, [180, 400]),

  // §8.2 pattern literacy — the booklet walkthrough (§4 rows 4, 5, 6, 8).
  demo('TILING', 'Tiling', 'Overlap to the bleed line. Never butt pages.', TilingDemo, [20, 500]),
  demo('BULLSEYE', 'Alignment darts', 'Corner bullseyes sit on top of each other.', BullseyeDemo, [40, 556]),
  demo('TESTSQUARE', '2 × 2 in test square', 'Print page one. Measure before anything else.', TestSquareDemo, [14, 520]),
  demo('FORMATS', 'Formats', 'A4 · US Letter · A0. A0 needs no tiling.', FormatsDemo, [100, 545]),
  demo('SIZING', 'Garment measurements', 'Not body. Measure a garment that fits.', SizingDemo, [60, 510]),
];
