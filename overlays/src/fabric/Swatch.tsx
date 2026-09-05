import React from 'react';
import {drawOn} from '../lib/motion';

/**
 * A fabric swatch masked to a selvedge edge — spec §5's suggested treatment,
 * using the "selvedge edge — the woven band, with its regular tick marks"
 * container permitted by §3.4.
 *
 * The cloth is drawn as WEAVE NOTATION, not as simulated fabric: twill runs,
 * plain-weave crosshatch, stripe repeats. §3.6 limits imagery to Jack's own
 * material and public-domain scans, and §16 forbids synthesising pastiche, so
 * a photographic-looking swatch would be out of bounds on both counts. Drawn
 * notation is also the correct register — this is a field record, not a
 * fabric shop.
 */

export type WeaveKind = 'twill' | 'steepTwill' | 'plain' | 'stripe';

export type FabricSwatch = {
  name: string;
  weave: WeaveKind;
  /** Ground colour, always a token from tokens.css. */
  ground: string;
  /** Opacity of the ground, for tonal separation without new colours. */
  groundOpacity?: number;
  /** Weave coarseness. A heavier cloth has a visibly bigger repeat. */
  weaveScale?: number;
};

/** §5 beat 2, in the order the spec lists them. */
export const FABRICS: FabricSwatch[] = [
  {name: 'Denim', weave: 'twill', ground: 'var(--rc-indigo)'},
  {name: 'Hickory stripe', weave: 'stripe', ground: 'var(--rc-paper)'},
  {name: 'Canvas', weave: 'plain', ground: 'var(--rc-paper-deep)'},
  {name: 'Cotton drill', weave: 'steepTwill', ground: 'var(--rc-mahogany)', groundOpacity: 0.8},
  {name: 'Twill', weave: 'twill', ground: 'var(--rc-terracotta)', groundOpacity: 0.85},
];

const SELVEDGE_W = 34;

const WeavePattern: React.FC<{id: string; kind: WeaveKind; light: boolean; scale: number}> = ({
  id,
  kind,
  light,
  scale,
}) => {
  const ink = light ? 'var(--rc-ink)' : 'var(--rc-paper)';
  const op = light ? 0.3 : 0.28;
  if (kind === 'stripe') {
    return (
      <pattern id={id} width={44} height={44} patternUnits="userSpaceOnUse">
        <rect x={0} y={0} width={11} height={44} fill="var(--rc-indigo)" opacity={0.85} />
        <rect x={20} y={0} width={4} height={44} fill="var(--rc-indigo)" opacity={0.45} />
      </pattern>
    );
  }
  if (kind === 'plain') {
    // Coarseness carries the weight difference: a heavier canvas has a
    // visibly bigger repeat than a lighter cotton of the same colour.
    const r = 18 * scale;
    return (
      <pattern id={id} width={r} height={r} patternUnits="userSpaceOnUse">
        <line x1={0} y1={r / 2} x2={r} y2={r / 2} stroke={ink} strokeWidth={3 * scale} opacity={op} />
        <line x1={r / 2} y1={0} x2={r / 2} y2={r} stroke={ink} strokeWidth={3 * scale} opacity={op * 0.8} />
      </pattern>
    );
  }
  // Twill: a diagonal run. Drill is steeper than a standard twill.
  const step = (kind === 'steepTwill' ? 16 : 20) * scale;
  const rise = (kind === 'steepTwill' ? 32 : 20) * scale;
  return (
    <pattern id={id} width={step} height={rise} patternUnits="userSpaceOnUse">
      <line x1={-step} y1={rise} x2={step} y2={-rise} stroke={ink} strokeWidth={4} opacity={op} />
      <line x1={0} y1={rise} x2={step * 2} y2={-rise} stroke={ink} strokeWidth={4} opacity={op} />
    </pattern>
  );
};

export const Swatch: React.FC<{
  fabric: FabricSwatch;
  w: number;
  h: number;
  frame: number;
  /** Frame the swatch begins building. */
  start: number;
  idx: number;
}> = ({fabric, w, h, frame, start, idx}) => {
  const pid = `weave-${idx}-${fabric.weave}-${Math.round((fabric.weaveScale ?? 1) * 10)}`;
  const light = fabric.ground === 'var(--rc-paper)' || fabric.ground === 'var(--rc-paper-deep)';

  // Builds from parts (§3.5): the cloth is revealed across, then the selvedge
  // band's tick marks step in. Nothing slides in from off-screen.
  const cloth = drawOn(frame, start, 7);
  const ticks = drawOn(frame, start + 3, 8);

  const nTicks = Math.floor(h / 26);

  return (
    <g>
      <defs>
        <WeavePattern id={pid} kind={fabric.weave} light={light} scale={fabric.weaveScale ?? 1} />
        <clipPath id={`${pid}-clip`}>
          <rect x={0} y={0} width={w * cloth} height={h} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${pid}-clip)`}>
        <rect x={0} y={0} width={w} height={h} fill={fabric.ground} opacity={fabric.groundOpacity ?? 1} />
        <rect x={0} y={0} width={w} height={h} fill={`url(#${pid})`} />
        {/* The selvedge: the finished woven band down the leading edge. */}
        <rect x={0} y={0} width={SELVEDGE_W} height={h} fill={fabric.ground} opacity={(fabric.groundOpacity ?? 1) * 0.55} />
        <line x1={SELVEDGE_W} y1={0} x2={SELVEDGE_W} y2={h} stroke="var(--rc-ink)" strokeWidth={3} opacity={0.55} />
      </g>

      {/* Regular tick marks along the woven band (§3.4). */}
      <g>
        {Array.from({length: nTicks}).map((_, i) => {
          const on = ticks > (i + 1) / nTicks - 0.5;
          if (!on) return null;
          return (
            <line
              key={i}
              x1={6}
              y1={13 + i * 26}
              x2={SELVEDGE_W - 8}
              y2={13 + i * 26}
              stroke={light ? 'var(--rc-ink)' : 'var(--rc-paper)'}
              strokeWidth={3}
              opacity={0.5}
            />
          );
        })}
      </g>
    </g>
  );
};
