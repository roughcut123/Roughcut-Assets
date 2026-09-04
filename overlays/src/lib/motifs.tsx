import React from 'react';
import {random} from 'remotion';

/** SVG ids must not contain the colons React's useId emits. */
const useSvgId = (prefix: string) => `${prefix}${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;

type MotifProps = {
  width: number;
  height: number;
  color: string;
  /** 0 -> 1 draw-on progress. */
  progress: number;
  accent?: string;
};

/**
 * A machine stitch that sews itself on, left to right. Revealed with a moving
 * clip rect rather than a dash offset so the dashes stay a fixed length and
 * land like real stitches instead of stretching.
 */
export const StitchRule: React.FC<{
  width: number;
  color: string;
  progress: number;
  thickness?: number;
  dash?: [number, number];
}> = ({width, color, progress, thickness = 6, dash = [34, 18]}) => {
  const id = useSvgId('stitch');
  const h = thickness * 5;
  return (
    <svg width={width} height={h} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-4} y={-40} width={width * progress + 4} height={h + 80} />
        </clipPath>
      </defs>
      <line
        x1={0}
        y1={h / 2}
        x2={width}
        y2={h / 2}
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${dash[0]} ${dash[1]}`}
        clipPath={`url(#${id})`}
      />
    </svg>
  );
};

/** The grainline: a double-headed arrow, laid parallel to the selvedge. */
export const GrainlineArrow: React.FC<MotifProps> = ({width, height, color, progress}) => {
  const id = useSvgId('grain');
  const y = height / 2;
  const head = Math.min(46, height * 0.42);
  const sw = 7;
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-40} width={width * progress + 10} height={height + 80} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round">
        <line x1={4} y1={y} x2={width - 4} y2={y} />
        <polyline points={`${4 + head},${y - head * 0.62} ${4},${y} ${4 + head},${y + head * 0.62}`} />
        <polyline
          points={`${width - 4 - head},${y - head * 0.62} ${width - 4},${y} ${width - 4 - head},${y + head * 0.62}`}
        />
      </g>
    </svg>
  );
};

/**
 * A seam pressed open, in section: the joined panels across the top, the two
 * allowances laid flat apart underneath, and the stitch line through the
 * middle. The earlier dimension-line version just read as a letter H at
 * video size.
 */
export const SeamOpen: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('seam');
  const yTop = height * 0.4;
  const yAll = height * 0.62;
  const cx = width / 2;
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-30} width={width * progress + 10} height={height + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round">
        <line x1={0} y1={yTop} x2={width} y2={yTop} stroke={color} strokeWidth={9} />
        <line x1={width * 0.08} y1={yAll} x2={cx - 14} y2={yAll} stroke={color} strokeWidth={7} opacity={0.7} />
        <line x1={cx + 14} y1={yAll} x2={width * 0.92} y2={yAll} stroke={color} strokeWidth={7} opacity={0.7} />
        <line
          x1={cx}
          y1={height * 0.18}
          x2={cx}
          y2={height * 0.78}
          stroke={accent ?? color}
          strokeWidth={6}
          strokeDasharray="18 12"
        />
      </g>
    </svg>
  );
};

/** Notches: the little wedges you cut to match two pieces up. */
export const NotchMark: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('notch');
  const y = height * 0.72;
  const w = 34;
  const d = 40;
  const xs = [width * 0.24, width * 0.56, width * 0.85];
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-30} width={width * progress + 10} height={height + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M 6 ${y} Q ${width * 0.5} ${y - height * 0.6} ${width - 6} ${y}`} stroke={color} strokeWidth={8} />
        {xs.map((x, i) => (
          <polyline
            key={i}
            points={`${x - w / 2},${y - i * 3} ${x},${y - d - i * 3} ${x + w / 2},${y - i * 3}`}
            stroke={accent ?? color}
            strokeWidth={6}
          />
        ))}
      </g>
    </svg>
  );
};

/** Overlock / zigzag finish along a raw edge. */
export const ZigzagEdge: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('zig');
  const y = height * 0.62;
  const amp = height * 0.3;
  const step = 44;
  const pts: string[] = [];
  for (let x = 0, i = 0; x <= width; x += step, i++) {
    pts.push(`${x},${i % 2 === 0 ? y : y - amp}`);
  }
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-30} width={width * progress + 10} height={height + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1={0} y1={y + amp * 0.55} x2={width} y2={y + amp * 0.55} stroke={color} strokeWidth={8} />
        <polyline points={pts.join(' ')} stroke={accent ?? color} strokeWidth={6} />
      </g>
    </svg>
  );
};

/** Cross-section of a double-turned hem: a flat spiral of three layers. */
export const DoubleFold: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('fold');
  const t = height * 0.17;
  const r = t / 2;
  const y0 = height * 0.26;
  const xa = width * 0.16;
  const xb = width * 0.6;
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-30} width={width * progress + 10} height={height + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d={`M ${width} ${y0}
              L ${xa} ${y0}
              A ${r} ${r} 0 0 0 ${xa} ${y0 + t}
              L ${xb} ${y0 + t}
              A ${r} ${r} 0 0 1 ${xb} ${y0 + t * 2}
              L ${width * 0.24} ${y0 + t * 2}`}
          stroke={color}
          strokeWidth={9}
        />
        {/* the topstitch that holds the fold down */}
        <line
          x1={width * 0.3}
          y1={y0 + t * 2.9}
          x2={width * 0.98}
          y2={y0 + t * 2.9}
          stroke={accent ?? color}
          strokeWidth={6}
          strokeDasharray="24 14"
        />
      </g>
    </svg>
  );
};

/** 45-degree hatching: the bias. */
export const BiasHatch: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('bias');
  const lines: React.ReactNode[] = [];
  const gap = 46;
  for (let i = -height; i < width; i += gap) {
    lines.push(<line key={i} x1={i} y1={height} x2={i + height} y2={0} stroke={color} strokeWidth={5} />);
  }
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-10} width={width * progress + 10} height={height + 20} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} opacity={0.65}>{lines}</g>
      <g clipPath={`url(#${id})`}>
        <line x1={0} y1={height} x2={height} y2={0} stroke={accent ?? color} strokeWidth={9} strokeLinecap="round" />
      </g>
    </svg>
  );
};

