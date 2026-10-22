# Source manifest

Everything on the site comes from the studio's **public** Facebook presence.
No facts were invented; anything unavailable is either omitted or stated as unavailable.

- Page: `https://www.facebook.com/p/Hanin-Hala-Nails-100095373556723/`
- Profile: `https://www.facebook.com/100095373556723/`
- Collected: **2026-10-22**
- Harvested originals: `assets/source/` (31 files) + `assets/source/report.json`
- Harvester: `harvest.mjs` (Playwright, mobile + desktop surfaces)

## How the page was read

| Surface | Result |
| --- | --- |
| `www.facebook.com` with a desktop UA | 400 / login wall |
| `facebookexternalhit/1.1` UA | OG metadata (name, category, follower count, cover, intro) |
| `m.facebook.com/p/Hanin-Hala-Nails-100095373556723/` | renders publicly — posts, tabs, partial photo grid |
| Page plugin (`/plugins/page.php`) | public post timeline + captions |
| Photo viewer / About tab | login-gated (not scraped) |

Full-resolution media: Facebook CDN URLs are signed. Removing the `&ctp=…` parameter
returns the original asset (e.g. the 2048×2048 logo, the 1376×768 cover). The `stp`
and `cstp` parameters are signed and cannot be altered. URLs expire, so all media
used here was downloaded and self-hosted.

## Brand facts

| Fact | Value | Evidence |
| --- | --- | --- |
| Name | Hanin & Hala Nails / Hanin & Hala | page title, logo |
| Category | Beauty Salon | page metadata |
| Price range | `$$` | page metadata |
| Rating | Not yet rated (0 reviews) | page metadata → no testimonials used |
| Followers | 34,793 ("34K+") | page metadata at build time |
| Following | 619 | page metadata |
| Username | `haninhalanails` | profile URL |
| Phone / WhatsApp | `+963 936 628 680` · `0936628680` | page contact + post captions |
| Email | `hmnailssalon@gmail.com` | page contact |
| Address | طرطوس_دوار الفقاسة — Al-Faqqasa Roundabout, Tartus, Syria | page address |
| Landmark | beside Khayam Al-Hana restaurant (جنب مطعم خيام الهنا) | post captions |
| Hours | **not published** | no public hours field → site says so |
| Prices | **not published** | no public price list → omitted |

### Intro / voice (verbatim)

> 🌸Hanin & Hala🌸 🪻Your Beauty Destination 💅 Nails | Jacuzzi | Pedicure | Beauty
> 📍 Tartus, Al-Faqqasa 📞 0936628680

> لما تكون النتيجة وحدها كفيلة تحكي عن جودة شغلنا

> الثقة بالنتائج هي سرّ ثقتكم فينا

### Services (from post captions)

| Service | Arabic wording used by the studio | On the site |
| --- | --- | --- |
| Nail design & polish | مانيكير، ألوان جليتر/حليبي/نود، رسم يدوي | *Nails & manicure* |
| Protective layer | طبقة حماية / النتيجة سنة كاملة على الأقل | *Nails & manicure* — "protective layer" |
| Cuticle care | تنظيف لحميات | *Nails & manicure* — "cuticle care" |
| Brow cleaning & shaping | تنظيف حواجب + تظبيط رسمة | *Brows* |
| Lash lift + dye | قلب رموش مع صبغة | *Lashes* |
| Foot jacuzzi / pedicure | جاكوزي للقدمين، جلد ميت وتشققات | *Pedicure & jacuzzi* |

Not promoted on the site because they were mentioned once and could not be
described confidently: بردة الأضافر (cold-hands treatment). No claim is made about
extensions, tinting, bridal packages or medical results.

## Colour provenance

Sampled from the downloaded originals (dominant-colour analysis):

| Token | Hex | Source |
| --- | --- | --- |
| `--wine` | `#7A0024` | solid ink of the wordmark (`#790021`–`#8A0031` range) |
| `--wine-2` | `#A6193E` | lighter wordmark strokes / hover |
| `--rose` | `#C4567C` | blush highlights in the wordmark and cover |
| `--blush` | `#F3E3E9` | soft petal tone in the profile artwork |
| `--cream` | `#FBF8F5` | cover card background |
| `--sand` | `#EADFD6` | neutral in the nail photography |
| `--gold` | `#B08A62` | gold-glitter manicure set |
| `--ink` | `#241A1E` | near-black from the photography |

