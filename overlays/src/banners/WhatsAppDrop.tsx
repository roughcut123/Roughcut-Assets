import React from 'react';
import {C, FONT} from '../chapters/design';
import {Banner, BannerSide, PAD} from './Banner';
import {MAX_MODULES, Qr} from './qr';

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

/**
 * The text column is fixed and the banner is sized around it: the longest line
 * ("Join the community and ask for help" at 28px) measures just under 480, and
 * a sub-heading that wraps or collides with the label is worse than a banner
 * that is 60px wider on one of the two.
 */
const TEXT_COL = 480;
const GAP = 28;
/** Rule to caption descender, measured off the layout below. */
const TEXT_H = 266;

/** WhatsApp's own greens, so it reads as WhatsApp at a glance. */
const CLOTH = '#0B5F52';
const DEEP = '#052F29';
const BRIGHT = '#25D366';
const SUBT = '#BFE6D6';
/** The label the code is printed on, and the ink it is printed in. */
const CARD = '#F3EEE2';
const INK = '#08312B';

/**
 * THE MODULE IS 8 SCREEN PIXELS, AND THE BANNER IS SIZED FROM THAT.
 *
 * The first version fixed the patch at 260px square and let the module size
 * fall out of the division, which is backwards. A wa.me link is a short
 * payload — version 2, 25 modules — so it landed on 7px modules. The community
 * invite is a 22-character code on a longer host, which is version 4, 33
 * modules, and the same 260px patch squeezed it to 6px. Two codes that look
 * identical at a glance, one of them a third finer than the other, and nothing
 * in the design saying so.
 *
 * That is the real problem here: not that the old one failed — decoded with
 * ZBar, which is what phone scanners are built on, it read at every size tested
 * — but that the module size was an accident of the URL. A longer link on a
 * future tutorial would have quietly shrunk it further with no warning.
 *
 * Fixing the MODULE and letting the patch and banner grow to suit removes that
 * whole class of bug, and measurably helps besides. Decoded out of a rendered
 * frame put through what a phone camera actually does to a screen — rescaled,
 * softened, tilted, with sensor noise:
 *
 *                            1920  1280   960   854
 *     invite, old   soft+12°   OK  FAIL  FAIL  FAIL
 *     invite, new   soft+12°   OK    OK    OK  FAIL
 *     direct, old   soft+12°   OK    OK  FAIL  FAIL
 *     direct, new   soft+12°   OK    OK    OK  FAIL
 *
 * Both now hold to 960 — someone watching in a windowed player — in poor
 * conditions, and to 640 in fair ones. Below that a phone cannot usefully scan
 * a screen anyway.
 *
 * 8px is the measured floor for that, not a number rounded up for comfort.
 *
 * THE LABEL IS THE SAME SIZE ON BOTH, and the module floats UP from 8 rather
 * than down. Sizing each banner to its own code made the two visibly different
 * objects, which is wrong for what is meant to read as one recurring piece of
 * furniture. So the label is sized for the LONGEST code the pair carries and
 * the shorter one simply gets fatter modules in the same square — 9px instead
 * of 8 for the direct link, which scans better still. If a future tutorial ever
 * needs a longer URL than today's community invite, the label grows with it and
 * the 8px floor holds; it can never be squeezed below.
 */
const MODULE = 8;
const QUIET = 4;

/**
 * The longest code the pair carries, emitted by make-qr.py alongside the codes
 * themselves. Sizing off this rather than off each code is what keeps the two
 * banners identical; deriving it rather than writing it down is what stops it
 * going stale the first time a link changes length.
 */
const PAIR_N = MAX_MODULES;

/** Cream round the code, outside the quiet zone, for the topstitching to sit on. */
const PATCH_PAD = 16;
/** Room above and below the patch inside the cloth. */
const V_MARGIN = 44;

/** The code, its quiet zone, and the cream border: the whole label. */
const patchSize = (n: number) =>
  (Math.max(n, PAIR_N) + QUIET * 2) * MODULE + PATCH_PAD * 2;

/** Whole pixels, never below the floor, and as large as the label allows. */
const moduleFor = (n: number) =>
  Math.max(MODULE, Math.floor((patchSize(n) - PATCH_PAD * 2) / (n + QUIET * 2)));

/**
 * Tall enough for the label, and never shorter than the text column beside it
 * (which bottoms out at 318 from the top of the cloth).
 */
export const bannerHeight = (qr: Qr) => Math.max(360, patchSize(qr.modules.length) + V_MARGIN * 2);

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

export const bannerWidth = (qr: Qr) =>
  PAD * 2 + TEXT_COL + GAP + patchSize(qr.modules.length);

