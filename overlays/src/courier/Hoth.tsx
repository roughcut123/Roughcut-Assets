import React from 'react';
import {random} from 'remotion';
import {C, H, W} from './design';

/**
 * THE GROUND — cold, high, and empty.
 *
 * "Grey space theme, Hoth." The trap in that brief is to reach for blue, and
 * blue is the one thing it must not be: the Keystone cards are indigo, and a
 * blue Courier card is a Keystone card with different words on it. So the
 * whole ground is built out of NEUTRALS and the cold is made by light
 * behaviour rather than by hue — a low horizon, a thin atmosphere, particles
 * that drift instead of fall.
 *
 * Five layers, in the order they matter:
 *
 *  1. A VIGNETTE, so the card has a middle. Flat dark is a slide; a ground
 *     that falls off at the corners is a place.
 *  2. A HORIZON low in the frame — the snowfield. It is almost subliminal at
 *     4% lift, and it is what stops the card reading as a void.
 *  3. ICE HAZE above it: a soft band where the field throws light back up.
 *  4. STARS, few and small. Hoth has weather, so most of the sky is occluded;
 *     a dense starfield would read as a screensaver.
 *  5. SPINDRIFT — snow moving ACROSS, not down. Wind-driven ice is the single
 *     most recognisable thing about that planet and it costs almost nothing.
 *
 * Everything is seeded. Remotion renders frames independently and out of
 * order, so an unseeded particle is a particle that strobes.
 */

export const HothDefs: React.FC<{id: string}> = ({id}) => (
  <>
    {/* The vignette: brighter just above centre, falling to the corners. */}
    <radialGradient id={`${id}-vig`} cx="0.42" cy="0.40" r="0.95">
      <stop offset="0" stopColor="#333740" />
      <stop offset="0.55" stopColor={C.ground} />
      <stop offset="1" stopColor={C.groundDeep} />
    </radialGradient>

    {/* The snowfield, lifting toward the bottom edge. */}
    <linearGradient id={`${id}-field`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.ice} stopOpacity={0} />
      <stop offset="0.55" stopColor={C.ice} stopOpacity={0.035} />
      <stop offset="1" stopColor={C.ice} stopOpacity={0.085} />
    </linearGradient>

    {/* Haze sitting on the horizon line. */}
    <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.ice} stopOpacity={0} />
      <stop offset="0.6" stopColor={C.ice} stopOpacity={0.055} />
      <stop offset="1" stopColor={C.ice} stopOpacity={0} />
    </linearGradient>

    {/* Grain. A flat digital gradient bands badly at this darkness; noise over
        the top is what keeps the falloff smooth on a compressed upload. */}
    <filter id={`${id}-grain`} x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed={11} />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5" intercept="0" />
      </feComponentTransfer>
    </filter>
  </>
);

/** Where the snowfield starts. Low, so the card's content sits in the sky. */
const HORIZON = Math.round(H * 0.76);

export const HothGround: React.FC<{id: string; seed: string; t: number}> = ({id, seed, t}) => (
  <>
    <rect x={0} y={0} width={W} height={H} fill={`url(#${id}-vig)`} />

    <Stars seed={seed} t={t} />

    {/* The field, and the haze where it meets the sky. */}
    <rect x={0} y={HORIZON} width={W} height={H - HORIZON} fill={`url(#${id}-field)`} />
    <rect x={0} y={HORIZON - 130} width={W} height={260} fill={`url(#${id}-haze)`} />
    <rect x={0} y={HORIZON} width={W} height={1} fill={C.ice} opacity={0.035} />

    <Spindrift seed={seed} t={t} />

    <rect
      x={0}
      y={0}
      width={W}
      height={H}
      filter={`url(#${id}-grain)`}
      opacity={0.11}
      style={{mixBlendMode: 'overlay'}}
    />
  </>
);

/**
 * Stars. Sparse, small, and mostly in the upper half — below the horizon there
 * is ground, and a star under the ground is a bug nobody notices until it is
 * on a client's timeline.
 */
const Stars: React.FC<{seed: string; t: number}> = ({seed, t}) => (
  <g fill={C.ice}>
    {Array.from({length: 90}).map((_, i) => {
      const x = random(`${seed}-sx${i}`) * W;
      const y = random(`${seed}-sy${i}`) * (HORIZON - 40);
      const base = 0.06 + random(`${seed}-so${i}`) * 0.3;
      // A slow, per-star twinkle. Different periods, or they pulse in unison.
      const period = 2.6 + random(`${seed}-sp${i}`) * 5;
      const phase = random(`${seed}-sf${i}`) * Math.PI * 2;
      const tw = 0.76 + 0.24 * Math.sin((t / period) * Math.PI * 2 + phase);
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={0.9 + random(`${seed}-sr${i}`) * 1.5}
          opacity={base * tw}
        />
      );
    })}
  </g>
);

/**
 * Spindrift: ice carried sideways on the wind.
 *
 * Each streak owns a lane and crosses it at its own speed, wrapping with a
 * modulo so the field never empties. The drift is almost horizontal — a few
 * degrees of fall, no more. Snow that falls straight down is weather on Earth;
 * snow that travels is weather on Hoth.
 *
 * The near streaks are longer, faster and brighter and the far ones are barely
 * there, which is the only depth cue a flat layer gets.
 *
 * They are kept SHORT and faint. The first pass ran them to 68px at a fifth
 * opacity and they read as scratches on the lens — ice carried on wind is a
 * haze made of many small things, not a few long ones.
 */
const Spindrift: React.FC<{seed: string; t: number}> = ({seed, t}) => (
  <g>
    {Array.from({length: 78}).map((_, i) => {
      const depth = random(`${seed}-pd${i}`);
      const speed = 150 + depth * 560;
      const len = 7 + depth * 23;
      const y0 = random(`${seed}-py${i}`) * H;
      const span = W + len + 200;
      // Wrapped travel, offset per streak so they do not share a start line.
      const x = ((random(`${seed}-px${i}`) * span + t * speed) % span) - len - 100;
      // A shallow sag, so the wind reads as wind and not as a scanline.
      const y = y0 + (x / W) * (26 + depth * 34);
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={len}
          height={0.8 + depth * 0.9}
          rx={1}
          fill={C.ice}
          opacity={0.03 + depth * 0.085}
        />
      );
    })}
  </g>
);
