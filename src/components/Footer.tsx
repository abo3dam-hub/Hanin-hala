import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { site } from '../data/site';
import { buildGeneralMessage, whatsappUrl } from '../lib/whatsapp';
import { WhatsAppIcon } from './Icons';

export const Footer = () => (
  <footer className="site-footer">
    <div className="container footer-main">
      <div className="footer-brand">
        <Link to="/" aria-label={`${site.name} — الصفحة الرئيسية`}>
          <img src="/images/brand/logo.png" alt={site.name} width={500} height={248} loading="lazy" />
        </Link>
        <p>
          منتجات عناية طبيعية تُصنع يدويًا بخبرة الدكتورة رهف زهير سلوم، صيدلانية وأخصائية عناية
          بالبشرة، وبإشرافها المباشر.
        </p>
        <a className="footer-whatsapp" href={whatsappUrl(buildGeneralMessage())} target="_blank" rel="noreferrer">
          <WhatsAppIcon width={20} height={20} />
          {site.whatsappDisplay}
        </a>
      </div>

      <div className="footer-column">
        <h3>تسوّقي</h3>
        <Link to="/shop">كل المنتجات</Link>
        {categories.map((category) => (
          <Link key={category.slug} to={`/shop?category=${category.slug}`}>
            {category.shortName}
          </Link>
        ))}
      </div>

      <div className="footer-column">
        <h3>العلامة</h3>
        <Link to="/about">عن د. رهف سلوم</Link>
        <Link to="/contact">الاستشارة والتواصل</Link>
        <Link to="/cart">سلة التسوق</Link>
        <Link to="/privacy">الخصوصية والشحن</Link>
      </div>

      <div className="footer-column footer-contact">
        <h3>معلومات مفيدة</h3>
        <p>نقاط استلام في معظم المحافظات السورية.</p>
        <p>الشحن بعد 24 ساعة من تثبيت الحجز.</p>
        <p>الدفع عبر {site.payment.name} ثم التأكيد على واتساب.</p>
        <span className="footer-currency">جميع الأسعار بالليرة السورية</span>
      </div>
    </div>

    <div className="container footer-bottom">
      <p>© 2026 {site.name}. جميع الحقوق محفوظة.</p>
      <p>عناية تُصنع بعناية.</p>
    </div>
  </footer>
);
