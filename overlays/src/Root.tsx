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
import {BEATS, FabricSequence, SEQUENCE_FRAMES} from './fabric/fabric';
import {MECHANICS} from './transitions/mechanics';
import {transitions} from './transitions/transitions';
import {TitleCard} from './titles/TitleCard';
import {titles, DEFAULT_GARMENT, DEFAULT_SKILL} from './titles/titles';
import {Correction, Aside} from './corrections/Correction';
import {corrections, asides} from './corrections/corrections';
import {CrossRef} from './crossrefs/CrossRef';
import {crossrefs} from './crossrefs/crossrefs';
import {DayEnd, DayStamp} from './daybreaks/DayBreak';
import {RevealCert, RevealLower} from './reveal/Reveal';
import {beatFrames} from './fabric/FabricBeat';
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
          bar: p.bar,
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
          bar: p.bar,
        }}
        width={CANVAS_W}
        height={CANVAS_H}
        fps={SPEC_FPS}
        durationInFrames={TIMING.popup.in + LOOP_HOLD_FRAMES + TIMING.popup.out}
      />,
    ])}

    {/* FAMILY A - chapter transitions, spec §6. 62 frames: 25 cover,
        12 hold, 25 uncover. Two variants each so a repeated chapter in a
        long build never plays identically. */}
    {transitions.flatMap((t) => {
      const M = MECHANICS[t.mechanic];
      const C = () => <M seed={t.seed} />;
      return [
        <Composition
          key={t.id}
          id={t.id}
          component={C}
          width={CANVAS_W}
          height={CANVAS_H}
          fps={SPEC_FPS}
          durationInFrames={TIMING.transition.total}
        />,
        <Composition
          key={`${t.id}-LOOP`}
          id={`${t.id}-LOOP`}
          component={C}
          width={CANVAS_W}
          height={CANVAS_H}
          fps={SPEC_FPS}
          durationInFrames={TIMING.transition.in + LOOP_HOLD_FRAMES + TIMING.transition.out}
        />,
      ];
    })}

    {/* THE FABRIC SEGMENT - spec §5. Eight beat assets plus one continuous
        timed version. Each beat also ships a _LOOP variant per §13; the
        sequence does not, since a looped monologue makes no sense. */}
    {BEATS.flatMap((b) => [
      <Composition
        key={b.id}
        id={b.id}
        component={() => <>{b.render()}</>}
        width={CANVAS_W}
        height={CANVAS_H}
        fps={SPEC_FPS}
        durationInFrames={beatFrames(b.timing)}
      />,
      <Composition
        key={`${b.id}-LOOP`}
        id={`${b.id}-LOOP`}
        component={() => <>{b.render()}</>}
        width={CANVAS_W}
        height={CANVAS_H}
        fps={SPEC_FPS}
        durationInFrames={b.timing.in + LOOP_HOLD_FRAMES + b.timing.out}
      />,
    ])}

    {/* FAMILY B - chapter title cards, spec §7. Parameterised on
        chapterName / garmentName / skillLevel so a new pattern needs no new
        render pipeline. */}
    {titles.flatMap((t) => {
      const props = {
        chapterName: t.chapter,
        garmentName: DEFAULT_GARMENT,
        skillLevel: DEFAULT_SKILL,
        variant: t.variant,
      };
      return [
        <Composition key={t.id} id={t.id} component={TitleCard} defaultProps={props}
          width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={TIMING.title.total} />,
        <Composition key={`${t.id}-LOOP`} id={`${t.id}-LOOP`} component={TitleCard} defaultProps={props}
          width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS}
          durationInFrames={TIMING.title.in + LOOP_HOLD_FRAMES + TIMING.title.out} />,
      ];
    })}

    {/* FAMILY D - corrections and asides, spec §9. */}
    {corrections.flatMap((c) => {
      const props = {label: c.label, lines: c.lines, variant: c.variant, mark: c.mark};
      return [
        <Composition key={c.id} id={c.id} component={Correction} defaultProps={props}
          width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={TIMING.correction.total} />,
        <Composition key={`${c.id}-LOOP`} id={`${c.id}-LOOP`} component={Correction} defaultProps={props}
          width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS}
          durationInFrames={TIMING.correction.in + LOOP_HOLD_FRAMES + TIMING.correction.out} />,
      ];
    })}
    {asides.flatMap((a) => [
      <Composition key={a.id} id={a.id} component={Aside} defaultProps={{text: a.text}}
        width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={75} />,
      <Composition key={`${a.id}-LOOP`} id={`${a.id}-LOOP`} component={Aside} defaultProps={{text: a.text}}
        width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={LOOP_HOLD_FRAMES + 13} />,
    ])}

    {/* FAMILY E - cross-references, spec §10. */}
    {crossrefs.flatMap((x) => {
      const props = {title: x.title, timestamp: x.timestamp, thumbnail: undefined, variant: x.variant};
      return [
        <Composition key={x.id} id={x.id} component={CrossRef} defaultProps={props}
          width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={TIMING.crossref.total} />,
        <Composition key={`${x.id}-LOOP`} id={`${x.id}-LOOP`} component={CrossRef} defaultProps={props}
          width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS}
          durationInFrames={TIMING.crossref.in + LOOP_HOLD_FRAMES + TIMING.crossref.out} />,
      ];
    })}

    {/* FAMILY F - day breaks, spec §11. §11 gives 3s for the sign-off and 2s
        for the morning stamp, which overrides §13's single 50f row. */}
    {([['RC-DAY-END', 75], ['RC-DAY-END-LOOP', LOOP_HOLD_FRAMES + 25]] as [string, number][]).map(
      ([id, dur]) => (
        <Composition
          key={id}
          id={id}
          component={DayEnd}
          defaultProps={{day: 1, sub: "It'll be a click of the fingers for you.", variant: 1}}
          width={CANVAS_W}
          height={CANVAS_H}
          fps={SPEC_FPS}
          durationInFrames={dur}
        />
      ),
    )}
    {[2, 3, 4].flatMap((d) => [
      <Composition key={`RC-DAY-0${d}`} id={`RC-DAY-0${d}`} component={DayStamp}
        defaultProps={{day: d, variant: (d + 2) % 8}}
        width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={50} />,
      <Composition key={`RC-DAY-0${d}-LOOP`} id={`RC-DAY-0${d}-LOOP`} component={DayStamp}
        defaultProps={{day: d, variant: (d + 2) % 8}}
        width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={LOOP_HOLD_FRAMES + 15} />,
    ])}

    {/* FAMILY G - the final reveal, spec §12. */}
    {([['RC-REVEAL-CERT', TIMING.reveal.total],
       ['RC-REVEAL-CERT-LOOP', TIMING.reveal.in + LOOP_HOLD_FRAMES + TIMING.reveal.out]] as [string, number][]
    ).map(([id, dur]) => (
      <Composition key={id} id={id} component={RevealCert}
        defaultProps={{
        pattern: DEFAULT_GARMENT,
        skillLevel: DEFAULT_SKILL,
        fabric: '14 oz Japanese selvedge denim',
        built: 'Bournemouth, England',
        taglineTail: 'in the present',
        variant: 0,
      }}
        width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={dur} />
    ))}
    {([['RC-REVEAL-LOWER', TIMING.reveal.total],
       ['RC-REVEAL-LOWER-LOOP', TIMING.reveal.in + LOOP_HOLD_FRAMES + TIMING.reveal.out]] as [string, number][]
    ).map(([id, dur]) => (
      <Composition key={id} id={id} component={RevealLower}
        defaultProps={{pattern: DEFAULT_GARMENT, price: '£38', variant: 5}}
        width={CANVAS_W} height={CANVAS_H} fps={SPEC_FPS} durationInFrames={dur} />
    ))}

    <Composition
      id="RC-FABRIC-SEQUENCE"
      component={FabricSequence}
      width={CANVAS_W}
      height={CANVAS_H}
      fps={SPEC_FPS}
      durationInFrames={SEQUENCE_FRAMES}
    />

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
