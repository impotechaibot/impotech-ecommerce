import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Toast from './components/Toast.jsx';
import ThemeLayer from './components/ThemeLayer.jsx';
import SeoLayer from './components/SeoLayer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Search from './pages/Search.jsx';
import CartPage from './pages/CartPage.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import Track from './pages/Track.jsx';
import ContentPage from './pages/ContentPage.jsx';
import Admin from './pages/Admin.jsx';
import { useBackground } from './hooks/useBackground.js';

// Scroll to top on every route change (except hash links).
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// Applies the admin-chosen background to every route.
const BackgroundLayer = () => {
  const { config } = useBackground();
  const style =
    config.type === 'image' && config.image
      ? {
          backgroundColor: config.color,
          backgroundImage: `url(${config.image})`,
        }
      : { backgroundColor: config.color || '#08080a' };

  return (
    <>
      <div className="app-bg" style={style} />
      <div
        className="app-bg-overlay"
        style={{ opacity: config.type === 'image' ? config.overlay / 100 : 0 }}
      />
    </>
  );
};

const App = () => (
  <div className="App">
    <ThemeLayer />
    <SeoLayer />
    <BackgroundLayer />
    <ScrollToTop />
    <Navbar />

    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track" element={<Track />} />
        <Route path="/page/:slug" element={<ContentPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </main>

    <Footer />
    <CartDrawer />
    <Toast />
  </div>
);

export default App;
