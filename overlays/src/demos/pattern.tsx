import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {drawOn} from '../lib/motion';
import {DEMO_TIMING, Keylined, MARK} from './DemoFrame';

/**
 * The pattern-literacy demonstrations — the booklet-walkthrough chapters
 * (§4 rows 4, 5, 6 and 8), built as standalone animations in the same
 * sticker-cut register as the universal five.
 *
 * The subject here is the printed page, so the page is drawn as a page: a
 * border, a dashed bleed line inset from it, alignment bullseyes on the bleed
 * corners, and ruled content. The rules are not decoration — a page drawn as
 * an empty outline cuts out as a frame with a hole in the middle, and video
 * showing through the sheet is the one thing a sheet must not do.
 */

const IN = DEMO_TIMING.in;
const draw = (len: number, p: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - p)});

/** Inset of the bleed line from the page edge. */
const BLEED = 16;
/**
 * Content-rule pitch. Under the cut's merge distance, so a sheet comes out as
 * one solid piece of paper instead of a frame around a hole.
 */
const RULE = 52;

/** Faint printed content, enough to fill the sheet. */
const rules = (x: number, y: number, w: number, h: number, e: number, p: number, key = 'r') => {
  const n = Math.max(1, Math.floor((h - RULE) / RULE));
  const top = y + (h - (n - 1) * RULE) / 2;
  return Array.from({length: n}).map((_, i) => (
    <line
      key={`${key}${i}`}
      x1={x + 14}
      y1={top + i * RULE}
      x2={x + w - 14}
      y2={top + i * RULE}
      strokeWidth={3 + e}
      opacity={0.3}
      {...draw(w, p)}
    />
  ));
};

/** Concentric alignment bullseye — the mark that lands on its twin. */
const bullseye = (cx: number, cy: number, r: number, e: number, p: number, key = 'b') => (
  <g key={key}>
    <circle cx={cx} cy={cy} r={r} strokeWidth={4 + e} fill="none" {...draw(2 * Math.PI * r + 20, p)} />
    <circle cx={cx} cy={cy} r={r * 0.45} strokeWidth={4 + e} fill="none" {...draw(2 * Math.PI * r * 0.45 + 20, p)} />
    <line x1={cx - r * 1.5} y1={cy} x2={cx + r * 1.5} y2={cy} strokeWidth={3 + e} {...draw(r * 3, p)} />
    <line x1={cx} y1={cy - r * 1.5} x2={cx} y2={cy + r * 1.5} strokeWidth={3 + e} {...draw(r * 3, p)} />
  </g>
);

/**
 * A printed sheet: edge, bleed line, corner bullseyes, ruled content.
 *
 * Filled in the same white the cut floods, which does two jobs at once. A
 * sheet laid on a sheet covers it, the way paper does — without a fill the
 * lines of the page underneath show through the page on top and the overlap
 * is unreadable. And a filled sheet cuts out solid, so it cannot come out as
 * a frame around a hole with video showing through the middle of it.
 */
const sheet = (
  x: number, y: number, w: number, h: number,
  e: number, p: number,
  opts: {
    darts?: boolean; dartR?: number; content?: boolean; ghost?: boolean;
    /** Grid reference, printed where Jack prints it: inside the top-left dart. */
    label?: string;
    stroke?: string;
    key?: string;
  } = {},
) => {
  const {darts = true, dartR = 13, content = true, ghost = false, label, stroke = '#3B2E22', key = 's'} = opts;
  const bx = x + BLEED;
  const by = y + BLEED;
  const bw = w - BLEED * 2;
  const bh = h - BLEED * 2;
  return (
    <g key={key}>
      {ghost ? (
        <rect
          x={x} y={y} width={w} height={h}
          fill="none" strokeWidth={6 + e} strokeDasharray="20 14"
          style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}
        />
      ) : (
        <rect
          x={x} y={y} width={w} height={h}
          fill="#FFFFFF" strokeWidth={6 + e}
          {...draw(2 * (w + h), p)}
        />
      )}
      {/* the black bleed line — what the next page overlaps onto */}
      <rect
        x={bx} y={by} width={bw} height={bh}
        strokeWidth={4 + e}
        strokeDasharray="15 11"
        style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}
      />
      {content ? rules(bx, by, bw, bh, e, p, `${key}r`) : null}
      {label ? (
        <text
          x={bx + dartR * 2 + 14}
          y={by + 46}
          fill={stroke}
          stroke="none"
          opacity={p}
          fontFamily='"Cinzel", Georgia, serif'
          fontWeight={900}
          fontSize={46}
          letterSpacing={2}
        >
          {label}
        </text>
      ) : null}
      {darts
        ? ([[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]] as const).map(([cx, cy], i) =>
            bullseye(cx, cy, dartR, e, p, `${key}d${i}`),
          )
        : null}
    </g>
  );
};

