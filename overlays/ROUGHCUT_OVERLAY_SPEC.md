# ROUGHCUT — YOUTUBE OVERLAY ASSET SPEC

**For:** Claude Code (Remotion build)
**Deliverable:** alpha-channel video assets for Vince to drop onto tutorial timelines
**Status:** v1 — derived from analysis of 14 Roughcut transcripts (12 builds + 2 explainer videos)

---

## 0. READ THIS FIRST

You are not designing "some overlays for a sewing channel." You are building a fixed
asset library for one specific channel whose videos follow an unusually consistent
structure. Every asset in this document exists because the same moment occurs in the
same place across most or all of the source videos. Frequency evidence is given for
each one.

Three rules that override everything else:

1. **Build only what is listed here.** Do not invent extra assets. If you think
   something is missing, note it in `NOTES.md` and stop.
2. **Every asset renders on a full 3840×2160 transparent canvas**, artwork already
   in its final screen position. Vince drops at 0,0. No tightly-cropped files.
3. **No rounded rectangles. No pill shapes. No drop shadows on floating cards.**
   See §3.4 for why and what to do instead. This is the rule most likely to be
   broken by default styling habits — check every component against it before render.

---

## 1. DELIVERY SPEC

| Property | Value |
|---|---|
| Resolution | 3840 × 2160 |
| Frame rate | 25 fps |
| Codec | Apple ProRes 4444 |
| Pixel format | `yuva444p10le` |
| Alpha | Straight (unpremultiplied) |
| Colour | Rec.709 |
| Audio | None |

Editor is on **DaVinci Resolve**, which reads ProRes 4444 alpha natively on all
platforms. Do not output WebM/VP9 — Resolve handling is inconsistent and Premiere
handling is worse, and this library may outlive the current NLE choice.

Remotion render target is roughly:

```
npx remotion render <composition-id> out/<name>.mov \
  --codec=prores \
  --prores-profile=4444 \
  --pixel-format=yuva444p10le
```

**Verify these flags against the installed Remotion version's docs before batch
rendering.** The ProRes/alpha CLI surface has changed between major versions and the
above is a starting point, not a guarantee. Render one asset, open it in Resolve,
confirm transparency, then batch.

Every composition must also export a **PNG contact sheet** (5 frames: 0%, 25%, 50%,
75%, 100% of duration) to `out/_previews/` so Jack can approve without opening Resolve.

---

## 2. FILE STRUCTURE & NAMING

```
/assets
  /garments        # Jack's own photography — supplied locally, never scraped
  /archive         # public-domain scans, see §3.6
  /textures        # paper, denim, sashiko, torn edges
  /fonts
/src
  /transitions
  /titles
  /popups
  /corrections
  /crossrefs
  /daybreaks
  /reveal
/out
  /_previews
NOTES.md           # anything you couldn't resolve — do not guess, log it
```

Naming: `RC_<FAMILY>_<NAME>_<VARIANT>.mov`

```
RC_TRANS_CUTTING_A.mov
RC_POPUP_SEAMALLOWANCE.mov
RC_TITLE_BACKPANEL.mov
RC_XREF_WELTEDPOCKET.mov
RC_DAY_02.mov
```

Uppercase, no spaces, no dates, no version numbers in filenames. Versions live in git.

---

## 3. BRAND SYSTEM

### 3.1 The spine

The through-line of Roughcut is **archaeology**, not generic heritage workwear.
Excavation, artefact, provenance, documentation. Evidence: the Artifact Expedition
Dispatch field sheets shipped with orders, the certificate of authentication, the
"RELIC FROM THE PAST, CRAFTED IN THE PRESENT" tagline over an excavated sphinx, the
antique map with Bournemouth circled in red, and the Instagram bio positioning the
work as history made wearable.

Every asset should read as though it were **excavated, catalogued or annotated** —
not as though it were designed in a motion graphics tool. When in doubt, ask: does
this look like a page from a field record, or does it look like a lower-third?

### 3.2 Palette

