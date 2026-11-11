import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { WhatsAppFloat } from './WhatsAppFloat';
import { ScrollToTop } from './ScrollToTop';

export const Layout = () => {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Header />
      <main id="main-content" className="page-shell" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </>
  );
};
