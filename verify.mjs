import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:4173/';
const OUT = '/workspaces/Hanin-hala/docs/shots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const report = { generated: new Date().toISOString(), pages: {}, interactions: {}, problems: [] };
const problem = (m) => report.problems.push(m);

function watch(page, bucket) {
  page.on('console', (m) => { if (m.type() === 'error') bucket.console.push(m.text().slice(0, 240)); });
  page.on('pageerror', (e) => bucket.console.push('PAGEERROR ' + e.message));
  page.on('requestfailed', (r) => bucket.failed.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));
  page.on('response', (r) => { if (r.status() >= 400) bucket.failed.push(r.status() + ' ' + r.url()); });
}

// decorative layers deliberately bleed; ignore elements clipped by an ancestor
const AUDIT = () => {
  const W = document.documentElement.clientWidth;
  const clippedByAncestor = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const cs = getComputedStyle(p);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return true;
      p = p.parentElement;
    }
    return false;
  };
  const overflow = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width <= 0 || cs.visibility === 'hidden' || cs.opacity === '0') return;
    if (r.right > W + 1.5 || r.left < -1.5) {
      if (clippedByAncestor(el)) return;
      overflow.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 46), l: Math.round(r.left), r: Math.round(r.right) });
    }
  });
  const small = [];
  document.querySelectorAll('a,button,select,input,textarea').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.height < 24 || r.width < 24) small.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
  });
  const imgs = [...document.images].map((i) => ({ src: (i.currentSrc || '').split('/').pop(), alt: i.alt, w: i.naturalWidth, h: i.naturalHeight, ok: i.complete && i.naturalWidth > 0 }));
  const noAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => (i.currentSrc || '').split('/').pop());

  const box = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom), r: Math.round(r.right) }; };
  const inter = (a, b) => a && b ? Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.y, b.y)) : 0;
  const heroCopy = box('.hero__copy'), heroFig = box('.hero__fig'), seal = box('.seal'), cap = box('.hero__cap'), arch = box('.arch');
  const geometry = {
    heroCopy, heroFig, seal, cap, arch,
    copyOverFig: inter(heroCopy, heroFig),
    sealOverCap: inter(seal, cap),
    sealInView: seal ? seal.x >= 0 && seal.r <= W : null,
    capInView: cap ? cap.x >= 0 && cap.r <= W : null,
    sealInsideArchV: seal && arch ? seal.y >= arch.y : null,
  };
  const broken = imgs.filter((i) => !i.ok && i.src);
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);

  const lum = (c) => {
    const v = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((x) => {
      x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const contrast = [];
  document.querySelectorAll('h1,h2,h3,p,li,dd,dt,.lede,.cap__v').forEach((el) => {
    if (!el.textContent.trim()) return;
    const cs = getComputedStyle(el);
    let bgEl = el, bg = 'rgba(0, 0, 0, 0)';
    while (bgEl && bg === 'rgba(0, 0, 0, 0)') { bg = getComputedStyle(bgEl).backgroundColor; bgEl = bgEl.parentElement; }
    const fg = cs.color;
    if (bg === 'rgba(0, 0, 0, 0)') return;
    const l1 = lum(fg), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (ratio < 3.2) contrast.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 30), ratio: +ratio.toFixed(2), fg, bg });
  });

  return {
    title: document.title,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    docH: document.documentElement.scrollHeight,
    h1count: document.querySelectorAll('h1').length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.tagName + ':' + h.innerText.replace(/\s+/g, ' ').slice(0, 46)),
    imgs, broken, noAlt, dupIds, overflow, small, contrast, geometry,
    fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').length,
    fontFamilies: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))],
  };
};

async function shoot(page, name, full = false) {
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 80, fullPage: full });
}

