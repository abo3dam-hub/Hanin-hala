# Source notes & fidelity record

This document records what was taken from the official Dr. Rahaf Salloum site, what was intentionally changed, and what remains unknown. Research was performed in **November 2026** against:

- `https://drrahaf.com/` — home, shop, product pages, cart, checkout
- `https://drrahaf.com/shop/` — category listing
- Individual product pages for names, prices, descriptions, images, and variations
- The live checkout DOM for fields, labels, branch options, payment details, and shipping behavior

No testimonials, awards, credentials, medical claims, sales rankings, or missing product details were invented.

---

## 1. Catalog

| Category | Source name | Products |
| --- | --- | ---: |
| `skincare` | منتجات العناية بالبشرة | 21 |
| `hair` | منتجات العناية بالشعر | 5 |
| `makeup` | منتجات الميكاب الطبي | 6 |
| `slimming` | منتجات التنحيف | 1 |
| **Total** | | **33** |

- 33 product images were downloaded from the official site and converted to optimized WebP (large + small variants).
- 7 real archive/result images were downloaded for the home results marquee and About page.
- The real logo and the Sham Cash QR image were downloaded from the official site.
- Product names, categories, prices, variations, and available descriptions are stored in `src/data/products.ts`.
- Prices keep the source format: Latin digits with dot thousands separators and `ل.س`, e.g. `75.000 ل.س`.

### Price-on-request product

`كرياتين طبيعي` (id `8580`) has **no price** on the source. The storefront shows **“السعر عند الطلب”**, disables add-to-cart, and offers a WhatsApp inquiry instead of selling it for 0.

### Product variations

`فوند طبي واقي من الشمس` (id `8415`) has two shades from the source:

| Option ID | Label | Price |
| --- | --- | ---: |
| `16972` | فاتح | 150,000 ل.س |
| `16973` | غامق | 150,000 ل.س |

The variation is preserved in the cart key and in the WhatsApp message.

### Products with no description on the source

20 products had real descriptions. **13 products had no description** and use an honest fallback with a WhatsApp inquiry path:

| ID | Product |
| --- | --- |
| 17014 | كريم التفتيح |
| 8597 | غسول البشرة بالكولاجين |
| 8595 | غسول لاكتيك اسيد |
| 8591 | كريم الكلف المعند 3 |
| 8589 | خلاصة الأوليفيرا للترطيب والأكزيما |
| 8588 | كريم الكلف المعند 2 |
| 8578 | خلطة السبع زيوت |
| 8441 | سيروم لاكتيك اسيد |
| 8439 | سيروم هيالورنيك و كولاجين |
| 8437 | سيروم الكافيار والحلزون |
| 8435 | مقطر الاعشاب للوجه |
| 8426 | جل حواجب |
| 8424 | مزيل مكياج |

The UI does not fill these gaps with marketing copy. It tells the customer the details are available through direct inquiry.

---

## 2. Checkout field comparison

### Fields reproduced

| Original field | Original label | New implementation | Notes |
| --- | --- | --- | --- |
| `billing_first_name` | الاسم الأول * | Required text field | Explicit client validation + inline Arabic error |
| `middle_name` | اسم الاب * | Required text field | Preserved as father’s name |
| `billing_last_name` | الاسم الأخير * | Required text field | Explicit validation |
| `billing_country` | الدولة / المنطقة * | Required select | Source offered **Syria only**; preserved |
| `billing_phone` | رقم الواتس * | Required tel field | 7–15 digits; LTR input; included in message |
| `_kadmous` | اختر اقرب فوع قدموس * | Required select | 47 real branches + empty placeholder; label corrected to “أقرب فرع للاستلام” |
| `ship_to_different_address` | هل تودّ الشحن لعنوان مختلف؟ | Optional checkbox | Shipping fields appear only when checked |
| `shipping_first_name` | الاسم الأول * | Required when shipping | Appears conditionally |
| `shipping_last_name` | الاسم الأخير * | Required when shipping | Appears conditionally |
| `shipping_country` | الدولة / المنطقة * | Required when shipping | Syria only |
| `shipping_address_1` | عنوان الشارع / الحي * | Required when shipping | Placeholder preserved in spirit: house number + street/neighborhood |
| `shipping_city` | المدينة * | Required when shipping | — |
| `shipping_state` | المنطقة * | Required when shipping | — |
| `shipping_postcode` | الرمز البريدي / ZIP * | Required when shipping | — |
| `shipping_phone` | الهاتف * | Required when shipping | 7–15 digits |
| `order_comments` | ملاحظات الطلب (اختياري) | Optional textarea | Included in the WhatsApp message |
| `coupon_code` | القسيمة / رمز القسيمة | Optional text field | Collected and included in the message, **not applied client-side** |
| `payment_method` | الدفع عبر شام كاش | Sham Cash block | Wallet name, wallet ID, QR, and transfer steps |
| `woocommerce_checkout_place_order` | Place order | “تأكيد الطلب عبر واتساب” | Builds and opens the WhatsApp message, then goes to `/order-ready` |