| Token | Hex | Use |
|---|---|---|
| `--rc-paper` | `#EFE5D2` | card grounds, aged paper |
| `--rc-paper-deep` | `#DCCDB0` | secondary paper, shadow side |
| `--rc-ink` | `#3B2E22` | body text, engraved line work |
| `--rc-mahogany` | `#4A2C1A` | full-frame transition grounds |
| `--rc-oxblood` | `#3E2118` | book-cover ground, title cards |
| `--rc-gold` | `#C79A34` | illuminated caps, tagline text |
| `--rc-indigo` | `#33455C` | denim, selvedge accents |
| `--rc-terracotta` | `#9C4A2F` | Pompeii fresco accent |
| `--rc-fresco` | `#A8BCC4` | pale sky blue, sparing |
| `--rc-lamp` | `#E2703A` | the studio lamp orange, sparing |
| `--rc-annotation` | `#B3202A` | red hand-annotation only |

`--rc-annotation` is reserved. It marks **one thing per asset** — a circle, an arrow,
an underline. If two red marks appear in one asset, one of them is wrong.

Define all of these as CSS custom properties in a single `tokens.css`. No hex codes
inline in components.

### 3.3 Type

Three roles. Do not exceed three typefaces in any single asset.

- **Display / blackletter** — the Roughcut wordmark register. Chapter titles and the
  reveal card only. Never body copy, never small sizes.
- **Engraved serif** — a high-contrast Didone or old-style with real small caps.
  Chapter names, taglines, certificate copy.
- **Typewriter / stencil mono** — field-sheet register. All popup body text, all
  labels, all measurements.

Popups use **mono only**. This is deliberate: it makes them read as annotation on a
document rather than as broadcast graphics.

Minimum on-screen text size at 4K: **48px**. Assume a phone viewer.

**Font files:** if the blackletter wordmark and the label serif exist as licensed
font files, they go in `/assets/fonts`. If they are hand-lettered artwork only, use
them as SVG artwork for the wordmark and substitute an open-licence match for
everything else. Log the substitution in `NOTES.md`. Do not silently pick a Google
Font lookalike and call it the brand face.

### 3.4 Shape language — HARD RULES

The brief is explicitly "don't conform to boxes." That is not a licence to be random;
it means every container must be masked to something that exists in Jack's own
physical output. Permitted container edges:

- torn / deckle paper edge (scan-derived, irregular, never symmetrical)
- patch outline — the cut edge of a Roughcut patch sheet, slightly frayed
- selvedge edge — the woven band, with its regular tick marks
- sashiko running-stitch boundary — dashed, hand-irregular
- ruled field-sheet block — straight-edged but with a printed rule, not a fill
- torn map fragment with a fold crease

Forbidden, without exception:

- rounded rectangles, pills, capsules
- uniform drop shadows on floating cards
- gradient fills as decoration
- centred sans-serif in a translucent black bar
- any easing that reads as "UI" (springy bounce, elastic overshoot)

Every mask must be **non-repeating**. Generate at minimum 6 torn-edge variants and
cycle them so the same silhouette never appears twice in one video.

### 3.5 Motion character

Roughcut motion is **physical and slightly imprecise**. Reference: paper being placed
on a table, a stamp being pressed, tesserae being set. Not: sliding, fading, easing
in from off-screen.

- Prefer **hold-then-cut** over long fades.
- Prefer **build-from-parts** over move-from-offscreen.
- Introduce ±1 frame of irregularity on multi-element builds so nothing lands in
  perfect lockstep.
- Ink and stitch marks should **draw on** (stroke-dashoffset), never fade up.
- Paper elements may have a 1–2° rotation. Never 0°. Never more than 4°.

### 3.6 Imagery sources

Two categories, handled differently.

**Jack's own material** — garments, labels, patch sheets, field sheets, the
certificate, studio photography. These live in `/assets/garments`. Jack supplies the
originals locally. **Do not fetch anything from roughcutofficial.com or
roughcutpatterns.com** — the theme serves compressed, resized JPEGs and the fetch may
fail entirely. Reference local paths only.

