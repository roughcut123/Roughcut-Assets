import React from 'react';
import {C, FONT} from '../chapters/design';
import {Banner, BannerSide} from './Banner';
import {Qr} from './qr';

export {FPS, H, TOTAL, W} from './Banner';

/**
 * THE HELP REMINDER — green cloth with a QR sewn to it.
 *
 * Two of these: one that opens a direct message, one that joins the community.
 * They are deliberately SEPATE assets on opposite corners of the screen rather
 * than two codes side by side, because two QR codes within a phone camera's
 * view at once is a coin toss over which one it grabs — and the two do very
 * different things.
 *
 * WHY THE CODE SITS ON A CREAM PATCH.
 *
 * It would be prettier to knock the white out and let the cloth show through
 * the code, and that is what was asked for. It is also the one change that
 * reliably breaks a QR. Scanners expect DARK MODULES ON A LIGHT GROUND;
 * inverted codes are decoded by some readers and not others, and a green-on-
 * green one would lose most of its contrast besides. So the code keeps its
 * polarity and gets integrated a different way — as a printed label patched
 * onto the cloth and topstitched down, which is a thing that actually exists on
 * a garment and gives the quiet zone somewhere to live.
 *
 * The modules are drawn from a matrix rather than scaled from a picture, so
 * the edges stay crisp at any size. See scripts/make-qr.py, which decodes every
 * code back before it is allowed into the build.
 */

const BAN_W = 920;
const BAN_H = 360;

/** WhatsApp's own greens, so it reads as WhatsApp at a glance. */
const CLOTH = '#0B5F52';
const DEEP = '#052F29';
const BRIGHT = '#25D366';
const SUBT = '#BFE6D6';
/** The label the code is printed on, and the ink it is printed in. */
const CARD = '#F3EEE2';
const INK = '#08312B';

/**
 * 260px, and that number is measured rather than chosen.
 *
 * At 216px the code decoded fine from a full 1080p frame and FAILED once the
 * frame was halved — so anyone watching in a small window or on a phone could
 * not scan it, which defeats the point of putting it there. 260px with error
 * correction M is the smallest combination that still reads at half size.
 */
const QR_SIZE = 260;

type Props = {
  qr: Qr;
  /** Two lines: at this banner width one line of it would not fit beside the
   *  code, and shrinking the type to make it fit loses the glance-read. */
  headline?: [string, string];
  sub?: string;
  caption?: string;
  side?: BannerSide;
  seed?: string;
};

export const WhatsAppDrop: React.FC<Props> = ({
  qr,
  headline = ['STUCK ON', 'YOUR BUILD?'],
  sub = 'Message me directly on WhatsApp',
  caption = 'SCAN TO CHAT',
  side = 'left',
  seed = 'W',
}) => (
  <Banner side={side} width={BAN_W} height={BAN_H} base={CLOTH} deep={DEEP} seed={seed}>
    {({x, y, w}) => {
      const cardX = x + w - QR_SIZE - 4;
      const cardY = y + 52;
      return (
        <>
          <rect x={x} y={y + 52} width={70} height={5} fill={BRIGHT} />

          {headline.map((l, i) => (
            <text
              key={i}
              x={x}
              y={y + 124 + i * 56}
              fontFamily={FONT}
              fontSize={52}
              fontWeight={700}
              fill={C.cream}
            >
              {l}
            </text>
          ))}

          <text x={x} y={y + 244} fontFamily={FONT} fontSize={28} fontWeight={400} fill={SUBT}>
            {sub}
          </text>

          {/* The chat mark, beside the caption rather than inside the code —
              a logo in the middle of a QR is survivable at this error
              correction level, but not worth the risk when it can sit here. */}
          <ChatMark x={x + 2} y={y + 290} s={28} colour={BRIGHT} />
          <text
            x={x + 40}
            y={y + 310}
            fontFamily={FONT}
            fontSize={24}
            fontWeight={700}
            letterSpacing={2}
            fill={BRIGHT}
          >
            {caption}
          </text>

          <QrPatch qr={qr} x={cardX} y={cardY} size={QR_SIZE} />
        </>
      );
    }}
  </Banner>
);

/**
 * The code, on a label stitched to the cloth.
 *
 * The quiet zone is FOUR MODULES on every side, which is the specification and
 * not a stylistic margin — a code crowded to its edge is a code that fails to
 * read. The label is sized from it rather than the other way round.
 */
const QrPatch: React.FC<{qr: Qr; x: number; y: number; size: number}> = ({qr, x, y, size}) => {
  const n = qr.modules.length;
  const QUIET = 4;
  /**
   * The module is a WHOLE NUMBER of pixels, and the code is centred on whatever
   * that leaves over.
   *
   * The first version divided the patch by the module count and got a
   * fractional size, then padded each rect by half a pixel to stop hairline
   * gaps opening between them under anti-aliasing. That padding makes every
   * dark module fractionally larger than every light one, and a decoder that
   * estimates module size from run lengths gets it wrong: the community code
   * would not read out of a full-size render at all, while the shorter direct
   * one did. On whole pixels the modules tile exactly, no padding is needed,
   * and both read.
   */
  const m = Math.max(1, Math.floor(size / (n + QUIET * 2)));
  const drawn = m * (n + QUIET * 2);
  const ox = x + Math.round((size - drawn) / 2);
  const oy = y + Math.round((size - drawn) / 2);
  const pad = 16;

  return (
    <g>
      {/* the patch, with its shadow on the cloth */}
      <rect x={x - pad + 3} y={y - pad + 5} width={size + pad * 2} height={size + pad * 2} rx={8}
        fill="#000000" opacity={0.3} />
      <rect x={x - pad} y={y - pad} width={size + pad * 2} height={size + pad * 2} rx={8} fill={CARD} />
      {/* Topstitched down, the way a label is. It sits OUTSIDE the code's quiet
          zone — the quiet zone is four modules of plain light ground and is
          part of the specification, not a margin to decorate. */}
      <rect
        x={x - pad + 6}
        y={y - pad + 6}
        width={size + pad * 2 - 12}
        height={size + pad * 2 - 12}
        rx={4}
        fill="none"
        stroke={INK}
        strokeWidth={1.6}
        strokeDasharray="6 5"
        opacity={0.4}
      />
      <g fill={INK} shapeRendering="crispEdges">
        {qr.modules.map((row, ry) =>
          row.map((v, rx) =>
            v ? (
              <rect
                key={`${rx}-${ry}`}
                x={ox + (rx + QUIET) * m}
                y={oy + (ry + QUIET) * m}
                width={m}
                height={m}
              />
            ) : null,
          ),
        )}
      </g>
    </g>
  );
};

/** A speech bubble. The universal "talk to someone" mark. */
const ChatMark: React.FC<{x: number; y: number; s: number; colour: string}> = ({x, y, s, colour}) => (
  <g transform={`translate(${x} ${y}) scale(${s / 32})`} fill={colour}>
    <path d="M16 0C7.2 0 0 6.3 0 14c0 4.3 2.3 8.2 5.9 10.7L4.4 32l7.9-3.6c1.2.2 2.4.3 3.7.3 8.8 0 16-6.3 16-14S24.8 0 16 0z" />
  </g>
);
