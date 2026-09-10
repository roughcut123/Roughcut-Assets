import React from 'react';
import {random} from 'remotion';
import {C, FONT} from './design';
import {buildPlan, eventDurations, Feel, laidBy, timeline} from './stitch';

/**
 * A CHAPTER NUMBER, SEWN ON.
 *
 * §9's test: freeze at 0.9s and it must read as a seam being sewn, not a
 * number being drawn. Six things decide that, and all six are here.
 *
 *  1. Discrete stitches, never a growing path. Each is its own capsule with a
 *     gap after it, so the eye reads a machine rather than a pen.
 *  2. Twin needle. Two parallel rows, the second lagging the first, because
 *     denim topstitching is always double and a flat-fell is two passes.
 *  3. Thread with weight: a shadow under it, a darker lower edge, and a bright
 *     upper edge, so it lies ON the cloth rather than being printed into it.
 *  4. A needle at the leading edge, bobbing on each stitch. A hint, not a
 *     machine — §7 is explicit that drawing a machine makes it a cartoon.
 *  5. Puckering where the thread pulls the cloth in.
 *  6. Per-stitch jitter, seeded. The brief calls this "the single
 *     highest-value detail" and it is right: identical stitches look printed.
 *     Seeded because Remotion re-renders frames independently and unseeded
 *     randomness strobes.
 */

/** §2.1: 7 SPI on denim. At 158px that is a 10px pitch and a 7px stitch. */
export const PITCH = 10;
const STITCH_LEN = 7;
/**
 * THREAD WIDTH, and the trap in it.
 *
 * A stitch is drawn with round caps, and a round cap adds half the stroke
 * width beyond each end point. So a 7px line stroked at 3.2px is 10.2px of
 * visible capsule — exactly the pitch, which closes the 3px gap and turns the
 * seam into one continuous tube. That is precisely the failure §9 warns
 * about: it stops reading as stitches and starts reading as a drawn line.
 *
 * The line is therefore shortened by one stroke width so the CAPSULE measures
 * STITCH_LEN, and the thread is thinner so the twin rows stay distinct rather
 * than merging into a single fat rope at 4.5px apart.
 */
const THREAD_W = 2.8;
/** §2.2: the two rows sit 4-5px apart and the second trails by 2-3 stitches. */
const ROW_GAP = 5;
const ROW_LAG = 2.5;

const GOLD_DARK = '#9C7328';
const GOLD_LIT = '#E8C069';

/**
 * WHAT HAPPENS AT THE END, and why there is a choice here.
 *
 * §3 says sew the outline and do not fill it. §6 says that when the animation
 * is finished the number "should look exactly like the supplied PNG", and the
 * PNG is a solid gold numeral. Those cannot both be true of the same frame, so
 * the seam HANDS OVER: the stitches finish, the solid numeral rises under
 * them, and the thread fades, leaving precisely the signed-off card.
 *
 * That reading keeps §7's promise that the cards are signed off and this is
 * one addition. Set RESOLVE to false to keep the stitched outline as the final
 * state instead — it is one constant because it changes what is delivered.
 */
export const RESOLVE = true;

type Props = {
  digits: string;
  size: number;
  x: number;
  baseline: number;
  /** Stitches per second. */
  rate: number;
  feel: Feel;
  seed: string;
  /** Seconds into the composition when the needle drops. */
  startAt: number;
  /** Current time in seconds. */
  now: number;
  /** Seconds over which the solid numeral takes over from the thread. */
  resolveAt?: number;
  /** Thread colour. */
  colour?: string;
  /** Colour of the numeral the seam becomes. Defaults to the thread colour. */
  solidColour?: string;
};

/**
 * Stitch metrics at a given type size.
 *
 * The constants above are for the 158px chapter number. The contents card sews
 * the same digits at 32px, a fifth the size, where a proportional 2px pitch and
 * a 0.6px thread would be sub-pixel and read as a grey smudge rather than as
 * stitching. Everything therefore scales but with floors, and the twin row is
 * dropped once the two rows would be closer than about two pixels — at that
 * separation they are not two rows, they are one blurred one.
 */