/* ------------------------------------------------------------------ 1. TILING */

/**
 * Three A4 pages tile in left to right, as §6 M3 describes it, each landing
 * ON the previous page's bleed line rather than beside it. The pattern panel
 * runs across all three, which is the reason the overlap has to be right: butt
 * the pages and the panel is wrong by the width of two margins.
 *
 * Three big pages rather than a six-page grid. A 3x2 grid fits the authoring
 * box only at about 180px a page, and at that size the bleed line, the darts
 * and the overlap are all too fine to read once the overlay is on the video.
 */
const PW = 280;
const PH = 396;
const OVERLAP = 46;
const GX = 60;
const GY = 80;
const pageX = (c: number) => GX + c * (PW - OVERLAP);

export const TilingDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = drawOn(frame, 24, 16);
  const band = drawOn(frame, IN * 0.76, 9);

  return (
    <>
      {[0, 1, 2].map((c) => {
        // Each page arrives a beat after the last and slides in from the
        // right, so you watch it land on the bleed line.
        const p = drawOn(frame, c * 6, 9);
        const dx = interpolate(p, [0, 1], [OVERLAP * 3, 0]);
        return (
          <g key={c} transform={`translate(${dx} 0)`} opacity={p}>
            <Keylined render={(s, e) => (
              <g fill="none" stroke={s}>
                {sheet(pageX(c), GY, PW, PH, e, p, {
                  dartR: 16,
                  content: false,
                  label: `A${c + 1}`,
                  stroke: s,
                  key: `p${c}`,
                })}
              </g>
            )} />
          </g>
        );
      })}

      {/* The pattern panel spans the tiled pages, unbroken. */}
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={9 + e}>
            {/* a back yoke: hem, side seams, two shoulder slopes and the
                neckline between them. A shape that says garment at a glance. */}
            <path
              d={`M 138 434 L 138 250 L 268 196
                  C 332 216 362 232 420 232
                  C 478 232 508 216 572 196
                  L 702 250 L 702 434 Z`}
              {...draw(2000, panel)}
            />
            {/* notches and grain line — pattern furniture, and what makes the
                continuity across the seam legible. */}
            <path d="M 420 288 L 420 410 M 404 310 L 420 280 L 436 310 M 404 388 L 420 418 L 436 388"
              strokeWidth={5 + e} {...draw(320, panel)} />
            <path d="M 203 223 l 0 26 M 637 223 l 0 26" strokeWidth={5 + e} {...draw(60, panel)} />
          </g>
        )}
      />

      {/* THE red mark: the band where one page sits on the next one's bleed. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <line x1={pageX(1)} y1={40} x2={pageX(1)} y2={104} {...draw(64, band)} />
            <line x1={pageX(0) + PW} y1={40} x2={pageX(0) + PW} y2={104} {...draw(64, band)} />
            <line x1={pageX(1)} y1={50} x2={pageX(0) + PW} y2={50} {...draw(OVERLAP, band)} />
          </g>
        )}
      />
    </>
  );
};

/* ------------------------------------------------------------ 2. ALIGNMENT DARTS */

/**
 * The second page slides in until its darts sit on the first page's — which is
 * the same move as tiling, shown close enough to see what "on top of each
 * other" means. Both pairs land together; the red ring marks the top pair.
 */
export const BullseyeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 300;
  const H = 424;
  const AX = 60;
  const AY = 60;
  // B's left bleed edge lands exactly on A's right bleed edge.
  const BX = AX + W - BLEED * 2;
  const a = drawOn(frame, 0, 10);
  const b = drawOn(frame, 9, 10);
  const slide = drawOn(frame, 20, 18);
  const hit = drawOn(frame, IN * 0.78, 8);
  const off = interpolate(slide, [0, 1], [1, 0]);

  return (
    <>
      <Keylined render={(s, e) => (
        <g fill="none" stroke={s} opacity={a}>
          {sheet(AX, AY, W, H, e, a, {dartR: 24, label: 'A1', stroke: s, key: 'A'})}
        </g>
      )} />

      <g transform={`translate(${off * 132} ${off * 62})`} opacity={b}>
        <Keylined render={(s, e) => (
          <g fill="none" stroke={s}>
            {sheet(BX, AY, W, H, e, b, {dartR: 24, label: 'A2', stroke: s, key: 'B'})}
          </g>
        )} />
      </g>

      {/* THE red mark: two darts, now one dart. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <circle cx={AX + W - BLEED} cy={AY + BLEED} r={46}
              {...draw(2 * Math.PI * 46 + 20, hit)} />
          </g>
        )}
      />
    </>
  );
};

/* ---------------------------------------------------------------- 3. TEST SQUARE */

/** Page one prints, and the square on it measures two inches — or nothing
 *  else in the pattern is true to size. The red mark is the measurement. */
export const TestSquareDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const page = drawOn(frame, 0, 10);
  const sq = drawOn(frame, 14, 10);
  const dim = drawOn(frame, IN * 0.68, 10);
  const X0 = 372;
  const X1 = 572;
  const Y0 = 150;
  const Y1 = 350;

  return (
    <>
      <Keylined render={(s, e) => (
        <g fill="none" stroke={s}>
          {sheet(300, 24, 344, 486, e, page, {label: '1', stroke: s, key: 'T'})}
        </g>
      )} />

      {/* the printed square */}
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} strokeWidth={9 + e}
              {...draw(4 * (X1 - X0), sq)} />
          </g>
        )}
      />

      {/* THE red mark: two inches, measured. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={6 + e}>
            <line x1={X0} y1={Y1 + 52} x2={X1} y2={Y1 + 52} {...draw(X1 - X0, dim)} />
            <line x1={X0} y1={Y1 + 30} x2={X0} y2={Y1 + 74} {...draw(44, dim)} />
            <line x1={X1} y1={Y1 + 30} x2={X1} y2={Y1 + 74} {...draw(44, dim)} />
          </g>
        )}
      />
    </>
  );
};

/* -------------------------------------------------------------------- 4. FORMATS */

/**
 * The three sheets a Roughcut pattern comes as, named, standing on a common
 * baseline. The red mark is one cell of the A0 grid: that cell is an A4 page,
 * and there are sixteen of them — which is the whole argument for printing A0.
 *
 * Deliberately a formats chart rather than a scale drawing. A0 really is four
 * times A4 across, and drawn honestly it would either not fit the frame or
 * shrink A4 to a stamp; drawn to a common height, the 4x4 grid carries the
 * ratio as notation and the sheets stay comparable as shapes. A4 and Letter
 * differ by 6mm across and 18mm down — a sliver a few pixels wide at any size
 * that fits, so that difference is carried by the names.
 */
export const FormatsDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const a4 = drawOn(frame, 0, 9);
  const us = drawOn(frame, 9, 9);
  const a0 = drawOn(frame, 18, 13);
  const cell = drawOn(frame, IN * 0.76, 9);

  const HGT = 360;
  const A4W = HGT * (210 / 297);
  const USW = HGT * (216 / 279);
  const A0W = A4W;
  const FLOOR = 480;
  const TOP = FLOOR - HGT;
  const X4 = 60;
  const XU = X4 + A4W + 30;
  const X0 = XU + USW + 30;

  const label = (x: number, t: string, s: string, k: string) => (
    <text key={k} x={x} y={FLOOR + 48} fill={s} stroke="none"
      fontFamily='"Cinzel", Georgia, serif' fontWeight={900} fontSize={38} letterSpacing={2}>
      {t}
    </text>
  );

  return (
    <>
      <Keylined render={(s, e) => (
        <g fill="none" stroke={s} opacity={a4}>
          {sheet(X4, TOP, A4W, HGT, e, a4, {darts: false, key: 'F4'})}
          {label(X4, 'A4', s, 'l4')}
        </g>
      )} />

      <Keylined render={(s, e) => (
        <g fill="none" stroke={s} opacity={us}>
          {sheet(XU, TOP, USW, HGT, e, us, {darts: false, key: 'FU'})}
          {label(XU, 'US LETTER', s, 'lu')}
        </g>
      )} />

      <Keylined render={(s, e) => (
        <g fill="none" stroke={s} opacity={a0}>
          {sheet(X0, TOP, A0W, HGT, e, a0, {darts: false, content: false, key: 'F0'})}
          {/* the sixteen pages it replaces */}
          {[1, 2, 3].map((i) => (
            <line key={`v${i}`} x1={X0 + (A0W * i) / 4} y1={TOP} x2={X0 + (A0W * i) / 4} y2={FLOOR}
              strokeWidth={3 + e} opacity={0.45} {...draw(HGT, a0)} />
          ))}
          {[1, 2, 3].map((i) => (
            <line key={`h${i}`} x1={X0} y1={TOP + (HGT * i) / 4} x2={X0 + A0W} y2={TOP + (HGT * i) / 4}
              strokeWidth={3 + e} opacity={0.45} {...draw(A0W, a0)} />
          ))}
          {label(X0, 'A0', s, 'l0')}
        </g>
      )} />

      {/* THE red mark: one cell of the grid is one A4 page. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={6 + e}>
            <rect x={X0} y={TOP} width={A0W / 4} height={HGT / 4}
              {...draw(2 * (A0W / 4 + HGT / 4), cell)} />
          </g>
        )}
      />
    </>
  );
};

/* --------------------------------------------------------- 5. GARMENT MEASUREMENTS */

/**
 * The measurement is taken across the finished garment, laid flat, not around
 * a body. The garment is filled the same white the cut floods, so it covers
 * what it is laid on and comes out solid — the same reason the sheets are.
 * The red mark is the chest measurement itself.
 */
export const SizingDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const flat = drawOn(frame, 0, 13);
  const detail = drawOn(frame, 15, 10);
  const dim = drawOn(frame, IN * 0.72, 9);
  const L = 296;
  const R = 644;
  const CHEST = 232;

  return (
    <>
      {/* the garment, laid flat */}
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            <path
              d={`M 372 74
                  C 396 108 434 122 470 122
                  C 506 122 544 108 568 74
                  L 664 118 L 700 214 L ${R} 244 L ${R} 500
                  L ${L} 500 L ${L} 244 L 240 214 L 276 118 Z`}
              fill="#FFFFFF"
              strokeWidth={9 + e}
              {...draw(2400, flat)}
            />
            {/* hem and a patch pocket: garment detail, not ruled paper */}
            <line x1={L} y1={462} x2={R} y2={462} strokeWidth={5 + e} opacity={0.6}
              {...draw(R - L, detail)} />
            <path d={`M 430 316 L 510 316 L 510 396 L 430 396 Z M 430 336 L 510 336`}
              strokeWidth={5 + e} opacity={0.6} {...draw(420, detail)} />
          </g>
        )}
      />

      {/* THE red mark: the measurement being taken, edge to edge, flat. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <line x1={L} y1={CHEST} x2={R} y2={CHEST} {...draw(R - L, dim)} />
            <line x1={L} y1={CHEST - 28} x2={L} y2={CHEST + 28} {...draw(56, dim)} />
            <line x1={R} y1={CHEST - 28} x2={R} y2={CHEST + 28} {...draw(56, dim)} />
          </g>
        )}
      />
    </>
  );
};
