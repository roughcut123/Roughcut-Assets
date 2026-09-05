import React from 'react';
import './tokens.css';
import {Composition} from 'remotion';
import {loadOverlayFonts} from './lib/fonts';
import {FPS, HEIGHT, IN_FRAMES, OUT_FRAMES, WIDTH} from './lib/theme';
import {specs} from './overlays/specs';
import {
  defaultPropsFor,
  overlaySchema,
  registerOverlayComponent,
  type OverlayProps,
} from './overlays/Overlay';
import {Showreel, SHOWREEL_DURATION} from './preview/Showreel';
import {FieldSheet} from './popups/FieldSheet';
import {popups} from './popups/popups';
import {CANVAS_H, CANVAS_W, LOOP_HOLD_FRAMES, SPEC_FPS, TIMING} from './lib/spec';
import {
  PaperSweep,
  PaperStrips,
  MosaicBuild,
  CentreReveal,
  transitionDefaults,
  transitionSchema,
  type TransitionProps,
} from './transitions/Transitions';

loadOverlayFonts();

export const RemotionRoot: React.FC = () => (
  <>
    {specs.map((spec) => (
      <Composition
        key={spec.id}
        id={spec.id}
        component={registerOverlayComponent(spec)}
        schema={overlaySchema}
        defaultProps={defaultPropsFor(spec)}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={FPS * 4}
        calculateMetadata={({props}: {props: OverlayProps}) => ({
          durationInFrames:
            Math.round(props.holdSeconds * FPS) + IN_FRAMES + OUT_FRAMES,
        })}
      />
    ))}

    {(
      [
        ['PaperSweep', PaperSweep],
        ['PaperStrips', PaperStrips],
        ['MosaicBuild', MosaicBuild],
        ['CentreReveal', CentreReveal],
      ] as const
    ).map(([id, component]) => (
      <Composition
        key={id}
        id={id}
        component={component}
        schema={transitionSchema}
        defaultProps={transitionDefaults[id]}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={FPS}
        calculateMetadata={({props}: {props: TransitionProps}) => ({
          durationInFrames: Math.round(props.seconds * FPS),
        })}
      />
    ))}

    {/* FAMILY C - top-left popups, spec §8. 25fps per §1. Each ships a
        _LOOP variant with the hold extended to 10s per §13. */}
    {popups.flatMap((p) => [
      <Composition
        key={p.id}
        id={p.id}
        component={FieldSheet}
        defaultProps={{
          label: p.label,
          lines: p.lines,
          variant: p.variant,
          angle: p.angle,
          annotateLine: p.annotateLine,
        }}
        width={CANVAS_W}
        height={CANVAS_H}
        fps={SPEC_FPS}
        durationInFrames={TIMING.popup.total}
      />,
      <Composition
        key={`${p.id}-LOOP`}
        id={`${p.id}-LOOP`}
        component={FieldSheet}
        defaultProps={{
          label: p.label,
          lines: p.lines,
          variant: p.variant,
          angle: p.angle,
          annotateLine: p.annotateLine,
        }}
        width={CANVAS_W}
        height={CANVAS_H}
        fps={SPEC_FPS}
        durationInFrames={TIMING.popup.in + LOOP_HOLD_FRAMES + TIMING.popup.out}
      />,
    ])}

    <Composition
      id="Showreel"
      component={Showreel}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={SHOWREEL_DURATION}
    />
  </>
);
