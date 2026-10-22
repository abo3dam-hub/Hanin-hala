import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/';
const axe = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
let total = 0;

async function audit(name, viewport, mobile, after) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  if (after) await after(page);
  await page.addScriptTag({ content: axe });
  const r = await page.evaluate(tags => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
  total += r.violations.length;
  console.log(`== ${name}: ${r.violations.length} violations, ${r.passes.length} passes`);
  for (const v of r.violations) {
    console.log(`   [${v.impact}] ${v.id} (${v.nodes.length}) e.g. ${v.nodes[0].target.join(' ')}`);
    console.log(`   ${v.help}`);
  }
  await ctx.close();
}

await audit('desktop EN', { width: 1440, height: 960 }, false);
await audit('desktop AR', { width: 1440, height: 960 }, false, async p => {
  await p.click('#lang');
  await p.waitForTimeout(300);
});
await audit('tablet EN', { width: 834, height: 1112 }, true);
await audit('mobile EN', { width: 390, height: 844 }, true);
await audit('lightbox open', { width: 1440, height: 960 }, false, async p => {
  await p.click('.tile');
  await p.waitForTimeout(400);
});

await browser.close();
console.log(`\nTOTAL VIOLATIONS: ${total}`);
process.exit(total ? 1 : 0);