export const WhatsAppDrop: React.FC<Props> = ({
  qr,
  headline = ['STUCK ON', 'YOUR BUILD?'],
  sub = 'Message me directly on WhatsApp',
  caption = 'SCAN TO CHAT',
  side = 'left',
  seed = 'W',
}) => {
  const patch = patchSize(qr.modules.length);
  const BAN_W = bannerWidth(qr);
  const BAN_H = bannerHeight(qr);

  return (
    <Banner side={side} width={BAN_W} height={BAN_H} base={CLOTH} deep={DEEP} seed={seed}>
      {({x, y, w}) => {
        /* Both blocks are centred on the cloth rather than hung from its top,
           because the two banners are now different heights and a fixed top
           offset would sit them differently on each. */
        const t0 = y + Math.round((BAN_H - TEXT_H) / 2);
        const py = y + Math.round((BAN_H - patch) / 2);
        return (
          <>
            <rect x={x} y={t0} width={70} height={5} fill={BRIGHT} />

            {headline.map((l, i) => (
              <text
                key={i}
                x={x}
                y={t0 + 72 + i * 56}
                fontFamily={FONT}
                fontSize={52}
                fontWeight={700}
                fill={C.cream}
              >
                {l}
              </text>
            ))}

            <text x={x} y={t0 + 192} fontFamily={FONT} fontSize={28} fontWeight={400} fill={SUBT}>
              {sub}
            </text>

            {/* The chat mark, beside the caption rather than inside the code —
                a logo in the middle of a QR is survivable at this error
                correction level, but not worth the risk when it can sit here. */}
            <ChatMark x={x + 2} y={t0 + 238} s={28} colour={BRIGHT} />
            <text
              x={x + 40}
              y={t0 + 258}
              fontFamily={FONT}
              fontSize={24}
              fontWeight={700}
              letterSpacing={2}
              fill={BRIGHT}
            >
              {caption}
            </text>

            <QrPatch qr={qr} x={x + w - patch} y={py} />
          </>
        );
      }}
    </Banner>
  );
};

/**
 * The code, on a label stitched to the cloth.
 *
 * The quiet zone is FOUR MODULES on every side, which is the specification and
 * not a stylistic margin — a code crowded to its edge is a code that fails to
 * read. The label is sized from it rather than the other way round.
 */
const QrPatch: React.FC<{qr: Qr; x: number; y: number}> = ({qr, x, y}) => {
  const n = qr.modules.length;
  const side = patchSize(n);
  /* The modules land on whole pixels by construction now: MODULE is an integer
     and the patch is built up from it, so nothing has to be padded to close
     hairline gaps. That padding was itself a bug once — it made every dark
     module fractionally larger than every light one, and a decoder estimating
     module size from run lengths got it wrong. */
  const m = moduleFor(n);
  /* A shorter code does not fill the fixed label exactly, so centre what it
     does use on whatever whole pixels are left over. */
  const inset = Math.round((side - (n + QUIET * 2) * m) / 2);
  const ox = x + inset + QUIET * m;
  const oy = y + inset + QUIET * m;

  return (
    <g>
      {/* the patch, with its shadow on the cloth */}
      <rect x={x + 3} y={y + 5} width={side} height={side} rx={8} fill="#000000" opacity={0.3} />
      <rect x={x} y={y} width={side} height={side} rx={8} fill={CARD} />
      {/* Topstitched down, the way a label is. It sits OUTSIDE the code's quiet
          zone — the quiet zone is four modules of plain light ground and is
          part of the specification, not a margin to decorate. */}
      <rect
        x={x + 6}
        y={y + 6}
        width={side - 12}
        height={side - 12}
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
                x={ox + rx * m}
                y={oy + ry * m}
                width={m}
                height={m}
              />
            ) : null,
          ),
        )}
      </g>
      {qr.placeholder ? <NotReal x={x} y={y} side={side} /> : null}
    </g>
  );
};

/**
 * Stamped across a code that points nowhere yet.
 *
 * The codes are baked into the frames, so a banner rendered before the real
 * links arrive looks utterly finished and is not. This is the only thing
 * standing between that and an editor dropping it into the cut, so it is
 * deliberately ugly and deliberately covers the code: a sample that still
 * scanned would be worse than one that does not.
 */
const NotReal: React.FC<{x: number; y: number; side: number}> = ({x, y, side}) => (
  <g>
    <rect x={x} y={y} width={side} height={side} rx={8} fill="#B3261E" opacity={0.82} />
    <text
      x={x + side / 2}
      y={y + side / 2 - 10}
      textAnchor="middle"
      fontFamily={FONT}
      fontSize={40}
      fontWeight={700}
      letterSpacing={2}
      fill="#FFFFFF"
    >
      SAMPLE
    </text>
    <text
      x={x + side / 2}
      y={y + side / 2 + 34}
      textAnchor="middle"
      fontFamily={FONT}
      fontSize={22}
      fontWeight={700}
      letterSpacing={1}
      fill="#FFFFFF"
    >
      NOT A REAL CODE
    </text>
  </g>
);

/** A speech bubble. The universal "talk to someone" mark. */
const ChatMark: React.FC<{x: number; y: number; s: number; colour: string}> = ({x, y, s, colour}) => (
  <g transform={`translate(${x} ${y}) scale(${s / 32})`} fill={colour}>
    <path d="M16 0C7.2 0 0 6.3 0 14c0 4.3 2.3 8.2 5.9 10.7L4.4 32l7.9-3.6c1.2.2 2.4.3 3.7.3 8.8 0 16-6.3 16-14S24.8 0 16 0z" />
  </g>
);
