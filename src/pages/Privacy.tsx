import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ArrowLeftIcon, WhatsAppIcon } from '../components/Icons';

const sections = [
  { id: 'who', label: 'من نحن' },
  { id: 'storage', label: 'ما نحفظه على جهازك' },
  { id: 'whatsapp', label: 'البيانات المرسلة عبر واتساب' },
  { id: 'use', label: 'كيف نستخدم المعلومات' },
  { id: 'payment', label: 'الدفع عبر شام كاش' },
  { id: 'shipping', label: 'الشحن والتوصيل' },
  { id: 'cookies', label: 'ملفات التتبع' },
  { id: 'rights', label: 'خياراتك وحقوقك' },
  { id: 'contact', label: 'التواصل' },
];

export const Privacy = () => {
  useDocumentMeta(
    'الخصوصية والشحن | د. رهف سلوم',
    'كيف يتعامل متجر د. رهف سلوم مع بياناتك: السلة المحفوظة على جهازك، رسالة واتساب، الدفع عبر شام كاش، والشحن والتوصيل.',
  );

  return (
    <section className="legal-page">
      <div className="container">
        <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'الخصوصية والشحن' }]} />

        <div className="page-title legal-title">
          <span className="eyebrow">الخصوصية والشحن</span>
          <h1>كيف نتعامل مع معلوماتك</h1>
          <p>
            هذه الصفحة توضح ما يحفظه الموقع على جهازك، وما يُرسل عند اختيارك التواصل عبر واتساب،
            إضافة إلى تفاصيل الدفع والشحن. آخر تحديث: تشرين الثاني 2026.
          </p>
        </div>

        <div className="legal-layout">
          <nav className="legal-toc" aria-label="محتويات الصفحة">
            <span className="legal-toc__label">المحتويات</span>
            <ol>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.label}</a>
                </li>
              ))}
            </ol>
            <div className="legal-toc__help">
              <WhatsAppIcon width={20} height={20} />
              <p>لديك سؤال عن بياناتك؟ تواصلي معنا مباشرة.</p>
              <Link className="text-link" to="/contact">
                صفحة التواصل
                <ArrowLeftIcon width={16} height={16} />
              </Link>
            </div>
          </nav>

          <div className="legal-content">
            <section id="who">
              <h2>1. من نحن</h2>
              <p>
                هذا الموقع هو واجهة تسوق لعلامة {site.name}. القناة المعتمدة للتواصل وتأكيد
                الطلبات هي واتساب على الرقم{' '}
                <a href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noreferrer" dir="ltr">
                  {site.whatsappDisplay}
                </a>
                .
              </p>
            </section>

            <section id="storage">
              <h2>2. ما نحفظه على جهازك</h2>
              <p>
                لا يوجد حساب مستخدم على الموقع، ولا نطلب بريدًا إلكترونيًا أو كلمة مرور. نحفظ سلة
                التسوق في مساحة التخزين المحلية للمتصفح (localStorage) تحت المفتاح{' '}
                <code>dr-rahaf-cart-v1</code>، حتى تبقى اختياراتك عند العودة إلى الموقع.
              </p>
              <p>
                تُحفظ رسالة الطلب الجاهزة مؤقتًا في تخزين الجلسة (sessionStorage) تحت المفتاح{' '}
                <code>dr-rahaf-pending-order-v1</code> لعرضها في صفحة «طلبك جاهز للإرسال». يمكنك
                مسح السلة من صفحة السلة، أو مسح بيانات الموقع من إعدادات المتصفح.
              </p>
            </section>

            <section id="whatsapp">
              <h2>3. البيانات المرسلة عبر واتساب</h2>
              <p>
                لا يُرسل الموقع أي بيانات إلى خادم خاص به. عند إتمام الطلب، تُجهَّز رسالة واتساب
                تحتوي على المعلومات التي أدخلتِها بنفسك: الاسم الأول، اسم الأب، الاسم الأخير،
                الدولة، رقم الواتس، فرع الاستلام، الملاحظات، رمز الخصم إن أدخلتِه، وعنوان الشحن
                إن اخترتِ الشحن لعنوان مختلف.
              </p>
              <p>
                لا تُرسل هذه المعلومات إلا عندما تختارين فتح واتساب والضغط على «إرسال» داخل
                المحادثة. تخضع المحادثة لسياسة خصوصية واتساب الخاصة بها.
              </p>
            </section>

            <section id="use">
              <h2>4. كيف نستخدم المعلومات</h2>
              <p>تُستخدم المعلومات التي ترسلينها عبر واتساب فقط من أجل:</p>
              <ul>
                <li>تأكيد الطلب ومراجعة المنتجات والكميات.</li>
                <li>ترتيب الاستلام من الفرع أو الشحن إلى العنوان المحدد.</li>
                <li>ترتيب الاستلام أو التوصيل وتأكيد تفاصيله.</li>
                <li>الرد على استفساراتك أو متابعة طلبك.</li>
              </ul>
              <p>لا نبيع معلوماتك ولا نشاركها لأغراض تسويقية مع أطراف أخرى.</p>
            </section>

            <section id="payment">
              <h2>5. الدفع عبر شام كاش</h2>
              <p>
                الدفع المتاح هو {site.payment.name}. لا يطلب الموقع أي بيانات بطاقة أو كلمة مرور
                لمحفظتك. يتم التحويل من داخل تطبيق شام كاش إلى المحفظة الظاهرة في صفحة إتمام
                الطلب:
              </p>
              <ul>
                <li>اسم المحفظة: {site.payment.walletName}</li>
                <li>
                  معرّف المحفظة: <code dir="ltr">{site.payment.walletId}</code>
                </li>
              </ul>
              <p>
                بعد التحويل، أرسلي صورة الإيصال في محادثة واتساب نفسها. لا يُعتبر الطلب مؤكدًا
                حتى تأكيد الفريق عبر واتساب.
              </p>
            </section>

            <section id="shipping">
              <h2>6. الشحن والتوصيل</h2>
              <p>{site.shippingNote}</p>
              <p>
                تتوفر نقاط استلام في معظم المحافظات السورية، وتظهر القائمة الكاملة عند إتمام
                الطلب. يمكنك أيضًا اختيار الشحن لعنوان مختلف وتعبئة حقول العنوان. لا تُضاف أجرة
                توصيل إلى الإجمالي على الموقع، وتُؤكَّد تفاصيل التوصيل عبر واتساب.
              </p>
              <p>
                لأي استفسار عن الاستبدال أو حالة الشحنة، تواصلي عبر واتساب وسنساعدك وفق تفاصيل
                طلبك.
              </p>
            </section>

            <section id="cookies">
              <h2>7. ملفات التتبع</h2>
              <p>
                لا نستخدم ملفات تعريف ارتباط إعلانية أو أدوات تتبع تحليلي في هذا الموقع. لا توجد
                إعلانات مدمجة. التخزين المحلي المذكور أعلاه ضروري لعمل السلة وصفحة تأكيد الإرسال
                فقط.
              </p>
              <p>
                عند فتح رابط واتساب أو زيارة موقع خارجي، تُطبق سياسات ذلك الموقع. الموقع الرسمي
                للعلامة هو{' '}
                <a href="https://drrahaf.com/" target="_blank" rel="noreferrer">
                  drrahaf.com
                </a>
                .
              </p>
            </section>

            <section id="rights">
              <h2>8. خياراتك وحقوقك</h2>
              <ul>
                <li>يمكنك حذف السلة من صفحة السلة في أي وقت.</li>
                <li>يمكنك مسح بيانات الموقع من إعدادات المتصفح لمسح السلة ورسالة الطلب المؤقتة.</li>
                <li>يمكنك طلب حذف معلومات محادثة واتساب عبر التواصل معنا.</li>
                <li>لا تشاركي أي معلومات لا ترغبين بإرسالها في المحادثة.</li>
              </ul>
            </section>

            <section id="contact">
              <h2>9. التواصل</h2>
              <p>
                لأي سؤال عن الخصوصية أو الشحن أو طلبك، تواصلي معنا عبر واتساب على الرقم{' '}
                <span dir="ltr">{site.whatsappDisplay}</span>.
              </p>
              <Link className="button button--whatsapp" to="/contact">
                <WhatsAppIcon width={20} height={20} />
                صفحة التواصل
              </Link>
            </section>

            <p className="legal-updated">آخر تحديث: تشرين الثاني 2026.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
