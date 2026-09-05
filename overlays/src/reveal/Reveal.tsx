import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CANVAS_H, CANVAS_W, TIMING} from '../lib/spec';
import {MONO, Rule, Sheet} from '../lib/sheet';
import {drawOn, exitRamp, paperAngle} from '../lib/motion';
import {tornRectPath} from '../lib/masks';

/**
 * FAMILY G — the final reveal. Spec §12. "The most important single asset in
 * the library."
 *
 * Register is the certificate of authentication, which already exists as a
 * physical Roughcut artefact. Three typefaces exactly, at §3.3's ceiling:
 * blackletter for the wordmark at the head (§3.3 permits it on the reveal
 * card), Playfair Display SC for the certificate copy and the tagline, and
 * the mono for the field values, which are data.
 *
 * §12: "Enters as M1 mosaic assembly, holds 4s, exits by tearing away."
 * The tesserae fly in over the card and dissolve as it resolves, so the
 * certificate assembles rather than fades up. The exit tears the card along
 * an irregular diagonal and takes the halves off in opposite directions.
 *
 * The tagline's second half is a PROP defaulting to "IN THE PRESENT", so the
 * "...IN THE BRITISH ISLES" and "MADE IN ITALY" usages need no second
 * component (§12).
 */

const W = 1980;
const H = 1420;
const PAD = 96;

export type RevealCertProps = {
  pattern: string;
  skillLevel: number;
  fabric: string;
  built: string;
  /** §12: the swappable half of the tagline. */
  taglineTail: string;
  variant: number;
};

const FIELDS = (p: RevealCertProps): [string, string][] => [
  ['Garment No.', ''],
  ['Pattern', p.pattern],
  ['Skill level', `${p.skillLevel} / 5`],
  ['Fabric', p.fabric],
  ['Built', p.built],
];

