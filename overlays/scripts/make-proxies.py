#!/usr/bin/env python3
"""
Builds 1080p ProRes 4444 proxies of the 4K masters, with the alpha kept
straight.

    python3 scripts/make-proxies.py out/RC_DEMO_TILING.mov [more...]

WHY THIS IS NOT `ffmpeg -vf scale`. Downscaling averages neighbouring pixels,
and averaging the colour of pixels that have different alphas is wrong unless
you weight by alpha first. Scale straight-alpha footage naively and the ink
next to an edge bleeds into it: measured on RC_DEMO_SEAMALLOWANCE, the cut
edge went from RGB 255 (white paper, held at full value under partial alpha —
which is what straight alpha means) to a minimum of 5 and a mean of 215. That
is a dark fringe around every white paper cut in the library, on exactly the
feature the whole design hangs on.

So: premultiply, resize, unpremultiply. Where the resized alpha is zero there
is no colour to recover, so those pixels are left white rather than divided by
nothing — invisible at alpha 0, and it keeps the edge from picking up black.
"""
import sys
import av
import numpy as np
from PIL import Image

W, H = 1920, 1080


def proxy(src: str, dst: str, qscale: int | None = None) -> None:
    with av.open(src) as inp:
        st = inp.streams.video[0]
        out = av.open(dst, 'w')
        ost = out.add_stream('prores_ks', rate=st.average_rate)
        ost.width, ost.height, ost.pix_fmt = W, H, 'yuva444p10le'
        opts = {'profile': '4444'}
        if qscale is not None:
            opts['qscale'] = str(qscale)
        ost.options = opts

        for frame in inp.decode(video=0):
            a = frame.to_ndarray(format='rgba').astype(np.float32)
            rgb, alpha = a[..., :3], a[..., 3:4] / 255.0

            pm = rgb * alpha                       # premultiply
            pm_s = np.asarray(
                Image.fromarray(np.clip(pm, 0, 255).astype(np.uint8), 'RGB').resize((W, H), Image.LANCZOS),
                dtype=np.float32,
            )
            a_s = np.asarray(
                Image.fromarray((alpha[..., 0] * 255).astype(np.uint8), 'L').resize((W, H), Image.LANCZOS),
                dtype=np.float32,
            )[..., None] / 255.0

            safe = np.maximum(a_s, 1e-4)
            rgb_s = np.where(a_s > 1e-3, pm_s / safe, 255.0)   # unpremultiply
            outf = np.concatenate([np.clip(rgb_s, 0, 255), a_s * 255.0], axis=2).astype(np.uint8)

            for p in ost.encode(av.VideoFrame.from_ndarray(outf, format='rgba')):
                out.mux(p)
        for p in ost.encode():
            out.mux(p)
        out.close()


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    q = next((int(a.split('=')[1]) for a in sys.argv[1:] if a.startswith('--qscale=')), None)
    import os
    os.makedirs('out/_1080', exist_ok=True)
    for src in args:
        dst = f"out/_1080/{os.path.basename(src)}"
        proxy(src, dst, q)
        print(f"  {os.path.basename(dst):40s} {os.path.getsize(dst)/1048576:6.1f} MB")
