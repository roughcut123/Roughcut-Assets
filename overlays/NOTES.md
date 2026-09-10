# NOTES

Open questions and deviations, per spec §16: *"If a decision isn't covered here,
log it in `NOTES.md` and stop. Don't guess."*

Status: **§15 steps 1–11 complete. 100 assets + 99 `_LOOP` variants built.**

Built to spec but **not batch-rendered** — see §5 below.

---

## 1. BLOCKING — needs a decision before step 2

### 1.1 The existing 24-overlay pack contradicts the spec

Before this spec arrived, this repo contained a 24-overlay / 4-transition pack
built from the Milanote board. It breaks six of the spec's hard rules:

| Spec rule | Existing pack |
|---|---|
| §3.4 no drop shadows on floating cards | two-part drop shadow on every card |
| §3.4 no gradient fills as decoration | linear-gradient "sheen" on every card |
| §3.5 no springy easing | `spring()` with overshoot on every entrance |
| §1 25 fps | 30 fps |
| §8 popups mono only | Cinzel + Pinyon Script + EB Garamond |
| §8 copy fixed, §16 do not invent | all copy invented |

It is **left untouched and still renders**, but it is not spec-compliant and
should not ship as-is. Three options:

- **A** — retire it; the spec library replaces it entirely.
- **B** — keep it as a separate "loose" set for non-tutorial content.
- **C** — retrofit it to the hard rules (drops the shadows, gradients and
  springs; would need re-typesetting in mono and re-timing to 25fps).

**No work has been done on this either way. Needs your call.**

### 1.2 Archive imagery cannot be fetched from this machine

§3.6 requires **real public-domain scans** (Rijksmuseum, Met Open Access,
British Library Flickr Commons, Library of Congress) and §16 forbids
synthesising imitations. This environment's egress proxy denies all four
(and `roughcutpatterns.com` and `app.milanote.com`, both already confirmed
403 on CONNECT).

Mechanic **M1 (mosaic assembly)** and **M2 (excavation wipe)** both resolve to
a real plate, so they are **blocked** until scans are supplied. Options:

- drop the scans into `/assets/archive` locally and I read from there, or
- lift the egress restriction for those four museum domains.

M3, M4 and M5 need no archive imagery and can proceed.

### 1.3 The brand faces are substitutes

§3.3: *"Do not silently pick a Google Font lookalike and call it the brand
face."* Logging the substitutions:

| Role | Used | Status |
|---|---|---|
| Display / blackletter | UnifrakturMaguntia | **substitute** — real wordmark not supplied |
| Engraved serif | Playfair Display SC | **substitute** — has real small caps as §3.3 requires |
| Typewriter mono | Courier Prime | substitute, but a genuine typewriter face |

If the Roughcut wordmark exists as a licensed font or as artwork, supply it and
I will swap the blackletter role. Per §3.3 the wordmark should ideally be SVG
artwork rather than a typeface at all.

---

## 2. RESOLVED DEVIATIONS — decided, and why

### 2.1 Composition ids use hyphens, filenames use underscores

