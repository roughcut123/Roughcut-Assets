#!/usr/bin/env node
/**
 * Generates out/README_VINCE.md — spec §14.
 *
 * "one line per asset: filename, family, duration, screen position, one-line
 * purpose ... Keep it to one page. He needs a lookup table, not a manual."
 */
import {writeFileSync, mkdirSync} from 'node:fs';
import {listCompositions} from './lib-assets.mjs';

const PURPOSE = {
  RC_POPUP_SEAMALLOWANCE: 'The ¼in / 6mm rule. Most repeated line on the channel.',
  RC_POPUP_TESTSQUARE: 'Print page one and measure it before anything else.',
  RC_POPUP_TILING: 'Overlap to the bleed line, never butt the pages.',
  RC_POPUP_BULLSEYE: 'Corner bullseyes sit on top of each other.',
  RC_POPUP_FORMATS: 'A4 / US Letter / A0.',
  RC_POPUP_CUTTWOMIRRORED: 'Good sides together, gives a left and a right.',
  RC_POPUP_GRAINLINE: 'Arrow parallel to the selvedge.',
  RC_POPUP_SIZING: 'Garment measurements, not body measurements.',
  RC_POPUP_HEMALLOWANCE: '½in hem allowance, fabric only.',
  RC_DEMO_SEAMALLOWANCE: 'Shows the ¼in gap between needle and raw edge.',
  RC_DEMO_RIGHTSIDESTOGETHER: 'Panel turns over and lands print to print.',
  RC_DEMO_BACKSTITCH: 'Three forward, three back, then away.',
  RC_DEMO_GRAINLINE: 'Arrow swings parallel to the selvedge.',
  RC_DEMO_PRESSSEAMSOPEN: 'Allowances stand, iron lands, they lie open.',
  RC_DEMO_TILING: "Each page's edge lands on the previous page's alignment line.",
  RC_DEMO_PAGEORDER: 'The assembly map: letters across, numbers down, A1 first.',
  RC_DEMO_TESTSQUARE: 'Print at 100%, then measure the two-inch square.',
  RC_DEMO_FORMATS: 'A4, US Letter, A0 — and the sixteen pages A0 replaces.',
  RC_DEMO_SIZING: 'Measured across the finished garment, laid flat.',
  RC_FABRIC_SEQUENCE: 'The whole fabric monologue. DROP IN UNCHANGED.',
  RC_REVEAL_CERT: 'Certificate of authentication. The closing frame.',
  RC_REVEAL_LOWER: 'Slim strip for try-on B-roll: pattern name and price.',
  RC_DAY_END: 'End-of-session sign-off.',
  RC_ASIDE_OVERLOCKER: 'Running gag. Tiny, deadpan.',
  RC_ASIDE_IRON: 'Running gag. Tiny, deadpan.',
};

const PARAMETERISED = new Set([
  'RC_POPUP_ZIPLENGTH', 'RC_POPUP_THREAD', 'RC_POPUP_FABRICWEIGHT', 'RC_POPUP_PIECECODE',
  'RC_XREF_SKIPAHEAD', 'RC_REVEAL_CERT', 'RC_REVEAL_LOWER',
]);

const assets = listCompositions().filter((a) => !a.id.endsWith('-LOOP'));
const fps = assets[0]?.fps ?? 25;

const rows = assets
  .map((a) => {
    const secs = (a.frames / a.fps).toFixed(2);
    const purpose =
      PURPOSE[a.file] ||
      (a.file.startsWith('RC_TRANS_') ? `Cover / hold / uncover into ${a.family.split('·')[1] ?? 'the next chapter'}.` : '') ||
      (a.file.startsWith('RC_TITLE_') ? 'Chapter title card.' : '') ||
      (a.file.startsWith('RC_POPUP_SKILLLEVEL') ? 'Skill level, filled bar.' : '') ||
      (a.file.startsWith('RC_POPUP_') ? 'Technique note.' : '') ||
      (a.file.startsWith('RC_CORR_') ? 'Correction — red hand annotation.' : '') ||
      (a.file.startsWith('RC_XREF_') ? 'Points at another video.' : '') ||
      (a.file.startsWith('RC_DAY_') ? 'Morning stamp on the cut.' : '') ||
      (a.file.startsWith('RC_FABRIC_') ? 'Fabric segment beat.' : '') ||
      '—';
    const p = PARAMETERISED.has(a.file) ? ' ‡' : '';
    return `| \`${a.file}.mov\`${p} | ${a.family} | ${a.frames}f / ${secs}s | ${a.position} | ${purpose} |`;
  })
  .join('\n');

const md = `# ROUGHCUT OVERLAY LIBRARY — for Vince

**Drop every file at 0,0.** Artwork is already in its final screen position on a
full 3840×2160 transparent canvas. Do not reposition, do not scale, do not crop.

All files are **3840×2160 ProRes 4444, ${fps} fps, straight (unpremultiplied)
alpha, no audio track.** DaVinci Resolve reads the alpha natively — if you see a
black box, the clip's alpha is set to premultiplied; switch it to straight.

Every asset except \`RC_FABRIC_SEQUENCE\` also ships a **\`_LOOP\`** version with
the hold extended to 10s, for when Jack talks over a point longer than
expected. Trim it — never stretch.

Assets marked **‡** are parameterised and may arrive in several versions per
build (different zip lengths, thread weights, garment names, timestamps).

**\`RC_FABRIC_SEQUENCE.mov\` is the whole fabric monologue in one clip — drop it
in unchanged.** The eight \`RC_FABRIC_0*\` beats are the same content as separate
assets, in case the sequence needs re-spacing against the voice-over.

Transitions cover the frame across their middle. Put your cut under the hold.

| File | Family | Duration | Position | Purpose |
|---|---|---|---|---|
${rows}

_${assets.length} assets. Generated from the compositions themselves — if this
table and the files disagree, the files are right._
`;

mkdirSync('out', {recursive: true});
writeFileSync('out/README_VINCE.md', md);
console.log(`wrote out/README_VINCE.md — ${assets.length} assets`);