export const RevealCert: React.FC<RevealCertProps> = (props) => {
  const {variant, taglineTail} = props;
  const frame = useCurrentFrame();
  const {in: inF, hold, out} = TIMING.reveal;
  const exitStart = inF + hold;

  // Resolve out of the mosaic across the entrance.
  const resolve = drawOn(frame, inF * 0.45, inF * 0.55);
  const exit = exitRamp(frame, exitStart, out);
  const angle = paperAngle(`cert-${variant}`);

  const left = Math.round((CANVAS_W - W) / 2);
  const top = Math.round((CANVAS_H - H) / 2);

  // §12 exit: tear along an irregular diagonal, halves away in opposite
  // directions.
  const tear = `M ${W * 0.36} 0 L ${W * 0.52} ${H * 0.28} L ${W * 0.44} ${H * 0.55} L ${W * 0.6} ${H} L 0 ${H} L 0 0 Z`;

  const rows = FIELDS(props);
  const yFields = PAD + 300;
  const ROW = 116;

  const Card = (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <Sheet w={W} h={H} variant={variant} torn={['right', 'bottom']} />
      {/* engraved border */}
      <rect x={40} y={40} width={W - 80} height={H - 80} fill="none" stroke="var(--rc-ink)" strokeWidth={6} />
      <rect x={62} y={62} width={W - 124} height={H - 124} fill="none" stroke="var(--rc-ink)" strokeWidth={2} />
      <Rule x={PAD} y={PAD + 210} w={W - PAD * 2} frame={frame} start={inF * 0.6} dur={10} width={5} />
      <Rule x={PAD} y={yFields + rows.length * ROW + 26} w={W - PAD * 2} frame={frame} start={inF * 0.8} dur={10} width={5} />
      {rows.map((_, i) => (
        <Rule
          key={i}
          x={PAD + 560}
          y={yFields + i * ROW + 74}
          w={W - PAD * 2 - 560}
          frame={frame}
          start={inF * 0.7 + i * 1.4}
          dur={7}
          stroke="var(--rc-paper-deep)"
          width={3}
        />
      ))}
    </svg>
  );

  const Text = (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: PAD + 40,
          width: W,
          textAlign: 'center',
          fontFamily: '"UnifrakturMaguntia", serif',
          fontSize: 132,
          lineHeight: 1,
          color: 'var(--rc-ink)',
          opacity: resolve,
        }}
      >
        RoughCut Official
      </div>

      {rows.map(([k, v], i) => (
        <React.Fragment key={k}>
          <div
            style={{
              position: 'absolute',
              left: PAD,
              top: yFields + i * ROW,
              fontFamily: '"Playfair Display SC", Georgia, serif',
              fontSize: 62,
              letterSpacing: 3,
              color: 'var(--rc-ink)',
              opacity: drawOn(frame, inF * 0.7 + i * 1.4, 6),
            }}
          >
            {k}
          </div>
          <div
            style={{
              position: 'absolute',
              left: PAD + 580,
              top: yFields + i * ROW + 6,
              fontFamily: MONO,
              fontSize: 56,
              color: 'var(--rc-ink)',
              opacity: drawOn(frame, inF * 0.7 + i * 1.4 + 1, 6),
            }}
          >
            {v}
          </div>
        </React.Fragment>
      ))}

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: yFields + rows.length * ROW + 66,
          width: W,
          textAlign: 'center',
          fontFamily: '"Playfair Display SC", Georgia, serif',
          fontWeight: 700,
          fontSize: 76,
          lineHeight: 1.24,
          letterSpacing: 5,
          color: 'var(--rc-ink)',
          opacity: drawOn(frame, inF * 0.85, 8),
        }}
      >
        Relic from the past
        <br />
        crafted {taglineTail}
      </div>
    </>
  );

  // The mosaic the card assembles out of.
  const tiles: React.ReactNode[] = [];
  const cols = 16;
  const rows2 = 11;
  const tw = W / cols;
  const th = H / rows2;
  for (let r = 0; r < rows2; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const s = `cert-${variant}-${i}`;
      const d = random(`${s}-d`) * (inF * 0.5);
      const t = drawOn(frame, d, inF - d);
      if (t >= 1) continue;
      const ang = random(`${s}-a`) * Math.PI * 2;
      const dist = 300 + random(`${s}-r`) * 520;
      tiles.push(
        <rect
          key={i}
          x={c * tw}
          y={r * th}
          width={tw + 6}
          height={th + 6}
          fill="var(--rc-paper)"
          stroke="var(--rc-paper-deep)"
          strokeWidth={2}
          transform={`translate(${Math.cos(ang) * dist * (1 - t)} ${Math.sin(ang) * dist * (1 - t)}) rotate(${(random(`${s}-t`) - 0.5) * 70 * (1 - t)} ${c * tw + tw / 2} ${r * th + th / 2})`}
          opacity={Math.min(t * 2, 1) * (1 - resolve)}
        />,
      );
    }
  }

  const half = (which: 'l' | 'r') => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        clipPath: which === 'l' ? `path('${tear}')` : undefined,
        // The right half is everything the left half is not.
        WebkitClipPath: which === 'l' ? `path('${tear}')` : undefined,
        transform:
          which === 'l'
            ? `translate(${-exit * 900}px, ${exit * 120}px) rotate(${-exit * 7}deg)`
            : `translate(${exit * 900}px, ${exit * 160}px) rotate(${exit * 8}deg)`,
        opacity: 1 - exit * 0.9,
      }}
    >
      {Card}
      {Text}
    </div>
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: W,
          height: H,
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'center',
        }}
      >
        {exit > 0 ? (
          <>
            {half('r')}
            {half('l')}
          </>
        ) : (
          <>
            {Card}
            {Text}
          </>
        )}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
          {tiles}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/**
 * §12: "a slim ruled strip for the try-on B-roll carrying just the pattern
 * name and price, so the certificate isn't on screen over the whole reveal."
 */
export const RevealLower: React.FC<{pattern: string; price: string; variant: number}> = ({
  pattern,
  price,
  variant,
}) => {
  const frame = useCurrentFrame();
  const {in: inF, hold, out} = TIMING.reveal;
  const LW = 1720;
  const LH = 190;
  const place = drawOn(frame, 0, 4);
  const exit = exitRamp(frame, inF + hold, out);
  const angle = paperAngle(`lower-${variant}`);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 200,
          bottom: 190,
          width: LW,
          height: LH,
          transform: `translateY(${exit * 26}px) rotate(${angle}deg)`,
          transformOrigin: 'bottom left',
          opacity: place * (1 - exit),
        }}
      >
        <svg width={LW} height={LH} viewBox={`0 0 ${LW} ${LH}`} style={{position: 'absolute', inset: 0}}>
          <Sheet w={LW} h={LH} variant={variant} torn={['right']} />
          <Rule x={54} y={30} w={LW - 108} frame={frame} start={2} dur={8} width={4} />
          <Rule x={54} y={LH - 30} w={LW - 108} frame={frame} start={5} dur={8} width={3} stroke="var(--rc-paper-deep)" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 54,
            top: 56,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 68,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'var(--rc-ink)',
            opacity: drawOn(frame, 4, 5),
          }}
        >
          {pattern}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 54,
            top: 60,
            fontFamily: MONO,
            fontSize: 60,
            color: 'var(--rc-ink)',
            opacity: drawOn(frame, 6, 5),
          }}
        >
          {price}
        </div>
      </div>
    </AbsoluteFill>
  );
};