Remotion rejects `_` in a composition id (*"can only contain a-z, A-Z, 0-9,
CJK characters and -"*). The spec §2 naming convention is a **filename**
convention, so it is preserved exactly on output:

- composition id `RC-POPUP-SEAMALLOWANCE`
- delivered file `RC_POPUP_SEAMALLOWANCE.mov`

Each asset carries both; the render script maps one to the other.

### 2.2 Fonts live in `public/fonts`, not `/assets/fonts`

§2 puts fonts under `/assets/fonts`. Remotion's `staticFile()` can only read
from `public/`, so the font files live there. `/assets` keeps the spec's other
three directories. No duplication.

### 2.3 §8 max-width and §3.3 minimum text size conflict on the given copy

§8 caps the popup at **1100px**; §3.3 sets a **48px** floor on text. In a
monospaced face that is 34 characters per line. Two of §8.1's own lines are
longer:

- `¼ in — 6 mm — unless stated otherwise` — 37 characters
- `Use the guide beside your presser foot.` — 39 characters

§16 forbids rewording the copy, so the copy is unchanged and those two entries
**wrap onto a second ruled line**, which is what would happen on a real form.
The seam-allowance block is therefore 6 ruled lines, not 4.

If you would rather they didn't wrap, the options are to raise the 1100px cap
to ~1300px, or to drop body text to ~42px (below the §3.3 floor). **Both need
your call** — I have not changed either number.

### 2.4 Line wrapping is computed, not measured

Courier Prime is monospaced at exactly 0.6em per glyph, so wrapping is computed
arithmetically rather than measured in the browser. Browser text measurement
races font loading and can lay out differently in the export than in the
Studio; monospace removes the race.

### 2.5 Edge "boil" is off by default

The pre-spec pack re-cut its torn edge every four frames for a stop-motion
flutter. The spec does not ask for this and §3.5 does not mention it, so it is
**not used** in spec assets. The capability still exists. Say if you want it.

### 2.6 25 fps applies to spec assets only

`SPEC_FPS = 25` (§1) governs the new library. The pre-spec pack stays at 30fps
until §1.1 above is decided, so nothing silently re-times.

---

## 3. STEP 2 — THE FABRIC SEGMENT (§5)

Built: eight beat assets cut to the eight beats, plus `RC_FABRIC_SEQUENCE`,
the continuous version (1471 frames, 58.8s).

### 3.1 BLOCKING — beat 6 copy is not in the spec

§5 beat 6 is *"Per-fabric character: lighter cotton / heavier canvas / hickory
/ denim"*. That names four **categories** but not the words Jack uses for each.
§16 forbids inventing phrasing, so the four rows are built with their swatches
and names and an **empty character line**.

`RC_FABRIC_06_CHARACTER` is therefore structurally complete but textually
blank. **Send me the four character lines and it is a one-line change.**

### 3.2 Timings are reading-paced, not conformed to the VO

§5 asks for "one continuous **timed** version". I do not have the voice-over,
so each beat's hold is set from how long its copy takes to read, and the
sequence is those beats end to end. The individual beat assets exist precisely
so Vince can re-space them if the sequence does not sit on the audio.

If you send the segment audio, or the in/out timecodes from one video that
contains it, I will conform the sequence to it.

### 3.3 Swatches are weave notation, not photographed cloth

§3.6 limits imagery to Jack's own material and public-domain scans, and §16
forbids synthesising pastiche — so photographic-looking swatches are out on
both counts. Each cloth is drawn as its **weave**: twill runs for denim, a
steeper run for drill, plain-weave crosshatch for canvas and cotton with the
repeat coarsened for the heavier cloth, stripe repeat for hickory. Each sits
behind a selvedge band with the regular tick marks §3.4 calls for.

This is also the right register — a field record, not a fabric shop. If you
would rather they were real cloth, supply photographs of the five fabrics and
they drop into the same masks.

### 3.4 Beat labels are structural

The short field names on each block — `FABRIC`, `THE CLOTH`, `ORIGIN`, `WEAR`,
`BUYING`, `CHARACTER`, `IN THE PATTERN`, `AND SO` — are mine, not quoted from
§5. They are the form's field names rather than spoken copy. Say the word and
they change.

### 3.5 The whole segment is set in the mono

§3.3 assigns "all labels" and the field-sheet register to the typewriter. The
fabric segment is a page from a field record rather than a chapter title, so
it uses one typeface throughout — well inside the three-per-asset ceiling.
Variety comes from container shape and palette instead.

---

## 4. WHAT EACH REMAINING FAMILY NEEDS FROM YOU

**§6 M1 / M2 imagery.** M1 resolves to a gold Ravenna-register ground rather
than a named plate, and M2's drift is drawn rather than photographed. Both are
complete, working transitions; both get better the moment real scans land in
`/assets/archive`. Every coverage window was measured off rendered alpha:
**all five mechanics are fully opaque across frames 25–36**, so a cut placed
under the hold cannot show through.

**§7 illuminated cap.** The drop cap is a gold blackletter letter on an
oxblood ground with a ruled border — the geometry §7 asks for. §3.6 wants the
illumination "drawn from manuscript reference"; drop a scan in and it goes
behind the letter without touching the layout.

**§10 thumbnails.** The parameterised `thumbnail` prop is implemented: supply
a path under `public/` and it is framed beside the title, and the map fragment
narrows to make room. No thumbnails have been supplied, so all seven currently
ship map-only. The map is generic cartographic line work, not a scan of a
specific historical plate (§16 forbids faking one).

**§12 certificate defaults.** `PATTERN`, `SKILL LEVEL`, `FABRIC` and `BUILT`
are props, currently defaulting to the spec's own examples — Yard Jacket,
3/5, 14 oz Japanese selvedge denim, Bournemouth. Confirm or replace. The
tagline tail is a separate prop defaulting to `in the present`, so the
British Isles and Made in Italy variants need no second component.

**§9 red marks.** §9 describes the register as "circled, struck through,
arrow in the margin", but §3.2 allows only ONE red mark per asset. Read
together: each correction carries a single mark, and the three kinds are
distributed across the five assets rather than stacked on one card.

**§11 durations.** §11 gives 3s for the sign-off and 2s for the morning
stamp; §13's table gives a single 50f row for the family. §11's explicit
numbers win, so `RC_DAY_END` is 75f and `RC_DAY_02/03/04` are 50f.

---

## 4b. CORRECTION — `_LOOP` COVERAGE AND A TIMING BUG

An earlier note claimed every asset shipped a `_LOOP` variant. That was
wrong on two counts, both now fixed.

**Only 40 of 100 assets actually had one.** Popups and fabric beats did;
transitions, title cards, corrections, asides, cross-references, day breaks
and the reveal did not. All are registered now — 99 `_LOOP` variants against
100 base assets. The single exception is `RC_FABRIC_SEQUENCE`, deliberately:
a looped 59-second monologue makes no sense.

**The `_LOOP` variants would have been broken anyway.** Every component
computed its exit as `in + hold` from the §13 table — a fixed distance from
the START. A `_LOOP` is the same component with a longer duration, so it
animated on the short schedule and then sat there: a transition would have
uncovered at frame 37 of 300 and left 263 frames of empty canvas.

Exit timing is now derived as `durationInFrames - out`, a fixed distance from
the END, in every family including the transition mechanics. Verified on
rendered frames: `RC_TRANS_POCKETS_A_LOOP` is 100% opaque at frame 150 and
clearing by 290; `RC_CORR_DONTCOPY_LOOP` still holds its card at 150 and is
gone by 266.

The lesson is worth keeping: any timing measured from the start of a
composition is a bug waiting for a variant-length render.

---

## 4c. STANDALONE DEMONSTRATION POPUPS — A DELIBERATE §8 DEPARTURE

Five universal popups rebuilt at your direction as standalone animations
rather than field-sheet blocks: `RC_DEMO_SEAMALLOWANCE`,
`RC_DEMO_RIGHTSIDESTOGETHER`, `RC_DEMO_BACKSTITCH`, `RC_DEMO_GRAINLINE`,
`RC_DEMO_PRESSSEAMSOPEN`.

**This knowingly breaks §8's container rule.** §8 specifies an Artifact
Expedition Dispatch field-sheet block for every popup; these have no
container at all. Logged rather than quietly done. The §8 field-sheet
versions of the same five still exist and still render — nothing was
deleted, so both registers are available.

Everything else in the design language is unchanged: mono only, tokens for
colour, no rounded corners, no gradient decoration, no drop shadow, no UI
easing, every line drawing on by stroke-dashoffset, and exactly one red mark
per asset — placed on the fact being taught (the 6mm gap, the reverse run,
the correction, the seam).

They keep the §13 popup total of 137 frames so they drop in interchangeably
with the field-sheet versions, but the split is different: 40 in / 72 hold /
25 out rather than 12 / 100 / 25, because a demonstration needs time to play
where a caption does not.

### v2 — the wobbling papercut

Revised at your direction. The chalk-on-nothing version was too light and the
mono caption did not read as Roughcut. Now:

- A **hand-cut white paper scrap** sits behind each drawing — organic, no two
  alike, and it **wobbles**: re-cut every four frames from three seeded
  variants, the way a physical papercut is nudged between exposures. Built by
  perturbing a radius around a centre, not by wobbling the sides of a box; a
  box perturbed at its edges still reads as a box.
- A **white outline** around it: the scrap is filled pure white with a
  slightly warmer paper inset, so the rim reads as a cut-out border. Filling
  and stroking in the same white gives no border at all, which is what the
  first attempt did.
- The drawing and type are now **ink on white**, which is the only reliable
  way to survive both the dark bench and the bright print room.
- **Type is Cinzel at its heaviest** for the heading — the Roman
  inscriptional face of "RELIC FROM THE PAST CRAFTED IN THE PRESENT" — with
  the technical sub-line in bold typewriter. This overrides §8's "popups use
  mono only": mono alone does not read as Roughcut.
- Coverage is **14–19% of frame**, against the ~15% asked for. It varies by
  asset because the scrap is irregular by design.

**The overflow is now impossible, not unlikely.** An irregular outline cannot
be laid out against its bounding box — a caption drops off whichever lobe came
in short on that seed, which is exactly what happened first time. The
generator now takes a safe rectangle, derived from the drawing plus a
two-heading-line / two-sub-line caption budget, and clamps the radius so no
variant can cut inside it. Verified at zero stray ink pixels outside the paper
across all five assets and all three boil variants.

### v3 — the sticker cut (current)

v2 was rejected, and rightly. It generated a paper shape and then placed the
drawing on it, so the two had nothing to do with each other — a symbol sitting
on a wobbly blob. What you asked for is the cut going **around the outline of
the artwork itself**, the way a die-cut sticker or a scissored-out photograph
is bordered by its own subject.

So the paper is no longer authored. It is **derived from the drawing**. Each
demo renders twice: once as a silhouette that feeds an SVG filter, and once as
the ink on top. Which pass a diagram is in travels by React context, so a
diagram describes itself once and the two passes cannot drift apart.

The filter is the whole trick, and it is three steps:

1. **Flatten.** The drawing carries decorative opacities — the weave at 0.4,
   the selvedge ticks at 0.7 — and paper is opaque whatever it was cut from.
2. **Grow and merge.** Blur the alpha (σ 16) and threshold it low (0.035).
   That puts the cut edge about 29px outside the ink and fuses anything
   within ~65px of its neighbour into one piece of paper. Detail closer
   together than that becomes one sticker; genuinely separate parts of the
   drawing stay separately cut. That is what scissors do.
3. **Tear.** Displace the boundary with turbulence, reseeded every four frames
   across three variants, so the cut edge boils like a re-cut stop-motion
   element rather than sitting still.

### Two things that cost real time to find

**feMorphology is unusable at 4K.** The first working version did the grow and
shrink with `feMorphology` dilate/erode, which looks the same and costs **four
seconds a frame** — measured, 95s for twenty frames against 18s without. That
is twenty times the rest of the library, and it would have added roughly three
hours to a full render for five assets. A Gaussian blur is three box passes
and is free by comparison. If anyone reaches for feMorphology here again:
don't.

**A very wide stroke punches holes in thin glyphs.** The intermediate version
grew the paper by stroking the silhouette 60px wide. Skia's stroker
self-intersects when the stroke is much wider than the feature it is stroking,
and the overlapping halves cancel — which opened a clean bowtie-shaped hole
through the paper above and below every em dash in the captions. The stroke is
now only 10px, enough to firm up the 3px weave lines so they survive the
threshold, and the margin comes entirely from the blur.

Consequences worth knowing:

- The paper **grows with the drawing**. Lines draw on by dashoffset and the
  cut follows the ink as it arrives, so there is no separate "paper in" beat
  to time. Elements that fade in rather than draw on (the presser foot, the
  iron) pop their paper in early, because the flattening step has to be
  aggressive enough to ignore the decorative opacities.
- The diagrams are drawn to the merge distance. The weave lines went from 88
  to 52 apart, the hatching from 62 to 52, the backstitch guides from ±150 to
  ±56, and the grain-line cloth gained a weave so the middle of the piece is
  paper rather than a hole. The two caption lines were pulled from 26 apart to
  12: at 26 a pinprick opened between them wherever both lines had a space in
  the same column.
- Each demo declares the **top and bottom of its ink** within the 940×560
  authoring box, so the caption sits under the drawing rather than under the
  empty part of the box. A shallow diagram no longer leaves its label
  floating.
- The finished overlay is scaled 1.25 as a whole, which lands it at **7–15% of
  a 4K frame** against the ~15% asked for; it varies because the cut follows
  the drawing and the drawings are not the same shape. Scaling the finished
  overlay rather than the authoring sizes keeps the margin proportional, since
  the filter lives inside the transformed SVG.
- The safe-rectangle clamp from v2 is **gone, and cannot come back as a bug**:
  there is no independent shape for the caption to fall off. The caption is
  part of what the paper is cut from.

Verified across all five assets at frames 20/45/70/100: zero enclosed holes in
the paper, zero ink pixels within 3px of a transparent pixel, and every
partial-alpha edge pixel holding RGB 255,255,255 — straight alpha, as §1
requires.

`src/demos/papercut.ts`, the v2 shape generator, is deleted rather than left
lying around for someone to wire back in.

## 4d. PATTERN-LITERACY DEMONSTRATIONS

The booklet-walkthrough beats — §4 spine rows 4, 5, 6 and 8 — built in the
same sticker-cut register: `RC_DEMO_TILING`, `RC_DEMO_BULLSEYE`,
`RC_DEMO_TESTSQUARE`, `RC_DEMO_FORMATS`, `RC_DEMO_SIZING`. Copy is §8.2's,
trimmed to fit one mono line. The §8 field-sheet versions of the same beats
still exist and still render; nothing was replaced.

**Sheets are filled, not outlined.** This is the one structural decision worth
knowing. A page drawn as an outline does two bad things at once: the cut comes
out as a frame with a hole in the middle of it, so video shows through the
sheet — the one thing a sheet must not do — and a page laid on a page does not
cover it, so the lines underneath show through and the overlap is unreadable.
Filling each sheet in the same white the cut floods fixes both at once, and
costs nothing visually because the fill is the paper.

**Pages are named.** Three pages tiled edge to edge read as one wide rectangle,
not as three pages, however carefully the bleed lines are drawn. Printing the
grid reference on each page — A1, A2, A3, where Jack prints it — is what makes
the picture legible in the second and a half it gets on screen.

**Tiling is three big pages, not a six-page grid.** A 3×2 grid fits the 940×560
authoring box only at about 180px a page, and at that size the bleed line, the
darts and the overlap are all too fine to survive being an overlay on video.
Three pages left to right is also what §6 M3 actually describes.

**The pattern panel spans the pages.** It is the reason the overlap has to be
right — butt the pages instead and the panel is wrong by the width of two
margins — so it draws on last, unbroken, across all three.

**RC_DEMO_FORMATS is a formats chart, not a scale drawing.** A0 really is four
times A4 across; drawn honestly it either does not fit the frame or shrinks A4
to a stamp. The three sheets therefore stand at a common height, and the 4×4
grid inside A0 carries the ratio as notation — the red mark is one cell of it,
which is one A4 page. A4 and US Letter differ by 6mm across and 18mm down: a
sliver a few pixels wide at any size that fits on screen, so that difference is
carried by the names rather than by a dimension nobody could see. **If you want
the true 4× relationship shown, it needs its own asset** — a full-frame plate,
not a 15% corner overlay.

Verified like the universal five, at frames 12/26/45/70/110: no enclosed holes
in the paper, no ink within 3px of a transparent pixel, every partial-alpha
edge pixel holding RGB 255,255,255.

One layout note that will bite again: `RC_DEMO_BULLSEYE` first came out with a
6,000px transparent pocket in it, because the artwork block and the caption
block sat just close enough to fuse at their left and right ends and not in the
middle — which encloses a window. Two stickers must either clearly join or
clearly separate; the distance that does neither is the one to avoid, and it is
set by the cut's merge distance, not by taste.

---

## 4e. WHAT THE REAL PATTERN CHANGED

You sent THE KIT DUFFLE BAG, US Letter edition. It is the first primary source
in this repo, and it corrected four things the pattern demos had wrong. Recorded
here because the next person will otherwise re-guess them.

**What a Roughcut pattern page actually carries.** 73 pages: nine of booklet,
sixty pattern tiles (pp.10–69), four of back matter. Every tile has exactly one
alignment rectangle, inset **36pt — half an inch — on all four sides**, solid
hairline, not dashed. Behind the artwork sits the grid reference set very
large in light grey: **Helvetica Neue Black, 140pt on a 612×792pt page,
#d4d4d6**, roughly centred and a little low. Tile A1 also carries the title
block — the circular Roughcut mark, fill-in rules for the garment name,
"SEAM ALLOWANCE: 1/4 of an INCH - EXCEPT WHERE STATED.", and
@ROUGHCUTOFFICIAL. Annotations on the tiles ("PLACEMENT REFERENCE",
"ZIPPER END") are **Minion italic bold at 21pt**, and notches are drawn as a
small triangle sitting on the line.

**1. The page order was backwards.** The demo tiled A1, A2, A3 across. Step 3
of the Print & Assembly Guide: *"Alphabetically (A–B–C…) horizontally, and
Numerically (1–2–3…) vertically. So A1 is your top-left tile, B1 sits to its
right, and A2 is directly below it."* It now tiles **A1, B1, C1**. THE KIT is
twelve across by five down — A–L × 1–5, sixty tiles.

**2. The overlap is not a decorative band — it is the alignment line.** The
guide: *"The left edge of the page on the right overlaps the alignment line on
the page to its left."* So the overlap **equals the alignment inset exactly**,
and the incoming page's paper edge and the outgoing page's printed line are
the same line. The demo now sets `OVERLAP = BLEED` for that reason, and the red
mark is on the coincidence rather than on a band. Half an inch of eight and a
half is about 6% of the page; it is drawn at 9% so the line, and the overlap
that lands on it, survive being a fifteenth of a video frame.

**3. There are no corner bullseyes.** §8.2 specifies `RC_POPUP_BULLSEYE` —
"the corner bullseyes should sit directly on top of each other" — and
`RC_DEMO_BULLSEYE` was built to it. The pattern has none: the alignment is the
rectangle plus the printed lines matching across the join. Shipping a popup
teaching a mark that is not on the page would send viewers looking for it, so
that demo is **parked** (still in `pattern.tsx`, still working, one line to
reinstate) and **`RC_DEMO_PAGEORDER` replaces it** — the assembly map, which is
a thing the guide actually prints.

**`RC_POPUP_BULLSEYE` still ships and still says it.** The §8 field-sheet popup
carries the same §8.2 line, and it has the same problem — it would send a
viewer looking for a mark that is not on their sheet. It is left in place
rather than quietly deleted, because it is a spec'd asset and the call is
yours: retire it, or reword it to the alignment rectangle. Whichever you pick,
§8.2 of the spec should change too, or the next person builds it again.

**4. The test square wording.** The guide's Step 1 is *"Actual Size / 100% /
No Scaling"*, which is the real instruction; measuring the square is the check,
not the instruction. The caption now says so. The square is two inches on an
eight-and-a-half inch page, so it is drawn at a quarter of the page width and
no bigger — draw it larger and it stops being the thing the viewer is about to
hold a ruler against.

### Three things in the PDF for you to look at

- **The guide contradicts itself on page order.** Step 2 says the pages
  *"should follow a clear grid: (A1, A2, A3 … then B1, B2 …)"*, which is down a
  column. Step 3 says letters run horizontally, so the reading order is A1, B1,
  C1 … That makes Step 2 wrong as printed. The overlays follow Step 3.
- **"Alignment line" or "bleed line"?** The pattern says *alignment line* for
  the mark you overlap onto and *bleed area* for the margin. §8.2 of the spec
  says *"Overlap each page to the black bleed line."* The overlays now use the
  pattern's word, because that is the word on the sheet in the viewer's hands —
  but the spec still says the other thing, and one of the two should change.
- **The test square is on tile C1, not on the first sheet out of the printer**,
  though Step 1 calls it "the 2 × 2 inch test square on Page 1". The demo
  labels the page C1, which is where it is in THE KIT. If the square moves per
  pattern, the label should come out.

Everything else is unchanged, and the five pattern demos verify the same way as
the rest: at frames 24/70/110, no enclosed holes, no ink within 3px of a
transparent pixel, straight alpha throughout.

---

## 4f. M3 REBUILT FROM THE REAL PATTERN

§6 M3 is "pattern pages overlap onto the bleed line ... literally Jack's own
tiling system." It was built from invented pages with invented corner
bullseyes. It is now built from the pages: `RC_TRANS_PATTERN_A` and `_B` lay
four sheets out of THE KIT DUFFLE BAG across the frame, hold with the mark
stamped on, and lift them away.

**Where the artwork comes from.** `public/pattern/` holds eight tiles and the
circular mark, extracted from the PDF with pymupdf, **text converted to
paths** so a render depends on no font and no network, and recoloured from the
pattern's near-black `#231f20` to `--rc-ink`, and its `#d4d4d6` grid reference
to `#CFC4B2` so the grey sits on `--rc-paper` instead of on white. 288KB for
the set. Nothing is redrawn or imitated — these are the pages. The mark needed
one extra pass: it carries a white filled disc behind the scribble, invisible
on a white page and a punched white hole on aged paper, so those fills are
stripped.

**Coverage is arithmetic, not hope.** A page is 1900 wide, so at 2° of tilt its
edge never sits further in than 906px from its centre; three centres at 800 /
1920 / 3040 reach past both sides of a 3840 frame and overlap by ~750px, which
is twenty times the deepest tear. The page is 2459 tall against a 2160 frame
for the same reason: a page at exactly frame height leaves a 30px band at the
top the moment it tilts. Verified on rendered frames — 100% opaque across the
whole hold on both variants.

**Whole pages that also cover the frame do not exist.** To see all of a page it
can be at most frame height; at frame height it cannot cover the frame once it
tilts. So you see the full width of each page and about 88% of its height. The
first version had pages at 2500 wide, which covered easily and read as
wallpaper — you could not tell it was a pattern page at all.

**A and B differ by pages, not just by rip.** §6 wants the variants to differ
by "underlying imagery". The seed picks four tiles out of the eight on a
stride of 3 against a pool of 8 — coprime, so no two slots ever land on the
same page — as well as picking the torn edges.

### One thing to fix in the pattern itself

The annotation on tiles G1 and G2 reads **"(LENGHT FOR WEBBING AND FABRIC
HANDLES)"** — LENGHT for LENGTH. It is set in the pattern artwork, so it is in
every printed copy and it is now legible on screen in this transition. Worth a
correction pass on the PDF; the tiles here can be re-extracted in seconds
afterwards.

