import React from 'react';
import {random} from 'remotion';
import {CANVAS_H, CANVAS_W} from '../lib/spec';
import {
  Swarm, Sweep, COVER_R, CELL_W, CELL_H,
  INK, PAPER, DEEP, INDIGO, GOLD, COPPER, BACK,
} from './jacket';
import {Adjuster, Buckle, Burr, CinchStrap, FlapPocket, Patch, Pocket, Rivet, TackButton} from './hardware';
import {Bartack, Topstitch} from './denim';
import type {JacketProps} from './jacket';

const CLOTH = 'var(--rc-indigo)';

/**
 * The ten. Each is a skin on one of the two engines, so coverage and the
 * sticker cut come for free and the work is all in the picture.
 */

/* ---------------------------------------------------------------- 1. RIVETS */

/** Copper rivets set into the frame — thrown from every side, barely spinning,
 *  because a rivet is hammered home rather than tossed. */
export const RivetsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={10}
    ground={PAPER}
    throwFrom={(i, s) => {
      const a = random(`${s}-a${i}`) * Math.PI * 2;
      return [Math.cos(a) * CANVAS_W * 0.8, Math.sin(a) * CANVAS_H * 0.9];
    }}
    piece={{render: (i, s) => (
      <g>
        <Rivet r={150 + random(`${s}-p${i}`) * 170} />
      </g>
    )}}
  />
);

/* --------------------------------------------------------------- 2. BUTTONS */

/** 20mm tack buttons tumbling in from above and packing the frame. */
export const ButtonsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={140}
    ground={PAPER}
    throwFrom={(i, s) => [(random(`${s}-x${i}`) - 0.5) * CANVAS_W * 0.5, -CANVAS_H * (1 + random(`${s}-y${i}`))]}
    piece={{render: (i, s) => (
      <TackButton r={155 + random(`${s}-p${i}`) * 145} />
    )}}
  />
);

/* -------------------------------------------------------------- 3. HARDWARE */

/** The hardware drawer tipped out: buckles, adjusters, burrs and rivets. */
export const HardwareMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={95}
    ground={PAPER}
    throwFrom={(i, s) => [
      (i % 2 ? 1 : -1) * CANVAS_W * (0.75 + random(`${s}-x${i}`) * 0.5),
      (random(`${s}-y${i}`) - 0.5) * CANVAS_H * 0.7,
    ]}
    piece={{render: (i, s, cloth) => {
      const r = 145 + random(`${s}-p${i}`) * 160;

      // Weighted, not uniform: a hardware drawer is mostly buckles and
      // adjusters with a few rivets rolling about, and an even split of four
      // kinds left the frame looking like a tray of washers.
      const k = random(`${s}-k${i}`);
      if (k < 0.32) return <Buckle r={r * 1.25} />;
      if (k < 0.58) return <Adjuster r={r * 1.2} />;
      if (k < 0.8) return <CinchStrap r={r * 0.95} cloth={cloth} />;
      if (k < 0.93) return <Rivet r={r * 0.8} />;
      return <Burr r={r * 0.9} />;
    }}}
  />
);

/* --------------------------------------------------------------- 4. POCKETS */

/** Patch pockets flying about and settling — cut, hemmed, bartacked. */
export const PocketsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={70}
    ground={DEEP}
    throwFrom={(i, s) => {
      const side = i % 3;
      const d = 0.85 + random(`${s}-d${i}`) * 0.6;
      if (side === 0) return [-CANVAS_W * d, -CANVAS_H * 0.4];
      if (side === 1) return [CANVAS_W * d, CANVAS_H * 0.35];
      return [(random(`${s}-x${i}`) - 0.5) * CANVAS_W, CANVAS_H * d];
    }}
    piece={{render: (i, s, cloth) =>
      i % 3 === 0 ? (
        <FlapPocket r={175 + random(`${s}-p${i}`) * 135} cloth={cloth} />
      ) : (
        <Pocket r={175 + random(`${s}-p${i}`) * 135} cloth={cloth} />
      )
    }}
  />
);

