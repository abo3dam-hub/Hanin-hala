import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import { site } from '../data/site';
import { QuantityStepper } from './QuantityStepper';
import { BagIcon, CheckIcon, CloseIcon, TrashIcon } from './Icons';

export const CartDrawer = () => {
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    notice,
    clearNotice,
  } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isCartOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('no-scroll');
    window.setTimeout(() => closeRef.current?.focus(), 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [isCartOpen, closeCart]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(clearNotice, 2800);
    return () => window.clearTimeout(timer);
  }, [notice, clearNotice]);

  if (!isCartOpen) return null;

  return createPortal(
    <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="سلة التسوق">
      <button className="cart-drawer__backdrop" type="button" onClick={closeCart} aria-label="إغلاق السلة" />
      <aside className="cart-drawer__panel">
        <header className="cart-drawer__header">
          <div>
            <span className="eyebrow">اختياراتك</span>
            <h2>سلة التسوق</h2>
            <p>{totalItems > 0 ? `${totalItems} منتجًا في السلة` : 'السلة فارغة حاليًا'}</p>
          </div>
          <button ref={closeRef} className="cart-drawer__close" type="button" onClick={closeCart} aria-label="إغلاق السلة">
            <CloseIcon width={16} height={16} />
            إغلاق
          </button>
        </header>

        {notice && (
          <div className="cart-drawer__notice" role="status">
            <CheckIcon width={18} height={18} />
            {notice}
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <span className="cart-drawer__empty-icon">
              <BagIcon width={34} height={34} />
            </span>
            <h3>لم تضيفي أي منتج بعد</h3>
            <p>اكتشفي مجموعات العناية المصنوعة يدويًا بإشراف د. رهف سلوم.</p>
            <Link className="button button--primary" to="/shop" onClick={closeCart}>
              تسوّقي الآن
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map((item) => (
                <article className="cart-line" key={item.key}>
                  <Link className="cart-line__media" to={`/product/${item.slug}`} onClick={closeCart}>
                    <img src={item.image} alt={item.name} width={88} height={88} loading="lazy" />
                  </Link>
                  <div className="cart-line__body">
                    <div className="cart-line__top">
                      <Link to={`/product/${item.slug}`} onClick={closeCart}>
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        className="cart-line__remove"
                        onClick={() => removeItem(item.key)}
                        aria-label={`إزالة ${item.name} من السلة`}
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                    {item.variation && (
                      <p className="cart-line__variation">
                        {item.variation.name}: {item.variation.label}
                      </p>
                    )}
                    <div className="cart-line__bottom">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(quantity) => updateQuantity(item.key, quantity)}
                        label={`كمية ${item.name}`}
                      />
                      <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="cart-drawer__footer">
              <div className="cart-drawer__row">
                <span>المجموع الفرعي</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart-drawer__shipping">{site.shippingNote}</p>
              <div className="cart-drawer__row is-total">
                <span>الإجمالي</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link className="button button--primary button--wide" to="/checkout" onClick={closeCart}>
                إتمام الطلب
              </Link>
              <div className="cart-drawer__links">
                <Link to="/cart" onClick={closeCart}>
                  عرض السلة
                </Link>
                <button type="button" onClick={closeCart}>
                  متابعة التسوق
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
};
