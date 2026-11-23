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
  FiVideo,
  FiCloud,
  FiHardDrive,
} from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories.js';
import { useProducts } from '../hooks/useProducts.js';
import { formatMoney, productImage, PLACEHOLDER_IMAGE } from '../utils/format.js';
import { emptyProduct, toDraft, toProduct } from '../lib/normalize.js';
import { removeMedia } from '../lib/db.js';
import MediaManager from './MediaManager.jsx';
import '../styles/ProductAdmin.css';

/* ==========================================================
   ProductAdmin — প্রোডাক্ট ম্যানেজার (v2)

   ⚠️ আগের বাগ:
     • সেভ শুধু localStorage-এ যেত → লাইভ সাইটে কিছুই আসত না
     • ভিডিও base64 হয়ে স্টোরেজ ভরে দিত → সেভ চুপচাপ ব্যর্থ
     • এরর মেসেজ জেনেরিক ছিল, আসল কারণ জানা যেত না

   এখন:
     • সেভ/ডিলিট সরাসরি Supabase-এ (db.js দিয়ে)
     • আসল এরর বাংলায় দেখায় (RLS, bucket, নেটওয়ার্ক …)
     • ভিডিও Storage-এ, প্রোডাক্টে শুধু URL
     • ডেটা সোর্স ব্যাজ: Supabase (লাইভ) / লোকাল (ডেমো)
   ========================================================== */

