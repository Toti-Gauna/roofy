#!/usr/bin/env node
/**
 * The video factory's driver (lote V1, guía de motion v1 §7). Renders a piece frame by frame from the dev
 * render page (`app/[locale]/render/page.dev.tsx`) with Playwright's simulated clock: no screen recording,
 * no dropped frames, the same frames every run. Only tools already in the environment (Chromium + Playwright,
 * ffmpeg, ffprobe); no new dependency.
 *
 *   scripts/dev-render.sh                       # next dev on :3410 (own distDir)
 *   node scripts/render-video.mjs --piece=contact --ratio=16x9 --locale=es
 *   node scripts/render-video.mjs --piece=contact --ratio=9x16 --locale=es
 *   node scripts/render-video.mjs --piece=contact --subs             # WebVTT in es / en / pt
 *   node scripts/render-video.mjs --piece=contact --manifest         # registry entry from the last renders
 *   node scripts/render-video.mjs --piece=contact --ratio=16x9 --stills=.render/stills --every=15 [--shot=chat]
 *
 * Output: public/videos/<piece>/<piece>-v<version>-<locale>-<ratio>.mp4 (+ .webp poster), the subtitles
 * next to them, and the file's entry in content/estateos-videos.json (ffprobe readings, hashes).
 */
import { chromium } from 'playwright';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceHash } from './video-source.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : true];
  }),
);
const piece = String(args.piece ?? 'contact');
const ratio = args.ratio === '9x16' ? '9x16' : '16x9';
const locale = String(args.locale ?? 'es');
const base = String(args.base ?? 'http://localhost:3410');
const LOCALES = ['es', 'en', 'pt'];
const WORK = join(ROOT, '.render', piece, `${locale}-${ratio}`);

const log = (...m) => console.log(`[render ${piece} ${locale} ${ratio}]`, ...m);

async function openStage(browser, { loc = locale, rat = ratio, size } = {}) {
  const page = await browser.newPage({ viewport: size ?? { width: 1920, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.error('console:', m.text());
  });
  // The demo's timers, Date and requestAnimationFrame run on this clock (CSS animations are pinned by the stage).
  await page.clock.install({ time: new Date('2026-10-08T23:40:00-03:00') });
  await page.goto(`${base}/${loc}/render/?piece=${piece}&ratio=${rat}`, { waitUntil: 'load' });
  await page.locator('.vid').waitFor({ timeout: 60_000 });
  await page.waitForFunction(() => !!window.__video);
  await page.evaluate(() => document.fonts.ready);
  // next dev's own badge never belongs in a frame.
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  return page;
}

/** Steps the simulated clock to `target` ms (virtual), in whole milliseconds. */
function clockStepper(page) {
  let at = 0;
  return {
    get now() {
      return at;
    },
    async to(target) {
      const next = Math.round(target);
      if (next > at) await page.clock.runFor(next - at);
      at = Math.max(at, next);
    },
  };
}

async function renderFrames(browser, { onFrame, onlyShot = null, every = 1 }) {
  const page = await openStage(browser);
  const plan = await page.evaluate(() => window.__video.plan);
  await page.setViewportSize({ width: plan.width, height: plan.height });
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1000);
  const clock = clockStepper(page);
  const frameMs = 1000 / plan.fps;
  let virtual = 0;
  const total = Math.round((plan.duration / 1000) * plan.fps);
  log(`${plan.width}×${plan.height} · ${plan.fps} fps · ${total} frames`);
  for (let i = 0; i < plan.shots.length; i++) {
    const s = plan.shots[i];
    if (onlyShot && s.id !== onlyShot) continue;
    const preroll = await page.evaluate((n) => window.__video.enter(n), i);
    // Off camera: play the take to where the shot starts (50 ms steps are enough for 500 ms story ticks).
    for (let local = -preroll; local < 0; local += 50) {
      await page.evaluate(([n, l, v]) => window.__video.tick(n, l, v), [i, local, virtual]);
      virtual += 50;
      await clock.to(virtual);
    }
    const first = Math.ceil((s.start / 1000) * plan.fps - 1e-9);
    const last = Math.ceil((s.end / 1000) * plan.fps - 1e-9);
    const t0 = virtual;
    for (let f = first; f < last; f++) {
      const local = f * frameMs - s.start;
      await clock.to(t0 + local);
      await page.evaluate(([n, l, v]) => window.__video.tick(n, l, v), [i, local, t0 + local]);
      if ((f - first) % every === 0) await onFrame(await page.screenshot({ type: 'png' }), f, s.id);
    }
    virtual = t0 + (last - first) * frameMs;
    await clock.to(virtual);
    log(`shot ${s.id} ✓`);
  }
  const cues = await page.evaluate(() => window.__video.cues());
  await page.close();
  return { plan, cues };
}

