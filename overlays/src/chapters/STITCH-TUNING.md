# The stitch animation — what is tunable, and where it lives

One page. Everything below can be changed without touching component logic.

---

## 1. Per-chapter rhythm — `src/chapters/chapters.json`

Each chapter card carries three fields. This is where §2.6's "the stitch rate
should match the seam the chapter teaches" actually lives.

```json
{ "id": "03", "stitchRate": 104, "stitchFeel": "steady",
  "stitchNote": "confident, even — the flat-felled reference tempo" }
```

| field | what it does |
|---|---|
| `stitchRate` | stitches per second. Higher = faster machine. |
| `stitchFeel` | `steady` · `hesitate` · `burst` · `staccato` |
| `stitchNote` | documentation only, never read by code |

`stitchFeel` modulates the time each individual stitch takes:

- **steady** — every stitch the same. A machine at constant speed.
- **hesitate** — the first three stitches of each contour take 2.2×, so the
  needle slows entering a curve. Chapter 08, sleeves in the round.
- **burst** — eight quick stitches then two slow. Chapter 10, bar-tacked straps.
- **staccato** — alternating 0.7× / 1.6×, never even. Chapter 12, hammering.

Current values:

| ch | rate | feel | seam |
|----|-----:|------|------|
| 01 | 79  | steady   | steady, unhurried |
| 02 | 99  | steady   | steady, larger panels |
| 03 | 104 | steady   | **the reference tempo** |
| 04 | 81  | steady   | slower, deliberate |
| 05 | 128 | steady   | faster, flowing |
| 06 | 122 | steady   | fast, even |
| 07 | 100 | steady   | confident, driving |
| 08 | 91  | hesitate | slower, hesitations at curves |
| 09 | 102 | steady   | measured |
| 10 | 91  | burst    | short bursts, then pause |
| 11 | 59  | steady   | smooth, quiet |
| 12 | 88  | staccato | staccato, punctuated |

### Why the rates are ~80–130 and not the brief's 14–22

The two numbers in the brief cannot both hold, and this is worth knowing before
anyone "corrects" the table above.

A chapter number's outline is 620–1090px long at 158px type. At the specified
10px stitch pitch that is **62–109 stitches**. §4 gives the number from 0.55s
to 1.60s to sew — **1.05 seconds**. 95 stitches in 1.05s is **91 stitches per
second**.

At the brief's 18 st/s the average number would take **5.3 seconds**, five
times its slot, and would still be sewing while the chips and piece codes
arrived.

§4 is the constraint that was kept, because it states its own reason — "so it
does not hold up the rest of the card". The *relative* tempo from §2.6 is fully
preserved: chapter 05 is 58% faster than chapter 04, exactly as the table asks.

For reference, 91 st/s is 5,460 stitches/minute — a fast industrial machine.
14–22 st/s is a domestic one. The cards read as the former.

**To use the brief's rates instead**: set them in `chapters.json` and widen the
window in `timing.ts` (`BEAT.number`, and `IN` with it), or everything after
1.6s has to move.

---

## 2. Stitch appearance — `src/chapters/StitchedNumber.tsx`

Constants at the top of the file.

| constant | value | note |
|---|---|---|
| `PITCH` | 10 | distance between stitches, px at 158px type |
| `STITCH_LEN` | 7 | visible capsule length, so a 3px gap — §2.1's 25–30% |
| `THREAD_W` | 2.8 | thread thickness |
| `ROW_GAP` | 5 | twin-needle separation — §2.2's 4–5px |
| `ROW_LAG` | 2.5 | how many stitches the second row trails by |
| `RESOLVE` | true | whether the seam hands over to the solid numeral |

**One trap worth knowing about.** A stitch is drawn with round caps, and a round
cap adds half the stroke width past each end. A 7px line at 2.8px stroke is
9.8px of visible capsule — near enough the 10px pitch to close the gap
completely and turn the seam into one continuous tube. That is exactly the
failure §9 describes. `DRAWN_LEN` is therefore `STITCH_LEN - THREAD_W`, so the
capsule measures 7px. **If you change `THREAD_W`, the gap changes with it** —
check it still reads as separate stitches.

### `RESOLVE`, and a decision that needs your call

§3 says sew the outline and do not fill it. §6 says that at the last frame the
number "should look exactly like the supplied PNG" — and the PNG is a solid
gold numeral. Both cannot be true of the same frame.

It is currently set so the seam **hands over**: the stitches finish, the solid
numeral rises under them, the thread fades, and the card ends as the signed-off
design. That keeps §7's promise that the cards are signed off and this is one
addition, and it has been verified — the hold frame still matches the reference
PNG with zero structural differences.

Set `RESOLVE = false` to keep the stitched outline as the final state instead.
That looks good, but the finished card no longer matches the PNG.

---

## 3. The contents card — `src/chapters/ContentsCard.tsx` and `design.ts`

§5's variation: the twelve row numbers stitch on in sequence down the columns,
"like a seam running the length of the page".

| where | constant | value |
|---|---|---|
| `design.ts` → `CONTENTS` | `rowsFrom` | 1.05 — when the first row starts |
| `design.ts` → `CONTENTS` | `rowStagger` | 0.06 — §5's "roughly 60ms apart" |
| `ContentsCard.tsx` | `CONTENTS_STITCH_RATE` | 200 st/s |

The thread is gold, as everywhere else, and settles into the muted grey the
signed-off card shows — `solidColour` on the component does that.

**The rows are a fifth the size of a chapter number**, so the stitch metrics
scale with the type size and floor out rather than going sub-pixel: below about
a 2.2px row separation the twin needle drops to a single row, because two rows
one pixel apart are not two rows. See `metrics()` in `StitchedNumber.tsx`.

Everything inside a stitch — the shadow, the darker underside, the lit top — is
sized RELATIVE to the thread for the same reason. They were absolute at first,
which is fine at 158px and wrong at 32px: a 2px shadow under a 1.15px thread is
wider than the thread it belongs to, and the contents rows came out muddy
rather than gold.

**Honest note on this one.** At 32px the stitching is legible as a seam running
down the page but the individual stitches are necessarily fine — it reads as a
quick gold shimmer resolving into the list, not as the crisp topstitch the
chapter numbers get. That is inherent to the size, not a tuning problem. If you
would rather the contents rows simply faded in as before, delete the
`StitchedNumber` block in `ContentsCard.tsx` and restore the `T` element next
to it; nothing else depends on it.

---

## 4. Timing — `src/chapters/timing.ts`

`BEAT` holds §4's beat sheet in seconds, exactly as written. `NUMBER_SEW.start`
is when the needle drops. The handover is derived from the actual sewing
duration rather than a fixed time, so a slower chapter is not cut off
mid-seam.

The card is now **173 frames (5.77s)** rather than 165: §4's new sequence
finishes at 2.15s where the old one finished at 1.9s.

---

## 5. Regenerating the glyph outlines

`src/chapters/glyphs.ts` is generated. Only needed if the type changes:

```bash
python3 scripts/extract-digits.py
```

It bakes the digit outlines from Nimbus Sans Bold as flattened polylines in
font units. They are baked rather than measured at render time because Remotion
renders frames independently and out of order — anything measured from the DOM
can place a stitch differently between two renders of the same frame, which
strobes.
