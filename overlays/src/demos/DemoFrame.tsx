import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {POPUP} from '../lib/spec';
import {MONO} from '../lib/sheet';
import {drawOn, exitRamp} from '../lib/motion';

/**
 * STANDALONE DEMONSTRATION POPUPS.
 *
 * A deliberate departure from spec §8, at the client's direction: these are
 * not field-sheet blocks. There is no paper, no card, no container at all —
 * each one is a technical animation that SHOWS the thing it is telling you,
 * with the label set underneath.
 *
 * Everything else in the design language still holds: no rounded corners, no
 * gradient decoration, no drop shadow, no UI easing, mono only, tokens for
 * colour, one red mark per asset, and every line DRAWS ON via
 * stroke-dashoffset rather than fading up (§3.5).
 *
 * LEGIBILITY. A field-sheet block carried its own paper, so contrast was
 * free. Standalone line work has nothing behind it and would disappear
 * against the bright print-room footage. So every stroke is painted twice:
 * a dark keyline first, the chalk line over it. That is an outline on line
 * art, not a drop shadow on a floating card — and it is also what the work
 * actually looks like, since Jack marks cloth in chalk.
 */

export const CHALK = 'var(--rc-paper)';
export const KEY = 'var(--rc-ink)';
export const MARK = 'var(--rc-annotation)';

/** Animation needs room to play, so the "in" is far longer than a caption's.
 *  Total still matches the §13 popup row, so it drops in interchangeably. */
export const DEMO_TIMING = {in: 40, hold: 72, out: 25, total: 137};

export const DIAGRAM_W = 940;
export const DIAGRAM_H = 560;

/**
 * Paints its children twice — once as a heavy dark keyline, once as the chalk
 * line on top. `render` receives the stroke colour and an extra width to add.
 */
export const Keylined: React.FC<{
  render: (stroke: string, extra: number) => React.ReactNode;
  /** Chalk by default; pass MARK for the single red annotation. */
  color?: string;
}> = ({render, color = CHALK}) => (
  <>
    {/* Opaque, and wide enough to define the shape on its own: on bright
        footage the chalk has almost no contrast and this outline is what
        makes the drawing readable at all. */}
    <g strokeLinecap="round" strokeLinejoin="round">{render(KEY, 12)}</g>
    <g strokeLinecap="round" strokeLinejoin="round">{render(color, 0)}</g>
  </>
);

/** Mono caption, also keylined so it survives a blown-out background. */
const Caption: React.FC<{label: string; sub: string; opacity: number}> = ({label, sub, opacity}) => {
  const base: React.CSSProperties = {
    fontFamily: MONO,
    margin: 0,
    whiteSpace: 'pre',
  };
  const stack = (color: string, stroke: number): React.CSSProperties => ({
    ...base,
    color,
    WebkitTextStrokeWidth: stroke,
    WebkitTextStrokeColor: KEY,
    paintOrder: 'stroke fill',
  });
  return (
    <div style={{opacity}}>
      <div style={{...stack(CHALK, 12), fontSize: 66, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase'}}>
        {label}
      </div>
      <div style={{...stack(CHALK, 9), fontSize: 50, marginTop: 14}}>{sub}</div>
    </div>
  );
};

export const DemoFrame: React.FC<{
  label: string;
  sub: string;
  children: React.ReactNode;
}> = ({label, sub, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const exit = exitRamp(frame, durationInFrames - DEMO_TIMING.out, DEMO_TIMING.out);
  const capIn = drawOn(frame, DEMO_TIMING.in * 0.55, 8);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: POPUP.marginX,
          top: POPUP.marginY,
          width: DIAGRAM_W,
          opacity: 1 - exit,
          transform: `translateY(${exit * -18}px)`,
        }}
      >
        <svg width={DIAGRAM_W} height={DIAGRAM_H} viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`} style={{display: 'block', overflow: 'visible'}}>
          {children}
        </svg>
        <div style={{marginTop: 34}}>
          <Caption label={label} sub={sub} opacity={capIn} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