/* ---------------------------------------------------------------- 5. PANELS */

/**
 * The Keystone's cut pieces, drawn from the photographs: the front with its
 * flap pocket and welt, the back with its curved yoke and cinch, the collar,
 * the cuff. Cartooned — flat colour, heavy outline — but the details are the
 * garment's own, which is what makes a shape read as a jacket panel rather
 * than as a blob with an arrow on it.
 *
 * The tell in every photograph is the topstitch: double rows of ochre, three
 * on the yoke and the pocket mouth. Everything else is secondary.
 */
const PanelFront: React.FC<{cloth: string}> = ({cloth}) => {
  const body = `M -175 -300 L 40 -300 C 58 -222 100 -180 175 -164 L 175 300 L -175 300 Z`;
  return (
    <g>
      <path d={body} fill={cloth} stroke={INK} strokeWidth={10} />
      {/* yoke seam across the chest */}
      <Topstitch d="M -175 -60 H 175" gap={14} w={6} />
      {/* the placket, down the centre front */}
      <Topstitch d="M -120 -60 V 300" gap={16} w={6} />
      <g transform="translate(52 44) scale(0.62)">
        <FlapPocket r={170} cloth={cloth} />
      </g>
      {/* welt pocket */}
      <g transform="translate(-92 150) rotate(-8)">
        <rect x={-16} y={-62} width={32} height={124} fill={INK} opacity={0.55} stroke={INK} strokeWidth={5} />
        <Topstitch d="M -22 -68 H 22 V 68 H -22 Z" rows={1} gap={0} w={5} />
      </g>
    </g>
  );
};

const PanelBack: React.FC<{cloth: string}> = ({cloth}) => {
  const body = `M -120 -300 C -55 -318 55 -318 120 -300 L 178 -232 C 194 -170 198 -110 198 -52
                L 192 300 L -192 300 L -198 -52 C -198 -110 -194 -170 -178 -232 Z`;
  return (
    <g>
      <path d={body} fill={cloth} stroke={INK} strokeWidth={10} />
      {/* the curved yoke — the signature seam on the back of this jacket */}
      <Topstitch d="M -190 -140 C -108 -206 -56 -172 0 -104 C 56 -172 108 -206 190 -140" gap={15} w={6} />
      <Bartack x={-118} y={-146} s={22} />
      <Bartack x={118} y={-146} s={22} />
      <Bartack x={0} y={-104} s={22} />
      {/* centre pleat */}
      <path d="M -62 -96 V 300 M 62 -96 V 300" fill="none" stroke={INK} strokeWidth={6} opacity={0.55} />
      <g transform="translate(0 178) scale(0.66)">
        <CinchStrap r={190} cloth={cloth} />
      </g>
    </g>
  );
};

const PanelCollar: React.FC<{cloth: string}> = ({cloth}) => {
  const body = `M -270 -60 C -170 -112 170 -112 270 -60 L 250 10 L 130 96 L 0 60 L -130 96 L -250 10 Z`;
  return (
    <g>
      <path d={body} fill={cloth} stroke={INK} strokeWidth={10} />
      <Topstitch d="M -238 -22 L 232 -22" gap={0} rows={1} w={6} />
      <Topstitch d="M -232 4 L -122 76 L 0 42 L 122 76 L 232 4" gap={14} w={6} />
    </g>
  );
};

const PanelCuff: React.FC<{cloth: string}> = ({cloth}) => {
  const body = `M -230 -78 H 230 V 78 H -230 Z`;
  return (
    <g>
      <path d={body} fill={cloth} stroke={INK} strokeWidth={10} />
      <Topstitch d="M -206 -54 H 206 V 54 H -206 Z" gap={14} w={5} />
      <g transform="translate(120 0) scale(0.9)">{/* the tack button */}
        <g transform="scale(1)"><TackButton r={38} /></g>
      </g>
      {/* keyhole buttonhole */}
      <g transform="translate(-118 0)">
        <rect x={-9} y={-34} width={18} height={68} rx={9} fill={INK} opacity={0.7} />
        <rect x={-15} y={-40} width={30} height={80} rx={15} fill="none" stroke="var(--rc-gold)" strokeWidth={7} />
      </g>
    </g>
  );
};

