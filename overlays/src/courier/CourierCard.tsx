import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {StitchedNumber} from '../chapters/StitchedNumber';
import {BEAT, NUMBER_SEW, TOTAL, at, outT, secs} from '../chapters/timing';
import {C, Card, FONT, GRID, GROUPS, H, MarkerMode, STRIP, TYPE, W, partOf} from './design';
import {HothDefs, HothGround} from './Hoth';

/**
 * A COURIER BAG CHAPTER CARD.
 *
 * Deliberately the same furniture as the Keystone cards — left strip, part
 * label, sewn marker, title, plain-English line, group chips, piece codes,
 * ghost marker, footer rule — on a different ground and in a different
 * palette. Someone who has watched the jacket build should not have to learn
 * a new card; they should notice the planet changed.
 *
 * The one structural difference is the LEFT STRIP. On the jacket it was a
 * selvedge, because that is the edge of a bolt of denim and the jacket was
 * about cloth. A bag is about WEBBING, so the strip is a length of it: flat
 * face, bound edges, and the ladder of box stitching that holds a strap down.
 *
 * The marker is drawn by the same stitch engine as the jacket numbers; the
 * glyph table was extended from 0-9 to include A-H so a letter can be sewn.
 * Nothing else in that engine needed to change — it walks a contour and does
 * not care what the contour spells.
 */