const metrics = (size: number) => {
  const k = size / 158;
  const threadW = Math.max(1.15, THREAD_W * k);
  const rowGap = ROW_GAP * k;
  return {
    pitch: Math.max(3.2, PITCH * k),
    threadW,
    drawnLen: Math.max(0.6, STITCH_LEN * k - threadW),
    rowGap,
    twin: rowGap >= 2.2,
    needle: k,
  };
};

export const StitchedNumber: React.FC<Props> = ({
  digits,
  size,
  x,
  baseline,
  rate,
  feel,
  seed,
  startAt,
  now,
  resolveAt,
  colour = C.gold,
  solidColour,
}) => {
  const M = metrics(size);
  // The plan is pure geometry and depends on nothing that changes per frame.
  const plan = React.useMemo(
    () => buildPlan(digits, size, x, baseline, M.pitch),
    [digits, size, x, baseline, M.pitch],
  );
  const times = React.useMemo(
    () => timeline(eventDurations(plan, rate, feel)),
    [plan, rate, feel],
  );

  const t = now - startAt;
  const laid = laidBy(times, t);
  const done = laid >= plan.events.length;
  const sewingDur = times[times.length - 1] ?? 0;

  // Handover: the solid numeral rises as the last stitches land, and the
  // thread fades just behind it.
  // The solid numeral rises only once the last stitch is in — earlier and it
  // fills in behind a seam that is visibly still being sewn.
  const rStart = resolveAt !== undefined ? resolveAt - 0.3 : startAt + sewingDur - 0.04;
  const rEnd = rStart + 0.3;
  const solid = RESOLVE ? clamp((now - rStart) / (rEnd - rStart)) : 0;
  const thread = RESOLVE ? 1 - clamp((now - (rStart + 0.07)) / (rEnd - rStart)) : 1;

  const rowA: React.ReactNode[] = [];
  const rowB: React.ReactNode[] = [];
  let jump: React.ReactNode = null;
  // Held in an object rather than a plain `let`: it is written from inside a
  // callback, and TypeScript's flow analysis narrows a closure-assigned `let`
  // to `never` at the point it is read.
  const head: {at: {x: number; y: number} | null} = {at: null};
  const pucker: React.ReactNode[] = [];

  plan.events.forEach((e, i) => {
    if (e.kind === 'jump') {
      // §3: a fine taut thread while the needle travels, and no stitches laid
      // down during it. Visible only while the jump is happening.
      if (i === laid - 1 && !done) {
        const p = (t - (times[i - 1] ?? 0)) / (times[i] - (times[i - 1] ?? 0));
        jump = (
          <line
            x1={e.from.x}
            y1={e.from.y}
            x2={e.from.x + (e.to.x - e.from.x) * clamp(p)}
            y2={e.from.y + (e.to.y - e.from.y) * clamp(p)}
            stroke={colour}
            strokeWidth={1.2}
            opacity={0.45}
          />
        );
        head.at = {
          x: e.from.x + (e.to.x - e.from.x) * clamp(p),
          y: e.from.y + (e.to.y - e.from.y) * clamp(p),
        };
      }
      return;
    }

    const {s} = e;
    // Seeded jitter: +/-3% on length, +/-1.5 degrees of rotation.
    const j1 = random(`${seed}-l${i}`) - 0.5;
    const j2 = random(`${seed}-r${i}`) - 0.5;
    const len = M.drawnLen * (1 + j1 * 0.06);
    const ang = s.a + j2 * 3;
    const rad = (ang * Math.PI) / 180;
    const hx = (Math.cos(rad) * len) / 2;
    const hy = (Math.sin(rad) * len) / 2;

    if (i < laid) {
      rowA.push(
        <Stitch key={`a${i}`} x={s.x} y={s.y} hx={hx} hy={hy} colour={colour} w={M.threadW} />,
      );
      if (i === laid - 1) head.at = {x: s.x, y: s.y};
      // §2.5: the cloth gathers very slightly where the thread pulls through.
      // Almost subliminal — if it reads as an effect it is too strong.
      pucker.push(
        <ellipse
          key={`p${i}`}
          cx={s.x}
          cy={s.y}
          rx={len * 0.9}
          ry={2.2 * M.needle}
          transform={`rotate(${ang} ${s.x} ${s.y})`}
          fill="#000000"
          opacity={0.05}
        />,
      );
    }
    // The second row trails, and sits one gap inboard of the first.
    if (M.twin && i < laid - ROW_LAG) {
      const bx = s.x + s.nx * M.rowGap;
      const by = s.y + s.ny * M.rowGap;
      rowB.push(
        <Stitch key={`b${i}`} x={bx} y={by} hx={hx} hy={hy} colour={colour} w={M.threadW} />,
      );
    }
  });

  return (
    <g id="number">
      {/* The seam, while it is being sewn. */}
      <g opacity={thread}>
        <g>{pucker}</g>
        {jump}
        {rowB}
        {rowA}
        {!done && head.at ? <Needle x={head.at.x} y={head.at.y} t={t} rate={rate} k={M.needle} /> : null}
      </g>

      {/* The signed-off numeral, which the seam becomes. */}
      {solid > 0 ? (
        <text
          x={x}
          y={baseline}
          fontFamily={FONT}
          fontSize={size}
          fontWeight={700}
          fill={solidColour ?? colour}
          opacity={solid}
          style={{whiteSpace: 'pre'}}
        >
          {digits}
        </text>
      ) : null}
    </g>
  );
};

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/**
 * One stitch. Four strokes: the shadow it throws on the denim, the thread, the
 * darker underside where it rolls away from the light, and the lit top. That
 * is what stops it being a flat gold dash.
 *
 * Every one of them is sized RELATIVE to the thread. They were absolute at
 * first, which is fine at 158px and wrong at 32px: a 2px shadow under a 1.15px
 * thread is wider than the thread it belongs to, and the contents rows came
 * out muddy and washed instead of gold.
 */