const PANEL_KINDS = [PanelFront, PanelBack, PanelCollar, PanelCuff, PanelFront, PanelBack];

export const PanelsMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={26}
    ground={PAPER}
    throwFrom={(i, s) => [
      (random(`${s}-x${i}`) - 0.5) * 2 * CANVAS_W * 0.8,
      (random(`${s}-y${i}`) - 0.5) * 2 * CANVAS_H * 0.8,
    ]}
    piece={{render: (i, s, cloth) => {
      const Kind = PANEL_KINDS[i % PANEL_KINDS.length];
      const k = 0.72 + random(`${s}-p${i}`) * 0.5;
      return (
        <g transform={`scale(${k})`}>
          <Kind cloth={cloth} />
        </g>
      );
    }}}
  />
);

/* ------------------------------------------------------------ 6. CHAINSTITCH */

/**
 * The chainstitch that closes a felled seam.
 *
 * The first pass drew the seam as two dashed lines and it read as a ruled
 * page. A felled seam has a shape you can see from a metre away: the fold is
 * a raised ridge with a shadow under it, the two rows of topstitch sit either
 * side of the fold rather than on it, and the underside chain is a row of
 * interlocking LOOPS, not dashes — that loop is the reason a chainstitch is
 * worth showing at all.
 */
export const ChainstitchMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-3}
    fill={(x0, x1, _s, cloth) => {
      const pitch = 380;
      const rows = Math.ceil((CANVAS_H + 1000) / pitch);
      const loop = 58;
      return (
        <g>
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={cloth} />
          {Array.from({length: rows}).map((_, r) => {
            const y = -500 + r * pitch;
            // The chain, built once per row as a single path of half-circles
            // alternating above and below the seam line.
            let chain = `M ${x0} ${y + 92}`;
            for (let x = x0; x < x1; x += loop) {
              chain += ` a ${loop / 2} ${loop / 2} 0 0 1 ${loop} 0`;
            }
            let chain2 = `M ${x0} ${y + 92}`;
            for (let x = x0; x < x1; x += loop) {
              chain2 += ` a ${loop / 2} ${loop / 2} 0 0 0 ${loop} 0`;
            }
            return (
              <g key={r}>
                {/* the fold, raised: a light lip with its shadow beneath */}
                <rect x={x0} y={y - 16} width={x1 - x0} height={16} fill={PAPER} opacity={0.1} />
                <rect x={x0} y={y} width={x1 - x0} height={26} fill={INK} opacity={0.3} />
                {/* the two rows of topstitch, either side of the fold */}
                <line x1={x0} y1={y - 30} x2={x1} y2={y - 30} stroke={GOLD} strokeWidth={11}
                  strokeDasharray="46 26" strokeLinecap="round" />
                <line x1={x0} y1={y + 46} x2={x1} y2={y + 46} stroke={GOLD} strokeWidth={11}
                  strokeDasharray="46 26" strokeLinecap="round" />
                {/* the chain on the underside, one row below */}
                <g fill="none" stroke={GOLD} strokeWidth={9} opacity={0.9}>
                  <path d={chain} />
                  <path d={chain2} />
                </g>
              </g>
            );
          })}
        </g>
      );
    }}
  />
);

/* ------------------------------------------------------------- 7. INDIGO DIP */

/**
 * Rope-dyed indigo. The yarn goes through the vat six or eight times and comes
 * out a shade darker each pass, oxidising between dips — so the picture is a
 * STACK of flat tones getting deeper, with a hard line where each dip stopped,
 * not a blur. The first pass drew random pale streaks over a flat ground and
 * looked like motion blur; these are stepped bands with a bloom of oxidation
 * along the top of each one.
 */
