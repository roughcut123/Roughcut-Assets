# Roughcut overlay pack

Twenty-two animated sewing overlays and three paper transitions for 4K YouTube
videos, built with [Remotion](https://remotion.dev). Everything renders at
3840x2160 with a **transparent background**, so you drop a clip on the track
above your footage and it sits there.

The overlays are designed for the **top-left** of the frame.

---

## The design language

Taken from the Roughcut YouTube design board.

**Type** is four faces, each doing one job:

- **Cinzel** — the headline, in Roman inscriptional capitals. This is the
  lettering of *RELIC FROM THE PAST CRAFTED IN THE PRESENT*: cut, not written.
- **Pinyon Script** — the small label, in the engraved hand of the garment
  authentication certificate.
- **EB Garamond** — the note underneath, matching the old-style text set
  beneath the Dürer plates.
- **UnifrakturMaguntia** — Textura blackletter, **reserved for the RoughCut
  wordmark itself** (`eyebrowStyle: 'gothic'`, used on `LeaveItRaw`).
  Blackletter as a general-purpose label turns into pastiche fast.

**Colour** is pigment, not screen colour. The grounds are washed papers as
they come off a scan — *vellum*, *foxed*, *parchment* — plus two deep grounds:
*oxblood*, after the relic cover, and *nocturne*, from the darkest of the
paintings. The accents:

| Token | Pigment | Hex |
|---|---|---|
| `gilt` | the gold Roman capitals, the halo, the frames | `#C0982F` |
| `sanguine` | red chalk, terracotta | `#A85C43` |
| `bole` | the red-brown laid under gold leaf | `#6E2B26` |
| `verdigris` | the teal of the woodblock waves | `#2F5F58` |
| `rose` | the pink of the woodblock sky | `#B4726C` |
| `lapis` | deep blue | `#274A70` |

`gilt` is kept for the two deep grounds, where it sings; on pale paper it
hasn't the contrast to carry small text.

**The paper is aged, not just textured.** Three layers: broad uneven staining,
sparse rust-brown foxing spots, and a fine grain. That is what makes it read
as a scan of an old page rather than a coloured rectangle.

**Cards can be sewn on, not just laid down.** `stitched` runs a sashiko
running stitch just inside the cut edge, in the card's accent colour — the way
the patches are sewn onto the bags. It boils with the outline, so the thread
moves with the paper rather than floating over it. Used on `RelicLabel` and
`PatchSheets`.

**And it wobbles.** The outline is genuinely irregular, corners included, and
it *boils*: the sheet is re-cut every four frames from a small set of
variants, the way a physical papercut gets nudged between exposures in stop
motion. Turn it off per card with `boil={false}` if a shot needs to be still.

The two deep grounds, `oxblood` and `nocturne`, are the ones for bright shots
— a pale card can get lost against a blown-out white wall.

---

## Quick start

```bash
cd overlays
npm install          # first time only
npm run studio       # opens the visual editor at localhost:3000
```

The Studio is where you preview, scrub and retype. To export:

```bash
npm run render                      # all 25, ProRes 4444 with alpha (.mov)
npm run render -- SeamAllowance     # just one
npm run render -- --webm            # VP9 + alpha instead - a tenth the size
npm run render -- --force           # re-render files that already exist
```

Files land in `out/`. Already-rendered files are skipped, so you can stop and
restart a long render.

**Budget roughly 2 minutes and 130 MB per overlay** for ProRes on a normal
laptop. `out/` is gitignored — these files are far too big to commit.

### Which format

| | Use it for | Size |
|---|---|---|
| **ProRes 4444** (default) | Premiere, Resolve, Final Cut | ~130 MB each |
| **WebM / VP9** (`--webm`) | CapCut, DaVinci web, anything browser-based | ~10 MB each |

Both carry a real alpha channel. If your editor shows a black box instead of
transparency, you have imported the file but not enabled the alpha channel —
in Premiere that is *Interpret Footage > Alpha Channel > Straight*.

---

## The overlays

Ordered the way you actually hit them making a garment.

| # | Composition | Says | Ground | Motion |
|---|---|---|---|---|
| 01 | `ToileFirst` | Toile it in calico | foxed | slide |
| 02 | `Grainline` | Follow the selvedge | vellum | cut |
| 03 | `CuttingFabric` | Cut in a single layer | vellum | cut |
| 04 | `SeamAllowance` | 1/4" — keep it the same | vellum | stamp |
| 05 | `RightSidesTogether` | Right sides together | parchment | slide |
| 06 | `BasteFirst` | Baste it first | parchment | drop |
| 07 | `JerseyNeedle` | Ballpoint for jersey | nocturne | stamp |
| 08 | `Backstitch` | Backstitch both ends | vellum | drop |
| 09 | `Staystitch` | 1/2" from the raw edge | vellum | stamp |
| 10 | `ClipTheCurves` | Clip in, notch out | vellum | cut |
| 11 | `EaseTheSleeve` | Ease it, don't gather | foxed | drop |
| 12 | `Interfacing` | Bumpy side down | vellum | cut |
| 13 | `PressSeamsOpen` | Press seams open | vellum | unfold |
| 14 | `Topstitch` | 1/8" from the seam | foxed | slide |
| 15 | `BarTack` | Bar tack it | nocturne | stamp |
| 16 | `FinishTheEdge` | Overlock or zigzag | vellum | slide |
| 17 | `BiasBinding` | Cut at 45 degrees | vellum | cut |
| 18 | `DoubleFoldHem` | Turn it twice | foxed | unfold |
| 19 | `Unpick` | Unpick it | parchment | drop |
| 20 | `LeaveItRaw` | Leave the seam raw | oxblood | cut |
| 21 | `RelicLabel` | Certificate of authentication | parchment | unfold |
| 22 | `PatchSheets` | Patch sheets — link in the description | foxed | drop |

Each is 4.33 seconds by default: about 0.9s in, 2.8s holding, 0.7s out.

`RelicLabel` is the odd one out: a centred certificate after the Made in Italy
garment label — heading, rule, body, `Garment No.` / `Final stitching.` rules
to fill in by hand, and the wordmark at the foot. It is bigger than the rest
(1320x940) and reads as an intro or outro card rather than a caption. Its own
layout, `label`, takes `body`, `fields` and `signature` in place of a note.

`preview.jpg` shows all twenty standing still. To watch them move:

```bash
npx remotion render src/index.ts Showreel out/showreel.mp4 --codec=h264 --scale=0.5
```

`Showreel` is preview only — no alpha channel — and `npm run render`
deliberately skips it. Its backdrop is generated in code, not a photograph.

---

## The two transitions

Full-frame paper wipes with alpha. Put the transition on the track above and
**place your cut where the paper fully covers the frame**:

| Composition | Length | Fully covers | Cut on |
|---|---|---|---|
| `PaperSweep` | 27 frames (0.9s) | frames 9–16 | **frame 13** |
| `PaperStrips` | 36 frames (1.2s) | frames 12–25 | **frame 19** |
| `MosaicBuild` | 48 frames (1.6s) | frames 20–29 | **frame 25** |

`MosaicBuild` is the mosaic note from the board: 390 tesserae fly in, settle
into a gold ground, hold, then scatter. All of them live in one SVG — giving
each its own paper card would mean 390 sets of filters per frame, which is not
something you can render. The tiles overlap by 10px so a landed mosaic has no
pinholes of video showing through it.

Those coverage windows were measured off the rendered alpha, not estimated —
if you change `seconds` in the Studio they will move.

---

## Changing the words

Open the Studio, pick a composition, and use the props panel on the right. Per
overlay, without touching code:

- **eyebrow** — the script label (blackletter on the wordmark card)
- **headline** — a list; each entry is one line
- **note** — the line underneath
- **tone** — `vellum` / `foxed` / `parchment` / `oxblood` / `nocturne`
- **accent** — the pigment used for the script and the stitching
- **holdSeconds** — how long it sits on screen before leaving

The clip gets longer or shorter automatically when you change `holdSeconds`.

Two things to know:

- **Keep the note to about 40 characters.** Cards are sized to their default
  copy. A longer note wraps to a second line, which still fits but looks
  looser. For much longer copy, bump that overlay's `width` in
  `src/overlays/specs.ts`.
- **Headlines are set in capitals automatically.** Cinzel is an
  inscriptional face drawn for caps, so type them in normal sentence case
  and the layout will set them.

### Adding a 21st overlay

Add an entry to the array in `src/overlays/specs.ts`. It gets picked up
automatically — composition, Studio entry, and render. Pick a `layout`
(`measure`, `instruction`, `tag`, `diagram`, `label`), a `motif`, an `anim`,
and a `tone`, and it will match the rest. Add `stitched: true` if it should
read as sewn on.

---

## How it is put together

```
src/
  lib/
    theme.ts      pigments, type scale, timings - change the global look here
    paper.tsx     the paper: cut outline, the boil, staining, foxing, shadow
    anim.ts       the five entrance/exit styles
    motifs.tsx    the fourteen tailor's marks
    layouts.tsx   the four card layouts
    fonts.ts      loads the vendored fonts
  overlays/
    specs.ts      >>> the twenty overlays are defined here <<<
    Overlay.tsx   binds a spec to the animation and the card
  transitions/
    Transitions.tsx
  preview/
    Showreel.tsx  preview only
```

A few decisions worth knowing about if you come back to this later:

**Randomness is seeded.** Every cut edge and every frayed thread comes from
Remotion's `random(seed)`, never `Math.random()`. That matters twice over:
Remotion renders frames across several parallel processes, so an unseeded
random would give each frame a different edge; and the boil depends on being
able to ask for a *specific* variant of an edge and get the same one back
every time. Sampling noise per frame instead gives television static, not
handmade animation.

**Fonts are vendored.** All four families live in `public/fonts` with their
OFL licences rather than being pulled from Google at render time, so a render
never depends on the network and always produces identical type.

**Cards are sized by hand, not measured at runtime.** Measuring text in the
browser would let cards auto-fit any copy, but it races with font loading and
can silently produce a different layout in the export than in the Studio.
Fixed sizes with headroom are the boring, reliable choice.

**Everything is authored at 4K.** To make a 1080p version, render the same
composition with `--scale=0.25` rather than editing any numbers.

**No photography is used anywhere in this project** — the showreel backdrop is
drawn in code.

---

## If a render fails

Remotion downloads its own copy of Chrome the first time you render. If your
network blocks that, point it at a browser you already have:

```bash
REMOTION_BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render
```
