import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiLock,
  FiUnlock,
  FiImage,
  FiDroplet,
  FiCheck,
  FiRotateCcw,
  FiArrowLeft,
  FiUploadCloud,
  FiTrash2,
  FiPackage,
  FiLayers,
  FiGrid,
  FiShoppingBag,
  FiTag,
  FiStar,
  FiHome,
  FiMenu,
  FiFileText,
  FiSettings,
  FiSliders,
  FiPhone,
  FiCreditCard,
  FiSearch,
  FiDatabase,
  FiKey,
} from 'react-icons/fi';
import {
  useBackground,
  COLOR_PRESETS,
  DEFAULT_BG,
} from '../hooks/useBackground.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { slides, banners } from '../productsStore/Store.js';
import { useProducts } from '../hooks/useProducts.js';
import { useCategories } from '../hooks/useCategories.js';
import { useOrders } from '../hooks/useOrders.js';
import { useCoupons } from '../hooks/useCoupons.js';
import { useReviews } from '../hooks/useReviews.js';
import ProductAdmin from '../components/ProductAdmin.jsx';
import CategoryAdmin from '../components/admin/CategoryAdmin.jsx';
import OrderAdmin from '../components/admin/OrderAdmin.jsx';
import CouponAdmin from '../components/admin/CouponAdmin.jsx';
import ReviewAdmin from '../components/admin/ReviewAdmin.jsx';
import HomeAdmin from '../components/admin/HomeAdmin.jsx';
import NavAdmin from '../components/admin/NavAdmin.jsx';
import ContentAdmin from '../components/admin/ContentAdmin.jsx';
import SiteSettingsAdmin from '../components/admin/SiteSettingsAdmin.jsx';
import ThemeAdmin from '../components/admin/ThemeAdmin.jsx';
import ContactAdmin from '../components/admin/ContactAdmin.jsx';
import CheckoutAdmin from '../components/admin/CheckoutAdmin.jsx';
import SeoAdmin from '../components/admin/SeoAdmin.jsx';
import BackupAdmin from '../components/admin/BackupAdmin.jsx';
import AdminSettings from '../components/admin/AdminSettings.jsx';
import '../styles/Admin.css';
import '../styles/AdminSections.css';

// Client-side password gate. This only keeps casual visitors out of the panel —
// it is deliberately NOT a security boundary for real data (see README).
const AUTH_KEY = 'impotech_admin_auth';

const IMAGE_PRESETS = [
  ...slides.map((s, i) => ({ id: 'slide-' + i, label: 'হিরো ' + (i + 1), value: s.image })),
  ...banners.map((b, i) => ({ id: 'banner-' + i, label: 'ব্যানার ' + (i + 1), value: b.image })),
];

// Grouped tab definition — label + icon + which component renders it.
const TABS = [
  { group: 'ক্যাটালগ', items: [
    { id: 'products', label: 'প্রোডাক্ট', icon: FiPackage },
    { id: 'categories', label: 'ক্যাটাগরি', icon: FiGrid },
    { id: 'orders', label: 'অর্ডার', icon: FiShoppingBag },
    { id: 'coupons', label: 'কুপন', icon: FiTag },
    { id: 'reviews', label: 'রিভিউ', icon: FiStar },
  ] },
  { group: 'সাইট', items: [
    { id: 'home', label: 'হোম পেজ', icon: FiHome },
    { id: 'nav', label: 'মেনু', icon: FiMenu },
    { id: 'content', label: 'পেজ কনটেন্ট', icon: FiFileText },
    { id: 'site', label: 'সাইট সেটিংস', icon: FiSettings },
    { id: 'theme', label: 'থিম', icon: FiSliders },
    { id: 'background', label: 'ব্যাকগ্রাউন্ড', icon: FiDroplet },
  ] },
  { group: 'সেটআপ', items: [
    { id: 'contact', label: 'যোগাযোগ', icon: FiPhone },
    { id: 'checkout', label: 'চেকআউট', icon: FiCreditCard },
    { id: 'seo', label: 'SEO', icon: FiSearch },
    { id: 'backup', label: 'ব্যাকআপ', icon: FiDatabase },
    { id: 'settings', label: 'অ্যাডমিন', icon: FiKey },
  ] },
];

