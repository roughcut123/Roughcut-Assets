import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BEAT, at, secs} from '../chapters/timing';
import {envelope} from './envelope';
import {C, CARDS, FONT, GRID, H, MarkerMode, STRIP, TYPE, W} from './design';
import {HothDefs, HothGround} from './Hoth';

/**
 * THE CONTENTS CARD — the whole build on one screen.
 *
 * Shown once near the top of the tutorial, where Jack says "by the end of
 * working through a all the way to h you should be able to have all of the
 * different patterns sewn together". That sentence is the card.
 *
 * Eight rows in two columns, each arriving in order. The rows are not sewn:
 * at this size the stitch reads as texture rather than as sewing, and eight
 * seams running at once is noise. The sewing belongs to the chapter cards,
 * where there is one marker and room for it to be the event.
 */

export const CourierContents: React.FC<{marker?: MarkerMode}> = ({marker = 'letter'}) => {
  const frame = useCurrentFrame();
  const t = secs(frame);
  const id = 'cb-contents';
  const rows = CARDS.filter((c) => c.type === 'chapter');

  return (
    <AbsoluteFill style={{opacity: envelope(frame)}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <HothDefs id={id} />
        </defs>
        <HothGround id={id} seed="contents" t={t} />

        {/* the webbing strip, wiping down */}
        <g>
          <rect x={0} y={0} width={STRIP} height={H * at(frame, 0, 0.45)} fill="#30343C" />
          <rect x={0} y={0} width={5} height={H * at(frame, 0, 0.45)} fill="#22252B" />
          <rect x={STRIP - 5} y={0} width={5} height={H * at(frame, 0, 0.45)} fill="#22252B" />
        </g>

        <g opacity={at(frame, BEAT.part[0], BEAT.part[1])}>
          <rect x={GRID.left} y={132} width={34} height={3} fill={C.green} />
          <text
            x={GRID.left + 52}
            y={144}
            fontFamily={FONT}
            fontSize={TYPE.label}
            fontWeight={700}
            letterSpacing={3.4}
            fill={C.green}
          >
            THE COURIER BAG
          </text>
        </g>

        <text
          x={GRID.left}
          y={300}
          fontFamily={FONT}
          fontSize={TYPE.title}
          fontWeight={700}
          fill={C.white}
          opacity={at(frame, 0.5, 0.95)}
        >
          THE BUILD
        </text>
        <text
          x={GRID.left}
          y={356}
          fontFamily={FONT}
          fontSize={TYPE.line}
          fontWeight={400}
          fill={C.text}
          opacity={at(frame, 0.7, 1.1)}
        >
          Eight categories. Sort your pieces by {marker === 'letter' ? 'letter' : 'number'}, then work
          straight down the list.
        </text>

        <rect
          x={GRID.left}
          y={410}
          width={(GRID.rightEdge - GRID.left) * at(frame, 0.8, 1.2)}
          height={1}
          fill={C.rule}
        />

        {rows.map((c, i) => {
          const col = i < 4 ? 0 : 1;
          const row = i % 4;
          const x = GRID.left + col * 760;
          const y = 486 + row * 104;
          const p = at(frame, 1.0 + i * 0.09, 1.35 + i * 0.09);
          const mark = marker === 'letter' ? c.letter : c.number;
          return (
            <g key={c.id} opacity={p} transform={`translate(0 ${(1 - p) * 10})`}>
              <text x={x} y={y} fontFamily={FONT} fontSize={56} fontWeight={700} fill={C.green}>
                {mark}
              </text>
              <text x={x + 86} y={y - 20} fontFamily={FONT} fontSize={34} fontWeight={700} fill={C.white}>
                {c.title.replace('\n', ' ')}
              </text>
              <text x={x + 86} y={y + 16} fontFamily={FONT} fontSize={24} fontWeight={400} fill={C.mute}>
                {c.pieces}
              </text>
            </g>
          );
        })}

        <g opacity={at(frame, BEAT.foot[0], BEAT.foot[1])}>
          <rect x={GRID.left} y={GRID.footerRule} width={GRID.rightEdge - GRID.left} height={1} fill={C.rule} />
          <text
            x={GRID.left}
            y={GRID.footerRule + 44}
            fontFamily={FONT}
            fontSize={TYPE.footer}
            fontWeight={400}
            letterSpacing={3}
            fill={C.faint}
          >
            PATTERN TCB · ONE SIZE
          </text>
          <text
            x={GRID.rightEdge}
            y={GRID.footerRule + 44}
            textAnchor="end"
            fontFamily={FONT}
            fontSize={TYPE.footer}
            fontWeight={700}
            letterSpacing={3}
            fill={C.faint}
          >
            ROUGHCUT
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
