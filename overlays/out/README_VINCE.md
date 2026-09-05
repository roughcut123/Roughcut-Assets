# ROUGHCUT OVERLAY LIBRARY — for Vince

**Drop every file at 0,0.** Artwork is already in its final screen position on a
full 3840×2160 transparent canvas. Do not reposition, do not scale, do not crop.

All files are **3840×2160 ProRes 4444, 25 fps, straight (unpremultiplied)
alpha, no audio track.** DaVinci Resolve reads the alpha natively — if you see a
black box, the clip's alpha is set to premultiplied; switch it to straight.

Every asset except `RC_FABRIC_SEQUENCE` also ships a **`_LOOP`** version with
the hold extended to 10s, for when Jack talks over a point longer than
expected. Trim it — never stretch.

Assets marked **‡** are parameterised and may arrive in several versions per
build (different zip lengths, thread weights, garment names, timestamps).

**`RC_FABRIC_SEQUENCE.mov` is the whole fabric monologue in one clip — drop it
in unchanged.** The eight `RC_FABRIC_0*` beats are the same content as separate
assets, in case the sequence needs re-spacing against the voice-over.

Transitions cover the frame across their middle. Put your cut under the hold.

| File | Family | Duration | Position | Purpose |
|---|---|---|---|---|
| `RC_POPUP_SEAMALLOWANCE.mov` | C · popup | 137f / 5.48s | top-left | The ¼in / 6mm rule. Most repeated line on the channel. |
| `RC_POPUP_TESTSQUARE.mov` | C · popup | 137f / 5.48s | top-left | Print page one and measure it before anything else. |
| `RC_POPUP_TILING.mov` | C · popup | 137f / 5.48s | top-left | Overlap to the bleed line, never butt the pages. |
| `RC_POPUP_BULLSEYE.mov` | C · popup | 137f / 5.48s | top-left | Corner bullseyes sit on top of each other. |
| `RC_POPUP_FORMATS.mov` | C · popup | 137f / 5.48s | top-left | A4 / US Letter / A0. |
| `RC_POPUP_CUTTWOMIRRORED.mov` | C · popup | 137f / 5.48s | top-left | Good sides together, gives a left and a right. |
| `RC_POPUP_GRAINLINE.mov` | C · popup | 137f / 5.48s | top-left | Arrow parallel to the selvedge. |
| `RC_POPUP_SIZING.mov` | C · popup | 137f / 5.48s | top-left | Garment measurements, not body measurements. |
| `RC_POPUP_HEMALLOWANCE.mov` | C · popup | 137f / 5.48s | top-left | ½in hem allowance, fabric only. |
| `RC_POPUP_SKILLLEVEL_1.mov` | C · popup | 137f / 5.48s | top-left | Skill level, filled bar. |
| `RC_POPUP_SKILLLEVEL_2.mov` | C · popup | 137f / 5.48s | top-left | Skill level, filled bar. |
| `RC_POPUP_SKILLLEVEL_3.mov` | C · popup | 137f / 5.48s | top-left | Skill level, filled bar. |
| `RC_POPUP_SKILLLEVEL_4.mov` | C · popup | 137f / 5.48s | top-left | Skill level, filled bar. |
| `RC_POPUP_SKILLLEVEL_5.mov` | C · popup | 137f / 5.48s | top-left | Skill level, filled bar. |
| `RC_POPUP_FACINGS.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_FLATFELL.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_TOPSTITCH.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_BARTACK.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_TRIMCORNERS.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_PINCHROLL.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_HAMMER.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_PRESSERFOOT.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_ZIPPULLER.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_SELVEDGE.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_WAXPEN.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_BURRRIVETS.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_OVERLOCKER.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_DOMESTIC.mov` | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_ZIPLENGTH.mov` ‡ | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_THREAD.mov` ‡ | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_FABRICWEIGHT.mov` ‡ | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_POPUP_PIECECODE.mov` ‡ | C · popup | 137f / 5.48s | top-left | Technique note. |
| `RC_DEMO_SEAMALLOWANCE.mov` | C · demonstration popup | 137f / 5.48s | top-left | Shows the ¼in gap between needle and raw edge. |
| `RC_DEMO_RIGHTSIDESTOGETHER.mov` | C · demonstration popup | 137f / 5.48s | top-left | Panel turns over and lands print to print. |
| `RC_DEMO_BACKSTITCH.mov` | C · demonstration popup | 137f / 5.48s | top-left | Three forward, three back, then away. |
| `RC_DEMO_GRAINLINE.mov` | C · demonstration popup | 137f / 5.48s | top-left | Arrow swings parallel to the selvedge. |
| `RC_DEMO_PRESSSEAMSOPEN.mov` | C · demonstration popup | 137f / 5.48s | top-left | Allowances stand, iron lands, they lie open. |
| `RC_DEMO_TILING.mov` | C · demonstration popup | 137f / 5.48s | top-left | Each page's edge lands on the previous page's alignment line. |
| `RC_DEMO_PAGEORDER.mov` | C · demonstration popup | 137f / 5.48s | top-left | The assembly map: letters across, numbers down, A1 first. |
| `RC_DEMO_TESTSQUARE.mov` | C · demonstration popup | 137f / 5.48s | top-left | Print at 100%, then measure the two-inch square. |
| `RC_DEMO_FORMATS.mov` | C · demonstration popup | 137f / 5.48s | top-left | A4, US Letter, A0 — and the sixteen pages A0 replaces. |
| `RC_DEMO_SIZING.mov` | C · demonstration popup | 137f / 5.48s | top-left | Measured across the finished garment, laid flat. |
| `RC_TRANS_PATTERN_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_PATTERN_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_FABRIC_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_FABRIC_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_CUTTING_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_CUTTING_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_POCKETS_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_POCKETS_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_FLY_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_FLY_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_BACK_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_BACK_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_SLEEVES_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_SLEEVES_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_LINING_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_LINING_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_COLLAR_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_COLLAR_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_CONSTRUCTION_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_CONSTRUCTION_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_WAISTBAND_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_WAISTBAND_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_HARDWARE_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_HARDWARE_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_REVEAL_A.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_TRANS_REVEAL_B.mov` | A · chapter transition | 62f / 2.48s | full frame | Cover / hold / uncover into  chapter transition. |
| `RC_FABRIC_01_INTRO.mov` | §5 · fabric segment | 137f / 5.48s | left, vertically centred | Fabric segment beat. |
| `RC_FABRIC_02_CLOTH.mov` | §5 · fabric segment | 237f / 9.48s | left, vertically centred | Fabric segment beat. |
| `RC_FABRIC_03_ORIGIN.mov` | §5 · fabric segment | 147f / 5.88s | left, vertically centred | Fabric segment beat. |
| `RC_FABRIC_04_WEAR.mov` | §5 · fabric segment | 167f / 6.68s | left, vertically centred | Fabric segment beat. |
| `RC_FABRIC_05_BUYING.mov` | §5 · fabric segment | 157f / 6.28s | left, vertically centred | Fabric segment beat. |
| `RC_FABRIC_06_CHARACTER.mov` | §5 · fabric segment | 212f / 8.48s | left, vertically centred | Fabric segment beat. |
| `RC_FABRIC_07_INPATTERN.mov` | §5 · fabric segment | 222f / 8.88s | left, vertically centred | Fabric segment beat. |
| `RC_FABRIC_08_CADENCE.mov` | §5 · fabric segment | 192f / 7.68s | left, vertically centred | Fabric segment beat. |
| `RC_TITLE_PATTERN.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_FABRIC.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_CUTTING.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_POCKETS.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_FLY.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_BACKPANEL.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_SLEEVES.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_LINING.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_COLLAR.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_CONSTRUCTION.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_WAISTBAND.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_HARDWARE.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_TITLE_REVEAL.mov` | B · chapter title card | 50f / 2.00s | lower-left third | Chapter title card. |
| `RC_CORR_DONTCOPY.mov` | D · correction | 95f / 3.80s | top-left | Correction — red hand annotation. |
| `RC_CORR_SEWNSHUT.mov` | D · correction | 95f / 3.80s | top-left | Correction — red hand annotation. |
| `RC_CORR_ORDER.mov` | D · correction | 95f / 3.80s | top-left | Correction — red hand annotation. |
| `RC_CORR_MEASURE.mov` | D · correction | 95f / 3.80s | top-left | Correction — red hand annotation. |
| `RC_CORR_WRONGSIDE.mov` | D · correction | 95f / 3.80s | top-left | Correction — red hand annotation. |
| `RC_ASIDE_OVERLOCKER.mov` | D · aside | 75f / 3.00s | bottom-right | Running gag. Tiny, deadpan. |
| `RC_ASIDE_IRON.mov` | D · aside | 75f / 3.00s | bottom-right | Running gag. Tiny, deadpan. |
| `RC_XREF_WELTEDPOCKET.mov` | E · cross-reference | 99f / 3.96s | lower-right | Points at another video. |
| `RC_XREF_KEYSTONEFLY.mov` | E · cross-reference | 99f / 3.96s | lower-right | Points at another video. |
| `RC_XREF_AEROITALY.mov` | E · cross-reference | 99f / 3.96s | lower-right | Points at another video. |
| `RC_XREF_HELPPAGE.mov` | E · cross-reference | 99f / 3.96s | lower-right | Points at another video. |
| `RC_XREF_POVVERSION.mov` | E · cross-reference | 99f / 3.96s | lower-right | Points at another video. |
| `RC_XREF_LONGVERSION.mov` | E · cross-reference | 99f / 3.96s | lower-right | Points at another video. |
| `RC_XREF_SKIPAHEAD.mov` ‡ | E · cross-reference | 99f / 3.96s | lower-right | Points at another video. |
| `RC_DAY_END.mov` | F · day break | 75f / 3.00s | lower-left | End-of-session sign-off. |
| `RC_DAY_02.mov` | F · day break | 50f / 2.00s | lower-left | Morning stamp on the cut. |
| `RC_DAY_03.mov` | F · day break | 50f / 2.00s | lower-left | Morning stamp on the cut. |
| `RC_DAY_04.mov` | F · day break | 50f / 2.00s | lower-left | Morning stamp on the cut. |
| `RC_REVEAL_CERT.mov` ‡ | G · final reveal | 170f / 6.80s | centre / lower-left | Certificate of authentication. The closing frame. |
| `RC_REVEAL_LOWER.mov` ‡ | G · final reveal | 170f / 6.80s | centre / lower-left | Slim strip for try-on B-roll: pattern name and price. |
| `RC_FABRIC_SEQUENCE.mov` | §5 · fabric segment | 1471f / 58.84s | left, vertically centred | The whole fabric monologue. DROP IN UNCHANGED. |

_110 assets. Generated from the compositions themselves — if this
table and the files disagree, the files are right._
