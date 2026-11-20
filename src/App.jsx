/* WhatsAppFloat.css — ভাসমান WhatsApp বাটনের স্টাইল
 * ------------------------------------------------------------
 * বসানোর পাথ:  src/styles/WhatsAppFloat.css
 *
 * মোবাইলে কনটেন্ট ঢেকে না ফেলার ব্যবস্থা:
 *   • বাটন ছোট (52px), ডান-নিচে
 *   • bottom-এ safe-area-inset যোগ — নচ/হোম-বারের উপরে থাকে
 *   • body-তে নিচে সমান padding (নিচের রুল) — ফুটারের শেষ লাইন ঢাকা পড়ে না
 */

.wa-float {
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 40;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  height: 52px;
  padding: 0 16px 0 14px;
  border-radius: 999px;

  background: #25d366;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;

  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28), 0 2px 6px rgba(37, 211, 102, 0.35);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.wa-float svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.wa-float:hover {
  background: #1fbe5b;
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32), 0 3px 8px rgba(37, 211, 102, 0.45);
}

.wa-float:active {
  transform: translateY(0);
}

.wa-float:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* ---------- মোবাইল: শুধু গোল আইকন, লেখা লুকানো ---------- */
@media (max-width: 640px) {
  .wa-float {
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    width: 52px;
    height: 52px;
    padding: 0;
    justify-content: center;
  }

  .wa-float-label {
    display: none;
  }
}

/* ---------- মোবাইলে ফুটারের শেষ অংশ ঢাকা না পড়ার জন্য ---------- */
@media (max-width: 640px) {
  body {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  }
}

/* ---------- প্রিন্টে বাটন দরকার নেই ---------- */
@media print {
  .wa-float {
    display: none !important;
  }
}

/* ---------- কম-মোশন পছন্দ যাদের ---------- */
@media (prefers-reduced-motion: reduce) {
  .wa-float {
    transition: none;
  }
  .wa-float:hover {
    transform: none;
  }
}
````

---

# ৪. `src/App.jsx` — ♻️ রিপ্লেস

````jsx
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
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
      {/* ভাসমান WhatsApp বাটন — সব পেজে, অ্যাডমিনে নিজেই লুকিয়ে যায় */}
      <WhatsAppFloat />
    </div>
  );
}
