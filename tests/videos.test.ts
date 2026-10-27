import { describe, expect, it } from 'vitest';
import { PLAN_IDS } from '@/lib/plans';
import { VIDEOS, videoFor } from '@/lib/videos';

describe('the video registry', () => {
  it('names real plans, one video each, with a poster and a transcript in the three languages', () => {
    const seen = new Set<string>();
    for (const v of VIDEOS) {
      expect(v.plan === null || PLAN_IDS.includes(v.plan), v.id).toBe(true);
      expect(seen.has(String(v.plan)), `${v.id} repeats a plan`).toBe(false);
      seen.add(String(v.plan));
      expect(v.poster, v.id).toMatch(/^\//);
      expect(v.src, v.id).toMatch(/^\/.+\.(mp4|webm)$/);
      for (const locale of ['es', 'en', 'pt'] as const) expect(v.transcript[locale]?.length, `${v.id}/${locale}`).toBeGreaterThan(20);
    }
  });

  it('a plan without a video has no button', () => {
    for (const plan of [null, ...PLAN_IDS]) expect(videoFor(plan) === null || VIDEOS.some((v) => v.plan === plan)).toBe(true);
  });
});
