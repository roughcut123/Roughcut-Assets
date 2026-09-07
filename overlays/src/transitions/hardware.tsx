import React from 'react';
import {Bartack, BRASS, brassFace, Forged, INK, Lift, OCHRE, Topstitch} from './denim';

/**
 * HERITAGE DENIM HARDWARE AND CUT PIECES, drawn from the Keystone photographs.
 *
 * Cartooned, not traced: flat colour, heavy outline, no gradients (§3.4). What
 * makes them read is that the details are the RIGHT details — brass rather
 * than steel, double ochre topstitch rather than a single gold line, X-in-a-box
 * bartacks at the stress points, and pocket mouths that come to a V.
 *
 * Everything scales off a nominal radius r so one number drops a piece into a
 * covering grid.
 */

export type PieceProps = {r: number; ink?: string; fill?: string; seed?: string};

/**
 * Copper rivet: the burr it is set against showing as a ring behind, the
 * domed face over it, and the shadow the dome throws onto the burr. A rivet
 * photographed on cloth always has that ring — the first pass left it off and
 * the result was a coin lying flat.
 */
export const Rivet: React.FC<PieceProps> = ({r}) => (
  <g>
    <circle cx={0} cy={0} r={r * 1.2} fill={INK} opacity={0.18} />
    <circle cx={r * 0.05} cy={r * 0.07} r={r * 1.14} fill={BRASS} />
    <circle cx={r * 0.05} cy={r * 0.07} r={r * 1.14} fill={INK} opacity={0.3} />
    <circle cx={0} cy={0} r={r * 1.14} fill="none" stroke={INK} strokeWidth={r * 0.07} />
    {brassFace(r)}
  </g>
);

/** 20mm tack button — domed brass, knurled rim, recessed dark centre. */
export const TackButton: React.FC<PieceProps> = ({r}) => (
  <g>
    {/* the dome, lit up and to the left like every other piece of brass */}
    <circle cx={0} cy={0} r={r} fill={INK} opacity={0.5} />
    <circle cx={-r * 0.055} cy={-r * 0.075} r={r * 0.965} fill={BRASS} />
    <circle cx={-r * 0.13} cy={-r * 0.17} r={r * 0.62} fill="var(--rc-paper)" opacity={0.2} />
    {Array.from({length: 36}).map((_, i) => {
      const a = (i / 36) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={Math.cos(a) * r * 0.84}
          y1={Math.sin(a) * r * 0.84}
          x2={Math.cos(a) * r * 0.97}
          y2={Math.sin(a) * r * 0.97}
          stroke={INK}
          strokeWidth={r * 0.04}
          opacity={0.5}
        />
      );
    })}
    <circle cx={0} cy={0} r={r * 0.62} fill="none" stroke={INK} strokeWidth={r * 0.05} opacity={0.5} />
    <circle cx={0} cy={0} r={r * 0.34} fill={INK} opacity={0.7} />
    <circle cx={0} cy={0} r={r * 0.15} fill={INK} />
    <path
      d={`M ${-r * 0.5} ${-r * 0.27} A ${r * 0.57} ${r * 0.57} 0 0 1 ${-r * 0.16} ${-r * 0.55}`}
      fill="none"
      stroke="var(--rc-paper)"
      strokeWidth={r * 0.09}
      strokeLinecap="round"
      opacity={0.6}
    />
    <circle cx={0} cy={0} r={r} fill="none" stroke={INK} strokeWidth={r * 0.1} />
  </g>
);

/**
 * Cinch buckle. The first pass drew a square frame with a square hole and it
 * read as a picture frame. A buckle is bent wire: the corners are round, and
 * the prong is a tapered spike that overhangs the front edge — that overhang
 * is the whole silhouette, and without it the shape is just a rectangle.
 */
