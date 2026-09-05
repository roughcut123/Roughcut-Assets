import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {tornRectPath} from '../lib/masks';
import {MIN_TEXT_PX, POPUP, TIMING} from '../lib/spec';

/**
 * FAMILY C — top-left popup. Spec §8.
 *
 * The container is an Artifact Expedition Dispatch field-sheet block: a torn
 * fragment of a ruled form lying over the footage. Deliberately NOT a card —
 * per §3.4 there is no drop shadow, no gradient fill and no rounded corner
 * anywhere in here, and per §8 every word is set in the typewriter mono.
 *
 * Motion follows §3.5: the block builds from parts rather than sliding in,
 * every rule draws on by stroke-dashoffset rather than fading up, and the
 * line stagger carries a seeded ±1 frame of irregularity so nothing lands in
 * lockstep. No spring, no overshoot.
 */

export type FieldSheetProps = {
  /** Mono caps label — the form's field name. */
  label: string;
  /** Value lines, written in below the rule. */
  lines: string[];
  /** Which torn silhouette (§3.4). Assets declare this so it never repeats. */
  variant: number;
  /** Degrees. §3.5: never 0, never more than 4. */
  angle?: number;
  /**
   * Index of the line carrying the single red hand mark (§3.2). Exactly one
   * per asset, or none. A second red mark means one of them is wrong.
   */
  annotateLine?: number;
  /** §8.2 skill level: a filled bar in --rc-gold. */
  bar?: {value: number; max: number};
};

/** Ease-out only. §3.5 forbids anything that reads as UI springiness. */
const drawOn = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

/**
 * Courier Prime is monospaced at exactly 0.6em per glyph, so line breaking can
 * be computed here rather than measured in the browser. That matters: browser
 * text measurement races font loading and can lay out differently in the
 * export than in the Studio. Monospace removes the race entirely.
 */
const MONO_ADVANCE = 0.6;

const wrapMono = (text: string, cols: number): string[] => {
  const words = text.split(' ');
  const out: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= cols || !line) {
      line = next;
    } else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out;
};

const LABEL_PX = 62;
const BODY_PX = MIN_TEXT_PX; // §3.3 floor: 48px at 4K
const LINE_H = 74;
const PAD_X = 56;
const PAD_TOP = 50;
const PAD_BOTTOM = 46;

