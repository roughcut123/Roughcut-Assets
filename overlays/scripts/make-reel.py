#!/usr/bin/env python3
"""
Builds the viewable reel: every transition played in situ, cutting between two
real garment photographs, plus an alpha version on a checkerboard.

    python3 scripts/make-reel.py RC_TRANS_RIVETS_A [more...]
    python3 scripts/make-reel.py --alpha --out=name RC_TRANS_RIVETS_A
    python3 scripts/make-reel.py --plain --out=name RC_CHAPTER_00_CONTENTS

WHY THIS EXISTS RATHER THAN SENDING THE FILES. The masters are 4K ProRes 4444
at 110-450 MB. A 1080p ProRes 4444 proxy of one 62-frame transition floors at
about 57 MB even with bits_per_mb pushed to 1500 — ProRes 4444 simply does not
go below that with the alpha plane intact — and the chat upload cap is 30 MB.
So the alpha files are delivered by rendering from the branch, and what gets
sent is this: an H.264 reel that shows what they do.

The compositing is done at FULL 4K and only then downscaled. That is not
laziness about the premultiply/resize/unpremultiply dance in make-proxies.py —
it sidesteps it. Once the transition is over an opaque backdrop there is no
alpha left to resample wrongly.
"""
import sys, os, glob
import av
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080

# The frame rate is READ FROM THE SOURCE, never assumed. The §6 library runs at
# 25 and the Keystone chapter cards at 30, and a reel hard-coded to either one
# silently retimes the other.

FONT = next(
    (f for f in [
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    ] if os.path.exists(f)),
    None,
)


def backdrops(n: int) -> list[Image.Image]:
    """n+1 garment photographs, centre-cropped to 16:9 at output size."""
    pool = sorted(
        f for f in glob.glob('../garments/*')
        if os.path.splitext(f)[1].lower() in ('.jpg', '.jpeg', '.png')
    )
    picked, out = [], []
    for f in pool:
        try:
            im = Image.open(f)
            if min(im.size) >= 1000:
                picked.append(f)
        except Exception:
            pass
    # Spread the choice across the folder rather than taking the first n.
    step = max(1, len(picked) // (n + 1))
    for f in picked[::step][: n + 1]:
        im = Image.open(f).convert('RGB')
        s = max(W / im.width, H / im.height)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        L = (im.width - W) // 2
        T = (im.height - H) // 2
        out.append(im.crop((L, T, L + W, T + H)))
    return out


def checker(w: int, h: int, s: int = 64) -> Image.Image:
    im = Image.new('RGB', (w, h), (208, 208, 208))
    d = ImageDraw.Draw(im)
    for y in range(0, h, s):
        for x in range(0, w, s):
            if (x // s + y // s) % 2:
                d.rectangle([x, y, x + s, y + s], fill=(176, 176, 176))
    return im


def label(im: Image.Image, text: str) -> Image.Image:
    if FONT is None:
        return im
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 34)
    box = d.textbbox((0, 0), text, font=f)
    pad = 18
    d.rectangle([40, H - 40 - (box[3] + pad * 2), 40 + box[2] + pad * 2, H - 40], fill=(20, 16, 12))
    d.text((40 + pad, H - 40 - box[3] - pad), text, font=f, fill=(239, 229, 210))
    return im


def source_fps(ids: list[str]) -> int:
    rates = set()
    for aid in ids:
        with av.open(f'out/{aid}.mov') as c:
            rates.add(round(float(c.streams.video[0].average_rate)))
    if len(rates) > 1:
        raise SystemExit(f'make-reel.py: mixed frame rates {sorted(rates)} — '
                         'a single reel cannot carry both without retiming one.')
    return rates.pop()


def build(ids: list[str], dst: str, mode: str) -> None:
    shots = backdrops(len(ids)) if mode == 'garment' else None
    fps = source_fps(ids)
    out = av.open(dst, 'w')
    ost = out.add_stream('libx264', rate=fps)
    ost.width, ost.height, ost.pix_fmt = W, H, 'yuv420p'
    ost.options = {'crf': '20', 'preset': 'medium'}

    for k, aid in enumerate(ids):
        src = f'out/{aid}.mov'
        c = av.open(src)
        n = c.streams.video[0].frames or 62
        # The backdrop cuts under the transition's own hold, which is the whole
        # point of the asset: the cut is never seen.
        cut = 31
        for i, fr in enumerate(c.decode(video=0)):
            rgba = fr.to_ndarray(format='rgba').astype(np.float32)
            fg, a = rgba[..., :3], rgba[..., 3:4] / 255.0
            if mode == 'garment':
                bg4 = shots[k if i < cut else k + 1]
            elif mode == 'plain':
                # Opaque, full-frame cards: nothing to show behind them, so the
                # only honest backdrop is the black they will be cut against.
                bg4 = Image.new('RGB', (W, H), (0, 0, 0))
            else:
                bg4 = None
            top = Image.fromarray(
                np.clip(fg, 0, 255).astype(np.uint8), 'RGB'
            ).resize((W, H), Image.LANCZOS)
            am = Image.fromarray(
                (a[..., 0] * 255).astype(np.uint8), 'L'
            ).resize((W, H), Image.LANCZOS)
            base = (bg4 if bg4 is not None else checker(W, H)).copy()
            base.paste(top, (0, 0), am)
            out.mux(ost.encode(av.VideoFrame.from_image(label(base, aid))))
        c.close()
        print(f'  {aid}  ({n} frames)')
    for p in ost.encode():
        out.mux(p)
    out.close()
    print(f'{dst}  {os.path.getsize(dst)/1048576:.1f} MB')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    mode = 'alpha' if '--alpha' in sys.argv else 'plain' if '--plain' in sys.argv else 'garment'
    name = next((a.split('=')[1] for a in sys.argv[1:] if a.startswith('--out=')), 'reel')
    os.makedirs('out/_previews', exist_ok=True)
    build(args, f'out/_previews/{name}.mp4', mode)
