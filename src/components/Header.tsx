import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { categories } from '../data/categories';
import { site } from '../data/site';
import { buildGeneralMessage, whatsappUrl } from '../lib/whatsapp';
import { useCart } from '../context/CartContext';
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  WhatsAppIcon,
} from './Icons';
import { SearchDialog } from './SearchDialog';

const navLinks = [
  { to: '/', label: 'الرئيسية' },
  { to: '/shop', label: 'المتجر' },
  { to: '/about', label: 'عن العلامة' },
  { to: '/contact', label: 'تواصلي' },
];

export const Header = () => {
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCategoriesOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setCategoriesOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        تخطي إلى المحتوى
      </a>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="announcement">
          <div className="container announcement__inner">
            <span>استشارة مجانية بالكامل عبر واتساب</span>
            <span className="announcement__dot" aria-hidden="true" />
            <span>توصيل إلى معظم المحافظات السورية</span>
            <a href={whatsappUrl(buildGeneralMessage())} target="_blank" rel="noreferrer">
              تواصلي معنا
            </a>
          </div>
        </div>

        <div className="container header-main">
          <Link className="brand" to="/" aria-label={`${site.name} — الصفحة الرئيسية`}>
            <img src="/images/brand/logo.png" alt={site.name} width={500} height={248} />
            <span className="brand__text">
              <strong>د. رهف سلوم</strong>
              <small>عناية بالبشرة والميكاب الطبي</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {navLinks.slice(0, 2).map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}

            <div
              className={`nav-dropdown${categoriesOpen ? ' is-open' : ''}`}
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                className="nav-dropdown__trigger"
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
                onClick={() => setCategoriesOpen((open) => !open)}
              >
                التصنيفات
                <ChevronDownIcon width={16} height={16} />
              </button>
              <div className="nav-dropdown__panel" role="menu">
                <div className="nav-dropdown__intro">
                  <span className="eyebrow">تسوّقي حسب الحاجة</span>
                  <p>أربع مجموعات مختارة للعناية بالبشرة، الشعر، الميكاب، والتنحيف.</p>
                  <Link to="/shop" className="text-link">
                    كل المنتجات
                  </Link>
                </div>
                <div className="nav-dropdown__links">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/shop?category=${category.slug}`}
                      role="menuitem"
                      className="nav-dropdown__link"
                    >
                      <img src={category.image} alt="" width={56} height={56} loading="lazy" />
                      <span>
                        <strong>{category.shortName}</strong>
                        <small>{category.count} منتجًا</small>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.slice(2).map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-button header-search"
              onClick={() => setSearchOpen(true)}
              aria-label="البحث في المنتجات"
            >
              <SearchIcon />
            </button>

            <a
              className="header-whatsapp"
              href={whatsappUrl(buildGeneralMessage())}
              target="_blank"
              rel="noreferrer"
              aria-label="التواصل عبر واتساب"
            >
              <WhatsAppIcon width={19} height={19} />
              <span>واتساب</span>
            </a>

            <button
              type="button"
              className="cart-button"
              onClick={openCart}
              aria-label={`سلة التسوق، ${totalItems} منتجًا`}
            >
              <BagIcon />
              {totalItems > 0 && <span className="cart-button__count">{totalItems}</span>}
            </button>

            <button
              type="button"
              className="icon-button mobile-toggle"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-nav" id="mobile-navigation">
          <nav aria-label="التنقل على الهاتف">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className="mobile-nav__link">
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mobile-nav__section">
            <span className="mobile-nav__label">التصنيفات</span>
            <div className="mobile-nav__categories">
              {categories.map((category) => (
                <Link key={category.slug} to={`/shop?category=${category.slug}`}>
                  <img src={category.image} alt="" width={52} height={52} loading="lazy" />
                  <span>
                    <strong>{category.shortName}</strong>
                    <small>{category.count} منتجًا</small>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mobile-nav__actions">
            <a
              className="button button--whatsapp"
              href={whatsappUrl(buildGeneralMessage())}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon width={20} height={20} />
              تواصلي عبر واتساب
            </a>
            <button type="button" className="button button--outline" onClick={openCart}>
              <BagIcon width={20} height={20} />
              سلة التسوق ({totalItems})
            </button>
          </div>

          <p className="mobile-nav__note">
            {site.whatsappDisplay}
            <br />
            استشارة مجانية • توصيل إلى معظم المحافظات السورية
          </p>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
