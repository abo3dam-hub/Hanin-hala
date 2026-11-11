import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../lib/search';
import { formatPriceOrRequest } from '../lib/format';
import { CloseIcon, SearchIcon } from './Icons';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => searchProducts(query).slice(0, 6), [query]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('no-scroll');
    window.setTimeout(() => inputRef.current?.focus(), 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return createPortal(
    <div className="search-modal" role="dialog" aria-modal="true" aria-label="البحث في المنتجات">
      <button className="search-modal__backdrop" type="button" onClick={onClose} aria-label="إغلاق البحث" />
      <div className="search-modal__panel">
        <div className="search-modal__top">
          <form className="search-modal__form" onSubmit={submit} role="search">
            <SearchIcon width={22} height={22} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحثي عن منتج، مكوّن، أو حاجة لبشرتك..."
              aria-label="بحث"
            />
            {query && (
              <button type="button" className="search-modal__clear" onClick={() => setQuery('')}>
                مسح
              </button>
            )}
          </form>
          <button className="icon-button" type="button" onClick={onClose} aria-label="إغلاق البحث">
            <CloseIcon />
          </button>
        </div>

        <div className="search-modal__results" aria-live="polite">
          {!query.trim() && (
            <div className="search-suggestions">
              <span className="search-suggestions__label">اقتراحات سريعة</span>
              <div className="chip-row">
                {['تفتيح', 'ترطيب', 'حبوب', 'شعر', 'مكياج'].map((term) => (
                  <button key={term} type="button" className="chip" onClick={() => setQuery(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="search-empty">
              <p>لم نجد منتجًا مطابقًا لـ «{query}».</p>
              <Link to="/shop" onClick={onClose}>
                تصفّحي كل المنتجات
              </Link>
            </div>
          )}

          {results.length > 0 && (
            <>
              <ul className="search-results">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link to={`/product/${product.slug}`} onClick={onClose}>
                      <img src={product.imageSmall} alt="" width={64} height={64} loading="lazy" />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{formatPriceOrRequest(product.price)}</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="search-modal__all"
                onClick={() => {
                  onClose();
                  navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
                }}
              >
                عرض كل النتائج
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
