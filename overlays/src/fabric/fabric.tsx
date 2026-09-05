import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {FabricBeat, beatFrames, type BeatTiming} from './FabricBeat';
import {SwatchBeat, type SwatchRow} from './SwatchBeat';
import {FABRICS} from './Swatch';

/**
 * THE FABRIC SEGMENT — spec §5, the priority build.
 *
 * Eight assets cut to the eight beats, plus one continuous version, so the
 * same sequence drops unchanged into every video containing the segment.
 *
 * Copy is the spec's own wording. §16 forbids inventing phrasing, so where §5
 * gives a sentence it is used whole and allowed to wrap; where §5 gives a list
 * (the fabrics, the pattern contents, the four-part cadence) it is set as a
 * list. Only the short field LABELS are structural rather than quoted.
 *
 * BEAT 6 IS INCOMPLETE BY DESIGN: §5 names four character categories but not
 * the words Jack uses for them. Per §0 and §16 those are not invented — the
 * `note` fields are empty and flagged in NOTES.md.
 */

const T = (hold: number): BeatTiming => ({in: 12, hold, out: 25});

/** §5 beat 6 works from four categories, not the five named cloths. */
const CHARACTER_ROWS: SwatchRow[] = [
  {fabric: {name: 'Lighter cotton', weave: 'plain', ground: 'var(--rc-paper)', weaveScale: 0.7}, note: ''},
  {fabric: {name: 'Heavier canvas', weave: 'plain', ground: 'var(--rc-paper-deep)', weaveScale: 1.9}, note: ''},
  {fabric: {name: 'Hickory', weave: 'stripe', ground: 'var(--rc-paper)'}, note: ''},
  {fabric: {name: 'Denim', weave: 'twill', ground: 'var(--rc-indigo)'}, note: ''},
];

export type Beat = {
  id: string;
  file: string;
  timing: BeatTiming;
  render: () => React.ReactNode;
};

export const BEATS: Beat[] = [
  {
    id: 'RC-FABRIC-01-INTRO',
    file: 'RC_FABRIC_01_INTRO',
    timing: T(100),
    render: () => (
      <FabricBeat
        label="Fabric"
        variant={1}
        timing={T(100)}
        lines={[
          'Fabric is not an afterthought.',
          "It's one of the most important parts of the garment.",
        ]}
      />
    ),
  },
  {
    id: 'RC-FABRIC-02-CLOTH',
    file: 'RC_FABRIC_02_CLOTH',
    timing: T(200),
    render: () => (
      <SwatchBeat label="The cloth" variant={2} timing={T(200)} rows={FABRICS.map((f) => ({fabric: f}))} />
    ),
  },
  {
    id: 'RC-FABRIC-03-ORIGIN',
    file: 'RC_FABRIC_03_ORIGIN',
    timing: T(110),
    render: () => (
      <FabricBeat
        label="Origin"
        variant={3}
        timing={T(110)}
        lines={[
          'These come from a world where clothing had to be strong, practical, repairable.',
        ]}
      />
    ),
  },
  {
    id: 'RC-FABRIC-04-WEAR',
    file: 'RC_FABRIC_04_WEAR',
    timing: T(130),
    render: () => (
      <FabricBeat
        label="Wear"
        variant={4}
        timing={T(130)}
        annotateLine={1}
        lines={[
          "They don't just look good new.",
          'They fade, soften, crease, mark, become yours.',
        ]}
      />
    ),
  },
  {
    id: 'RC-FABRIC-05-BUYING',
    file: 'RC_FABRIC_05_BUYING',
    timing: T(120),
    render: () => (
      <FabricBeat
        label="Buying"
        variant={5}
        timing={T(120)}
        lines={[
          "You don't need the most expensive cloth.",
          'You need to understand what you’re buying.',
        ]}
      />
    ),
  },
  {
    id: 'RC-FABRIC-06-CHARACTER',
    file: 'RC_FABRIC_06_CHARACTER',
    timing: T(175),
    render: () => (
      <SwatchBeat label="Character" variant={6} timing={T(175)} rows={CHARACTER_ROWS} />
    ),
  },
  {
    id: 'RC-FABRIC-07-INPATTERN',
    file: 'RC_FABRIC_07_INPATTERN',
    timing: T(185),
    render: () => (
      <FabricBeat
        label="In the pattern"
        variant={7}
        timing={T(185)}
        lines={[
          'QR resources',
          'Fabric guidance',
          'Supplier options',
          'Thread recommendations',
          'Weight notes',
          'Regional buying routes',
        ]}
      />
    ),
  },
  {
    id: 'RC-FABRIC-08-CADENCE',
    file: 'RC_FABRIC_08_CADENCE',
    timing: T(155),
    // §5: "the four-part closing cadence gets four ruled field-sheet lines
    // that stack."
    render: () => (
      <FabricBeat
        label="And so"
        variant={0}
        timing={T(155)}
        lines={[
          'The pattern gives you the shape.',
          'The tutorial walks you through the build.',
          'The resources help you decide.',
          'The community is there if you get stuck.',
        ]}
      />
    ),
  },
];

export const SEQUENCE_FRAMES = BEATS.reduce((n, b) => n + beatFrames(b.timing), 0);

/** §5: "Deliver as both individual beat assets and one continuous timed version." */
export const FabricSequence: React.FC = () => (
  <AbsoluteFill>
    <Series>
      {BEATS.map((b) => (
        <Series.Sequence key={b.id} durationInFrames={beatFrames(b.timing)}>
          {b.render()}
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
