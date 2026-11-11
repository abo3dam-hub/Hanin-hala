import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ArrowLeftIcon, SearchIcon, WhatsAppIcon } from '../components/Icons';
import { buildGeneralMessage, whatsappUrl } from '../lib/whatsapp';

export const NotFound = () => {
  useDocumentMeta(
    'الصفحة غير موجودة | د. رهف سلوم',
    'لم نجد الصفحة التي تبحثين عنها. تصفّحي منتجات متجر د. رهف سلوم أو تواصلي معنا عبر واتساب.',
    { noindex: true },
  );

  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <span className="not-found__code">404</span>
        <span className="eyebrow">الصفحة غير موجودة</span>
        <h1>يبدو أن هذا الرابط لا يقود إلى شيء</h1>
        <p>
          ربما تغيّر رابط الصفحة أو أنها لم تعد متاحة. يمكنك العودة إلى الرئيسية أو تصفّح
          المجموعة كاملة.
        </p>
        <div className="not-found__actions">
          <Link className="button button--primary" to="/shop">
            <SearchIcon width={18} height={18} />
            تصفّحي المتجر
          </Link>
          <Link className="button button--ghost" to="/">
            العودة للرئيسية
            <ArrowLeftIcon width={18} height={18} />
          </Link>
        </div>
        <a
          className="text-link text-link--muted"
          href={whatsappUrl(buildGeneralMessage())}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon width={17} height={17} />
          تحتاجين مساعدة؟ تواصلي عبر واتساب
        </a>
      </div>
    </section>
  );
};
