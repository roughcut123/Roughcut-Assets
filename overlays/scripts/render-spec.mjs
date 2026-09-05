#!/usr/bin/env node
/**
 * Renders the spec asset library (ROUGHCUT_OVERLAY_SPEC.md).
 *
 *   node scripts/render-spec.mjs                       # everything
 *   node scripts/render-spec.mjs RC-POPUP-SEAMALLOWANCE
 *   node scripts/render-spec.mjs --no-loop             # skip _LOOP variants
 *
 * Delivery is fixed by §1 and is not configurable here: 3840x2160, 25 fps,
 * ProRes 4444, yuva444p10le, straight alpha, no audio. §16 forbids WebM
 * output, so there is deliberately no such flag.
 *
 * Composition ids use hyphens because Remotion rejects underscores; the §2
 * filename convention is restored on output. See NOTES.md §2.1.
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const args = process.argv.slice(2);
const noLoop = args.includes('--no-loop');
const only = args.filter((a) => !a.startsWith('--'));

const OUT = 'out';
const PREVIEWS = join(OUT, '_previews');
mkdirSync(PREVIEWS, {recursive: true});

const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
const browserArgs = browser ? ['--browser-executable', browser] : [];

const remotion = (extra) =>
  execFileSync('npx', ['remotion', ...extra, ...browserArgs], {
    stdio: 'inherit',
    maxBuffer: 32 * 1024 * 1024,
  });

/** id -> delivered filename, and the frame count for the contact sheet. */
const ASSETS = [
  {id: 'RC-POPUP-SEAMALLOWANCE', file: 'RC_POPUP_SEAMALLOWANCE', frames: 137},
];

const DELIVERY = [
  '--codec=prores',
  '--prores-profile=4444',
  '--pixel-format=yuva444p10le',
  '--muted', // §1: audio none
];

const targets = only.length ? ASSETS.filter((a) => only.includes(a.id)) : ASSETS;
if (only.length && targets.length === 0) {
  console.error(`Unknown asset(s): ${only.join(', ')}`);
  console.error(`Available: ${ASSETS.map((a) => a.id).join(', ')}`);
  process.exit(1);
}

for (const a of targets) {
  console.log(`\n=== ${a.file} ===`);
  remotion(['render', 'src/index.ts', a.id, join(OUT, `${a.file}.mov`), ...DELIVERY]);

  // §1: a 5-frame PNG contact sheet at 0/25/50/75/100% of duration, so the
  // asset can be approved without opening Resolve.
  const last = a.frames - 1;
  for (const pct of [0, 25, 50, 75, 100]) {
    const frame = Math.round((last * pct) / 100);
    remotion([
      'still',
      'src/index.ts',
      a.id,
      join(PREVIEWS, `${a.file}_${String(pct).padStart(3, '0')}.png`),
      `--frame=${frame}`,
    ]);
  }

  if (!noLoop) {
    // §13: every asset also ships a _LOOP variant, hold extended to 10s.
    remotion(['render', 'src/index.ts', `${a.id}-LOOP`, join(OUT, `${a.file}_LOOP.mov`), ...DELIVERY]);
  }
}

console.log(`\nDone. Assets in ./${OUT}/, contact sheets in ./${PREVIEWS}/`);
