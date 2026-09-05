import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CANVAS_H} from '../lib/spec';
import {MONO, Rule, Sheet} from '../lib/sheet';
import {drawOn, exitRamp, jitter1, paperAngle} from '../lib/motion';
import {Swatch, type FabricSwatch} from './Swatch';
import {BEAT_W, type BeatTiming} from './FabricBeat';

/**
 * §5 beat 2 and beat 6: "each named fabric gets a swatch card masked to a
 * selvedge edge, entering as the name is spoken."
 *
 * One row per fabric — specimen, name, and an optional character note — laid
 * out as a catalogued sample sheet. Rows build in sequence with a seeded ±1
 * frame of irregularity (§3.5) so they do not land in lockstep.
 */

const PAD_X = 60;
const PAD_TOP = 54;
const PAD_BOTTOM = 46;
const LABEL_PX = 56;
const NAME_PX = 58;
const NOTE_PX = 46;
const SW_W = 360;
const SW_H = 132;
const ROW_H = 168;
const LEFT = 160;

export type SwatchRow = {fabric: FabricSwatch; note?: string};

export const SwatchBeat: React.FC<{
  label: string;
  rows: SwatchRow[];
  variant: number;
  timing: BeatTiming;
}> = ({label, rows, variant, timing}) => {
  const frame = useCurrentFrame();
  const exitStart = timing.in + timing.hold;
  const inner = BEAT_W - PAD_X * 2;

  const headH = PAD_TOP + 6 + 20 + LABEL_PX * 1.06 + 14 + 6 + 26;
  const H = Math.round(headH + rows.length * ROW_H + PAD_BOTTOM);

  const place = drawOn(frame, 0, 4);
  const exit = exitRamp(frame, exitStart, timing.out);
  const angle = paperAngle(`swatch-${label}`);

  const yHead = PAD_TOP;
  const yLabel = yHead + 6 + 20;
  const yLabelRule = yLabel + LABEL_PX * 1.06 + 14;
  const yFirst = yLabelRule + 26;

  // Each fabric enters as its name is spoken, so the stagger is wide.
  const rowStart = (i: number) => 8 + i * 7 + jitter1(`sw-${label}-${i}`);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: Math.round((CANVAS_H - H) / 2),
          width: BEAT_W,
          height: H,
          transform: `translateY(${exit * -22}px) rotate(${angle}deg) scale(${1.01 - place * 0.01})`,
          transformOrigin: 'top left',
          opacity: place * (1 - exit),
        }}
      >
        <svg width={BEAT_W} height={H} viewBox={`0 0 ${BEAT_W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Sheet w={BEAT_W} h={H} variant={variant} />
          <Rule x={PAD_X} y={yHead} w={inner} frame={frame} start={2} dur={8} width={4} />
          <Rule x={PAD_X} y={yLabelRule} w={inner} frame={frame} start={6} dur={7} width={6} />

          {rows.map((r, i) => {
            const y = yFirst + i * ROW_H;
            return (
              <g key={r.fabric.name}>
                <g transform={`translate(${PAD_X} ${y})`}>
                  <Swatch fabric={r.fabric} w={SW_W} h={SW_H} frame={frame} start={rowStart(i)} idx={i} />
                </g>
                <Rule
                  x={PAD_X}
                  y={y + ROW_H - 22}
                  w={inner}
                  frame={frame}
                  start={rowStart(i) + 2}
                  dur={6}
                  stroke="var(--rc-paper-deep)"
                  width={3}
                />
              </g>
            );
          })}
        </svg>

        {rows.map((r, i) => {
          const y = yFirst + i * ROW_H;
          const p = drawOn(frame, rowStart(i) + 3, 5);
          return (
            <div
              key={r.fabric.name}
              style={{
                position: 'absolute',
                left: PAD_X + SW_W + 44,
                top: y + (r.note ? 12 : 34),
                width: inner - SW_W - 44,
                fontFamily: MONO,
                color: 'var(--rc-ink)',
                opacity: p,
              }}
            >
              <div style={{fontSize: NAME_PX, fontWeight: 700, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 3}}>
                {r.fabric.name}
              </div>
              {r.note ? (
                <div style={{fontSize: NOTE_PX, lineHeight: 1.2, marginTop: 8}}>{r.note}</div>
              ) : null}
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: PAD_X,
            top: yLabel,
            width: inner,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: LABEL_PX,
            lineHeight: 1.06,
            letterSpacing: 5,
            textTransform: 'uppercase',
            color: 'var(--rc-ink)',
            opacity: drawOn(frame, 4, 4),
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
