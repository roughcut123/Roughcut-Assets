# KEYSTONE JACKET — CHAPTER CARDS
## Build brief for animating the title cards

**What this is:** 13 title cards for the Keystone Jacket YouTube tutorial — one contents card and twelve chapter cards. They sit between the sections Vince is editing, acting as chapter openers rather than transitions.

**What's in this folder:**

```
keystone-chapters/
├── chapters.json                  ← all card data, palette, layout constants
├── 00-contents.svg / .png
├── 01-the-front.svg / .png
├── 02-the-back.svg / .png
├── 03-the-yoke.svg / .png
├── 04-the-collar.svg / .png
├── 05-sleeves-and-cuffs.svg / .png
├── 06-the-waistband.svg / .png
├── 07-shoulders-and-side-seams.svg / .png
├── 08-setting-the-sleeves.svg / .png
├── 09-waistband-and-collar.svg / .png
├── 10-the-waist-adjuster.svg / .png
├── 11-the-lining.svg / .png
└── 12-hardware-and-finishing.svg / .png
```

**PNG** = flattened 1920×1080 preview, correct as designed.
**SVG** = the same card as vector, every element with an `id` so it can be targeted and animated individually.
**chapters.json** = the content and design tokens, so cards can be rebuilt in code rather than hand-copied.

---

## 1. THE CHAPTER STRUCTURE

Twelve chapters in three parts, following the order the jacket is actually built.

### PART ONE — BUILD THE PIECES
| | Chapter | Sub | Groups | Pieces |
|---|---|---|---|---|
| 01 | THE FRONT | Choose your route | 02, 03, 01 | KSJ-001 · 004 · 005 006 007 008 · 013 017 018 |
| 02 | THE BACK | Plain or pleated | 04 | KSJ-009 · 012 |
| 03 | THE YOKE | Classic or western | 04 | KSJ-010 · 011 · 012.5 |
| 04 | THE COLLAR | Classic or western | 05 | KSJ-023 · 024 |
| 05 | SLEEVES & CUFFS | Universal to every route | 01 | KSJ-019 · 020 · 021 |
| 06 | THE WAISTBAND | Universal to every route | 01 | KSJ-022 |

### PART TWO — ASSEMBLY
| | Chapter | Sub | Groups | Pieces |
|---|---|---|---|---|
| 07 | SHOULDERS & SIDE SEAMS | Flat-felled, both | — | — |
| 08 | SETTING THE SLEEVES | In the round | 01 | KSJ-019 · 020 |
| 09 | WAISTBAND & COLLAR | Attaching both | 01, 05 | KSJ-022 · 023 · 024 |
| 10 | THE WAIST ADJUSTER | Buckle, Roughcut or cinch | 06 | KSJ-025 026 · 027 028 · 037 |

### PART THREE — FINISHING
| | Chapter | Sub | Groups | Pieces |
|---|---|---|---|---|
| 11 | THE LINING | Optional | 07, 01 | KSJ-014 · 015 · 016 |
| 12 | HARDWARE & FINISHING | Buttons, rivets, buttonholes | — | — |

**Why this order:** it mirrors the real build. All the components get made flat first (front, back, yoke, collar, sleeves, cuffs, waistband), then the jacket is assembled (shoulders, side seams, sleeves set in the round, waistband, collar, facing), then finished (lining, hardware).

---

## 2. THE COLOUR GROUPS

The pattern is colour coded into seven groups. Each chapter card shows which groups it draws from, using the same tints as the colour-coded A0 and the pattern map. **These hex values must not change** — they have to match the printed pattern.

| Group | Name | Hex |
|---|---|---|
| `01` | Universal pieces | `#6FA8DC` |
| `02` | Front route | `#86C06A` |
| `03` | Pocket | `#E8894A` |
| `04` | Back & yoke | `#A98BD4` |
| `05` | Collar | `#E2695C` |
| `06` | Waist adjuster | `#4FC1C4` |
| `07` | Lining | `#D9B455` |

---

## 3. DESIGN SYSTEM

**Canvas:** 1920 × 1080, 30fps

**Palette**
```
indigo (ground)      #172036
indigo deep (vignette) #111828
cream (headline)     #F6F1E6
gold (accent/number) #D6A33C
red (selvedge ID)    #C4312C
mute (labels)        #96A0B6
ghost number         #1E2942
foot rule            #34425F
```

**Type:** Helvetica Neue / Helvetica / Arial, bold throughout except sub-lines and body.
The brand's headline face is Helvetica Bold — do not substitute a geometric sans.

