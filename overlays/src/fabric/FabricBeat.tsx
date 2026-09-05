import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS_H} from '../lib/spec';
import {MONO, MONO_ADVANCE, Rule, Sheet, wrapMono} from '../lib/sheet';
import {drawOn, exitRamp, jitter1, paperAngle} from '../lib/motion';

/**
 * FAMILY — the fabric segment, spec §5. A ruled field-sheet block carrying one
 * beat of the monologue.
 *
 * All copy is set in the typewriter mono: §3.3 assigns "all labels" and all
 * field-sheet register to that role, and the fabric segment is a page from a
 * field record rather than a chapter title. One typeface, well inside §3.3's
 * three-per-asset ceiling.
 *
 * §8's 1100px cap is specific to the top-left popups and does not apply here,
 * so these blocks run wider and the copy does not wrap as tightly.
 */

export const BEAT_W = 1500;
const PAD_X = 60;
const PAD_TOP = 54;
const PAD_BOTTOM = 50;
const LABEL_PX = 56;
const BODY_PX = 54; // §3.3 floor is 48; segment graphics run a little larger
const LINE_H = 82;
const LEFT = 160;

export type BeatTiming = {in: number; hold: number; out: number};

export const beatFrames = (t: BeatTiming) => t.in + t.hold + t.out;

export type FabricBeatProps = {
  label: string;
  lines: string[];
  variant: number;
  timing: BeatTiming;
  /** Index of the one line carrying the red hand mark (§3.2). At most one. */
  annotateLine?: number;
};

export const FabricBeat: React.FC<FabricBeatProps> = ({
  label,
  lines,
  variant,
  timing,
  annotateLine,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const exitStart = durationInFrames - timing.out;
  const inner = BEAT_W - PAD_X * 2;
  const cols = Math.floor(inner / (MONO_ADVANCE * BODY_PX));

  const visual = lines.flatMap((l, i) =>
    wrapMono(l, cols).map((text, j, arr) => ({text, entry: i, last: j === arr.length - 1})),
  );

  const headH = PAD_TOP + 6 + 20 + LABEL_PX * 1.06 + 14 + 6 + 24;
  const H = Math.round(headH + visual.length * LINE_H + PAD_BOTTOM);

  const place = drawOn(frame, 0, 4);
  const exit = exitRamp(frame, exitStart, timing.out);
  const angle = paperAngle(`beat-${label}`);

  const yHead = PAD_TOP;
  const yLabel = yHead + 6 + 20;
  const yLabelRule = yLabel + LABEL_PX * 1.06 + 14;
  const yFirst = yLabelRule + 24;

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

          {visual.map((v, i) => {
            const start = 7 + v.entry * 1.4 + jitter1(`fb-${label}-${v.entry}`);
            return (
              <Rule
                key={i}
                x={PAD_X}
                y={yFirst + i * LINE_H + LINE_H - 18}
                w={inner}
                frame={frame}
                start={start}
                dur={6}
                stroke="var(--rc-paper-deep)"
                width={3}
              />
            );
          })}

          {/* §3.2: exactly one red hand mark per asset, or none. */}
          {annotateLine !== undefined
            ? (() => {
                const idx = visual.reduce((acc, v, i) => (v.entry === annotateLine && v.last ? i : acc), 0);
                const p = drawOn(frame, timing.in + 2, 10);
                const y = yFirst + idx * LINE_H + LINE_H - 8;
                const len = inner * 0.72;
                return (
                  <path
                    d={`M ${PAD_X} ${y} q ${len * 0.25} -8 ${len * 0.5} -2 t ${len * 0.5} 6`}
                    fill="none"
                    stroke="var(--rc-annotation)"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={len + 40}
                    strokeDashoffset={(len + 40) * (1 - p)}
                  />
                );
              })()
            : null}
        </svg>

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

        {visual.map((v, i) => {
          const start = 7 + v.entry * 1.4 + jitter1(`fb-${label}-${v.entry}`);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: PAD_X,
                top: yFirst + i * LINE_H,
                width: inner,
                fontFamily: MONO,
                fontSize: BODY_PX,
                lineHeight: 1.18,
                color: 'var(--rc-ink)',
                whiteSpace: 'pre',
                opacity: drawOn(frame, start, 5),
              }}
            >
              {v.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
