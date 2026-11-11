import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { site } from '../data/site';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { buildConsultationMessage, whatsappUrl } from '../lib/whatsapp';
import { formatPriceOrRequest } from '../lib/format';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import {
  ArrowLeftIcon,
  ClockIcon,
  LeafIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons';

const concerns = ['تفتيح', 'حبوب', 'ترطيب', 'شد', 'شعر', 'مكياج'];

const trustItems = [
  { icon: LeafIcon, title: 'صناعة يدوية', text: 'بدفعات صغيرة وبإشراف مباشر' },
  { icon: ShieldIcon, title: 'إشراف صيدلاني', text: 'من د. رهف زهير سلوم' },
  { icon: TruckIcon, title: 'توصيل واسع', text: 'نقاط استلام في معظم المحافظات' },
  { icon: WhatsAppIcon, title: 'استشارة مجانية', text: 'تواصل مباشر عبر واتساب' },
];

export const Home = () => {
  const [concern, setConcern] = useState('تفتيح');
  useDocumentMeta(
    'د. رهف سلوم | عناية بالبشرة والميكاب الطبي',
    'متجر د. رهف سلوم: منتجات عناية طبيعية تُصنع يدويًا بإشراف الدكتورة رهف زهير سلوم، صيدلانية وأخصائية عناية بالبشرة. تسوّقي العناية بالبشرة، الشعر، الميكاب الطبي، والتنحيف.',
  );

  const featured = products.filter((product) => product.featured);
  const recommendations = useMemo(
    () => products.filter((product) => product.concerns.includes(concern)).slice(0, 3),
    [concern],
  );

  return (
    <>
      <section className="hero">
        <span className="hero__orb hero__orb--one" aria-hidden="true" />
        <span className="hero__orb hero__orb--two" aria-hidden="true" />
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="eyebrow eyebrow--spark">
              <SparkleIcon width={17} height={17} />
              عناية مصنوعة يدويًا بإشراف د. رهف سلوم
            </span>
            <h1>
              جمالٌ يبدأ من
              <em> العناية </em>
              التي تليق بكِ
            </h1>
            <p className="hero__lead">
              منتجات طبيعية أصنعها بيدي وبخبرتي، بمواد مختارة بعناية شديدة وتحت إشرافي المباشر.
              روتين هادئ، فاخر، ومصمّم ليمنح بشرتك ما تحتاجه فعلًا.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/shop">
                تسوّقي المجموعة
                <ArrowLeftIcon width={18} height={18} />
              </Link>
              <a
                className="button button--ghost"
                href={whatsappUrl(buildConsultationMessage())}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon width={18} height={18} />
                احجزي استشارة مجانية
              </a>
            </div>
            <div className="hero__note">
              <span className="hero__note-line" aria-hidden="true" />
              <p>
                الدكتورة رهف زهير سلوم
                <small>صيدلانية وأخصائية عناية بالبشرة</small>
              </p>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__frame">
              <div className="hero__arch">
                <img
                  src="/images/products/17014.webp"
                  alt="كريم التفتيح من مجموعة د. رهف سلوم"
                  width={750}
                  height={1000}
                  fetchPriority="high"
                />
              </div>
              <span className="hero__ring" aria-hidden="true" />
            </div>

            <div className="hero__mini hero__mini--top">
              <img src="/images/products/8593-sm.webp" alt="" width={84} height={84} loading="lazy" />
              <span>
                <small>مختارات د. رهف</small>
                <strong>كريم الشد</strong>
                <em>{formatPriceOrRequest(150000)}</em>
              </span>
            </div>

            <div className="hero__mini hero__mini--bottom">
              <img src="/images/products/8569-sm.webp" alt="" width={84} height={84} loading="lazy" />
              <span>
                <small>روتين متكامل</small>
                <strong>مجموعة العناية بالشعر</strong>
                <em>{formatPriceOrRequest(310000)}</em>
              </span>
            </div>

            <div className="hero__seal" aria-hidden="true">
              <span>صناعة يدوية</span>
              <strong>بدفعات صغيرة</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="مزايا المتجر">
        <div className="container trust-strip__grid">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div className="trust-item" key={title}>
              <span className="trust-item__icon">
                <Icon width={22} height={22} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section intro-section">
        <div className="container intro-grid">
          <Reveal className="intro-visual">
            <div className="intro-visual__main">
              <img
                src="/images/products/8593.webp"
                alt="كريم الشد من مجموعة د. رهف سلوم"
                width={900}
                height={900}
                loading="lazy"
              />
            </div>
            <div className="intro-visual__accent">
              <img
                src="/images/products/8437.webp"
                alt="سيروم الكافيار والحلزون"
                width={420}
                height={420}
                loading="lazy"
              />
            </div>
            <div className="intro-visual__quote">
              <SparkleIcon width={20} height={20} />
              <p>«أصنع منتجاتي بيدي، بمواد مختارة بعناية شديدة، وتحت إشرافي المباشر.»</p>
            </div>
          </Reveal>

          <Reveal className="intro-copy" delay={100}>
            <span className="eyebrow">عن العلامة</span>
            <h2>
              د. رهف زهير سلوم
              <span>صيدلانية وأخصائية عناية بالبشرة</span>
            </h2>
            <p>
              وُلدت العلامة من فكرة بسيطة: أن تكون العناية بالبشرة شخصية، صادقة، وهادئة. كل منتج
              يُصنع يدويًا بكميات محدودة، بمكونات تُختار بعناية وتحت إشراف مباشر من الدكتورة رهف،
              ليمنحك روتينًا تشعرين فيه بالثقة والراحة.
            </p>
            <div className="intro-stats">
              <div>
                <strong>{products.length}</strong>
                <span>منتجًا في المتجر</span>
              </div>
              <div>
                <strong>{categories.length}</strong>
                <span>مجموعات عناية</span>
              </div>
              <div>
                <strong>مباشر</strong>
                <span>إشراف من د. رهف</span>
              </div>
            </div>
            <div className="intro-actions">
              <Link className="text-link" to="/about">
                تعرّفي على العلامة
                <ArrowLeftIcon width={18} height={18} />
              </Link>
              <a
                className="text-link text-link--muted"
                href={whatsappUrl(buildConsultationMessage())}
                target="_blank"
                rel="noreferrer"
              >
                استشارة مجانية
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="تسوّقي حسب المجموعة"
              title="أربع مجموعات، وعناية واحدة تليق بكِ"
              description="من الروتين اليومي للبشرة إلى العناية بالشعر والميكاب الطبي، اختاري ما يناسبك."
              link={{ to: '/shop', label: 'كل المنتجات' }}
            />
          </Reveal>

          <div className="category-grid">
            {categories.map((category, index) => (
              <Reveal key={category.slug} delay={index * 70}>
                <Link className="category-card" to={`/shop?category=${category.slug}`}>
                  <span className="category-card__media">
                    <img src={category.image} alt="" width={700} height={700} loading="lazy" />
                  </span>
                  <span className="category-card__overlay" aria-hidden="true" />
                  <span className="category-card__content">
                    <span className="category-card__count">{category.count} منتجًا</span>
                    <strong>{category.shortName}</strong>
                    <small>{category.description}</small>
                    <span className="category-card__cta">
                      اكتشفي المجموعة
                      <ArrowLeftIcon width={17} height={17} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="مختارات د. رهف"
              title="قطع مميزة من مجموعات العناية"
              description="اختيارات من المنتجات التي تحرص د. رهف على تقديمها ضمن روتين العناية."
              link={{ to: '/shop', label: 'تسوّقي كل المنتجات' }}
            />
          </Reveal>
          <div className="product-grid product-grid--featured">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 60}>
                <ProductCard product={product} priority={index < 4} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section discovery">
        <div className="container discovery__grid">
          <Reveal className="discovery__copy">
            <span className="eyebrow">اكتشاف المنتجات</span>
            <h2>ما الذي تحتاجه بشرتك اليوم؟</h2>
            <p>
              اختاري الحاجة الأقرب لكِ، وسنقترح عليكِ منتجات من مجموعات العناية. الاقتراحات عامة
              وليست تشخيصًا طبيًا، ويمكنكِ دائمًا طلب استشارة مباشرة من د. رهف.
            </p>
            <div className="concern-list" role="group" aria-label="اختيار حاجة البشرة">
              {concerns.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`concern-chip${concern === item ? ' is-active' : ''}`}
                  onClick={() => setConcern(item)}
                  aria-pressed={concern === item}
                >
                  {item}
                </button>
              ))}
            </div>
            <a
              className="text-link"
              href={whatsappUrl(buildConsultationMessage())}
              target="_blank"
              rel="noreferrer"
            >
              تحتاجين مساعدة في الاختيار؟
              <WhatsAppIcon width={18} height={18} />
            </a>
          </Reveal>

          <Reveal className="discovery__results" delay={120}>
            <div className="discovery__results-head">
              <span>اقتراحات لـ «{concern}»</span>
              <Link to={`/shop`}>عرض الكل</Link>
            </div>
            <div className="discovery__products">
              {recommendations.map((product) => (
                <Link key={product.id} className="discovery-product" to={`/product/${product.slug}`}>
                  <img src={product.imageSmall} alt={product.name} width={110} height={110} loading="lazy" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{formatPriceOrRequest(product.price)}</small>
                  </span>
                  <ArrowLeftIcon width={18} height={18} />
                </Link>
              ))}
              {recommendations.length === 0 && (
                <p className="discovery__empty">لا توجد اقتراحات لهذه الحاجة حاليًا.</p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section philosophy">
        <div className="container">
          <Reveal className="philosophy__head">
            <span className="eyebrow">فلسفة العلامة</span>
            <h2>عناية بطيئة، مفصّلة، وصادقة</h2>
            <p>
              نؤمن أن العناية الحقيقية ليست روتينًا طويلًا، بل خطوات مدروسة تُصنع بعناية. من اختيار
              المواد إلى التغليف، كل تفصيل يمرّ بإشراف د. رهف.
            </p>
          </Reveal>

          <div className="philosophy__grid">
            {[
              {
                number: '01',
                icon: LeafIcon,
                title: 'مواد مختارة بعناية',
                text: 'مكونات تُختار بعناية شديدة، ضمن دفعات صغيرة تحافظ على جودة كل منتج.',
              },
              {
                number: '02',
                icon: SparkleIcon,
                title: 'صناعة يدوية',
                text: 'كل منتج يُحضّر يدويًا تحت إشراف مباشر، بعيدًا عن الإنتاج الكمي غير الشخصي.',
              },
              {
                number: '03',
                icon: ShieldIcon,
                title: 'إشراف صيدلاني',
                text: 'خبرة د. رهف كصيدلانية وأخصائية عناية بالبشرة توجّه كل خطوة في العلامة.',
              },
            ].map(({ number, icon: Icon, title, text }, index) => (
              <Reveal key={number} className="philosophy-card" delay={index * 80}>
                <span className="philosophy-card__number">{number}</span>
                <span className="philosophy-card__icon">
                  <Icon width={24} height={24} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="philosophy__quote">
            <span className="philosophy__quote-mark" aria-hidden="true">
              ”
            </span>
            <blockquote>
              منتجات طبيعية أصنعها بيدي وبخبرتي، باستخدام مواد مختارة بعناية شديدة، وتحت إشرافي
              المباشر.
            </blockquote>
            <cite>د. رهف زهير سلوم</cite>
          </Reveal>
        </div>
      </section>

      <section className="section results">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="آراء ونتائج"
              title="لمحات من أرشيف العلامة"
              description="صور من نتائج العناية المنشورة على الموقع الرسمي للعلامة. لا نضيف شهادات غير موثّقة."
              align="center"
            />
          </Reveal>
        </div>
        <div className="results-marquee" aria-label="صور من نتائج العناية">
          <div className="results-track">
            {[1, 2, 4, 5, 6, 7, 8, 1, 2, 4, 5, 6, 7, 8].map((number, index) => (
              <figure className={`results-item results-item--${number}`} key={`${number}-${index}`}>
                <img
                  src={`/images/results/result-${number}.webp`}
                  alt="لمحة من نتائج العناية المنشورة على الموقع الرسمي"
                  width={600}
                  height={600}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </div>
        <div className="container results__note">
          <p>
            الصور من أرشيف العلامة الرسمي. النتائج تختلف من شخص لآخر، وللحصول على إرشاد مناسب
            لحالتكِ يمكنكِ طلب استشارة مباشرة.
          </p>
        </div>
      </section>

      <section className="section consultation">
        <div className="container consultation__grid">
          <Reveal className="consultation__copy">
            <span className="eyebrow">استشارة مجانية بالكامل</span>
            <h2>لستِ متأكدة من الروتين المناسب؟</h2>
            <p>
              تقدم د. رهف استشارة مجانية بالكامل. يتم تعبئة استبيان بسيط، وإرفاق صورة بدون فلاتر
              أو مكياج، وتفاصيل الحالة، ثم يتم التواصل معكِ لاختيار الروتين الأنسب.
            </p>
            <div className="consultation__actions">
              <a
                className="button button--whatsapp"
                href={whatsappUrl(buildConsultationMessage())}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon width={20} height={20} />
                ابدئي الاستشارة عبر واتساب
              </a>
              <span className="consultation__phone">{site.whatsappDisplay}</span>
            </div>
          </Reveal>

          <Reveal className="consultation__steps" delay={100}>
            {[
              { number: '1', title: 'أرسلي رسالة', text: 'ابدئي محادثة واتساب مع طلب استشارة.' },
              { number: '2', title: 'شاركي التفاصيل', text: 'الاسم، رقم التواصل، صورة واضحة، وتفاصيل الحالة.' },
              { number: '3', title: 'اختاري روتينك', text: 'تساعدك د. رهف في اختيار المنتجات المناسبة.' },
            ].map((step) => (
              <div className="consultation-step" key={step.number}>
                <span>{step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta__inner">
          <Reveal>
            <span className="eyebrow eyebrow--light">جمالك يستحق العناية</span>
            <h2>ابدئي روتينك مع د. رهف سلوم</h2>
            <p>منتجات مصنوعة يدويًا، بعناية وتفصيل، وتواصل مباشر معكِ في كل خطوة.</p>
            <div className="final-cta__actions">
              <Link className="button button--light" to="/shop">
                تسوّقي الآن
                <ArrowLeftIcon width={18} height={18} />
              </Link>
              <a
                className="button button--outline-light"
                href={whatsappUrl(buildConsultationMessage())}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon width={18} height={18} />
                استشارة مجانية
              </a>
            </div>
            <div className="final-cta__meta">
              <span>
                <ClockIcon width={16} height={16} />
                شحن بعد 24 ساعة من تثبيت الحجز
              </span>
              <span>
                <TruckIcon width={16} height={16} />
                نقاط استلام في معظم المحافظات
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
