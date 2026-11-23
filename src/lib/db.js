/**
 * db.js — একটাই ডেটা লেয়ার (Supabase ⇄ localStorage)
 * ------------------------------------------------------------
 * আগের সবচেয়ে বড় বাগ:
 *   • অ্যাডমিন শুধু localStorage-এ লিখত
 *   • পাবলিক পেজ Supabase থেকে পড়ত
 *   → অ্যাডমিনে যা যোগ করতেন, লাইভ সাইটে কখনো আসত না।
 *
 * এখন সব রিড/রাইট এই একটাই ফাইল দিয়ে যায়:
 *   ১. Supabase কনফিগার থাকলে → আসল ডেটাবেস (সব ডিভাইসে এক)
 *   ২. না থাকলে বা নেটওয়ার্ক ফেল করলে → localStorage (ডেমো মোড)
 *   ৩. প্রতিটা রাইটের পর একটা ইভেন্ট — সব কম্পোনেন্ট সাথে সাথে আপডেট
 *
 * প্রতিটা ফাংশন `{ ok, data, error, source }` ফেরত দেয়, তাই UI
 * কখনো চুপচাপ ব্যর্থ হয় না — ইউজার আসল কারণ দেখতে পায়।
 */
import { supabase, isSupabaseConfigured } from './supabase.js';
import {
  toProduct,
  toRow,
  toCategory,
  toOrder,
  normalizeVideos,
} from './normalize.js';

/* ==========================================================
   ইভেন্ট + লোকাল স্টোরেজ
   ========================================================== */

export const EVENTS = {
  products: 'impotech-products-change',
  categories: 'impotech-categories-change',
  orders: 'impotech-orders-change',
  coupons: 'impotech-coupons-change',
  reviews: 'impotech-reviews-change',
  site: 'impotech-site-change',
};

export const KEYS = {
  products: 'impotech_products',
  categories: 'impotech_categories',
  orders: 'impotech_orders',
  coupons: 'impotech_coupons',
  reviews: 'impotech_reviews',
  site: 'impotech_site',
};

export const isRemote = () => Boolean(isSupabaseConfigured && supabase);

const emit = (name, detail) => {
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    /* SSR / non-browser — কিছু করার নেই */
  }
};

export const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