### Fields intentionally omitted or changed

| Original | Decision | Reason |
| --- | --- | --- |
| `billing_email` | Omitted | Hidden by the original checkout via `#billing_email_field { display:none !important; }`; the storefront has no account/email flow |
| `apply_coupon` button | Omitted | The original used a separate coupon AJAX action; this app has no backend. Coupon is verified manually on WhatsApp |
| `ast-coupon-code` | Omitted | A second coupon field in the original DOM; consolidated into one coupon field to avoid duplicate input |
| Hidden billing address fields | Omitted | Not part of the visible captured checkout form |
| First branch preselected | Changed to empty placeholder | Prevents accidental submission to the first branch; customer must explicitly choose |
| Native `required` attributes | Added explicit validation | Original used validation classes but no HTML `required` attributes; new app blocks invalid submit and focuses the first error |
| Shipping method `free_shipping:1` | Preserved as information | Source label: “يتم الشحن بعد 24 ساعه من تثبيت الحجز”. The new site adds no delivery charge and says delivery details are confirmed on WhatsApp |
| Order submission | WhatsApp handoff | No backend/database. The site never claims the order was received; the customer must send the WhatsApp message |

### Branch list

All **47 branch options** were copied from the original checkout, including the governorate and branch name (e.g. `اللاذقية - 8 آذار`, `حمص - الزهرا`, `حلب - ...`). The full list lives in `src/data/branches.ts`.

### Payment details

Taken from the original checkout:

- Method: **شام كاش**
- Wallet name: **رهف زهير سلوم**
- Wallet ID: **86e5f2ad1584bb6941a6687e722da95e**
- QR image: `public/images/brand/shamcash-qr.jpg`
- Receipt confirmation: via WhatsApp

The site never asks for card details, wallet passwords, or OTPs.

---

## 3. WhatsApp handoff

- Destination: `+963930962830` (`wa.me/963930962830`)
- Message is URL-encoded with `encodeURIComponent`.
- The message includes:
  - First name, father’s name, last name
  - Country/region
  - WhatsApp number
  - Pickup branch
  - Optional different shipping address (all fields)
  - Order notes
  - Coupon code (if entered)
  - Product names, variations, quantities, unit prices, line totals
  - Subtotal, delivery note, total
  - Sham Cash wallet name and ID
  - A clear statement that the message came from the storefront
- The cart is **not** cleared before the handoff. The customer must press the explicit confirmation button on `/order-ready` after sending the message.
- A pending order is kept in `sessionStorage` under `dr-rahaf-pending-order-v1` so `/order-ready` survives a refresh.

---

## 4. Brand & visual decisions

- The real logo is pink/magenta; the palette was derived from it: ivory, cream, blush, deep plum, wine, and champagne.
- Typography: **Amiri** for Arabic display headings, **IBM Plex Sans Arabic** for body/UI, **Cormorant Garamond** for Latin accents.
- The homepage label **“مختارات د. رهف”** is used instead of “الأكثر طلبًا” because no verified sales ranking exists.
- Results images come from the official archive. The UI explicitly notes that results vary and does not add fabricated testimonials.
- No stock photography was used for products; all product visuals are the source images.

---

## 5. Known gaps and limitations

1. **No backend**: orders exist only as WhatsApp messages and temporary browser storage. There is no stock reservation, order ID, or server-side coupon validation.
2. **13 products lack descriptions** on the source.
3. **One product lacks a price** and is inquiry-only.
4. **Coupons are not calculated**; the code is sent for manual review.
5. **Delivery fees**: the original checkout exposes a single free-shipping method and a 24-hour dispatch note. The new site adds no delivery charge and routes delivery details to WhatsApp rather than inventing a fee schedule.
6. **No email channel**: the original hidden email field is intentionally omitted; WhatsApp is the single contact channel.
7. **No analytics/tracking** is installed, so there is no behavioral reporting.
8. The app is a separate front-end implementation; it does not use the original WordPress theme, WooCommerce, or plugins.

---

## 6. Verification

- TypeScript: `npm run typecheck` passes.
- Production build: `npm run build` passes; output is in `dist/`.
- Playwright QA: **99/99 checks passed** on Chromium, desktop `1440 × 960` and mobile `390 × 844`.
- QA covered catalog filters/search/sort, variation add-to-cart, cart persistence, checkout validation, conditional shipping, 47 branches, WhatsApp URL/message contents, order-ready confirmation and cart clearing, contact form, search modal, mobile navigation, and horizontal overflow.
- No browser console errors and no failed network requests were observed.
