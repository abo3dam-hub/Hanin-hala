# Hanin & Hala — studio site

A single-page, bilingual (EN / AR + RTL) website for **Hanin & Hala Nails**, a
nails · brows · lashes · pedicure studio on Al-Faqqasa Roundabout in Tartus, Syria.

Built from the studio's public Facebook page — content, contact details and imagery
are sourced and documented in [`docs/SOURCE-MANIFEST.md`](docs/SOURCE-MANIFEST.md).
No build step, no dependencies, no tracking, no backend.

## Preview

- **Live preview:** https://abo3dam-hub.github.io/Hanin-hala/
  (ephemeral Cloudflare quick tunnel — see [Deploy](#deploy) to publish permanently)
- Screenshots: [`docs/shots/`](docs/shots) — desktop, tablet, mobile, Arabic, lightbox.

## Run locally

```bash
npx serve .          # or: python3 -m http.server 4173
```

Then open `http://localhost:3000` (or `:4173`).

Fonts, CSS and images are all local — the page works offline and has no third-party
requests except the links you click (WhatsApp, Facebook, Maps).

## Structure

```
index.html                  markup + all copy (EN inline, AR in data-ar)
assets/css/fonts.css        self-hosted @font-face (6 latin faces, 194 KB)
assets/css/style.css        design system + components
assets/js/main.js           language, nav, reveal, filters, lightbox, booking
assets/fonts/*.woff2        Cormorant Garamond · Jost · Tajawal
assets/img/*.webp|png|jpg   optimised renditions + logo + favicons + og image
assets/source/              original Facebook downloads + report.json (provenance)
docs/                       source manifest, verification report, screenshots
harvest.mjs                 re-downloads media from the public page
verify.mjs                  Playwright audit (layout, a11y, interactions)
```

## Editing

- **Copy** — English lives directly in the HTML; Arabic in the matching `data-ar`
  attribute on the same element. Change both to keep the toggle in sync.
- **Images** — swap a file in `assets/img/` and update `src`, `width`, `height`
  (and `data-full` for the lightbox).
- **Colours / type** — tokens at the top of `assets/css/style.css`
  (`--wine`, `--blush`, `--cream`, `--serif`, `--sans`, `--ar`).
- **Booking** — the form validates the name, then opens WhatsApp with a prefilled
  message to `+963 936 628 680`. Nothing is submitted or stored. Messages are built
  in `assets/js/main.js` (`booking → WhatsApp`).

## Verification

```bash
node verify.mjs      # layout/console/images/overflow/interactions
npm run a11y        # axe-core WCAG 2.1 AA checks
```

Writes `docs/verify.json` and screenshots to `docs/shots/`. `npm run a11y` runs axe-core across desktop/tablet/mobile/AR and the open lightbox — currently **0 violations**.
across desktop 1440, tablet 834, mobile 390, and Arabic RTL. Details in
[`docs/VERIFICATION.md`](docs/VERIFICATION.md).

## Deploy

The site is fully static — upload the repository root to Netlify, Vercel, Cloudflare
Pages, GitHub Pages or any web server. Two small things to do on a permanent domain:

1. Make the social tags absolute in `index.html` (`og:url`, `og:image`) and point
   `og:image` at `https://<domain>/assets/img/og-cover.jpg`.
2. Serve with UTF-8 for `.html`, `.css`, `.js` (every mainstream host does by default).

## Notes & limits

- Opening hours, prices and reviews are **not published** by the studio, so the site
  says so instead of inventing them.
- The 34K+ figure is the Facebook follower count at build time.
- Imagery belongs to the studio; it was collected from its public page for this
  build. Confirm usage rights with the owner before a commercial launch.
