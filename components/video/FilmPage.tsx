'use client';

import dynamic from 'next/dynamic';
import { useSearch } from '@/lib/useSearch';
import type { Ratio } from './timeline';

// Kinetic's vendored audio engine touches `window` when its module runs: the stage never renders on the server.
const FilmStage = dynamic(() => import('./FilmStage').then((m) => m.FilmStage), { ssr: false });

/** Reads `?film=&ratio=` and mounts the stage (client only: the timeline measures the DOM). */
export function FilmPage() {
  const params = new URLSearchParams(useSearch());
  const ratio: Ratio = params.get('ratio') === '9x16' ? '9x16' : '16x9';
  if (params.get('film') !== 'contact') return <p style={{ padding: 24 }}>?film=contact</p>;
  return <FilmStage film="contact" ratio={ratio} />;
}
