import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiShoppingBag,
  FiHeart,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiMinus,
  FiPlus,
  FiCheck,
  FiVolumeX,
  FiVolume2,
} from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories.js';
import { useProducts } from '../hooks/useProducts.js';
import { cartActions } from '../redux-state/CartState.js';
import { wishlistActions } from '../redux-state/WishlistState.js';
import { uiActions } from '../redux-state/UiState.js';
import { selectWishlist } from '../redux-state/Store.js';
import {
  formatMoney,
  productImage,
  productGallery,
  PLACEHOLDER_IMAGE,
} from '../utils/format.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products } = useProducts();
  const { categories } = useCategories();
  const product = products.find((p) => p.id === id);
  const wishlist = useSelector(selectWishlist);

  const [mediaIndex, setMediaIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [muted, setMuted] = useState(true);
  const [color, setColor] = useState(product?.colors?.[0] || '');
  const [tab, setTab] = useState('desc');

  useEffect(() => {
    setMediaIndex(0);
    setQty(1);
    setTab('desc');
    if (product) setColor(product.colors[0]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id, product]);

  if (!product) {
    return (
      <div className="page">
        <div className="container empty-state">
          <p>এই পণ্যটি পাওয়া যায়নি।</p>
          <Link to="/products" className="btn-primary">
            সব পণ্য দেখুন
          </Link>
        </div>
      </div>
    );
  }

  // Gallery = every image, then every video. Legacy products that only carry a
  // single `image` string still resolve through productGallery().
  const gallery = productGallery(product);
  const current = gallery[mediaIndex] || gallery[0];

  const liked = wishlist.includes(product.id);
  const cat = categories.find((c) => c.id === product.category);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const discount =
    product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  const addToCart = () => {
    for (let i = 0; i < qty; i += 1) {
      dispatch(
        cartActions.addItemToCart({
          id: product.id,
          name: product.name,
          bn: product.bn,
          price: product.price,
          image: productImage(product, 0),
        })
      );
    }
    dispatch(uiActions.showToast('কার্টে যোগ হয়েছে'));
    dispatch(uiActions.openCart());
  };

  const buyNow = () => {
    addToCart();
    navigate('/checkout');
  };

  return (
    <div className="page pd-page">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">হোম</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{cat?.name}</Link>
          <span>/</span>
          <span className="crumb-now">{product.bn}</span>
        </nav>

        <div className="pd-grid">
          {/* gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img">
              {current?.kind === 'video' ? (
                <>
                  <video
                    key={current.src}
                    className="pd-main-video"
                    src={current.src}
                    controls
                    playsInline
                    preload="metadata"
                    autoPlay={product.videoAutoplay}
                    muted={product.videoAutoplay ? muted : false}
                  />
                  {product.videoAutoplay && (
                    <button
                      type="button"
                      className="pd-mute"
                      onClick={() => setMuted((m) => !m)}
                      aria-label={muted ? 'আনমিউট করুন' : 'মিউট করুন'}
                    >
                      {muted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                    </button>
                  )}
                </>
              ) : (
                <img
                  src={current?.src || PLACEHOLDER_IMAGE}
                  alt={product.bn}
                />
              )}
              {discount > 0 && <span className="pd-discount">-{discount}%</span>}
            </div>
            {gallery.length > 1 && (
              <div className="pd-thumbs">
                {gallery.map((m, i) => (
                  <button
                    key={m.src + i}
                    type="button"
                    className={i === mediaIndex ? 'on' : ''}
                    onClick={() => setMediaIndex(i)}
                    aria-label={
                      m.kind === 'video' ? `ভিডিও ${i + 1}` : `ছবি ${i + 1}`
                    }
                  >
                    {m.kind === 'video' ? (
                      <>
                        <video src={m.src} muted preload="metadata" />
                        <span className="pd-thumb-play" aria-hidden="true">
                          ▶
                        </span>
                      </>
                    ) : (
                      <img src={m.src} alt="" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div className="pd-info">
            <div className="pd-tags">
              {product.tag && <span className="pd-tag accent">{product.tag}</span>}
              <span className="pd-tag">{cat?.name}</span>
            </div>

            <h1>{product.bn}</h1>
            <p className="pd-en">{product.name}</p>

            <div className="pd-rating">
              <span className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={15}
                    fill={i < product.rating ? 'currentColor' : 'none'}
                    className={i < product.rating ? 'on' : 'off'}
                  />
                ))}
              </span>
              <span className="pd-rev">
                {product.reviews}টি রিভিউ · স্টকে {product.stock}টি
              </span>
            </div>

            <div className="pd-price">
              <b>{formatMoney(product.price)}</b>
              {product.oldPrice > product.price && (
                <s>{formatMoney(product.oldPrice)}</s>
              )}
              {discount > 0 && <span className="pd-save">{discount}% সাশ্রয়</span>}
            </div>

            <p className="pd-desc">{product.desc}</p>

            <div className="pd-colors">
              <p className="pd-label">রঙ / ভ্যারিয়েন্ট</p>
              <div className="pd-color-row">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={color === c ? 'on' : ''}
                    onClick={() => setColor(c)}
                  >
                    {color === c && <FiCheck size={13} />}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="pd-buy">
              <div className="pd-qty">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="কমান"
                >
                  <FiMinus size={14} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="বাড়ান"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              <button type="button" className="btn-primary pd-add" onClick={addToCart}>
                <FiShoppingBag size={16} /> কার্টে যোগ করুন
              </button>

              <button
                type="button"
                className={`pd-wish ${liked ? 'on' : ''}`}
                onClick={() => {
                  dispatch(wishlistActions.toggleWishlist(product.id));
                  dispatch(
                    uiActions.showToast(
                      liked ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ হয়েছে'
                    )
                  );
                }}
                aria-label="উইশলিস্ট"
              >
                <FiHeart size={18} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button type="button" className="btn-ghost pd-buynow" onClick={buyNow}>
              এখনই কিনুন
            </button>

            <div className="pd-perks">
              <div>
                <FiTruck size={17} />
                <span>ঢাকায় ২৪ ঘণ্টায় ডেলিভারি</span>
              </div>
              <div>
                <FiRefreshCw size={17} />
                <span>৭ দিনের রিপ্লেসমেন্ট</span>
              </div>
              <div>
                <FiShield size={17} />
                <span>অরিজিনাল প্রোডাক্ট গ্যারান্টি</span>
              </div>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="pd-tabs">
          <div className="pd-tab-head">
            {[
              { id: 'desc', label: 'বিবরণ' },
              { id: 'features', label: 'ফিচার' },
              { id: 'shipping', label: 'ডেলিভারি ও রিটার্ন' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? 'on' : ''}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="pd-tab-body">
            {tab === 'desc' && <p>{product.desc}</p>}
            {tab === 'features' && (
              <ul className="pd-feat-list">
                {product.features.map((f) => (
                  <li key={f}>
                    <FiCheck size={15} /> {f}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'shipping' && (
              <p>
                ঢাকার ভিতরে ২৪ ঘণ্টা এবং ঢাকার বাইরে ২–৪ কর্মদিবসে ডেলিভারি। পণ্যে
                সমস্যা থাকলে ডেলিভারির ৭ দিনের মধ্যে রিপ্লেসমেন্টের জন্য যোগাযোগ
                করুন — ০১৮৮৪৩৩২০৬৭।
              </p>
            )}
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="sec sec-tight">
            <Reveal className="sec-head">
              <div>
                <h2>একই ধরনের পণ্য</h2>
                <p className="sub">আপনার পছন্দ হতে পারে</p>
              </div>
              <Link to={`/products?category=${product.category}`} className="sec-link">
                সব দেখুন →
              </Link>
            </Reveal>
            <div className="prod-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
