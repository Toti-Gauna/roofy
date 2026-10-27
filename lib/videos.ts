import registry from '@/content/estateos-videos.json';
import type { PlanId } from '@/lib/plans';

/**
 * The motion-graphics videos of EstateOS (guía de motion v1): one per plan plus the general one.
 * Rendered frame by frame from the real UI by the factory (`scripts/render-video.mjs`; no prices or quotas
 * inside), so the page owns the words: every video carries a poster, subtitles and a transcript in the
 * three languages. Nothing plays by itself. Each entry is also the file's manifest (§6).
 */
export type VideoLocale = 'es' | 'en' | 'pt';

export interface VideoFile {
  ratio: '16x9' | '9x16';
  /** Path under /public (served with the base path by the player). */
  src: string;
  poster: string;
  width: number;
  height: number;
  durationSec: number;
  fps: number;
  codec: string;
  bytes: number;
  sha256: string;
  /** Integrated loudness and true peak, as measured after the mix (§8). */
  lufs: number;
  truePeak: number;
}

export interface EstateosVideo {
  id: string;
  /** The plan the video is about; `null` is the general demo's video. */
  plan: PlanId | null;
  version: number;
  /** Language of the words in the image (the subtitles exist in all three). */
  lang: VideoLocale;
  durationSec: number;
  /** The 16:9 file: what plays unless the screen is portrait. */
  src: string;
  poster: string;
  files: readonly VideoFile[];
  subtitles: Record<VideoLocale, string>;
  transcript: Record<VideoLocale, string>;
  /** render · generated · mixed (only `render` so far: no generated material inside). */
  sourceType: 'render' | 'generated' | 'mixed';
  license: string;
  consent: string;
  synthetic: boolean;
  /** Catalog the video was cut against (a test flags it when the catalog moves on). */
  catalogVersion: string;
  /** Hash of what the frames are made of (the piece, the stage, its words); see scripts/video-source.mjs. */
  sourceHash: string;
  /** Ignacio's visual approval (ISO date), or null while it waits for it. */
  approvedAt: string | null;
}

export const VIDEOS = registry.videos as unknown as readonly EstateosVideo[];

export function videoFor(plan: PlanId | null): EstateosVideo | null {
  return VIDEOS.find((v) => v.plan === plan) ?? null;
}

/** The file for the screen: the 9:16 one on a portrait screen when it exists. */
export function fileFor(video: EstateosVideo, portrait: boolean): VideoFile | null {
  const want = portrait ? '9x16' : '16x9';
  return video.files.find((f) => f.ratio === want) ?? video.files[0] ?? null;
}