const Stitch: React.FC<{
  x: number;
  y: number;
  hx: number;
  hy: number;
  colour: string;
  w: number;
}> = ({x, y, hx, hy, colour, w}) => {
  const o = w / 2.8; // offsets scale with the thread, never with the frame
  return (
  <g strokeLinecap="round">
    <line
      x1={x - hx}
      y1={y - hy + o}
      x2={x + hx}
      y2={y + hy + o}
      stroke="#000000"
      strokeWidth={w * 1.35}
      opacity={0.3}
    />
    <line x1={x - hx} y1={y - hy} x2={x + hx} y2={y + hy} stroke={colour} strokeWidth={w} />
    <line
      x1={x - hx}
      y1={y - hy + o * 0.55}
      x2={x + hx}
      y2={y + hy + o * 0.55}
      stroke={GOLD_DARK}
      strokeWidth={w * 0.3}
      opacity={0.8}
    />
    <line
      x1={x - hx}
      y1={y - hy - o * 0.6}
      x2={x + hx}
      y2={y + hy - o * 0.6}
      stroke={GOLD_LIT}
      strokeWidth={w * 0.25}
      opacity={0.6}
    />
  </g>
  );
};

/**
 * §2.4: "A minimal needle presence... Do not model a sewing machine."
 *
 * A slim bar with a bright point where the thread enters the cloth, bobbing
 * 2-3px in time with the stitch rate. It leads — the stitch appears behind it.
 */
const Needle: React.FC<{x: number; y: number; t: number; rate: number; k: number}> = ({
  x,
  y,
  t,
  rate,
  k,
}) => {
  const sc = Math.max(0.45, k);
  const bob = Math.abs(Math.sin(t * rate * Math.PI)) * 3 * sc;
  return (
    <g opacity={0.9}>
      <line
        x1={x}
        y1={y - 26 * sc - bob}
        x2={x}
        y2={y - 6 * sc - bob}
        stroke="#C9D2E4"
        strokeWidth={2.2 * sc}
        strokeLinecap="round"
      />
      <circle cx={x} cy={y - 4 * sc - bob * 0.4} r={2.1 * sc} fill="#F6F1E6" opacity={0.95} />
    </g>
  );
};
