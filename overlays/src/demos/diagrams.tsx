import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {drawOn} from '../lib/motion';
import {CHALK, DIAGRAM_H, DIAGRAM_W, DEMO_TIMING, Keylined, MARK} from './DemoFrame';

/**
 * The five demonstrations. Each one shows the thing rather than describing it.
 * Every stroke draws on by stroke-dashoffset (§3.5) and each carries exactly
 * one red mark (§3.2) on the fact being taught.
 */

const IN = DEMO_TIMING.in;
/** dashoffset helper: a solid line of known length that draws itself on. */
const draw = (len: number, p: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - p)});

/**
 * Reveal for lines that ALREADY carry a stitch dash pattern. dashoffset is
 * taken by the stitches, so those reveal with a clip instead — otherwise the
 * draw-on overwrites the dashes and the stitch stops looking like a stitch.
 */
const wipe = (p: number, dir: 'l' | 'r' = 'l') => ({
  style: {clipPath: dir === 'l' ? `inset(0 ${(1 - p) * 100}% 0 0)` : `inset(0 0 0 ${(1 - p) * 100}%)`},
});

/* ---------------------------------------------------------- 1. SEAM ALLOWANCE */

/**
 * Top view, the way you actually see it while sewing: the raw edge runs
 * against the right side of the foot, the needle falls 6mm in, and the gap
 * between them IS the seam allowance. That gap is the red mark.
 */
export const SeamAllowanceDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const RAW = 640;
  const NEEDLE = 550;
  const cloth = drawOn(frame, 0, 9);
  const foot = drawOn(frame, 8, 8);
  const stitch = drawOn(frame, 18, 16);
  const dim = drawOn(frame, IN * 0.72, 9);
  const footY = interpolate(foot, [0, 1], [-130, 0]);

  return (
    <>
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            {/* the cloth, and its raw edge */}
            <path d={`M 40 70 L ${RAW} 70 L ${RAW} 490 L 40 490`} strokeWidth={7 + e} {...draw(1700, cloth)} />
            <line x1={RAW} y1={70} x2={RAW} y2={490} strokeWidth={11 + e} {...draw(420, cloth)} />
            {/* weave direction, so it reads as cloth not paper */}
            {Array.from({length: 8}).map((_, i) => (
              <line key={i} x1={70} y1={110 + i * 52} x2={RAW - 24} y2={110 + i * 52}
                strokeWidth={3 + e} opacity={0.5} {...draw(560, cloth)} />
            ))}
          </g>
        )}
      />

      {/* the presser foot, coming down onto the cloth */}
      <g transform={`translate(0 ${footY})`} opacity={foot}>
        <Keylined
          render={(s, e) => (
            <g fill="none" stroke={s} strokeWidth={8 + e}>
              <rect x={452} y={150} width={188} height={290} />
              <rect x={528} y={150} width={44} height={196} />
              <line x1={546} y1={120} x2={546} y2={152} strokeWidth={14 + e} />
            </g>
          )}
        />
      </g>

      {/* the stitch line falling where the needle is */}
      <Keylined
        render={(s, e) => (
          <line x1={NEEDLE} y1={90} x2={NEEDLE} y2={470} stroke={s} strokeWidth={7 + e}
            strokeDasharray="26 18"
            style={{clipPath: `inset(0 0 ${(1 - stitch) * 100}% 0)`}} />
        )}
      />

      {/* THE red mark: the gap between needle and raw edge. */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <line x1={NEEDLE} y1={520} x2={RAW} y2={520} {...draw(RAW - NEEDLE, dim)} />
            <line x1={NEEDLE} y1={498} x2={NEEDLE} y2={542} {...draw(44, dim)} />
            <line x1={RAW} y1={498} x2={RAW} y2={542} {...draw(44, dim)} />
          </g>
        )}
      />
    </>
  );
};

/* ------------------------------------------------------ 2. RIGHT SIDES TOGETHER */

/** The left panel flips about the shared edge and lands face-down on the
 *  right one. Hatching is the printed face, and it vanishes as the panel
 *  turns over — which is the whole point of the instruction. */
