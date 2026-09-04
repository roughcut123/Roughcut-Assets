import React from 'react';
import {font, tones, type ToneName, type} from './theme';
import {PaperCard, type Edge, type Punch} from './paper';
import {StitchRule, motifs, type MotifName} from './motifs';

export type Layout = 'measure' | 'instruction' | 'tag' | 'diagram';

export type Value = {
  /** Whole number, e.g. "1" in 1 1/2. Optional. */
  whole?: string;
  num?: string;
  den?: string;
  /** Rendered small and raised: ", mm, deg. */
  unit?: string;
};

/**
 * A diagonal vulgar fraction, built by hand. Browsers will not render 1/4 as a
 * proper fraction from a font at this size reliably, and the stacked version
 * is what a pattern instruction actually looks like.
 */
const Fraction: React.FC<{num: string; den: string; size: number; color: string}> = ({
  num,
  den,
  size,
  color,
}) => {
  const w = size * 0.8;
  const h = size;
  const digit = size * 0.58;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <span
        style={{
          position: 'absolute',
          top: -digit * 0.14,
          left: 0,
          fontSize: digit,
          fontWeight: 700,
          lineHeight: 1,
          color,
        }}
      >
        {num}
      </span>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line
          x1={w * 0.02}
          y1={h * 0.97}
          x2={w * 0.98}
          y2={h * 0.06}
          stroke={color}
          strokeWidth={size * 0.055}
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          bottom: -digit * 0.16,
          right: 0,
          fontSize: digit,
          fontWeight: 700,
          lineHeight: 1,
          color,
        }}
      >
        {den}
      </span>
    </div>
  );
};

const BigValue: React.FC<{value: Value; size: number; color: string}> = ({value, size, color}) => (
  <div style={{display: 'flex', alignItems: 'flex-start', gap: size * 0.06, fontFamily: font.display}}>
    {value.whole ? (
      <span style={{fontSize: size, fontWeight: 700, lineHeight: 0.88, color}}>{value.whole}</span>
    ) : null}
    {value.num && value.den ? (
      <Fraction num={value.num} den={value.den} size={size * 0.86} color={color} />
    ) : null}
    {value.unit ? (
      <span
        style={{
          fontSize: size * 0.32,
          fontWeight: 600,
          lineHeight: 1,
          marginTop: size * 0.04,
          color,
        }}
      >
        {value.unit}
      </span>
    ) : null}
  </div>
);

export type EyebrowStyle = 'script' | 'gothic';

/**
 * The small label. `script` is the engraved hand from the authentication
 * certificate and is the default; `gothic` is the Textura of the RoughCut
 * wordmark and is reserved for the name itself - blackletter used as a
 * general-purpose label turns into pastiche very quickly.
 */
const Eyebrow: React.FC<{
  children: React.ReactNode;
  color: string;
  variant?: EyebrowStyle;
}> = ({children, color, variant = 'script'}) => (
  <div
    style={
      variant === 'gothic'
        ? {fontFamily: font.gothic, fontSize: type.gothic, lineHeight: 1.0, letterSpacing: 1, color}
        : {
            fontFamily: font.script,
            fontSize: type.script,
            fontWeight: 400,
            lineHeight: 0.9,
            // Pinyon's glyphs overhang their boxes; a small inset keeps a
            // capital's swash from hanging outside the text column.
            paddingLeft: 6,
            color,
          }
    }
  >
    {children}
  </div>
);