/** Gathering / easing stitches along a sleeve head. */
export const EaseCurve: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('ease');
  const path = `M 8 ${height - 10} Q ${width * 0.5} ${-height * 0.28} ${width - 8} ${height - 10}`;
  const dots = [0.16, 0.3, 0.44, 0.58, 0.72, 0.86];
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-40} width={width * progress + 10} height={height + 80} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none">
        <path d={path} stroke={color} strokeWidth={8} strokeLinecap="round" />
        <path d={path} stroke={accent ?? color} strokeWidth={5} strokeDasharray="18 22" opacity={0.9}
          transform={`translate(0 ${height * 0.16})`} />
        {dots.map((t, i) => {
          // point on the quadratic bezier at t
          const x = (1 - t) ** 2 * 8 + 2 * (1 - t) * t * (width * 0.5) + t ** 2 * (width - 8);
          const y =
            (1 - t) ** 2 * (height - 10) + 2 * (1 - t) * t * (-height * 0.28) + t ** 2 * (height - 10);
          return <circle key={i} cx={x} cy={y} r={11} fill={accent ?? color} />;
        })}
      </g>
    </svg>
  );
};

/** Screen-printing registration mark. */
export const RegistrationMark: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('reg');
  const s = Math.min(width, height);
  const c = s / 2;
  const r = s * 0.32;
  return (
    <svg width={s} height={s} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <circle cx={c} cy={c} r={s * progress * 0.75} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeWidth={6}>
        <circle cx={c} cy={c} r={r} stroke={color} />
        <circle cx={c} cy={c} r={r * 0.42} stroke={accent ?? color} />
        <line x1={c} y1={0} x2={c} y2={s} stroke={color} />
        <line x1={0} y1={c} x2={s} y2={c} stroke={color} />
      </g>
    </svg>
  );
};

/** A pinned dart / stress point: crossed bar tack. */
export const BarTack: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('tack');
  const y = height * 0.5;
  const bw = width * 0.5;
  const x0 = (width - bw) / 2;
  const bars = [0, 1, 2, 3, 4, 5];
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-20} width={width * progress + 10} height={height + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} strokeLinecap="round">
        <line x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={7} />
        {bars.map((i) => {
          const x = x0 + (bw / (bars.length - 1)) * i;
          return <line key={i} x1={x} y1={y - height * 0.28} x2={x} y2={y + height * 0.28} stroke={accent ?? color} strokeWidth={9} />;
        })}
      </g>
    </svg>
  );
};


/**
 * Stacked sheets of cloth, drawn as parallelograms so they read as layers
 * lying at an angle. (A skew transform does almost nothing to a wide, short
 * rectangle - the bars stay horizontal and it still reads as a menu icon, so
 * the slant has to be in the geometry.)
 */
export const FabricLayers: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('layers');
  const th = height * 0.11;
  const gap = height * 0.15;
  const w = width * 0.74;
  const slant = height * 0.17;
  const rows = [0, 1, 2];
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-30} width={width * progress + 10} height={height + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {rows.map((i) => {
          const x0 = i * width * 0.07;
          const y0 = height * 0.34 + i * (th + gap);
          return (
            <path
              key={i}
              d={`M ${x0} ${y0} L ${x0 + w} ${y0 - slant} L ${x0 + w} ${y0 - slant + th} L ${x0} ${y0 + th} Z`}
              fill={i === 0 ? accent ?? color : color}
              opacity={i === 0 ? 1 : 0.4}
            />
          );
        })}
      </g>
    </svg>
  );
};

/** Parallel rows of machine stitching. */
export const StitchRows: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('rows');
  const rows = [0, 1, 2];
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-20} width={width * progress + 10} height={height + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {rows.map((i) => (
          <line
            key={i}
            x1={i * 22}
            y1={height * 0.3 + i * height * 0.2}
            x2={width - i * 12}
            y2={height * 0.3 + i * height * 0.2}
            stroke={i === 1 ? accent ?? color : color}
            strokeWidth={7}
            strokeDasharray={i === 1 ? '30 16' : '22 18'}
            opacity={i === 1 ? 1 : 0.6}
          />
        ))}
      </g>
    </svg>
  );
};