export const RightSidesDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const PIVOT = 470;
  const inA = drawOn(frame, 0, 8);
  const flip = drawOn(frame, 12, 20);
  const sx = interpolate(flip, [0, 1], [1, -1]);
  const faceUp = sx > 0;
  const arrow = drawOn(frame, IN * 0.66, 10);

  const panel = (x: number, showFace: boolean) => (s: string, e: number) => (
    <g fill="none" stroke={s} strokeWidth={8 + e}>
      <rect x={x} y={120} width={380} height={320} />
      {showFace
        ? Array.from({length: 7}).map((_, i) => (
            <line key={i} x1={x + 16 + i * 52} y1={430} x2={x + 86 + i * 52} y2={130} strokeWidth={4 + e} opacity={0.6} />
          ))
        : null}
    </g>
  );

  return (
    <>
      <g opacity={inA}>
        <Keylined render={panel(PIVOT + 46, true)} />
      </g>
      {/* Lands slightly proud of the panel underneath, so the finished state
          reads as two layers face to face rather than one rectangle. */}
      <g
        transform={`translate(${PIVOT} ${flip * -40}) scale(${sx} 1) translate(${-PIVOT} 0)`}
        opacity={inA}
      >
        <Keylined render={panel(PIVOT - 400, faceUp)} />
      </g>
      {/* the red mark: the turn itself */}
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <path d={`M 300 92 q 190 -70 380 0`} {...draw(430, arrow)} />
            <path d={`M 680 92 l -8 -38 M 680 92 l -38 4`} {...draw(80, arrow)} />
          </g>
        )}
      />
    </>
  );
};

/* ------------------------------------------------------------- 3. BACKSTITCH */

/** Three forward, three back, then away. The reverse run is the red mark,
 *  offset a little below the line so both passes stay readable. */
export const BackstitchDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const Y = 250;
  const X0 = 90;
  const X1 = 300;
  const X2 = 870;
  const fwd = drawOn(frame, 2, 9);
  const back = drawOn(frame, 13, 9);
  const run = drawOn(frame, 24, 14);

  return (
    <>
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            <line x1={X0} y1={Y} x2={X1} y2={Y} strokeWidth={9 + e} strokeDasharray="30 20" {...wipe(fwd)} />
            <line x1={X0} y1={Y} x2={X2} y2={Y} strokeWidth={9 + e} strokeDasharray="30 20" {...wipe(run)} />
            {/* the cloth it sits on */}
            {/* Close enough to the stitch run that the three lines cut out as
                one piece of paper rather than three separate strips. */}
            <line x1={40} y1={Y + 56} x2={900} y2={Y + 56} strokeWidth={5 + e} opacity={0.45} {...draw(860, fwd)} />
            <line x1={40} y1={Y - 56} x2={900} y2={Y - 56} strokeWidth={5 + e} opacity={0.45} {...draw(860, fwd)} />
          </g>
        )}
      />
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={9 + e}>
            <line x1={X1} y1={Y + 34} x2={X0} y2={Y + 34} strokeDasharray="30 20" {...wipe(back, 'r')} />
            <path d={`M ${X0} ${Y + 34} l 34 -12 M ${X0} ${Y + 34} l 34 12`} {...draw(80, back)} />
          </g>
        )}
      />
    </>
  );
};

/* -------------------------------------------------------------- 4. GRAIN LINE */

/** The arrow comes in off-grain and swings parallel to the selvedge. The red
 *  mark is the correction itself. */