/** true = লেখা সত্যিই জমেছে (কোটা ভরে গেলে false)। */
export const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[db] ${key} লোকাল স্টোরেজে লেখা যায়নি`, err);
    return false;
  }
};

const ok = (data, source) => ({ ok: true, data, error: null, source });
const fail = (error, source = 'local') => ({
  ok: false,
  data: null,
  error: error?.message || String(error || 'অজানা ত্রুটি'),
  source,
});

/** Supabase এরর → বাংলা, বোধগম্য বার্তা। */
export const explainError = (err) => {
  const msg = String(err?.message || err || '');
  const code = String(err?.code || '');

  if (/Failed to fetch|NetworkError|Load failed/i.test(msg))
    return 'নেটওয়ার্ক সমস্যা — ইন্টারনেট চেক করে আবার চেষ্টা করুন।';
  if (code === '42P01' || /relation .* does not exist/i.test(msg))
    return 'ডেটাবেস টেবিল পাওয়া যায়নি — Supabase-এ supabase/schema.sql চালান।';
  if (code === '42501' || /row-level security|permission denied/i.test(msg))
    return 'অনুমতি নেই (RLS) — Supabase-এ supabase/schema.sql-এর পলিসি চালান।';
  if (code === '23505' || /duplicate key/i.test(msg))
    return 'এই আইডি/স্লাগ আগেই আছে — অন্য নাম দিন।';
  if (/JWT|apikey|Invalid API key/i.test(msg))
    return 'Supabase key ভুল — Vercel-এ VITE_SUPABASE_URL / ANON_KEY ঠিক করুন।';
  if (/Bucket not found/i.test(msg))
    return 'Storage bucket নেই — Supabase-এ supabase/storage.sql চালান।';
  if (/exceeded the maximum allowed size|Payload too large/i.test(msg))
    return 'ফাইল সাইজ Supabase-এর সীমার বেশি — ছোট ভিডিও দিন বা সীমা বাড়ান।';
  return msg || 'অজানা ত্রুটি';
};

/* ==========================================================
   PRODUCTS
   ========================================================== */

const PRODUCT_COLUMNS =
  'id,slug,name,name_bn,category_id,price,old_price,stock,description,' +
  'images,videos,video_autoplay,badge,tag,rating,reviews_count,colors,' +
  'features,featured,free_delivery,active,sort_order,created_at,updated_at';

/** সব প্রোডাক্ট — Supabase থাকলে সেখান থেকে, নাহলে লোকাল। */
export const fetchProducts = async () => {
  if (isRemote()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_COLUMNS)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data || []).map(toProduct).filter((p) => p.id);
      // রিমোট খালি হলে লোকাল ক্যাশ রাখি না — সত্যিই খালি
      writeLocal(KEYS.products, list);
      return ok(list, 'supabase');
    } catch (err) {
      console.warn('[db] products রিমোট থেকে পড়া যায়নি', err);
      const local = readLocal(KEYS.products, []);
      return {
        ok: false,
        data: (Array.isArray(local) ? local : []).map(toProduct),
        error: explainError(err),
        source: 'local',
      };
    }
  }
  const local = readLocal(KEYS.products, []);
  return ok((Array.isArray(local) ? local : []).map(toProduct), 'local');
};

/** এক প্রোডাক্ট সেভ (নতুন হলে insert, পুরনো হলে update)। */
export const saveProduct = async (product) => {
  const clean = toProduct(product);
  if (!clean.id) return fail('প্রোডাক্ট আইডি নেই');

  if (isRemote()) {
    try {
      const row = toRow(clean);
      const { data, error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'id' })
        .select(PRODUCT_COLUMNS)
        .maybeSingle();
      if (error) throw error;
      const saved = toProduct(data || row);
      // লোকাল ক্যাশ আপডেট (অফলাইনে পড়ার জন্য)
      const local = readLocal(KEYS.products, []);
      const list = Array.isArray(local) ? local : [];
      const idx = list.findIndex((p) => p.id === saved.id);
      const next = idx >= 0
        ? list.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...list];
      writeLocal(KEYS.products, next);
      emit(EVENTS.products, next);
      return ok(saved, 'supabase');
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }

  const local = readLocal(KEYS.products, []);
  const list = Array.isArray(local) ? local : [];
  const idx = list.findIndex((p) => p.id === clean.id);
  const next = idx >= 0
    ? list.map((p) => (p.id === clean.id ? clean : p))
    : [clean, ...list];
  if (!writeLocal(KEYS.products, next)) {
    return fail('ব্রাউজার স্টোরেজ পূর্ণ — ছবি/ভিডিওর সাইজ কমান');
  }
  emit(EVENTS.products, next);
  return ok(clean, 'local');
};

export const deleteProduct = async (id) => {
  if (isRemote()) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  const local = readLocal(KEYS.products, []);
  const next = (Array.isArray(local) ? local : []).filter((p) => p.id !== id);
  writeLocal(KEYS.products, next);
  emit(EVENTS.products, next);
  return ok(next, isRemote() ? 'supabase' : 'local');
};

/** পুরো তালিকা একবারে সেভ (রিসেট / বাল্ক ইমপোর্ট)। */
export const replaceProducts = async (list) => {
  const clean = (Array.isArray(list) ? list : []).map(toProduct).filter((p) => p.id);
  if (isRemote()) {
    try {
      const { error } = await supabase
        .from('products')
        .upsert(clean.map(toRow), { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  if (!writeLocal(KEYS.products, clean)) {
    return fail('ব্রাউজার স্টোরেজ পূর্ণ');
  }
  emit(EVENTS.products, clean);
  return ok(clean, isRemote() ? 'supabase' : 'local');
};

/* ==========================================================
   CATEGORIES
   ========================================================== */

export const fetchCategories = async () => {
  if (isRemote()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id,name,name_bn,image,sort_order,active')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const list = (data || []).map(toCategory).filter((c) => c.id);
      writeLocal(KEYS.categories, list);
      return ok(list, 'supabase');
    } catch (err) {
      const local = readLocal(KEYS.categories, []);
      return {
        ok: false,
        data: (Array.isArray(local) ? local : []).map(toCategory),
        error: explainError(err),
        source: 'local',
      };
    }
  }
  const local = readLocal(KEYS.categories, []);
  return ok((Array.isArray(local) ? local : []).map(toCategory), 'local');
};

export const saveCategories = async (list) => {
  const clean = (Array.isArray(list) ? list : [])
    .map((c, i) => toCategory(c, i))
    .filter((c) => c.id);

  if (isRemote()) {
    try {
      const { error } = await supabase
        .from('categories')
        .upsert(clean, { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  if (!writeLocal(KEYS.categories, clean)) return fail('ব্রাউজার স্টোরেজ পূর্ণ');
  emit(EVENTS.categories, clean);
  return ok(clean, isRemote() ? 'supabase' : 'local');
};

/* ==========================================================
   ORDERS
   ========================================================== */

export const fetchOrders = async () => {
  if (isRemote()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data || []).map(toOrder);
      writeLocal(KEYS.orders, list);
      return ok(list, 'supabase');
    } catch (err) {
      const local = readLocal(KEYS.orders, []);
      return {
        ok: false,
        data: (Array.isArray(local) ? local : []).map(toOrder),
        error: explainError(err),
        source: 'local',
      };
    }
  }
  const local = readLocal(KEYS.orders, []);
  return ok((Array.isArray(local) ? local : []).map(toOrder), 'local');
};

export const updateOrderStatus = async (id, status) => {
  if (isRemote()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  const local = readLocal(KEYS.orders, []);
  const next = (Array.isArray(local) ? local : []).map((o) =>
    o.id === id ? { ...o, status } : o
  );
  writeLocal(KEYS.orders, next);
  emit(EVENTS.orders, next);
  return ok(next, isRemote() ? 'supabase' : 'local');
};

export const deleteOrder = async (id) => {
  if (isRemote()) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  const local = readLocal(KEYS.orders, []);
  const next = (Array.isArray(local) ? local : []).filter((o) => o.id !== id);
  writeLocal(KEYS.orders, next);
  emit(EVENTS.orders, next);
  return ok(next, isRemote() ? 'supabase' : 'local');
};

/* ==========================================================
   COUPONS / REVIEWS (লোকাল-ফার্স্ট, রিমোট থাকলে সিঙ্ক)
   ========================================================== */

export const fetchCoupons = async () => {
  if (isRemote()) {
    try {
      const { data, error } = await supabase.from('coupons').select('*');
      if (error) throw error;
      const list = data || [];
      writeLocal(KEYS.coupons, list);
      return ok(list, 'supabase');
    } catch (err) {
      return {
        ok: false,
        data: readLocal(KEYS.coupons, []),
        error: explainError(err),
        source: 'local',
      };
    }
  }
  return ok(readLocal(KEYS.coupons, []), 'local');
};

export const saveCoupons = async (list) => {
  const clean = Array.isArray(list) ? list : [];
  if (isRemote()) {
    try {
      const { error } = await supabase.from('coupons').upsert(clean, { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  if (!writeLocal(KEYS.coupons, clean)) return fail('ব্রাউজার স্টোরেজ পূর্ণ');
  emit(EVENTS.coupons, clean);
  return ok(clean, isRemote() ? 'supabase' : 'local');
};

export const fetchReviews = async () => {
  if (isRemote()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = data || [];
      writeLocal(KEYS.reviews, list);
      return ok(list, 'supabase');
    } catch (err) {
      return {
        ok: false,
        data: readLocal(KEYS.reviews, []),
        error: explainError(err),
        source: 'local',
      };
    }
  }
  return ok(readLocal(KEYS.reviews, []), 'local');
};

export const saveReviews = async (list) => {
  const clean = Array.isArray(list) ? list : [];
  if (isRemote()) {
    try {
      const { error } = await supabase.from('reviews').upsert(clean, { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  if (!writeLocal(KEYS.reviews, clean)) return fail('ব্রাউজার স্টোরেজ পূর্ণ');
  emit(EVENTS.reviews, clean);
  return ok(clean, isRemote() ? 'supabase' : 'local');
};

/* ==========================================================
   SITE SETTINGS
   ========================================================== */

export const SITE_TABLE = 'site_settings';
export const SITE_ROW_KEY = 'site';

export const fetchSiteSettings = async () => {
  if (isRemote()) {
    try {
      const { data, error } = await supabase
        .from(SITE_TABLE)
        .select('value')
        .eq('key', SITE_ROW_KEY)
        .maybeSingle();
      if (error) throw error;
      const value = data?.value;
      if (!value || typeof value !== 'object' || !Object.keys(value).length) {
        return ok(null, 'supabase');
      }
      writeLocal(KEYS.site, value);
      return ok(value, 'supabase');
    } catch (err) {
      return {
        ok: false,
        data: readLocal(KEYS.site, null),
        error: explainError(err),
        source: 'local',
      };
    }
  }
  return ok(readLocal(KEYS.site, null), 'local');
};

export const pushSiteSettings = async (config) => {
  if (isRemote()) {
    try {
      const { error } = await supabase
        .from(SITE_TABLE)
        .upsert(
          { key: SITE_ROW_KEY, value: config, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (error) throw error;
      return ok(config, 'supabase');
    } catch (err) {
      return fail(explainError(err), 'supabase');
    }
  }
  return ok(config, 'local');
};

/* ==========================================================
   MEDIA — ভিডিও/ছবি Supabase Storage-এ
   ========================================================== */

export const MEDIA_BUCKET = 'product-media';

/** Storage-এ আপলোড করা যায় কি না (কনফিগার + bucket)। */
export const canUploadMedia = () => isRemote();

/**
 * ফাইল আপলোড করে পাবলিক URL ফেরত দেয়।
 * @param {File} file
 * @param {{kind?:'video'|'image', folder?:string, onProgress?:(pct:number)=>void}} opts
 */
export const uploadMedia = async (file, opts = {}) => {
  const { kind = 'video', folder = 'products', onProgress } = opts;

  if (!file) return fail('ফাইল পাওয়া যায়নি');
  if (!isRemote()) {
    return fail(
      'Supabase কনফিগার নেই — ভিডিও আপলোড করা যাবে না। ' +
        'Vercel-এ VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY দিন, ' +
        'অথবা হোস্ট করা ভিডিওর লিঙ্ক পেস্ট করুন।'
    );
  }

  const ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
  const safeExt = /^[a-z0-9]{2,5}$/.test(ext)
    ? ext
    : kind === 'video'
    ? 'mp4'
    : 'jpg';
  const base = String(file.name || 'file')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file';
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${base}.${safeExt}`;

  try {
    onProgress?.(5);
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type || undefined,
      });
    if (error) throw error;
    onProgress?.(90);

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('পাবলিক URL পাওয়া যায়নি');
    onProgress?.(100);

    return ok({ url: data.publicUrl, path }, 'supabase');
  } catch (err) {
    return fail(explainError(err), 'supabase');
  }
};

/** Storage থেকে ফাইল মুছে ফেলে (প্রোডাক্ট ডিলিটে ব্যবহার)। */
export const removeMedia = async (url) => {
  if (!isRemote() || !url) return ok(null, 'local');
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const idx = String(url).indexOf(marker);
  if (idx < 0) return ok(null, 'local'); // বাইরের লিঙ্ক — ছোঁব না
  const path = decodeURIComponent(String(url).slice(idx + marker.length));
  try {
    const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    if (error) throw error;
    return ok(path, 'supabase');
  } catch (err) {
    return fail(explainError(err), 'supabase');
  }
};

/* ==========================================================
   হেল্পার
   ========================================================== */

/** ভিডিও লিস্ট নরমালাইজ (পুরনো `{url}` ফরম্যাটসহ)। */
export const cleanVideos = normalizeVideos;

/** ডেটা সোর্সের নাম — UI-তে ব্যাজ দেখানোর জন্য। */
export const dataSourceLabel = () =>
  isRemote() ? 'Supabase (লাইভ)' : 'লোকাল (ডেমো)';
