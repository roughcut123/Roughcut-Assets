import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  C,
  Card,
  FOOT_RULE_X2,
  FOOT_RULE_Y,
  GHOST,
  GROUPS,
  H,
  LEFT_X,
  PARTS,
  R,
  RIGHT_X,
  RULE_W,
  TITLE_LEAD,
  TYPE,
  W,
  Y,
} from './design';
import {collapse, Ground, Selvedge, T} from './Furniture';
import {at, BEAT, outT, TOTAL} from './timing';

/**
 * A KEYSTONE CHAPTER CARD.
 *
 * Thirteen cards from one component, driven by chapters.json, because §5 of
 * the brief asks for exactly that: "all 13 cards can be generated from one
 * component rather than 13 hand-built compositions". Two things vary and both
 * were read off the references rather than assumed — a title can be one line
 * or two (card 05 fixes the step at exactly one font size, and everything
 * below the title moves with it), and the right column drops whichever of its
 * three sections a chapter does not use (cards 04, 09, 10 and 12 fix what
 * happens with one group, two, and none).
 */
export const ChapterCard: React.FC<{card: Card; gradient?: boolean; twill?: boolean}> = ({
  card,
  gradient,
  twill,
}) => {
  const frame = useCurrentFrame();
  const out = outT(frame);
  const titleLines = card.title.split('\n');
  const shift = (titleLines.length - 1) * TITLE_LEAD;
  const groups = card.groups ?? [];
  const part = card.part !== undefined ? PARTS[card.part] : undefined;

  /** Entry: fade with a small upward settle. Never more than the brief allows. */
  const rise = (t: number, px: number) => ({
    opacity: t,
    transform: `translateY(${(1 - t) * px}px)`,
  });

  /**
   * Everything in the right column below the chips moves down by one chip step
   * per extra group. Measured: with one group the PIECES label sits at 373 and
   * with three at 521, exactly 2 x 74.
   */
  const drop = groups.length ? (groups.length - 1) * R.step : 0;

  const tGroupsLabel = at(frame, BEAT.groupsLabel[0], BEAT.groupsLabel[1]);
  const tPiecesLabel = at(frame, BEAT.piecesLabel[0], BEAT.piecesLabel[1]);
  const tPieces = at(frame, BEAT.pieces[0], BEAT.pieces[1]);
  const tExtra = at(frame, BEAT.extra[0], BEAT.extra[1]);
  const tSel = at(frame, BEAT.selvedge[0], BEAT.selvedge[1]);
  const tSew = at(frame, BEAT.stitches[0], BEAT.stitches[1]);
  const tRule = at(frame, BEAT.rule[0], BEAT.rule[1]);
  const tPart = at(frame, BEAT.part[0], BEAT.part[1]);
  const tNum = at(frame, BEAT.number[0], BEAT.number[1]);
  const tSub = at(frame, BEAT.sub[0], BEAT.sub[1]);
  const tLine = at(frame, BEAT.line[0], BEAT.line[1]);
  const tGhost = at(frame, BEAT.ghost[0], BEAT.ghost[1]);
  const tFoot = at(frame, BEAT.foot[0], BEAT.foot[1]);

  /**
   * "can drift very slightly (10-15px) over the whole card for subtle life"
   *
   * Centred on the reference position rather than starting there, so the drift
   * is +6 to -6 about the designed spot instead of pulling 12px off it by the
   * end of the card.
   */
  const ghostDrift = 6 - (frame / TOTAL) * 12;

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <g opacity={1 - out}>
          <Ground gradient={gradient} twill={twill} />

          {/* The ghost sits behind everything. */}
          <g id="ghost" opacity={tGhost} transform={`translate(0 ${ghostDrift})`}>
            <T x={GHOST.x} y={GHOST.baseline} {...TYPE.ghost}>
              {card.id}
            </T>
          </g>

          {/* Selvedge wipes down and the stitches trail it, so it reads as
              thread being sewn. On the way out it wipes back up, "in the
              direction it came from". */}
          <Selvedge wipe={tSel * (1 - out)} sewn={tSew * (1 - out)} />

          {part ? (
            <g id="part" style={rise(tPart, 10)}>
              <T x={LEFT_X} y={Y.part} {...TYPE.part}>
                {`PART ${part.roman}  —  ${part.name}`}
              </T>
            </g>
          ) : null}
          <rect id="rule" x={LEFT_X} y={Y.rule} width={RULE_W * tRule} height={5} fill={C.gold} />

          {/* Chapter number: fades in with a slight upward drift, max 20px. */}
          <g id="number" style={rise(tNum, 18)}>
            <T x={LEFT_X} y={Y.number} {...TYPE.number}>
              {card.id}
            </T>
          </g>

          {/* Title lines stagger up, 80ms apart, 24px travel. */}
          <g id="title">
            {titleLines.map((l, i) => (
              <g
                key={i}
                style={rise(
                  at(
                    frame,
                    BEAT.title[0] + i * BEAT.titleStagger,
                    BEAT.title[1] + i * BEAT.titleStagger,
                  ),
                  24,
                )}
              >
                <T x={LEFT_X} y={Y.title + i * TITLE_LEAD} {...TYPE.title}>
                  {l}
                </T>
              </g>
            ))}
          </g>

          <g id="sub" style={rise(tSub, 14)}>
            <T x={LEFT_X} y={Y.sub + shift} {...TYPE.sub}>
              {card.sub}
            </T>
          </g>
          {card.line ? (
            <g id="line" style={rise(tLine, 14)}>
              <T x={LEFT_X} y={Y.line + shift} {...TYPE.line}>
                {card.line}
              </T>
            </g>
          ) : null}

          <g id="right">
            {groups.length ? (
              <>
                <g style={rise(tGroupsLabel, 8)}>
                  <T x={RIGHT_X} y={R.labelBase} {...TYPE.label}>
                    PATTERN GROUPS
                  </T>
                </g>
                {groups.map((gid, i) => {
                  const g = GROUPS[gid];
                  if (!g) return null;
                  // "These are the moment worth animating well." One at a
                  // time, 100ms apart, scaling from 0.9 — the brief's numbers.
                  const t = at(
                    frame,
                    BEAT.chips[0] + i * BEAT.chipStagger,
                    BEAT.chips[1] + i * BEAT.chipStagger,
                  );
                  const y = R.chipTop + i * R.chipStep;
                  const cx = RIGHT_X + R.chipSize / 2;
                  const cy = y + R.chipSize / 2;
                  return (
                    <g
                      key={`${gid}-${i}`}
                      className="group"
                      data-group={gid}
                      opacity={t}
                      style={{
                        transform: `scale(${0.9 + 0.1 * t})`,
                        transformOrigin: `${cx}px ${cy}px`,
                      }}
                    >
                      <rect
                        x={RIGHT_X}
                        y={y}
                        width={R.chipSize}
                        height={R.chipSize}
                        rx={R.chipRadius}
                        fill={g.colour}
                      />
                      <T
                        x={cx}
                        y={y + R.chipDigitBase}
                        size={R.chipDigitSize}
                        weight={700}
                        colour={C.chipInk}
                        anchor="middle"
                      >
                        {gid}
                      </T>
                      <T x={R.nameX} y={R.nameBase + i * R.chipStep} {...TYPE.groupName}>
                        {g.name}
                      </T>
                    </g>
                  );
                })}
              </>
            ) : null}

            {card.pieces ? (
              <>
                <g style={rise(tPiecesLabel, 8)}>
                  <T x={RIGHT_X} y={R.piecesLabelBase + drop} {...TYPE.label}>
                    PIECES
                  </T>
                </g>
                <g id="pieces" style={rise(tPieces, 10)}>
                  <T x={RIGHT_X} y={R.piecesBase + drop} {...TYPE.pieces}>
                    {collapse(card.pieces)}
                  </T>
                </g>
              </>
            ) : null}

            {card.extra ? (
              <g id="extra" style={rise(tExtra, 8)}>
                {/*
                  Card 12 is the only one with an `extra` and neither groups nor
                  pieces, and there it sits at baseline 288 rather than at the
                  top of the column — an empty column does not pull it all the
                  way up. That figure is taken from the reference rather than
                  derived, because one card is not enough to infer a rule from.
                */}
                <T
                  x={RIGHT_X}
                  y={card.pieces || groups.length ? R.extraBase + drop : 288}
                  {...TYPE.extra}
                >
                  {collapse(card.extra)}
                </T>
              </g>
            ) : null}
          </g>

          <g opacity={tFoot}>
            <rect
              id="footrule"
              x={LEFT_X}
              y={FOOT_RULE_Y}
              width={(FOOT_RULE_X2 - LEFT_X) * tFoot}
              height={2}
              fill={C.footRule}
            />
            <T id="foot-l" x={LEFT_X} y={Y.foot} {...TYPE.foot}>
              THE KEYSTONE JACKET
            </T>
            <T id="foot-r" x={FOOT_RULE_X2} y={Y.foot} {...TYPE.foot} anchor="end">
              ROUGHCUT
            </T>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