export const Buckle: React.FC<PieceProps> = ({r}) => {
  const w = r * 1.6;
  const h = r * 1.22;
  const t = r * 0.19;
  const ro = r * 0.3;
  const ri = Math.max(1, ro - t);
  const frame =
    `M ${-w / 2 + ro} ${-h / 2} H ${w / 2 - ro} A ${ro} ${ro} 0 0 1 ${w / 2} ${-h / 2 + ro}` +
    ` V ${h / 2 - ro} A ${ro} ${ro} 0 0 1 ${w / 2 - ro} ${h / 2} H ${-w / 2 + ro}` +
    ` A ${ro} ${ro} 0 0 1 ${-w / 2} ${h / 2 - ro} V ${-h / 2 + ro}` +
    ` A ${ro} ${ro} 0 0 1 ${-w / 2 + ro} ${-h / 2} Z` +
    `M ${-w / 2 + t + ri} ${-h / 2 + t} A ${ri} ${ri} 0 0 0 ${-w / 2 + t} ${-h / 2 + t + ri}` +
    ` V ${h / 2 - t - ri} A ${ri} ${ri} 0 0 0 ${-w / 2 + t + ri} ${h / 2 - t}` +
    ` H ${w / 2 - t - ri} A ${ri} ${ri} 0 0 0 ${w / 2 - t} ${h / 2 - t - ri}` +
    ` V ${-h / 2 + t + ri} A ${ri} ${ri} 0 0 0 ${w / 2 - t - ri} ${-h / 2 + t} Z`;
  const bar = `M ${-t / 2} ${-h / 2 + t} h ${t} v ${h - t * 2} h ${-t} Z`;
  const py = r * 0.115;
  const tip = -w / 2 - r * 0.16;
  const prong =
    `M ${r * 0.1} ${-py * 1.5} L ${-w / 2 + t * 0.4} ${-py} L ${tip} 0` +
    ` L ${-w / 2 + t * 0.4} ${py} L ${r * 0.1} ${py * 1.5} Z`;
  return (
    <g>
      <Forged d={frame} r={r} />
      <Forged d={bar} r={r} rule="nonzero" />
      <Forged d={prong} r={r} rule="nonzero" />
    </g>
  );
};

/** Slide adjuster — the other half of a cinch back, a double-barred loop.
 *  Rounded like the buckle: bent wire has no square corners. */
export const Adjuster: React.FC<PieceProps> = ({r}) => {
  const w = r * 1.75;
  const h = r * 1.0;
  const t = r * 0.16;
  const ro = r * 0.24;
  const ri = Math.max(1, ro - t);
  const round = (x: number, y: number, ww: number, hh: number, rr: number, cw: boolean) => {
    const f = cw ? 1 : 0;
    return (
      `M ${x + rr} ${y} H ${x + ww - rr} A ${rr} ${rr} 0 0 ${f} ${x + ww} ${y + rr}` +
      ` V ${y + hh - rr} A ${rr} ${rr} 0 0 ${f} ${x + ww - rr} ${y + hh}` +
      ` H ${x + rr} A ${rr} ${rr} 0 0 ${f} ${x} ${y + hh - rr}` +
      ` V ${y + rr} A ${rr} ${rr} 0 0 ${f} ${x + rr} ${y} Z`
    );
  };
  const d =
    round(-w / 2, -h / 2, w, h, ro, true) +
    // the two windows, wound the other way so evenodd punches them out
    round(-w / 2 + t, -h / 2 + t, w / 2 - t * 1.5, h - t * 2, ri, false) +
    round(t / 2, -h / 2 + t, w / 2 - t * 1.5, h - t * 2, ri, false);
  return <Forged d={d} r={r} />;
};