Type: **Cormorant Garamond** (display, echoing the script wordmark's contrast),
**Jost** (UI/labels), **Tajawal** (Arabic). All self-hosted (SIL Open Font License).

## Media used on the site

Native sizes are the downloaded originals in `assets/source/`. Site renditions are
WebP (quality 84) at the widths listed.

| Site file | Facebook media ID | Native | Used in |
| --- | --- | --- | --- |
| `logo-mark` (+`-560`, `seal.jpg`, favicons) | `651061855_1093546080501167_5966815818853560355` | 2048×2048 | header, hero seal, footer, icons |
| `work-milky-mani` | `860005748_1490527564136348_4621340149404176789` | 1240×1545 | hero, gallery |
| `work-gold-glitter` | `858017249_1546169407540389_1140932603632132430` | 1536×1536 | gallery, results section |
| `work-french-mani` | `854956734_1487403957782042_6093341392084270387` | 1240×1545 | gallery |
| `work-gold-mani` | `858056111_1487573587765079_3096916323011701092` | 1240×1545 | gallery |
| `work-brows` | `858430405_3319890564873408_1816119422607568477` | 1080×1080 | gallery |
| `work-brows-clean` | `857868904_1490762227446215_1847560931529291823` | 1240×1240 | gallery |
| `work-brows-shape` | `854671879_1003402976114330_7400753462948521652` | 1254×1252 | story, gallery |
| `work-lashes` | `857518131_1894672921699546_5880449187312649971` | 1254×1254 | gallery |
| `work-eye-detail` | `856404546_1485390067983431_6521432042510271763` | 1240×1240 | gallery |
| `work-pedi-jacuzzi` | `862832940_1489301224258982_8888235194025183485` | 1240×1240 | gallery |
| `work-pedi-soft` | `861826528_1909397143357165_8121808908000131962` | 1080×1080 | gallery |
| `work-feet-heart` | `756975159_1050501380841899_3326931479758126030` | 869×1545 | story, gallery |
| `cover` → `og-cover.jpg` | `650894825_1093545213834587_5720049042744813471` | 1376×768 | social share image (1200×630 crop) |

### Downloaded but not used

| File | Native | Why not used |
| --- | --- | --- |
| `work-soft-mani` (`855557045…`) | 991×991 | duplicate look; hero uses the larger portrait |
| `work-nude-mani` (`857471505…`) | 962×962 | kept for future gallery expansion |
| `work-rose-mani` (`857166902…`) | 847×847 | kept for future gallery expansion |
| `work-brows-after` (`856014841…`) | 1240×1238 | kept for future gallery expansion |
| `work-brows-fine` (`854689617…`) | 1240×1240 | kept for future gallery expansion |
| `work-lash-lift` (`857848321…`) | 1240×1240 | kept for future gallery expansion |
| `work-pedi-toe` (`848972543…`) | 812×812 | kept for future gallery expansion |
| `857697982…`, `857778150…` | 620×1240, 615×1240 | low resolution for the grid |

### Excluded

| File | Reason |
| --- | --- |
| `687061856…`, `687603789…`, `689736940…`, `690768055…` | client testimonial screenshots (private messages) — not used |
| `686962181…` (415×410), `854850451…` (144×144), `441502021…` (126×126) | too low resolution / icons |
| `1487645…` (10×10), `854850451…` | tracker pixels / junk |

## AI-assisted image triage

Direct visual review was not available in the build environment, so images were
classified with:

- **BLIP** (`Salesforce/blip-image-captioning-base`) captions, and
- **CLIP** (`openai/clip-vit-base-patch32`) zero-shot labels
  (manicure / eyebrows / eyelashes / pedicure / testimonial screenshot / salon interior).

Confidence was high for the categories used (brows 0.97–0.99, lashes 0.71–0.92,
pedicure 0.88–0.94, manicure 0.88). Any image with an ambiguous label was left out
of the gallery rather than guessed.

## Rights

The wordmark, photos, quotes and contact details are the studio's property, gathered
from its public page for this build. Replace or confirm them with the owner before a
commercial launch.
