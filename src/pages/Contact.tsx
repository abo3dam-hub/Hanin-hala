import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { branches } from '../data/branches';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { isValidPhone } from '../lib/format';
import { buildConsultationMessage, buildContactMessage, whatsappUrl } from '../lib/whatsapp';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormField } from '../components/FormField';
import { Reveal } from '../components/Reveal';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  PhoneIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons';

const topics = [
  'استشارة مجانية',
  'سؤال عن منتج',
  'متابعة طلب',
  'الشحن والتوصيل',
  'أخرى',
];

interface ContactForm {
  name: string;
  phone: string;
  topic: string;
  message: string;
}

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

export const Contact = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    phone: '',
    topic: topics[0],
    message: '',
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useDocumentMeta(
    'التواصل والاستشارة | د. رهف سلوم',
    'تواصلي مع د. رهف سلوم عبر واتساب لحجز استشارة مجانية، السؤال عن منتج، أو متابعة طلب. نقاط استلام في معظم المحافظات السورية.',
    { image: '/images/brand/logo.png' },
  );

  const update = (key: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: ContactErrors = {};

    if (!form.name.trim()) next.name = 'اسمك مطلوب.';
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      next.phone = 'أدخلي رقمًا صالحًا من 7 إلى 15 رقمًا.';
    }
    if (!form.message.trim()) next.message = 'اكتبي رسالتك أولًا.';

    setErrors(next);

    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const text = buildContactMessage(form.name, form.phone, form.topic, form.message);
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const generatedMessage = buildContactMessage(form.name, form.phone, form.topic, form.message);

  return (
    <>
      <section className="page-hero page-hero--contact">
        <span className="page-hero__orb" aria-hidden="true" />
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'التواصل' }]} />
            <span className="eyebrow">
              <SparkleIcon width={16} height={16} />
              تواصلي معنا
            </span>
            <h1>
              نحن هنا
              <em> للإجابة عن سؤالك</em>
            </h1>
            <p>
              للاستشارة المجانية، السؤال عن منتج، أو متابعة طلب، تواصلي معنا مباشرة عبر واتساب.
              فريق د. رهف سيرد عليكِ ويساعدك في اختيار الأنسب.
            </p>
            <div className="page-hero__meta">
              <span>استشارة مجانية بالكامل</span>
              <span>رد مباشر عبر واتساب</span>
              <span>{branches.length} نقطة استلام</span>
            </div>
          </div>

          <Reveal className="contact-hero-card" delay={100}>
            <span className="contact-hero-card__icon">
              <WhatsAppIcon width={30} height={30} />
            </span>
            <span className="eyebrow eyebrow--light">القناة الأساسية</span>
            <h2>واتساب د. رهف</h2>
            <p dir="ltr" className="contact-hero-card__phone">
              {site.whatsappDisplay}
            </p>
            <a
              className="button button--whatsapp button--wide"
              href={whatsappUrl(buildConsultationMessage())}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon width={20} height={20} />
              ابدئي محادثة
            </a>
            <small>لا نعرض بريدًا إلكترونيًا لأن القناة المعتمدة للتواصل هي واتساب.</small>
          </Reveal>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-layout">
          <div className="contact-cards">
            <Reveal className="contact-card">
              <span className="contact-card__icon">
                <PhoneIcon width={22} height={22} />
              </span>
              <h2>الاستشارة المجانية</h2>
              <p>
                استشارة مجانية بالكامل للعناية بالبشرة. أرسلي اسمك، رقم التواصل، صورة واضحة بدون
                فلاتر أو مكياج، وتفاصيل الحالة.
              </p>
              <a
                className="text-link"
                href={whatsappUrl(buildConsultationMessage())}
                target="_blank"
                rel="noreferrer"
              >
                احجزي استشارتك
                <ArrowLeftIcon width={17} height={17} />
              </a>
            </Reveal>

            <Reveal className="contact-card" delay={70}>
              <span className="contact-card__icon">
                <TruckIcon width={22} height={22} />
              </span>
              <h2>الاستلام والشحن</h2>
              <p>
                اختاري أقرب فرع من {branches.length} نقطة استلام عند إتمام الطلب، أو أكملي عنوان
                الشحن. يتم الشحن بعد 24 ساعة من تثبيت الحجز، وتُؤكَّد تفاصيل التوصيل عبر واتساب.
              </p>
              <Link className="text-link" to="/privacy">
                تفاصيل الشحن
                <ArrowLeftIcon width={17} height={17} />
              </Link>
            </Reveal>

            <Reveal className="contact-card" delay={140}>
              <span className="contact-card__icon">
                <ShieldIcon width={22} height={22} />
              </span>
              <h2>الدفع عبر شام كاش</h2>
              <p>
                الدفع عبر محفظة شام كاش، ثم إرسال صورة الإيصال عبر واتساب لتأكيد الطلب. لا نطلب
                أي بيانات دفع على الموقع.
              </p>
              <Link className="text-link" to="/checkout">
                صفحة إتمام الطلب
                <ArrowLeftIcon width={17} height={17} />
              </Link>
            </Reveal>

            <Reveal className="contact-card contact-card--hours" delay={210}>
              <span className="contact-card__icon">
                <ClockIcon width={22} height={22} />
              </span>
              <h2>أوقات الرد</h2>
              <p>
                نرد على رسائل واتساب في أقرب وقت ممكن. قد يتأخر الرد خارج أوقات العمل، وستبقى
                رسالتك محفوظة في المحادثة.
              </p>
              <span className="contact-card__soft">الشحن بعد 24 ساعة من تثبيت الحجز</span>
            </Reveal>
          </div>

          <Reveal className="contact-form-card" delay={120}>
            <span className="eyebrow">رسالة مباشرة</span>
            <h2>أرسلي لنا رسالة</h2>
            <p className="contact-form-card__lead">
              اكتبي رسالتك هنا، وسنجهّز لكِ نصًا جاهزًا لإرساله عبر واتساب. لا تُرسل البيانات إلى
              أي خادم من هذا الموقع.
            </p>

            <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <FormField id="contact_name" label="اسمك" required error={errors.name}>
                  <input
                    id="contact_name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    autoComplete="name"
                    placeholder="اسمك"
                    aria-required="true"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact_name-error' : undefined}
                  />
                </FormField>

                <FormField
                  id="contact_phone"
                  label="رقم الواتس (اختياري)"
                  error={errors.phone}
                  hint="أدخلي الرقم إن رغبتِ بأن نتواصل معكِ."
                >
                  <input
                    id="contact_phone"
                    name="phone"
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    autoComplete="tel"
                    placeholder="+963 9XX XXX XXX"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'contact_phone-error' : undefined}
                  />
                </FormField>

                <FormField id="contact_topic" label="الموضوع" full>
                  <select
                    id="contact_topic"
                    name="topic"
                    value={form.topic}
                    onChange={(event) => update('topic', event.target.value)}
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField id="contact_message" label="رسالتك" required error={errors.message} full>
                  <textarea
                    id="contact_message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={(event) => update('message', event.target.value)}
                    placeholder="اكتبي تفاصيل سؤالك أو حالتك..."
                    aria-required="true"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact_message-error' : undefined}
                  />
                </FormField>
              </div>

              <button type="submit" className="button button--whatsapp button--wide">
                <WhatsAppIcon width={20} height={20} />
                تجهيز الرسالة عبر واتساب
              </button>

              {sent && (
                <div className="contact-form__status" role="status">
                  <CheckIcon width={18} height={18} />
                  <div>
                    <strong>جهّزنا رسالتك.</strong>
                    <p>
                      إن لم تُفتح محادثة واتساب تلقائيًا، استخدمي الرابط التالي.
                    </p>
                    <a href={whatsappUrl(generatedMessage)} target="_blank" rel="noreferrer">
                      فتح واتساب وإرسال الرسالة
                    </a>
                  </div>
                </div>
              )}

              <p className="contact-form__note">
                بالضغط على الزر ستُفتح محادثة واتساب برسالتك. لا يُحفظ محتوى الرسالة على هذا
                الموقع.
              </p>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream contact-faq">
        <div className="container">
          <div className="contact-faq__head">
            <span className="eyebrow">أسئلة شائعة</span>
            <h2>إجابات سريعة</h2>
            <p>إن لم تجدي إجابتك، تواصلي معنا عبر واتساب وسنساعدك مباشرة.</p>
          </div>

          <div className="faq-list">
            <details className="accordion" open>
              <summary>هل الاستشارة مجانية فعلًا؟</summary>
              <p>
                نعم، الاستشارة مجانية بالكامل. تُعبَّأ معلومات بسيطة وتُرفق صورة واضحة للبشرة
                بدون فلاتر أو مكياج مع تفاصيل الحالة، ثم يتم التواصل معكِ.
              </p>
            </details>
            <details className="accordion">
              <summary>كيف أتابع طلبي بعد إرساله؟</summary>
              <p>
                بعد إرسال رسالة الطلب عبر واتساب وتأكيد الفريق، تبقى المتابعة في المحادثة نفسها.
                احتفظي برقم الطلب أو برسالتك للرجوع إليها.
              </p>
            </details>
            <details className="accordion">
              <summary>كيف أدفع؟</summary>
              <p>
                الدفع عبر شام كاش فقط. بعد تجهيز الطلب، حوّلي المبلغ إلى محفظة{' '}
                {site.payment.walletName} باستخدام المعرّف الظاهر في صفحة إتمام الطلب، ثم أرفقي
                صورة الإيصال عبر واتساب.
              </p>
            </details>
            <details className="accordion">
              <summary>متى يُشحن الطلب؟</summary>
              <p>{site.shippingNote}</p>
            </details>
            <details className="accordion">
              <summary>هل يمكنني الاستلام من فرع؟</summary>
              <p>
                نعم، عند إتمام الطلب اختاري أقرب فرع من قائمة نقاط الاستلام المتاحة. تتوفر{' '}
                {branches.length} نقطة استلام ضمن المحافظات المدرجة.
              </p>
            </details>
          </div>

          <p className="contact-faq__source">
            للاطلاع على الموقع الرسمي للعلامة:{' '}
            <a href="https://drrahaf.com/" target="_blank" rel="noreferrer">
              drrahaf.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
};