**Public-domain archive material** — Dürer engravings, illuminated manuscript pages,
ukiyo-e, Pompeii fresco, architectural plates, antique maps and atlases. These are all
out of copyright and available as high-resolution scans from the Rijksmuseum, the
Metropolitan Museum Open Access collection, the British Library's Flickr Commons
release, and the Library of Congress maps division. Use real scans. They will look
dramatically better than anything synthesised, and the grain, foxing and plate marks
are half the aesthetic.

Do not use: anything by a living artist, anything from a museum's restricted
collection, or any AI-generated pastiche of the above.

---

## 4. THE ROUGHCUT VIDEO SPINE

Analysis of 12 build transcripts shows a near-invariant structure. This is the map the
whole asset library hangs off.

| # | Chapter | Appears in | Notes |
|---|---|---|---|
| 1 | Cold-open / hero statement | 12/12 | Scripted VO over B-roll |
| 2 | "Hello everybody and welcome back" | 12/12 | Verbatim in all |
| 3 | Pattern & booklet walkthrough | 12/12 | Often flagged "skip this bit" |
| 4 | Formats — A4 / US Letter / A0 | 12/12 | |
| 5 | 2×2in test square | 11/12 | |
| 6 | Tiling — overlap, don't butt | 11/12 | |
| 7 | Skill level 1–5 | 12/12 | |
| 8 | Sizing — garment not body | 11/12 | |
| 9 | Pattern icon glossary | 10/12 | |
| 10 | Seam allowance rule | 12/12 | The single most repeated line |
| 11 | Modular pathways | 8/12 | Modular patterns only |
| 12 | **Fabric monologue** | 6/12 | **Verbatim scripted — see §5** |
| 13 | Cutting fabric / categorising panels | 12/12 | |
| 14 | Pockets | 12/12 | Always first construction block |
| 15 | Fly / zip | 7/12 | Trousers, shorts, skirt, jackets |
| 16 | Back panel / yoke | 9/12 | |
| 17 | Sleeves / legs | 9/12 | |
| 18 | Lining | 6/12 | |
| 19 | Collar / hood / ribbing | 6/12 | |
| 20 | Joining — shoulder, side, inseam, outseam | 12/12 | |
| 21 | Waistband / hem | 10/12 | |
| 22 | Hardware — rivets, buttons, buckles | 9/12 | |
| 23 | Final reveal / try-on | 12/12 | |
| 24 | Outro — price, website, community | 12/12 | |

Multi-day builds (Yard Jacket, Dungarees, Keystone Denims, Aero, Hoodie, Skirt)
additionally contain **1–3 day-break sign-offs**, always with the same framing: it's
late, I'm tired, it'll be a click of the fingers for you, see you tomorrow. That
recurs often enough to warrant its own asset family (§9).

---

## 5. PRIORITY BUILD — THE FABRIC SEGMENT

**Build this first.** It has the highest return of anything in this document.

The following segment appears near-verbatim in at least six videos (Yard Jacket,
Yard Carpenters ×2, Field Apron, Service Dungarees, Keystone builds). Same script,
same order, same closing cadence:

1. Fabric is not an afterthought — it's one of the most important parts of the garment
2. The named list: denim, hickory stripe, canvas, cotton drill, twill
3. These come from a world where clothing had to be strong, practical, repairable
4. They don't just look good new — they fade, soften, crease, mark, become yours
5. You don't need the most expensive cloth, you need to understand what you're buying
6. Per-fabric character: lighter cotton / heavier canvas / hickory / denim
7. What's in the pattern: QR resources, fabric guidance, supplier options, thread
   recommendations, weight notes, regional buying routes
8. The closing four-part cadence: the pattern gives you the shape, the tutorial walks
   you through the build, the resources help you decide, the community is there if
   you get stuck

Build this as **one composition, ~8 assets, cut to the beats above**, so Vince drops
the same sequence unchanged into every video containing the segment. Suggested
treatment: each named fabric gets a swatch card masked to a selvedge edge, entering
as the name is spoken; the four-part closing cadence gets four ruled field-sheet lines
that stack.

