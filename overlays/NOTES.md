# NOTES

Open questions and deviations, per spec §16: *"If a decision isn't covered here,
log it in `NOTES.md` and stop. Don't guess."*

Status: **§15 step 1 complete — stopped for approval.**

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

## 3. NOT YET RAISED WITH YOU

- §5 fabric segment names five fabrics (denim, hickory stripe, canvas, cotton
  drill, twill) and asks for a swatch card per fabric masked to a selvedge
  edge. Swatches want **real fabric texture**; same sourcing question as §1.2.
- §7 title cards need an **illuminated drop cap** "drawn from manuscript
  reference" — again real scans (§1.2).
- §10 cross-references take a **thumbnail path** per target video. Those
  thumbnails need supplying.
- §12 reveal certificate has fields (`PATTERN`, `FABRIC`, `BUILT`) whose
  default values are unknown. Parameterised, but needs defaults.