const ProductAdmin = () => {
  const {
    products,
    loading,
    status,
    isRemote,
    add,
    update,
    remove,
    replaceAll,
    reload,
  } = useProducts();
  const { categories } = useCategories();

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState(null); // product id | 'new' | null
  const [draft, setDraft] = useState(emptyProduct());
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const catName = (id) =>
    categories.find((c) => c.id === id)?.name_bn ||
    categories.find((c) => c.id === id)?.name ||
    'অন্যান্য';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = catFilter === 'all' || p.category_id === catFilter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.name_bn || '').toLowerCase().includes(q) ||
        String(p.category_id || '').includes(q) ||
        String(p.tag || '').toLowerCase().includes(q)
      );
    });
  }, [products, query, catFilter]);

  const stats = useMemo(
    () => ({
      total: products.length,
      out: products.filter((p) => Number(p.stock) <= 0).length,
      low: products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length,
      withVideo: products.filter((p) => (p.videos || []).length > 0).length,
      value: products.reduce((sum, p) => sum + Number(p.price) * Number(p.stock || 0), 0),
    }),
    [products]
  );

  /* ---------------- ফর্ম ---------------- */

  const openNew = () => {
    setDraft(emptyProduct(categories[0]?.id || ''));
    setErrors({});
    setEditing('new');
  };

  const openEdit = (p) => {
    setDraft(toDraft(p));
    setErrors({});
    setEditing(p.id);
  };

  const closeForm = () => {
    setEditing(null);
    setDraft(emptyProduct());
    setErrors({});
  };

  const validate = () => {
    const next = {};
    const priceText = String(draft.price ?? '').trim();
    const oldText = String(draft.old_price ?? '').trim();
    const stockText = String(draft.stock ?? '').trim();

    if (!String(draft.name_bn || '').trim() && !String(draft.name || '').trim())
      next.name = 'নাম আবশ্যক (বাংলা বা ইংরেজি যেকোনো একটি)';

    if (!priceText && priceText !== '0') next.price = 'দাম আবশ্যক';
    else if (!Number.isFinite(Number(priceText)) || Number(priceText) < 0)
      next.price = 'দাম একটি ধনাত্মক সংখ্যা হতে হবে';

    if (oldText && !Number.isFinite(Number(oldText)))
      next.old_price = 'আগের দাম সংখ্যা হতে হবে';
    else if (oldText && Number(oldText) > 0 && Number(oldText) < Number(priceText))
      next.old_price = 'আগের দাম বর্তমান দামের কম হতে পারে না';

    if (stockText && (!Number.isFinite(Number(stockText)) || Number(stockText) < 0))
      next.stock = 'স্টক ০ বা তার বেশি হতে হবে';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const commitForm = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const isNew = editing === 'new';
    const payload = {
      ...draft,
      price: Number(draft.price) || 0,
      old_price: draft.old_price === '' ? Number(draft.price) || 0 : Number(draft.old_price),
      stock: Number(draft.stock) || 0,
      rating: Math.max(1, Math.min(5, Number(draft.rating) || 5)),
      reviews_count: Number(draft.reviews_count) || 0,
      images: draft.images.length ? draft.images : isNew ? [PLACEHOLDER_IMAGE] : [],
    };

    const res = isNew ? await add(payload) : await update(editing, payload);
    setSaving(false);

    if (!res.ok) {
      flash('error', `সেভ হয়নি — ${res.error}`);
      return;
    }
    flash(
      'ok',
      isNew
        ? 'নতুন প্রোডাক্ট যোগ হয়েছে — লাইভ সাইটে দেখা যাবে'
        : 'প্রোডাক্ট আপডেট হয়েছে'
    );
    closeForm();
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    setSaving(true);

    // Storage-এ থাকা ভিডিও/ছবি পরিষ্কার (বাইরের লিঙ্ক ছোঁবে না)
    const media = [...(target.videos || []), ...(target.images || [])];
    for (const url of media) {
      if (String(url).includes('/object/public/')) await removeMedia(url);
    }

    const res = await remove(target.id);
    setSaving(false);
    if (!res.ok) {
      flash('error', `ডিলিট হয়নি — ${res.error}`);
      return;
    }
    if (editing === target.id) closeForm();
    flash('ok', 'প্রোডাক্ট ডিলিট হয়েছে');
  };

  const doReset = async () => {
    setConfirmReset(false);
    setSaving(true);
    const res = await replaceAll([]);
    setSaving(false);
    closeForm();
    if (!res.ok) {
      flash('error', `রিসেট হয়নি — ${res.error}`);
      return;
    }
    flash('ok', 'সব প্রোডাক্ট সরানো হয়েছে');
  };

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

      {/* ডেটা সোর্স */}
      <div className={`pa-source ${isRemote ? 'live' : 'demo'}`}>
        {isRemote ? <FiCloud size={14} /> : <FiHardDrive size={14} />}
        <b>{isRemote ? 'Supabase (লাইভ)' : 'লোকাল (ডেমো)'}</b>
        <span>
          {isRemote
            ? 'সেভ করলে সব ডিভাইসে সাথে সাথে দেখা যাবে'
            : 'Supabase কনফিগার নেই — পরিবর্তন শুধু এই ব্রাউজারে থাকবে'}
        </span>
        <button type="button" onClick={reload} disabled={loading}>
          <FiRotateCcw size={13} /> রিফ্রেশ
        </button>
      </div>

      {status.error && (
        <div className="pa-notice error" role="alert">
          <FiAlertTriangle size={15} />
          ডেটা লোডে সমস্যা: {status.error}
        </div>
      )}

      {/* পরিসংখ্যান */}
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
          <span>ভিডিওসহ</span>
          <b>{stats.withVideo}</b>
        </div>
        <div>
          <span>স্টক ভ্যালু</span>
          <b>{formatMoney(stats.value)}</b>
        </div>
      </div>

      {/* টুলবার */}
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
                {c.name_bn || c.name}
              </option>
            ))}
          </select>
          <FiChevronDown size={15} />
        </div>

        <button type="button" className="btn-primary pa-add" onClick={openNew}>
          <FiPlus size={16} /> নতুন প্রোডাক্ট
        </button>
      </div>

      {/* টেবিল */}
      <div className="pa-table-wrap">
        {loading ? (
          <div className="pa-empty">
            <FiPackage size={34} />
            <p>লোড হচ্ছে…</p>
          </div>
        ) : filtered.length === 0 ? (
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
                <th>মিডিয়া</th>
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
                        <b>{p.name_bn || p.name}</b>
                        <small>{p.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="ক্যাটাগরি">
                    <span className="pa-cat">{catName(p.category_id)}</span>
                  </td>
                  <td data-label="দাম">
                    <div className="pa-price">
                      <b>{formatMoney(p.price)}</b>
                      {p.old_price > p.price && <s>{formatMoney(p.old_price)}</s>}
                    </div>
                  </td>
                  <td data-label="স্টক">
                    <span className={Number(p.stock) <= 0 ? 'pa-stock out' : 'pa-stock'}>
                      {Number(p.stock) || 0}
                    </span>
                  </td>
                  <td data-label="মিডিয়া">
                    <div className="pa-media">
                      <span title="ছবি">{p.images.length} 🖼</span>
                      <span
                        className={(p.videos || []).length ? 'has-video' : ''}
                        title="ভিডিও"
                      >
                        <FiVideo size={12} /> {p.videos.length}
                      </span>
                    </div>
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
          {filtered.length}টি দেখানো হচ্ছে · মোট {products.length}টি।
          {isRemote
            ? ' পরিবর্তন Supabase-এ সেভ হয় এবং সব ডিভাইসে দেখা যায়।'
            : ' ডেমো মোডে পরিবর্তন শুধু এই ব্রাউজারে থাকে।'}
        </p>
        <button
          type="button"
          className="btn-ghost pa-reset"
          onClick={() => setConfirmReset(true)}
          disabled={!products.length || saving}
        >
          <FiRotateCcw size={14} /> সব প্রোডাক্ট সরান
        </button>
      </div>

      {/* ---------------- এডিটর ---------------- */}
      {editing && (
        <>
          <div className="pa-scrim" onClick={closeForm} aria-hidden="true" />
          <aside className="pa-drawer" aria-label="প্রোডাক্ট এডিটর">
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
                    value={draft.name_bn}
                    onChange={(e) => setDraft({ ...draft, name_bn: e.target.value })}
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
                      value={draft.category_id}
                      onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_bn || c.name}
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
                      value={draft.old_price}
                      onChange={(e) => setDraft({ ...draft, old_price: e.target.value })}
                      placeholder="850"
                    />
                    {errors.old_price && <em>{errors.old_price}</em>}
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
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
                      value={draft.reviews_count}
                      onChange={(e) => setDraft({ ...draft, reviews_count: e.target.value })}
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
                    checked={draft.video_autoplay}
                    onChange={(e) => setDraft({ ...draft, video_autoplay: e.target.checked })}
                  />
                  <span className="pa-switch" aria-hidden="true" />
                  <span>
                    <b>ভিডিও অটো-প্লে (muted)</b>
                    <small>প্রোডাক্ট পেজে ভিডিও স্বয়ংক্রিয়ভাবে চুপচাপ চলবে</small>
                  </span>
                </label>

                <label className="pa-toggle">
                  <input
                    type="checkbox"
                    checked={draft.free_delivery}
                    onChange={(e) => setDraft({ ...draft, free_delivery: e.target.checked })}
                  />
                  <span className="pa-switch" aria-hidden="true" />
                  <span>
                    <b>ফ্রি ডেলিভারি</b>
                    <small>এই প্রোডাক্টে ডেলিভারি চার্জ লাগবে না</small>
                  </span>
                </label>
              </div>

              <div className="pa-drawer-foot">
                <button type="submit" className="btn-primary" disabled={saving}>
                  <FiSave size={15} />
                  {saving
                    ? 'সেভ হচ্ছে…'
                    : editing === 'new'
                    ? 'প্রোডাক্ট যোগ করুন'
                    : 'আপডেট সেভ করুন'}
                </button>
                <button type="button" className="btn-ghost" onClick={closeForm}>
                  বাতিল
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      {/* ---------------- ডিলিট কনফার্ম ---------------- */}
      {confirmDelete && (
        <div className="pa-modal-wrap" role="dialog" aria-modal="true">
          <div className="pa-modal-scrim" onClick={() => setConfirmDelete(null)} />
          <div className="pa-modal">
            <div className="pa-modal-ico">
              <FiAlertTriangle size={22} />
            </div>
            <h3>প্রোডাক্ট ডিলিট করবেন?</h3>
            <p>
              <b>{confirmDelete.name_bn || confirmDelete.name}</b> স্থায়ীভাবে তালিকা
              থেকে সরে যাবে। এর সাথে যুক্ত আপলোড করা ভিডিও/ছবিও Storage থেকে মুছে যাবে।
            </p>
            <div className="pa-modal-actions">
              <button type="button" className="btn-danger" onClick={doDelete}>
                <FiTrash2 size={15} /> হ্যাঁ, ডিলিট করুন
              </button>
              <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(null)}>
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- রিসেট কনফার্ম ---------------- */}
      {confirmReset && (
        <div className="pa-modal-wrap" role="dialog" aria-modal="true">
          <div className="pa-modal-scrim" onClick={() => setConfirmReset(false)} />
          <div className="pa-modal">
            <div className="pa-modal-ico">
              <FiRotateCcw size={22} />
            </div>
            <h3>সব প্রোডাক্ট সরাবেন?</h3>
            <p>
              তালিকার সব প্রোডাক্ট মুছে যাবে{isRemote ? ' (Supabase থেকেও)' : ''}। এই কাজ
              ফেরানো যাবে না — আগে ব্যাকআপ নিয়ে রাখুন।
            </p>
            <div className="pa-modal-actions">
              <button type="button" className="btn-danger" onClick={doReset}>
                <FiRotateCcw size={15} /> হ্যাঁ, সব সরান
              </button>
              <button type="button" className="btn-ghost" onClick={() => setConfirmReset(false)}>
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