Deliver as both individual beat assets **and** one continuous timed version.

---

## 6. FAMILY A — CHAPTER TRANSITIONS

Full-frame. Cover the screen, hold, uncover to the next chapter. Duration 1s cover +
0.5s hold + 1s uncover = **2.5s total (62 frames @ 25fps)**.

Five distinct mechanics so the video doesn't feel like one effect on repeat. Assign as
listed — do not use one mechanic for everything.

**M1 — Mosaic assembly.** Tesserae fly in and resolve into a full-frame image, hold,
then break apart to reveal. Jack flagged this himself as a device he wants. The
resolved image is a Pompeii fresco or a Dürer plate. This is the hero mechanic.

**M2 — Excavation wipe.** Sand/soil sweeps across and clears, as in the sphinx image.
Warm grain, `--rc-paper-deep` into `--rc-mahogany`.

**M3 — Tiling wipe.** Pattern pages overlap onto the bleed line, left to right, until
the frame is covered — literally Jack's own tiling system. Alignment bullseyes visible
at page corners. Then pages lift away.

**M4 — Stitch wipe.** A running stitch draws across the frame; fabric follows the
needle. Sashiko-irregular spacing.

**M5 — Torn paper wipe.** A sheet tears diagonally across frame; the tear edge is the
wipe boundary.

Assignment:

| Asset | Chapter | Mechanic |
|---|---|---|
| `RC_TRANS_PATTERN` | into pattern walkthrough | M3 |
| `RC_TRANS_FABRIC` | into fabric segment | M4 |
| `RC_TRANS_CUTTING` | into cutting | M5 |
| `RC_TRANS_POCKETS` | into pockets | M1 |
| `RC_TRANS_FLY` | into fly / zip | M4 |
| `RC_TRANS_BACK` | into back panel | M1 |
| `RC_TRANS_SLEEVES` | into sleeves / legs | M5 |
| `RC_TRANS_LINING` | into lining | M2 |
| `RC_TRANS_COLLAR` | into collar / hood / ribbing | M1 |
| `RC_TRANS_CONSTRUCTION` | into joining | M2 |
| `RC_TRANS_WAISTBAND` | into waistband / hem | M4 |
| `RC_TRANS_HARDWARE` | into rivets / buttons | M5 |
| `RC_TRANS_REVEAL` | into final reveal | M1 — see §11 |

Each ships in **two variants (A/B)** with different underlying imagery, so a long
build using the same chapter twice doesn't repeat exactly.

---

## 7. FAMILY B — CHAPTER TITLE CARDS

Sit inside the hold phase of a transition, or stand alone. Duration **2s**.

Construction: illuminated drop cap (gold on oxblood, drawn from manuscript reference)
+ chapter name in engraved serif small caps + a thin rule + the garment name in mono
below.

```
 ┌ (illuminated cap) ────────────
 │  P  OCKETS
 │  ─────────────────────
 │  YARD JACKET · SKILL 3/5
 └────────────────────────────────
```

The container is a torn-edge paper block, rotated 1.5°, positioned lower-left third.
Not centred.

Build one per chapter in §6, plus a **parameterised version** taking `chapterName`,
`garmentName` and `skillLevel` as props so future patterns don't need a new render
pipeline.

---

## 8. FAMILY C — TOP-LEFT POPUPS

The core ask. These live top-left, sized so they clear YouTube's UI and read on a
phone. Duration **5s** default (12f in, 4s hold, 1s out) — long enough to read twice.

Container: **Artifact Expedition Dispatch field-sheet block**. Ruled line, typewriter
label in mono caps, value written in below. Not a card. Not a box. It should look like
a line entry on a document that happens to be lying over the footage.

Position: top-left, 160px margin from both edges, max width 1100px.

### 8.1 The critical one

`RC_POPUP_SEAMALLOWANCE` — this line appears in **all twelve** build transcripts and
both explainer videos. It is the single most repeated statement on the channel.

