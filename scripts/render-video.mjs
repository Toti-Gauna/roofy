#!/usr/bin/env node
/**
 * The video factory's driver (lote V1; guía de motion v1 §0 and §7). Renders a trailer frame by frame from the dev
 * stage (`app/[locale]/trailer/page.dev.tsx`): the film is one paused GSAP timeline, so every frame is a seek (as
 * Kinetic Studio's `?t=`), the same every run. The sound is Kinetic's engine mixed offline. Only tools already in the
 * environment (Chromium + Playwright, ffmpeg, ffprobe); no new dependency.
 *
 *   NEXT_DIST_DIR=.next-render npx next dev -p 3410
 *   node scripts/render-video.mjs --film=contact --ratio=16x9 --locale=es
 *   node scripts/render-video.mjs --film=contact --ratio=9x16 --locale=es
 *   node scripts/render-video.mjs --film=contact --subs             # WebVTT in es / en / pt
 *   node scripts/render-video.mjs --film=contact --manifest         # registry entry from the last renders
 *   node scripts/render-video.mjs --film=contact --ratio=16x9 --stills=.render/stills --at=6.5,8.6,12.4   # or --every=1 (s)
 *
 * Output: public/videos/<film>/<film>-v<version>-<locale>-<ratio>.mp4 (+ .webp poster), the subtitles next to them,
 * and the file's entry in content/estateos-videos.json (ffprobe readings, hashes).
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
const film = String(args.film ?? 'contact');
const ratio = args.ratio === '9x16' ? '9x16' : '16x9';
const locale = String(args.locale ?? 'es');
const base = String(args.base ?? 'http://localhost:3410');
const FPS = 30;
// The 9:16 cut is watched on a phone (720 × 1280, phone speakers) and has a 3 MB target: a lighter encode.
const CRF = { '16x9': 20, '9x16': 24 };
const AUDIO_KBPS = { '16x9': 128, '9x16': 96 };
const LOCALES = ['es', 'en', 'pt'];
const WORK = join(ROOT, '.render', film, `${locale}-${ratio}`);

const log = (...m) => console.log(`[render ${film} ${locale} ${ratio}]`, ...m);

async function openStage(browser, { loc = locale, rat = ratio } = {}) {
  const size = rat === '9x16' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.error('console:', m.text());
  });
  await page.goto(`${base}/${loc}/trailer/?film=${film}&ratio=${rat}`, { waitUntil: 'load' });
  await page.locator('html[data-trailer="ready"]').waitFor({ timeout: 90_000 });
  await page.evaluate(() => document.fonts.ready);
  // next dev's own badge never belongs in a frame.
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  return page;
}

/** Every frame (or the `times` given), as PNG, to `onFrame(png, t)`. */
async function frames(browser, onFrame, times = null) {
  const page = await openStage(browser);
  const duration = await page.evaluate(() => window.trailer.duration);
  const list = times ?? Array.from({ length: Math.round(duration * FPS) }, (_, f) => f / FPS);
  log(`${list.length} frames · ${duration} s`);
  for (const t of list) {
    await page.evaluate((s) => window.trailer.seek(s), t);
    await onFrame(await page.screenshot({ type: 'png' }), t);
  }
  await page.close();
  return duration;
}