/** A cutting line: one line in, two apart - the piece has been cut. */
export const CutLine: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('cut');
  const y = height * 0.5;
  const split = width * 0.44;
  const spread = height * 0.26;
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-30} width={width * progress + 10} height={height + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round">
        <line x1={0} y1={y} x2={split} y2={y} stroke={color} strokeWidth={7} strokeDasharray="26 16" />
        <line x1={split} y1={y} x2={width} y2={y - spread} stroke={accent ?? color} strokeWidth={7} strokeDasharray="26 16" />
        <line x1={split} y1={y} x2={width} y2={y + spread} stroke={accent ?? color} strokeWidth={7} strokeDasharray="26 16" />
      </g>
    </svg>
  );
};

/** Press: a broad arrow coming down onto the cloth, with heat. */
export const PressArrow: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('press');
  const cx = width * 0.5;
  const yb = height * 0.84;
  const head = height * 0.24;
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-20} width={width * progress + 10} height={height + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1={0} y1={yb} x2={width} y2={yb} stroke={color} strokeWidth={9} />
        <line x1={cx} y1={height * 0.16} x2={cx} y2={yb - height * 0.1} stroke={accent ?? color} strokeWidth={10} />
        <path
          d={`M ${cx - head * 0.7} ${yb - height * 0.1 - head * 0.7} L ${cx} ${yb - height * 0.1} L ${cx + head * 0.7} ${yb - height * 0.1 - head * 0.7}`}
          stroke={accent ?? color}
          strokeWidth={10}
        />
        <path d={`M ${cx - width * 0.34} ${height * 0.3} q ${width * 0.06} ${-height * 0.12} ${width * 0.12} 0`} stroke={color} strokeWidth={5} opacity={0.55} />
        <path d={`M ${cx + width * 0.22} ${height * 0.3} q ${width * 0.06} ${-height * 0.12} ${width * 0.12} 0`} stroke={color} strokeWidth={5} opacity={0.55} />
      </g>
    </svg>
  );
};

/** A raw edge fraying out - loose threads hanging off the cut. */
export const FrayEdge: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('fray');
  const y = height * 0.4;
  const n = 13;
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-20} width={width * progress + 10} height={height + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round">
        <line x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={8} />
        {Array.from({length: n}).map((_, i) => {
          // Seeded, so the threads never twitch between frames.
          const x = (width / n) * (i + 0.5);
          const len = height * (0.24 + random(`fray-l-${i}`) * 0.44);
          const drift = (random(`fray-d-${i}`) - 0.5) * width * 0.06;
          const curl = (random(`fray-c-${i}`) - 0.5) * width * 0.05;
          return (
            <path
              key={i}
              d={`M ${x} ${y} q ${curl} ${len * 0.6} ${drift} ${len}`}
              stroke={accent ?? color}
              strokeWidth={4.5}
              opacity={0.85}
            />
          );
        })}
      </g>
    </svg>
  );
};


/** A tape measure: graduated ticks along a rule. */
export const MeasureRule: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('rule');
  const y = height * 0.62;
  const n = 11;
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-20} width={width * progress + 10} height={height + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} strokeLinecap="round">
        <line x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={8} />
        {Array.from({length: n}).map((_, i) => {
          const x = (width / (n - 1)) * i;
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x}
              y2={y - height * (major ? 0.42 : 0.22)}
              stroke={major ? accent ?? color : color}
              strokeWidth={major ? 8 : 5}
              opacity={major ? 1 : 0.7}
            />
          );
        })}
      </g>
    </svg>
  );
};

/** Water: prewashing, before a single cut is made. */
export const WashWaves: React.FC<MotifProps> = ({width, height, color, progress, accent}) => {
  const id = useSvgId('wash');
  const rows = [0, 1, 2];
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-10} y={-20} width={width * progress + 10} height={height + 40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round">
        {rows.map((i) => {
          const y = height * 0.3 + i * height * 0.22;
          const a = height * 0.09;
          const w = width / 3;
          return (
            <path
              key={i}
              d={`M 0 ${y} q ${w / 4} ${-a} ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0`}
              stroke={i === 1 ? accent ?? color : color}
              strokeWidth={i === 1 ? 7 : 6}
              opacity={i === 1 ? 1 : 0.6}
            />
          );
        })}
      </g>
    </svg>
  );
};

export const motifs = {
  grainline: GrainlineArrow,
  seamOpen: SeamOpen,
  notch: NotchMark,
  zigzag: ZigzagEdge,
  doubleFold: DoubleFold,
  bias: BiasHatch,
  ease: EaseCurve,
  registration: RegistrationMark,
  barTack: BarTack,
  layers: FabricLayers,
  stitchRows: StitchRows,
  cutLine: CutLine,
  pressArrow: PressArrow,
  fray: FrayEdge,
  rule: MeasureRule,
  wash: WashWaves,
} as const;

export type MotifName = keyof typeof motifs;