```
SEAM ALLOWANCE
¼ in — 6 mm — unless stated otherwise
Already included in the pattern.
Do not add more when cutting.
Use the guide beside your presser foot.
```

**Rounding convention, locked:** ¼" is 6.35mm. Jack says 6mm on camera. All assets
state **6 mm**. Never 6.35, never "approx 6". One number, every video, forever.

### 8.2 Pattern-literacy popups

Fire during the booklet walkthrough. All appear in 10+ transcripts.

| Asset | Copy |
|---|---|
| `RC_POPUP_TESTSQUARE` | 2 × 2 in TEST SQUARE · Print page one first. Measure it. If it isn't 2 inches, nothing else will be true to size. |
| `RC_POPUP_TILING` | TILING · Overlap each page to the black bleed line. Never butt the pages together. |
| `RC_POPUP_BULLSEYE` | ALIGNMENT DARTS · The corner bullseyes should sit directly on top of each other. |
| `RC_POPUP_FORMATS` | FORMATS · A4 — most of the world. US Letter — US, Canada, Mexico. A0 — large format, no tiling. |
| `RC_POPUP_CUTTWOMIRRORED` | CUT TWO MIRRORED · Good sides of the fabric facing each other. Gives you a left and a right. |
| `RC_POPUP_GRAINLINE` | GRAIN LINE · Run the arrow parallel to the selvedge. Keeps stretch consistent across every panel. |
| `RC_POPUP_SIZING` | FINAL GARMENT MEASUREMENTS · Not body measurements. Measure an existing garment that fits. |
| `RC_POPUP_HEMALLOWANCE` | ½ in HEM ALLOWANCE · Add this to the fabric only. Never to the paper pattern. |
| `RC_POPUP_SKILLLEVEL` | Parameterised 1–5. Five variants, filled bar in `--rc-gold`. |

### 8.3 Technique popups

Fire mid-build. These are the ones that make the videos genuinely more useful.

| Asset | Copy |
|---|---|
| `RC_POPUP_FACINGS` | WHY FACINGS · Sew face to face, turn out, press. You get the true pattern shape without ironing curves. |
| `RC_POPUP_FLATFELL` | FLAT FELLED SEAM · Bad sides together. Stitch. Trim one seam edge. Fold twice. Two rows of stitching. |
| `RC_POPUP_TOPSTITCH` | TOP STITCH · Fold the seam to one side and stitch through all three layers. Keep the fold facing the same direction throughout. |
| `RC_POPUP_BARTACK` | BAR TACK · A short back-and-forth stitch. Reinforces pocket corners and stress points. |
| `RC_POPUP_TRIMCORNERS` | TRIM THE CORNERS · Before turning out. Less bulk, sharper points. |
| `RC_POPUP_PINCHROLL` | PINCH AND ROLL · Damp fingertips, pinch the seam, roll it out. The no-iron method. |
| `RC_POPUP_HAMMER` | HAMMER THE BULK · Flatten heavy seams before they reach the needle. Saves broken needles. |
| `RC_POPUP_PRESSERFOOT` | PRESSER FOOT AS GUIDE · Run the foot edge along your last stitch line for consistent spacing. |
| `RC_POPUP_ZIPPULLER` | MOVING THE PULLER · Needle down. Foot up. Slide the puller past. Carry on. |
| `RC_POPUP_SELVEDGE` | SELVEDGE ID · The finished loom edge. Won't fray — cut outseams and fly pieces on it. |
| `RC_POPUP_WAXPEN` | WAX PEN, NOT CHALK · Irons straight off. Holds a sharper line. |
| `RC_POPUP_BURRRIVETS` | BURR RIVETS · Cut, set, burr the end. These will outlast the fabric. |
| `RC_POPUP_OVERLOCKER` | OVERLOCKER OPTIONAL · Every build in this series is completed on a straight stitch machine. |
| `RC_POPUP_DOMESTIC` | DOMESTIC MACHINE IS FINE · Every pattern on this channel has been built on one. |