async function audit(name, viewport, isMobile, dpr) {
  const ctx = await browser.newContext({
    viewport, isMobile, hasTouch: isMobile, deviceScaleFactor: dpr,
    reducedMotion: 'no-preference', locale: 'en-US',
  });
  const page = await ctx.newPage();
  const bucket = { console: [], failed: [] };
  watch(page, bucket);

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(700);

  // scroll the whole page so lazy images load, then return
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += Math.round(viewport.height * 0.85)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.evaluate(async () => { await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });

  const a = await page.evaluate(AUDIT);
  if (a.scrollW > a.clientW + 1) problem(`${name}: horizontal page overflow ${a.scrollW} > ${a.clientW}`);
  if (a.broken.length) problem(`${name}: broken images ${JSON.stringify(a.broken)}`);
  if (a.noAlt.length) problem(`${name}: images without alt ${JSON.stringify(a.noAlt)}`);
  if (a.dupIds.length) problem(`${name}: duplicate ids ${JSON.stringify(a.dupIds)}`);
  if (a.h1count !== 1) problem(`${name}: h1 count ${a.h1count}`);
  if (a.overflow.length) problem(`${name}: overflow ${JSON.stringify(a.overflow.slice(0, 6))}`);
  if (a.small.length) problem(`${name}: small targets ${JSON.stringify(a.small.slice(0, 6))}`);
  if (a.contrast.length) problem(`${name}: low contrast ${JSON.stringify(a.contrast.slice(0, 6))}`);
  if (a.geometry.copyOverFig > 40) problem(`${name}: hero copy overlaps figure ${a.geometry.copyOverFig}`);
  if (a.geometry.sealOverCap > 200) problem(`${name}: seal overlaps caption ${a.geometry.sealOverCap}`);
  if (a.geometry.sealInView === false) problem(`${name}: seal outside viewport`);
  if (a.geometry.capInView === false) problem(`${name}: hero caption outside viewport`);
  if (bucket.console.length) problem(`${name}: console ${JSON.stringify(bucket.console.slice(0, 5))}`);
  if (bucket.failed.length) problem(`${name}: requests ${JSON.stringify(bucket.failed.slice(0, 5))}`);

  report.pages[name] = { ...a, console: bucket.console, failed: bucket.failed };

  await shoot(page, name + '-hero');
  await shoot(page, name + '-full', true);
  return { ctx, page };
}

/* ---------------------------------------------------------------- desktop */
let { ctx, page } = await audit('desktop', { width: 1440, height: 960 }, false, 1);

// filters
const chips = await page.$$eval('.chip', (els) => els.map((e) => e.dataset.filter));
const filterResults = {};
for (const f of chips) {
  await page.click(`.chip[data-filter="${f}"]`);
  await page.waitForTimeout(260);
  filterResults[f] = await page.$$eval('.tile:not(.is-hidden)', (els) => els.length);
}
report.interactions.filters = filterResults;
if (filterResults.all !== 12) problem('filter all != 12: ' + filterResults.all);

// lightbox
await page.click('.chip[data-filter="nails"]');
await page.waitForTimeout(250);
await page.click('.tile:not(.is-hidden)');
await page.waitForTimeout(700);
const lb = await page.evaluate(() => {
  const d = document.getElementById('lb'), i = document.getElementById('lbImg');
  return { open: d.open, ok: i.complete && i.naturalWidth > 0, w: i.naturalWidth, src: (i.currentSrc || '').split('/').pop(), cap: document.getElementById('lbCap').textContent };
});
report.interactions.lightbox = lb;
if (!lb.open || !lb.ok) problem('lightbox failed ' + JSON.stringify(lb));
await shoot(page, 'desktop-lightbox');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(400);
report.interactions.lightbox.afterNext = await page.evaluate(() => (document.getElementById('lbImg').currentSrc || '').split('/').pop());
await page.click('#lbClose');
await page.waitForTimeout(300);
report.interactions.lightbox.closed = await page.evaluate(() => !document.getElementById('lb').open);
await page.click('.chip[data-filter="all"]');

