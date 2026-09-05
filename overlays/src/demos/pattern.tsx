import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {drawOn} from '../lib/motion';
import {DEMO_TIMING, Keylined, MARK} from './DemoFrame';

/**
 * The pattern-literacy demonstrations — the booklet-walkthrough chapters
 * (§4 rows 4, 5, 6 and 8), built as standalone animations in the same
 * sticker-cut register as the universal five.
 *
 * Drawn from the real thing: THE KIT DUFFLE BAG, US Letter edition. What a
 * Roughcut pattern page actually carries is a sheet, one alignment rectangle
 * inset half an inch on every side, and the grid reference set very large in
 * light grey behind the artwork — Helvetica Neue Black at 140pt on a 612pt
 * page, #d4d4d6. No corner bullseyes: the alignment IS that rectangle, plus
 * the printed lines matching across the join.
 *
 * The assembly rule, in the pattern's own words: "The left edge of the page on
 * the right overlaps the alignment line on the page to its left. Continue this
 * across the row. When starting the next row, those pages sit on top of the
 * row above." And the page order: letters across, numbers down — A1 top left,
 * B1 to its right, A2 directly below.
 */

const IN = DEMO_TIMING.in;
const draw = (len: number, p: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - p)});

/**
 * Inset of the alignment line from the page edge. Really half an inch of
 * eight and a half — about 6% of the page — drawn here at 9% so the line, and
 * the overlap that lands on it, survive being a fifteenth of a video frame.
 */