/** Burr — the washer the rivet sets against. */
export const Burr: React.FC<PieceProps> = ({r}) => (
  <g>
    <circle cx={0} cy={0} r={r * 0.55} fill={INK} opacity={0.5} />
    <circle cx={-r * 0.03} cy={-r * 0.04} r={r * 0.53} fill={BRASS} />
    <circle cx={-r * 0.07} cy={-r * 0.09} r={r * 0.36} fill="var(--rc-paper)" opacity={0.18} />
    <circle cx={0} cy={0} r={r * 0.17} fill={INK} />
    <circle cx={0} cy={0} r={r * 0.55} fill="none" stroke={INK} strokeWidth={r * 0.09} />
  </g>
);

/**
 * The patch pocket off the Keystone front: square mouth, V-pointed base, and
 * the triple ochre V across the face. Bartacked at both top corners.
 */
export const Pocket: React.FC<PieceProps & {cloth: string}> = ({r, cloth}) => {
  const w = r * 1.55;
  const h = r * 1.8;
  const vy = h / 2 - w * 0.34;
  const body = `M ${-w / 2} ${-h / 2} H ${w / 2} V ${vy} L 0 ${h / 2} L ${-w / 2} ${vy} Z`;
  return (
    <g>
      <Lift d={body} r={r} />
      <path d={body} fill={cloth} stroke={INK} strokeWidth={r * 0.085} />
      <Topstitch d={body} gap={r * 0.07} w={r * 0.035} dash={`${r * 0.09} ${r * 0.055}`} />
      {/* the V across the face, three rows of it */}
      <Topstitch
        d={`M ${-w / 2 + r * 0.16} ${-h * 0.1} L 0 ${h * 0.16} L ${w / 2 - r * 0.16} ${-h * 0.1}`}
        gap={r * 0.09}
        rows={3}
        w={r * 0.038}
        dash={`${r * 0.09} ${r * 0.055}`}
      />
      <Bartack x={-w / 2 + r * 0.12} y={-h / 2 + r * 0.12} s={r * 0.2} />
      <Bartack x={w / 2 - r * 0.12} y={-h / 2 + r * 0.12} s={r * 0.2} />
    </g>
  );
};

/** The flap pocket: chevron flap, tack button, V-stitched bag beneath. */
export const FlapPocket: React.FC<PieceProps & {cloth: string}> = ({r, cloth}) => {
  const w = r * 1.6;
  const h = r * 1.75;
  const flapY = -h / 2 + r * 0.5;
  const bag = `M ${-w / 2} ${flapY} H ${w / 2} V ${h / 2 - w * 0.3} L 0 ${h / 2} L ${-w / 2} ${h / 2 - w * 0.3} Z`;
  const flap = `M ${-w / 2} ${-h / 2} H ${w / 2} V ${flapY - r * 0.1} L 0 ${flapY + r * 0.22} L ${-w / 2} ${flapY - r * 0.1} Z`;
  return (
    <g>
      <Lift d={bag} r={r} />
      <path d={bag} fill={cloth} stroke={INK} strokeWidth={r * 0.08} />
      <Topstitch
        d={`M ${-w / 2 + r * 0.18} ${flapY + r * 0.5} L 0 ${flapY + r * 0.85} L ${w / 2 - r * 0.18} ${flapY + r * 0.5}`}
        gap={r * 0.085}
        rows={3}
        w={r * 0.036}
        dash={`${r * 0.085} ${r * 0.05}`}
      />
      {/* the flap sits proud of the bag, so it shadows it */}
      <Lift d={flap} r={r} />
      <path d={flap} fill={cloth} stroke={INK} strokeWidth={r * 0.085} />
      <Topstitch d={flap} gap={r * 0.075} w={r * 0.036} dash={`${r * 0.085} ${r * 0.05}`} />
      <g transform={`translate(0 ${flapY - r * 0.22})`}>{brassFace(r * 0.17)}</g>
    </g>
  );
};

