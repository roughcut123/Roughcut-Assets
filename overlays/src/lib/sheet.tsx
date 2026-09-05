import React from 'react';
import {tornRectPath, type Edge} from './masks';
import {drawOn} from './motion';

/**
 * Field-sheet primitives. Shared by the popups (§8) and the fabric segment
 * (§5) so both read as the same document.
 *
 * §3.4 hard rules observed throughout: flat fills only (no gradient), no drop
 * shadow, no rounded corners. Colour comes from tokens.css via var(--rc-*);
 * there are no hex codes in this file.
 */

export const MONO = '"Courier Prime", "Courier New", monospace';
/** Courier Prime advances exactly 0.6em, which lets layout be computed. */
export const MONO_ADVANCE = 0.6;

export const wrapMono = (text: string, cols: number): string[] => {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= cols || !line) line = next;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out;
};

/** A torn fragment of the field sheet. Flat fill, no shadow, no gradient. */
export const Sheet: React.FC<{
  w: number;
  h: number;
  variant: number;
  torn?: Edge[];
  fill?: string;
}> = ({w, h, variant, torn = ['right', 'bottom'], fill = 'var(--rc-paper)'}) => (
  <path d={tornRectPath({w, h, variant, torn})} fill={fill} />
);

/** A ruled line that draws on, rather than fading up (§3.5). */
export const Rule: React.FC<{
  x: number;
  y: number;
  w: number;
  frame: number;
  start: number;
  dur?: number;
  stroke?: string;
  width?: number;
}> = ({x, y, w, frame, start, dur = 7, stroke = 'var(--rc-ink)', width = 4}) => {
  const p = drawOn(frame, start, dur);
  return (
    <line
      x1={x}
      y1={y}
      x2={x + w}
      y2={y}
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={w}
      strokeDashoffset={w * (1 - p)}
    />
  );
};
