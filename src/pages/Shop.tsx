import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { searchProducts } from '../lib/search';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { CloseIcon, SearchIcon, SparkleIcon } from '../components/Icons';

const concernFilters = [
  'تفتيح',
  'حبوب',
  'ترطيب',
  'شد',
  'شعر',
  'مكياج',
  'تنحيف',
  'حساسية',
  'نضارة',
  'حماية من الشمس',
];

const sortOptions = [
  { value: 'featured', label: 'مختارات د. رهف' },
  { value: 'price-asc', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'name', label: 'الاسم: أبجديًا' },
];

const validCategories = new Set<string>(categories.map((category) => category.slug));
const validSorts = new Set<string>(sortOptions.map((option) => option.value));

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category') ?? '';
  const concernParam = searchParams.get('concern') ?? '';
  const sortParam = searchParams.get('sort') ?? 'featured';

  const activeCategory = validCategories.has(categoryParam) ? categoryParam : '';
  const activeConcern = concernFilters.includes(concernParam) ? concernParam : '';
  const activeSort = validSorts.has(sortParam) ? sortParam : 'featured';

  useDocumentMeta(
    'المتجر | د. رهف سلوم',
    `تسوّقي ${products.length} منتجًا من مجموعات العناية بالبشرة، الشعر، الميكاب الطبي، والتنحيف، مصنوعة يدويًا بإشراف د. رهف زهير سلوم.`,
    { image: '/images/products/17014.webp' },
  );

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => setSearchParams({}, { replace: true });

  const filtered = useMemo(() => {
    const base = query.trim() ? searchProducts(query) : [...products];
    const list = base.filter((product) => {
      if (activeCategory && product.category !== activeCategory) return false;
      if (activeConcern && !product.concerns.includes(activeConcern)) return false;
      return true;
    });

    switch (activeSort) {
      case 'price-asc':
        return [...list].sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
      case 'price-desc':
        return [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      case 'name':
        return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      default:
        return list;
    }
  }, [query, activeCategory, activeConcern, activeSort]);

  const hasFilters = Boolean(query || activeCategory || activeConcern || activeSort !== 'featured');
  const activeCategoryName = categories.find((category) => category.slug === activeCategory)?.shortName;

  return (
    <>
      <section className="page-hero page-hero--shop">
        <span className="page-hero__orb" aria-hidden="true" />
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'المتجر' }]} />
            <span className="eyebrow">
              <SparkleIcon width={16} height={16} />
              مجموعة العناية
            </span>
            <h1>
              كل ما تحتاجينه،
              <em> في مكان واحد</em>
            </h1>
            <p>
              {products.length} منتجًا موزّعة على أربع مجموعات: العناية بالبشرة، العناية بالشعر،
              الميكاب الطبي، والتنحيف. كل منتج يُصنع يدويًا بإشراف د. رهف سلوم.
            </p>
            <div className="page-hero__meta">
              <span>{products.length} منتجًا</span>
              <span>{categories.length} مجموعات</span>
              <span>الأسعار بالليرة السورية</span>
            </div>
          </div>

          <div className="page-hero__art" aria-hidden="true">
            <div className="page-hero__arch">
              <img src="/images/products/17014.webp" alt="" width={700} height={900} fetchPriority="high" />
            </div>
            <div className="page-hero__float">
              <img src="/images/products/8415.webp" alt="" width={300} height={300} loading="lazy" />
            </div>
            <span className="page-hero__seal">صناعة يدوية</span>
          </div>
        </div>
      </section>

      <section className="shop-section">
        <div className="container">
          <div className="shop-toolbar">
            <form className="shop-search" role="search" onSubmit={(event) => event.preventDefault()}>
              <SearchIcon width={21} height={21} />
              <input
                type="search"
                value={query}
                onChange={(event) => updateParam('q', event.target.value)}
                placeholder="ابحثي عن منتج، مكوّن، أو حاجة لبشرتك..."
                aria-label="البحث في المنتجات"
              />
              {query && (
                <button type="button" className="shop-search__clear" onClick={() => updateParam('q', '')}>
                  <CloseIcon width={15} height={15} />
                  <span>مسح</span>
                </button>
              )}
            </form>

            <div className="shop-sort">
              <label htmlFor="shop-sort">ترتيب حسب</label>
              <select
                id="shop-sort"
                value={activeSort}
                onChange={(event) => updateParam('sort', event.target.value === 'featured' ? '' : event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="shop-filters">
            <div className="filter-group">
              <span className="filter-label">المجموعة</span>
              <div className="chip-row">
                <button
                  type="button"
                  className={`chip${!activeCategory ? ' is-active' : ''}`}
                  onClick={() => updateParam('category', '')}
                  aria-pressed={!activeCategory}
                >
                  الكل
                </button>
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    className={`chip${activeCategory === category.slug ? ' is-active' : ''}`}
                    onClick={() => updateParam('category', category.slug)}
                    aria-pressed={activeCategory === category.slug}
                  >
                    {category.shortName}
                    <small>{category.count}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">الحاجة</span>
              <div className="chip-row chip-row--scroll">
                <button
                  type="button"
                  className={`chip${!activeConcern ? ' is-active' : ''}`}
                  onClick={() => updateParam('concern', '')}
                  aria-pressed={!activeConcern}
                >
                  كل الحاجات
                </button>
                {concernFilters.map((concern) => (
                  <button
                    key={concern}
                    type="button"
                    className={`chip${activeConcern === concern ? ' is-active' : ''}`}
                    onClick={() => updateParam('concern', concern)}
                    aria-pressed={activeConcern === concern}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="shop-meta" aria-live="polite">
            <p>
              <strong>{filtered.length}</strong> من {products.length} منتجًا
              {activeCategoryName ? ` — ${activeCategoryName}` : ''}
              {activeConcern ? ` — ${activeConcern}` : ''}
            </p>
            {hasFilters && (
              <button type="button" className="text-button" onClick={clearFilters}>
                مسح كل الفلاتر
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="product-grid">
              {filtered.map((product, index) => (
                <Reveal key={product.id} delay={(index % 4) * 50}>
                  <ProductCard product={product} priority={index < 4} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state--shop">
              <span className="empty-state__icon">
                <SearchIcon width={32} height={32} />
              </span>
              <h2>لا توجد منتجات مطابقة</h2>
              <p>
                جرّبي كلمة بحث أخرى أو امسحي الفلاتر لتصفّحي المجموعة كاملة. ويمكنك دائمًا سؤال
                د. رهف مباشرة عن المنتج الأنسب لكِ.
              </p>
              <div className="empty-state__actions">
                <button type="button" className="button button--primary" onClick={clearFilters}>
                  عرض كل المنتجات
                </button>
                <Link className="button button--ghost" to="/contact">
                  استشارة مجانية
                </Link>
              </div>
            </div>
          )}

          <div className="shop-footnote">
            <p>
              الأسعار معروضة بالليرة السورية. لا تُضاف أجرة توصيل إلى الإجمالي على الموقع،
              ويُشحن الطلب بعد 24 ساعة من تثبيت الحجز. المنتجات التي لا يظهر لها سعر متاحة
              بالاستفسار المباشر.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
