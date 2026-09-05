import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {drawOn, exitRamp} from '../lib/motion';

/**
 * STANDALONE DEMONSTRATION POPUPS — sticker cut.
 *
 * The paper is not a shape of its own with the drawing placed on top of it.
 * It is cut FROM the drawing: the white border follows the presser foot, runs
 * down the stitch line, wraps each letter of the caption. A die-cut sticker,
 * or a photograph scissored out along its subject — not a symbol sitting on a
 * wobbly blob.
 *
 * How it works. Every diagram's stroke callback already takes an `extra`
 * width, so the whole tree can be re-rendered as a deliberately over-fat white
 * version of itself: that fat pass IS the paper. Fattening (rather than a
 * filter dilation) does the merging for free — neighbouring detail closer than
 * one fat stroke fuses into a single piece of paper, while genuinely separate
 * parts of the drawing stay separately cut, which is what scissors do.
 *
 * The filter then only has to finish the edge: threshold the alpha so the
 * paper is opaque throughout, erode back to a tight margin, and push the
 * boundary about with turbulence so the cut is torn rather than a clean
 * offset outline. The turbulence seed changes every few frames, so the edge
 * boils the way a re-cut stop-motion element does.
 *
 * Which pass a diagram is in travels by context, so the diagram files describe
 * the drawing once and cannot get the two passes out of step.
 */

export const INK = 'var(--rc-ink)';
export const MARK = 'var(--rc-annotation)';
/** Kept for the diagrams' signature. */
export const CHALK = INK;
export const KEY = INK;

export const DEMO_TIMING = {in: 40, hold: 72, out: 25, total: 137};

/** Diagrams are authored in this space and scaled onto the frame. */
export const DIAGRAM_W = 940;
export const DIAGRAM_H = 560;

const DRAWN_W = 900;
const SCALE = DRAWN_W / DIAGRAM_W;

const MARGIN_X = 190;
const MARGIN_Y = 180;

/**
 * Applied to the finished overlay so it lands at roughly 15% of a 4K frame,
 * as asked. Scaling here rather than in the authoring sizes keeps the cut
 * proportional to the drawing — the filter lives inside the transformed SVG,
 * so the paper margin grows with the art instead of thinning out.
 */
const OVERLAY_SCALE = 1.25;

/**
 * Added to every stroke width in the paper pass. Small: it only firms up the
 * hairlines (the weave, at 3px) so they survive the threshold below. The cut
 * itself is made by the blur, NOT by stroke width — a stroke wide enough to
 * be the whole margin makes Skia's stroker self-intersect on thin glyphs, and
 * the overlapping halves cancel into holes. That is what punched a bowtie
 * through the paper above and below every em dash.
 */
const SIL_EXTRA = 10;

/**
 * The cut, in two numbers. Blurring the drawing's alpha and then thresholding
 * it low both grows the shape and merges neighbours: the edge lands about
 * 29px outside the ink, and two strokes closer than ~65px fuse into one piece
 * of paper. Everything the diagrams do is drawn to suit that distance. CUT is
 * as low as it is to close the specks that opened in the widest gaps between
 * glyphs; raising it reopens them.
 *
 * The previous version did this with feMorphology, which looks the same and
 * costs four seconds a frame at 4K. A blur is three box passes.
 */
const BLUR = 16;
const CUT = 0.035;

const LABEL_PX = 68;
const SUB_PX = 46;

/** Stop-motion boil on the cut edge. */
const BOIL_EVERY = 4;
const BOIL_VARIANTS = 3;

/** 0 in the ink pass; the extra stroke width in the paper pass. */
const PaperPass = React.createContext(0);

/**
 * The diagrams' only drawing primitive. In the ink pass it renders what the
 * diagram asked for; in the paper pass it renders the same geometry white and
 * fat, ignoring the diagram's colour — paper has no palette.
 */
export const Keylined: React.FC<{
  render: (stroke: string, extra: number) => React.ReactNode;
  color?: string;
}> = ({render, color = INK}) => {
  const extra = React.useContext(PaperPass);
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {extra > 0 ? render('#FFFFFF', extra) : render(color, 0)}
    </g>
  );
};

