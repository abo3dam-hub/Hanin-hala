import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategory } from '../data/categories';
import { products, type Product as ProductType } from '../data/products';
import { branches } from '../data/branches';
import { site } from '../data/site';
import { useCart } from '../context/CartContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useJsonLd } from '../hooks/useJsonLd';
import { formatPrice, formatPriceOrRequest } from '../lib/format';
import { buildProductInquiryMessage, whatsappUrl } from '../lib/whatsapp';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { QuantityStepper } from '../components/QuantityStepper';
import { Reveal } from '../components/Reveal';
import { NotFound } from './NotFound';
import {
  ArrowLeftIcon,
  BagIcon,
  CheckIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons';

export const Product = () => {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug);

  if (!product) return <NotFound />;

  return <ProductView product={product} key={product.id} />;
};

const ProductView = ({ product }: { product: ProductType }) => {
  const { addItem } = useCart();
  const category = getCategory(product.category);
  const [variationId, setVariationId] = useState(product.variations?.options[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);

  const selectedOption = product.variations?.options.find((option) => option.id === variationId);
  const unitPrice = selectedOption?.price ?? product.price;
  const onRequest = product.price === null;

  const description =
    product.description && product.description.length > 160
      ? `${product.description.slice(0, 157)}…`
      : product.description;

  useDocumentMeta(
    `${product.name} | د. رهف سلوم`,
    description ??
      `${product.name} من ${category?.name ?? 'مجموعة العناية'} في متجر د. رهف سلوم. للاستفسار عن المكونات وطريقة الاستخدام تواصلي عبر واتساب.`,
    { image: product.image, type: 'product' },
  );

  const jsonLd = useMemo(() => {
    const origin = window.location.origin;
    const offers = product.variations
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'SYP',
          lowPrice: Math.min(...product.variations.options.map((option) => option.price)),
          highPrice: Math.max(...product.variations.options.map((option) => option.price)),
          offerCount: product.variations.options.length,
          availability: 'https://schema.org/InStock',
        }
      : product.price !== null
        ? {
            '@type': 'Offer',
            priceCurrency: 'SYP',
            price: product.price,
            availability: 'https://schema.org/InStock',
            url: `${origin}/product/${product.slug}`,
          }
        : undefined;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: [`${origin}${product.image}`],
      description: product.description ?? undefined,
      sku: String(product.id),
      category: category?.name,
      brand: { '@type': 'Brand', name: site.name },
      offers,
    };
  }, [product, category]);

  useJsonLd(`product-schema-${product.id}`, jsonLd);

  const related = useMemo(() => {
    const sameCategory = products.filter(
      (item) => item.category === product.category && item.id !== product.id,
    );
    const pool = sameCategory.length > 0 ? sameCategory : products.filter((item) => item.id !== product.id);
    return pool.slice(0, 4);
  }, [product]);

  const handleAdd = () => {
    if (onRequest) return;
    addItem(
      product,
      quantity,
      selectedOption
        ? { id: selectedOption.id, name: product.variations?.name ?? 'الخيار', label: selectedOption.label }
        : undefined,
    );
  };

  const inquiryMessage = buildProductInquiryMessage(product.name);

  return (
    <>
      <section className="product-page">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'الرئيسية', to: '/' },
              { label: 'المتجر', to: '/shop' },
              ...(category ? [{ label: category.shortName, to: `/shop?category=${category.slug}` }] : []),
              { label: product.name },
            ]}
          />

          <div className="product-layout">
            <div className="product-gallery">
              <div className="product-gallery__frame">
                <span className="product-gallery__glow" aria-hidden="true" />
                <img
                  src={product.image}
                  alt={product.name}
                  width={900}
                  height={900}
                  fetchPriority="high"
                />
                <span className="product-gallery__badge">
                  <SparkleIcon width={15} height={15} />
                  صناعة يدوية
                </span>
              </div>
              <div className="product-gallery__caption">
                <span>بإشراف د. رهف سلوم</span>
                <span>صورة المنتج من الأرشيف الرسمي</span>
              </div>
            </div>

            <div className="product-info">
              <span className="product-info__category">{category?.name ?? 'منتجات العناية'}</span>
              <h1>{product.name}</h1>

              <div className="product-info__price-row">
                <strong className={`product-info__price${onRequest ? ' is-request' : ''}`}>
                  {formatPriceOrRequest(unitPrice)}
                </strong>
                {product.variations && selectedOption && (
                  <span className="product-info__variation-note">
                    {product.variations.name}: {selectedOption.label}
                  </span>
                )}
              </div>
              <p className="product-info__meta">الأسعار بالليرة السورية • شحن بعد 24 ساعة من تثبيت الحجز</p>

              {product.variations && (
                <div className="product-options">
                  <span className="product-options__label">{product.variations.name}</span>
                  <div className="option-list" role="radiogroup" aria-label={product.variations.name}>
                    {product.variations.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={variationId === option.id}
                        className={`option-chip${variationId === option.id ? ' is-active' : ''}`}
                        onClick={() => setVariationId(option.id)}
                      >
                        <span>{option.label}</span>
                        <small>{formatPrice(option.price)}</small>
                        {variationId === option.id && <CheckIcon width={15} height={15} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onRequest ? (
                <div className="product-buy product-buy--request">
                  <div className="product-request-note">
                    <span>السعر عند الطلب</span>
                    <p>
                      هذا المنتج غير مسعّر على الموقع الرسمي. تواصلي مع د. رهف للاستفسار عن السعر
                      والمكونات وطريقة الاستخدام.
                    </p>
                  </div>
                  <a
                    className="button button--whatsapp button--wide"
                    href={whatsappUrl(inquiryMessage)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon width={20} height={20} />
                    استفسري عبر واتساب
                  </a>
                </div>
              ) : (
                <div className="product-buy">
                  <div className="product-buy__row">
                    <QuantityStepper value={quantity} onChange={setQuantity} label="كمية المنتج" />
                    <button type="button" className="button button--primary product-buy__add" onClick={handleAdd}>
                      <BagIcon width={19} height={19} />
                      أضيفي إلى السلة
                    </button>
                  </div>
                  <a
                    className="text-link text-link--muted"
                    href={whatsappUrl(inquiryMessage)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon width={17} height={17} />
                    استفسري عن هذا المنتج قبل الشراء
                  </a>
                </div>
              )}

              <ul className="product-trust">
                <li>
                  <TruckIcon width={19} height={19} />
                  شحن بعد 24 ساعة من تثبيت الحجز
                </li>
                <li>
                  <ShieldIcon width={19} height={19} />
                  الدفع عبر شام كاش ثم التأكيد على واتساب
                </li>
                <li>
                  <WhatsAppIcon width={19} height={19} />
                  استشارة مجانية بالكامل
                </li>
              </ul>
            </div>
          </div>

          <div className="product-extra">
            <div className="product-description-block">
              <span className="eyebrow">تفاصيل المنتج</span>
              <h2>عن المنتج</h2>
              {product.description ? (
                <p className="product-description">{product.description}</p>
              ) : (
                <div className="product-note">
                  <strong>لم تُنشر تفاصيل هذا المنتج على الموقع الرسمي.</strong>
                  <p>
                    التزامًا بالدقة، لا نضيف وصفًا أو مكونات غير موثّقة. يمكنك سؤال د. رهف مباشرة
                    عن المكونات، طريقة الاستخدام، والملاءمة لبشرتك.
                  </p>
                  <a
                    className="text-link"
                    href={whatsappUrl(inquiryMessage)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    اسألي عن هذا المنتج
                    <WhatsAppIcon width={17} height={17} />
                  </a>
                </div>
              )}
            </div>

            <div className="product-accordions">
              <details className="accordion" open>
                <summary>الشحن والتوصيل</summary>
                <p>{site.shippingNote}</p>
                <p>
                  تتوفر نقاط استلام في {branches.length} فرعًا ضمن المحافظات المدرجة عند إتمام
                  الطلب. يتم الشحن بعد 24 ساعة من تثبيت الحجز، وتُؤكَّد تفاصيل التوصيل عبر واتساب.
                </p>
              </details>

              <details className="accordion">
                <summary>الدفع عبر شام كاش</summary>
                <p>{site.payment.description}</p>
                <p className="accordion__mono">اسم المحفظة: {site.payment.walletName}</p>
                <p className="accordion__mono">معرّف المحفظة: {site.payment.walletId}</p>
                <Link className="text-link" to="/checkout">
                  عرض تفاصيل الدفع
                  <ArrowLeftIcon width={16} height={16} />
                </Link>
              </details>

              <details className="accordion">
                <summary>الاستبدال والاستفسار</summary>
                <p>
                  لأي سؤال عن المنتج أو طلب الاستبدال، تواصلي معنا مباشرة عبر واتساب وسنساعدك
                  وفق حالة الطلب.
                </p>
                <a
                  className="text-link"
                  href={whatsappUrl(inquiryMessage)}
                  target="_blank"
                  rel="noreferrer"
                >
                  تواصلي عبر واتساب
                  <WhatsAppIcon width={17} height={17} />
                </a>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--cream related">
        <div className="container">
          <div className="related__head">
            <div>
              <span className="eyebrow">قد يناسبك أيضًا</span>
              <h2>من {category?.shortName ?? 'المجموعة'}</h2>
            </div>
            <Link className="text-link" to={`/shop?category=${product.category}`}>
              عرض المجموعة
              <ArrowLeftIcon width={18} height={18} />
            </Link>
          </div>
          <div className="product-grid">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
