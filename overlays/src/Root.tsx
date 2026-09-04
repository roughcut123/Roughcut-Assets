import React from 'react';
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
import {
  PaperSweep,
  PaperStrips,
  MosaicBuild,
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