| Element | Size | Weight | Colour |
|---|---|---|---|
| Part label | 26 | 700 | mute, 2px tracking |
| Chapter number | 158 | 700 | gold |
| Title | 112 | 700 | cream, −2px tracking |
| Sub | 40 | 400 | `#C6CFE0` |
| Line | 31 | 400 | `#A8B2C6` |
| Section labels | 22 | 700 | mute, 2px tracking |
| Group name | 30 | 700 | cream |
| Piece codes | 28 | 700 | gold |
| Extra | 24 | 400 | `#9EA8BE` |
| Footer | 24 | 700 | `#8C98B0` |
| Ghost number | 300 | 700 | `#1E2942` |

**Layout**
- Selvedge strip: 92px wide, full height, left edge
- Left content column starts at x = 210
- Right column starts at x = 1220, 640px wide
- Footer rule at y = 948, footer text baseline y = 996

**The selvedge motif:** every card has a woven self-edge running down the left — ecru band, weft texture, and the red ID line stitched through it. It's the brand's signature and ties the cards to the fabric the jacket is made from. It should be present on every card and should never move.

---

## 4. ANIMATION BRIEF

These are **chapter openers, not transitions.** They should feel considered and calm, like a title page in a book. Nothing bouncy, nothing that slides in from off-screen at speed.

**Suggested duration:** 2.5–3.5 seconds on screen, plus in and out.

**Targetable element IDs in every chapter SVG:**
```
#bg            ground gradient
#bg-twill      diagonal twill texture
#ghost         large faint number, bottom right
#selvedge      the whole selvedge strip group
#part          "PART ONE — BUILD THE PIECES"
#rule          gold rule under the part label
#number        big gold chapter number
#title         chapter title (multi-line via tspan)
#sub           sub line
#line          one-line description
#right         wrapper for the right column
  .group       one per colour group (has data-group="01")
  #pieces      the KSJ codes
  #extra       secondary note
#footrule #foot-l #foot-r
```

The contents card (`00-contents.svg`) additionally has `#rows` containing `.row` elements, each with `data-ch="01"` etc, so chapters can be revealed one at a time or highlighted individually.

**A sequence that would suit the material:**

1. **0.0s** — ground and twill already present, held
2. **0.0–0.4s** — selvedge strip wipes down from the top, or the red ID stitches draw on in sequence. This is the signature move; it should read as thread being sewn.
3. **0.3–0.6s** — gold rule draws left to right
4. **0.4–0.8s** — part label fades up
5. **0.5–1.0s** — chapter number counts or fades in, slight upward drift (no more than 20px)
6. **0.7–1.2s** — title lines stagger up, 80ms apart, 24px travel, opacity 0 → 1
7. **1.0–1.4s** — sub and line fade
8. **1.2–1.8s** — colour group chips pop in one at a time, 100ms apart. Slight scale from 0.9. **These are the moment worth animating well** — they're the visual link to the printed pattern.
9. **1.5–1.9s** — piece codes fade
10. **Hold**
11. **Out** — whole card fades, or the selvedge wipes off in the direction it came from

**Easing:** cubic-bezier(0.22, 1, 0.36, 1) for entries. Nothing with overshoot or bounce.

**Respect the ghost number** — it should sit behind everything and can drift very slightly (10–15px) over the whole card for subtle life.

---

## 5. HOW TO USE THE FILES

**If rebuilding in code:** read `chapters.json`. It holds every card's content, the palette, the group definitions and the layout constants, so all 13 cards can be generated from one component rather than 13 hand-built compositions. Card `00` has `"type": "contents"`; the rest are `"type": "chapter"`.

**If animating the SVGs directly:** they're valid XML with ids on every element, so they can be inlined and targeted. Fonts are referenced by family name — make sure Helvetica or Helvetica Neue is available in the render environment, or the metrics will shift.

**The PNGs are reference only** — they show exactly how each card should look when static. Match them.

---

## 6. THINGS THAT MUST NOT CHANGE

1. **The seven group colours.** They match the printed pattern. If they drift, the cards stop matching the A0 people are holding.
2. **The chapter order.** It is the real build order, and the tutorial is edited to it.
3. **The KSJ piece codes.** They are the actual codes on the pattern sheet.
4. **The selvedge strip.** Brand signature, on every card, same position.
5. **Helvetica Bold.** Not a geometric sans, not a condensed face.

---

## 7. OPEN ITEMS

- **KSJ-012.5** is a placeholder. The master pattern file prints `KSJ-012` on both the Pleated Back and the Western Yoke Facing — a genuine duplicate. Chapter 03 shows `012.5` until that's corrected.
- **KSJ-042** exists on the A0 (Roughcut utility pocket edge facing) but appears in none of the booklets. Not currently shown on any card.
- If the tutorial gets split into **Part 1 / Part 2**, the contents card may need a variant showing which half is which.
