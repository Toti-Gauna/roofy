/**
 * What a piece's frames are made of, as one hash (the manifest's `sourceHash`, guía de motion v1 §6): the
 * piece's shot list, the stage that films it and the words it shows in every language. The driver writes it;
 * `tests/videos.test.ts` recomputes it and fails when a video was not re-rendered after one of these changed.
 * (The demo itself is not in it: a change to Lumen is checked by looking at the frames, not by a hash.)
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const STAGE_FILES = ['components/video/RenderStage.tsx', 'components/video/video.css', 'components/video/timeline.ts', 'components/video/clock.ts', 'components/video/audio.ts'];

export function sourceHash(root, piece) {
  const hash = createHash('sha256');
  for (const file of [`components/video/pieces/${piece}.ts`, ...STAGE_FILES]) hash.update(readFileSync(join(root, file)));
  for (const locale of ['es', 'en', 'pt']) {
    const messages = JSON.parse(readFileSync(join(root, 'messages', `${locale}.json`), 'utf8'));
    hash.update(JSON.stringify({ seal: messages.video.seal, brand: messages.video.brand, piece: messages.video[piece] }));
  }
  return hash.digest('hex');
}