export const DemoFrame: React.FC<{
  label: string;
  sub: string;
  seed: string;
  /**
   * Top and bottom of the drawing within the authoring box. The caption sits
   * directly under the ink rather than under the empty part of the box, so a
   * shallow diagram does not leave its label floating in space.
   */
  extent?: [number, number];
  children: React.ReactNode;
}> = ({label, sub, seed, extent = [0, DIAGRAM_H], children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const exit = exitRamp(frame, durationInFrames - DEMO_TIMING.out, DEMO_TIMING.out);
  const place = drawOn(frame, 0, 5);
  const capIn = drawOn(frame, DEMO_TIMING.in * 0.55, 8);

  const variant = Math.floor(frame / BOIL_EVERY) % BOIL_VARIANTS;
  const fid = `sticker-${seed}-${variant}`;

  const labelLines = label.split('\n');
  const subLines = sub.split('\n');

  const [top, bottom] = extent;
  const drawnH = (bottom - top) * SCALE;
  const textTop = drawnH + 60;
  const labelH = LABEL_PX * 1.1;
  /**
   * The two caption lines sit close enough that the cut bridges the gap even
   * where both happen to have a space in the same column. At the old 26 a
   * pinprick opened between them.
   */
  const subTop = textTop + labelLines.length * labelH + 12;

  /** Room for the paper to reach outside the drawing without being clipped. */
  const PAD = 70;
  const W = DRAWN_W + 300 + PAD * 2;
  const H = subTop + subLines.length * SUB_PX * 1.24 + 160 + PAD * 2;

  // Both passes render the caption; in the paper pass the glyphs are stroked
  // as fat as the diagrams are, so a word cuts out as one piece.
  const Caption = (paper: boolean) => (
    <g
      opacity={capIn}
      fill={paper ? '#FFFFFF' : INK}
      stroke={paper ? '#FFFFFF' : 'none'}
      strokeWidth={paper ? SIL_EXTRA : 0}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {labelLines.map((l, i) => (
        <text
          key={`l${i}`}
          x={0}
          y={textTop + i * labelH + LABEL_PX * 0.82}
          fontFamily='"Cinzel", "Trajan Pro", Georgia, serif'
          fontWeight={900}
          fontSize={LABEL_PX}
          letterSpacing={2}
        >
          {l.toUpperCase()}
        </text>
      ))}
      {subLines.map((l, i) => (
        <text
          key={`s${i}`}
          x={0}
          y={subTop + i * SUB_PX * 1.24 + SUB_PX * 0.8}
          fontFamily='"Courier Prime", "Courier New", monospace'
          fontWeight={700}
          fontSize={SUB_PX}
        >
          {l}
        </text>
      ))}
    </g>
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          top: MARGIN_Y,
          width: W,
          height: H,
          opacity: place * (1 - exit),
          transform: `scale(${OVERLAY_SCALE}) translateY(${exit * -20}px)`,
          transformOrigin: 'top left',
        }}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          <defs>
            <filter id={fid} x="-14%" y="-12%" width="128%" height="126%" colorInterpolationFilters="sRGB">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.011"
                numOctaves="2"
                seed={variant * 7 + 3}
                result="noise"
              />
              {/* Flatten first: the drawing carries decorative opacities (the
                  weave at 0.4, the selvedge ticks at 0.7) and paper is opaque
                  whatever it was cut from. */}
              <feComponentTransfer in="SourceAlpha" result="solid">
                <feFuncA type="linear" slope="6" intercept="0" />
              </feComponentTransfer>
              {/* Grow and merge. */}
              <feGaussianBlur in="solid" stdDeviation={BLUR} result="spread" />
              <feComponentTransfer in="spread" result="cut">
                <feFuncA type="linear" slope="175" intercept={-175 * CUT} />
              </feComponentTransfer>
              {/* The tear. */}
              <feDisplacementMap
                in="cut"
                in2="noise"
                scale="26"
                xChannelSelector="R"
                yChannelSelector="G"
                result="ragged"
              />
              <feFlood floodColor="#FFFFFF" result="white" />
              <feComposite in="white" in2="ragged" operator="in" />
            </filter>
          </defs>

          <g transform={`translate(${PAD} ${PAD})`}>
            {/* PASS 1 — the paper, cut from the drawing's own outline. */}
            <PaperPass.Provider value={SIL_EXTRA}>
              <g filter={`url(#${fid})`}>
                <g transform={`translate(0 ${-top * SCALE}) scale(${SCALE})`}>{children}</g>
                {Caption(true)}
              </g>
            </PaperPass.Provider>

            {/* PASS 2 — the ink. */}
            <PaperPass.Provider value={0}>
              <g transform={`translate(0 ${-top * SCALE}) scale(${SCALE})`}>{children}</g>
              {Caption(false)}
            </PaperPass.Provider>
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
