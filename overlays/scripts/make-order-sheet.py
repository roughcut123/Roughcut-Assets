#!/usr/bin/env python3
"""
Builds the editor's order sheet: ORDER.md plus a contact sheet showing every
card in sequence with the exact filename under it.

    python3 scripts/make-order-sheet.py

This exists because "which card goes where" was answered by a WhatsApp message
once and should not have to be again. Both outputs are generated from
chapters.json, so the sheet cannot disagree with the cards themselves — if the
order changes, this regenerates and the two stay in step.
"""
import json
import os
import subprocess
import sys

import av
from PIL import Image, ImageDraw, ImageFont

OUT_MD = 'out/_previews/ORDER.md'
OUT_PNG = 'out/_previews/RC_CHAPTER_ORDER.png'
FONT_B = '/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf'
FONT_R = '/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf'


def slug(file_field: str) -> str:
    return file_field.split('-', 1)[1].replace('-', '_').upper()


def name_of(card) -> str:
    return f"RC_CHAPTER_{card['id']}_{slug(card['file'])}"


def hold_frame(path: str, idx: int = 120) -> Image.Image:
    with av.open(path) as c:
        for i, fr in enumerate(c.decode(video=0)):
            if i == idx:
                return fr.to_image().convert('RGB')
    raise SystemExit(f'{path}: no frame {idx}')


def main():
    d = json.load(open('src/chapters/chapters.json'))
    cards = d['cards']
    parts = d['parts']
    fps = d['meta']['fps']

    rows = []
    for c in cards:
        f = f"out/{name_of(c)}.mov"
        if not os.path.exists(f):
            sys.exit(f'missing render: {f}')
        with av.open(f) as cont:
            n = cont.streams.video[0].frames or 0
        rows.append((c, f, n))

    # ---- ORDER.md ----------------------------------------------------------
    os.makedirs('out/_previews', exist_ok=True)
    with open(OUT_MD, 'w') as fh:
        fh.write('# Keystone chapter cards — running order\n\n')
        fh.write(f'{len(rows)} cards. {d["meta"]["width"]}x{d["meta"]["height"]}, '
                 f'{fps}fps, ProRes 4444 with straight alpha, no audio.\n\n')
        fh.write('Drop them in this order. Each card is opaque through its hold, so it\n')
        fh.write('cuts as a full-screen card; the alpha is there for the in and out fades\n')
        fh.write('if you want them over footage.\n\n')
        fh.write('| # | Card | File | Frames | Duration |\n')
        fh.write('|---|---|---|---:|---:|\n')
        last = None
        for c, f, n in rows:
            if c['type'] == 'chapter' and c['part'] != last:
                last = c['part']
                fh.write(f"| | **PART {parts[last]['roman']} — {parts[last]['name']}** | | | |\n")
            title = c['title'].replace('\n', ' ')
            fh.write(f"| {c['id']} | {title} | `{name_of(c)}.mov` | {n} | {n / fps:.2f}s |\n")
        total = sum(n for _, _, n in rows)
        fh.write(f"\n**Total** {total} frames, {total / fps:.1f}s across {len(rows)} cards.\n")
    print(f'wrote {OUT_MD}')

    # ---- contact sheet -----------------------------------------------------
    COLS, TW = 3, 600
    th = round(TW * d['meta']['height'] / d['meta']['width'])
    PAD, CAP = 18, 62
    rowsn = (len(rows) + COLS - 1) // COLS
    sheet = Image.new('RGB', (COLS * (TW + PAD) + PAD, rowsn * (th + CAP + PAD) + PAD + 64),
                      (16, 20, 30))
    d1 = ImageDraw.Draw(sheet)
    d1.text((PAD, 20), 'THE KEYSTONE JACKET  —  CHAPTER CARDS, RUNNING ORDER',
            font=ImageFont.truetype(FONT_B, 26), fill=(214, 163, 60))
    fb = ImageFont.truetype(FONT_B, 21)
    fr = ImageFont.truetype(FONT_R, 16)
    for i, (c, f, n) in enumerate(rows):
        im = hold_frame(f).resize((TW, th), Image.LANCZOS)
        x = PAD + (i % COLS) * (TW + PAD)
        y = 64 + PAD + (i // COLS) * (th + CAP + PAD)
        sheet.paste(im, (x, y))
        d1.rectangle([x, y, x + TW - 1, y + th - 1], outline=(52, 66, 96))
        title = c['title'].replace('\n', ' ')
        d1.text((x, y + th + 8), f"{c['id']}   {title}", font=fb, fill=(246, 241, 230))
        d1.text((x, y + th + 34), f"{name_of(c)}.mov", font=fr, fill=(150, 160, 182))
    sheet.save(OUT_PNG)
    print(f'wrote {OUT_PNG}  {sheet.size[0]}x{sheet.size[1]}')


if __name__ == '__main__':
    main()
