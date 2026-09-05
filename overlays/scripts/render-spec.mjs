#!/usr/bin/env node
/**
 * Renders the spec asset library (ROUGHCUT_OVERLAY_SPEC.md).
 *
 *   node scripts/render-spec.mjs                    # everything
 *   node scripts/render-spec.mjs RC-POPUP-SEAMALLOWANCE
 *   node scripts/render-spec.mjs --family=TRANS     # one family
 *   node scripts/render-spec.mjs --no-loop          # skip _LOOP variants
 *   node scripts/render-spec.mjs --no-sheets        # skip contact sheets
 *
 * Delivery is fixed by §1 and is NOT configurable: 3840x2160, 25 fps,
 * ProRes 4444, yuva444p10le, straight alpha, no audio. §16 forbids WebM, so
 * there is deliberately no such flag.
 *
 * The asset list comes from Remotion itself, so it cannot drift from the code.
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {listCompositions, browserArgs} from './lib-assets.mjs';

const args = process.argv.slice(2);
const noLoop = args.includes('--no-loop');
const noSheets = args.includes('--no-sheets');
const force = args.includes('--force');
const famArg = (args.find((a) => a.startsWith('--family=')) || '').split('=')[1];
const only = args.filter((a) => !a.startsWith('--'));

const OUT = 'out';
const PREVIEWS = join(OUT, '_previews');
mkdirSync(PREVIEWS, {recursive: true});

const remotion = (extra) =>
  execFileSync('npx', ['remotion', ...extra, ...browserArgs], {stdio: 'inherit', maxBuffer: 32 * 1024 * 1024});

const DELIVERY = ['--codec=prores', '--prores-profile=4444', '--pixel-format=yuva444p10le', '--muted'];

let assets = listCompositions();
if (famArg) assets = assets.filter((a) => a.id.startsWith(`RC-${famArg.toUpperCase()}-`));
if (only.length) assets = assets.filter((a) => only.includes(a.id));
if (noLoop) assets = assets.filter((a) => !a.id.endsWith('-LOOP'));

if (assets.length === 0) {
  console.error('No matching assets.');
  process.exit(1);
}

console.log(`Rendering ${assets.length} asset(s) as ProRes 4444, 25fps, straight alpha, no audio.\n`);

let n = 0;
for (const a of assets) {
  const target = join(OUT, `${a.file}.mov`);
  if (existsSync(target) && !force) {
    console.log(`- ${a.file} already rendered, skipping (--force to redo)`);
    continue;
  }
  console.log(`\n[${++n}/${assets.length}] ${a.file}  (${a.family}, ${a.frames}f)`);
  remotion(['render', 'src/index.ts', a.id, target, ...DELIVERY]);

  // §1: a 5-frame PNG contact sheet at 0/25/50/75/100% of duration.
  if (!noSheets && !a.id.endsWith('-LOOP')) {
    const last = a.frames - 1;
    for (const pct of [0, 25, 50, 75, 100]) {
      remotion([
        'still',
        'src/index.ts',
        a.id,
        join(PREVIEWS, `${a.file}_${String(pct).padStart(3, '0')}.png`),
        `--frame=${Math.round((last * pct) / 100)}`,
      ]);
    }
  }
}

console.log(`\nDone. Assets in ./${OUT}/, contact sheets in ./${PREVIEWS}/`);
