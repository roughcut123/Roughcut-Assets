import React from 'react';
import {DemoFrame} from './DemoFrame';
import {
  BackstitchDemo,
  GrainlineDemo,
  PressSeamsDemo,
  RightSidesDemo,
  SeamAllowanceDemo,
} from './diagrams';

/**
 * The five universal popups — the ones that apply to every build, rebuilt as
 * standalone demonstrations rather than field-sheet captions.
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
];
