/**
 * ProductDetail.jsx — ইম্পোটেক প্রোডাক্ট পেজ (v14)
 * ------------------------------------------------------------
 * বসানোর পাথ:  website/src/pages/ProductDetail.jsx
 *
 * v14 = v13 ডিজাইন (ghorerbazar.com স্টাইল) + যাচাই করে পাওয়া বাগফিক্স
 *
 * v13 ডিজাইন:
 *   - লেআউট: ব্রেডক্রাম্ব → সাদা কার্ডে ২ কলাম (বাঁয়ে গ্যালারি, ডানে তথ্য)
 *   - দামের লাইনে কাটা দাম + "সাশ্রয় X%" সবুজ ব্যাজ
 *   - স্টক স্ট্যাটাস ডট সহ
 *   - রঙ/ভ্যারিয়েন্ট → পরিমাণ → দুই পাশাপাশি বাটন (কার্টে যোগ / এখনই কিনুন) + উইশলিস্ট
 *   - WhatsApp-এ অর্ডার + কল করুন সারি
 *   - ৩টি সুবিধা (ডেলিভারি / পেমেন্ট / রিটার্ন)
 *   - "একসাথে বেশি কেনা হয়" বান্ডেল ব্লক
 *   - ট্যাব: বিবরণ | ভিডিও | রিভিউ
 *   - রিভিউ: বড় রেটিং + তারকা + সুপারিশ% + ৫→১ বার গ্রাফ + লেখার ফর্ম + তালিকা
 *   - সম্পর্কিত পণ্য
 *
 * v14-এ ঠিক করা হয়েছে (v13-এর বাগ):
 *   1. settings?.general?.phone → settings?.contact?.phone
 *      (StoreContext-এ ফোন নম্বর থাকে settings.contact.phone-এ, general-এ নয়।
 *       আগে ফোন সবসময় খালি আসত → WhatsApp লিংক '#' হত, কল বাটন দেখাত না।)
 *   2. localdb.addReview → localdb.insert('reviews', ...)
 *      (localdb-তে addReview নামে কোনো ফাংশন নেই, শুধু insert আছে।
 *       আগে ডেমো মোডে রিভিউ জমা দিলে "রিভিউ সেভ করার সুবিধা নেই" এরর আসত।)
 *   3. images / videos / colors / features — Array.isArray গার্ড যোগ
 *      (ডেটাবেসে স্ট্রিং বা null থাকলে .filter/.map ক্র্যাশ করত।)
 *   4. রেটিং সংখ্যা এখন বাংলা অঙ্কে (toBn) — বাকি পেজের সাথে মিলল
 *   5. রিভিউ কাউন্ট হেডার ও ট্যাবে একই সোর্স থেকে (reviewCount)
 *   6. buyNow-তে window.location.href → useNavigate (SPA-তে ফুল রিলোড হবে না)
 *   7. জুম মোডালের বন্ধ বাটনে সরাসরি onClick
 *
 * অপরিবর্তিত (গুরুত্বপূর্ণ):
 *   - ভিডিও প্লে মোড হুবহু আগের মতো:
 *     autoPlay + muted + loop + playsInline + controls={false},
 *     নিজের মিউট/আনমিউট বাটন, একাধিক ভিডিওর থাম্বনেইল স্ট্রিপ।
 *   - v11 ফিচার: product.free_delivery === true হলে ফ্রি ডেলিভারি ব্যাজ
 *   - হাব-ভিত্তিক ডেলিভারি চার্জ: ওই লজিক lib/delivery.js ও Checkout.jsx-এ থাকে,
 *     এই ফাইলে কোনো পরিবর্তন নেই — তাই অক্ষত।
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
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://impotech.sellsull.com';

/* অ্যারে না হলে নিরাপদে খালি অ্যারে */
const asArray = (v) => (Array.isArray(v) ? v : []);

