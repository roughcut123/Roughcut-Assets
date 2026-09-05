import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS_H, CANVAS_W, TIMING} from '../lib/spec';
import {MONO, Sheet} from '../lib/sheet';
import {drawOn, exitRamp, paperAngle} from '../lib/motion';

/**
 * FAMILY E — cross-references. Spec §10.
 *
 * "antique map fragment with a red route line and a circled destination. This
 * reuses the existing 'Relic from the British Isles' device." Lower-right so
 * it does not fight a top-left popup. 4s.
 *
 * The route line and the circled destination are ONE mark, not two: the route
 * is drawn and terminates in the ring. §3.2 allows a single red annotation per
 * asset and §10 describes a single gesture, so they are drawn as one
 * continuous stroke plus its terminal ring.
 *
 * The map itself is drawn as a graticule with coastline contours rather than a
 * scan. §3.6 wants a real Library of Congress map and none can be fetched
 * here; §16 forbids faking a specific historical plate, so this is generic
 * cartographic line work. Logged in NOTES.md.
 */

const W = 1420;
const PAD = 54;
const MAP_H = 520;
const THUMB_W = 470;

export type CrossRefProps = {
  /** The video being pointed at. */
  title: string;
  /** Optional timestamp, e.g. "12:40". §10 asks for this on SKIPAHEAD. */
  timestamp?: string;
  /**
   * §10: the parameterised version takes a thumbnail path. Supply a file under
   * public/ and it is framed beside the title; omit it and the map fragment
   * runs full width. No thumbnails have been supplied yet - NOTES.md.
   */
  thumbnail?: string;
  variant: number;
};

export const CrossRef: React.FC<CrossRefProps> = ({title, timestamp, thumbnail, variant}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {out} = TIMING.crossref;
  const exitStart = durationInFrames - out;

  const H = PAD * 2 + MAP_H + 130;
  const place = drawOn(frame, 0, 4);
  const exit = exitRamp(frame, exitStart, out);
  const angle = paperAngle(`xref-${title}`);
  const route = drawOn(frame, 8, 14);
  const ring = drawOn(frame, 20, 8);

  const mapX = PAD;
  const mapY = PAD;
  const mapW = W - PAD * 2 - (thumbnail ? THUMB_W + 34 : 0);

  // Destination sits on the right of the fragment, as Bournemouth does.
  const dx = mapX + mapW * 0.74;
  const dy = mapY + MAP_H * 0.62;
  const routeLen = 1500;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          right: 170,
          bottom: 150,
          width: W,
          height: H,
          transform: `translateY(${exit * 20}px) rotate(${angle}deg)`,
          transformOrigin: 'bottom right',
          opacity: place * (1 - exit),
        }}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Sheet w={W} h={H} variant={variant} torn={['top', 'left']} />

          <clipPath id={`xr-${variant}`}>
            <rect x={mapX} y={mapY} width={mapW} height={MAP_H} />
          </clipPath>
          <g clipPath={`url(#xr-${variant})`}>
            <rect x={mapX} y={mapY} width={mapW} height={MAP_H} fill="var(--rc-paper-deep)" opacity={0.45} />
            {/* graticule */}
            {Array.from({length: 9}).map((_, i) => (
              <line key={`v${i}`} x1={mapX + (mapW / 8) * i} y1={mapY} x2={mapX + (mapW / 8) * i} y2={mapY + MAP_H}
                stroke="var(--rc-ink)" strokeWidth={2} opacity={0.2} />
            ))}
            {Array.from({length: 6}).map((_, i) => (
              <line key={`h${i}`} x1={mapX} y1={mapY + (MAP_H / 5) * i} x2={mapX + mapW} y2={mapY + (MAP_H / 5) * i}
                stroke="var(--rc-ink)" strokeWidth={2} opacity={0.2} />
            ))}
            {/* coastline contours */}
            {Array.from({length: 5}).map((_, i) => {
              const o = i * 34;
              const p = `M ${mapX - 40} ${mapY + 150 + o} q ${mapW * 0.22} ${-90 + o * 0.5} ${mapW * 0.44} ${20 + o * 0.2}
                         t ${mapW * 0.5} ${60 - o * 0.3}`;
              return <path key={i} d={p} fill="none" stroke="var(--rc-ink)" strokeWidth={3} opacity={0.34 - i * 0.05} />;
            })}
          </g>

          {/* One red gesture: the route, terminating in the ring. */}
          <g stroke="var(--rc-annotation)" fill="none" strokeLinecap="round">
            <path
              d={`M ${mapX + 60} ${mapY + MAP_H * 0.24} q ${mapW * 0.3} ${MAP_H * 0.1} ${mapW * 0.5} ${MAP_H * 0.26} T ${dx - 40} ${dy}`}
              strokeWidth={7}
              strokeDasharray={routeLen}
              strokeDashoffset={routeLen * (1 - route)}
            />
            <circle
              cx={dx}
              cy={dy}
              r={40}
              strokeWidth={7}
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - ring)}
            />
          </g>
        </svg>

        {thumbnail ? (
          <div
            style={{
              position: 'absolute',
              left: PAD + mapW + 34,
              top: PAD,
              width: THUMB_W,
              height: MAP_H,
              overflow: 'hidden',
              border: '5px solid var(--rc-ink)',
              opacity: drawOn(frame, 5, 6),
            }}
          >
            <Img src={staticFile(thumbnail)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: PAD + MAP_H + 26,
            width: W - PAD * 2,
            fontFamily: MONO,
            color: 'var(--rc-ink)',
            opacity: drawOn(frame, 6, 5),
          }}
        >
          <div style={{fontSize: 52, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase'}}>{title}</div>
          {timestamp ? <div style={{fontSize: 48, marginTop: 8}}>Skip to {timestamp}</div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
