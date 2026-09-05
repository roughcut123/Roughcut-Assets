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
