import React from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * THE STICKER CUT — the library's one way of putting artwork on paper.
 *
 * The paper is not authored and then decorated. It is derived from the
 * drawing: render the artwork, take its alpha, grow it, tear the boundary and
 * flood it white, and the result is a die-cut edge that follows whatever was
 * drawn — around a presser foot, along a stitch line, around each letter of a
 * caption, around the leading edge of a bolt of cloth.
 *
 * Three steps, and the reasons they are in this order:
 *
 * 1. FLATTEN. Artwork carries decorative opacities — weave at 0.4, selvedge
 *    ticks at 0.7 — and paper is opaque whatever it was cut from.
 * 2. GROW AND MERGE. Blur the alpha and threshold it low. The edge lands about
 *    `blur * 1.81` outside the ink, and anything closer together than about
 *    four times `blur` fuses into one piece of paper. Detail is drawn to suit
 *    that distance; genuinely separate parts stay separately cut, which is
 *    what scissors do.
 * 3. TEAR. Displace the boundary with turbulence, reseeded every few frames,
 *    so the cut boils like a re-cut stop-motion element instead of sitting
 *    still.
 *
 * Two things not to rediscover, both measured:
 *
 * - `feMorphology` dilate/erode reads identically and costs FOUR SECONDS A
 *   FRAME at 4K — 95s per twenty frames against 18s. A Gaussian blur is three
 *   box passes. Do not reach for morphology here.
 * - Growing the paper by stroking the silhouette wide instead makes Skia's
 *   stroker self-intersect on thin shapes; the overlapping halves cancel and
 *   punch holes. It put a bowtie-shaped hole through the paper above and below
 *   every em dash in the popup captions. Stroke only enough to firm hairlines
 *   up, and let the blur make the margin.
 */

export const CUT_BOIL_EVERY = 4;
export const CUT_BOIL_VARIANTS = 3;

/** Which re-cut of the edge this frame gets. */
export const useCutVariant = (every = CUT_BOIL_EVERY, variants = CUT_BOIL_VARIANTS) =>
  Math.floor(useCurrentFrame() / every) % variants;

export type PaperCutProps = {
  id: string;
  variant: number;
  /** Sets the margin: the edge lands about blur * 1.81 outside the artwork. */
  blur?: number;
  /** Threshold. Lower grows the paper and closes more; raising it opens holes. */
  cut?: number;
  /** Steepness of the threshold — how hard the cut edge is. */
  slope?: number;
  /** How far the turbulence drags the boundary about. */
  tear?: number;
  /**
   * Filter region. Percentages of the artwork's bounding box by default, which
   * is wrong for anything whose bounding box shrinks to nothing mid-shot — a
   * wipe at frame zero has a band a few hundred px wide, and 14% of that is
   * less than the margin, so the cut gets clipped. Pass userSpace with an
   * absolute region for those.
   */
  region?: {x: number | string; y: number | string; width: number | string; height: number | string};
  userSpace?: boolean;
};

export const PaperCutFilter: React.FC<PaperCutProps> = ({
  id,
  variant,
  blur = 16,
  cut = 0.035,
  slope = 175,
  tear = 26,
  region = {x: '-14%', y: '-12%', width: '128%', height: '126%'},
  userSpace = false,
}) => (
  <filter
    id={id}
    {...region}
    {...(userSpace ? {filterUnits: 'userSpaceOnUse' as const} : {})}
    colorInterpolationFilters="sRGB"
  >
    <feTurbulence
      type="fractalNoise"
      baseFrequency="0.011"
      numOctaves="2"
      seed={variant * 7 + 3}
      result="noise"
    />
    <feComponentTransfer in="SourceAlpha" result="solid">
      <feFuncA type="linear" slope="6" intercept="0" />
    </feComponentTransfer>
    <feGaussianBlur in="solid" stdDeviation={blur} result="spread" />
    <feComponentTransfer in="spread" result="cut">
      <feFuncA type="linear" slope={slope} intercept={-slope * cut} />
    </feComponentTransfer>
    <feDisplacementMap
      in="cut"
      in2="noise"
      scale={tear}
      xChannelSelector="R"
      yChannelSelector="G"
      result="ragged"
    />
    <feFlood floodColor="#FFFFFF" result="white" />
    <feComposite in="white" in2="ragged" operator="in" />
  </filter>
);
