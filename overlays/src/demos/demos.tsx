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

const demo = (name: string, label: string, sub: string, Body: React.FC): DemoAsset => ({
  id: `RC-DEMO-${name}`,
  file: `RC_DEMO_${name}`,
  render: () => (
    <DemoFrame label={label} sub={sub}>
      <Body />
    </DemoFrame>
  ),
});

export const demos: DemoAsset[] = [
  demo('SEAMALLOWANCE', 'Seam allowance', '¼ in — 6 mm — unless stated otherwise', SeamAllowanceDemo),
  demo('RIGHTSIDESTOGETHER', 'Right sides together', 'Print faces print.', RightSidesDemo),
  demo('BACKSTITCH', 'Backstitch both ends', 'Three forward, three back.', BackstitchDemo),
  demo('GRAINLINE', 'Grain line', 'Run the arrow parallel to the selvedge.', GrainlineDemo),
  demo('PRESSSEAMSOPEN', 'Press seams open', 'Lift and lower. Never drag the iron.', PressSeamsDemo),
];