### 8.4 Variable-data popups

Parameterised. Same component, different props.

- `RC_POPUP_ZIPLENGTH` — takes a length, e.g. `7½ in closed end`, `22 in`, `60 cm`,
  `20 in`. Values vary per build; the card does not.
- `RC_POPUP_THREAD` — e.g. `Tex 60 · heavier thread so top stitching shows`
- `RC_POPUP_FABRICWEIGHT` — e.g. `14 oz Japanese selvedge denim`
- `RC_POPUP_PIECECODE` — e.g. `KSS-019 · WAISTBAND` (Keystone Shorts introduced
  per-piece codes; expect this to spread to other patterns)

---

## 9. FAMILY D — CORRECTIONS AND ASIDES

Jack routinely admits mistakes on camera and tells the viewer to do it differently.
This happens in every long build, and it's a defining part of the channel's tone —
the Keystone Shorts intro says outright that the tutorial isn't perfect and that some
of those moments were deliberately left in. Treat it as a feature.

Distinct visual register from §8: **red hand-annotation on the field sheet.** Circled,
struck through, arrow in the margin. `--rc-annotation` only.

| Asset | Copy |
|---|---|
| `RC_CORR_DONTCOPY` | DO AS I SAY, NOT AS I DO · This bit didn't go to plan. The right method follows. |
| `RC_CORR_SEWNSHUT` | POCKET SEWN SHUT · Add decorative stitching before attaching the pocket, not after. |
| `RC_CORR_ORDER` | WRONG ORDER · Do this step earlier than I did. |
| `RC_CORR_MEASURE` | MEASURE FIRST · Cut the ribbing to the pattern piece, not by eye. |
| `RC_CORR_WRONGSIDE` | CHECK THE SIDE · Left and right are not interchangeable here. |

Also build the two running gags as light asides — they appear across most of the
catalogue and the audience knows them:

- `RC_ASIDE_OVERLOCKER` — "The overlocker is still broken." Small, bottom-right,
  3s, no ceremony.
- `RC_ASIDE_IRON` — "The iron is still leaking."

Keep these tiny and deadpan. If they're as loud as the technique popups they'll stop
being funny by the third video.

---

## 10. FAMILY E — CROSS-REFERENCES

Jack redirects to other videos constantly. The welted pocket redirect alone appears in
at least eight transcripts, always with the same framing: this would make the video
too long, go and watch the dedicated tutorial, come back.

Register: **antique map fragment with a red route line and a circled destination.**
This reuses the existing "Relic from the British Isles" device. Duration **4s**,
lower-right so it doesn't fight a top-left popup.

| Asset | Target |
|---|---|
| `RC_XREF_WELTEDPOCKET` | Welted pocket tutorial — 8+ videos |
| `RC_XREF_KEYSTONEFLY` | Keystone Denims fly — 3+ |
| `RC_XREF_AEROITALY` | Aero build in Italy — 3+ |
| `RC_XREF_HELPPAGE` | Printing / tiling help page — 6+ |
| `RC_XREF_POVVERSION` | The condensed POV cut of the same build |
| `RC_XREF_LONGVERSION` | The full workshop cut of the same build |
| `RC_XREF_SKIPAHEAD` | "Already know the pattern system? Skip to <chapter>." — Jack asks for this timestamp verbally in most builds |

Build a **parameterised** version taking title, thumbnail path and an optional
timestamp, so new cross-references don't need a new render.

---

## 11. FAMILY F — DAY BREAKS

Multi-day builds always sign off the same way. Two assets:

`RC_DAY_END` — end of a session. Lamp-orange light falling across a field sheet, the
studio going dark. 3s. Copy: `END OF DAY <n>` with a mono sub-line.

`RC_DAY_<n>` — start of the next. Cold morning light, same sheet, stamped
`DAY 02` / `DAY 03` / `DAY 04` in `--rc-annotation` as though ink-stamped. 2s.
Build days 2 through 4.

The comic beat is that days pass for Jack and seconds pass for the viewer. Let the
stamp land hard and fast on the cut — that's the joke.

