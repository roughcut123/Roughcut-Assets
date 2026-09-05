import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CANVAS_H, CANVAS_W} from '../lib/spec';
import {MONO, Rule, Sheet} from '../lib/sheet';
import {drawOn, exitRamp, paperAngle} from '../lib/motion';

/**
 * FAMILY F — day breaks. Spec §11.
 *
 * "The comic beat is that days pass for Jack and seconds pass for the viewer.
 * Let the stamp land hard and fast on the cut — that's the joke." So the DAY
 * stamp arrives in three frames with no ease-in at all, slightly over-rotated,
 * like something pressed onto the page rather than animated onto it.
 */

const W = 1500;
const PAD = 58;

/** §11: end of a session. Lamp-orange light falling, the studio going dark. */
export const DayEnd: React.FC<{day: number; sub: string; variant: number}> = ({day, sub, variant}) => {
  const frame = useCurrentFrame();
  const total = 75; // §11 says 3s
  const H = 470;
  const place = drawOn(frame, 0, 4);
  const exit = exitRamp(frame, total - 14, 14);
  const angle = paperAngle(`dayend-${day}`);
  // The lamp falls across the sheet and then the room goes dark.
  const lamp = interpolate(frame, [0, 22, total - 18, total], [0, 0.55, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 200,
          top: Math.round(CANVAS_H * 0.6 - H / 2),
          width: W,
          height: H,
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'top left',
          opacity: place * (1 - exit),
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Sheet w={W} h={H} variant={variant} />
          <defs>
            <linearGradient id={`lamp-${day}`} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="var(--rc-lamp)" stopOpacity={0.75} />
              <stop offset="60%" stopColor="var(--rc-lamp)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* the lamp falling across the sheet */}
          <rect x={0} y={0} width={W} height={H} fill={`url(#lamp-${day})`} opacity={lamp} style={{mixBlendMode: 'multiply'}} />
          <Rule x={PAD} y={PAD} w={W - PAD * 2} frame={frame} start={2} dur={8} width={4} />
          <Rule x={PAD} y={H - PAD} w={W - PAD * 2} frame={frame} start={6} dur={8} width={4} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: PAD + 52,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 116,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: 'var(--rc-ink)',
            opacity: drawOn(frame, 3, 5),
          }}
        >
          End of day {day}
        </div>
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: PAD + 200,
            fontFamily: MONO,
            fontSize: 50,
            color: 'var(--rc-ink)',
            opacity: drawOn(frame, 7, 5),
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** §11: the next morning. Cold light, and the stamp lands hard. */
export const DayStamp: React.FC<{day: number; variant: number}> = ({day, variant}) => {
  const frame = useCurrentFrame();
  const total = 50; // §11 says 2s
  const H = 380;
  const place = drawOn(frame, 0, 3);
  const exit = exitRamp(frame, total - 10, 10);
  const angle = paperAngle(`day-${day}`);

  // Hard and fast: three frames, no ease-in, a touch of over-rotation.
  const stampT = Math.min(1, Math.max(0, (frame - 5) / 3));
  const stampScale = 1 + (1 - stampT) * 0.5;
  const stampRot = -3.5 + (1 - stampT) * 6;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 200,
          top: Math.round(CANVAS_H * 0.6 - H / 2),
          width: W,
          height: H,
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'top left',
          opacity: place * (1 - exit),
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Sheet w={W} h={H} variant={variant} />
          {/* cold morning light, the opposite key to the lamp */}
          <rect x={0} y={0} width={W} height={H} fill="var(--rc-fresco)" opacity={0.18} style={{mixBlendMode: 'multiply'}} />
          <Rule x={PAD} y={PAD} w={W - PAD * 2} frame={frame} start={1} dur={7} width={4} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: PAD + 54,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 168,
            letterSpacing: 14,
            textTransform: 'uppercase',
            color: 'var(--rc-annotation)',
            border: '9px solid var(--rc-annotation)',
            padding: '10px 34px',
            display: 'inline-block',
            transform: `scale(${stampScale}) rotate(${stampRot}deg)`,
            transformOrigin: 'left center',
            opacity: stampT > 0 ? 1 : 0,
          }}
        >
          Day {String(day).padStart(2, '0')}
        </div>
      </div>
    </AbsoluteFill>
  );
};
