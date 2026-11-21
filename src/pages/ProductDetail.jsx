
/**
 * ProductDetail.jsx — ইম্পোটেক প্রোডাক্ট পেজ (v23)
 * ------------------------------------------------------------
 * WhatsApp country-code fix, theme CSS, mobile/desktop layout,
 * reviews, video, bundle, wishlist, cart, zoom and related products.
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
import { waLink, telLink } from '../lib/whatsapp.js';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';
import '../styles/ProductDetail.css';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://impotech.sellsull.com';

/* অ্যারে না হলে নিরাপদে খালি অ্যারে */
const asArray = (v) => (Array.isArray(v) ? v : []);

/* ছোট তারকা সারি */
function Stars({ value = 0, size = 14 }) {
  const v = Math.round(Number(value) || 0);

  return (
    <span className="stars">
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
    products,
    categories,
    addToCart,
    toggleWishlist,
    wishlist,
    loading,
    isSupabaseConfigured,
    settings,
  } = useStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState('');
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState('desc');
  const [muted, setMuted] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    text: '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);

  /* ---------- প্রোডাক্ট লোড ---------- */
  useEffect(() => {
    const found =
      products.find((p) => p.slug === slug || p.id === slug) || null;

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

  const images = useMemo(
    () => asArray(product?.images).filter(Boolean),
    [product]
  );

  const videos = useMemo(
    () => asArray(product?.videos).filter(Boolean),
    [product]
  );

  const off = product
    ? discountPercent(product.price, product.old_price)
    : 0;

  const stock = product
    ? stockStatus(product.stock)
    : { label: '', tone: 'in' };

  const wished = product
    ? asArray(wishlist).some((w) => w.id === product.id)
    : false;

  /* ফ্রি ডেলিভারি */
  const freeDelivery = product?.free_delivery === true;

  /* ক্যাটাগরির নাম */
  const category = useMemo(() => {
    if (!product) return null;

    if (product.categories) return product.categories;

    return (
      asArray(categories).find((c) => c.id === product.category_id) || null
    );
  }, [product, categories]);

  /* সম্পর্কিত পণ্য */
  const related = useMemo(
    () =>
      product
        ? asArray(products)
            .filter(
              (p) =>
                p.category_id === product.category_id &&
                p.id !== product.id
            )
            .slice(0, 4)
        : [],
    [products, product]
  );

  /* একসাথে কেনা হয় */
  const bundleMate = related[0] || null;

  const bundleTotal =
    product && bundleMate
      ? Number(product.price || 0) + Number(bundleMate.price || 0)
      : 0;

  /* গড় রেটিং */
  const avgRating = useMemo(() => {
    if (!reviews.length) return Number(product?.rating || 0);

    return (
      reviews.reduce((s, r) => s + Number(r.rating || 0), 0) /
      reviews.length
    );
  }, [reviews, product]);

  /* ৫★ → ১★ বিতরণ */
  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];

    reviews.forEach((r) => {
      const n = Math.min(
        5,
        Math.max(1, Math.round(Number(r.rating) || 5))
      );
      d[n - 1] += 1;
    });

    return d;
  }, [reviews]);

  const totalReviews = reviews.length;
  const reviewCount = totalReviews || Number(product?.reviews_count || 0);

  const recommendPct = totalReviews
    ? Math.round(
        (reviews.filter((r) => Number(r.rating) >= 4).length /
          totalReviews) *
          100
      )
    : 0;

  /* ---------- ভিডিও অটোপ্লে ---------- */
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
      <div className="pd-page">
        <div
          className="container-x pd-wrap"
          style={{ textAlign: 'center', paddingTop: 80 }}
        >
          <h1 className="pd-title" style={{ fontSize: 22 }}>
            পণ্যটি পাওয়া যায়নি
          </h1>

          <p className="pd-desc" style={{ marginTop: 8 }}>
            সম্ভবত লিংকটি ভুল বা পণ্যটি সরিয়ে ফেলা হয়েছে।
          </p>

          <Link
            to="/shop"
            className="btn-primary"
            style={{ marginTop: 20, display: 'inline-block' }}
          >
            সব পণ্য দেখুন
          </Link>
        </div>
      </div>
    );
  }

  /* ফোন নাম্বার settings.contact-এ */
  const contact = settings?.contact || {};
  const phone = contact.phone || '';

  /* WhatsApp country code fix */
  const waHref = waLink(
    contact.whatsapp || phone,
    `আমি এই পণ্যটি নিতে চাই: ${product.name_bn || product.name}`
  );

  const callHref = telLink(phone);

  /* ---------- কার্টে যোগ ---------- */
  const add = () => {
    if (Number(product.stock || 0) <= 0) {
      toast.error('পণ্যটি স্টকে নেই');
      return;
    }

    addToCart(product, qty, variant);
    toast.success('কার্টে যোগ হয়েছে');
  };

  /* ---------- এখনই কিনুন ---------- */
  const buyNow = () => {
    if (Number(product.stock || 0) <= 0) {
      toast.error('পণ্যটি স্টকে নেই');
      return;
    }

    addToCart(product, qty, variant);
    navigate('/checkout');
  };

  /* ---------- Wishlist ---------- */
  const wish = () => {
    toggleWishlist(product);
    toast.success(
      wished ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ হয়েছে'
    );
  };

  /* ---------- Bundle ---------- */
  const addBundle = () => {
    if (Number(product.stock || 0) <= 0) {
      toast.error('পণ্যটি স্টকে নেই');
      return;
    }

    addToCart(product, qty, variant);

    if (bundleMate) {
      addToCart(bundleMate, 1, '');
    }

    toast.success('দুটোই কার্টে যোগ হয়েছে');
  };

  /* ---------- রিভিউ সাবমিট ---------- */
  const submitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.name.trim()) {
      return toast.error('আপনার নাম লিখুন');
    }

    if (!reviewForm.text.trim()) {
      return toast.error('রিভিউ লিখুন');
    }

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
        const { error } = await supabase
          .from('reviews')
          .insert(payload);

        if (error) throw error;
      } else {
        localdb.insert('reviews', payload);
        setReviews(localdb.listReviews(product.id) || []);
      }

      toast.success('রিভিউ পাঠানো হয়েছে — অনুমোদনের পর দেখা যাবে');

      setReviewForm({
        name: '',
        text: '',
        rating: 5,
      });
    } catch (err) {
      toast.error(err?.message || 'রিভিউ পাঠানো যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const colors = asArray(product.colors);
  const features = asArray(product.features);

  return (
    <div className="pd-page">
      <div className="container-x pd-wrap">
        <Seo
          title={`${product.name_bn || product.name} — ইম্পোটেক`}
          description={product.description || ''}
          image={images[0]}
          url={`${SITE_URL}/product/${product.slug}`}
          type="product"
          jsonLd={productJsonLd(product, SITE_URL)}
        />

        {/* ---------- ব্রেডক্রাম্ব ---------- */}
        <nav className="pd-crumbs">
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
          <span className="crumb-now">
            {product.name_bn || product.name}
          </span>
        </nav>

        {/* ---------- মূল কার্ড: গ্যালারি + তথ্য ---------- */}
        <div className="pd-card" style={{ padding: 12 }}>
          <div className="pd-grid" style={{ gap: 16 }}>
            {/* ===== বাঁ: গ্যালারি ===== */}
            <div className="pd-gallery">
              <div className="pd-main-img" style={{ aspectRatio: '1 / 1' }}>
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[activeImg]}
                      alt={product.name_bn || product.name}
                    />

                    <button
                      type="button"
                      onClick={() => setZoom(true)}
                      className="pd-zoom"
                      aria-label="জুম"
                    >
                      <ZoomIn size={16} />
                    </button>

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImg(
                              (v) => (v - 1 + images.length) % images.length
                            )
                          }
                          className="pd-nav prev"
                          aria-label="আগের ছবি"
                        >
                          <ChevronLeft size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveImg((v) => (v + 1) % images.length)
                          }
                          className="pd-nav next"
                          aria-label="পরের ছবি"
                        >
                          <ChevronRight size={17} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="pd-noimg">ছবি নেই</div>
                )}

                {off > 0 && (
                  <span className="pd-discount">-{toBn(off)}%</span>
                )}

                {stock.tone === 'out' && (
                  <span className="pd-out">স্টক শেষ</span>
                )}
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
                    >
                      <img src={img} alt={`থাম্বনেইল ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== ডান: তথ্য ===== */}
            <div className="pd-info">
              {category && (
                <p className="pd-cat">
                  {category.name_bn || category.name}
                </p>
              )}

              <h1 className="pd-title" style={{ fontSize: 20, marginTop: 4 }}>
                {product.name_bn || product.name}
              </h1>

              {product.name_bn &&
                product.name &&
                product.name_bn !== product.name && (
                  <p className="pd-en">{product.name}</p>
                )}

              {/* রেটিং */}
              <div className="pd-rating" style={{ marginTop: 8 }}>
                <Stars value={avgRating} />
                <span className="pd-rev">
                  ({toBn(reviewCount)} রিভিউ)
                </span>
                {product.badge && (
                  <span className="pd-tag accent">{product.badge}</span>
                )}
              </div>

              {/* দাম */}
              <div className="pd-price" style={{ marginTop: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                    gap: 8,
                  }}
                >
                  <b>{money(product.price)}</b>

                  {Number(product.old_price || 0) >
                    Number(product.price || 0) && (
                    <>
                      <s>{money(product.old_price)}</s>
                      <span className="pd-save">
                        সাশ্রয় {toBn(off)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* স্টক */}
              <p
                className={`pd-stock ${stock.tone}`}
                style={{ marginTop: 8 }}
              >
                ● {stock.label}
              </p>

              {/* ফ্রি ডেলিভারি */}
              {freeDelivery && (
                <div className="pd-free" style={{ marginTop: 10 }}>
                  <BadgeCheck size={15} />
                  <div>
                    <b>এই পণ্যে ফ্রি ডেলিভারি</b>
                    <small>
                      এই পণ্যের ডেলিভারি চার্জ সম্পূর্ণ ফ্রি
                    </small>
                  </div>
                </div>
              )}

              {/* সংক্ষিপ্ত বর্ণনা */}
              {product.description && (
                <p className="pd-desc" style={{ marginTop: 10 }}>
                  {product.description}
                </p>
              )}

              {/* ভ্যারিয়েন্ট */}
              {colors.length > 0 && (
                <div style={{ marginTop: 14 }}>
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
              <div style={{ marginTop: 14 }}>
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

              {/* দুই বাটন */}
              <div
                className="pd-buy"
                style={{ display: 'flex', gap: 8, marginTop: 14 }}
              >
                <button type="button" onClick={add} className="pd-add">
                  <ShoppingCart size={16} /> কার্টে যোগ করুন
                </button>

                <button
                  type="button"
                  onClick={buyNow}
                  className="pd-buynow"
                >
                  এখনই কিনুন
                </button>

                <button
                  type="button"
                  onClick={wish}
                  className={`pd-wish ${wished ? 'on' : ''}`}
                  aria-label="উইশলিস্ট"
                >
                  <Heart
                    size={17}
                    fill={wished ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* WhatsApp / কল */}
              <div className="pd-contact" style={{ marginTop: 8 }}>
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-wa"
                  >
                    <MessageCircle size={15} /> WhatsApp-এ অর্ডার
                  </a>
                )}

                {callHref && (
                  <a href={callHref} className="pd-call">
                    <Phone size={15} /> কল করুন
                  </a>
                )}
              </div>

              {/* সুবিধা */}
              <div className="pd-perks" style={{ marginTop: 14 }}>
                {[
                  { icon: Truck, t: 'দ্রুত ডেলিভারি', s: '২–৪ দিন' },
                  { icon: ShieldCheck, t: 'নিরাপদ পেমেন্ট', s: 'COD সুবিধা' },
                  { icon: RotateCcw, t: '৭ দিনের রিটার্ন', s: 'শর্তসাপেক্ষে' },
                ].map((b, i) => (
                  <div key={i}>
                    <b.icon size={16} />
                    <div>
                      <b>{b.t}</b>
                      <small>{b.s}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- একসাথে কেনা হয় ---------- */}
        {bundleMate && (
          <div
            className="pd-card pd-bundle"
            style={{ padding: 12, marginTop: 12 }}
          >
            <h2>একসাথে বেশি কেনা হয়</h2>

            <div className="pd-bundle-row">
              <div className="pd-bundle-item">
                <div className="pd-bundle-img">
                  {images[0] && <img src={images[0]} alt="" />}
                </div>

                <div>
                  <p>{product.name_bn || product.name}</p>
                  <small>{money(product.price)}</small>
                </div>
              </div>

              <span className="pd-op">+</span>

              <div className="pd-bundle-item">
                <div className="pd-bundle-img">
                  {asArray(bundleMate.images)[0] && (
                    <img
                      src={asArray(bundleMate.images)[0]}
                      alt=""
                    />
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

                <button type="button" onClick={addBundle}>
                  দুটোই কার্টে নিন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- ট্যাব ---------- */}
        <div className="pd-tabs" style={{ marginTop: 12 }}>
          <div className="pd-tab-head">
            {[
              { id: 'desc', label: 'বিবরণ' },
              {
                id: 'video',
                label: `ভিডিও${videos.length ? ` (${toBn(videos.length)})` : ''}`,
              },
              {
                id: 'reviews',
                label: `রিভিউ (${toBn(reviewCount)})`,
              },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
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

                <p className="pd-long">
                  {product.description ||
                    'এই পণ্যের বিস্তারিত বর্ণনা শীঘ্রই যোগ করা হবে।'}
                </p>

                {features.length > 0 && (
                  <>
                    <h3>প্রধান বৈশিষ্ট্য</h3>

                    <ul className="pd-feat-list">
                      {features.map((f, i) => (
                        <li key={i}>
                          <Check size={14} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {product.tag && (
                  <p className="pd-tagline">ট্যাগ: {product.tag}</p>
                )}
              </div>
            )}

            {/* --- ভিডিও --- */}
            {tab === 'video' && (
              <div>
                {videos.length === 0 ? (
                  <div className="pd-empty">
                    এই পণ্যের কোনো ভিডিও এখনো যোগ করা হয়নি।
                  </div>
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
                        onClick={(e) => {
                          const v = e.currentTarget;

                          if (v.paused) v.play().catch(() => {});
                          else v.pause();
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setMuted((v) => !v)}
                        className="pd-mute"
                        aria-label={muted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
                      >
                        {muted ? (
                          <VolumeX size={17} />
                        ) : (
                          <Volume2 size={17} />
                        )}
                      </button>
                    </div>

                    {videos.length > 1 && (
                      <div
                        className="pd-thumbs pd-vthumbs"
                        style={{ marginTop: 10 }}
                      >
                        {videos.map((v, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setActiveVideo(i)}
                            className={i === activeVideo ? 'on' : ''}
                          >
                            <video src={v} muted preload="metadata" />

                            <span className="pd-thumb-play">
                              <Play size={15} />
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
              <div>
                {/* সারসংক্ষেপ */}
                <div className="pd-rev-sum">
                  <div className="pd-rev-score">
                    <b>
                      {toBn((Math.round(avgRating * 10) / 10).toFixed(1))}
                    </b>

                    <Stars value={avgRating} size={13} />

                    <small>{toBn(reviewCount)} রিভিউ</small>
                    <small>{toBn(recommendPct)}% সুপারিশ</small>
                  </div>

                  <div className="pd-rev-bars">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const c = dist[n - 1];
                      const pct = totalReviews
                        ? Math.round((c / totalReviews) * 100)
                        : 0;

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

                {/* রিভিউ ফর্ম */}
                <form onSubmit={submitReview} className="pd-rev-form">
                  <h3>আপনার রিভিউ লিখুন</h3>

                  <div className="pd-rev-fields">
                    <input
                      value={reviewForm.name}
                      onChange={(e) =>
                        setReviewForm((f) => ({
                          ...f,
                          name: e.target.value,
                        }))
                      }
                      placeholder="আপনার নাম"
                    />

                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm((f) => ({
                          ...f,
                          rating: Number(e.target.value),
                        }))
                      }
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
                    onChange={(e) =>
                      setReviewForm((f) => ({
                        ...f,
                        text: e.target.value,
                      }))
                    }
                    placeholder="পণ্যটি সম্পর্কে আপনার মতামত লিখুন"
                    rows={3}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="pd-rev-submit"
                  >
                    {submitting ? 'পাঠানো হচ্ছে…' : 'রিভিউ জমা দিন'}
                  </button>
                </form>

                {/* রিভিউ তালিকা */}
                <div className="pd-rev-list">
                  {reviews.length === 0 ? (
                    <p className="pd-tagline">এখনো কোনো রিভিউ নেই।</p>
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

                          <Stars value={r.rating} size={12} />
                        </div>

                        <p className="pd-rev-text">
                          {r.text || r.comment}
                        </p>
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
          <section style={{ marginTop: 18 }}>
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
      <div className="pd-sticky">
        <div className="pd-sticky-price">
          <b>{money(product.price)}</b>

          {Number(product.old_price || 0) >
            Number(product.price || 0) && (
            <s>{money(product.old_price)}</s>
          )}
        </div>

        <button type="button" onClick={add} className="pd-sticky-add">
          <ShoppingCart size={15} /> কার্টে যোগ
        </button>

        <button type="button" onClick={buyNow} className="pd-sticky-buy">
          কিনুন
        </button>
      </div>

      {/* ---------- জুম মোডাল ---------- */}
      {zoom && images[activeImg] && (
        <div
          className="pd-zoom-wrap"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="pd-zoom-close"
            aria-label="বন্ধ"
          >
            <X size={21} />
          </button>

          <img
            src={images[activeImg]}
            alt={product.name_bn || product.name}
          />
        </div>
      )}
    </div>
  );
}
