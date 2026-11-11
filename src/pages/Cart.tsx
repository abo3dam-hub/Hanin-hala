import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { useCart } from '../context/CartContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatPrice } from '../lib/format';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyCart } from '../components/EmptyCart';
import { QuantityStepper } from '../components/QuantityStepper';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldIcon,
  TrashIcon,
  TruckIcon,
} from '../components/Icons';

export const Cart = () => {
  const { items, totalItems, subtotal, updateQuantity, removeItem } = useCart();

  useDocumentMeta(
    'سلة التسوق | د. رهف سلوم',
    'راجعي منتجات سلة التسوق، عدّلي الكميات، ثم أكملي الطلب عبر واتساب مع متجر د. رهف سلوم.',
  );

  return (
    <section className="cart-page">
      <div className="container">
        <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'سلة التسوق' }]} />

        <div className="page-title">
          <span className="eyebrow">اختياراتك</span>
          <h1>سلة التسوق</h1>
          <p>
            {totalItems > 0
              ? `${totalItems} منتجًا في سلتك. راجعي الكميات قبل إتمام الطلب.`
              : 'لم تضيفي أي منتج بعد.'}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              <div className="cart-list__head">
                <span>المنتج</span>
                <span>الكمية والإجمالي</span>
              </div>

              {items.map((item) => (
                <article className="cart-item" key={item.key}>
                  <Link className="cart-item__media" to={`/product/${item.slug}`}>
                    <img src={item.image} alt={item.name} width={140} height={140} loading="lazy" />
                  </Link>

                  <div className="cart-item__body">
                    <Link className="cart-item__name" to={`/product/${item.slug}`}>
                      {item.name}
                    </Link>
                    {item.variation && (
                      <p className="cart-item__variation">
                        {item.variation.name}: {item.variation.label}
                      </p>
                    )}
                    <p className="cart-item__unit">{formatPrice(item.unitPrice)} للقطعة</p>

                    <div className="cart-item__controls">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(quantity) => updateQuantity(item.key, quantity)}
                        label={`كمية ${item.name}`}
                      />
                      <button
                        type="button"
                        className="cart-item__remove"
                        onClick={() => removeItem(item.key)}
                        aria-label={`إزالة ${item.name} من السلة`}
                      >
                        <TrashIcon width={16} height={16} />
                        إزالة
                      </button>
                    </div>
                  </div>

                  <strong className="cart-item__total">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </strong>
                </article>
              ))}

              <div className="cart-list__foot">
                <Link className="text-link" to="/shop">
                  <ArrowRightIcon width={18} height={18} />
                  متابعة التسوق
                </Link>
                <span>تُحفظ سلتك تلقائيًا على هذا الجهاز.</span>
              </div>
            </div>

            <aside className="cart-summary">
              <div className="summary-card">
                <h2>ملخص الطلب</h2>
                <div className="summary-row">
                  <span>المجموع الفرعي ({totalItems} منتجًا)</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="summary-row">
                  <span>أجرة التوصيل</span>
                  <span className="summary-row__soft">لا تُضاف على الموقع — تُؤكَّد عبر واتساب</span>
                </div>
                <p className="summary-note">{site.shippingNote}</p>
                <div className="summary-row is-total">
                  <span>الإجمالي</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <Link className="button button--primary button--wide" to="/checkout">
                  إتمام الطلب
                  <ArrowLeftIcon width={18} height={18} />
                </Link>
                <Link className="button button--ghost button--wide" to="/shop">
                  متابعة التسوق
                </Link>

                <ul className="summary-trust">
                  <li>
                    <TruckIcon width={18} height={18} />
                    شحن بعد 24 ساعة من تثبيت الحجز
                  </li>
                  <li>
                    <ShieldIcon width={18} height={18} />
                    الدفع عبر شام كاش ثم التأكيد على واتساب
                  </li>
                </ul>
              </div>

              <div className="payment-mini">
                <ShieldIcon width={22} height={22} />
                <div>
                  <strong>الدفع عبر {site.payment.name}</strong>
                  <p>{site.payment.description}</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};
