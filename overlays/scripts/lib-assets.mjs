/**
 * Single source of truth for the delivered asset list.
 *
 * Rather than maintaining a parallel registry that can drift from the code,
 * this asks Remotion what compositions exist and derives everything else.
 * Composition ids are the §2 filenames with hyphens in place of underscores
 * (Remotion rejects `_` in an id — NOTES.md §2.1), so the mapping is exact.
 */
import {execFileSync} from 'node:child_process';

const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
export const browserArgs = browser ? ['--browser-executable', browser] : [];

/** §2 naming: RC_<FAMILY>_<NAME>_<VARIANT> */
export const fileOf = (id) => id.replace(/-/g, '_');

const FAMILIES = [
  ['RC-TRANS-', 'A · chapter transition', 'full frame'],
  ['RC-TITLE-', 'B · chapter title card', 'lower-left third'],
  ['RC-POPUP-', 'C · popup', 'top-left'],
  ['RC-FABRIC-', '§5 · fabric segment', 'left, vertically centred'],
  ['RC-CORR-', 'D · correction', 'top-left'],
  ['RC-ASIDE-', 'D · aside', 'bottom-right'],
  ['RC-XREF-', 'E · cross-reference', 'lower-right'],
  ['RC-DAY-', 'F · day break', 'lower-left'],
  ['RC-REVEAL-', 'G · final reveal', 'centre / lower-left'],
];

export const familyOf = (id) => {
  const hit = FAMILIES.find(([p]) => id.startsWith(p));
  return hit ? {family: hit[1], position: hit[2]} : {family: '—', position: '—'};
};

export const listCompositions = () => {
  const out = execFileSync('npx', ['remotion', 'compositions', 'src/index.ts', ...browserArgs], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return out
    .split('\n')
    .map((l) => l.match(/^(RC-[A-Za-z0-9-]+)\s+(\d+)\s+(\d+)x(\d+)\s+(\d+)/))
    .filter(Boolean)
    .map((m) => ({
      id: m[1],
      file: fileOf(m[1]),
      fps: Number(m[2]),
      width: Number(m[3]),
      height: Number(m[4]),
      frames: Number(m[5]),
      ...familyOf(m[1]),
    }));
};
