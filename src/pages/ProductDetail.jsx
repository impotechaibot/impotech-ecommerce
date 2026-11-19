/**
 * ProductDetail.jsx — ইম্পোটেক প্রোডাক্ট পেজ (v18)
 * ------------------------------------------------------------
 * বসানোর পাথ:  src/pages/ProductDetail.jsx   (রিপ্লেস)
 *
 * v18 = মোবাইল-ফার্স্ট লেআউট (ghorerbazar.com-এর মতো গোছানো)
 *       + অ্যাডমিন থেকে বেছে নেওয়া লেআউট ভ্যারিয়েন্ট
 *       + থিম কালার (var(--accent)) — আর কোনো হার্ডকোড রঙ নেই
 *
 * মোবাইলে যা ঠিক করা হয়েছে:
 *   ১. ডানের কালো ফাঁকা জায়গা — overflow-x গার্ড (CSS) + min-w-0
 *   ২. ছবি মোবাইলে কার্ডের কিনারা পর্যন্ত, ১:১ অনুপাত
 *   ৩. বর্ণনা line-height ১.৮৫, প্যারাগ্রাফে ভাঙা
 *   ৪. বাটন ৪৮px উঁচু, পুরো প্রস্থ — আঙুলে ঠিক
 *   ৫. সেকশনে আলাদা কার্ড + শ্যাডো — সব মিশে যায় না
 *   ৬. ট্যাব মোবাইলে সমান ভাগে
 *   ৭. নিচে ভাসমান কার্ট বার (অ্যাডমিন থেকে বন্ধ করা যায়)
 *   ৮. ফন্ট সাইজ ও স্পেসিং স্কেল — ছোট স্ক্রিনে চাপাচাপি নেই
 *
 * অক্ষত (গুরুত্বপূর্ণ):
 *   - ভিডিও প্লে মোড: autoPlay + muted + loop + playsInline + controls={false},
 *     নিজের মিউট বাটন, একাধিক ভিডিওর থাম্বনেইল স্ট্রিপ
 *   - product.free_delivery === true হলে ফ্রি ডেলিভারি ব্যাজ
 *   - হাব-ভিত্তিক ডেলিভারি চার্জ: lib/delivery.js ও Checkout.jsx-এ — এখানে ছোঁয়া হয়নি
 *   - থিম কালার: সব রঙ var(--accent) / var(--accent-soft) থেকে
 * ------------------------------------------------------------
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw,
  ChevronLeft, ChevronRight, Play, Volume2, VolumeX, ZoomIn, X, Star,
  BadgeCheck, Phone, MessageCircle, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { localdb } from '../lib/localdb.js';
import { supabase } from '../lib/supabase.js';
import { money, discountPercent, stockStatus, dateBn, toBn } from '../lib/format.js';
import { productJsonLd } from '../lib/seo.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import {
  resolveLayout, toBullets,
  GALLERY_CLASS, DENSITY_CLASS, TITLE_CLASS, PRICE_CLASS, BUTTON_CLASS, DESC_CLASS,
} from '../lib/layout.js';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';
import '../styles/ProductDetail.css';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://impotech.sellsull.com';

/* অ্যারে না হলে নিরাপদে খালি অ্যারে */
const asArray = (v) => (Array.isArray(v) ? v : []);