const Admin = () => {
  const { config: site, save: saveSite } = useSiteConfig();
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === 'yes'
  );
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('products');
  const { config, save, reset } = useBackground();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { orders } = useOrders();
  const { coupons } = useCoupons();
  const { reviews } = useReviews();
  const [draft, setDraft] = useState(config);
  const [saved, setSaved] = useState(false);

  const ADMIN_PASSWORD = site?.admin?.password || 'impotech2026';

  const login = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'yes');
      setAuthed(true);
      setErr('');
      setDraft(config);
    } else {
      setErr('পাসওয়ার্ড মিলেনি');
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPw('');
  };

  // Downscale uploads so a photo always fits inside localStorage (~5MB quota).
  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('শুধু ছবি ফাইল আপলোড করুন');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.82);
        setDraft((d) => ({ ...d, type: 'image', image: data }));
        setErr('');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const commit = () => {
    save(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const doReset = () => {
    reset();
    setDraft(DEFAULT_BG);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  /* ---------------- login screen ---------------- */
  if (!authed) {
    return (
      <div className="admin-gate">
        <form className="gate-card" onSubmit={login}>
          <div className="gate-ico">
            <FiLock size={24} />
          </div>
          <h1>অ্যাডমিন প্যানেল</h1>
          <p>সাইট ম্যানেজ করতে পাসওয়ার্ড দিন।</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="পাসওয়ার্ড"
            autoComplete="off"
            aria-label="পাসওয়ার্ড"
          />
          {err && <p className="gate-err">{err}</p>}
          <button type="submit" className="btn-primary">
            <FiUnlock size={15} /> লগইন
          </button>
          <Link to="/" className="gate-back">
            <FiArrowLeft size={14} /> সাইটে ফিরে যান
          </Link>
        </form>
      </div>
    );
  }

  /* ---------------- admin panel ---------------- */
  const previewStyle = {
    backgroundColor: draft.type === 'color' ? draft.color : draft.color,
    backgroundImage:
      draft.type === 'image' && draft.image ? `url(${draft.image})` : 'none',
  };

  const counts = {
    products: products.length,
    categories: categories.length,
    orders: orders.length,
    coupons: coupons.length,
    reviews: reviews.length,
  };

  return (
    <div className="page admin-page">
      <div className="container">
        <div className="admin-head">
          <div>
            <h1>
              <FiLayers size={22} /> অ্যাডমিন প্যানেল
            </h1>
            <p>
              প্রোডাক্ট, অর্ডার, কনটেন্ট, থিম — সাইটের সব কিছু এখান থেকে
              ম্যানেজ করুন। সব পরিবর্তন সাথে সাথে সব পেজে প্রয়োগ হবে।
            </p>
          </div>
          <div className="admin-head-actions">
            <Link to="/" className="btn-ghost">
              <FiArrowLeft size={14} /> সাইট দেখুন
            </Link>
            <button type="button" className="btn-ghost" onClick={logout}>
              <FiLock size={14} /> লগআউট
            </button>
          </div>
        </div>

        <div className="admin-tabs" role="tablist">
          {TABS.map((g) => (
            <div className="tab-group" key={g.group}>
              <span className="tab-group-label">{g.group}</span>
              {g.items.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    className={tab === t.id ? 'on' : ''}
                    onClick={() => setTab(t.id)}
                  >
                    <Icon size={15} /> {t.label}
                    {counts[t.id] !== undefined && (
                      <span className="tab-count">{counts[t.id]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {tab === 'products' && <ProductAdmin />}
        {tab === 'categories' && <CategoryAdmin />}
        {tab === 'orders' && <OrderAdmin />}
        {tab === 'coupons' && <CouponAdmin />}
        {tab === 'reviews' && <ReviewAdmin />}
        {tab === 'home' && <HomeAdmin />}
        {tab === 'nav' && <NavAdmin />}
        {tab === 'content' && <ContentAdmin />}
        {tab === 'site' && <SiteSettingsAdmin />}
        {tab === 'theme' && <ThemeAdmin />}
        {tab === 'contact' && <ContactAdmin />}
        {tab === 'checkout' && <CheckoutAdmin />}
        {tab === 'seo' && <SeoAdmin />}
        {tab === 'backup' && <BackupAdmin />}
        {tab === 'settings' && <AdminSettings onLogout={logout} />}

        {tab === 'background' && (
        <div className="admin-grid">
          <div className="admin-controls">
            {/* preview */}
            <section className="ad-card">
              <h3>লাইভ প্রিভিউ</h3>
              <div className="ad-preview" style={previewStyle}>
                <div
                  className="ad-preview-overlay"
                  style={{ opacity: draft.overlay / 100 }}
                />
                <div className="ad-preview-content">
                  <span>ইম্পোটেক</span>
                  <b>প্রিমিয়াম বাইক অ্যাক্সেসরিজ</b>
                </div>
              </div>
            </section>

            {/* mode */}
            <section className="ad-card">
              <h3>
                <FiDroplet size={15} /> ব্যাকগ্রাউন্ডের ধরন
              </h3>
              <div className="ad-mode">
                <button
                  type="button"
                  className={draft.type === 'color' ? 'on' : ''}
                  onClick={() => setDraft({ ...draft, type: 'color' })}
                >
                  প্রিসেট রঙ
                </button>
                <button
                  type="button"
                  className={draft.type === 'image' ? 'on' : ''}
                  onClick={() => setDraft({ ...draft, type: 'image' })}
                >
                  <FiImage size={14} /> ছবি
                </button>
              </div>

              {draft.type === 'color' && (
                <div className="ad-swatches">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={draft.color === c.value ? 'on' : ''}
                      onClick={() => setDraft({ ...draft, color: c.value })}
                      title={c.label}
                    >
                      <span style={{ background: c.value }} />
                      {draft.color === c.value && <FiCheck size={13} />}
                      <em>{c.label}</em>
                    </button>
                  ))}
                  <label className="ad-custom-color">
                    <span>কাস্টম রঙ</span>
                    <input
                      type="color"
                      value={draft.color}
                      onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {draft.type === 'image' && (
                <>
                  <div className="ad-img-presets">
                    {IMAGE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={draft.image === p.value ? 'on' : ''}
                        onClick={() => setDraft({ ...draft, image: p.value })}
                      >
                        <img src={p.value} alt={p.label} />
                        <em>{p.label}</em>
                      </button>
                    ))}
                  </div>

                  <label className="ad-upload">
                    <FiUploadCloud size={20} />
                    <span>নিজের ছবি আপলোড করুন</span>
                    <small>JPG / PNG · অটো রিসাইজ হবে</small>
                    <input type="file" accept="image/*" onChange={onUpload} />
                  </label>

                  {draft.image && draft.image.startsWith('data:') && (
                    <button
                      type="button"
                      className="ad-clear-img"
                      onClick={() => setDraft({ ...draft, image: '' })}
                    >
                      <FiTrash2 size={14} /> আপলোড করা ছবি সরান
                    </button>
                  )}
                </>
              )}
            </section>

            {/* overlay */}
            <section className="ad-card">
              <h3>ওভারলে ডার্কনেস</h3>
              <input
                type="range"
                min={0}
                max={95}
                value={draft.overlay}
                onChange={(e) =>
                  setDraft({ ...draft, overlay: Number(e.target.value) })
                }
                aria-label="ওভারলে"
              />
              <p className="ad-range-val">{draft.overlay}%</p>
              <p className="ad-hint">
                বেশি ডার্কনেস মানে টেক্সট আরও পড়ার উপযোগী হবে।
              </p>
            </section>

            <div className="ad-actions">
              <button type="button" className="btn-primary" onClick={commit}>
                {saved ? <FiCheck size={15} /> : null}
                {saved ? 'সেভ হয়েছে' : 'সেভ করুন'}
              </button>
              <button type="button" className="btn-ghost" onClick={doReset}>
                <FiRotateCcw size={14} /> রিসেট
              </button>
            </div>
          </div>

          <aside className="admin-side">
            <section className="ad-card">
              <h3>কীভাবে কাজ করে</h3>
              <p className="ad-hint">
                সেটিংস <code>localStorage['impotech_bg']</code>-এ JSON হিসেবে সেভ হয়।
                হোম পেজ লোড হওয়ার সময় এই মান পড়ে ব্যাকগ্রাউন্ডে প্রয়োগ করা হয়। অন্য
                ট্যাবে বদলালেও <code>storage</code> ইভেন্টে সাথে সাথে আপডেট হয়।
              </p>
              <pre className="ad-code">
{JSON.stringify(
  { type: draft.type, color: draft.color, overlay: draft.overlay },
  null,
  2
)}
              </pre>
            </section>

            <section className="ad-card">
              <h3>নিরাপত্তা নোট</h3>
              <p className="ad-hint">
                পাসওয়ার্ড গার্ডটি শুধুমাত্র ক্লায়েন্ট-সাইড (ডিফল্ট:{' '}
                <b>{ADMIN_PASSWORD}</b>)। এটি শুধু প্যানেল রক্ষা করে —
                প্রকৃত সুরক্ষার জন্য সার্ভার-সাইড অথেন্টিকেশন প্রয়োজন।
              </p>
            </section>
          </aside>
        </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
