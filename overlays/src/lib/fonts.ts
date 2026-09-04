import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Fonts are vendored into public/fonts rather than pulled from Google at
 * render time, so a render never depends on the network and always produces
 * byte-identical type. Both families are SIL Open Font Licence.
 *
 * loadFont() calls delayRender() internally, so Remotion will not capture a
 * frame until every face below has finished loading.
 */
const faces: {family: string; file: string; weight: string}[] = [
  {family: 'Archivo', file: 'Archivo-Regular.woff2', weight: '400'},
  {family: 'Archivo', file: 'Archivo-SemiBold.woff2', weight: '600'},
  {family: 'Archivo', file: 'Archivo-Bold.woff2', weight: '700'},
  {family: 'IBM Plex Mono', file: 'IBMPlexMono-Medium.woff2', weight: '500'},
  {family: 'IBM Plex Mono', file: 'IBMPlexMono-SemiBold.woff2', weight: '600'},
];

export const loadOverlayFonts = () => {
  for (const f of faces) {
    loadFont({
      family: f.family,
      url: staticFile(`fonts/${f.file}`),
      weight: f.weight,
      format: 'woff2',
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Could not load ${f.family} ${f.weight}`, err);
    });
  }
};