function ffmpeg(argv, input) {
  return new Promise((ok, fail) => {
    const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    p.on('error', fail);
    p.on('close', (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`))));
    if (input) input(p.stdin);
  });
}

/** `--probe=<js> --shot=<id>`: prints the expression's value each time it changes during the shot (to time steps). */
async function probeShot(browser) {
  const expr = String(args.probe);
  let lastValue;
  const page = await openStage(browser);
  const plan = await page.evaluate(() => window.__video.plan);
  await page.setViewportSize({ width: plan.width, height: plan.height });
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1000);
  const clock = clockStepper(page);
  const i = plan.shots.findIndex((s) => s.id === args.shot);
  const s = plan.shots[i];
  const preroll = await page.evaluate((n) => window.__video.enter(n), i);
  let virtual = 0;
  for (let local = -preroll; local < s.end - s.start + Number(args.extra ?? 0); local += 100) {
    await page.evaluate(([n, l, v]) => window.__video.tick(n, l, v), [i, local, virtual]);
    const value = await page.evaluate((e) => {
      try {
        return String(eval(e));
      } catch (err) {
        return `! ${err.message}`;
      }
    }, expr);
    if (value !== lastValue) console.log(`${String(local).padStart(7)} ms  ${value}`);
    lastValue = value;
    virtual += 100;
    await clock.to(virtual);
  }
  await page.close();
}

async function stills(browser) {
  const out = resolve(ROOT, String(args.stills));
  mkdirSync(out, { recursive: true });
  await renderFrames(browser, {
    onlyShot: args.shot ? String(args.shot) : null,
    every: Number(args.every ?? 15),
    onFrame: async (png, f, id) => writeFileSync(join(out, `${ratio}-${String(f).padStart(4, '0')}-${id}.png`), png),
  });
  log(`stills → ${out}`);
}

/** Music + effects rendered offline by the site's own engine, as 16-bit stereo WAV. */
async function renderAudio(browser, plan, cues, wavPath) {
  const page = await openStage(browser);
  const b64 = await page.evaluate(([duration, list]) => window.__video.renderAudio(duration, list), [plan.duration, cues]);
  await page.close();
  writeFileSync(wavPath, Buffer.from(b64, 'base64'));
}

/** First loudness pass (−16 LUFS integrated, peaks ≤ −1 dBTP, §8): the readings the second pass applies. */
function measureLoudness(input) {
  // ffmpeg prints the filter's readings on stderr.
  const out = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  return JSON.parse(out.slice(out.lastIndexOf('{'), out.lastIndexOf('}') + 1));
}

function probe(file) {
  const json = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], { encoding: 'utf8' }));
  const v = json.streams.find((s) => s.codec_type === 'video');
  const [n, d] = v.r_frame_rate.split('/').map(Number);
  return {
    width: v.width,
    height: v.height,
    fps: Math.round((n / d) * 100) / 100,
    durationSec: Math.round(Number(json.format.duration) * 1000) / 1000,
    codec: `${v.codec_name} ${v.profile}`.toLowerCase(),
    bitrateKbps: Math.round(Number(json.format.bit_rate) / 1000),
    bytes: Number(json.format.size),
    audio: json.streams.some((s) => s.codec_type === 'audio'),
  };
}

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

async function video(browser) {
  const outDir = join(ROOT, 'public', 'videos', piece);
  mkdirSync(outDir, { recursive: true });
  const silent = join(WORK, 'video.mp4');
  const meta = join(WORK, 'frames.json');
  // `--reuse`: keep the frames of the last run (to redo only the sound, the poster or the manifest).
  if (args.reuse && existsSync(silent) && existsSync(meta)) {
    const { plan, cues } = JSON.parse(readFileSync(meta, 'utf8'));
    return finish(browser, { plan, cues, silent, outDir });
  }
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  let encoder;
  let stdin;
  const started = Date.now();
  const { plan, cues } = await renderFrames(browser, {
    onFrame: async (png) => {
      if (!encoder) {
        const deliver = ratio === '9x16' ? ['-vf', 'scale=720:1280:flags=lanczos'] : [];
        encoder = ffmpeg(
          ['-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', ...deliver, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(args.crf ?? 20), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent],
          (s) => (stdin = s),
        );
      }
      if (!stdin.write(png)) await new Promise((r) => stdin.once('drain', r));
    },
  });
  stdin.end();
  await encoder;
  log(`frames encoded in ${Math.round((Date.now() - started) / 1000)} s`);
  writeFileSync(meta, JSON.stringify({ plan, cues }));
  return finish(browser, { plan, cues, silent, outDir });
}

async function finish(browser, { plan, cues, silent, outDir }) {
  const wav = join(WORK, 'mix.wav');
  await renderAudio(browser, plan, cues, wav);
  const stats = measureLoudness(wav);
  const fadeAt = ((plan.duration - 1200) / 1000).toFixed(3);
  const filter = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true,afade=t=out:st=${fadeAt}:d=1.2`;

  const name = `${piece}-v${args.version ?? 1}-${locale}-${ratio}`;
  const mp4 = join(outDir, `${name}.mp4`);
  await ffmpeg(['-i', silent, '-i', wav, '-af', filter, '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', mp4]);
  const ebur = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', mp4, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;

  // Poster: the closing's last frame (§6), WebP ≤ 200 KB.
  const poster = join(outDir, `${name}.webp`);
  const scale = ratio === '9x16' ? ['-vf', 'scale=720:1280:flags=lanczos'] : ['-vf', 'scale=1280:720:flags=lanczos'];
  await ffmpeg(['-sseof', '-0.1', '-i', silent, '-frames:v', '1', ...scale, '-c:v', 'libwebp', '-quality', '82', poster]);

  const info = probe(mp4);
  const summary = ebur.slice(ebur.lastIndexOf('Summary:'));
  const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]);
  const peak = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1]);
  const rel = (file) => `/${file.slice(join(ROOT, 'public').length + 1)}`;
  const result = { name, ratio, mp4: rel(mp4), poster: rel(poster), info, lufs, truePeak: peak, posterBytes: statSync(poster).size, sha256: sha256(mp4) };
  writeFileSync(join(WORK, 'result.json'), JSON.stringify(result, null, 2));
  log(JSON.stringify(result, null, 1));
  return result;
}