export const IndigoMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-6}
    fill={(x0, x1, s, cloth) => {
      const bands = 9;
      const pitch = (CANVAS_H + 1000) / bands;
      return (
        <g>
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={cloth} />
          {/* Restore the hue the deepened cloth loses: the shared denim paint
              is knocked back with warm ink so that pockets read against paper,
              and across a whole frame that reads as slate rather than blue. */}
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={CLOTH} opacity={0.62} />
          {Array.from({length: bands}).map((_, i) => {
            // Deepest at the top, lifting toward the bottom: the cloth is
            // coming up out of the vat, so the last dip is the darkest.
            // ABSOLUTE, not cumulative. The first version let every band run
            // 600px past its own pitch, so nine translucent slabs stacked and
            // the frame came out black. Each slice now carries its own tone
            // and stops where the next one starts.
            //
            // And the tone works in BOTH directions from the base cloth. Only
            // darkening it made every band a shade of the same near-black,
            // because the ground is already deep; a dip chart has to run from
            // the pale first dip up to the last, so the early bands lighten.
            //
            // One direction only, and always downward from pure indigo. Both
            // earlier attempts lightened the pale end — first with paper, then
            // with fresco — and both turned the frame grey, because every
            // light token in §3.2 is warm or desaturated and neither survives
            // being laid over blue. The chart therefore starts at the token
            // itself, undimmed, and only ever deepens: which is also what a
            // dip chart is, since the yarn starts undyed-pale and every pass
            // takes it further down.
            const t = i / (bands - 1);
            const depth = t * 0.55;
            const y = -500 + i * pitch;
            const wobble = 26 + random(`${s}-w${i}`) * 34;
            const nextWobble = 26 + random(`${s}-w${i + 1}`) * 34;
            // The dip line is not straight — the cloth hangs unevenly.
            const line =
              `M ${x0} ${y + wobble} C ${x0 + (x1 - x0) * 0.3} ${y - wobble * 0.6},` +
              ` ${x0 + (x1 - x0) * 0.66} ${y + wobble * 1.4}, ${x1} ${y}` +
              ` V ${y + pitch} C ${x0 + (x1 - x0) * 0.66} ${y + pitch + nextWobble * 1.4},` +
              ` ${x0 + (x1 - x0) * 0.3} ${y + pitch - nextWobble * 0.6}, ${x0} ${y + pitch + nextWobble} Z`;
            return (
              <g key={i}>
                <path d={line} fill={INK} opacity={depth} />
                {/* oxidation: where the dye met the air it went a shade green-gold */}
                <path
                  d={`M ${x0} ${y + wobble} C ${x0 + (x1 - x0) * 0.3} ${y - wobble * 0.6}, ${x0 + (x1 - x0) * 0.66} ${y + wobble * 1.4}, ${x1} ${y}`}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth={11}
                  opacity={0.3}
                />
              </g>
            );
          })}
          {/* the rope marks: vertical, because the rope hangs vertically */}
          {Array.from({length: 16}).map((_, i) => {
            const x = x0 + random(`${s}-rx${i}`) * (x1 - x0);
            return (
              <line key={`r${i}`} x1={x} y1={-500} x2={x} y2={CANVAS_H + 500} stroke={PAPER}
                strokeWidth={14 + random(`${s}-rw${i}`) * 30}
                opacity={0.03 + random(`${s}-ro${i}`) * 0.045} />
            );
          })}
        </g>
      );
    }}
  />
);

/* --------------------------------------------------------------- 8. SELVEDGE */

/**
 * Widths of selvedge denim laid one over the next.
 *
 * The first pass made the selvedge a fat white stripe and it took over the
 * frame; on a real bolt the finished edge is about a centimetre on a
 * seventy-five centimetre width, so it has to stay a narrow band or the
 * proportion is a lie. What makes it read at speed instead is the DETAIL on
 * that band: the dotted red ID line down the middle, the fringed weft ends
 * poking out of the edge, and the shadow of the next width lying on top of it.
 */
