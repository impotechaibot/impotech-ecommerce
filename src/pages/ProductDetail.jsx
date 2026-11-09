import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw,
  ChevronLeft, ChevronRight, Play, Volume2, VolumeX, ZoomIn, X, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { localdb } from '../lib/localdb.js';
import { money, discountPercent, stockStatus, dateBn, toBn } from '../lib/format.js';
import { productJsonLd } from '../lib/seo.js';
import Rating from '../components/Rating.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://impotech.sellsull.com';

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, addToCart, toggleWishlist, wishlist, loading, isSupabaseConfigured } = useStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState('');
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState('desc');
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  /* প্রোডাক্ট লোড */
  useEffect(() => {
    const found = products.find((p) => p.slug === slug || p.id === slug) || null;
    setProduct(found);
    setActiveImg(0);
    setActiveVideo(0);
    setQty(1);
    setVariant('');
    if (found) {
      if (isSupabaseConfigured) {
        // Supabase মোডে রিভিউ আলাদা টেবিল থেকে (এখানে ডেমোতে localdb)
        setReviews(localdb.listReviews(found.id));
      } else {
        setReviews(localdb.listReviews(found.id));
      }
    }
  }, [slug, products, isSupabaseConfigured]);

  const images = useMemo(() => (product?.images || []).filter(Boolean), [product]);
  const videos = useMemo(() => (product?.videos || []).filter(Boolean), [product]);
  const off = product ? discountPercent(product.price, product.old_price) : 0;
  const stock = product ? stockStatus(product.stock) : { label: '', tone: 'in' };
  const wished = product ? wishlist.some((w) => w.id === product.id) : false;

  const related = useMemo(
    () =>
      product
        ? products.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4)
        : [],
    [products, product]
  );

  const avgRating = useMemo(() => {
    if (!reviews.length) return product?.rating || 0;
    return reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
  }, [reviews, product]);

  /* ভিডিও autoplay (muted) */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, [activeVideo, muted, videos.length]);

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">পণ্যটি পাওয়া যায়নি</h1>
        <p className="text-ink-muted mt-2">সম্ভবত লিংকটি ভুল বা পণ্যটি সরিয়ে ফেলা হয়েছে।</p>
        <Link to="/shop" className="btn-primary mt-6">সব পণ্য দেখুন</Link>
      </div>
    );
  }

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

  const colors = product.colors || [];

  return (
    <div className="container-x py-8">
      <Seo
        title={`${product.name_bn || product.name} — ইম্পোটেক`}
        description={product.description || ''}
        image={images[0]}
        url={`${SITE_URL}/product/${product.slug}`}
        type="product"
        jsonLd={productJsonLd(product, SITE_URL)}
      />

      {/* ব্রেডক্রাম্ব */}
      <nav className="text-sm text-ink-muted mb-6 flex items-center gap-2 flex-wrap">
        <Link to="/" className="hover:text-accent">হোম</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-accent">শপ</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category_id}`} className="hover:text-accent">
              {product.categories.name_bn || product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink">{product.name_bn || product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* গ্যালারি */}
        <div>
          <div className="relative card overflow-hidden aspect-square bg-surface2 group">
            {images.length > 0 ? (
              <>
                <img
                  src={images[activeImg]}
                  alt={product.name_bn || product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setZoom(true)}
                  className="absolute top-3 right-3 w-10 h-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="জুম"
                >
                  <ZoomIn size={18} />
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((v) => (v - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="আগের ছবি"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setActiveImg((v) => (v + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="পরের ছবি"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full grid place-items-center text-ink-muted">ছবি নেই</div>
            )}
            {off > 0 && (
              <span className="absolute top-3 left-3 badge bg-red-500/90 text-white">-{off}%</span>
            )}
          </div>

          {/* থাম্বনেইল */}
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-field overflow-hidden shrink-0 border-2 transition-colors ${
                    i === activeImg ? 'border-accent' : 'border-line hover:border-accent/50'
                  }`}
                >
                  <img src={img} alt={`থাম্বনেইল ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* ভিডিও গ্যালারি */}
          {videos.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Play size={15} className="text-accent" /> ভিডিও ({toBn(videos.length)})
              </h3>
              <div className="relative card overflow-hidden aspect-video bg-black">
                <video
                  ref={videoRef}
                  key={videos[activeVideo]}
                  src={videos[activeVideo]}
                  className="w-full h-full object-contain"
                  muted={muted}
                  autoPlay
                  loop
                  playsInline
                  controls={false}
                />
                <button
                  onClick={() => setMuted((v) => !v)}
                  className="absolute bottom-3 right-3 w-10 h-10 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  aria-label={muted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              {videos.length > 1 && (
                <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                  {videos.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVideo(i)}
                      className={`relative w-24 h-16 rounded-field overflow-hidden shrink-0 border-2 bg-black ${
                        i === activeVideo ? 'border-accent' : 'border-line hover:border-accent/50'
                      }`}
                    >
                      <video src={v} className="w-full h-full object-cover" muted preload="metadata" />
                      <span className="absolute inset-0 grid place-items-center bg-black/30">
                        <Play size={16} className="text-white" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* তথ্য */}
        <div>
          {product.categories && (
            <p className="text-sm text-accent">{product.categories.name_bn || product.categories.name}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-semibold mt-2">{product.name_bn || product.name}</h1>
          {product.name_bn && product.name && (
            <p className="text-sm text-ink-muted mt-1">{product.name}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <Rating value={avgRating} count={reviews.length || product.reviews_count} size={16} />
            {product.badge && <span className="badge bg-accent text-black">{product.badge}</span>}
          </div>

          <div className="flex items-end gap-3 mt-5">
            <span className="text-3xl font-bold text-accent">{money(product.price)}</span>
            {Number(product.old_price || 0) > Number(product.price || 0) && (
              <>
                <span className="text-lg text-ink-muted line-through">{money(product.old_price)}</span>
                <span className="badge bg-red-500/15 text-red-400">-{off}%</span>
              </>
            )}
          </div>

          <p className={`text-sm mt-3 ${stock.tone === 'out' ? 'text-red-400' : stock.tone === 'low' ? 'text-amber-400' : 'text-emerald-400'}`}>
            {stock.label}
          </p>

          {product.description && (
            <p className="text-ink-muted mt-5 leading-relaxed">{product.description}</p>
          )}

          {/* ভ্যারিয়েন্ট */}
          {colors.length > 0 && (
            <div className="mt-6">
              <label className="label">রঙ / ভ্যারিয়েন্ট</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setVariant(c)}
                    className={`px-4 py-2 rounded-field text-sm border transition-colors ${
                      variant === c ? 'border-accent bg-accent/15 text-accent' : 'border-line text-ink-muted hover:border-accent/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* পরিমাণ + অ্যাকশন */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center border border-line rounded-field">
              <button
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="w-11 h-11 grid place-items-center text-ink-muted hover:text-ink"
                aria-label="কমান"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{toBn(qty)}</span>
              <button
                onClick={() => setQty((v) => v + 1)}
                className="w-11 h-11 grid place-items-center text-ink-muted hover:text-ink"
                aria-label="বাড়ান"
              >
                <Plus size={16} />
              </button>
            </div>
            <button className="btn-primary flex-1 min-w-[160px]" onClick={add}>
              <ShoppingCart size={17} /> কার্টে যোগ করুন
            </button>
            <button
              onClick={wish}
              className={`w-11 h-11 grid place-items-center rounded-field border transition-colors ${
                wished ? 'border-accent bg-accent text-black' : 'border-line text-ink-muted hover:border-accent'
              }`}
              aria-label="উইশলিস্ট"
            >
              <Heart size={18} className={wished ? 'fill-black' : ''} />
            </button>
          </div>

          <button className="btn-outline w-full mt-3" onClick={buyNow}>
            এখনই কিনুন
          </button>

          {/* সুবিধা */}
          <div className="grid grid-cols-3 gap-3 mt-7">
            {[
              { icon: Truck, t: 'দ্রুত ডেলিভারি', s: '২–৪ দিন' },
              { icon: ShieldCheck, t: 'নিরাপদ পেমেন্ট', s: 'COD সুবিধা' },
              { icon: RotateCcw, t: '৭ দিনের রিটার্ন', s: 'শর্তসাপেক্ষে' },
            ].map((b, i) => (
              <div key={i} className="card p-3 text-center">
                <b.icon size={18} className="mx-auto text-accent" />
                <p className="text-xs font-medium mt-2">{b.t}</p>
                <p className="text-[11px] text-ink-muted mt-0.5">{b.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ট্যাব: বর্ণনা / রিভিউ */}
      <div className="mt-12">
        <div className="flex gap-2 border-b border-line">
          {[
            { id: 'desc', label: 'বিস্তারিত বর্ণনা' },
            { id: 'reviews', label: `রিভিউ (${toBn(reviews.length)})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'desc' ? (
            <div className="prose-invert max-w-3xl text-ink-muted leading-relaxed whitespace-pre-line">
              {product.description || 'এই পণ্যের বিস্তারিত বর্ণনা শীঘ্রই যোগ করা হবে।'}
              {product.features && product.features.length > 0 && (
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          ) : (
            <div className="max-w-3xl">
              {reviews.length === 0 ? (
                <p className="text-ink-muted">এখনো কোনো রিভিউ নেই।</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-accent/15 text-accent grid place-items-center font-semibold">
                            {(r.customer_name || '?').charAt(0)}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{r.customer_name}</p>
                            <p className="text-xs text-ink-muted">{dateBn(r.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i <= Number(r.rating || 0) ? 'text-accent fill-accent' : 'text-line'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-ink-muted mt-3">{r.text || r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* রিলেটেড */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-6">সম্পর্কিত পণ্য</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* জুম মোডাল */}
      {zoom && images[activeImg] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4"
          onClick={() => setZoom(false)}
        >
          <button className="absolute top-5 right-5 w-11 h-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="বন্ধ">
            <X size={22} />
          </button>
          <img
            src={images[activeImg]}
            alt={product.name_bn || product.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
