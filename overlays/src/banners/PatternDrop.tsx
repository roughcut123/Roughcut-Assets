import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../chapters/design';
import {Arrow, Banner} from './Banner';

export {FPS, H, TOTAL, W} from './Banner';

/**
 * THE PATTERN REMINDER — universal.
 *
 * Dropped four or five times across a build to catch anyone watching who has
 * not downloaded the pattern yet.
 *
 * It names no garment. An earlier version carried "THE KEYSTONE JACKET" across
 * the top, which would have meant a re-render for every tutorial it was ever
 * used in — exactly what a reminder like this must not need. The headline
 * carries the whole message instead, and got bigger for the room.
 */

const BAN_W = 820;
const BAN_H = 292;
const DEEP = '#0E1626';

type Props = {
  headline?: [string, string];
  sub?: string;
  seed?: string;
};

export const PatternDrop: React.FC<Props> = ({
  headline = ['PATTERN AVAILABLE', 'TO DOWNLOAD'],
  sub = 'Check the description for the link',
  seed = 'A',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <Banner width={BAN_W} height={BAN_H} base={C.indigo} deep={DEEP} seed={seed}>
      {({x, y, w, openness}) => (
        <>
          <rect x={x} y={y + 44} width={70} height={5} fill={C.gold} />

          {headline.map((l, i) => (
            <text
              key={i}
              x={x}
              y={y + 128 + i * 68}
              fontFamily={FONT}
              fontSize={64}
              fontWeight={700}
              fill={C.cream}
            >
              {l}
            </text>
          ))}

          <text x={x} y={y + 248} fontFamily={FONT} fontSize={30} fontWeight={400} fill={C.sub}>
            {sub}
          </text>

          {/* Pointing the way the description actually is. */}
          <Arrow
            x={x + w - 54}
            y={y + 218}
            t={frame / fps}
            show={Math.max(0, Math.min(1, (openness - 0.86) / 0.1))}
            colour={C.gold}
          />
        </>
      )}
    </Banner>
  );
};
