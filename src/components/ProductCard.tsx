import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPriceOrRequest } from '../lib/format';
import { getCategory } from '../data/categories';
import type { Product } from '../data/products';
import { BagIcon, PlusIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const { addItem } = useCart();
  const category = getCategory(product.category);
  const hasVariations = Boolean(product.variations);
  const onRequest = product.price === null;

  return (
    <article className="product-card">
      <Link
        className="product-card__media"
        to={`/product/${product.slug}`}
        aria-label={`عرض ${product.name}`}
      >
        <img
          src={product.imageSmall}
          alt={product.name}
          width={420}
          height={420}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
        <span className="product-card__glow" aria-hidden="true" />
        {hasVariations && <span className="product-card__badge">خيارات متعددة</span>}
        {onRequest && <span className="product-card__badge">السعر عند الطلب</span>}
      </Link>

      <div className="product-card__body">
        <span className="product-card__category">{category?.shortName}</span>
        <h3 className="product-card__title">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-card__footer">
          <span className={`product-card__price${onRequest ? ' is-request' : ''}`}>
            {formatPriceOrRequest(product.price)}
          </span>
          {onRequest ? (
            <Link className="product-card__add is-link" to={`/product/${product.slug}`}>
              استفسري
            </Link>
          ) : hasVariations ? (
            <Link className="product-card__add is-link" to={`/product/${product.slug}`}>
              اختاري
            </Link>
          ) : (
            <button
              className="product-card__add"
              type="button"
              onClick={() => addItem(product)}
              aria-label={`أضيفي ${product.name} إلى السلة`}
            >
              <PlusIcon width={16} height={16} />
              <span>أضيفي</span>
            </button>
          )}
        </div>
      </div>

      <span className="product-card__bag" aria-hidden="true">
        <BagIcon width={18} height={18} />
      </span>
    </article>
  );
};