---

## 4g. M6 — THE BOLT UNROLL

A new mechanic at your direction, and a departure from §6 that is worth
stating plainly: **§6 assigns M4, the stitch wipe, to the fabric chapter.
`RC_TRANS_FABRIC` now uses M6 instead** — a fabric chapter that opens with a
stitch and not with cloth was the wrong picture. M4 is not lost; it still runs
`RC_TRANS_FLY` and `RC_TRANS_WAISTBAND`.

A roll of cloth crosses the frame and the fabric unspools behind it until the
screen is covered; it holds; then a second roll crosses the same way and takes
the cloth back up, revealing the next chapter.

**The cloth already laid down never moves.** Only the two edges travel. That is
what actually happens when you unroll a bolt across a cutting table, and it is
what makes the weave and the fold lines stay put instead of sliding — which is
the difference between cloth and a moving rectangle.

**The sticker cut is now shared code.** `lib/papercut.tsx` holds the filter the
demonstration popups use, so the transition and the popups cut the same way by
construction rather than by two copies agreeing. Both hard-won lessons are
written into that file so they are read before anyone changes it: feMorphology
costs four seconds a frame at 4K, and growing paper by stroking wide makes
Skia's stroker self-intersect and punch holes through thin shapes.

The cut earns its place here more than anywhere. For most of the shot the only
thing the viewer sees against the outgoing footage IS the leading edge, so that
edge has to be torn paper and not a straight line. Once the frame is covered
the cut is off-screen — it does its work during the wipe and then gets out of
the way.

