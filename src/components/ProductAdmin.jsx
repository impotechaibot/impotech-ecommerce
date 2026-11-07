import { useEffect, useMemo, useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiSave,
  FiRotateCcw,
  FiChevronDown,
  FiPackage,
} from 'react-icons/fi';
import { categories } from '../productsStore/Store.js';
import { useProducts, readProducts, hasCustomProducts } from '../hooks/useProducts.js';
import {
  formatMoney,
  productImage,
  productImages,
  productVideos,
  PLACEHOLDER_IMAGE,
} from '../utils/format.js';
import MediaManager from './MediaManager.jsx';
import '../styles/ProductAdmin.css';

const EMPTY_FORM = {
  id: '',
  name: '',
  bn: '',
  category: categories[0]?.id || 'angel-wings',
  price: '',
  oldPrice: '',
  stock: '',
  desc: '',
  images: [],
  videos: [],
  tag: '',
  badge: '',
  rating: '5',
  reviews: '0',
  featured: false,
  videoAutoplay: false,
};

// Turns a free-text name into a URL-safe id (kept stable once created).
const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'product';

const ProductAdmin = () => {
  const { products, save, reset } = useProducts();

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState(null); // product id | 'new' | null
  const [draft, setDraft] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null); // {type, text}
  const [confirmDelete, setConfirmDelete] = useState(null); // product
  const [confirmReset, setConfirmReset] = useState(false);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2800);
  };

  const catName = (id) =>
    categories.find((c) => c.id === id)?.name || 'অন্যান্য';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = catFilter === 'all' || p.category === catFilter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.bn || '').toLowerCase().includes(q) ||
        p.category.includes(q) ||
        (p.tag || '').toLowerCase().includes(q)
      );
    });
  }, [products, query, catFilter]);

  const stats = useMemo(
    () => ({
      total: products.length,
      out: products.filter((p) => Number(p.stock) <= 0).length,
      low: products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10)
        .length,
      value: products.reduce(
        (sum, p) => sum + Number(p.price) * Number(p.stock || 0),
        0
      ),
    }),
    [products]
  );

  /* ---------------- form handling ---------------- */

  const openNew = () => {
    setDraft({ ...EMPTY_FORM });
    setErrors({});
    setEditing('new');
  };

  const openEdit = (p) => {
    setDraft({
      id: p.id,
      name: p.name || '',
      bn: p.bn || '',
      category: p.category || categories[0]?.id,
      price: String(p.price ?? ''),
      oldPrice: String(p.oldPrice ?? ''),
      stock: String(p.stock ?? ''),
      desc: p.desc || '',
      images: productImages(p),
      videos: productVideos(p),
      tag: p.tag || '',
      badge: p.badge || '',
      rating: String(p.rating ?? 5),
      reviews: String(p.reviews ?? 0),
      featured: p.badge === 'bestSeller' || Boolean(p.featured),
      videoAutoplay: Boolean(p.videoAutoplay),
    });
    setErrors({});
    setEditing(p.id);
  };

  const closeForm = () => {
    setEditing(null);
    setDraft(EMPTY_FORM);
    setErrors({});
  };

  const validate = () => {
    const next = {};
    // Trim first: " " or "abc" must never slip through as a valid number.
    const priceText = String(draft.price ?? '').trim();
    const oldText = String(draft.oldPrice ?? '').trim();
    const stockText = String(draft.stock ?? '').trim();

    if (!draft.name.trim() && !draft.bn.trim())
      next.name = 'নাম আবশ্যক (বাংলা বা ইংরেজি যেকোনো একটি)';

    if (!priceText && priceText !== '0') next.price = 'দাম আবশ্যক';
    else if (!Number.isFinite(Number(priceText)) || Number(priceText) < 0)
      next.price = 'দাম একটি ধনাত্মক সংখ্যা হতে হবে';

    if (oldText && !Number.isFinite(Number(oldText)))
      next.oldPrice = 'আগের দাম সংখ্যা হতে হবে';
    else if (oldText && Number(oldText) > 0 && Number(oldText) < Number(priceText))
      next.oldPrice = 'আগের দাম বর্তমান দামের কম হতে পারে না';

    if (stockText && (!Number.isFinite(Number(stockText)) || Number(stockText) < 0))
      next.stock = 'স্টক ০ বা তার বেশি হতে হবে';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const commitForm = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isNew = editing === 'new';
    const base = isNew ? readProducts() : products;
    let id = draft.id;

    if (isNew) {
      const seed = slugify(draft.name || draft.bn);
      id = seed;
      let n = 2;
      while (base.some((p) => p.id === id)) id = `${seed}-${n++}`;
    }

    const price = Number(draft.price);
    const oldPrice = draft.oldPrice === '' ? price : Math.max(price, Number(draft.oldPrice));

    const record = {
      id,
      name: draft.name.trim() || draft.bn.trim(),
      bn: draft.bn.trim() || draft.name.trim(),
      price,
      oldPrice,
      category: draft.category,
      tag: draft.tag.trim(),
      badge: draft.featured ? 'bestSeller' : draft.badge.trim(),
      featured: draft.featured,
      rating: Math.max(1, Math.min(5, Number(draft.rating) || 5)),
      reviews: Number(draft.reviews) || 0,
      stock: Number(draft.stock) || 0,
      desc: draft.desc.trim(),
      colors: isNew ? ['ডিফল্ট'] : undefined,
      features: isNew ? [] : undefined,
      // First image is the primary one shown on cards / listings.
      images: draft.images.length
        ? draft.images
        : isNew
        ? [PLACEHOLDER_IMAGE]
        : [],
      videos: draft.videos,
      videoAutoplay: Boolean(draft.videoAutoplay),
    };

    // Keep any fields we do not edit here (colors / features) from the original.
    const existing = base.find((p) => p.id === id);
    const merged = existing
      ? {
          ...existing,
          ...record,
          colors: existing.colors,
          features: existing.features,
          images: record.images,
          videos: record.videos,
        }
      : {
          ...record,
          colors: ['ডিফল্ট'],
          features: [],
        };

    const nextList = isNew
      ? [merged, ...base]
      : base.map((p) => (p.id === id ? merged : p));

    const ok = save(nextList);
    if (!ok) {
      flash('error', 'সেভ করা যায়নি — ব্রাউজার স্টোরেজ পূর্ণ হয়ে থাকতে পারে। ছোট ছবি ব্যবহার করুন।');
      return;
    }
    flash('ok', isNew ? 'নতুন প্রোডাক্ট যোগ হয়েছে' : 'প্রোডাক্ট আপডেট হয়েছে');
    closeForm();
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    const next = products.filter((p) => p.id !== confirmDelete.id);
    const ok = save(next);
    setConfirmDelete(null);
    if (!ok) {
      flash('error', 'ডিলিট সেভ করা যায়নি');
      return;
    }
    if (editing === confirmDelete.id) closeForm();
    flash('ok', 'প্রোডাক্ট ডিলিট হয়েছে');
  };

  const doReset = () => {
    reset();
    setConfirmReset(false);
    closeForm();
    flash('ok', 'ডিফল্ট প্রোডাক্ট তালিকা ফিরিয়ে আনা হয়েছে');
  };

  // Esc closes whichever overlay is open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (confirmDelete) setConfirmDelete(null);
      else if (confirmReset) setConfirmReset(false);
      else if (editing) closeForm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="pa-wrap">
      {notice && (
        <div className={`pa-notice ${notice.type}`} role="status">
          {notice.type === 'ok' ? <FiCheck size={15} /> : <FiAlertTriangle size={15} />}
          {notice.text}
        </div>
      )}

      {/* stats */}
      <div className="pa-stats">
        <div>
          <span>মোট প্রোডাক্ট</span>
          <b>{stats.total}</b>
        </div>
        <div>
          <span>স্টক শেষ</span>
          <b className="warn">{stats.out}</b>
        </div>
        <div>
          <span>কম স্টক (≤10)</span>
          <b>{stats.low}</b>
        </div>
        <div>
          <span>স্টক ভ্যালু</span>
          <b>{formatMoney(stats.value)}</b>
        </div>
      </div>

      {/* toolbar */}
      <div className="pa-toolbar">
        <div className="pa-search">
          <FiSearch size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, ক্যাটাগরি বা ট্যাগ দিয়ে খুঁজুন…"
            aria-label="প্রোডাক্ট খুঁজুন"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="মুছুন">
              <FiX size={15} />
            </button>
          )}
        </div>

        <div className="pa-filter">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            aria-label="ক্যাটাগরি ফিল্টার"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FiChevronDown size={15} />
        </div>

        <button type="button" className="btn-primary pa-add" onClick={openNew}>
          <FiPlus size={16} /> নতুন প্রোডাক্ট
        </button>
      </div>

      {/* table */}
      <div className="pa-table-wrap">
        {filtered.length === 0 ? (
          <div className="pa-empty">
            <FiPackage size={34} />
            <p>কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setQuery('');
                setCatFilter('all');
              }}
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <table className="pa-table">
            <thead>
              <tr>
                <th>প্রোডাক্ট</th>
                <th>ক্যাটাগরি</th>
                <th>দাম</th>
                <th>স্টক</th>
                <th>স্ট্যাটাস</th>
                <th aria-label="অ্যাকশন" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td data-label="প্রোডাক্ট">
                    <div className="pa-prod">
                      <img src={productImage(p, 0)} alt="" loading="lazy" />
                      <div>
                        <b>{p.bn || p.name}</b>
                        <small>{p.id}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="ক্যাটাগরি">
                    <span className="pa-cat">{catName(p.category)}</span>
                  </td>
                  <td data-label="দাম">
                    <div className="pa-price">
                      <b>{formatMoney(p.price)}</b>
                      {p.oldPrice > p.price && <s>{formatMoney(p.oldPrice)}</s>}
                    </div>
                  </td>
                  <td data-label="স্টক">
                    <span className={Number(p.stock) <= 0 ? 'pa-stock out' : 'pa-stock'}>
                      {Number(p.stock) || 0}
                    </span>
                  </td>
                  <td data-label="স্ট্যাটাস">
                    {Number(p.stock) <= 0 ? (
                      <span className="pa-badge out">স্টক শেষ</span>
                    ) : Number(p.stock) <= 10 ? (
                      <span className="pa-badge low">কম স্টক</span>
                    ) : (
                      <span className="pa-badge on">স্টকে আছে</span>
                    )}
                  </td>
                  <td className="pa-actions-cell">
                    <div className="pa-row-actions">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        aria-label="এডিট"
                        title="এডিট"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="del"
                        onClick={() => setConfirmDelete(p)}
                        aria-label="ডিলিট"
                        title="ডিলিট"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pa-foot">
        <p className="ad-hint">
          {filtered.length}টি দেখানো হচ্ছে · মোট {products.length}টি। পরিবর্তন
          <code>localStorage['impotech_products']</code>-এ সেভ হয় এবং সব পেজে সাথে সাথে প্রয়োগ হয়।
        </p>
        <button
          type="button"
          className="btn-ghost pa-reset"
          onClick={() => setConfirmReset(true)}
          disabled={!hasCustomProducts()}
        >
          <FiRotateCcw size={14} /> ডিফল্টে ফিরিয়ে নিন
        </button>
      </div>

      {/* ---------------- editor drawer ---------------- */}
      {editing && (
        <>
          <div className="pa-scrim" onClick={closeForm} aria-hidden="true" />
          <aside className="pa-drawer" aria-label="প্রোডাক্ট এডিটর">
            {/* noValidate: the form runs its own validation so every message
                comes out in Bengali inside the field instead of a browser popup. */}
            <form onSubmit={commitForm} noValidate>
              <div className="pa-drawer-head">
                <h3>
                  <FiPackage size={17} />
                  {editing === 'new' ? 'নতুন প্রোডাক্ট' : 'প্রোডাক্ট এডিট'}
                </h3>
                <button type="button" onClick={closeForm} aria-label="বন্ধ করুন">
                  <FiX size={19} />
                </button>
              </div>

              <div className="pa-drawer-body">
                <label className="pa-field">
                  <span>নাম (বাংলা) *</span>
                  <input
                    value={draft.bn}
                    onChange={(e) => setDraft({ ...draft, bn: e.target.value })}
                    placeholder="যেমন: LED অ্যাঞ্জেল উইংস — সাদা"
                  />
                  {errors.name && <em>{errors.name}</em>}
                </label>

                <label className="pa-field">
                  <span>Name (English)</span>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. LED Angel Wings - White"
                  />
                </label>

                <label className="pa-field">
                  <span>ক্যাটাগরি</span>
                  <div className="pa-select">
                    <select
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown size={15} />
                  </div>
                </label>

                <div className="pa-row2">
                  <label className="pa-field">
                    <span>দাম (৳) *</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={draft.price}
                      onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                      placeholder="650"
                    />
                    {errors.price && <em>{errors.price}</em>}
                  </label>

                  <label className="pa-field">
                    <span>আগের দাম (৳)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={draft.oldPrice}
                      onChange={(e) => setDraft({ ...draft, oldPrice: e.target.value })}
                      placeholder="850"
                    />
                    {errors.oldPrice && <em>{errors.oldPrice}</em>}
                  </label>
                </div>

                <div className="pa-row2">
                  <label className="pa-field">
                    <span>স্টক</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={draft.stock}
                      onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                      placeholder="24"
                    />
                    {errors.stock && <em>{errors.stock}</em>}
                  </label>

                  <label className="pa-field">
                    <span>ব্যাজ / ট্যাগ</span>
                    <input
                      value={draft.tag}
                      onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                      placeholder="নতুন / হট / কম্বো"
                    />
                  </label>
                </div>

                <label className="pa-field">
                  <span>বিবরণ</span>
                  <textarea
                    rows={4}
                    value={draft.desc}
                    onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                    placeholder="সংক্ষিপ্ত বিবরণ…"
                  />
                </label>

                <div className="pa-field">
                  <span>ছবি ও ভিডিও</span>
                  <MediaManager
                    images={draft.images}
                    videos={draft.videos}
                    onChange={({ images, videos }) =>
                      setDraft((d) => ({ ...d, images, videos }))
                    }
                    onError={(msg) => setErrors((e) => ({ ...e, media: msg }))}
                  />
                  {errors.media && <em>{errors.media}</em>}
                </div>

                <div className="pa-row2">
                  <label className="pa-field">
                    <span>রেটিং (১–৫)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={draft.rating}
                      onChange={(e) => setDraft({ ...draft, rating: e.target.value })}
                    />
                  </label>
                  <label className="pa-field">
                    <span>রিভিউ সংখ্যা</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={draft.reviews}
                      onChange={(e) => setDraft({ ...draft, reviews: e.target.value })}
                    />
                  </label>
                </div>

                <label className="pa-toggle">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  />
                  <span className="pa-switch" aria-hidden="true" />
                  <span>
                    <b>ফিচার্ড প্রোডাক্ট</b>
                    <small>হোম পেজে “বেস্ট সেলার” ব্যাজ পাবে</small>
                  </span>
                </label>

                <label className="pa-toggle">
                  <input
                    type="checkbox"
                    checked={draft.videoAutoplay}
                    onChange={(e) =>
                      setDraft({ ...draft, videoAutoplay: e.target.checked })
                    }
                  />
                  <span className="pa-switch" aria-hidden="true" />
                  <span>
                    <b>ভিডিও অটো-প্লে (muted)</b>
                    <small>প্রোডাক্ট পেজে ভিডিও স্বয়ংক্রিয়ভাবে চুপচাপ চলবে, ইউজার চাইলে সাউন্ড চালু করবে</small>
                  </span>
                </label>
              </div>

              <div className="pa-drawer-foot">
                <button type="submit" className="btn-primary">
                  <FiSave size={15} />
                  {editing === 'new' ? 'প্রোডাক্ট যোগ করুন' : 'আপডেট সেভ করুন'}
                </button>
                <button type="button" className="btn-ghost" onClick={closeForm}>
                  বাতিল
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      {/* ---------------- delete confirm ---------------- */}
      {confirmDelete && (
        <div className="pa-modal-wrap" role="dialog" aria-modal="true">
          <div className="pa-modal-scrim" onClick={() => setConfirmDelete(null)} />
          <div className="pa-modal">
            <div className="pa-modal-ico">
              <FiAlertTriangle size={22} />
            </div>
            <h3>প্রোডাক্ট ডিলিট করবেন?</h3>
            <p>
              <b>{confirmDelete.bn || confirmDelete.name}</b> স্থায়ীভাবে তালিকা থেকে সরে যাবে।
              চাইলে পরে আবার যোগ করতে পারবেন।
            </p>
            <div className="pa-modal-actions">
              <button type="button" className="btn-danger" onClick={doDelete}>
                <FiTrash2 size={15} /> হ্যাঁ, ডিলিট করুন
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setConfirmDelete(null)}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- reset confirm ---------------- */}
      {confirmReset && (
        <div className="pa-modal-wrap" role="dialog" aria-modal="true">
          <div className="pa-modal-scrim" onClick={() => setConfirmReset(false)} />
          <div className="pa-modal">
            <div className="pa-modal-ico">
              <FiRotateCcw size={22} />
            </div>
            <h3>ডিফল্ট প্রোডাক্টে ফিরে যাবেন?</h3>
            <p>
              অ্যাডমিন থেকে করা সব প্রোডাক্ট পরিবর্তন মুছে যাবে এবং
              <code>Store.js</code>-এর মূল তালিকা ফিরে আসবে।
            </p>
            <div className="pa-modal-actions">
              <button type="button" className="btn-danger" onClick={doReset}>
                <FiRotateCcw size={15} /> হ্যাঁ, রিসেট করুন
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setConfirmReset(false)}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdmin;
