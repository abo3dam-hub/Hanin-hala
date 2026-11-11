import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatPrice } from '../lib/format';
import { copyText } from '../lib/clipboard';
import { clearPendingOrder, readPendingOrder, type PendingOrder } from '../lib/order';
import { whatsappUrl } from '../lib/whatsapp';
import {
  ArrowLeftIcon,
  BagIcon,
  CheckIcon,
  CopyIcon,
  ShieldIcon,
  WhatsAppIcon,
} from '../components/Icons';

export const OrderReady = () => {
  const location = useLocation();
  const { clearCart } = useCart();
  const [order] = useState<PendingOrder | null>(
    () => (location.state as PendingOrder | null) ?? readPendingOrder(),
  );
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  useDocumentMeta(
    'طلبك جاهز للإرسال | د. رهف سلوم',
    'أرسلي رسالة الطلب عبر واتساب لتأكيده مع متجر د. رهف سلوم، ثم أرفقي إيصال الدفع عبر شام كاش.',
    { noindex: true },
  );

  const confirmSent = () => {
    clearCart();
    clearPendingOrder();
    setConfirmed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyMessage = async () => {
    if (!order) return;
    const ok = await copyText(order.message);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  if (confirmed) {
    return (
      <section className="order-ready-page">
        <div className="container">
          <div className="ready-card ready-card--confirmed">
            <span className="ready-card__icon ready-card__icon--success">
              <CheckIcon width={30} height={30} />
            </span>
            <span className="eyebrow">تم تفريغ السلة</span>
            <h1>شكرًا لكِ</h1>
            <p>
              أُفرغت سلتك على هذا الجهاز. احتفظي بمحادثة واتساب للمتابعة؛ سيؤكد فريق د. رهف
              الطلب وتفاصيل التوصيل بعد وصول الرسالة.
            </p>
            <div className="ready-note ready-note--soft">
              <ShieldIcon width={20} height={20} />
              <p>
                لم يتم استلام الطلب تلقائيًا من الموقع. يُعدّ الطلب مؤكدًا فقط بعد إرسال الرسالة
                وتأكيد الفريق عبر واتساب.
              </p>
            </div>
            <div className="ready-actions">
              <Link className="button button--primary" to="/shop">
                متابعة التسوق
                <ArrowLeftIcon width={18} height={18} />
              </Link>
              <Link className="button button--ghost" to="/">
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="order-ready-page">
        <div className="container">
          <div className="empty-state empty-state--cart">
            <span className="empty-state__icon">
              <BagIcon width={34} height={34} />
            </span>
            <h1>لا يوجد طلب بانتظار الإرسال</h1>
            <p>
              لم نجد رسالة طلب جاهزة. أضيفي منتجات إلى السلة ثم أكملي معلومات الطلب لتوليد رسالة
              واتساب.
            </p>
            <div className="empty-state__actions">
              <Link className="button button--primary" to="/cart">
                عرض السلة
              </Link>
              <Link className="button button--ghost" to="/shop">
                تسوّقي المجموعة
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-ready-page">
      <div className="container">
        <div className="ready-head">
          <span className="eyebrow">
            <WhatsAppIcon width={16} height={16} />
            الخطوة الأخيرة
          </span>
          <h1>طلبك جاهز للإرسال</h1>
          <p>
            فتحنا لكِ رسالة الطلب. أرسليها من واتساب إلى د. رهف لتصل فعليًا، ثم أرفقي إيصال
            الدفع. حتى ذلك الحين، لا يُعتبر الطلب مستلمًا.
          </p>
        </div>

        <div className="ready-layout">
          <div className="ready-main">
            <div className="ready-note">
              <span className="ready-note__icon">
                <WhatsAppIcon width={22} height={22} />
              </span>
              <div>
                <strong>لم يصلنا طلبك بعد</strong>
                <p>
                  الموقع لا يرسل الطلبات تلقائيًا. اضغطي زر واتساب أدناه، ثم اضغطي «إرسال» داخل
                  المحادثة. إن لم تُفتح المحادثة تلقائيًا، استخدمي الزر نفسه.
                </p>
              </div>
            </div>

            <a
              className="button button--whatsapp button--wide ready-whatsapp"
              href={whatsappUrl(order.message)}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon width={22} height={22} />
              فتح واتساب وإرسال الطلب
            </a>

            <div className="ready-secondary">
              <button type="button" className="button button--ghost" onClick={copyMessage}>
                {copied ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
                <span aria-live="polite">{copied ? 'تم نسخ الرسالة' : 'نسخ نص الرسالة'}</span>
              </button>
              <Link className="button button--ghost" to="/cart">
                تعديل الطلب
              </Link>
            </div>

            <details className="message-preview">
              <summary>معاينة رسالة الطلب</summary>
              <pre dir="rtl">{order.message}</pre>
            </details>

            <div className="ready-confirm">
              <div>
                <strong>أرسلتِ الرسالة فعليًا؟</strong>
                <p>اضغطي الزر لتفريغ السلة. لا تستخدميه قبل إرسال الرسالة في واتساب.</p>
              </div>
              <button type="button" className="button button--outline" onClick={confirmSent}>
                <CheckIcon width={18} height={18} />
                لقد أرسلت الرسالة — تفريغ السلة
              </button>
            </div>
          </div>

          <aside className="ready-summary">
            <h2>ملخص ما أرسلته</h2>
            <dl>
              <div>
                <dt>الاسم</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt>رقم الواتس</dt>
                <dd dir="ltr">{order.phone}</dd>
              </div>
              <div>
                <dt>فرع الاستلام</dt>
                <dd>{order.branch}</dd>
              </div>
              <div>
                <dt>عدد القطع</dt>
                <dd>{order.itemCount}</dd>
              </div>
              <div className="is-total">
                <dt>الإجمالي</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
            </dl>
            <p className="ready-summary__note">
              لا تُضاف أجرة توصيل إلى الإجمالي على الموقع، وتُؤكَّد تفاصيل التوصيل عبر واتساب.
            </p>

            <ol className="ready-steps">
              <li>
                <span>1</span>
                أرسلي رسالة الطلب في واتساب.
              </li>
              <li>
                <span>2</span>
                حوّلي المبلغ عبر شام كاش وأرفقي صورة الإيصال.
              </li>
              <li>
                <span>3</span>
                انتظري تأكيد الفريق وتفاصيل الشحن.
              </li>
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
};