### Four things that were wrong first, and why

- **The bolt did not turn.** Painting stripes on a sliding bar is a wipe with a
  stripe on it. The wound layers are now placed at evenly spaced ANGLES and
  projected — `x = cx + R sin(theta)` — so they crowd towards the edges the way
  a cylinder's surface does, and the phase is driven by distance travelled over
  circumference. It rolls because it is rolling.
- **The cylinder was shaded inside out.** Opacity peaked at the centre, which
  is what a flat striped band looks like. A cylinder is darkest where it turns
  away from you. One sign flip.
- **`drawOn` is the wrong motion for a roll.** Its ease-out is right for paper
  being placed and wrong for something being pushed: it put two thirds of the
  run into the first third of the shot, so the wipe bolted across and then
  stalled. The travel is now constant speed with a five-frame settle, which is
  physical and stays inside §3.5's ban on UI easing.
- **The filter region cannot be a percentage of the bounding box.** At the
  start of the wipe the band is a few hundred pixels wide and 14% of that is
  less than the cut margin, so the cut got clipped exactly when it was the only
  thing on screen. It is absolute here.

The run is also off true by five degrees. Nobody unrolls a bolt square to the
edge of the table, and off-square puts far more of the cut edge on screen for
far longer. The cloth over-covers by 420px top and bottom to pay for it: 3840
across at five degrees drops the far corner by 336px.