export const GrainlineDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const cloth = drawOn(frame, 0, 9);
  const arrowIn = drawOn(frame, 10, 8);
  const swing = drawOn(frame, 20, 14);
  const angle = interpolate(swing, [0, 1], [24, 0]);
  const AX = 470;
  const arc = drawOn(frame, IN * 0.7, 9);

  return (
    <>
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            <rect x={60} y={70} width={820} height={420} strokeWidth={7 + e} {...draw(2480, cloth)} />
            {/* the selvedge: the woven band with its regular ticks */}
            <line x1={130} y1={70} x2={130} y2={490} strokeWidth={9 + e} {...draw(420, cloth)} />
            {Array.from({length: 13}).map((_, i) => (
              <line key={i} x1={70} y1={88 + i * 32} x2={122} y2={88 + i * 32} strokeWidth={4 + e}
                opacity={0.7} {...draw(52, cloth)} />
            ))}
            {/* Weave across the body. It says cloth rather than card, and it
                gives the cut something to follow so the middle of the piece
                is paper instead of a hole. */}
            {Array.from({length: 7}).map((_, i) => (
              <line key={`w${i}`} x1={160} y1={130 + i * 52} x2={846} y2={130 + i * 52} strokeWidth={3 + e}
                opacity={0.4} {...draw(686, cloth)} />
            ))}
          </g>
        )}
      />
      <g transform={`rotate(${angle} ${AX} 280)`} opacity={arrowIn}>
        <Keylined
          render={(s, e) => (
            <g fill="none" stroke={s} strokeWidth={9 + e}>
              <line x1={AX} y1={120} x2={AX} y2={440} />
              <path d={`M ${AX - 30} 152 L ${AX} 118 L ${AX + 30} 152`} />
              <path d={`M ${AX - 30} 408 L ${AX} 442 L ${AX + 30} 408`} />
            </g>
          )}
        />
      </g>
      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={7 + e}>
            <path d={`M 610 132 a 150 150 0 0 0 -104 -30`} {...draw(180, arc)} />
            <path d={`M 506 102 l 38 -6 M 506 102 l 16 34`} {...draw(80, arc)} />
          </g>
        )}
      />
    </>
  );
};

/* --------------------------------------------------------- 5. PRESS SEAMS OPEN */

/** Side elevation: the allowances stand up out of the seam, the iron comes
 *  down, and they lie flat to either side. The red mark is the seam itself. */
export const PressSeamsDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const Y = 360;
  const CX = 470;
  const cloth = drawOn(frame, 0, 9);
  const iron = drawOn(frame, 12, 10);
  const open = drawOn(frame, 24, 14);
  const seam = drawOn(frame, IN * 0.72, 8);
  const ironY = interpolate(iron, [0, 1], [-190, 0]) + interpolate(open, [0, 1], [0, 24]);
  // Stops just short of flat so both allowances stay visible lying open.
  const spread = interpolate(open, [0, 1], [-88, -166]); // degrees from vertical

  const allowance = (dir: 1 | -1) => (s: string, e: number) => (
    <line x1={CX} y1={Y - 16} x2={CX} y2={Y - 166} stroke={s} strokeWidth={8 + e} fill="none"
      transform={`rotate(${dir * (spread + 90)} ${CX} ${Y - 16})`} />
  );

  return (
    <>
      <Keylined
        render={(s, e) => (
          <g fill="none" stroke={s}>
            <line x1={70} y1={Y} x2={870} y2={Y} strokeWidth={9 + e} {...draw(800, cloth)} />
            <line x1={70} y1={Y + 26} x2={870} y2={Y + 26} strokeWidth={4 + e} opacity={0.5} {...draw(800, cloth)} />
          </g>
        )}
      />
      <g opacity={cloth}>
        <Keylined render={allowance(1)} />
        <Keylined render={allowance(-1)} />
      </g>

      {/* the iron */}
      <g transform={`translate(0 ${ironY})`} opacity={iron}>
        <Keylined
          render={(s, e) => (
            <g fill="none" stroke={s} strokeWidth={8 + e}>
              <path d={`M 320 250 L 630 250 L 596 196 L 354 196 Z`} />
              <path d={`M 386 196 q 90 -86 180 0`} />
            </g>
          )}
        />
      </g>

      <Keylined
        color={MARK}
        render={(s, e) => (
          <g fill="none" stroke={s} strokeWidth={8 + e}>
            <line x1={CX} y1={Y - 34} x2={CX} y2={Y + 34} {...draw(68, seam)} />
          </g>
        )}
      />
    </>
  );
};
