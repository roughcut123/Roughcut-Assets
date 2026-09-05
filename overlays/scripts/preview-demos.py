#!/usr/bin/env python3
"""
Builds viewing copies of the demonstration popups.

The masters are ProRes 4444 with straight alpha, which most players show on
black — useless for judging a white paper cut.

    preview-demos.py grounds OUT.mp4 A.mov B.mov ...   dark | bright, side by side
    preview-demos.py alpha   OUT.mp4 A.mov B.mov ...   over a transparency checker

"grounds" is the one to judge the cut on, because the point of a white border
is that it survives both a dark bench and a bright print room. "alpha" is the
one that shows there is nothing behind the artwork at all.
"""
import sys, av, numpy as np
from PIL import Image

MODE, OUT, FILES = sys.argv[1], sys.argv[2], sys.argv[3:]
DARK, LIGHT = (24, 28, 34), (206, 196, 178)
CHECK = 40
PANEL = (960, 540) if MODE == 'grounds' else (1280, 720)


def checker(size):
    w, h = size
    xs = np.arange(w) // CHECK
    ys = np.arange(h) // CHECK
    odd = ((ys[:, None] + xs[None, :]) % 2).astype(bool)
    a = np.where(odd[..., None], 210, 170).astype('uint8').repeat(3, axis=2)
    return Image.fromarray(a, 'RGB')


w, h = PANEL
grounds = [Image.new('RGB', PANEL, DARK), Image.new('RGB', PANEL, LIGHT)] if MODE == 'grounds' else [checker(PANEL)]

out = av.open(OUT, 'w')
st = out.add_stream('libx264', rate=25)
st.width, st.height, st.pix_fmt = w * len(grounds), h, 'yuv420p'
st.options = {'crf': '18'}

for path in FILES:
    with av.open(path) as c:
        for f in c.decode(video=0):
            im = Image.fromarray(f.to_ndarray(format='rgba'), 'RGBA').resize(PANEL, Image.LANCZOS)
            sheet = Image.new('RGB', (w * len(grounds), h))
            for i, g in enumerate(grounds):
                panel = g.copy()
                panel.paste(im, (0, 0), im)
                sheet.paste(panel, (i * w, 0))
            for p in st.encode(av.VideoFrame.from_image(sheet)):
                out.mux(p)
for p in st.encode():
    out.mux(p)
out.close()
print(OUT)