const Headline: React.FC<{lines: string[]; color: string; size?: number}> = ({
  lines,
  color,
  size = type.headline,
}) => (
  <div
    style={{
      fontFamily: font.display,
      fontSize: size,
      fontWeight: 700,
      // Cinzel is an inscriptional face: it is drawn for capitals and wants
      // the letters spaced apart, the way they are cut into stone.
      textTransform: 'uppercase',
      lineHeight: 1.06,
      letterSpacing: size * type.headlineTrack,
      color,
    }}
  >
    {lines.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

const Note: React.FC<{children: React.ReactNode; color: string}> = ({children, color}) => (
  <div
    style={{
      fontFamily: font.text,
      fontSize: type.note,
      fontWeight: 400,
      lineHeight: 1.24,
      color,
    }}
  >
    {children}
  </div>
);

export type CardContent = {
  layout: Layout;
  eyebrow?: string;
  eyebrowStyle?: EyebrowStyle;
  headline?: string[];
  note?: string;
  value?: Value;
  motif?: MotifName;
  index?: string;
  tone: ToneName;
  accent: string;
  width: number;
  height: number;
  seed: string;
  torn?: Edge[];
  /** 0 -> 1 progress for the detail pass (stitching, diagrams). */
  detail: number;
};

const PAD = 92;

export const Card: React.FC<CardContent> = (c) => {
  const t = tones[c.tone];
  const Motif = c.motif ? motifs[c.motif] : null;

  const punch: Punch | undefined =
    c.layout === 'tag' ? {cx: 78, cy: c.height / 2, r: 30} : undefined;

  const pad = c.layout === 'tag' ? {left: 168, right: PAD} : {left: PAD, right: PAD};

  return (
    <PaperCard
      width={c.width}
      height={c.height}
      seed={c.seed}
      tone={c.tone}
      torn={c.torn}
      punch={punch}
      contentStyle={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: pad.left,
        paddingRight: pad.right,
        paddingTop: PAD * 0.7,
        paddingBottom: PAD * 0.7,
        gap: 70,
      }}
    >
      {c.layout === 'measure' ? (
        <>
          <div style={{display: 'flex', flexDirection: 'column', gap: 26, flex: '0 0 auto'}}>
            {c.eyebrow ? <Eyebrow color={c.accent} variant={c.eyebrowStyle}>{c.eyebrow}</Eyebrow> : null}
            <BigValue value={c.value ?? {}} size={type.big} color={t.text} />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              flex: '1 1 auto',
              borderLeft: `4px solid ${t.textSoft}`,
              paddingLeft: 56,
              alignSelf: 'stretch',
              justifyContent: 'center',
            }}
          >
            {c.headline ? <Headline lines={c.headline} color={t.text} size={type.headlineSm * 0.84} /> : null}
            <StitchRule width={340} color={c.accent} progress={c.detail} />
            {c.note ? <Note color={t.textSoft}>{c.note}</Note> : null}
          </div>
        </>
      ) : null}

      {c.layout === 'instruction' ? (
        <>
          <div style={{display: 'flex', flexDirection: 'column', gap: 24, flex: '1 1 auto'}}>
            {c.eyebrow ? <Eyebrow color={c.accent} variant={c.eyebrowStyle}>{c.eyebrow}</Eyebrow> : null}
            {c.headline ? <Headline lines={c.headline} color={t.text} /> : null}
            <StitchRule width={c.width * 0.42} color={c.accent} progress={c.detail} />
            {c.note ? <Note color={t.textSoft}>{c.note}</Note> : null}
          </div>
          {Motif ? (
            <div style={{flex: '0 0 auto', opacity: 0.9}}>
              <Motif width={300} height={230} color={t.textSoft} accent={c.accent} progress={c.detail} />
            </div>
          ) : null}
        </>
      ) : null}

      {c.layout === 'tag' ? (
        <>
          {c.index ? (
            <div
              style={{
                fontFamily: font.text,
                fontSize: 88,
                fontWeight: 600,
                color: c.accent,
                flex: '0 0 auto',
                alignSelf: 'center',
                letterSpacing: 2,
              }}
            >
              {c.index}
            </div>
          ) : null}
          <div style={{display: 'flex', flexDirection: 'column', gap: 22, flex: '1 1 auto'}}>
            {c.eyebrow ? <Eyebrow color={c.accent} variant={c.eyebrowStyle}>{c.eyebrow}</Eyebrow> : null}
            {c.headline ? <Headline lines={c.headline} color={t.text} size={type.headlineSm} /> : null}
            <StitchRule width={c.width * 0.34} color={c.accent} progress={c.detail} />
            {c.note ? <Note color={t.textSoft}>{c.note}</Note> : null}
          </div>
        </>
      ) : null}

      {c.layout === 'diagram' ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 26, width: '100%'}}>
          {c.eyebrow ? <Eyebrow color={c.accent} variant={c.eyebrowStyle}>{c.eyebrow}</Eyebrow> : null}
          <div style={{display: 'flex', alignItems: 'center', gap: 60, width: '100%'}}>
            <div style={{flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 20}}>
              {c.headline ? <Headline lines={c.headline} color={t.text} size={type.headlineSm} /> : null}
              <StitchRule width={c.width * 0.3} color={c.accent} progress={c.detail} />
              {c.note ? <Note color={t.textSoft}>{c.note}</Note> : null}
            </div>
            {Motif ? (
              <div style={{flex: '0 0 auto'}}>
                <Motif width={360} height={240} color={t.text} accent={c.accent} progress={c.detail} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </PaperCard>
  );
};
