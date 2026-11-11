# Dr. Rahaf Salloum — Arabic-first storefront

A premium, Arabic-first (RTL) storefront for **Dr. Rahaf Salloum / د. رهف سلوم**, built as a fast static React app. It replaces the browsing and checkout experience of `https://drrahaf.com/` with a focused catalog and a WhatsApp order handoff.

The original WordPress site is the source of truth for products, prices, images, branches, and checkout fields. This app does not invent products, testimonials, credentials, or medical claims.

---

## Quick start

```bash
cd dr-rahaf-store
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build      # production build in dist/
npm run preview    # preview the production build
```

Requires Node 20+.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home: hero, trust strip, brand intro, categories, curated products, concern discovery, philosophy, results archive, consultation CTA |
| `/shop` | Full catalog with search, category/concern filters, sorting |
| `/product/:slug` | Product detail, variation selector, quantity, add to cart or WhatsApp inquiry |
| `/cart` | Cart lines, quantity controls, totals, checkout entry |
| `/checkout` | Contact details, pickup branch, optional shipping address, Sham Cash payment details |
| `/order-ready` | Post-submit confirmation and WhatsApp handoff; cart is cleared only after the customer confirms they sent the message |
| `/about` | Brand story, values, consultation process, archive images |
| `/contact` | WhatsApp contact card, contact form that builds a WhatsApp message, FAQ |
| `/privacy` | Privacy, local storage, WhatsApp data, Sham Cash, shipping |
| `*` | Custom 404 |

---

## Features

- **Arabic-first RTL** layout with `dir="rtl"`, Arabic typography (Amiri + IBM Plex Sans Arabic), and self-hosted fonts.
- **Premium beauty identity** derived from the real pink/magenta logo: ivory, cream, blush, wine, plum, champagne.
- **Responsive navigation** with desktop dropdown categories, mobile menu, and keyboard escape handling.
- **Catalog tools**: full-text search across names, categories, concerns, and descriptions; category and concern filters; price/name sorting; URL-synced filter state.
- **Product detail**: real image, real description when available, foundation shade variations, quantity stepper, add-to-cart, and WhatsApp inquiry for unsupported/zero-price items.
- **Persistent cart** in `localStorage` under `dr-rahaf-cart-v1`, with variation-aware line keys, quantity limits, and a slide-in cart drawer.
- **Checkout**: required-field validation, 47 real pickup branches, optional different shipping address, real Sham Cash wallet details and QR, coupon field collected for manual verification.
- **WhatsApp handoff**: a formatted Arabic order message is URL-encoded and opened at `wa.me/963930962830`. The app never claims the order was received.
- **Order-ready screen**: message preview, copy-to-clipboard, explicit “I sent the message” confirmation, then cart clearing.
- **SEO**: per-page titles/descriptions, Open Graph/Twitter meta, canonical URLs, Product JSON-LD, `noindex` on checkout/order-ready/404.
- **Accessibility**: skip link, focus-visible styles, labelled fields, `aria-invalid`/`aria-describedby`, accessible dialogs, reduced-motion support.
- **No backend, no tracking**: no account, no email collection, no analytics, no payment data handled by the site.

---

## Checkout handoff (important)

The order is **not** submitted to a server. On submit the app:

1. Validates the form.
2. Builds a formatted Arabic message containing customer details, branch, optional shipping address, products, variations, quantities, totals, coupon, and payment details.
3. Saves a temporary pending order in `sessionStorage` (`dr-rahaf-pending-order-v1`).
4. Opens WhatsApp with the encoded message.
5. Navigates to `/order-ready`.

The cart is only cleared after the customer presses **“لقد أرسلت الرسالة — تفريغ السلة”** on the order-ready screen. This avoids losing the cart if WhatsApp does not open or the message is not sent.

---

## Data fidelity

- **33 products** across 4 categories:
  - Skincare: 21
  - Haircare: 5
  - Medical makeup: 6
  - Slimming: 1
- **47 real pickup branches** from the original checkout.
- **20 real product descriptions** preserved from the source.
- **13 products have no description on the source**; the UI uses an honest fallback and points to WhatsApp instead of inventing copy.
- **`كرياتين طبيعي` (id 8580)** has no price on the source. It is treated as **“السعر عند الطلب”** and cannot be added to the cart for 0.
- The original **foundation** has two shades (فاتح / غامق), both at 150,000 ل.س.
- Prices are rendered in the source format, e.g. `75.000 ل.س` (Latin digits, dot thousands separator).

Full source notes and the checkout field comparison are in [`docs/SOURCE_NOTES.md`](docs/SOURCE_NOTES.md).

---

## Deployment

The build output is a static SPA in `dist/`.

- `public/_redirects` contains `/* /index.html 200` for Netlify-style SPA fallback.
- On Vercel, add a rewrite from `/(.*)` to `/index.html`.
- On Nginx/Apache, configure a history-API fallback to `index.html`.
- `public/images` contains optimized WebP product images, result archive images, the real logo, and the Sham Cash QR.

---

## QA

Functional QA was run with Playwright against Chromium at:

- Desktop: `1440 × 960`
- Mobile: `390 × 844`

**Result: 99/99 checks passed**, covering:

- Home, shop, filters, search, sorting, and all static pages
- Product variations, add-to-cart, cart persistence across reload
- Checkout validation, shipping toggle, 47 branches, WhatsApp message content
- Correct WhatsApp number and URL encoding
- Order-ready screen, message preview, cart not cleared before confirmation, cart/pending storage cleared after confirmation
- Contact form validation and WhatsApp message generation
- Search modal
- Mobile navigation and horizontal overflow checks
- No browser console errors and no failed network requests

The QA script/report and screenshots were generated under `/tmp/opencode` during development and are not part of the repository.

---

## Project structure

```text
dr-rahaf-store/
├── public/
│   ├── _redirects
│   └── images/
│       ├── brand/          # logo, favicon, Sham Cash QR
│       ├── products/       # 33 products, large + small WebP
│       └── results/        # real archive images
├── src/
│   ├── components/         # header, footer, cart drawer, search, cards, forms
│   ├── context/            # cart state + persistence
│   ├── data/               # products, categories, branches, site settings
│   ├── hooks/              # document meta, JSON-LD
│   ├── lib/                # formatting, WhatsApp builders, search, storage
│   ├── pages/              # all routes
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── docs/SOURCE_NOTES.md
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Known limitations

- **No backend**: no order database, stock reservation, coupon calculation, or payment confirmation. Everything is confirmed manually on WhatsApp.
- **Coupons are not applied client-side**; the code is included in the WhatsApp message and verified by the team.
- **Delivery timing/fees**: the original checkout exposes a single free-shipping method labelled “يتم الشحن بعد 24 ساعه من تثبيت الحجز”. The new site adds no delivery charge and states that delivery details are confirmed on WhatsApp.
- **13 products lack descriptions** on the source; no copy was fabricated for them.
- **One product lacks a price**; it is inquiry-only.
- The **email field** present but hidden in the original checkout is intentionally omitted.
- Original checkout used JavaScript validation classes without native `required` attributes; this app adds explicit client-side validation and inline Arabic errors.
- Search is client-side over the local catalog; there is no server-side search index.
- The app is an independent front-end implementation and is not affiliated with the original WordPress theme or plugins.