/** Cinch strap: pointed ends, X-box bartacks, buckle at the middle. */
export const CinchStrap: React.FC<PieceProps & {cloth: string}> = ({r, cloth}) => {
  const w = r * 2.5;
  const h = r * 0.62;
  const p = r * 0.3;
  const body = `M ${-w / 2} 0 L ${-w / 2 + p} ${-h / 2} H ${w / 2 - p} L ${w / 2} 0 L ${w / 2 - p} ${h / 2} H ${-w / 2 + p} Z`;
  return (
    <g>
      <Lift d={body} r={r} />
      <path d={body} fill={cloth} stroke={INK} strokeWidth={r * 0.075} />
      <Topstitch d={body} gap={r * 0.07} w={r * 0.032} dash={`${r * 0.08} ${r * 0.05}`} />
      <Bartack x={-w / 2 + p * 1.5} y={0} s={r * 0.3} />
      <Bartack x={w / 2 - p * 1.5} y={0} s={r * 0.3} />
      <g transform={`translate(0 0) scale(0.62)`}>
        <Buckle r={r} />
      </g>
    </g>
  );
};

/**
 * The leather patch. A jacron waistband patch is not a plain rectangle: it is
 * a shield — straight across the top where it is stitched down, shouldered at
 * the sides, and coming to a soft point at the bottom. It is DEBOSSED, so the
 * stamping is a dark line with an ochre highlight below it rather than gold
 * ink sitting on the surface, and the leather has a slightly darker edge where
 * it was skived.
 */
export const Patch: React.FC<PieceProps> = ({r}) => {
  const w = r * 1.9;
  const h = r * 1.5;
  const sh = h * 0.28;
  const body =
    `M ${-w / 2} ${-h / 2} H ${w / 2} V ${h / 2 - sh}` +
    ` Q ${w / 2} ${h / 2} ${w / 2 - sh * 0.7} ${h / 2}` +
    ` H ${-w / 2 + sh * 0.7} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - sh} Z`;
  /** A debossed rule: the pressed groove, then the light catching its lower lip. */
  const stamp = (y: number, half: number, sw: number, key: number) => (
    <g key={key}>
      <line x1={-half} y1={y} x2={half} y2={y} stroke={INK} strokeWidth={sw} opacity={0.75} strokeLinecap="round" />
      <line
        x1={-half}
        y1={y + sw * 0.7}
        x2={half}
        y2={y + sw * 0.7}
        stroke={OCHRE}
        strokeWidth={sw * 0.55}
        opacity={0.5}
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <g>
      <Lift d={body} r={r} />
      <path d={body} fill="var(--rc-mahogany)" stroke={INK} strokeWidth={r * 0.075} />
      {/* the skived edge, a shade darker all the way round */}
      <path d={body} fill="none" stroke={INK} strokeWidth={r * 0.13} opacity={0.22}
        transform="scale(0.94)" />
      {/* stitched down through the leather */}
      <Topstitch
        d={body}
        rows={1}
        gap={0}
        w={r * 0.04}
        dash={`${r * 0.085} ${r * 0.065}`}
        opacity={0.9}
      />
      {/* the stamping: an arc of a name over three rules, as on the real patch */}
      <g>
        <path
          d={`M ${-w * 0.31} ${-h * 0.13} Q 0 ${-h * 0.34} ${w * 0.31} ${-h * 0.13}`}
          fill="none"
          stroke={INK}
          strokeWidth={r * 0.07}
          opacity={0.75}
          strokeLinecap="round"
        />
        <path
          d={`M ${-w * 0.31} ${-h * 0.13 + r * 0.05} Q 0 ${-h * 0.34 + r * 0.05} ${w * 0.31} ${-h * 0.13 + r * 0.05}`}
          fill="none"
          stroke={OCHRE}
          strokeWidth={r * 0.04}
          opacity={0.5}
          strokeLinecap="round"
        />
        {[
          [h * 0.04, w * 0.24, r * 0.055],
          [h * 0.17, w * 0.18, r * 0.05],
        ].map(([y, half, sw], i) => stamp(y, half, sw, i))}
      </g>
    </g>
  );
};