---

## 12. FAMILY G — THE FINAL REVEAL

The most important single asset in the library. Every build ends with a try-on and a
verdict.

Register: **the certificate of authentication.** This already exists as a physical
Roughcut artefact and it is the natural closing frame.

`RC_REVEAL_CERT` — a full certificate card, aged paper, engraved border, blackletter
wordmark at the head, with fields:

```
        R O U G H C U T   O F F I C I A L
        ────────────────────────────────
        GARMENT No. _______
        PATTERN ...........  <name>
        SKILL LEVEL .......  <n> / 5
        FABRIC ............  <description>
        BUILT .............  <location>
        ────────────────────────────────
        RELIC FROM THE PAST
        CRAFTED IN THE PRESENT
```

Enters as M1 mosaic assembly (§6), holds 4s, exits by tearing away.

Also build `RC_REVEAL_LOWER` — a slim ruled strip for the try-on B-roll carrying just
the pattern name and price, so the certificate isn't on screen over the whole reveal.

**On the tagline:** it appears both as fixed ("...IN THE PRESENT") and swapped
("...IN THE BRITISH ISLES", "MADE IN ITALY"). Build the second half as a **prop**
with `IN THE PRESENT` as the default. That way both usages are covered without a
second component.

---

## 13. TIMING REFERENCE

| Family | In | Hold | Out | Total |
|---|---|---|---|---|
| Transitions | 25f | 12f | 25f | 62f (2.5s) |
| Title cards | 10f | 30f | 10f | 50f (2s) |
| Popups | 12f | 100f | 25f | 137f (5.5s) |
| Corrections | 8f | 75f | 12f | 95f (3.8s) |
| Cross-refs | 12f | 75f | 12f | 99f (4s) |
| Day breaks | 8f | 34f | 8f | 50f (2s) |
| Reveal | 40f | 100f | 30f | 170f (6.8s) |

All assets must also render a **`_LOOP` variant** with the hold phase extended to 10s,
for moments where Jack talks over a point longer than expected. Vince trims; he
should never have to stretch.

---

## 14. HANDOVER NOTES FOR THE EDITOR

Generate `out/README_VINCE.md` at the end of the build containing:

- one line per asset: filename, family, duration, screen position, one-line purpose
- the drop-at-zero-zero instruction
- confirmation that all files are 3840×2160 ProRes 4444 with straight alpha
- which assets are parameterised and therefore may arrive in multiple versions
- the fabric-segment sequence, flagged as drop-in-unchanged

Keep it to one page. He needs a lookup table, not a manual.

---

## 15. BUILD ORDER

1. `tokens.css`, fonts, torn-edge mask generator, one test render → **verify alpha in
   Resolve before continuing**
2. §5 fabric segment — highest return, validates the whole pipeline
3. §8.1 seam allowance popup — most-used single asset
4. §8.2 pattern-literacy popups — one contained batch
5. §6 transitions, mechanic by mechanic (M1 first, it's the hardest)
6. §7 title cards
7. §8.3 technique popups
8. §12 reveal
9. §9, §10, §11 — the smaller families
10. §8.4 parameterised variants
11. `README_VINCE.md` and contact sheets

Stop after step 1 and after step 2 for approval. Do not batch-render the full library
before a human has looked at a ProRes file on a real timeline.

---

## 16. WHAT NOT TO DO

- Do not scrape roughcutofficial.com or roughcutpatterns.com for imagery
- Do not generate imitation Dürer / fresco / ukiyo-e — use real public-domain scans
- Do not use rounded rectangles anywhere, for any reason
- Do not output WebM
- Do not crop assets to their content
- Do not add a logo bug to every asset
- Do not invent popup copy beyond what is in §8 — the wording is drawn from what Jack
  actually says on camera, and inventing new phrasing breaks the voice
- Do not use `--rc-annotation` red for anything except a single hand mark
- Do not exceed three typefaces per asset
- If a decision isn't covered here, log it in `NOTES.md` and stop. Don't guess.
