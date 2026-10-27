import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('pageerror', e.message));
await p.goto('http://localhost:3410/es/trailer/?film=contact&ratio=16x9'); await p.locator('html[data-trailer="ready"]').waitFor({ timeout: 90000 });
for (const stem of process.argv.slice(2)) writeFileSync(`.render/stem-${stem}.wav`, Buffer.from(await p.evaluate((s) => window.trailer.renderAudio(s), stem), 'base64'));
await b.close();