// language
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.click('#lang');
await page.waitForTimeout(800);
const ar = await page.evaluate(AUDIT);
report.pages['desktop-ar'] = ar;
if (ar.lang !== 'ar' || ar.dir !== 'rtl') problem('AR toggle failed');
if (ar.scrollW > ar.clientW + 1) problem(`AR overflow ${ar.scrollW} > ${ar.clientW}`);
if (ar.overflow.length) problem('AR overflow elements ' + JSON.stringify(ar.overflow.slice(0, 6)));
await shoot(page, 'arabic-hero');
await shoot(page, 'arabic-full', true);
await page.click('#lang');
await page.waitForTimeout(600);
report.interactions.langBack = await page.evaluate(() => document.documentElement.lang);

// booking → whatsapp (intercept window.open)
const booking = await page.evaluate(() => {
  return new Promise((resolve) => {
    window.open = (u) => { resolve(u); return null; };
    const f = document.getElementById('booking');
    f.elements.name.value = 'Test Client';
    f.elements.service.selectedIndex = 1;
    f.elements.day.value = '2026-11-03';
    f.elements.time.selectedIndex = 2;
    f.elements.note.value = 'First visit';
    f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    setTimeout(() => resolve('NO OPEN'), 2000);
  });
});
report.interactions.booking = { url: String(booking).slice(0, 180), decoded: decodeURIComponent(String(booking)).slice(0, 260) };
if (!String(booking).startsWith('https://wa.me/963936628680?text=')) problem('booking URL wrong: ' + booking);

// empty submit shows inline error
const errShown = await page.evaluate(() => {
  const f = document.getElementById('booking');
  f.elements.name.value = '';
  f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  const e = document.getElementById('formErr');
  return { hidden: e.hidden, text: e.textContent };
});
report.interactions.validation = errShown;
if (errShown.hidden) problem('empty name did not show validation');

// mobile nav inside the mobile context later
await ctx.close();

/* ---------------------------------------------------------------- mobile */
({ ctx, page } = await audit('mobile', { width: 390, height: 844 }, true, 3));
await page.click('#burger');
await page.waitForTimeout(500);
report.interactions.mobileNav = await page.evaluate(() => ({
  open: document.getElementById('nav').classList.contains('is-open'),
  expanded: document.getElementById('burger').getAttribute('aria-expanded'),
}));
await shoot(page, 'mobile-nav');
await page.click('.nav a[href="#work"]');
await page.waitForTimeout(900);
report.interactions.mobileNav.afterClick = await page.evaluate(() => document.getElementById('nav').classList.contains('is-open'));
if (report.interactions.mobileNav.open !== true || report.interactions.mobileNav.afterClick !== false) problem('mobile nav behaviour wrong');
await ctx.close();

/* ---------------------------------------------------------------- tablet */
({ ctx, page } = await audit('tablet', { width: 834, height: 1112 }, true, 2));
await ctx.close();

/* ---------------------------------------------------------------- reduced motion */
{
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const p2 = await ctx2.newPage();
  const bucket = { console: [], failed: [] };
  watch(p2, bucket);
  await p2.goto(BASE, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(700);
  const r = await p2.evaluate(() => {
    const els = [...document.querySelectorAll('.reveal')];
    return {
      allVisible: els.every((e) => getComputedStyle(e).opacity === '1'),
      marqueeAnim: getComputedStyle(document.querySelector('.marquee__track')).animationName,
      count: els.length,
    };
  });
  report.interactions.reducedMotion = r;
  if (!r.allVisible) problem('reduced motion: reveal elements hidden');
  await ctx2.close();
}

await browser.close();

report.summary = {
  problemCount: report.problems.length,
  pages: Object.fromEntries(Object.entries(report.pages).map(([k, v]) => [k, {
    lang: v.lang, dir: v.dir, scrollW: v.scrollW, clientW: v.clientW, docH: v.docH,
    images: v.imgs.length, broken: v.broken.length, fonts: v.fontsLoaded, families: v.fontFamilies,
  }])),
};
fs.writeFileSync('/workspaces/Hanin-hala/docs/verify.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
console.log('\nPROBLEMS (' + report.problems.length + ')');
report.problems.forEach((p) => console.log(' - ' + p.slice(0, 600)));
console.log('\nINTERACTIONS', JSON.stringify(report.interactions, null, 2));