async function subtitles(browser) {
  const outDir = join(ROOT, 'public', 'videos', piece);
  mkdirSync(outDir, { recursive: true });
  for (const loc of LOCALES) {
    const page = await openStage(browser, { loc });
    const { vtt, problems } = await page.evaluate(() => window.__video.subtitles());
    await page.close();
    if (problems.length) throw new Error(`${loc}: ${problems.join('; ')}`);
    writeFileSync(join(outDir, `${piece}-v${args.version ?? 1}-${loc}.vtt`), vtt);
    log(`subtitles ${loc} ✓`);
  }
}

/**
 * Writes the piece's entry in content/estateos-videos.json (the player's registry and the manifest, §6)
 * from the last renders of its language. Keeps what people write by hand: the transcript and `approvedAt`
 * (which goes back to null when the frames changed).
 */
function manifest() {
  const file = join(ROOT, 'content', 'estateos-videos.json');
  const registry = JSON.parse(readFileSync(file, 'utf8'));
  const catalog = JSON.parse(readFileSync(join(ROOT, 'content', 'estateos-plans.json'), 'utf8'));
  const version = Number(args.version ?? 1);
  const files = ['16x9', '9x16']
    .map((r) => join(ROOT, '.render', piece, `${locale}-${r}`, 'result.json'))
    .filter((f) => existsSync(f))
    .map((f) => JSON.parse(readFileSync(f, 'utf8')))
    .map((r) => ({
      ratio: r.ratio,
      src: r.mp4,
      poster: r.poster,
      width: r.info.width,
      height: r.info.height,
      durationSec: r.info.durationSec,
      fps: r.info.fps,
      codec: r.info.codec,
      bytes: r.info.bytes,
      sha256: r.sha256,
      lufs: r.lufs,
      truePeak: r.truePeak,
    }));
  if (!files.length) throw new Error('no render to register');
  const id = `${piece}-v${version}`;
  const old = registry.videos.find((v) => v.id === id) ?? {};
  const main = files.find((f) => f.ratio === '16x9') ?? files[0];
  const same = old.files && JSON.stringify(old.files.map((f) => f.sha256)) === JSON.stringify(files.map((f) => f.sha256));
  const entry = {
    id,
    plan: piece === 'general' ? null : piece,
    version,
    lang: locale,
    durationSec: main.durationSec,
    src: main.src,
    poster: main.poster,
    files,
    subtitles: Object.fromEntries(LOCALES.map((l) => [l, `/videos/${piece}/${piece}-v${version}-${l}.vtt`])),
    transcript: old.transcript ?? { es: '', en: '', pt: '' },
    sourceType: 'render',
    license: 'Eclipse (render propio: interfaz de la demo, tipografías OFL del sitio, música y efectos sintetizados por el motor del sitio)',
    consent: 'No aplica: sin personas reales, voces ni material generado',
    synthetic: false,
    catalogVersion: catalog.catalogVersion,
    sourceHash: sourceHash(ROOT, piece),
    approvedAt: same ? (old.approvedAt ?? null) : null,
  };
  registry.videos = [...registry.videos.filter((v) => v.id !== id), entry];
  writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
  log(`manifest ${id} ✓ (${files.map((f) => `${f.ratio} ${(f.bytes / 1048576).toFixed(2)} MB`).join(' · ')})`);
}

if (args.manifest) {
  manifest();
  process.exit(0);
}

const browser = await chromium.launch();
try {
  if (args.probe) await probeShot(browser);
  else if (args.stills) await stills(browser);
  else if (args.subs) await subtitles(browser);
  else await video(browser);
} finally {
  await browser.close();
}
