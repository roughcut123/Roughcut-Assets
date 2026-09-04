import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Fonts are vendored into public/fonts rather than pulled from Google at
 * render time, so a render never depends on the network and always produces
 * byte-identical type. All four families are SIL Open Font Licence.
 *
 * loadFont() calls delayRender() internally, so Remotion will not capture a
 * frame until every face below has finished loading.
 */
const faces: {family: string; file: string; weight: string; style?: string}[] = [
  {family: 'Cinzel', file: 'Cinzel-Regular.woff2', weight: '400'},
  {family: 'Cinzel', file: 'Cinzel-Bold.woff2', weight: '700'},
  {family: 'Cinzel', file: 'Cinzel-Black.woff2', weight: '900'},
  {family: 'EB Garamond', file: 'EBGaramond-Regular.woff2', weight: '400'},
  {family: 'EB Garamond', file: 'EBGaramond-SemiBold.woff2', weight: '600'},
  {family: 'EB Garamond', file: 'EBGaramond-Italic.woff2', weight: '400', style: 'italic'},
  {family: 'Pinyon Script', file: 'PinyonScript-Regular.woff2', weight: '400'},
  {family: 'UnifrakturMaguntia', file: 'UnifrakturMaguntia-Regular.woff2', weight: '400'},
];

export const loadOverlayFonts = () => {
  for (const f of faces) {
    loadFont({
      family: f.family,
      url: staticFile(`fonts/${f.file}`),
      weight: f.weight,
      style: f.style,
      format: 'woff2',
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`Could not load ${f.family} ${f.weight} ${f.style ?? ''}`, err);
    });
  }
};
