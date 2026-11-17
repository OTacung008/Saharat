// Render index.html to an MP4 (1080x1920, 30fps) with Playwright + ffmpeg.
// Usage: THREE_DIR=/path/to/node_modules/three node render.mjs [out.mp4] [--stills 1,4,8]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const THREE_DIR = process.env.THREE_DIR || path.join(here, 'node_modules/three');
const args = process.argv.slice(2);
const stillsArg = args.indexOf('--stills');
const stills = stillsArg >= 0 ? args[stillsArg + 1].split(',').map(Number) : null;
const out = args.find((a) => a.endsWith('.mp4')) || path.join(here, 'swallow-gum.mp4');
const FPS = 30, DUR = 20;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
if (existsSync(THREE_DIR)) {
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
    const rel = new URL(route.request().url()).pathname.replace('/npm/three@0.170.0/', '');
    route.fulfill({ body: readFileSync(path.join(THREE_DIR, rel)), contentType: 'text/javascript' });
  });
}
await page.goto('file://' + path.join(here, 'index.html') + '?render');
await page.waitForFunction(() => window.ready);
await page.evaluate(() => window.ready);

if (stills) {
  for (const t of stills) {
    await page.evaluate((t) => window.renderAt(t), t);
    await page.screenshot({ path: path.join(process.env.STILL_DIR || here, `still_${t}.png`) });
    console.log('still', t);
  }
} else {
  const audio = path.join(here, 'voiceover.wav');
  const aIn = existsSync(audio) ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : [];
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', ...aIn, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FPS * DUR; f++) {
    await page.evaluate((t) => window.renderAt(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log('frame', f);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
