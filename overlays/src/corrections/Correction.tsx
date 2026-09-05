import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS_H, CANVAS_W, POPUP, TIMING} from '../lib/spec';
import {MONO, MONO_ADVANCE, Rule, Sheet, wrapMono} from '../lib/sheet';
import {drawOn, exitRamp, jitter1, paperAngle} from '../lib/motion';

/**
 * FAMILY D — corrections and asides. Spec §9.
 *
 * "Distinct visual register from §8: red hand-annotation on the field sheet.
 * Circled, struck through, arrow in the margin."
 *
 * §3.2 caps that at ONE red mark per asset — "if two red marks appear in one
 * asset, one of them is wrong" — so each correction carries a single mark and
 * the three kinds are distributed across the family rather than stacked on
 * one card. That reading satisfies both sections.
 */

export type MarkKind = 'circle' | 'strike' | 'arrow';

const W = POPUP.maxWidth + 120;
const PAD_X = 56;
const PAD_TOP = 50;
const PAD_BOTTOM = 46;
const LABEL_PX = 58;
const BODY_PX = 48;
const LINE_H = 72;

export const Correction: React.FC<{
  label: string;
  lines: string[];
  variant: number;
  mark: MarkKind;
}> = ({label, lines, variant, mark}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {in: inF, out} = TIMING.correction;
  const exitStart = durationInFrames - out;
  const inner = W - PAD_X * 2;
  const cols = Math.floor(inner / (MONO_ADVANCE * BODY_PX));
  const visual = lines.flatMap((l) => wrapMono(l, cols));

  const headH = PAD_TOP + 6 + 20 + LABEL_PX * 1.06 + 14 + 6 + 24;
  const H = Math.round(headH + visual.length * LINE_H + PAD_BOTTOM);

  const place = drawOn(frame, 0, 3);
  const exit = exitRamp(frame, exitStart, out);
  const angle = paperAngle(`corr-${label}`);
  const markIn = drawOn(frame, inF + 3, 9);

  const yLabel = PAD_TOP + 26;
  const yLabelRule = yLabel + LABEL_PX * 1.06 + 14;
  const yFirst = yLabelRule + 24;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: POPUP.marginX,
          top: POPUP.marginY,
          width: W,
          height: H,
          transform: `translateY(${exit * -20}px) rotate(${angle}deg)`,
          transformOrigin: 'top left',
          opacity: place * (1 - exit),
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <Sheet w={W} h={H} variant={variant} />
          <Rule x={PAD_X} y={PAD_TOP} w={inner} frame={frame} start={1} dur={7} width={4} />
          <Rule x={PAD_X} y={yLabelRule} w={inner} frame={frame} start={4} dur={6} width={6} />
          {visual.map((_, i) => (
            <Rule
              key={i}
              x={PAD_X}
              y={yFirst + i * LINE_H + LINE_H - 16}
              w={inner}
              frame={frame}
              start={5 + i * 1.2 + jitter1(`c-${label}-${i}`)}
              dur={5}
              stroke="var(--rc-paper-deep)"
              width={3}
            />
          ))}

          {/* The single red hand mark (§3.2). */}
          <g stroke="var(--rc-annotation)" fill="none" strokeLinecap="round" strokeWidth={7}>
            {mark === 'circle'
              ? (() => {
                  // Circle the label, don't strike it. The mono advance is
                  // exactly 0.6em, so the label's width is arithmetic.
                  const labelW = label.length * (MONO_ADVANCE * LABEL_PX + 4);
                  const cx = PAD_X + labelW / 2;
                  const cy = yLabel + LABEL_PX * 0.54;
                  const rx = labelW / 2 + 34;
                  const ry = LABEL_PX * 1.15;
                  const len = 2 * Math.PI * ((rx + ry) / 2);
                  return (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx}
                      ry={ry}
                      transform={`rotate(-1.6 ${cx} ${cy})`}
                      strokeDasharray={len}
                      strokeDashoffset={len * (1 - markIn)}
                    />
                  );
                })()
              : null}
            {mark === 'strike'
              ? (() => {
                  const y = yFirst + LINE_H * 0.42;
                  const len = inner * 0.86;
                  return (
                    <path
                      d={`M ${PAD_X} ${y} q ${len * 0.3} -9 ${len * 0.55} -3 t ${len * 0.45} 7`}
                      strokeDasharray={len + 40}
                      strokeDashoffset={(len + 40) * (1 - markIn)}
                    />
                  );
                })()
              : null}
            {mark === 'arrow'
              ? (() => {
                  const x = PAD_X + inner + 26;
                  const y0 = yLabel + 10;
                  const y1 = yFirst + LINE_H * 0.5;
                  const len = Math.hypot(70, y1 - y0) + 90;
                  return (
                    <path
                      d={`M ${x + 60} ${y0} L ${x} ${y1} M ${x} ${y1} l 34 -10 M ${x} ${y1} l 8 -34`}
                      strokeDasharray={len}
                      strokeDashoffset={len * (1 - markIn)}
                    />
                  );
                })()
              : null}
          </g>
        </svg>

        <div
          style={{
            position: 'absolute',
            left: PAD_X,
            top: yLabel,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: LABEL_PX,
            lineHeight: 1.06,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'var(--rc-ink)',
            opacity: drawOn(frame, 2, 4),
          }}
        >
          {label}
        </div>

        {visual.map((t, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: PAD_X,
              top: yFirst + i * LINE_H,
              fontFamily: MONO,
              fontSize: BODY_PX,
              lineHeight: 1.18,
              color: 'var(--rc-ink)',
              whiteSpace: 'pre',
              opacity: drawOn(frame, 5 + i * 1.2 + jitter1(`c-${label}-${i}`), 5),
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/**
 * §9 running gags. "Keep these tiny and deadpan. If they're as loud as the
 * technique popups they'll stop being funny by the third video." So: no
 * sheet, no rule, no red mark — one line of mono, bottom-right, gone.
 */
export const Aside: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const place = drawOn(frame, 0, 3);
  const exit = exitRamp(frame, durationInFrames - 10, 10);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          right: 170,
          bottom: 150,
          fontFamily: MONO,
          fontSize: 50,
          letterSpacing: 2,
          color: 'var(--rc-ink)',
          background: 'var(--rc-paper)',
          padding: '18px 30px',
          transform: 'rotate(-0.8deg)',
          opacity: place * (1 - exit),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
