import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CANVAS_H, TIMING} from '../lib/spec';
import {MONO, Rule, Sheet} from '../lib/sheet';
import {drawOn, exitRamp} from '../lib/motion';

/**
 * FAMILY B — chapter title cards. Spec §7.
 *
 * "illuminated drop cap (gold on oxblood, drawn from manuscript reference) +
 * chapter name in engraved serif small caps + a thin rule + the garment name
 * in mono below." That is exactly three typefaces, which is §3.3's ceiling —
 * blackletter for the cap, Playfair Display SC for the chapter, Courier Prime
 * for the garment line. Nothing else may be added to this card.
 *
 * "The container is a torn-edge paper block, rotated 1.5°, positioned
 * lower-left third. Not centred."
 *
 * The illuminated cap is drawn as gold letter on an oxblood ground with a
 * ruled border. §3.6 wants real manuscript scans for the illumination and
 * none are available here; the geometry is right and a scan can be dropped
 * behind the letter later. Logged in NOTES.md.
 */

const W = 1680;
const PAD = 62;
const CAP = 210;
const CHAPTER_PX = 118;
const GARMENT_PX = 52;

export type TitleCardProps = {
  chapterName: string;
  garmentName: string;
  skillLevel: number;
  variant: number;
};

export const TitleCard: React.FC<TitleCardProps> = ({
  chapterName,
  garmentName,
  skillLevel,
  variant,
}) => {
  const frame = useCurrentFrame();
  const {in: inF, hold, out} = TIMING.title;
  const exitStart = inF + hold;

  const first = chapterName.slice(0, 1).toUpperCase();
  const rest = chapterName.slice(1);

  const inner = W - PAD * 2;
  const H = PAD * 2 + CAP + 40 + GARMENT_PX * 1.3;

  const place = drawOn(frame, 0, 4);
  const exit = exitRamp(frame, exitStart, out);
  const capIn = drawOn(frame, 2, 5);
  const nameIn = drawOn(frame, 5, 5);
  const garmentIn = drawOn(frame, 8, 5);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 200,
          // lower-left third, not centred (§7)
          top: Math.round(CANVAS_H * 0.62 - H / 2),
          width: W,
          height: H,
          transform: `translateY(${exit * -20}px) rotate(1.5deg) scale(${1.008 - place * 0.008})`,
          transformOrigin: 'top left',
          opacity: place * (1 - exit),
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Sheet w={W} h={H} variant={variant} torn={['right', 'bottom']} />

          {/* Illuminated drop cap: gold letter on an oxblood ground. */}
          <g opacity={capIn}>
            <rect x={PAD} y={PAD} width={CAP} height={CAP} fill="var(--rc-oxblood)" />
            <rect
              x={PAD + 12}
              y={PAD + 12}
              width={CAP - 24}
              height={CAP - 24}
              fill="none"
              stroke="var(--rc-gold)"
              strokeWidth={4}
            />
          </g>

          {/* the thin rule under the chapter name */}
          <Rule
            x={PAD + CAP + 48}
            y={PAD + CAP * 0.78}
            w={inner - CAP - 48}
            frame={frame}
            start={7}
            dur={8}
            width={4}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: PAD,
            width: CAP,
            height: CAP,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"UnifrakturMaguntia", serif',
            fontSize: CAP * 0.72,
            lineHeight: 1,
            color: 'var(--rc-gold)',
            opacity: capIn,
          }}
        >
          {first}
        </div>

        <div
          style={{
            position: 'absolute',
            left: PAD + CAP + 48,
            top: PAD + CAP * 0.16,
            fontFamily: '"Playfair Display SC", Georgia, serif',
            fontWeight: 700,
            fontSize: CHAPTER_PX,
            lineHeight: 1,
            letterSpacing: 4,
            color: 'var(--rc-ink)',
            opacity: nameIn,
            whiteSpace: 'nowrap',
          }}
        >
          {rest}
        </div>

        <div
          style={{
            position: 'absolute',
            left: PAD + CAP + 48,
            top: PAD + CAP * 0.78 + 26,
            fontFamily: MONO,
            fontSize: GARMENT_PX,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'var(--rc-ink)',
            opacity: garmentIn,
            whiteSpace: 'nowrap',
          }}
        >
          {garmentName} · Skill {skillLevel}/5
        </div>
      </div>
    </AbsoluteFill>
  );
};