function ffmpeg(argv, input) {
  return new Promise((ok, fail) => {
    const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    p.on('error', fail);
    p.on('close', (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`))));
    if (input) input(p.stdin);
  });
}

async function stills(browser) {
  const out = resolve(ROOT, String(args.stills));
  mkdirSync(out, { recursive: true });
  let times = null;
  if (args.at) times = String(args.at).split(',').map(Number);
  else if (args.every) {
    const page = await openStage(browser);
    const duration = await page.evaluate(() => window.trailer.duration);
    await page.close();
    const step = Number(args.every);
    times = Array.from({ length: Math.floor(duration / step) + 1 }, (_, i) => Math.min(duration - 0.01, i * step));
  }
  await frames(browser, async (png, t) => writeFileSync(join(out, `${ratio}-${t.toFixed(2).padStart(6, '0')}.png`), png), times);
  log(`stills → ${out}`);
}

/** Kinetic's score mixed offline (seeded), as 16-bit stereo WAV. */
async function renderAudio(browser, wavPath) {
  const page = await openStage(browser);
  const b64 = await page.evaluate(() => window.trailer.renderAudio());
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
  const outDir = join(ROOT, 'public', 'videos', film);
  mkdirSync(outDir, { recursive: true });
  const silent = join(WORK, 'video.mp4');
  // `--reuse`: keep the frames of the last run (to redo only the sound, the poster or the manifest).
  if (!(args.reuse && existsSync(silent))) {
    rmSync(WORK, { recursive: true, force: true });
    mkdirSync(WORK, { recursive: true });
    let stdin;
    const deliver = ratio === '9x16' ? ['-vf', 'scale=720:1280:flags=lanczos'] : [];
    const encoder = ffmpeg(
      ['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...deliver, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(args.crf ?? CRF[ratio]), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent],
      (s) => (stdin = s),
    );
    const started = Date.now();
    await frames(browser, async (png) => {
      if (!stdin.write(png)) await new Promise((r) => stdin.once('drain', r));
    });
    stdin.end();
    await encoder;
    log(`frames encoded in ${Math.round((Date.now() - started) / 1000)} s`);
  }

  const wav = join(WORK, 'mix.wav');
  await renderAudio(browser, wav);
  const stats = measureLoudness(wav);
  const info0 = probe(silent);
  const fadeAt = (info0.durationSec - 0.6).toFixed(3);
  const filter = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true,afade=t=out:st=${fadeAt}:d=0.6`;

  const name = `${film}-v${args.version ?? 1}-${locale}-${ratio}`;
  const mp4 = join(outDir, `${name}.mp4`);
  await ffmpeg(['-i', silent, '-i', wav, '-af', filter, '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', '-b:a', `${AUDIO_KBPS[ratio]}k`, '-shortest', '-movflags', '+faststart', mp4]);
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
  const outDir = join(ROOT, 'public', 'videos', film);
  mkdirSync(outDir, { recursive: true });
  for (const loc of LOCALES) {
    const page = await openStage(browser, { loc });
    const { vtt, problems } = await page.evaluate(() => window.trailer.subtitles());
    await page.close();
    if (problems.length) throw new Error(`${loc}: ${problems.join('; ')}`);
    writeFileSync(join(outDir, `${film}-v${args.version ?? 1}-${loc}.vtt`), vtt);
    log(`subtitles ${loc} ✓`);
  }
}

/**
 * Writes the film's entry in content/estateos-videos.json (the player's registry and the manifest, §6) from the last
 * renders of its language. Keeps what people write by hand: the transcript and `approvedAt` (which goes back to null
 * when the frames changed).
 */
function manifest() {
  const file = join(ROOT, 'content', 'estateos-videos.json');
  const registry = JSON.parse(readFileSync(file, 'utf8'));
  const catalog = JSON.parse(readFileSync(join(ROOT, 'content', 'estateos-plans.json'), 'utf8'));
  const version = Number(args.version ?? 1);
  const files = ['16x9', '9x16']
    .map((r) => join(ROOT, '.render', film, `${locale}-${r}`, 'result.json'))
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
  const id = `${film}-v${version}`;
  const old = registry.videos.find((v) => v.id === id) ?? {};
  const main = files.find((f) => f.ratio === '16x9') ?? files[0];
  const same = old.files && JSON.stringify(old.files.map((f) => f.sha256)) === JSON.stringify(files.map((f) => f.sha256));
  const entry = {
    id,
    plan: film === 'general' ? null : film,
    version,
    lang: locale,
    durationSec: main.durationSec,
    src: main.src,
    poster: main.poster,
    files,
    subtitles: Object.fromEntries(LOCALES.map((l) => [l, `/videos/${film}/${film}-v${version}-${l}.vtt`])),
    transcript: old.transcript ?? { es: '', en: '', pt: '' },
    sourceType: 'render',
    license: 'Eclipse (render propio: componentes reconstruidos de la demo, tipografías OFL del sitio, música y efectos sintetizados por el motor de Kinetic Studio)',
    consent: 'No aplica: sin personas reales, voces ni material generado',
    synthetic: false,
    catalogVersion: catalog.catalogVersion,
    sourceHash: sourceHash(ROOT, film),
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
  if (args.stills) await stills(browser);
  else if (args.subs) await subtitles(browser);
  else await video(browser);
} finally {
  await browser.close();
}
