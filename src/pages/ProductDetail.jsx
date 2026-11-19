/**
 * ProductDetail.jsx — ইম্পোটেক প্রোডাক্ট পেজ (v13)
 * ------------------------------------------------------------
 * বসানোর পাথ:  website/src/pages/ProductDetail.jsx
 *
 * v13 ডিজাইন (ghorerbazar.com স্টাইল):
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
 * অপরিবর্তিত (গুরুত্বপূর্ণ):
 *   - ভিডিও প্লে মোড হুবহু আগের মতো:
 *     autoPlay + muted + loop + playsInline + controls={false},
 *     নিজের মিউট/আনমিউট বাটন, একাধিক ভিডিওর থাম্বনেইল স্ট্রিপ।
 *     শুধু জায়গা বদলে ট্যাবের ভেতরে গেছে।
 *   - v11 ফিচার: product.free_delivery === true হলে ফ্রি ডেলিভারি ব্যাজ
 *   - হাব-ভিত্তিক ডেলিভারি চার্জ: ওই লজিক lib/delivery.js ও Checkout.jsx-এ থাকে,
 *     এই ফাইলে কোনো পরিবর্তন নেই — তাই অক্ষত।
 * ------------------------------------------------------------
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

  const images = useMemo(() => (product?.images || []).filter(Boolean), [product]);
  const videos = useMemo(() => (product?.videos || []).filter(Boolean), [product]);
  const off = product ? discountPercent(product.price, product.old_price) : 0;
  const stock = product ? stockStatus(product.stock) : { label: '', tone: 'in' };
  const wished = product ? (wishlist || []).some((w) => w.id === product.id) : false;

  /* v11: এই প্রোডাক্টে ফ্রি ডেলিভারি চালু কি না (কলাম না থাকলে false) */
  const freeDelivery = product?.free_delivery === true;

  /* ক্যাটাগরির নাম — products-এ join না থাকলেও কাজ করবে */
  const category = useMemo(() => {
    if (!product) return null;
    if (product.categories) return product.categories;
    return (categories || []).find((c) => c.id === product.category_id) || null;
  }, [product, categories]);

  const related = useMemo(
    () =>
      product
        ? products
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

  const phone = settings?.general?.phone || '';
  const waNumber = String(phone).replace(/[^0-9]/g, '');

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
    window.location.href = '/checkout';
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
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('reviews').insert({
          product_id: product.id,
          customer_name: reviewForm.name.trim(),
          rating: Number(reviewForm.rating),
          text: reviewForm.text.trim(),
          status: 'pending',
        });
        if (error) throw error;
        toast.success('রিভিউ পাঠানো হয়েছে — অনুমোদনের পর দেখা যাবে');
      } else if (typeof localdb.addReview === 'function') {
        localdb.addReview({
          product_id: product.id,
          customer_name: reviewForm.name.trim(),
          rating: Number(reviewForm.rating),
          text: reviewForm.text.trim(),
          status: 'pending',
        });
        setReviews(localdb.listReviews(product.id) || []);
        toast.success('রিভিউ যোগ হয়েছে');
      } else {
        throw new Error('রিভিউ সেভ করার সুবিধা নেই');
      }
      setReviewForm({ name: '', text: '', rating: 5 });
    } catch (err) {
      toast.error(err?.message || 'রিভিউ পাঠানো যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const colors = product.colors || [];

➡️ PART 2 এ যান
