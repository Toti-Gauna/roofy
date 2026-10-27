import registry from '@/content/estateos-videos.json';
import type { PlanId } from '@/lib/plans';

/**
 * The motion-graphics videos of EstateOS (guía de motion v1): one per plan plus the general one.
 * Rendered frame by frame from the real UI (no prices or quotas inside), so the page owns the words:
 * every video carries a poster and a transcript in the three languages. Nothing plays by itself.
 */
export interface EstateosVideo {
  id: string;
  /** The plan the video is about; `null` is the general demo's video. */
  plan: PlanId | null;
  /** Path under /public (served with the base path by the player). */
  src: string;
  poster: string;
  durationSec: number;
  transcript: { es: string; en: string; pt: string };
}

export const VIDEOS = registry.videos as unknown as readonly EstateosVideo[];

export function videoFor(plan: PlanId | null): EstateosVideo | null {
  return VIDEOS.find((v) => v.plan === plan) ?? null;
}