export const CourierCard: React.FC<{card: Card; marker?: MarkerMode}> = ({card, marker = 'letter'}) => {
  const frame = useCurrentFrame();
  const t = secs(frame);
  const id = `cb-${card.id}`;
  const part = partOf(card);
  const mark = marker === 'letter' ? card.letter : card.number;
  const lines = card.title.split('\n');

  return (
    <AbsoluteFill style={{opacity: 1 - outT(frame)}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <HothDefs id={id} />
        </defs>

        <HothGround id={id} seed={card.id} t={t} />

        <Webbing t={at(frame, BEAT.selvedge[0], BEAT.selvedge[1])} />

        {/* The ghost marker, set early and left alone. It is furniture: it
            gives the right-hand half weight without asking to be read. */}
        {mark ? (
          <text
            x={GRID.rightEdge}
            y={H - 96}
            textAnchor="end"
            fontFamily={FONT}
            fontSize={TYPE.ghost}
            fontWeight={700}
            fill={C.white}
            opacity={0.035 * at(frame, BEAT.ghost[0], BEAT.ghost[1])}
          >
            {mark}
          </text>
        ) : null}

        {/* The rule under the part label. */}
        <rect
          x={GRID.left}
          y={176}
          width={(GRID.rightEdge - GRID.left) * at(frame, BEAT.rule[0], BEAT.rule[1])}
          height={1}
          fill={C.rule}
        />

        {part ? (
          <g opacity={at(frame, BEAT.part[0], BEAT.part[1])}>
            <rect x={GRID.left} y={132} width={34} height={3} fill={C.green} />
            {/* One text element, two tspans.
                The part name was positioned at a FIXED offset from the label,
                which works for "PART ONE" and "PART TWO" and collides on
                "PART THREE" — the word is wider and ate the separator. Letting
                the second span flow after the first removes the measurement
                from the problem entirely. */}
            <text
              x={GRID.left + 52}
              y={144}
              fontFamily={FONT}
              fontSize={TYPE.label}
              letterSpacing={3.4}
            >
              <tspan fontWeight={700} fill={C.green}>{`PART ${part.roman}`}</tspan>
              <tspan fontWeight={400} fill={C.mute}>{`   ·   ${part.name}`}</tspan>
            </text>
          </g>
        ) : null}

        {/* The marker, sewn on. */}
        {mark ? (
          <StitchedNumber
            digits={mark}
            size={TYPE.marker}
            x={GRID.left}
            baseline={338}
            rate={card.stitchRate ?? 80}
            feel={card.stitchFeel ?? 'steady'}
            seed={`courier-${card.id}`}
            startAt={NUMBER_SEW.start}
            now={t}
            resolveAt={NUMBER_SEW.resolve}
            colour={C.green}
            solidColour={C.white}
          />
        ) : null}

        {/* Title. Lines stagger, so it sets like type rather than appearing. */}
        {lines.map((l, i) => {
          const p = at(frame, BEAT.title[0] + i * BEAT.titleStagger, BEAT.title[1] + i * BEAT.titleStagger);
          return (
            <text
              key={i}
              x={GRID.left}
              y={492 + i * 104}
              fontFamily={FONT}
              fontSize={lines.length > 1 || l.length > 16 ? TYPE.titleSm : TYPE.title}
              fontWeight={700}
              fill={C.white}
              opacity={p}
              transform={`translate(0 ${(1 - p) * 14})`}
            >
              {l}
            </text>
          );
        })}

        <text
          x={GRID.left}
          y={492 + (lines.length - 1) * 104 + 68}
          fontFamily={FONT}
          fontSize={TYPE.sub}
          fontWeight={400}
          fill={C.green}
          opacity={at(frame, BEAT.sub[0], BEAT.sub[1])}
        >
          {card.sub}
        </text>

        {card.line ? (
          <text
            x={GRID.left}
            y={492 + (lines.length - 1) * 104 + 122}
            fontFamily={FONT}
            fontSize={TYPE.line}
            fontWeight={400}
            fill={C.text}
            opacity={at(frame, BEAT.line[0], BEAT.line[1])}
          >
            {card.line}
          </text>
        ) : null}

        {/* Right column: what to put aside, and its codes. */}
        {card.groups?.length ? (
          <>
            <text
              x={GRID.right}
              y={246}
              fontFamily={FONT}
              fontSize={TYPE.label - 4}
              fontWeight={700}
              letterSpacing={2.6}
              fill={C.faint}
              opacity={at(frame, BEAT.groupsLabel[0], BEAT.groupsLabel[1])}
            >
              PUT THESE ASIDE
            </text>
            {card.groups.map((g, i) => {
              const grp = GROUPS[g];
              const p = at(frame, BEAT.chips[0] + i * BEAT.chipStagger, BEAT.chips[1] + i * BEAT.chipStagger);
              return (
                <g key={g} opacity={p}>
                  <rect x={GRID.right} y={282 + i * 52} width={22} height={22} rx={3} fill={grp.colour} />
                  <text
                    x={GRID.right + 38}
                    y={300 + i * 52}
                    fontFamily={FONT}
                    fontSize={TYPE.chip}
                    fontWeight={400}
                    fill={C.text}
                  >
                    {grp.name}
                  </text>
                </g>
              );
            })}
          </>
        ) : null}

        {card.pieces ? (
          <>
            <text
              x={GRID.right}
              y={282 + (card.groups?.length ?? 0) * 52 + 54}
              fontFamily={FONT}
              fontSize={TYPE.label - 4}
              fontWeight={700}
              letterSpacing={2.6}
              fill={C.faint}
              opacity={at(frame, BEAT.piecesLabel[0], BEAT.piecesLabel[1])}
            >
              PATTERN PIECES
            </text>
            <text
              x={GRID.right}
              y={282 + (card.groups?.length ?? 0) * 52 + 100}
              fontFamily={FONT}
              fontSize={TYPE.code}
              fontWeight={400}
              fill={C.white}
              opacity={at(frame, BEAT.pieces[0], BEAT.pieces[1])}
            >
              {card.pieces}
            </text>
            {card.extra ? (
              <text
                x={GRID.right}
                y={282 + (card.groups?.length ?? 0) * 52 + 142}
                fontFamily={FONT}
                fontSize={TYPE.code - 4}
                fontWeight={400}
                fill={C.mute}
                opacity={at(frame, BEAT.extra[0], BEAT.extra[1])}
              >
                {card.extra}
              </text>
            ) : null}
          </>
        ) : null}

        {/* Footer. */}
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
            THE COURIER BAG
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

/**
 * THE LEFT STRIP — a length of webbing, wiping down the edge.
 *
 * The jacket cards used a selvedge because the jacket was about cloth. This
 * pattern is about straps, so the strip is the thing the bag is actually made
 * of: a flat woven face, a slightly darker bound edge each side, and the
 * ladder of bar-tacks that holds webbing down. It wipes on from the top in the
 * direction the card is read.
 */
const Webbing: React.FC<{t: number}> = ({t}) => {
  const h = H * t;
  if (h <= 0) return null;
  const tacks = Math.floor(h / 260);
  return (
    <g>
      <rect x={0} y={0} width={STRIP} height={h} fill="#30343C" />
      {/* bound edges */}
      <rect x={0} y={0} width={5} height={h} fill="#22252B" />
      <rect x={STRIP - 5} y={0} width={5} height={h} fill="#22252B" />
      {/* the woven face: fine vertical ribs, the way webbing is laid */}
      {Array.from({length: 11}).map((_, i) => (
        <rect key={i} x={10 + i * 7} y={0} width={2} height={h} fill="#FFFFFF" opacity={0.022} />
      ))}
      {/* Edge stitching: two continuous dashed rows down the length. The first
          version put isolated green dashes at intervals and they read as tally
          marks — webbing is stitched ALONG its whole length, and it is the
          continuity that makes it look like a strap. */}
      {[20, STRIP - 20].map((x) => (
        <line
          key={x}
          x1={x}
          y1={0}
          x2={x}
          y2={h}
          stroke={C.green}
          strokeWidth={1.6}
          strokeDasharray="9 7"
          opacity={0.38}
        />
      ))}
      {/* Bar tacks, where a strap would actually be anchored. */}
      {Array.from({length: tacks}).map((_, i) => {
        const y = 150 + i * 260;
        if (y > h - 40) return null;
        return (
          <g key={i} opacity={0.5}>
            <rect x={20} y={y} width={STRIP - 40} height={30} fill="none" stroke={C.green} strokeWidth={1.6} />
            <line x1={20} y1={y} x2={STRIP - 20} y2={y + 30} stroke={C.green} strokeWidth={1.4} />
            <line x1={20} y1={y + 30} x2={STRIP - 20} y2={y} stroke={C.green} strokeWidth={1.4} />
          </g>
        );
      })}
      <rect x={STRIP} y={0} width={1} height={h} fill={C.ice} opacity={0.07} />
    </g>
  );
};

export {TOTAL};