/* ছোট তারকা সারি */
function Stars({ value = 0, size = 15 }) {
  const v = Math.round(Number(value) || 0);
  return (
    <span className="stars" aria-label={`${v} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= v ? '' : 'off'}
          fill={i <= v ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    products, categories, addToCart, toggleWishlist, wishlist,
    loading, isSupabaseConfigured, settings,
  } = useStore();

  /* অ্যাডমিনের লেআউট সেটিং */
  const { config: site } = useSiteConfig();
  const L = useMemo(() => resolveLayout(site?.layout), [site?.layout]);
  const D = DENSITY_CLASS[L.density] || DENSITY_CLASS.cozy;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState('');
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState('desc');
  const [muted, setMuted] = useState(true);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null);

  /* ---------- প্রোডাক্ট লোড ---------- */
  useEffect(() => {
    const found = products.find((p) => p.slug === slug || p.id === slug) || null;
    setProduct(found);
    setActiveImg(0);
    setActiveVideo(0);
    setQty(1);
    setVariant('');
    setTab('desc');
    if (found) {
      try {
        setReviews(localdb.listReviews(found.id) || []);
      } catch {
        setReviews([]);
      }
    }
  }, [slug, products, isSupabaseConfigured]);

  const images = useMemo(() => asArray(product?.images).filter(Boolean), [product]);
  const videos = useMemo(() => asArray(product?.videos).filter(Boolean), [product]);
  const off = product ? discountPercent(product.price, product.old_price) : 0;
  const stock = product ? stockStatus(product.stock) : { label: '', tone: 'in' };
  const wished = product ? asArray(wishlist).some((w) => w.id === product.id) : false;

  /* v11: এই প্রোডাক্টে ফ্রি ডেলিভারি চালু কি না */
  const freeDelivery = product?.free_delivery === true;

  /* ক্যাটাগরির নাম */
  const category = useMemo(() => {
    if (!product) return null;
    if (product.categories) return product.categories;
    return asArray(categories).find((c) => c.id === product.category_id) || null;
  }, [product, categories]);

  const related = useMemo(
    () =>
      product
        ? asArray(products)
            .filter((p) => p.category_id === product.category_id && p.id !== product.id)
            .slice(0, 4)
        : [],
    [products, product]
  );

  const bundleMate = related[0] || null;
  const bundleTotal =
    product && bundleMate
      ? Number(product.price || 0) + Number(bundleMate.price || 0)
      : 0;

  const avgRating = useMemo(() => {
    if (!reviews.length) return Number(product?.rating || 0);
    return reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
  }, [reviews, product]);

  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const n = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      d[n - 1] += 1;
    });
    return d;
  }, [reviews]);

  const totalReviews = reviews.length;
  const reviewCount = totalReviews || Number(product?.reviews_count || 0);
  const recommendPct = totalReviews
    ? Math.round((reviews.filter((r) => Number(r.rating) >= 4).length / totalReviews) * 100)
    : 0;

  /* ---------- ভিডিও অটোপ্লে (আগের মোড অপরিবর্তিত) ---------- */
  useEffect(() => {
    if (tab !== 'video') return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, [tab, activeVideo, muted, videos.length]);

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">পণ্যটি পাওয়া যায়নি</h1>
        <p className="mt-2 text-ink-muted">সম্ভবত লিংকটি ভুল বা পণ্যটি সরিয়ে ফেলা হয়েছে।</p>
        <Link to="/shop" className="btn-primary mt-6 inline-block">সব পণ্য দেখুন</Link>
      </div>
    );
  }

  /* ফোন নম্বর settings.contact-এ থাকে */
  const contact = settings?.contact || {};
  const phone = contact.phone || '';
  const waNumber = String(contact.whatsapp || phone).replace(/[^0-9]/g, '');

  const add = () => {
    if (Number(product.stock || 0) <= 0) {
      toast.error('পণ্যটি স্টকে নেই');
      return;
    }
    addToCart(product, qty, variant);
    toast.success('কার্টে যোগ হয়েছে');
  };

  const buyNow = () => {
    if (Number(product.stock || 0) <= 0) {
      toast.error('পণ্যটি স্টকে নেই');
      return;
    }
    addToCart(product, qty, variant);
    navigate('/checkout');
  };

  const wish = () => {
    toggleWishlist(product);
    toast.success(wished ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ হয়েছে');
  };

  const addBundle = () => {
    if (Number(product.stock || 0) <= 0) {
      toast.error('পণ্যটি স্টকে নেই');
      return;
    }
    addToCart(product, qty, variant);
    if (bundleMate) addToCart(bundleMate, 1, '');
    toast.success('দুটোই কার্টে যোগ হয়েছে');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim()) return toast.error('আপনার নাম লিখুন');
    if (!reviewForm.text.trim()) return toast.error('রিভিউ লিখুন');
    setSubmitting(true);
    try {
      const payload = {
        product_id: product.id,
        customer_name: reviewForm.name.trim(),
        rating: Number(reviewForm.rating),
        text: reviewForm.text.trim(),
        status: 'pending',
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('reviews').insert(payload);
        if (error) throw error;
      } else {
        localdb.insert('reviews', payload);
        setReviews(localdb.listReviews(product.id) || []);
      }

      toast.success('রিভিউ পাঠানো হয়েছে — অনুমোদনের পর দেখা যাবে');
      setReviewForm({ name: '', text: '', rating: 5 });
    } catch (err) {
      toast.error(err?.message || 'রিভিউ পাঠানো যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const colors = asArray(product.colors);
  const features = asArray(product.features);
  const bullets = L.desc === 'bullets' ? toBullets(product.description) : [];
  const title = product.name_bn || product.name;

  return (
    <div className="pd-page">
      <div className="container-x pd-wrap">
        <Seo
          title={`${title} — ইম্পোটেক`}
          description={product.description || ''}
          image={images[0]}
          url={`${SITE_URL}/product/${product.slug}`}
          type="product"
          jsonLd={productJsonLd(product, SITE_URL)}
        />

        {/* ---------- ব্রেডক্রাম্ব ---------- */}
        <nav className="pd-crumbs" aria-label="ব্রেডক্রাম্ব">
          <Link to="/">হোম</Link>
          <ChevronRight size={12} />
          <Link to="/shop">শপ</Link>
          {category && (
            <>
              <ChevronRight size={12} />
              <Link to={`/shop?category=${product.category_id}`}>
                {category.name_bn || category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="crumb-now">{title}</span>
        </nav>

        {/* ---------- মূল কার্ড ---------- */}
        <div className={`pd-card ${D.card}`}>
          <div className={`pd-grid ${D.gap}`}>
            {/* ===== গ্যালারি ===== */}
            <div className="pd-gallery">
              <div className={`pd-main-img ${GALLERY_CLASS[L.gallery]}`}>
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[activeImg]}
                      alt={title}
                      loading="eager"
                      decoding="async"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom(true)}
                      className="pd-zoom"
                      aria-label="ছবি বড় করুন"
                    >
                      <ZoomIn size={16} />
                    </button>
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImg((v) => (v - 1 + images.length) % images.length)}
                          className="pd-nav prev"
                          aria-label="আগের ছবি"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImg((v) => (v + 1) % images.length)}
                          className="pd-nav next"
                          aria-label="পরের ছবি"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="pd-noimg">ছবি নেই</div>
                )}

                {off > 0 && <span className="pd-discount">-{toBn(off)}%</span>}
                {stock.tone === 'out' && <span className="pd-out">স্টক শেষ</span>}
              </div>

              {/* থাম্বনেইল */}
              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={i === activeImg ? 'on' : ''}
                      aria-label={`ছবি ${toBn(i + 1)}`}
                    >
                      <img src={img} alt="" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== তথ্য ===== */}
            <div className={`pd-info ${D.info}`}>
              {category && (
                <p className="pd-cat">{category.name_bn || category.name}</p>
              )}

              <div className={L.title === 'centered' ? 'text-center' : ''}>
                <h1 className={`pd-title ${TITLE_CLASS[L.title]}`}>{title}</h1>
                {product.name_bn && product.name && product.name_bn !== product.name && (
                  <p className="pd-en">{product.name}</p>
                )}
              </div>

              {/* রেটিং */}
              <div className={`pd-rating ${L.title === 'centered' ? 'center' : ''}`}>
                <Stars value={avgRating} />
                <span className="pd-rev">({toBn(reviewCount)} রিভিউ)</span>
                {product.badge && <span className="pd-tag accent">{product.badge}</span>}
              </div>

              {/* দাম */}
              <div className={`pd-price ${PRICE_CLASS[L.price]}`}>
                <b>{money(product.price)}</b>
                {Number(product.old_price || 0) > Number(product.price || 0) && (
                  <>
                    <s>{money(product.old_price)}</s>
                    <span className="pd-save">সাশ্রয় {toBn(off)}%</span>
                  </>
                )}
              </div>

              {/* স্টক */}
              <p className={`pd-stock ${stock.tone}`}>● {stock.label}</p>

              {/* ফ্রি ডেলিভারি */}
              {freeDelivery && (
                <div className="pd-free">
                  <BadgeCheck size={16} />
                  <div>
                    <b>এই পণ্যে ফ্রি ডেলিভারি</b>
                    <small>এই পণ্যের ডেলিভারি চার্জ সম্পূর্ণ ফ্রি</small>
                  </div>
                </div>
              )}

              {/* সংক্ষিপ্ত বর্ণনা */}
              {product.description && (
                <p className={`pd-desc ${DESC_CLASS[L.desc]}`}>{product.description}</p>
              )}

              {/* ভ্যারিয়েন্ট */}
              {colors.length > 0 && (
                <div className="pd-colors">
                  <p className="pd-label">রঙ / ভ্যারিয়েন্ট</p>
                  <div className="pd-color-row">
                    {colors.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setVariant(c)}
                        className={variant === c ? 'on' : ''}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* পরিমাণ */}
              <div className="pd-qty-wrap">
                <p className="pd-label">পরিমাণ</p>
                <div className="pd-qty">
                  <button
                    type="button"
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    aria-label="কমান"
                  >
                    <Minus size={15} />
                  </button>
                  <span>{toBn(qty)}</span>
                  <button
                    type="button"
                    onClick={() => setQty((v) => v + 1)}
                    aria-label="বাড়ান"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* বাটন */}
              <div className={`pd-buy ${BUTTON_CLASS[L.buttons]}`}>
                <button type="button" onClick={add} className="pd-add">
                  <ShoppingCart size={16} /> কার্টে যোগ করুন
                </button>
                <button type="button" onClick={buyNow} className="pd-buynow">
                  এখনই কিনুন
                </button>
                <button
                  type="button"
                  onClick={wish}
                  className={`pd-wish ${wished ? 'on' : ''}`}
                  aria-label="উইশলিস্ট"
                >
                  <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* WhatsApp / কল */}
              <div className="pd-contact">
                <a
                  href={
                    waNumber
                      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `আমি এই পণ্যটি নিতে চাই: ${title}`
                        )}`
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="pd-wa"
                >
                  <MessageCircle size={15} /> WhatsApp-এ অর্ডার
                </a>
                {phone && (
                  <a href={`tel:${phone}`} className="pd-call">
                    <Phone size={15} /> কল করুন
                  </a>
                )}
              </div>

              {/* সুবিধা */}
              <div className="pd-perks">
                {[
                  { icon: Truck, t: 'দ্রুত ডেলিভারি', s: '২–৪ দিন' },
                  { icon: ShieldCheck, t: 'নিরাপদ পেমেন্ট', s: 'COD সুবিধা' },
                  { icon: RotateCcw, t: '৭ দিনের রিটার্ন', s: 'শর্তসাপেক্ষে' },
                ].map((b, i) => (
                  <div key={i}>
                    <b.icon size={17} />
                    <span>
                      <b>{b.t}</b>
                      <small>{b.s}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- একসাথে কেনা হয় ---------- */}
        {bundleMate && (
          <div className={`pd-card pd-bundle ${D.section}`}>
            <h2>একসাথে বেশি কেনা হয়</h2>
            <div className="pd-bundle-row">
              <div className="pd-bundle-item">
                <div className="pd-bundle-img">
                  {images[0] && <img src={images[0]} alt="" loading="lazy" />}
                </div>
                <div>
                  <p>{title}</p>
                  <small>{money(product.price)}</small>
                </div>
              </div>

              <span className="pd-op">+</span>

              <div className="pd-bundle-item">
                <div className="pd-bundle-img">
                  {asArray(bundleMate.images)[0] && (
                    <img src={asArray(bundleMate.images)[0]} alt="" loading="lazy" />
                  )}
                </div>
                <div>
                  <p>{bundleMate.name_bn || bundleMate.name}</p>
                  <small>{money(bundleMate.price)}</small>
                </div>
              </div>

              <span className="pd-op">=</span>

              <div className="pd-bundle-total">
                <b>{money(bundleTotal)}</b>
                <button type="button" onClick={addBundle}>দুটোই কার্টে নিন</button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- ট্যাব ---------- */}
        <div className={`pd-tabs ${D.section}`}>
          <div className="pd-tab-head" role="tablist">
            {[
              { id: 'desc', label: 'বিবরণ' },
              { id: 'video', label: `ভিডিও${videos.length ? ` (${toBn(videos.length)})` : ''}` },
              { id: 'reviews', label: `রিভিউ (${toBn(reviewCount)})` },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={tab === t.id ? 'on' : ''}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="pd-tab-body">
            {/* --- বিবরণ --- */}
            {tab === 'desc' && (
              <div className="pd-desc-body">
                <h3>পণ্যের বিবরণ</h3>

                {bullets.length > 0 ? (
                  <ul className="pd-feat-list">
                    {bullets.map((b, i) => (
                      <li key={i}>
                        <Check size={15} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pd-long">
                    {product.description || 'এই পণ্যের বিস্তারিত বর্ণনা শীঘ্রই যোগ করা হবে।'}
                  </p>
                )}

                {features.length > 0 && (
                  <>
                    <h3>প্রধান বৈশিষ্ট্য</h3>
                    <ul className="pd-feat-list">
                      {features.map((f, i) => (
                        <li key={i}>
                          <Check size={15} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {product.tag && <p className="pd-tagline">ট্যাগ: {product.tag}</p>}
              </div>
            )}

            {/* --- ভিডিও: প্লে মোড আগের মতোই --- */}
            {tab === 'video' && (
              <div className="pd-video-body">
                {videos.length === 0 ? (
                  <div className="pd-empty">এই পণ্যের কোনো ভিডিও এখনো যোগ করা হয়নি।</div>
                ) : (
                  <>
                    <div className="pd-video-stage">
                      <video
                        ref={videoRef}
                        key={videos[activeVideo]}
                        src={videos[activeVideo]}
                        className="pd-main-video"
                        muted={muted}
                        autoPlay
                        loop
                        playsInline
                        controls={false}
                      />
                      <button
                        type="button"
                        onClick={() => setMuted((v) => !v)}
                        className="pd-mute"
                        aria-label={muted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
                      >
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                    </div>

                    {videos.length > 1 && (
                      <div className="pd-thumbs pd-vthumbs">
                        {videos.map((v, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setActiveVideo(i)}
                            className={i === activeVideo ? 'on' : ''}
                            aria-label={`ভিডিও ${toBn(i + 1)}`}
                          >
                            <video src={v} muted preload="metadata" />
                            <span className="pd-thumb-play">
                              <Play size={16} />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* --- রিভিউ --- */}
            {tab === 'reviews' && (
              <div className="pd-rev-body">
                <div className="pd-rev-sum">
                  <div className="pd-rev-score">
                    <b>{toBn((Math.round(avgRating * 10) / 10).toFixed(1))}</b>
                    <Stars value={avgRating} size={14} />
                    <small>{toBn(reviewCount)} রিভিউ</small>
                    <small>{toBn(recommendPct)}% সুপারিশ</small>
                  </div>

                  <div className="pd-rev-bars">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const c = dist[n - 1];
                      const pct = totalReviews ? Math.round((c / totalReviews) * 100) : 0;
                      return (
                        <div key={n} className="pd-bar-row">
                          <span>{toBn(n)}★</span>
                          <div className="pd-bar">
                            <i style={{ width: `${pct}%` }} />
                          </div>
                          <em>{toBn(c)}</em>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={submitReview} className="pd-rev-form">
                  <h3>আপনার রিভিউ লিখুন</h3>
                  <div className="pd-rev-fields">
                    <input
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="আপনার নাম"
                      aria-label="আপনার নাম"
                    />
                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))
                      }
                      aria-label="রেটিং"
                    >
                      <option value={5}>৫ — চমৎকার</option>
                      <option value={4}>৪ — ভালো</option>
                      <option value={3}>৩ — মাঝারি</option>
                      <option value={2}>২ — খারাপ</option>
                      <option value={1}>১ — খুব খারাপ</option>
                    </select>
                  </div>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="পণ্যটি সম্পর্কে আপনার মতামত লিখুন"
                    rows={3}
                    aria-label="রিভিউ"
                  />
                  <button type="submit" disabled={submitting} className="pd-rev-submit">
                    {submitting ? 'পাঠানো হচ্ছে…' : 'রিভিউ জমা দিন'}
                  </button>
                </form>

                <div className="pd-rev-list">
                  {reviews.length === 0 ? (
                    <p className="pd-empty">এখনো কোনো রিভিউ নেই।</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="pd-rev-item">
                        <div className="pd-rev-head">
                          <div className="pd-rev-who">
                            <span className="pd-avatar">
                              {(r.customer_name || '?').charAt(0)}
                            </span>
                            <div>
                              <p>{r.customer_name}</p>
                              <small>{dateBn(r.created_at)}</small>
                            </div>
                          </div>
                          <Stars value={r.rating} size={13} />
                        </div>
                        <p className="pd-rev-text">{r.text || r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------- সম্পর্কিত পণ্য ---------- */}
        {related.length > 0 && (
          <section className={`pd-related ${D.section}`}>
            <div className="pd-related-head">
              <h2>সম্পর্কিত পণ্য</h2>
              <Link to="/shop">আরও পণ্য →</Link>
            </div>
            <div className="pd-related-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ---------- মোবাইল স্টিকি বার ---------- */}
      {L.stickyBar && (
        <div className="pd-sticky">
          <div className="pd-sticky-price">
            <b>{money(product.price)}</b>
            {off > 0 && <s>{money(product.old_price)}</s>}
          </div>
          <button type="button" onClick={add} className="pd-sticky-add">
            <ShoppingCart size={16} /> কার্টে যোগ
          </button>
          <button type="button" onClick={buyNow} className="pd-sticky-buy">
            কিনুন
          </button>
        </div>
      )}

      {/* ---------- জুম মোডাল ---------- */}
      {zoom && images[activeImg] && (
        <div className="pd-zoom-wrap" onClick={() => setZoom(false)}>
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="pd-zoom-close"
            aria-label="বন্ধ"
          >
            <X size={22} />
          </button>
          <img src={images[activeImg]} alt={title} />
        </div>
      )}
    </div>
  );
}
