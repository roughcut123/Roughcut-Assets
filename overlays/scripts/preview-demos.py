#!/usr/bin/env python3
"""
Builds a viewing copy of the demonstration popups.

The masters are ProRes 4444 with straight alpha, which most players show on
black — useless for judging a white paper cut. This composites each one over
two grounds side by side, a dark one and a bright one, because the whole point
of the white cut edge is that it survives both.
"""
import sys, av, numpy as np
from PIL import Image

FILES = sys.argv[1:-1]
OUT = sys.argv[-1]
SCALE = 0.25                      # 3840x2160 -> 960x540 per panel
DARK, LIGHT = (24, 28, 34), (206, 196, 178)


def frames(path):
    with av.open(path) as c:
        for f in c.decode(video=0):
            yield f.to_ndarray(format='rgba')


out = av.open(OUT, 'w')
st = out.add_stream('libx264', rate=25)
st.width, st.height, st.pix_fmt = 960 * 2, 540, 'yuv420p'
st.options = {'crf': '18'}

for path in FILES:
    for arr in frames(path):
        im = Image.fromarray(arr, 'RGBA').resize((960, 540), Image.LANCZOS)
        sheet = Image.new('RGB', (1920, 540))
        for i, bg in enumerate((DARK, LIGHT)):
            g = Image.new('RGB', (960, 540), bg)
            g.paste(im, (0, 0), im)
            sheet.paste(g, (i * 960, 0))
        for p in st.encode(av.VideoFrame.from_image(sheet)):
            out.mux(p)
for p in st.encode():
    out.mux(p)
out.close()
print(OUT)
