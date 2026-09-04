#!/usr/bin/env node
/**
 * Renders every overlay and transition to a file you can drop straight onto
 * an editing timeline, with a real alpha channel.
 *
 *   npm run render                    # everything, ProRes 4444 (.mov)
 *   npm run render -- SeamAllowance   # just these compositions
 *   npm run render -- --webm          # VP9 + alpha instead (much smaller)
 *   npm run render -- --force         # re-render files that already exist
 *
 * ProRes 4444 is the default because it is what Premiere, Resolve and Final
 * Cut all handle natively with transparency. It is not small - budget roughly
 * 130 MB per overlay. WebM is a tenth of the size and is the better choice for
 * CapCut or anything browser-based.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';

const args = process.argv.slice(2);
const webm = args.includes('--webm');
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

const OUT = 'out';
mkdirSync(OUT, {recursive: true});

// Some machines need to be pointed at a browser explicitly; on a normal
// install Remotion downloads its own and this stays unset.
const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
const browserArgs = browser ? ['--browser-executable', browser] : [];

const remotion = (extra, opts = {}) =>
  execFileSync('npx', ['remotion', ...extra, ...browserArgs], {
    encoding: 'utf8',
    stdio: opts.capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
    maxBuffer: 32 * 1024 * 1024,
  });

/** Ask Remotion itself what exists, so this never drifts from specs.ts. */
const listCompositions = () => {
  const out = remotion(['compositions', 'src/index.ts'], {capture: true});
  return out
    .split('\n')
    .map((l) => l.match(/^([A-Za-z][A-Za-z0-9]*)\s+\d+\s+\d+x\d+\s+\d+/))
    .filter(Boolean)
    .map((m) => m[1]);
};

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const codecArgs = webm
  ? ['--codec=vp9', '--pixel-format=yuva420p']
  : ['--codec=prores', '--prores-profile=4444', '--pixel-format=yuva444p10le'];

const ext = webm ? 'webm' : 'mov';

const all = listCompositions();
const targets = only.length ? all.filter((c) => only.includes(c)) : all;

if (only.length) {
  const unknown = only.filter((o) => !all.includes(o));
  if (unknown.length) {
    console.error(`Unknown composition(s): ${unknown.join(', ')}`);
    console.error(`Available: ${all.join(', ')}`);
    process.exit(1);
  }
}

console.log(`Rendering ${targets.length} composition(s) as ${webm ? 'WebM/VP9' : 'ProRes 4444'}\n`);

let done = 0;
let skipped = 0;
for (const id of targets) {
  const file = join(OUT, `${kebab(id)}.${ext}`);
  if (existsSync(file) && !force) {
    console.log(`- ${id} -> already rendered, skipping (use --force to redo)`);
    skipped++;
    continue;
  }
  console.log(`\n[${done + skipped + 1}/${targets.length}] ${id} -> ${file}`);
  remotion(['render', 'src/index.ts', id, file, ...codecArgs]);
  done++;
}

console.log(`\nDone. ${done} rendered, ${skipped} skipped. Files are in ./${OUT}/`);
