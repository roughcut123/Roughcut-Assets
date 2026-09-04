import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {useDetail, useReveal, revealStyle} from '../lib/anim';
import {Card} from '../lib/layouts';
import {IN_FRAMES, MARGIN_X, MARGIN_Y} from '../lib/theme';
import type {OverlaySpec} from './specs';

/**
 * The props exposed in the Remotion Studio sidebar. Copy, colour, tone and
 * timing are editable per overlay without touching code; layout, motif and
 * animation stay fixed so each overlay keeps its identity.
 */
export const overlaySchema = z.object({
  holdSeconds: z.number().min(0.4).max(12).step(0.1),
  eyebrow: z.string(),
  headline: z.array(z.string()),
  note: z.string(),
  tone: z.enum(['vellum', 'foxed', 'parchment', 'oxblood', 'nocturne']),
  accent: zColor(),
});

export type OverlayProps = z.infer<typeof overlaySchema>;

export const Overlay: React.FC<OverlayProps & {spec: OverlaySpec}> = ({
  spec,
  eyebrow,
  headline,
  note,
  tone,
  accent,
}) => {
  const {enter, exit} = useReveal();
  // The card lands first, then the stitching and diagrams draw on.
  const detail = useDetail(Math.round(IN_FRAMES * 0.5), 26);

  const motion = revealStyle({
    style: spec.anim,
    enter,
    exit,
    width: spec.width,
    restAngle: spec.restAngle,
  });

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: MARGIN_X, top: MARGIN_Y, ...motion}}>
        <Card
          layout={spec.layout}
          eyebrow={eyebrow}
          eyebrowStyle={spec.eyebrowStyle}
          headline={headline}
          note={note}
          value={spec.value}
          motif={spec.motif}
          index={spec.index}
          body={spec.body}
          fields={spec.fields}
          signature={spec.signature}
          stitched={spec.stitched}
          tone={tone}
          accent={accent}
          width={spec.width}
          height={spec.height}
          seed={spec.id}
          torn={spec.torn}
          detail={detail}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Built once at module scope so the Studio does not remount on every render. */
export const overlayComponents: Record<string, React.FC<OverlayProps>> = {};

export const registerOverlayComponent = (spec: OverlaySpec) => {
  const C: React.FC<OverlayProps> = (props) => <Overlay {...props} spec={spec} />;
  C.displayName = `Overlay_${spec.id}`;
  overlayComponents[spec.id] = C;
  return C;
};

export const defaultPropsFor = (spec: OverlaySpec): OverlayProps => ({
  holdSeconds: 2.8,
  eyebrow: spec.eyebrow,
  headline: spec.headline,
  note: spec.note,
  tone: spec.tone,
  accent: spec.accent,
});
