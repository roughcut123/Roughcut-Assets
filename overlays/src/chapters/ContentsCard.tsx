import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  C,
  CARDS,
  CONTENTS,
  Card,
  FOOT_RULE_X2,
  FOOT_RULE_Y,
  H,
  LEFT_X,
  PARTS,
  RULE_W,
  TYPE,
  W,
  Y,
} from './design';
import {Ground, Selvedge, T} from './Furniture';

/**
 * Fast, because twelve of them have to land inside the card's opening. A
 * contents row is a fifth the size of a chapter number, so its outline is
 * about 50 stitches; at this rate each takes roughly a quarter of a second and
 * the last one finishes just as the card settles.
 */
const CONTENTS_STITCH_RATE = 200;
import {at, BEAT, outT, secs} from './timing';
import {StitchedNumber} from './StitchedNumber';

/**
 * THE CONTENTS CARD.
 *
 * A different layout to the chapters: no number, no right column, no ghost —
 * instead the twelve chapters in three columns, grouped by part. The brief
 * asks for each row to be individually targetable ("so chapters can be
 * revealed one at a time or highlighted individually"), so each carries its
 * own `data-ch` and its own entry.
 *
 * The rows are built from the same `chapters.json` the chapter cards use, so
 * the contents can never fall out of step with the cards it lists — which is
 * the failure mode a hand-built contents slide always eventually has.
 */
export const ContentsCard: React.FC<{card: Card; gradient?: boolean; twill?: boolean}> = ({
  card,
  gradient,
  twill,
}) => {
  const frame = useCurrentFrame();
  const out = outT(frame);
  const rise = (t: number, px: number) => ({opacity: t, transform: `translateY(${(1 - t) * px}px)`});

  const chapters = CARDS.filter((c) => c.type === 'chapter');
  const byPart = PARTS.map((_, i) => chapters.filter((c) => c.part === i));

  const tSel = at(frame, BEAT.selvedge[0], BEAT.selvedge[1]);
  const tSew = at(frame, BEAT.stitches[0], BEAT.stitches[1]);
  const tRule = at(frame, BEAT.rule[0], BEAT.rule[1]);
  const tKick = at(frame, BEAT.part[0], BEAT.part[1]);
  const tTitle = at(frame, BEAT.title[0], BEAT.title[1]);
  const tSub = at(frame, BEAT.sub[0], BEAT.sub[1]);
  const tFoot = at(frame, BEAT.foot[0], BEAT.foot[1]);

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <g opacity={1 - out}>
          <Ground gradient={gradient} twill={twill} />
          <Selvedge wipe={tSel * (1 - out)} sewn={tSew * (1 - out)} />

          <rect id="rule" x={LEFT_X} y={CONTENTS.ruleY} width={RULE_W * tRule} height={5} fill={C.gold} />

          <g id="part" style={rise(tKick, 10)}>
            <T x={LEFT_X} y={CONTENTS.kickerBase} {...TYPE.part} size={CONTENTS.kickerSize}>
              THE KEYSTONE JACKET
            </T>
          </g>

          <g id="title" style={rise(tTitle, 24)}>
            <T x={LEFT_X} y={CONTENTS.titleBase} {...TYPE.title} size={CONTENTS.titleSize}>
              {card.title}
            </T>
          </g>

          <g id="sub" style={rise(tSub, 14)}>
            <T x={LEFT_X} y={CONTENTS.subBase} {...TYPE.sub} size={CONTENTS.subSize}>
              {card.sub}
            </T>
          </g>

          <g id="rows">
            {byPart.map((list, pi) => {
              const x = CONTENTS.cols[pi];
              // The part heading arrives just before its own chapters do.
              const tHead = at(frame, 1.0 + pi * 0.12, 1.4 + pi * 0.12);
              return (
                <g key={pi}>
                  <g style={rise(tHead, 10)}>
                    <T
                      x={x}
                      y={CONTENTS.partBase}
                      {...TYPE.label}
                      size={CONTENTS.partSize}
                      colour={C.gold}
                    >
                      {PARTS[pi].name}
                    </T>
                  </g>
                  {list.map((c, ri) => {
                    // Revealed one at a time, down each column in turn, so the
                    // eye reads the build order rather than the whole grid.
                    const idx = chapters.indexOf(c);
                    // The title follows its own number onto the page.
                    const t = at(
                      frame,
                      CONTENTS.rowsFrom + idx * CONTENTS.rowStagger + 0.18,
                      CONTENTS.rowsFrom + idx * CONTENTS.rowStagger + 0.5,
                    );
                    const y = CONTENTS.rowFirstBase + ri * CONTENTS.rowStep;
                    return (
                      <g key={c.id} className="row" data-ch={c.id}>
                        {/*
                          §5: the chapter numbers stitch on in sequence, one
                          after another down the columns, "like a seam running
                          the length of the page". 60ms apart, and fast — this
                          previews the device before a full chapter card uses
                          it.

                          The thread is gold, as it is everywhere else, and
                          settles into the muted number the signed-off card
                          shows. The seam is the moment; the list is not.
                        */}
                        <StitchedNumber
                          digits={c.id}
                          size={CONTENTS.rowSize}
                          x={x}
                          baseline={y}
                          rate={CONTENTS_STITCH_RATE}
                          feel="steady"
                          seed={`row${c.id}`}
                          startAt={CONTENTS.rowsFrom + idx * CONTENTS.rowStagger}
                          now={secs(frame)}
                          solidColour={C.rowNum}
                        />
                        <g style={rise(t, 12)}>
                          <T
                            x={x + CONTENTS.numToTitle}
                            y={y}
                            size={CONTENTS.rowSize}
                            weight={700}
                            colour={C.cream}
                          >
                            {c.title.replace('\n', ' ')}
                          </T>
                        </g>
                      </g>
                    );
                  })}
                </g>
              );
            })}
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