export const SelvedgeMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-5}
    fill={(x0, x1, s, cloth) => {
      const pitch = 470;
      const rows = Math.ceil((CANVAS_H + 1000) / pitch);
      const band = 40;
      const step = 34;
      return (
        <g>
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={cloth} />
          {Array.from({length: rows}).map((_, r) => {
            const y = -500 + r * pitch;
            return (
              <g key={r}>
                {/* the width above lies on top of this one and shadows it */}
                <rect x={x0} y={y - 26} width={x1 - x0} height={26} fill={INK} opacity={0.3} />
                {/* the undyed finished edge */}
                <rect x={x0} y={y} width={x1 - x0} height={band} fill={PAPER} opacity={0.92} />
                {/* fringed weft ends, hanging off the bottom of the edge */}
                <g stroke={PAPER} strokeWidth={4} opacity={0.5} strokeLinecap="round">
                  {Array.from({length: Math.ceil((x1 - x0) / step)}).map((_, i) => {
                    const x = x0 + i * step;
                    return (
                      <line
                        key={i}
                        x1={x}
                        y1={y + band}
                        x2={x + 5}
                        y2={y + band + 10 + random(`${s}-f${r}-${i}`) * 20}
                      />
                    );
                  })}
                </g>
                <line x1={x0} y1={y} x2={x1} y2={y} stroke={INK} strokeWidth={4} opacity={0.4} />
                <line x1={x0} y1={y + band} x2={x1} y2={y + band} stroke={INK} strokeWidth={4} opacity={0.35} />
                {/* the ID line woven down the middle of the edge */}
                <line x1={x0} y1={y + band / 2} x2={x1} y2={y + band / 2} stroke="var(--rc-annotation)"
                  strokeWidth={11} strokeDasharray="8 15" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      );
    }}
  />
);

/* ----------------------------------------------------------------- 9. THREAD */

/** Gold topstitch thread unspooling across the frame in long loops. */
export const ThreadMech: React.FC<JacketProps> = ({seed}) => (
  <Sweep
    seed={seed}
    tilt={-2}
    fill={(x0, x1, s, cloth) => {
      const rows = Math.ceil((CANVAS_H + 1000) / 118);
      return (
        <g>
          <rect x={x0} y={-500} width={x1 - x0} height={CANVAS_H + 1000} fill={cloth} />
          {Array.from({length: rows}).map((_, r) => {
            const y = -500 + r * 118;
            const amp = 26 + random(`${s}-a${r}`) * 22;
            const step = 150;
            let d = `M ${x0} ${y}`;
            for (let x = x0; x < x1; x += step) {
              d += ` q ${step / 2} ${r % 2 ? amp : -amp} ${step} 0`;
            }
            const wt = 13 + random(`${s}-w${r}`) * 9;
            return (
              <g key={r}>
                {/* the shadow the thread casts, down and right like everything else */}
                <path d={d} fill="none" stroke={INK} strokeWidth={wt} opacity={0.3}
                  transform="translate(5 7)" />
                <path d={d} fill="none" stroke={GOLD} strokeWidth={wt} />
                {/* the twist catching the light along the top of the strand */}
                <path d={d} fill="none" stroke={PAPER} strokeWidth={wt * 0.28} opacity={0.35}
                  transform={`translate(-2 ${-wt * 0.26})`} />
              </g>
            );
          })}
        </g>
      );
    }}
  />
);

/* ------------------------------------------------------------------ 10. PATCH */

/** The leather patch stamped onto the frame: it lands small, presses out to
 *  full size, holds, and is lifted away. A press, not a slide (§3.5). */
export const PatchMech: React.FC<JacketProps> = ({seed}) => (
  <Swarm
    seed={seed}
    spin={16}
    ground={DEEP}
    throwFrom={(i, s) => [
      (random(`${s}-x${i}`) - 0.5) * CANVAS_W * 0.35,
      -CANVAS_H * (0.6 + random(`${s}-y${i}`) * 0.6),
    ]}
    piece={{render: (i, s) => (
      <Patch r={165 + random(`${s}-p${i}`) * 145} />
    )}}
  />
);
