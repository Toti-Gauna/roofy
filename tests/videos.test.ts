import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATALOG_VERSION, PLAN_IDS } from '@/lib/plans';
import { VIDEOS, fileFor, videoFor } from '@/lib/videos';
import { FORMATS, SUB } from '@/components/video/timeline';
import { sourceHash } from '../scripts/video-source.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const pub = (path: string) => `${ROOT}public${path}`;

describe('the video registry (guía de motion v1 §6)', () => {
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

  it.each(VIDEOS.map((v) => [v.id, v] as const))('%s: every file is there, as the manifest says, within its weight target', (_, v) => {
    for (const f of v.files) {
      const path = pub(f.src);
      expect(existsSync(path), f.src).toBe(true);
      expect(statSync(path).size, f.src).toBe(f.bytes);
      expect(createHash('sha256').update(readFileSync(path)).digest('hex'), f.src).toBe(f.sha256);
      expect(f.bytes, `${f.src} weighs more than its target`).toBeLessThanOrEqual(FORMATS[f.ratio].maxBytes);
      expect(existsSync(pub(f.poster)), f.poster).toBe(true);
      expect(statSync(pub(f.poster)).size, `${f.poster} > 200 KB`).toBeLessThanOrEqual(200 * 1024);
      expect(f.lufs, `${f.src} loudness`).toBeGreaterThanOrEqual(-17);
      expect(f.lufs, `${f.src} loudness`).toBeLessThanOrEqual(-15);
      expect(f.truePeak, `${f.src} peak`).toBeLessThanOrEqual(-1);
    }
    expect(v.files.some((f) => f.ratio === '16x9') && v.files.some((f) => f.ratio === '9x16'), 'both cuts').toBe(true);
    expect(fileFor(v, true)?.ratio).toBe('9x16');
    expect(fileFor(v, false)?.ratio).toBe('16x9');
  });

  it.each(VIDEOS.map((v) => [v.id, v] as const))('%s: subtitles in the three languages, within the reading rules', (_, v) => {
    for (const locale of ['es', 'en', 'pt'] as const) {
      const vtt = readFileSync(pub(v.subtitles[locale]), 'utf8');
      expect(vtt.startsWith('WEBVTT'), locale).toBe(true);
      for (const block of vtt.split('\n\n').slice(1).filter(Boolean)) {
        const lines = block.split('\n').slice(2).filter(Boolean);
        expect(lines.length, `${locale}: ${block}`).toBeLessThanOrEqual(SUB.maxLines);
        for (const line of lines) expect(line.length, `${locale}: ${line}`).toBeLessThanOrEqual(SUB.maxLine);
      }
    }
  });

  it.each(VIDEOS.map((v) => [v.id, v] as const))('%s: was cut against the current catalog and from the current source (else: render it again)', (_, v) => {
    expect(v.catalogVersion).toBe(CATALOG_VERSION);
    const piece = v.plan ?? 'general';
    expect(v.sourceHash, 'the piece, the stage or its words changed since the render').toBe(sourceHash(ROOT, piece));
    expect(v.approvedAt === null || !Number.isNaN(Date.parse(v.approvedAt))).toBe(true);
    expect(v.sourceType).toBe('render');
    expect(v.synthetic).toBe(false);
  });
});