export const FieldSheet: React.FC<FieldSheetProps> = ({
  label,
  lines,
  variant,
  angle = 1.5,
  annotateLine,
  bar,
}) => {
  const frame = useCurrentFrame();
  const {in: inF, hold, out} = TIMING.popup;
  const exitStart = inF + hold;

  const W = POPUP.maxWidth;
  const inner = W - PAD_X * 2;

  // §8 caps the block at 1100px and §3.3 sets a 48px floor on text, which
  // between them leave 34 monospaced characters per line. Two of the spec's
  // own seam-allowance lines are longer than that, so entries wrap - and each
  // wrapped line gets its own ruled baseline, as it would on a real form.
  const cols = Math.floor(inner / (MONO_ADVANCE * BODY_PX));
  const visual = lines.flatMap((l, i) =>
    wrapMono(l, cols).map((text, j, arr) => ({text, entry: i, last: j === arr.length - 1})),
  );

  // Height is derived from the wrapped content, so copy can never clip.
  const headH = PAD_TOP + 6 + 22 + LABEL_PX * 1.06 + 16 + 6 + 26;
  const BAR_H = bar ? 96 : 0;
  const H = Math.round(headH + visual.length * LINE_H + BAR_H + PAD_BOTTOM);

  const d = tornRectPath({w: W, h: H, variant, torn: ['right', 'bottom']});

  // Placed, not slid: a short scale settle with no overshoot.
  const place = drawOn(frame, 0, 4);
  const scale = interpolate(place, [0, 1], [1.012, 1]);

  const exit = interpolate(frame, [exitStart, exitStart + out], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const topRule = drawOn(frame, 2, 8);
  const labelIn = drawOn(frame, 4, 4);
  const labelRule = drawOn(frame, 6, 7);

  const yHead = PAD_TOP;
  const yLabel = yHead + 6 + 22;
  const yLabelRule = yLabel + LABEL_PX * 1.06 + 16;
  const yFirst = yLabelRule + 26;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: POPUP.marginX,
          top: POPUP.marginY,
          width: W,
          height: H,
          transform: `translateY(${exit * -26}px) rotate(${angle}deg) scale(${scale})`,
          transformOrigin: 'top left',
          opacity: Math.min(place, 1) * (1 - exit),
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          {/* The sheet itself. Flat fill — no gradient, no shadow (§3.4). */}
          <path d={d} fill="var(--rc-paper)" />

          {/* Header rule of the form. */}
          <line
            x1={PAD_X}
            y1={yHead}
            x2={PAD_X + inner}
            y2={yHead}
            stroke="var(--rc-ink)"
            strokeWidth={4}
            strokeDasharray={inner}
            strokeDashoffset={inner * (1 - topRule)}
          />

          {/* Heavier rule beneath the field name. */}
          <line
            x1={PAD_X}
            y1={yLabelRule}
            x2={PAD_X + inner}
            y2={yLabelRule}
            stroke="var(--rc-ink)"
            strokeWidth={6}
            strokeDasharray={inner}
            strokeDashoffset={inner * (1 - labelRule)}
          />

          {/* A printed baseline under every written value, as on the form. */}
          {visual.map((v, i) => {
            const start = 7 + v.entry * 1.2 + (random(`fs-${label}-${v.entry}`) - 0.5) * 2; // §3.5 ±1 frame
            const p = drawOn(frame, start, 6);
            const y = yFirst + i * LINE_H + LINE_H - 16;
            return (
              <line
                key={i}
                x1={PAD_X}
                y1={y}
                x2={PAD_X + inner}
                y2={y}
                stroke="var(--rc-paper-deep)"
                strokeWidth={3}
                strokeDasharray={inner}
                strokeDashoffset={inner * (1 - p)}
              />
            );
          })}

          {/* §8.2 skill bar: segments filled in gold, drawn on one at a time. */}
          {bar
            ? (() => {
                const y = yFirst + visual.length * LINE_H + 18;
                const gap = 14;
                const segW = (inner - gap * (bar.max - 1)) / bar.max;
                return (
                  <g>
                    {Array.from({length: bar.max}).map((_, i) => {
                      const on = i < bar.value;
                      const p = drawOn(frame, 10 + i * 2 + (random(`bar-${i}`) - 0.5) * 2, 5);
                      return (
                        <rect
                          key={i}
                          x={PAD_X + i * (segW + gap)}
                          y={y}
                          width={segW}
                          height={40}
                          fill={on ? 'var(--rc-gold)' : 'none'}
                          stroke="var(--rc-ink)"
                          strokeWidth={4}
                          opacity={p}
                        />
                      );
                    })}
                  </g>
                );
              })()
            : null}

          {/* §3.2: exactly one red hand mark per asset. */}
          {annotateLine !== undefined ? (
            (() => {
              const p = drawOn(frame, inF + 2, 10);
              // Sits under the last wrapped line of the annotated entry.
              const idx = visual.reduce(
                (acc, v, i) => (v.entry === annotateLine && v.last ? i : acc),
                0,
              );
              const y = yFirst + idx * LINE_H + LINE_H - 6;
              const len = inner * 0.78;
              return (
                <path
                  d={`M ${PAD_X} ${y} q ${len * 0.25} -7 ${len * 0.5} -2 t ${len * 0.5} 5`}
                  fill="none"
                  stroke="var(--rc-annotation)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={len + 40}
                  strokeDashoffset={(len + 40) * (1 - p)}
                />
              );
            })()
          ) : null}
        </svg>

        {/* All popup copy is mono. §8. */}
        <div
          style={{
            position: 'absolute',
            left: PAD_X,
            top: yLabel,
            width: inner,
            fontFamily: '"Courier Prime", "Courier New", monospace',
            fontWeight: 700,
            fontSize: LABEL_PX,
            lineHeight: 1.06,
            letterSpacing: 5,
            textTransform: 'uppercase',
            color: 'var(--rc-ink)',
            opacity: labelIn,
          }}
        >
          {label}
        </div>

        {visual.map((v, i) => {
          const start = 7 + v.entry * 1.2 + (random(`fs-${label}-${v.entry}`) - 0.5) * 2;
          const p = drawOn(frame, start, 5);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: PAD_X,
                top: yFirst + i * LINE_H,
                width: inner,
                fontFamily: '"Courier Prime", "Courier New", monospace',
                fontWeight: 400,
                fontSize: BODY_PX,
                lineHeight: 1.18,
                color: 'var(--rc-ink)',
                opacity: p,
                whiteSpace: 'pre',
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
