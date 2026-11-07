import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiPhone,
  FiGrid,
} from 'react-icons/fi';
import { selectWishlist } from '../redux-state/Store.js';
import { useCartWithProducts } from '../hooks/useCartWithProducts.js';
import { uiActions } from '../redux-state/UiState.js';
import { useDispatch } from 'react-redux';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useCategories } from '../hooks/useCategories.js';
import logo from '../assets/logo.png';
import '../styles/Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'হোম', end: true },
  { to: '/products?sort=flash', label: 'ফ্ল্যাশ সেল', hot: true },
  { to: '/products', label: 'সব পণ্য' },
  { to: '/products?category=riding-gear', label: 'রাইডিং গিয়ার' },
  { to: '/track', label: 'অর্ডার ট্র্যাকিং' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { config: site } = useSiteConfig();
  const { categories } = useCategories();
  const contact = site.contact;
  const NAV_LINKS = site.nav;
  const { count: cartCount } = useCartWithProducts();
  const wishlist = useSelector(selectWishlist);
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [search, setSearch] = useState('');
  const catRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  useEffect(() => {
    const onClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setDrawer(false);
  };

  return (
    <>
      {/* top utility bar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <span className="topbar-tag">🇨🇳 চায়না থেকে সরাসরি আমদানি</span>
          <div className="topbar-right">
            <a href={`tel:${contact.phone}`} className="topbar-phone">
              <FiPhone size={13} /> {contact.phone}
            </a>
            <Link to="/admin" className="topbar-admin">
              অ্যাডমিন
            </Link>
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="ইম্পোটেক হোম">
            <img src={site.logo || logo} alt={site.siteName} />
            <span>
              <b>{site.siteName}</b>
              <small>{site.siteNameEn}</small>
            </span>
          </Link>

          <form className="header-search" onSubmit={submitSearch} role="search">
            <FiSearch size={17} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="পণ্য খুঁজুন…"
              aria-label="পণ্য খুঁজুন"
            />
            <button type="submit" aria-label="সার্চ করুন">
              খুঁজুন
            </button>
          </form>

          <div className="header-actions">
            <Link to="/wishlist" className="icon-btn" aria-label="উইশলিস্ট">
              <FiHeart size={20} />
              {wishlist.length > 0 && (
                <span className="badge">{wishlist.length}</span>
              )}
            </Link>
            <button
              type="button"
              className="icon-btn"
              onClick={() => dispatch(uiActions.openCart())}
              aria-label="কার্ট"
            >
              <FiShoppingBag size={20} />
              {cartCount > 0 && <span className="badge accent">{cartCount}</span>}
            </button>
            <Link to="/checkout" className="icon-btn user-btn" aria-label="একাউন্ট">
              <FiUser size={20} />
            </Link>
            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setDrawer(true)}
              aria-label="মেনু"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>

        {/* desktop nav */}
        <nav className="main-nav">
          <div className="container nav-inner">
            <div className="cat-drop" ref={catRef}>
              <button
                type="button"
                className="cat-btn"
                onClick={() => setCatOpen((v) => !v)}
                aria-expanded={catOpen}
              >
                <FiGrid size={16} /> সব ক্যাটাগরি
              </button>
              {catOpen && (
                <div className="cat-menu">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/products?category=${c.id}`}
                      onClick={() => setCatOpen(false)}
                    >
                      <img src={c.image} alt="" />
                      <span>{c.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="nav-links">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to + l.label}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `${l.hot ? 'hot' : ''} ${isActive ? 'active' : ''}`.trim()
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            <a href={`tel:${contact.phone}`} className="nav-phone">
              <FiPhone size={14} /> {contact.phone}
            </a>
          </div>
        </nav>
      </header>

      {/* mobile drawer */}
      <div
        className={`drawer-scrim ${drawer ? 'open' : ''}`}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />
      <aside className={`mobile-drawer ${drawer ? 'open' : ''}`}>
        <div className="drawer-head">
          <div className="brand small">
            <img src={site.logo || logo} alt="" />
            <span>
              <b>{site.siteName}</b>
              <small>{site.siteNameEn}</small>
            </span>
          </div>
          <button type="button" onClick={() => setDrawer(false)} aria-label="বন্ধ করুন">
            <FiX size={22} />
          </button>
        </div>

        <form className="drawer-search" onSubmit={submitSearch}>
          <FiSearch size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পণ্য খুঁজুন…"
          />
        </form>

        <div className="drawer-group">
          <p className="drawer-label">মেনু</p>
          {NAV_LINKS.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setDrawer(false)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="drawer-group">
          <p className="drawer-label">ক্যাটাগরি</p>
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              onClick={() => setDrawer(false)}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="drawer-group">
          <p className="drawer-label">অন্যান্য</p>
          <Link to="/wishlist" onClick={() => setDrawer(false)}>
            উইশলিস্ট ({wishlist.length})
          </Link>
          <Link to="/cart" onClick={() => setDrawer(false)}>
            কার্ট পেজ
          </Link>
          <Link to="/admin" onClick={() => setDrawer(false)}>
            অ্যাডমিন প্যানেল
          </Link>
        </div>

        <a href={`tel:${contact.phone}`} className="drawer-call">
          <FiPhone size={16} /> {contact.phone}
        </a>
      </aside>
    </>
  );
};

export default Navbar;
