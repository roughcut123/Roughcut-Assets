#!/usr/bin/env python3
"""
Extracts pattern artwork from a Roughcut pattern PDF into public/pattern/.

    python3 scripts/extract-pattern.py <pattern.pdf> [tile refs...]

Nothing here redraws or imitates the pattern — it lifts the pages. Text is
converted to paths so a render depends on no font and no network, and the two
colours the pattern uses are mapped onto the library's tokens: near-black to
--rc-ink, and the grey grid reference to a warm tint that sits on --rc-paper
rather than on the white the pattern assumes.

Re-run it whenever the pattern is revised; the transition picks the new tiles
up with no code change.
"""
import os
import re
import sys

import pymupdf

OUT = 'public/pattern'
INK = '#3B2E22'    # --rc-ink
GHOST = '#CFC4B2'  # the grid reference, warmed onto --rc-paper
DEFAULT_TILES = ['A1', 'D1', 'G1', 'D2', 'E2', 'F2', 'L2', 'L3']


def recolour(svg: str) -> str:
    for black in ('#231f20', '#000000', '#000', 'black'):
        svg = svg.replace(f'stroke="{black}"', f'stroke="{INK}"')
        svg = svg.replace(f'fill="{black}"', f'fill="{INK}"')
    return re.sub(r'#d4d4d6', GHOST, svg, flags=re.I)


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = sys.argv[1]
    wanted = sys.argv[2:] or DEFAULT_TILES
    doc = pymupdf.open(src)
    os.makedirs(OUT, exist_ok=True)

    index = {}
    for i in range(doc.page_count):
        head = doc[i].get_text().strip().split('\n')[0].strip()[:3]
        if re.fullmatch(r'[A-Z]\d', head):
            index.setdefault(head, i)

    for ref in wanted:
        if ref not in index:
            print(f'  ! {ref} not in this pattern')
            continue
        svg = recolour(doc[index[ref]].get_svg_image(text_as_path=True))
        open(f'{OUT}/tile-{ref}.svg', 'w').write(svg)
        print(f'  tile-{ref}.svg  ({len(svg) / 1024:.0f} KB)')

    # The circular mark, cropped off the title block on the first tile. It is
    # drawn over a white disc — invisible on a white page, a punched hole on
    # aged paper — so the white fills come out.
    first = doc[index[wanted[0]] if wanted[0] in index else 0]
    first.set_cropbox(pymupdf.Rect(108, 130, 260, 282))
    mark = recolour(first.get_svg_image(text_as_path=True)).replace('fill="#ffffff"', 'fill="none"')
    open(f'{OUT}/mark.svg', 'w').write(mark)
    print(f'  mark.svg  ({len(mark) / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