### Blue denim, and how the selvedge got on screen

The cloth is `--rc-indigo`, which §3.2 already carries and describes as "denim,
selvedge accents", so no palette was added. The weave is a right-hand twill —
what denim is — drawn as a tiled pattern rather than a few hundred long
diagonals, and set in the weft's undyed thread, because a denim ridge is pale:
only the warp is dyed.

**Getting the selvedge on screen took a structural decision, not a texture.**
The selvedge runs the length of the cloth, so on an unrolling bolt it is the
top and bottom edge of what is laid down — and those are off-frame by
definition, because the cloth has to reach past the frame to cover it. Run the
piece as one width and the selvedge cannot be shown at all.

The way out is the true one: selvedge denim comes off the loom about 32in
wide, so covering anything the shape of a screen means laying more than one
width and overlapping them at the finished edges. There are two of those joins
across the frame, and each is the real article — the undyed band, its regular
tick marks (§3.4's "selvedge edge — the woven band, with its regular tick
marks"), the overlapped edge of the width lying on top, and the coloured ID
line woven down it.

**The ID line is `--rc-terracotta`, not `--rc-annotation`.** Red-line selvedge
is the iconic one and the temptation is obvious, but §3.2 reserves the
annotation red for exactly one mark per asset, and a line running the full
width of the frame is not that mark.

**The bolt needed to be told it is many layers deep.** Made indigo like the
cloth it is laying, it vanished into it — same colour, same twill, no roll. It
now carries an ink overlay at 26%, which is true as well as legible: a wound
bolt is dozens of thicknesses and a laid piece is one.

**The twill was checked at the resolutions people actually watch at**, because
fine high-frequency diagonals across a whole 4K frame are exactly the thing
that shimmers once YouTube has had it. A hold frame downscaled to 1080p and to
720p shows the ridge clean at both, with no moiré, and the selvedge band, its
ticks and the ID line all still crisp. The tile stays at 20x40.

It does cost something in file size: the denim masters are 411MB against 101MB
for the same shot in plain cloth, because ProRes has a great deal more detail
to carry. Two assets, so ~800MB — worth knowing before a full library render
is budgeted, not worth changing.

### v2, against the reference photographs

Four photographs of real selvedge denim came back with "it needs to look more
realistic". They corrected three things, and two of the three are facts about
the cloth rather than matters of taste.

**The roll is PALE, not indigo.** Cloth is rolled face-in to protect the face,
so the outside of a bolt of denim is the back — and the back of indigo denim is
a pale blue-grey, because only the warp is dyed. The reference shows exactly
that: dark navy face, grey back on the outside of the roll. It is now
`--rc-fresco`. This also retires a cheat: v1 had an indigo roll laying indigo
cloth, which vanished into it and needed an ink wash at 26% to be visible at
all. The true colour does the job the wash was faking.

**The ID line is DOTTED.** In the reference it is unmistakably a run of dots
and dashes — a thread appearing at intervals through the weave, not something
printed on. A continuous line is what made v1 read as a stripe painted on blue
paper. It is also now `--rc-annotation` rather than `--rc-terracotta`: §3.2
reserves that red for one mark per asset, and here the one red thing IS the
selvedge line. Red-line selvedge is the defining mark of the cloth and nothing
else in the asset is red, so the rule is kept rather than broken.

**The face is flecked.** Raw denim is covered in tiny white specks where the
weft shows through. A flat indigo field with clean diagonals on it reads as
wallpaper, and this is the single biggest difference between v1 and the
reference. The flecks need their OWN pattern tile, much larger than the
twill's: put them in with the twill and they repeat every 20px, which is a
grid of dots and worse than no flecks at all.

**And one self-inflicted error worth recording.** Enlarging the twill tile from
20x40 to 120x240 to fit the flecks in, without scaling the run of the diagonal
to match, stood the ridge up from 63 degrees to about 85 — and a vertical ridge
is not a twill, it is a pinstripe. The tile IS the angle: 20 across per 40 up.
Hence two patterns rather than one.

The selvedge also carries on over the roll now, clipped to the cloth AND the
bolts. It runs the length of the cloth, so it wraps the bolt at the same height
it lies at on the laid piece; stopping it dead at the roll's edge is the one
place the eye checks.

Checked again at the resolutions people watch at. At 4K 1:1 the flecks read a
touch large and round — closer to dots than to slubs — but 4K 1:1 is not how
anyone watches this, and at 1080p and 720p they read exactly as flecking, with
the twill ridge intact and no moiré at either. Sized for the delivery rather
than for the master, deliberately. Masters are 424MB each.

Verified on rendered frames: 100% opaque across the whole hold, both variants.

---

## 4h. TWO THINGS THAT LOOK LIKE DELIVERY FAULTS AND ARE NOT

Both of these will come up the first time anyone QCs the masters, so they are
written down rather than rediscovered.

**The files report `yuva444p12le`, not the `yuva444p10le` §1 asks for.** ProRes
4444 is a 12-bit format; the encoder is given 10-bit and packs it into the
codec's native 12-bit representation, so that is what a decoder reports back.
Requesting `yuva444p10le` is correct and is what the render command does. There
is no 10-bit ProRes 4444 file to produce. Every asset in the library reports
this, not just the demonstrations.

**Sampling alpha during a fade-in makes straight alpha look premultiplied.**
A first pass at verifying the masters read partial-alpha pixels at frame 2 and
found RGB values down to 31, which looks alarming. Frame 2 is inside the
five-frame placement ramp, when the WHOLE overlay is partially transparent —
ink included — so the dark ink is legitimately a partial-alpha dark pixel. It
is in fact the proof the alpha is straight: at 78% opacity the ink comes back
as its own colour (59,46,34), where premultiplied would have scaled it to
(46,36,27).

Sample a hold frame instead. There the only partial-alpha pixels are the cut
edge, and they read 254-255 across all three channels — white paper, held at
full value under partial alpha, which is what straight alpha means. The 254
rather than 255 is ProRes's DCT, not the alpha.

---

## 4i. THE HERITAGE DENIM JACKET SET — TEN FULL-FRAME TRANSITIONS

Built for the Keystone jacket / denim jacket course: `RC_TRANS_RIVETS`,
`_BUTTONS`, `_BUCKLES`, `_PATCHPOCKETS`, `_PANELS`, `_CHAINSTITCH`, `_INDIGO`,
`_SELVEDGE`, `_THREAD`, `_PATCH`. Same 62-frame contract as §6 (25 cover, 12
hold, 25 uncover), same sticker cut, A and B variants each.

**Two engines, ten skins.** The hard part of a cover-and-uncover transition is
not the picture, it is PROVING it covers — a pinhole for one frame shows the
outgoing cut through it. So coverage is a property of the geometry rather than
something to check afterwards:

- **SWARM.** Objects ride in on scraps of paper laid out on a 7x4 grid, each
  scrap a square whose INSCRIBED circle is the cell's half-diagonal. Once every
  scrap has landed the frame is covered, whatever shape the pieces are and
  however they or the scraps are rotated. That is why the hardware does not
  have to be cell-sized: making a rotated buckle cover a rectangular cell means
  drawing it enormous, whereas the scrap covers at any angle.

  The scrap was a disc for the first two passes, which is the same guarantee
  and the wrong picture: mid-transition the frame filled with ecru coasters
  with lens-shaped gaps between them, the one thing in the set that read as a
  shape the animation had invented rather than as paper. A square, rotated a
  few degrees per scrap, reads as torn paper, matches the cut, and packs
  without the gaps. The coverage proof is unchanged, only tightened — the
  square strictly contains the disc it replaced.
- **SWEEP.** A boundary crosses from well off one edge to well off the other
  and the fill trails it.

The cut is applied to the UNION of the pieces, not to each piece — one filter
pass rather than forty. During the fly-in that reads exactly right: the ragged
white edge is the boundary of whatever has landed so far.

### Two bugs the endpoint checks caught, which the pretty frame did not

Both were found by measuring frame 0, the hold, and the last frame rather than
by looking at the middle of the shot.

**The exits were too short.** Pieces left along the vector they arrived on, at
the same distance — so a piece thrown in from close by left to somewhere still
on screen. The patch swarm's bottom row travelled 1,620px when it needed 2,596,
and the transition ended with paper sitting in the middle of frame. Exits now
run 5,200px along the throw DIRECTION: the frame diagonal plus a chip radius,
which no cell and no angle can defeat. Reusing the entry vector is a bet on
where the piece started.

**Chrome floods a white square when a filter's input goes empty.** Once every
piece had left the filter's userSpaceOnUse region, the paper cut still painted
a solid 126x126 white block at the origin — a white patch in the corner of the
final frame of all six swarm transitions, which is exactly where the frame is
supposed to be clear. The fix is to cull units that cannot touch the region, so
the group is genuinely empty rather than merely invisible. It also stops
anything off-screen being drawn and blurred, so the renders get cheaper.

### Smaller things worth keeping

- Chips are drawn in one pass and pieces in another. Drawn unit by unit, each
  chip lands on top of the piece in the cell before it and takes a bite out of
  it — the first attempt was a field of Pac-Men.
- Chips stay on the grid; only the pieces are scattered within their cell. The
  hardware looks thrown down and the paper underneath still tiles the frame.
  Jittering the chips would break the coverage guarantee.
- `RC_TRANS_HARDWARE` and `RC_TRANS_POCKETS` already exist in §6, so these are
  `BUCKLES` and `PATCHPOCKETS`. Remotion rejects duplicate composition ids, and
  the collision surfaced as a render failure rather than a silent overwrite —
  worth knowing before naming anything new.
- Pattern pieces are paper on a DEEPER ground. Pattern paper on pattern paper
  left them readable only by their outlines, which is not enough at speed.
- Hardware kinds are weighted, not uniform: a drawer is mostly buckles and
  adjusters with a few rivets rolling about. An even split of four kinds made
  the frame look like a tray of washers.

### What would make two of these better

`RC_TRANS_PANELS` draws generic denim-jacket pattern pieces — yoke, front,
back, sleeve, cuff, collar, pocket flap — because the only pattern in the repo
is THE KIT DUFFLE BAG, and a bag's pages in a jacket course would be wrong.
Send the Keystone pattern PDF and `scripts/extract-pattern.py` lifts the real
pieces the same way it did the duffle bag tiles.

Photographs of the finished jacket would carry `RC_TRANS_PATCH` and could
support a garment mechanic that does not exist yet. `assets/garments` is still
empty.

---

### Legibility: the problem the paper was solving (v1)

A field-sheet block carries its own paper, so contrast is free. Standalone
line work has nothing behind it, and cream chalk on the bright print-room
footage has almost no contrast of its own.

Every stroke is therefore painted twice: an opaque dark keyline first, the
chalk line over it. That is an outline on line art, not a drop shadow on a
floating card, so §3.4 still holds — and it is what the work actually looks
like, since Jack marks cloth in chalk. Checked against both a dark bench and
a blown-out white ground; the first attempt used a 55% keyline and vanished
on the bright one.

---

## 4j. THE REALISM PASS ON THE JACKET SET

Brief: *"the same kinda thing as last time — you can cartoon these panels but
somehow we need to create transitions that look super professional."* Cartoon
was never the problem. Flat was.

Five changes, in order of how much each one bought:

**1. The brass is cel-shaded now, and that is most of it.** Every rivet, button
and buckle was a gold shape with a dark outline, and at 4K they read as coins.
What says "turned metal" is not a gradient — §3.4 rules those out and one would
fight the paper cut anyway — it is two flat crescents: the lit side and the
side that is not, plus one short specular arc.

Both crescents are made WITHOUT a clip path, because a clip needs a unique id
and these draw several hundred times a frame. The disc is painted dark, then
the brass is painted back over it offset a few per cent towards the light,
which leaves the dark crescent standing on the far side. `Forged` does the same
for hardware that is a frame rather than a disc. The light is up and to the
left everywhere, including the cloth's `Lift` shadow, so a frame full of parts
is lit consistently instead of each piece having its own sun.

**2. A buckle needs a prong.** The first one was a square frame with a square
hole and it read as a picture frame — that is genuinely what it was. Bent wire
has round corners, and the prong is a tapered spike that OVERHANGS the front
edge. That overhang is the entire silhouette; without it the shape is a
rectangle no matter what is drawn inside it.

**3. Cloth had no texture on the pieces.** The denim fill existed but only the
backgrounds used it; `Piece.render` now takes the paint, so pockets, panels,
straps and cuffs are twill-and-slub rather than flat indigo.

**4. The chainstitch is a chain.** It was two dashed lines, i.e. a ruled page.
A felled seam is a raised fold with a shadow under it, topstitch either side of
the fold rather than on it, and interlocking loops underneath — the loop being
the only reason a chainstitch is worth showing.

**5. Indigo, three attempts.** A dip chart is a stack of flat tones with a hard
line where each dip stopped. Getting there took two wrong turns worth writing
down, both about the palette rather than the drawing:

- Nine bands each running 600px past its own pitch stacked into near-black.
  Bands are absolute now, not cumulative.
- Lightening the pale end turned the frame grey — with `--rc-paper` (cream)
  and then with `--rc-fresco`. Every light token in §3.2 is warm or
  desaturated and none of them survives being laid over blue. The chart runs
  in ONE direction now, from the indigo token undimmed down to ink, which is
  also what dipping actually does.

The shared denim paint is knocked back with warm ink so pockets read against
paper; across a whole frame that same knock-back reads as slate, so the
full-bleed mechanics restore the hue before they band it.

### Verified

All twenty (ten mechanics x A/B) measured at frame 0, the hold, and the last
frame: nothing at either end, 100.00% opaque through the hold.


---

## 4k. DELIVERING ALPHA THROUGH A 30 MB PIPE

Vince needs files he can drop over his footage, and the chat upload cap is
30 MB. The 4K masters are 110-450 MB. So the question was what survives being
made small enough to send.

**It is bits_per_mb 500, at 1080p, and the answer was there all along.** An
earlier pass concluded ProRes 4444 "floors at about 57 MB" and gave up on
sending alpha at all — that number came from testing 1500 as the lowest value
and reading the flatness between 1500, 2200 and 3000 as the codec refusing to
go lower. It was not a floor, it was the top of the curve. 400 gives 17 MB and
500 gives 19-22 MB across all twenty.

Alternatives measured on the same clip, for the record: QuickTime PNG 48 MB,
QTRLE 50 MB — both lossless and both far too big, because the twill and slub
are high-frequency and neither codec has anything to throw away. VP9 in WebM
came out at 1.0 MB and is the only genuinely small option, but alpha support
in an NLE is unreliable in a way ProRes is not, and this is a working file
rather than a web asset.

### What 500 costs

Measured against the master on the densest transition: composited PSNR 34 dB,
alpha error at most 1/255, and the cut edge — the thing the whole design hangs
on — holding a mean of 254 out of 255 across every partial-alpha pixel.

A first check gated on the edge's single darkest pixel being 230 or better and
failed four files at 201-207. That gate was wrong, not the files: below 240
covers 0.03-0.14% of edge pixels on those four, which is isolated DCT ringing
and not a fringe. The mean is what matters and it is 253.9-254.3 everywhere —
the batch shipped before this one measured 254.8. A minimum over five thousand
pixels is not a quality metric.

The 4K masters remain the real deliverable and still render from the branch.

---

## 4l. THE KEYSTONE CHAPTER CARDS

Thirteen title cards — one contents, twelve chapters — from a client build
brief with its own `chapters.json`. **They are not part of the §6 library** and
do not follow ROUGHCUT_OVERLAY_SPEC: 1920x1080 at 30fps rather than 3840x2160
at 25, a different palette, a different grid, a different type scale. Both
numbers are read from `chapters.json` rather than `lib/spec`, so the cards
cannot silently drift onto the library's clock.

Built as ONE component driven by the JSON, because §5 of the brief asks for
exactly that. Two things vary and both were read off the references rather
than assumed: a title can be one line or two (card 05 fixes the step at
exactly one font size, and everything below moves with it), and the right
column drops whichever of its three sections a chapter does not use (cards 04,
09, 10 and 12 fix what happens with one group, two, and none).

### What arrived, and what did not

The zip contained the PNGs, the brief and the JSON. It did NOT contain the
SVGs the brief lists, which were to be the animatable source with an id on
every element. Rebuilding from `chapters.json` is the brief's own alternative
and the better one anyway — the contents card is generated from the same data
as the chapters it lists, so it cannot fall out of step with them.

### Measured, not assumed

Everything was measured off the references and checked back by rendering and
diffing. The brief's own layout constants all held exactly — the 92px
selvedge, the 210 and 1220 columns, the footer rule at 948, and all eleven
palette colours. What the brief does not give was read off the pixels:
baselines (by subtracting the font's ink-top offset for each exact string, not
by estimating cap heights), the right column's flow, two colours absent from
the table, and the contents card's separate type scale — its kicker is 28 not
26, its title 122 not 112, its sub 34 not 40.

**The font was the one that mattered.** The references are real Helvetica.
Nimbus Sans — URW's Helvetica clone — reproduces them exactly: '01' at 158px
is 144x118 in both, 'THE FRONT' at 112px is 637x86 in both. Liberation Sans,
the Arial clone that fontconfig substitutes for Helvetica on Linux, is 15%
wider on digits and 8% shorter. So `"Nimbus Sans"` has to come FIRST in the
stack, ahead of Helvetica itself: a stack that asks for Helvetica first never
reaches Nimbus, because fontconfig has already answered with Liberation. That
ordering is load-bearing, not cosmetic.

### Three places the brief and the references disagree

Each is a live question for the client rather than something to decide
silently, so each is one constant:

- **Letter-spacing.** The type table asks for 2px on labels and -2px on
  titles. The references have none — fitted against Nimbus with zero tracking,
  a 19-character kicker, a 42-character sub and a 29-character part label all
  land within 1px, and 2px of tracking would put the label 56px wide.
  `TRACKING` is `NO_TRACKING`; `BRIEF_TRACKING` is there to switch to.
- **The ground.** The references are one flat colour across the whole frame,
  and that colour is the exact channel-wise mean of `indigo` and `indigoDeep`.
  The brief calls `indigoDeep` a vignette and lists `#bg` and `#bg-twill` as
  animatable layers. Both are built and both are off. `GROUND.gradient` /
  `GROUND.twill`.
- **Whitespace.** The references are internally inconsistent and both
  behaviours had to be reproduced. The part label, composed in code, keeps its
  double spaces (measured 424 against 425 as-is, 411 collapsed). `pieces` and
  `extra`, which come from the JSON with double spaces around every separator,
  are collapsed (589 against 590 collapsed, 636 as-is — and the same on all
  four samples). So whitespace is handled per field.

### The selvedge is a twisted cord, not a line

After everything else matched, one structural difference remained: an
identical 4,080-pixel discrepancy on every card, all of it in columns 2 to 10.
The selvedge's inner fold is not a straight rule — it oscillates between x=2
and x=10 on an exact 9-row cycle, a twisted cord. Drawn from the measured
table it goes to zero. The weft is a 1px pick every 3 rows on y % 3 === 0, the
ID line is 9-on-5-off from y=0, and the outer edge is a straight 2px at 91..92.

### Verified

All thirteen rendered and diffed against their references: **zero non-edge
differences and zero differences anywhere in the selvedge on every card.** The
0.8-1.7% of pixels that do differ are entirely glyph antialiasing from a
different rasteriser, which is why the check discounts a dilated band around
every glyph rather than counting raw pixels.

---

## 4m. THE STITCH ANIMATION ON THE CHAPTER CARDS

The chapter number is sewn on rather than faded in: discrete stitches along the
numeral's outline, twin topstitch rows with the second lagging, a needle at the
leading edge, a thread jump between digits and into each counter, a bar tack to
finish. The contents card previews the device — its twelve row numbers stitch
on in sequence down the columns.

Tuning lives in `src/chapters/STITCH-TUNING.md`. What follows is only what a
future reader needs and would not guess.

### The outlines are baked, and that is not an optimisation

`scripts/extract-digits.py` bakes the digit outlines from Nimbus Sans Bold into
`glyphs.ts` as flattened polylines. The obvious route — draw the number as SVG
text and walk it with `getPointAtLength` — cannot work: the outline of a
`<text>` element is not exposed to script, and anything measured from the DOM
during a render is asynchronous. Remotion renders frames independently and
often out of order, so a stitch positioned from a measurement can land
differently between two renders of the SAME frame. That strobes. A plan built
from constants cannot.

The same reasoning is why the per-stitch jitter is seeded rather than random.
The brief calls that jitter "the single highest-value detail" and it is right —
identical stitches look printed — but unseeded it would shimmer.

### Two places the brief contradicts itself

Both are constants rather than silent decisions.

**The stitch rate cannot be 14-22/sec.** A number's outline is 620-1090px at
158px type, so 62-109 stitches at the specified 10px pitch, and §4 gives it
1.05 seconds. That needs ~91 stitches/second. At 18/sec the average number
takes 5.3 seconds and is still sewing when the chips and piece codes arrive.
§4 won because it states its own reason — "so it does not hold up the rest of
the card" — and §2.6's relative tempo is preserved exactly: chapter 05 is 58%
faster than chapter 04, as the table asks. For scale, 91/sec is 5,460
stitches/minute, a fast industrial machine; 18/sec is a domestic one.

**The end state cannot be both.** §3 says sew the outline and do not fill it.
§6 says the last frame must look exactly like the supplied PNG, which is a
solid numeral. The seam therefore HANDS OVER: stitches finish, the numeral
rises under them, the thread fades. Verified — the hold frame still matches
the reference with zero structural differences, on all thirteen. `RESOLVE`
switches it.

### The round-cap trap

A stitch is drawn with round caps, and a round cap adds half the stroke width
past EACH end. A 7px line at 3.2px stroke is 10.2px of visible capsule against
a 10px pitch: the gaps close, and the seam becomes one continuous tube. That is
precisely the failure §9 describes — "if it looks like a number being drawn,
start again". The drawn length subtracts the stroke width so the capsule
measures 7px. Change the thread weight and the gap changes with it.

The same class of mistake, one scale down: everything inside a stitch — the
shadow, the darker underside, the lit top — was originally offset by absolute
pixels. Fine at 158px, wrong at 32px, where a 2px shadow under a 1.15px thread
is wider than the thread it belongs to. The contents rows came out muddy until
those offsets were made proportional.

### Card duration changed

165 frames to 173. §4's sequence finishes at 2.15s where the previous one
finished at 1.9s, and the number now starts before the title rather than after
it — "they should overlap, not queue".

---

## 5. THE LIBRARY IS BUILT BUT NOT BATCH-RENDERED

All 100 assets are registered, verified at 25fps / 3840×2160, and render on
demand. They have **not** all been exported to ProRes here: at roughly 70–300
MB each that is tens of gigabytes, well past this machine's disk, and §15
says not to batch-render before a human has looked at a file on a real
timeline anyway.

Four have been rendered and verified end to end — `RC_POPUP_SEAMALLOWANCE`,
`RC_FABRIC_08_CADENCE`, and the fabric sequence — confirming ProRes 4444
profile 4, 3840×2160, 25fps, video stream only, straight alpha.

To render the rest:

```bash
export REMOTION_BROWSER_EXECUTABLE=...   # only if Remotion can't fetch Chrome
node scripts/render-spec.mjs             # everything, with contact sheets
node scripts/render-spec.mjs --family=TRANS
node scripts/render-spec.mjs --no-loop --no-sheets
node scripts/make-readme.mjs             # regenerates out/README_VINCE.md
```

The asset list is read from Remotion itself, so the render script and the
handover table cannot drift from the code.