const BLEED = 26;
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
    /** Where the grid reference's baseline sits, as a fraction of page height. */
    labelAt?: number;
    stroke?: string;
    key?: string;
  } = {},
) => {
  const {darts = true, dartR = 13, content = true, ghost = false, label, labelAt = 0.62,
    stroke = '#3B2E22', key = 's'} = opts;
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
      {/* The alignment line: one solid hairline rectangle, half an inch in on
          every side. Solid, not dashed — that is how the pattern prints it,
          and it is the only alignment mark on the page. */}
      <rect
        x={bx} y={by} width={bw} height={bh}
        strokeWidth={4 + e}
        opacity={0.85}
        {...draw(2 * (bw + bh), p)}
      />
      {content ? rules(bx, by, bw, bh, e, p, `${key}r`) : null}
      {label ? (
        // Set the way the pattern sets it: very large, light, behind
        // everything, in the middle of the sheet. It is what makes a row of
        // tiled pages read as pages rather than as one wide rectangle.
        <text
          x={x + w / 2}
          y={y + h * labelAt}
          textAnchor="middle"
          fill={stroke}
          stroke="none"
          opacity={p * 0.22}
          fontFamily='"Liberation Sans", Helvetica, Arial, sans-serif'
          fontWeight={900}
          fontSize={w * 0.34}
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
 * Three Letter pages tile in left to right, each one's left edge landing ON
 * the alignment line of the page to its left — which is the pattern's own
 * instruction, word for word. The overlap therefore equals the alignment
 * inset exactly: the incoming page's edge and the outgoing page's line are
 * the same line, and that coincidence is the thing being taught. The red mark
 * is on it.
 *
 * The pattern panel runs across all three, unbroken. It is why the overlap has
 * to be right: butt the pages instead and the panel is wrong by the width of
 * two margins, which is what "if the printed lines don't match, the pattern
 * won't form correctly" means in practice.
 *
 * Labelled A1 B1 C1 across, not A1 A2 A3. Letters run horizontally and numbers
 * vertically — A1 top left, B1 to its right, A2 directly below.
 */
const PW = 280;
const PH = 362;
const OVERLAP = BLEED;
const GX = 60;
const GY = 82;
const pageX = (c: number) => GX + c * (PW - OVERLAP);
/** Where B1's left edge and A1's alignment line fall on top of each other. */
const JOIN = pageX(1);

export const TilingDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = drawOn(frame, 24, 16);
  const band = drawOn(frame, IN * 0.76, 9);

  return (
    <>
      {[0, 1, 2].map((c) => {
        // Each page arrives a beat after the last and slides in from the
        // right, so you watch its edge land on the line.
        const p = drawOn(frame, c * 6, 9);
        const dx = interpolate(p, [0, 1], [OVERLAP * 4, 0]);
        return (
          <g key={c} transform={`translate(${dx} 0)`} opacity={p}>
            <Keylined render={(s, e) => (
              <g fill="none" stroke={s}>
                {sheet(pageX(c), GY, PW, PH, e, p, {
                  darts: false,
                  content: false,
                  label: `${'ABC'[c]}1`,
                  labelAt: 0.88,
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
              d={`M 132 402 L 132 244 L 258 194
                  C 318 216 348 230 402 230
                  C 456 230 486 216 546 194
                  L 672 244 L 672 402 Z`}
              {...draw(2000, panel)}
            />
            {/* notches and grain line — pattern furniture, and what makes the
                continuity across the join legible. */}
            <path d="M 402 278 L 402 384 M 388 298 L 402 270 L 416 298 M 388 364 L 402 392 L 416 364"
              strokeWidth={5 + e} {...draw(300, panel)} />
            <path d="M 196 219 l 0 24 M 608 219 l 0 24" strokeWidth={5 + e} {...draw(52, panel)} />
          </g>
        )}
      />

      {/* THE red mark: B1's left edge, sitting on A1's alignment line. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <line x1={JOIN} y1={GY - 22} x2={JOIN} y2={GY + PH + 22} {...draw(PH + 44, band)} />
            <line x1={JOIN - 28} y1={GY - 22} x2={JOIN + 28} y2={GY - 22} {...draw(56, band)} />
          </g>
        )}
      />
    </>
  );
};

/* -------------------------------------------------------------- 2. PAGE ORDER */

/**
 * The assembly map, which is the thing printed on the Print & Assembly Guide:
 * letters across, numbers down. A1 is the top-left tile, B1 sits to its right,
 * A2 is directly below it. THE KIT is twelve wide and five down, sixty tiles,
 * which is also a fair answer to "how many pages is this".
 *
 * This replaces the alignment-darts demonstration. The spec's §8.2 line says
 * the corner bullseyes should sit on top of each other, but the pattern has no
 * corner bullseyes — every page carries exactly one alignment rectangle inset
 * half an inch, and nothing else. See NOTES.md; if another pattern in the
 * range does carry darts, BullseyeDemo is still in this file and still works.
 */
const COLS = 12;
const ROWS = 5;

export const PageOrderDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const grid = drawOn(frame, 0, 14);
  const marks = drawOn(frame, 18, 12);
  const first = drawOn(frame, IN * 0.76, 9);

  const CW = 64;
  const CH = CW * (11 / 8.5);
  const OX = 96;
  const OY = 96;
  const cx = (c: number) => OX + c * CW;
  const cy = (r: number) => OY + r * CH;
  const ref = (c: number, r: number, s: string, k: string, o = 0.28) => (
    <text key={k} x={cx(c) + CW / 2} y={cy(r) + CH * 0.64} textAnchor="middle"
      fill={s} stroke="none" opacity={grid * o}
      fontFamily='"Liberation Sans", Helvetica, Arial, sans-serif'
      fontWeight={900} fontSize={CW * 0.42}>
      {'ABCDEFGHIJKL'[c] + (r + 1)}
    </text>
  );

  return (
    <>
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            {/* the sheet the tiles are drawn on, so the map cuts out solid */}
            <rect x={OX} y={OY} width={CW * COLS} height={CH * ROWS}
              fill="#FFFFFF" strokeWidth={7 + e}
              {...draw(2 * (CW * COLS + CH * ROWS), grid)} />
            {Array.from({length: COLS - 1}).map((_, i) => (
              <line key={`v${i}`} x1={cx(i + 1)} y1={OY} x2={cx(i + 1)} y2={OY + CH * ROWS}
                strokeWidth={3 + e} opacity={0.45} {...draw(CH * ROWS, grid)} />
            ))}
            {Array.from({length: ROWS - 1}).map((_, i) => (
              <line key={`h${i}`} x1={OX} y1={cy(i + 1)} x2={OX + CW * COLS} y2={cy(i + 1)}
                strokeWidth={3 + e} opacity={0.45} {...draw(CW * COLS, grid)} />
            ))}
            {Array.from({length: COLS}).map((_, c) =>
              Array.from({length: ROWS}).map((_, r) => ref(c, r, s, `t${c}-${r}`)),
            )}
          </g>
        )}
      />

      {/* letters across, numbers down — the rule, drawn as the rule */}
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <path d={`M ${cx(0) + CW * 0.5} 62 L ${cx(3) + CW * 0.5} 62
                      M ${cx(3) + CW * 0.2} 48 L ${cx(3) + CW * 0.5} 62 L ${cx(3) + CW * 0.2} 76`}
              {...draw(280, marks)} />
            <path d={`M 60 ${cy(0) + CH * 0.5} L 60 ${cy(3) + CH * 0.5}
                      M 46 ${cy(3) + CH * 0.2} L 60 ${cy(3) + CH * 0.5} L 74 ${cy(3) + CH * 0.2}`}
              {...draw(300, marks)} />
          </g>
        )}
      />

      {/* THE red mark: A1, the tile you start from. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <rect x={cx(0)} y={cy(0)} width={CW} height={CH} {...draw(2 * (CW + CH), first)} />
          </g>
        )}
      />
    </>
  );
};

/* ---------------------------------------------------------------- 3. TEST SQUARE */

/**
 * The square is two inches on an eight-and-a-half inch page, so it is drawn at
 * two inches on an eight-and-a-half inch page: a quarter of the width, and no
 * bigger. Draw it larger and it stops being the thing the viewer is about to
 * hold a ruler against.
 *
 * In THE KIT the square is on tile C1, not on the first sheet out of the
 * printer — the guide's own "the 2 x 2 inch test square on Page 1" and the
 * pattern disagree. Labelled C1 here, which is where it is. See NOTES.md.
 */
export const TestSquareDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const page = drawOn(frame, 0, 11);
  const lines = drawOn(frame, 10, 10);
  const sq = drawOn(frame, 18, 10);
  const dim = drawOn(frame, IN * 0.7, 10);

  const PX = 286;
  const PY = 28;
  const PGW = 380;
  const PGH = PGW * (11 / 8.5);
  const S = PGW * (2 / 8.5);
  const X0 = PX + PGW / 2 - S / 2;
  const Y0 = PY + PGH * 0.26;

  return (
    <>
      <Keylined render={(s, e) => (
        <g fill="none" stroke={s}>
          {sheet(PX, PY, PGW, PGH, e, page, {
            darts: false, content: false, label: 'C1', labelAt: 0.88, stroke: s, key: 'T',
          })}
        </g>
      )} />

      {/* pattern lines, running off the sheet the way they really do */}
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={5 + e} opacity={0.55}>
            <line x1={PX - 10} y1={PY + PGH * 0.68} x2={PX + PGW + 10} y2={PY + PGH * 0.66}
              {...draw(PGW + 20, lines)} />
            <line x1={PX + PGW * 0.84} y1={PY - 10} x2={PX + PGW * 0.80} y2={PY + PGH + 10}
              {...draw(PGH + 20, lines)} />
          </g>
        )}
      />

      {/* the printed square */}
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            <rect x={X0} y={Y0} width={S} height={S} fill="#FFFFFF" strokeWidth={7 + e}
              {...draw(4 * S, sq)} />
          </g>
        )}
      />

      {/* THE red mark: two inches, measured. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={6 + e}>
            <line x1={X0} y1={Y0 + S + 44} x2={X0 + S} y2={Y0 + S + 44} {...draw(S, dim)} />
            <line x1={X0} y1={Y0 + S + 24} x2={X0} y2={Y0 + S + 64} {...draw(40, dim)} />
            <line x1={X0 + S} y1={Y0 + S + 24} x2={X0 + S} y2={Y0 + S + 64} {...draw(40, dim)} />
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
          {sheet(X4, TOP, A4W, HGT, e, a4, {darts: false, content: false, key: 'F4'})}
          {label(X4, 'A4', s, 'l4')}
        </g>
      )} />

      <Keylined render={(s, e) => (
        <g fill="none" stroke={s} opacity={us}>
          {sheet(XU, TOP, USW, HGT, e, us, {darts: false, content: false, key: 'FU'})}
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

/* ------------------------------------------------------- PARKED: ALIGNMENT DARTS */

/**
 * Two sheets, the second sliding until its corner bullseyes sit on the first
 * one's. Built to §8.2's `RC_POPUP_BULLSEYE` line and then parked, because THE
 * KIT has no corner bullseyes to align — its pages carry one alignment
 * rectangle and nothing else. Kept, not deleted: if another pattern in the
 * range does print darts, this goes back in the list in one line.
 */
export const BullseyeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 300;
  const H = 424;
  const AX = 60;
  const AY = 60;
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
            {sheet(BX, AY, W, H, e, b, {dartR: 24, label: 'B1', stroke: s, key: 'B'})}
          </g>
        )} />
      </g>
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <circle cx={AX + W - BLEED} cy={AY + BLEED} r={46} {...draw(2 * Math.PI * 46 + 20, hit)} />
          </g>
        )}
      />
    </>
  );
};
