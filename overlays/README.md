# Roughcut overlay pack

Twenty animated sewing overlays and two paper transitions for 4K YouTube
videos, built with [Remotion](https://remotion.dev). Everything renders at
3840x2160 with a **transparent background**, so you drop a clip on the track
above your footage and it just sits there.

The overlays are designed for the **top-left** of the frame. They are laid out
as hand-cut paper - torn edges, a real cast shadow, tailor's marks - to sit
with the workbench and print-room footage rather than on top of it like a
graphic.

---

## Quick start

```bash
cd overlays
npm install          # first time only
npm run studio       # opens the visual editor at localhost:3000
```

The Studio is where you preview, scrub and retype. To export:

```bash
npm run render                      # all 22, ProRes 4444 with alpha (.mov)
npm run render -- SeamAllowance     # just one
npm run render -- --webm            # VP9 + alpha instead - a tenth the size
npm run render -- --force           # re-render files that already exist
```

Files land in `out/`. Already-rendered files are skipped, so you can stop and
restart a long render.

**Budget roughly 2 minutes and 130 MB per overlay** for ProRes on a normal
laptop. If you only want a few, name them. `out/` is gitignored - these files
are far too big to commit.

### Which format

| | Use it for | Size |
|---|---|---|
| **ProRes 4444** (default) | Premiere, Resolve, Final Cut | ~130 MB each |
| **WebM / VP9** (`--webm`) | CapCut, DaVinci web, anything browser-based | ~10 MB each |

Both carry a real alpha channel. If your editor shows a black box instead of
transparency, you have imported the file but not enabled the alpha channel -
in Premiere that is *Interpret Footage > Alpha Channel > Straight*.

---

## The twenty overlays

Ordered the way you actually hit them making a garment.

| # | Composition | Says | Motion |
|---|---|---|---|
| 01 | `ToileFirst` | Toile it in calico | slide |
| 02 | `Grainline` | Follow the selvedge | cut |
| 03 | `CuttingFabric` | Cut in a single layer | cut |
| 04 | `SeamAllowance` | 1/4" - keep it the same | stamp |
| 05 | `RightSidesTogether` | Right sides together | slide |
| 06 | `BasteFirst` | Baste it first | drop |
| 07 | `JerseyNeedle` | Ballpoint for jersey | stamp |
| 08 | `Backstitch` | Backstitch both ends | drop |
| 09 | `Staystitch` | 1/2" from the raw edge | stamp |
| 10 | `ClipTheCurves` | Clip in, notch out | cut |
| 11 | `EaseTheSleeve` | Ease it, don't gather | drop |
| 12 | `Interfacing` | Bumpy side down | cut |
| 13 | `PressSeamsOpen` | Press seams open | unfold |
| 14 | `Topstitch` | 1/8" from the seam | slide |
| 15 | `BarTack` | Bar tack it | stamp |
| 16 | `FinishTheEdge` | Overlock or zigzag | slide |
| 17 | `BiasBinding` | Cut at 45 degrees | cut |
| 18 | `DoubleFoldHem` | Turn it twice | unfold |
| 19 | `Unpick` | Unpick it | drop |
| 20 | `LeaveItRaw` | Leave the seam raw | cut |

Each is 4.33 seconds by default: about 0.9s in, 2.8s holding, 0.7s out.

See `preview.jpg` for what they all look like.

---

## The two transitions

Full-frame paper wipes with alpha. Put the transition on the track above and
**place your cut where the paper fully covers the frame**:

| Composition | Length | Fully covers | Cut on |
|---|---|---|---|
| `PaperSweep` | 27 frames (0.9s) | frames 9-16 | **frame 13** |
| `PaperStrips` | 36 frames (1.2s) | frames 12-25 | **frame 19** |

(Those coverage windows were measured off the rendered frames, not estimated -
if you change `seconds` in the Studio they will move.)

---

## Changing the words

Open the Studio, pick a composition, and use the props panel on the right. You
can edit, per overlay, without touching any code:

- **eyebrow** - the small tracked label
- **headline** - a list; each entry is one line
- **note** - the mono line underneath
- **tone** - `tissue` / `manila` / `kraft` / `slate`
- **accent** - the colour of the label and stitching
- **holdSeconds** - how long it sits on screen before leaving

The clip gets longer or shorter automatically when you change `holdSeconds`.

Two things to know:

- **Keep the note to about 35 characters.** Cards are sized to their default
  copy. A longer note wraps to a second line, which still fits but looks
  looser. If you want a much longer note, bump that overlay's `width` in
  `src/overlays/specs.ts`.
- **`slate` is the one for bright shots.** The dark card holds up against a
  blown-out white studio wall where a pale card can get lost.

### Adding a 21st overlay

Add an entry to the array in `src/overlays/specs.ts`. It gets picked up
automatically - composition, Studio entry, and render. Pick a `layout`
(`measure`, `instruction`, `tag`, `diagram`), a `motif`, an `anim`, and a
`tone`, and it will match the rest.

---

## How it is put together

```
src/
  lib/
    theme.ts      palette, type scale, timings - change global look here
    paper.tsx     the paper itself: torn outline, grain, shadow, punched holes
    anim.ts       the five entrance/exit styles
    motifs.tsx    the fourteen tailor's marks
    layouts.tsx   the four card layouts
    fonts.ts      loads the vendored fonts
  overlays/
    specs.ts      >>> the twenty overlays are defined here <<<
    Overlay.tsx   binds a spec to the animation and the card
  transitions/
    Transitions.tsx
```

A few decisions worth knowing about if you come back to this later:

**Randomness is seeded.** Every torn edge and every frayed thread comes from
Remotion's `random(seed)`, never `Math.random()`. Remotion renders frames
across several parallel processes, so an unseeded random would give each frame
a different edge and the paper would boil in the export.

**Fonts are vendored.** Archivo and IBM Plex Mono live in `public/fonts` rather
than being pulled from Google at render time, so a render never depends on the
network and always produces identical type. Both are SIL Open Font Licence.

**Cards are sized by hand, not measured at runtime.** Measuring text in the
browser would let cards auto-fit any copy, but it races with font loading and
can silently produce a different layout in the export than in the Studio.
Fixed sizes with headroom are the boring, reliable choice.

**Everything is authored at 4K.** To make a 1080p version, render the same
composition with `--scale=0.25` rather than editing any numbers.

---

## If a render fails

Remotion downloads its own copy of Chrome the first time you render. If your
network blocks that, point it at a browser you already have:

```bash
REMOTION_BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render
```
