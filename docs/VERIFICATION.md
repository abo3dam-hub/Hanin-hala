# Verification report

- **Build:** 2026-10-22
- **Target:** `index.html` + `assets/` (static, no build step)
- **Tooling:** Playwright 1.64.1 / Chromium, script `verify.mjs`
- **Result:** **0 problems** across all four configurations

```bash
node verify.mjs    # → docs/verify.json + docs/shots/*.jpg
```

## Matrix

| Configuration | Viewport | DPR | Language | Result |
| --- | --- | --- | --- | --- |
| Desktop | 1440×960 | 1 | EN (LTR) | pass |
| Desktop | 1440×960 | 1 | AR (RTL) | pass |
| Tablet | 834×1112 | 2 | EN | pass |
| Mobile | 390×844 | 3 | EN | pass |
| Reduced motion | 1280×900 | 1 | EN | pass |

Each run scrolls the entire document first (so lazy images resolve) and then checks:

- console errors / page exceptions → **0**
- failed or ≥400 requests → **0**
- images with `complete && naturalWidth === 0` → **0** (20 images per page)
- horizontal page overflow (`scrollWidth` vs `clientWidth`) → none in EN or AR
- elements escaping the viewport outside intentionally clipped decorative layers → none
- clipped text inside its own box → none
- duplicate `id`s, heading order (`h1` = 1) → none / valid
- images missing an `alt` attribute → none (`alt=""` used only for decorative marks)
- tap targets below 24×24 CSS px → none
- text contrast below 3.2:1 → none flagged; palette check below
- hero geometry: copy/figure overlap → 0; seal/caption overlap → 0; both inside viewport

## Contrast (computed from the final palette)

| Pair | Ratio | Use |
| --- | --- | --- |
| ink on cream | 15.99 | body |
| ink-2 on cream | 9.77 | body secondary |
| muted on cream | 5.00 | captions, notes |
| wine on cream | 10.71 | links, labels |
| wine on blush | 10.14 | services |
| cream on wine | 10.71 | footer, marquee |
| 72% cream on wine | 5.94 | footer body |
| 78% cream on ink | 10.11 | results body |
| 55% cream on ink | 5.68 | results figcaption |

All normal-size text meets WCAG 2.1 AA (≥4.5:1).

## Interaction tests

| Test | Expected | Observed |
| --- | --- | --- |
| Filter `All` | 12 tiles | 12 |
| Filter `Nails` | 4 tiles | 4 |
| Filter `Brows` | 3 tiles | 3 |
| Filter `Lashes` | 2 tiles | 2 |
| Filter `Pedicure` | 3 tiles | 3 |
| Lightbox opens | `<dialog>` open, 1100 px source loaded | open, `work-milky-mani-1100.webp`, natural width 1100 |
| Lightbox next (→) | advances | `work-gold-glitter-1100.webp` |
| Lightbox close / Esc | closes | closed |
| Language toggle | `lang=ar`, `dir=rtl`, no overflow | pass (`scrollWidth 1440 = clientWidth 1440`) |
| Language persists | reload keeps AR | `localStorage["hh-lang"]` |
| Mobile menu | opens, `aria-expanded=true`, closes on link | pass |
| Booking form | opens `wa.me/963936628680?text=…` | pass, exact message below |
| Empty name | inline Arabic/English error, no navigation | "Please add your name." |

Booking deep link produced by the UI:

```
https://wa.me/963936628680?text=Hello%20Hanin%20%26%20Hala%2C%0AI%E2%80%99d%20like%20to%20book%20an%20appointment.%0A%0AName%3A%20Test%20Client%0AService%3A%20Brows%0APreferred%20day%3A%20Tue%203%20Nov%0APreferred%20time%3A%20Evening%0A%0ANote%3A%20First%20visit
```

Arabic mode builds the same message in Arabic (`مرحباً هانين وهلا، …`) with the
service and time labels translated. The form never sends data anywhere; it only
opens WhatsApp.

Reduced motion: all 47 `.reveal` elements are visible without animation and the
marquee animation is disabled (`animation-name: none`).

## Performance (local, throttling off)

| Metric | Desktop |
| --- | --- |
| TTFB | ~5 ms |
| First Contentful Paint | ~212 ms |
| DOMContentLoaded | ~91 ms |
| Load | ~206 ms |
| Full page after scrolling | ~1.40 MB total |
| — images (16 renditions, lazy) | ~1.17 MB |
| — fonts (6 latin woff2) | ~194 KB |
| — CSS (2 files) | ~36 KB |
| — HTML | ~30 KB |
| — JS | ~8 KB |

Images are lazy-loaded below the fold, sized with `width`/`height` (no layout shift),
served as WebP, and the hero is preloaded with `fetchpriority="high"`. Fonts are
self-hosted with `font-display: swap`; only the faces actually used are requested.

## Live preview

- URL: https://trek-payroll-secret-jack.trycloudflare.com
- Served over HTTPS via a Cloudflare quick tunnel, verified with an external
  Playwright run on desktop (1440) and mobile (390): title, `h1`, layout
  (`scrollWidth === clientWidth`) and images all correct, 0 console errors,
  0 failed requests.

## Limitations / known gaps

1. **Ephemeral preview.** The quick-tunnel URL stops working when the tunnel process
   ends. For a permanent URL, deploy the folder to any static host and make the
   `og:url` / `og:image` tags absolute (see README → Deploy).
2. **Unpublished facts.** Opening hours, prices and reviews are not public, so the
   site states that hours are confirmed on WhatsApp and shows no prices or reviews.
   The "34K+" figure is the follower count at build time.
3. **No booking backend.** Appointments are handed to WhatsApp; nothing is stored.
   Availability is not guaranteed by the site.
4. **Visual review.** The build environment could not display images, so composition
   was verified geometrically (no overlaps, no overflow, correct crops) and content
   was proofread as text. A human pass on the screenshots in `docs/shots/` is the
   recommended next step before launch.
5. **Media rights.** Photos and the wordmark belong to the studio; they were sourced
   from the public page and should be confirmed with the owner for production use.
6. **Social preview.** `og:image` is a relative path; make it absolute on deployment.
7. **Arabic typography.** Cormorant Garamond has no Arabic glyphs, so AR mode switches
   headings to Tajawal at a heavier weight by design. Sentence-level copy was written
   in Levantine/Syrian register; a native review is advised before launch.
