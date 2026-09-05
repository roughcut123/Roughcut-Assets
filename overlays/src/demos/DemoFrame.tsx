import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS_H, CANVAS_W} from '../lib/spec';
import {drawOn, exitRamp} from '../lib/motion';
import {boilSeed, papercutPath} from './papercut';

/**
 * STANDALONE DEMONSTRATION POPUPS.
 *
 * A deliberate departure from spec §8, at the client's direction. Not a
 * field-sheet block and not a card: an organic hand-cut white paper scrap
 * that WOBBLES — re-cut every four frames from three seeded variants, the way
 * a physical papercut is nudged between exposures in stop motion — with the
 * demonstration drawn on top of it in ink.
 *
 * The paper is doing three jobs at once: it gives the line work something to
 * sit on, it makes dark ink and dark type possible (which is the only way
 * this survives bright footage), and it is the brand's own material.
 *
 * TYPE. §8 says popups are mono only. Overridden here, because mono alone
 * does not read as Roughcut: the label is set in Cinzel, the Roman
 * inscriptional face of "RELIC FROM THE PAST CRAFTED IN THE PRESENT", at its
 * heaviest weight. The technical sub-line stays in the typewriter, bolded.
 * Two faces, inside §3.3's three-per-asset ceiling.
 */

export const INK = 'var(--rc-ink)';
export const PAPER = 'var(--rc-paper-white)';
export const MARK = 'var(--rc-annotation)';
/** Kept for the diagrams' signature; the drawing is ink on paper now. */
export const CHALK = INK;
export const KEY = INK;

export const DEMO_TIMING = {in: 40, hold: 72, out: 25, total: 137};

/**
 * Sized so the whole overlay covers roughly 15% of the frame. The scrap's
 * bounding box is 1300x1160; being closer to an ellipse than a rectangle its
 * actual area is about 1.18M px of a 8.29M frame, so ~14%.
 */
/**
 * Wider than tall, so the content band sits where the scrap is widest. A tall
 * shape narrows sharply top and bottom and the caption runs off the paper —
 * which is exactly what the first attempt did.
 */
export const PAPER_W = 1400;
export const PAPER_H = 1080;
/**
 * The diagrams are AUTHORED in this coordinate space and then scaled to fit
 * the scrap. Keeping the authoring size fixed means changing the paper does
 * not silently push drawings off the edge — which it did the first time the
 * frame was resized.
 */
export const DIAGRAM_W = 940;
export const DIAGRAM_H = 560;
/** Drawn width on the paper, and the resulting scale. */
const DRAWN_W = 820;
const DIAGRAM_SCALE = DRAWN_W / DIAGRAM_W;
/** Content width, kept inside the shape's narrowest point across the band. */
const CONTENT_W = 850;

/**
 * The rectangle the paper must always enclose: the drawing plus a caption of
 * up to two heading lines and two sub lines. Derived, not eyeballed.
 */
const CAP_LINES = 2;
const LABEL_PX = 70;
const SUB_PX = 44;
const CAPTION_H = CAP_LINES * LABEL_PX * 1.04 + 14 + CAP_LINES * SUB_PX * 1.2;

const MARGIN_X = 150;
const MARGIN_Y = 140;

const DIAG_TOP = 150;
const CONTENT_BOTTOM = DIAG_TOP + DIAGRAM_H * DIAGRAM_SCALE + 46 + CAPTION_H;
const SAFE_HW = CONTENT_W / 2;
const SAFE_HH = Math.max(PAPER_H / 2 - DIAG_TOP, CONTENT_BOTTOM - PAPER_H / 2);

/** The drawing is ink on paper, so no keyline is needed any more. */
export const Keylined: React.FC<{
  render: (stroke: string, extra: number) => React.ReactNode;
  color?: string;
}> = ({render, color = INK}) => (
  <g strokeLinecap="round" strokeLinejoin="round">{render(color, 0)}</g>
);

export const DemoFrame: React.FC<{
  label: string;
  sub: string;
  seed: string;
  children: React.ReactNode;
}> = ({label, sub, seed, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const exit = exitRamp(frame, durationInFrames - DEMO_TIMING.out, DEMO_TIMING.out);
  const place = drawOn(frame, 0, 5);
  const capIn = drawOn(frame, DEMO_TIMING.in * 0.55, 8);

  // The wobble: a fresh cut every four frames, cycling three variants — and
  // clamped so no variant can ever cut inside the content.
  const d = papercutPath({
    w: PAPER_W,
    h: PAPER_H,
    seed: boilSeed(seed, frame),
    safe: {hw: SAFE_HW, hh: SAFE_HH},
  });

  const diagX = (PAPER_W - DRAWN_W) / 2;
  const diagY = DIAG_TOP;
  const textX = (PAPER_W - CONTENT_W) / 2;
  // Measured off the SCALED drawing, not the authoring height, or the red
  // dimension mark lands on top of the heading.
  const textY = diagY + DIAGRAM_H * DIAGRAM_SCALE + 46;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          top: MARGIN_Y,
          width: PAPER_W,
          height: PAPER_H,
          opacity: place * (1 - exit),
          transform: `translateY(${exit * -20}px) scale(${0.985 + place * 0.015})`,
          transformOrigin: 'top left',
        }}
      >
        <svg
          width={PAPER_W}
          height={PAPER_H}
          viewBox={`0 0 ${PAPER_W} ${PAPER_H}`}
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          {/* The white outline: a pure-white scrap, with a slightly warmer
              paper inset inside it. Filling and stroking in the same white
              gives no border at all — the rim has to be a different white
              from the sheet for the cut-out to read. */}
          <path d={d} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={34} strokeLinejoin="round" />
          <g transform={`translate(${PAPER_W / 2} ${PAPER_H / 2}) scale(0.955) translate(${-PAPER_W / 2} ${-PAPER_H / 2})`}>
            <path d={d} fill={PAPER} />
          </g>
          {/* A hairline at the cut edge, so white paper still separates from a
              blown-out white background. Not a shadow — the edge itself. */}
          <path d={d} fill="none" stroke={INK} strokeWidth={3} strokeOpacity={0.3} />

          <g transform={`translate(${diagX} ${diagY}) scale(${DIAGRAM_SCALE})`}>{children}</g>
        </svg>

        <div
          style={{
            position: 'absolute',
            left: textX,
            top: textY,
            width: CONTENT_W,
            opacity: capIn,
          }}
        >
          <div
            style={{
              fontFamily: '"Cinzel", Georgia, serif',
              fontWeight: 900,
              fontSize: LABEL_PX,
              lineHeight: 1.04,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: INK,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: '"Courier Prime", "Courier New", monospace',
              fontWeight: 700,
              fontSize: SUB_PX,
              lineHeight: 1.2,
              marginTop: 14,
              color: INK,
            }}
          >
            {sub}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
