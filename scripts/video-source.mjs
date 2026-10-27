/**
 * What a film's frames and sound are made of, as one hash (the manifest's `sourceHash`, guía de motion v1 §0 and §6):
 * the film's own folder (its script, choreography and score), the trailer kit that draws it, the rebuilt pieces and the
 * Lumen data and copy they show, and the words on screen in every language. The driver writes it;
 * `tests/videos.test.ts` recomputes it and fails when a video was not re-rendered after one of these changed.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const STAGE_FILES = [
  'components/video/FilmStage.tsx',
  'components/video/film.ts',
  'components/video/moves.ts',
  'components/video/timeline.ts',
  'components/video/ui/devices.tsx',
  'components/video/ui/estate.tsx',
  'components/video/ui/trailer.css',
  'components/video/kinetic/score.ts',
  'components/video/kinetic/shim.ts',
  'components/video/kinetic/audio.js',
  'components/video/score/orquesta.ts',
  'components/video/score/arreglo.ts',
  'components/demos/real-estate/data.ts',
  'components/video/price.ts',
  'content/video-rates.json',
];

/** The film's folder, every file in a stable order. */
export function filmFiles(root, film) {
  const dir = `components/video/films/${film}`;
  return readdirSync(join(root, dir))
    .sort()
    .map((f) => `${dir}/${f}`);
}

export function sourceHash(root, film) {
  const hash = createHash('sha256');
  for (const file of [...filmFiles(root, film), ...STAGE_FILES]) hash.update(readFileSync(join(root, file)));
  for (const locale of ['es', 'en', 'pt']) {
    const m = JSON.parse(readFileSync(join(root, 'messages', `${locale}.json`), 'utf8'));
    hash.update(JSON.stringify({ seal: m.video.seal, brand: m.video.brand, film: m.video[film], price: m.video.price, plan: m.experience.plans[film], demo: m.demoRealEstate }));
  }
  return hash.digest('hex');
}
