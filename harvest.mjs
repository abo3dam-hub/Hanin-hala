import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const OUT = '/workspaces/Hanin-hala/assets/source';
fs.mkdirSync(OUT, { recursive: true });

const SURFACES = [
  { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', mobile: true, dpr: 3, vp: { width: 412, height: 900 }, urls: [
      'https://m.facebook.com/p/Hanin-Hala-Nails-100095373556723/',
      'https://m.facebook.com/p/Hanin-Hala-Nails-100095373556723/?sk=reels',
      'https://m.facebook.com/p/Hanin-Hala-Nails-100095373556723/photos',
    ], scrolls: 24 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', mobile: false, dpr: 2, vp: { width: 1440, height: 1000 }, urls: [
      'https://www.facebook.com/p/Hanin-Hala-Nails-100095373556723/',
      'https://www.facebook.com/p/Hanin-Hala-Nails-100095373556723/?sk=photos',
    ], scrolls: 14 },
];

function idOf(u) {
  const m = u.match(/\/v\/[^/]+\/([0-9]+_[0-9]+_[0-9]+)_n\.(jpg|png|webp)/);
  return m ? m[1] + '.' + m[2] : null;
}
const byId = new Map();

const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const s of SURFACES) {
  const ctx = await browser.newContext({ userAgent: s.ua, viewport: s.vp, isMobile: s.mobile, hasTouch: s.mobile, deviceScaleFactor: s.dpr });
  const page = await ctx.newPage();
  page.on('response', (r) => {
    const u = r.url();
    if (/scontent/.test(u) && /\.(jpg|jpeg|png|webp)/i.test(u)) {
      const id = idOf(u);
      if (!id) return;
      if (!byId.has(id)) byId.set(id, new Set());
      byId.get(id).add(u);
    }
  });
  for (const target of s.urls) {
    try {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
      for (let i = 0; i < s.scrolls; i++) { await page.evaluate(() => window.scrollBy(0, 1100)); await page.waitForTimeout(1000); }
      await page.waitForTimeout(2000);
      console.log('done', target);
    } catch (e) { console.log('err', target, e.message.slice(0, 60)); }
  }
  await ctx.close();
}
await browser.close();
console.log('MEDIA:', byId.size);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const report = [];
for (const [id, urlSet] of byId) {
  let best = null;
  for (const raw of urlSet) {
    const variants = [raw.replace(/&ctp=[^&]*/, ''), raw];
    for (const u of variants) {
      const ext = id.endsWith('.png') ? 'png' : id.endsWith('.webp') ? 'webp' : 'jpg';
      const p = path.join(OUT, `__tmp_${Math.random().toString(36).slice(2)}.${ext}`);
      let code = '000';
      try { code = execFileSync('curl', ['-sSL', '-A', UA, u, '-o', p, '--max-time', '60', '-w', '%{http_code}'], { encoding: 'utf8' }); }
      catch { code = 'ERR'; }
      let info = null;
      try {
        const out = execFileSync('python3', ['-c', `from PIL import Image;im=Image.open(${JSON.stringify(p)});print(f"{im.size[0]}x{im.size[1]}|{im.format}")`], { encoding: 'utf8' }).trim();
        const [dim, fmt] = out.split('|');
        const [w, h] = dim.split('x').map(Number);
        info = { w, h, fmt, bytes: fs.statSync(p).size, url: u };
      } catch { info = null; }
      if (info && (!best || info.w * info.h > best.w * best.h)) {
        if (best) fs.unlinkSync(best.path);
        best = { ...info, path: p };
      } else if (info) { fs.unlinkSync(p); }
      else if (fs.existsSync(p)) fs.unlinkSync(p);
      if (best && best.w * best.h > 100000) break;
    }
  }
  if (best) {
    const ext = id.endsWith('.png') ? 'png' : id.endsWith('.webp') ? 'webp' : 'jpg';
    const final = path.join(OUT, `${id}.${ext}`);
    fs.renameSync(best.path, final);
    report.push({ id, file: final, w: best.w, h: best.h, fmt: best.fmt, bytes: best.bytes, url: best.url });
    console.log(`${String(best.w).padStart(5)}x${String(best.h).padEnd(5)} ${id} ${best.bytes}`);
  } else {
    report.push({ id, file: null, error: 'no rendition' });
    console.log('FAILED', id);
  }
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log('DONE');
