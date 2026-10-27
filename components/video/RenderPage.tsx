'use client';

import { useSearch } from '@/lib/useSearch';
import { useIsClient } from '@/components/motion/useIsClient';
import { RenderStage } from './RenderStage';
import { PIECES, isPieceId } from './pieces';
import type { Ratio } from './timeline';

/** Reads `?piece=&ratio=` and mounts the stage (client only: the demo is a client experience). */
export function RenderPage() {
  const client = useIsClient();
  const params = new URLSearchParams(useSearch());
  const piece = params.get('piece');
  const ratio: Ratio = params.get('ratio') === '9x16' ? '9x16' : '16x9';
  if (!client) return null;
  if (!isPieceId(piece)) return <p style={{ color: 'white', padding: 24 }}>?piece= {Object.keys(PIECES).join(' | ')}</p>;
  return <RenderStage piece={PIECES[piece]} ratio={ratio} />;
}
