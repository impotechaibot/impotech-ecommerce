import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Track from './pages/Track.jsx';
import Account from './pages/Account.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import Blog from './pages/Blog.jsx';
import Faq from './pages/Faq.jsx';
import Policy from './pages/Policy.jsx';
import Contact from './pages/Contact.jsx';
import LandingPage from './pages/LandingPage.jsx';
import NotFound from './pages/NotFound.jsx';

/** রুট বদলালে উপরে স্ক্রল */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:code" element={<OrderSuccess />} />
          <Route path="/track" element={<Track />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/services" element={<Services />} />
          <Route path="/service/:slug" element={<ServiceDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/policy/:slug" element={<Policy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lp/:slug" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