/* ছোট তারকা সারি */
function Stars({ value = 0, size = 15 }) {
  const v = Math.round(Number(value) || 0);
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= v ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
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

  /* v11: এই প্রোডাক্টে ফ্রি ডেলিভারি চালু কি না (কলাম না থাকলে false) */
  const freeDelivery = product?.free_delivery === true;

  /* ক্যাটাগরির নাম — products-এ join না থাকলেও কাজ করবে */
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

  /* "একসাথে কেনা হয়" — প্রথম সম্পর্কিত পণ্য */
  const bundleMate = related[0] || null;
  const bundleTotal =
    product && bundleMate
      ? Number(product.price || 0) + Number(bundleMate.price || 0)
      : 0;

  const avgRating = useMemo(() => {
    if (!reviews.length) return Number(product?.rating || 0);
    return reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
  }, [reviews, product]);

  /* ৫★ → ১★ বিতরণ */
  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const n = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      d[n - 1] += 1;
    });
    return d;
  }, [reviews]);

  const totalReviews = reviews.length;
  /* হেডার ও ট্যাব — একই সোর্স */
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
        <p className="mt-2 text-slate-500">সম্ভবত লিংকটি ভুল বা পণ্যটি সরিয়ে ফেলা হয়েছে।</p>
        <Link to="/shop" className="btn-primary mt-6 inline-block">সব পণ্য দেখুন</Link>
      </div>
    );
  }

  /* v14 ফিক্স: ফোন নম্বর settings.contact-এ থাকে, general-এ নয় */
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
        /* v14 ফিক্স: localdb-তে addReview নেই — insert('reviews', ...) ব্যবহার */
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

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-slate-800">
      <div className="container-x py-4 sm:py-6">
        <Seo
          title={`${product.name_bn || product.name} — ইম্পোটেক`}
          description={product.description || ''}
          image={images[0]}
          url={`${SITE_URL}/product/${product.slug}`}
          type="product"
          jsonLd={productJsonLd(product, SITE_URL)}
        />

        {/* ---------- ব্রেডক্রাম্ব ---------- */}
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-500">
          <Link to="/" className="hover:text-amber-600">হোম</Link>
          <ChevronRight size={13} className="text-slate-400" />
          <Link to="/shop" className="hover:text-amber-600">শপ</Link>
          {category && (
            <>
              <ChevronRight size={13} className="text-slate-400" />
              <Link
                to={`/shop?category=${product.category_id}`}
                className="hover:text-amber-600"
              >
                {category.name_bn || category.name}
              </Link>
            </>
          )}
          <ChevronRight size={13} className="text-slate-400" />
          <span className="max-w-[200px] truncate text-slate-700">
            {product.name_bn || product.name}
          </span>
        </nav>

        {/* ---------- মূল কার্ড: গ্যালারি + তথ্য ---------- */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            {/* ===== বাঁ: গ্যালারি ===== */}
            <div>
              <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[activeImg]}
                      alt={product.name_bn || product.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom(true)}
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
                      aria-label="জুম"
                    >
                      <ZoomIn size={17} />
                    </button>
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImg((v) => (v - 1 + images.length) % images.length)}
                          className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100"
                          aria-label="আগের ছবি"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImg((v) => (v + 1) % images.length)}
                          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100"
                          aria-label="পরের ছবি"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-400">ছবি নেই</div>
                )}

                {off > 0 && (
                  <span className="absolute left-3 top-3 rounded-md bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                    -{toBn(off)}%
                  </span>
                )}
                {stock.tone === 'out' && (
                  <span className="absolute left-3 top-3 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white">
                    স্টক শেষ
                  </span>
                )}
              </div>

              {/* থাম্বনেইল */}
              {images.length > 1 && (
                <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        i === activeImg
                          ? 'border-amber-500'
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`থাম্বনেইল ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== ডান: তথ্য ===== */}
            <div>
              {category && (
                <p className="text-[12.5px] font-medium text-amber-600">
                  {category.name_bn || category.name}
                </p>
              )}

              <h1 className="mt-1 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
                {product.name_bn || product.name}
              </h1>
              {product.name_bn && product.name && product.name_bn !== product.name && (
                <p className="mt-1 text-[13px] text-slate-500">{product.name}</p>
              )}

              {/* রেটিং */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                <Stars value={avgRating} />
                <span className="text-[12.5px] text-slate-500">
                  ({toBn(reviewCount)} রিভিউ)
                </span>
                {product.badge && (
                  <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* দাম */}
              <div className="mt-4 flex flex-wrap items-end gap-2.5">
                <span className="text-[26px] font-bold leading-none text-slate-900 sm:text-[30px]">
                  {money(product.price)}
                </span>
                {Number(product.old_price || 0) > Number(product.price || 0) && (
                  <>
                    <span className="text-[15px] text-slate-400 line-through">
                      {money(product.old_price)}
                    </span>
                    <span className="mb-0.5 rounded border border-green-200 bg-green-50 px-2 py-0.5 text-[11.5px] font-semibold text-green-700">
                      সাশ্রয় {toBn(off)}%
                    </span>
                  </>
                )}
              </div>

              {/* স্টক */}
              <p
                className={`mt-2 text-[12.5px] font-medium ${
                  stock.tone === 'out'
                    ? 'text-red-500'
                    : stock.tone === 'low'
                    ? 'text-amber-600'
                    : 'text-green-600'
                }`}
              >
                ● {stock.label}
              </p>

              {/* v11: ফ্রি ডেলিভারি */}
              {freeDelivery && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <BadgeCheck size={16} className="shrink-0 text-green-600" />
                  <div>
                    <p className="text-[13px] font-semibold text-green-700">
                      এই পণ্যে ফ্রি ডেলিভারি
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      এই পণ্যের ডেলিভারি চার্জ সম্পূর্ণ ফ্রি
                    </p>
                  </div>
                </div>
              )}

              {/* সংক্ষিপ্ত বর্ণনা */}
              {product.description && (
                <p className="mt-3 line-clamp-4 text-[13.5px] leading-relaxed text-slate-600">
                  {product.description}
                </p>
              )}

              {/* ভ্যারিয়েন্ট */}
              {colors.length > 0 && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                    রঙ / ভ্যারিয়েন্ট
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setVariant(c)}
                        className={`rounded-md border px-3 py-1.5 text-[13px] transition-colors ${
                          variant === c
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-200 text-slate-600 hover:border-amber-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* পরিমাণ */}
              <div className="mt-4">
                <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                  পরিমাণ
                </label>
                <div className="inline-flex items-center rounded-md border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="grid h-9 w-10 place-items-center text-slate-500 hover:text-slate-900"
                    aria-label="কমান"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-11 text-center text-[13.5px] font-medium">{toBn(qty)}</span>
                  <button
                    type="button"
                    onClick={() => setQty((v) => v + 1)}
                    className="grid h-9 w-10 place-items-center text-slate-500 hover:text-slate-900"
                    aria-label="বাড়ান"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* দুই বাটন */}
              <div className="mt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={add}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 text-[14px] font-medium text-slate-800 transition-colors hover:bg-slate-50"
                >
                  <ShoppingCart size={16} /> কার্টে যোগ করুন
                </button>
                <button
                  type="button"
                  onClick={buyNow}
                  className="h-11 flex-1 rounded-md bg-amber-500 text-[14px] font-semibold text-black transition-colors hover:bg-amber-400"
                >
                  এখনই কিনুন
                </button>
                <button
                  type="button"
                  onClick={wish}
                  className={`grid h-11 w-11 place-items-center rounded-md border transition-colors ${
                    wished
                      ? 'border-amber-500 bg-amber-50 text-amber-600'
                      : 'border-slate-300 text-slate-400 hover:border-amber-400 hover:text-amber-600'
                  }`}
                  aria-label="উইশলিস্ট"
                >
                  <Heart size={17} className={wished ? 'fill-amber-500' : ''} />
                </button>
              </div>

              {/* WhatsApp / কল */}
              <div className="mt-2.5 flex gap-2.5">
                <a
                  href={
                    waNumber
                      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `আমি এই পণ্যটি নিতে চাই: ${product.name_bn || product.name}`
                        )}`
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#25D366] text-[13px] font-medium text-white hover:brightness-105"
                >
                  <MessageCircle size={15} /> WhatsApp-এ অর্ডার
                </a>
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Phone size={15} /> কল করুন
                  </a>
                )}
              </div>

              {/* সুবিধা */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                {[
                  { icon: Truck, t: 'দ্রুত ডেলিভারি', s: '২–৪ দিন' },
                  { icon: ShieldCheck, t: 'নিরাপদ পেমেন্ট', s: 'COD সুবিধা' },
                  { icon: RotateCcw, t: '৭ দিনের রিটার্ন', s: 'শর্তসাপেক্ষে' },
                ].map((b, i) => (
                  <div key={i} className="text-center">
                    <b.icon size={17} className="mx-auto text-amber-500" />
                    <p className="mt-1 text-[11px] font-medium text-slate-700">{b.t}</p>
                    <p className="text-[10px] text-slate-400">{b.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- একসাথে কেনা হয় ---------- */}
        {bundleMate && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="mb-3 text-[14px] font-semibold text-slate-900">
              একসাথে বেশি কেনা হয়
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  {images[0] && (
                    <img src={images[0]} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="max-w-[150px] truncate text-[12.5px] font-medium text-slate-800">
                    {product.name_bn || product.name}
                  </p>
                  <p className="text-[12px] text-slate-500">{money(product.price)}</p>
                </div>
              </div>

              <span className="text-lg font-light text-slate-300">+</span>

              <div className="flex items-center gap-2.5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  {asArray(bundleMate.images)[0] && (
                    <img
                      src={asArray(bundleMate.images)[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="max-w-[150px] truncate text-[12.5px] font-medium text-slate-800">
                    {bundleMate.name_bn || bundleMate.name}
                  </p>
                  <p className="text-[12px] text-slate-500">{money(bundleMate.price)}</p>
                </div>
              </div>

              <span className="text-lg font-light text-slate-300">=</span>

              <div className="ml-auto flex items-center gap-3">
                <span className="text-[15px] font-bold text-slate-900">{money(bundleTotal)}</span>
                <button
                  type="button"
                  onClick={addBundle}
                  className="h-9 rounded-md bg-slate-900 px-4 text-[12.5px] font-medium text-white hover:bg-slate-800"
                >
                  দুটোই কার্টে নিন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- ট্যাব ---------- */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 sm:px-4">
            {[
              { id: 'desc', label: 'বিবরণ' },
              { id: 'video', label: `ভিডিও${videos.length ? ` (${toBn(videos.length)})` : ''}` },
              { id: 'reviews', label: `রিভিউ (${toBn(reviewCount)})` },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-3 text-[13.5px] font-medium transition-colors ${
                  tab === t.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {/* --- বিবরণ --- */}
            {tab === 'desc' && (
              <div className="max-w-3xl">
                <h3 className="mb-2 text-[14px] font-semibold text-slate-900">পণ্যের বিবরণ</h3>
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-600">
                  {product.description || 'এই পণ্যের বিস্তারিত বর্ণনা শীঘ্রই যোগ করা হবে।'}
                </p>

                {features.length > 0 && (
                  <>
                    <h3 className="mb-2 mt-5 text-[14px] font-semibold text-slate-900">
                      প্রধান বৈশিষ্ট্য
                    </h3>
                    <ul className="space-y-1.5">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13.5px] text-slate-600">
                          <Check size={15} className="mt-0.5 shrink-0 text-green-600" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {product.tag && (
                  <p className="mt-4 text-[12px] text-slate-400">ট্যাগ: {product.tag}</p>
                )}
              </div>
            )}

            {/* --- ভিডিও: প্লে মোড আগের মতোই --- */}
            {tab === 'video' && (
              <div className="max-w-3xl">
                {videos.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-10 text-center text-[13px] text-slate-400">
                    এই পণ্যের কোনো ভিডিও এখনো যোগ করা হয়নি।
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                      <video
                        ref={videoRef}
                        key={videos[activeVideo]}
                        src={videos[activeVideo]}
                        className="h-full w-full object-contain"
                        muted={muted}
                        autoPlay
                        loop
                        playsInline
                        controls={false}
                      />
                      <button
                        type="button"
                        onClick={() => setMuted((v) => !v)}
                        className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        aria-label={muted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
                      >
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                    </div>

                    {videos.length > 1 && (
                      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                        {videos.map((v, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setActiveVideo(i)}
                            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-black ${
                              i === activeVideo
                                ? 'border-amber-500'
                                : 'border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <video
                              src={v}
                              className="h-full w-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <span className="absolute inset-0 grid place-items-center bg-black/30">
                              <Play size={16} className="text-white" />
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
              <div className="max-w-3xl">
                {/* সারসংক্ষেপ */}
                <div className="flex flex-col gap-5 border-b border-slate-100 pb-5 sm:flex-row">
                  <div className="shrink-0 text-center sm:w-40 sm:text-left">
                    <p className="text-[34px] font-bold leading-none text-slate-900">
                      {toBn((Math.round(avgRating * 10) / 10).toFixed(1))}
                    </p>
                    <div className="mt-1.5 flex justify-center sm:justify-start">
                      <Stars value={avgRating} size={14} />
                    </div>
                    <p className="mt-1 text-[11.5px] text-slate-500">
                      {toBn(reviewCount)} রিভিউ
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-slate-500">
                      {toBn(recommendPct)}% সুপারিশ
                    </p>
                  </div>

                  <div className="max-w-xs flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const c = dist[n - 1];
                      const pct = totalReviews ? Math.round((c / totalReviews) * 100) : 0;
                      return (
                        <div key={n} className="flex items-center gap-2">
                          <span className="w-7 text-right text-[11px] text-slate-500">
                            {toBn(n)}★
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-[11px] text-slate-400">{toBn(c)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* লেখার ফর্ম */}
                <form onSubmit={submitReview} className="pt-5">
                  <h3 className="mb-2.5 text-[13.5px] font-semibold text-slate-900">
                    আপনার রিভিউ লিখুন
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <input
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="আপনার নাম"
                      className="h-10 rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                    />
                    <select
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))
                      }
                      className="h-10 rounded-md border border-slate-300 px-3 text-[13px] text-slate-800 focus:border-amber-500 focus:outline-none"
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
                    className="mt-2.5 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2.5 h-10 rounded-md bg-slate-900 px-5 text-[13px] font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? 'পাঠানো হচ্ছে…' : 'রিভিউ জমা দিন'}
                  </button>
                </form>

                {/* তালিকা */}
                <div className="mt-6 space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-[13px] text-slate-400">এখনো কোনো রিভিউ নেই।</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-full border border-amber-200 bg-amber-50 text-[13px] font-semibold text-amber-700">
                              {(r.customer_name || '?').charAt(0)}
                            </span>
                            <div>
                              <p className="text-[13px] font-medium text-slate-800">
                                {r.customer_name}
                              </p>
                              <p className="text-[11px] text-slate-400">{dateBn(r.created_at)}</p>
                            </div>
                          </div>
                          <Stars value={r.rating} size={13} />
                        </div>
                        <p className="mt-2.5 text-[13px] leading-relaxed text-slate-600">
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
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-slate-900">সম্পর্কিত পণ্য</h2>
              <Link to="/shop" className="text-[12.5px] text-amber-600 hover:underline">
                আরও পণ্য →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ---------- জুম মোডাল ---------- */}
      {zoom && images[activeImg] && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="বন্ধ"
          >
            <X size={22} />
          </button>
          <img
            src={images[activeImg]}
            alt={product.name_bn || product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

মোট ৯২১ লাইন। v14-এ ঠিক করা হয়েছে: ফোন নম্বর settings.general.phone → settings.contact.phone (আগে WhatsApp/কল কাজ করত না), রিভিউ সেভ localdb.addReview → localdb.insert('reviews', ...) (আগে এরর আসত), images/videos/colors/features-এ Array.isArray গার্ড, রেটিং সংখ্যা বাংলা অঙ্কে, রিভিউ কাউন্ট একই সোর্স থেকে, buyNow-তে useNavigate, আর জুম মোডালের বন্ধ বাটনে সরাসরি onClick।
