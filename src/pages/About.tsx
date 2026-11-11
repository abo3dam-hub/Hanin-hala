import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { branches } from '../data/branches';
import { site } from '../data/site';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { buildConsultationMessage, whatsappUrl } from '../lib/whatsapp';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import {
  ArrowLeftIcon,
  ClockIcon,
  LeafIcon,
  ShieldIcon,
  SparkleIcon,
  WhatsAppIcon,
} from '../components/Icons';

export const About = () => {
  useDocumentMeta(
    'عن العلامة | د. رهف سلوم',
    'تعرّفي على علامة د. رهف زهير سلوم، صيدلانية وأخصائية عناية بالبشرة: منتجات مصنوعة يدويًا بدفعات صغيرة، واستشارة مجانية عبر واتساب.',
    { image: '/images/products/8593.webp' },
  );

  return (
    <>
      <section className="page-hero page-hero--about">
        <span className="page-hero__orb" aria-hidden="true" />
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'عن العلامة' }]} />
            <span className="eyebrow">
              <SparkleIcon width={16} height={16} />
              عن العلامة
            </span>
            <h1>
              د. رهف زهير سلوم
              <em> عناية تُصنع بعناية</em>
            </h1>
            <p>
              صيدلانية وأخصائية عناية بالبشرة. وُلدت العلامة من فكرة بسيطة: أن تكون العناية
              شخصية، صادقة، وهادئة؛ منتجات تُصنع يدويًا بكميات محدودة، وتحت إشراف مباشر.
            </p>
            <div className="page-hero__meta">
              <span>{products.length} منتجًا</span>
              <span>{categories.length} مجموعات</span>
              <span>{branches.length} نقطة استلام</span>
            </div>
          </div>

          <div className="page-hero__art page-hero__art--about" aria-hidden="true">
            <div className="page-hero__arch">
              <img src="/images/products/8593.webp" alt="" width={700} height={900} fetchPriority="high" />
            </div>
            <div className="page-hero__float">
              <img src="/images/products/17014.webp" alt="" width={300} height={300} loading="lazy" />
            </div>
            <span className="page-hero__seal">بإشراف مباشر</span>
          </div>
        </div>
      </section>

      <section className="section about-story">
        <div className="container about-story__grid">
          <Reveal className="about-story__copy">
            <span className="eyebrow">القصة</span>
            <h2>عناية بطيئة، مفصّلة، وصادقة</h2>
            <p>
              تبدأ كل منتجات العلامة من فكرة واحدة: أن تكون العناية بالبشرة شخصية، لا روتينًا
              طويلًا متماثلًا للجميع. تُختار المواد بعناية، وتُحضَّر المنتجات بدفعات صغيرة،
              وتحت إشراف مباشر من د. رهف زهير سلوم.
            </p>
            <p>
              خبرتها كصيدلانية وأخصائية عناية بالبشرة توجّه كل خطوة: من اختيار المكوّنات إلى
              طريقة الاستخدام، ومن التغليف إلى التواصل معكِ بعد الطلب. ولأن كل بشرة مختلفة،
              تبقى الاستشارة المباشرة جزءًا أساسيًا من التجربة.
            </p>
            <div className="about-story__stats">
              <div>
                <strong>{products.length}</strong>
                <span>منتجًا في المتجر</span>
              </div>
              <div>
                <strong>{categories.length}</strong>
                <span>مجموعات عناية</span>
              </div>
              <div>
                <strong>{branches.length}</strong>
                <span>نقطة استلام</span>
              </div>
            </div>
            <div className="about-story__actions">
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
                استشارة مجانية
              </a>
            </div>
          </Reveal>

          <Reveal className="about-story__visual" delay={120}>
            <div className="about-story__main">
              <img
                src="/images/products/8599.webp"
                alt="روتين البشرة الدهنية من مجموعة د. رهف سلوم"
                width={800}
                height={800}
                loading="lazy"
              />
            </div>
            <div className="about-story__accent">
              <img
                src="/images/products/8437.webp"
                alt="سيروم الكافيار والحلزون"
                width={400}
                height={400}
                loading="lazy"
              />
            </div>
            <div className="about-story__quote">
              <SparkleIcon width={20} height={20} />
              <p>«أصنع منتجاتي بيدي، بمواد مختارة بعناية شديدة، وتحت إشرافي المباشر.»</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="ما يميّز العلامة"
              title="ثلاث قيم توجّه كل منتج"
              description="لا وعود مبالغ فيها، بل تفاصيل حقيقية يمكنك ملاحظتها في كل خطوة."
              align="center"
            />
          </Reveal>
          <div className="values-grid">
            {[
              {
                icon: LeafIcon,
                title: 'صناعة يدوية بدفعات صغيرة',
                text: 'تُحضَّر المنتجات يدويًا بكميات محدودة، ما يتيح عناية أكبر بكل دفعة.',
              },
              {
                icon: ShieldIcon,
                title: 'إشراف صيدلاني مباشر',
                text: 'خبرة د. رهف كصيدلانية وأخصائية عناية بالبشرة توجّه اختيار المواد وطريقة الاستخدام.',
              },
              {
                icon: WhatsAppIcon,
                title: 'تواصل شخصي واستشارة',
                text: 'استشارة مجانية بالكامل عبر واتساب، مع إمكانية مشاركة تفاصيل حالتك وصورة واضحة.',
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} className="value-card" delay={index * 80}>
                <span className="value-card__icon">
                  <Icon width={24} height={24} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-process">
        <div className="container about-process__grid">
          <Reveal className="about-process__copy">
            <span className="eyebrow">كيف تبدأين؟</span>
            <h2>خطوات بسيطة قبل اختيار روتينك</h2>
            <p>
              الاستشارة مجانية بالكامل. تُعبَّأ معلومات بسيطة، وتُرفق صورة للبشرة بدون فلاتر أو
              مكياج مع تفاصيل الحالة، ثم يتم التواصل معكِ لاختيار المنتجات الأنسب.
            </p>
            <div className="about-process__note">
              <ClockIcon width={20} height={20} />
              <p>الاستشارة لا تغني عن التشخيص الطبي عند الحاجة، وهي مخصصة لإرشاد العناية بالبشرة.</p>
            </div>
            <a
              className="button button--whatsapp"
              href={whatsappUrl(buildConsultationMessage())}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon width={20} height={20} />
              ابدئي الاستشارة عبر واتساب
            </a>
          </Reveal>

          <Reveal className="about-process__steps" delay={100}>
            {[
              { number: '1', title: 'أرسلي رسالة', text: 'ابدئي محادثة واتساب واطلبي استشارة مجانية.' },
              { number: '2', title: 'شاركي التفاصيل', text: 'الاسم، رقم التواصل، صورة واضحة بدون فلاتر، وتفاصيل الحالة.' },
              { number: '3', title: 'اختاري روتينك', text: 'تساعدك د. رهف في اختيار المنتجات المناسبة لاحتياجك.' },
            ].map((step) => (
              <div className="process-step" key={step.number}>
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

      <section className="section section--cream about-archive">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="من الأرشيف"
              title="لمحات من نتائج العناية"
              description="صور من أرشيف العلامة الرسمي. لا نضيف شهادات أو نتائج غير موثّقة، والنتائج تختلف من شخص لآخر."
              align="center"
            />
          </Reveal>
          <div className="about-archive__grid">
            {[1, 2, 4].map((number, index) => (
              <Reveal key={number} delay={index * 80}>
                <figure>
                  <img
                    src={`/images/results/result-${number}.webp`}
                    alt="لمحة من نتائج العناية المنشورة على الموقع الرسمي"
                    width={600}
                    height={600}
                    loading="lazy"
                  />
                </figure>
              </Reveal>
            ))}
          </div>
          <p className="about-archive__note">
            المصدر: الأرشيف الرسمي لعلامة {site.name}. للحصول على إرشاد مناسب لحالتكِ، يمكنك طلب
            استشارة مباشرة.
          </p>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta__inner">
          <Reveal>
            <span className="eyebrow eyebrow--light">جمالك يستحق العناية</span>
            <h2>كوني قريبة من د. رهف</h2>
            <p>استشارة مجانية، منتجات مصنوعة يدويًا، وتواصل مباشر في كل خطوة.</p>
            <div className="final-cta__actions">
              <Link className="button button--light" to="/contact">
                تواصلي معنا
                <ArrowLeftIcon width={18} height={18} />
              </Link>
              <Link className="button button--outline-light" to="/shop">
                تسوّقي الآن
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
