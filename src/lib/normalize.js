/**
 * normalize.js — প্রোডাক্টের একটাই ক্যানোনিকাল শেপ
 * ------------------------------------------------------------
 * আগের সমস্যা: অ্যাডমিন camelCase-এ লিখত (`bn`, `oldPrice`, `reviews`,
 * `category`), কিন্তু পাবলিক পেজ আর Supabase snake_case পড়ে
 * (`name_bn`, `old_price`, `reviews_count`, `category_id`)।
 * ফলে অ্যাডমিন থেকে যোগ করা প্রোডাক্টের দাম/নাম/লিঙ্ক ভাঙত।
 *
 * এখন সব জায়গা এই একটাই শেপ ব্যবহার করে — snake_case, কারণ
 * Supabase-এর কলামও তাই এবং পাবলিক পেজও তাই পড়ে।
 */

/* ---------------- slug ---------------- */

export const slugify = (text, fallback = 'product') =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || fallback;

/** একই slug দুবার এলে `-2`, `-3` … বসিয়ে ইউনিক করে। */
export const uniqueSlug = (base, taken = []) => {
  const set = new Set((taken || []).filter(Boolean));
  const seed = slugify(base);
  if (!set.has(seed)) return seed;
  let n = 2;
  while (set.has(`${seed}-${n}`)) n += 1;
  return `${seed}-${n}`;
};

/* ---------------- media ---------------- */

const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v|m3u8)(\?.*)?$/i;

/** ভিডিও এন্ট্রি স্ট্রিং বা `{url}` — দুটোই স্ট্রিং URL-এ নামিয়ে আনে। */
export const normalizeVideos = (list) =>
  (Array.isArray(list) ? list : [])
    .map((v) => (typeof v === 'string' ? v : v?.url || v?.src || ''))
    .map((v) => String(v || '').trim())
    .filter(Boolean);

export const normalizeImages = (list, legacyImage) => {
  const out = (Array.isArray(list) ? list : [])
    .map((v) => (typeof v === 'string' ? v : v?.url || v?.src || ''))
    .map((v) => String(v || '').trim())
    .filter(Boolean);
  if (out.length) return out;
  return typeof legacyImage === 'string' && legacyImage ? [legacyImage] : [];
};

export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/')) return false;
  return VIDEO_EXT.test(url);
};

/* ---------------- numbers ---------------- */

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const bool = (v, fallback = false) => {
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return !['false', '0', 'no', ''].includes(v.toLowerCase());
  return Boolean(v);
};

/* ---------------- product ---------------- */

/**
 * যেকোনো সোর্স (Supabase row / localStorage / পুরনো camelCase রেকর্ড)
 * → ক্যানোনিকাল প্রোডাক্ট।
 */
export const toProduct = (raw) => {
  const p = raw && typeof raw === 'object' ? raw : {};

  const price = num(p.price);
  // old_price কখনোই price-এর চেয়ে ছোট হবে না — নাহলে ছাড়ের হিসাব ভাঙে।
  const oldPrice = Math.max(price, num(p.old_price ?? p.oldPrice));

  const name = String(p.name || p.name_bn || p.bn || '').trim();
  const nameBn = String(p.name_bn || p.bn || p.name || '').trim();

  return {
    id: String(p.id || ''),
    slug: String(p.slug || '').trim() || slugify(nameBn || name),
    name: name || nameBn || 'Product',
    name_bn: nameBn || name || 'পণ্য',
    category_id: String(p.category_id || p.category || ''),
    price,
    old_price: oldPrice,
    stock: Math.max(0, num(p.stock)),
    description: String(p.description || p.desc || ''),
    images: normalizeImages(p.images, p.image),
    videos: normalizeVideos(p.videos),
    video_autoplay: bool(p.video_autoplay ?? p.videoAutoplay),
    badge: String(p.badge || ''),
    tag: String(p.tag || ''),
    rating: Math.min(5, Math.max(0, num(p.rating, 5))),
    reviews_count: Math.max(0, num(p.reviews_count ?? p.reviews)),
    colors: Array.isArray(p.colors) ? p.colors.filter(Boolean) : [],
    features: Array.isArray(p.features) ? p.features.filter(Boolean) : [],
    featured: bool(p.featured) || p.badge === 'bestSeller',
    free_delivery: bool(p.free_delivery ?? p.freeDelivery),
    active: p.active === undefined ? true : bool(p.active, true),
    sort_order: num(p.sort_order, 0),
    created_at: p.created_at || p.createdAt || new Date().toISOString(),
    updated_at: p.updated_at || p.updatedAt || new Date().toISOString(),
  };
};

/** ক্যানোনিকাল প্রোডাক্ট → Supabase row (শুধু টেবিলে থাকা কলামগুলো)। */
export const toRow = (product) => {
  const p = toProduct(product);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    name_bn: p.name_bn,
    category_id: p.category_id || null,
    price: p.price,
    old_price: p.old_price,
    stock: p.stock,
    description: p.description,
    images: p.images,
    videos: p.videos,
    video_autoplay: p.video_autoplay,
    badge: p.badge,
    tag: p.tag,
    rating: p.rating,
    reviews_count: p.reviews_count,
    colors: p.colors,
    features: p.features,
    featured: p.featured,
    free_delivery: p.free_delivery,
    active: p.active,
    sort_order: p.sort_order,
    updated_at: new Date().toISOString(),
  };
};

/** অ্যাডমিন ফর্মের খালি ড্রাফট। */
export const emptyProduct = (categoryId = '') => ({
  id: '',
  slug: '',
  name: '',
  name_bn: '',
  category_id: categoryId,
  price: '',
  old_price: '',
  stock: '',
  description: '',
  images: [],
  videos: [],
  video_autoplay: false,
  badge: '',
  tag: '',
  rating: '5',
  reviews_count: '0',
  featured: false,
  free_delivery: false,
  active: true,
});

/** ক্যানোনিকাল প্রোডাক্ট → অ্যাডমিন ফর্মের ড্রাফট (সব মান স্ট্রিং)। */
export const toDraft = (product) => {
  const p = toProduct(product);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    name_bn: p.name_bn,
    category_id: p.category_id,
    price: String(p.price ?? ''),
    old_price: String(p.old_price ?? ''),
    stock: String(p.stock ?? ''),
    description: p.description,
    images: p.images,
    videos: p.videos,
    video_autoplay: p.video_autoplay,
    badge: p.badge,
    tag: p.tag,
    rating: String(p.rating ?? 5),
    reviews_count: String(p.reviews_count ?? 0),
    featured: p.featured,
    free_delivery: p.free_delivery,
    active: p.active,
  };
};

/* ---------------- category ---------------- */

export const toCategory = (raw, index = 0) => {
  const c = raw && typeof raw === 'object' ? raw : {};
  const name = String(c.name || c.name_bn || c.id || '');
  const nameEn = String(c.nameEn || c.name_en || c.name || c.id || '');
  const order = num(c.sort_order ?? c.order, index);
  return {
    id: String(c.id || ''),
    name,
    name_bn: String(c.name_bn || c.name || c.id || ''),
    // পুরনো CategoryAdmin `nameEn` / `order` ব্যবহার করে — দুটোই রাখা হলো
    nameEn,
    name_en: nameEn,
    image: String(c.image || ''),
    sort_order: order,
    order,
    active: c.active === undefined ? true : bool(c.active, true),
  };
};

/* ---------------- order ---------------- */

export const toOrder = (raw) => {
  const o = raw && typeof raw === 'object' ? raw : {};
  return {
    id: String(o.id || o.order_code || ''),
    order_code: String(o.order_code || o.id || ''),
    customer_name: String(o.customer_name || o.customer?.name || ''),
    customer_phone: String(o.customer_phone || o.customer?.phone || ''),
    customer_address: String(o.customer_address || o.customer?.address || ''),
    items: Array.isArray(o.items) ? o.items : [],
    subtotal: num(o.subtotal),
    shipping: num(o.shipping),
    discount: num(o.discount),
    total: num(o.total),
    payment: String(o.payment || 'cod'),
    status: String(o.status || 'new'),
    note: String(o.note || ''),
    created_at: o.created_at || o.createdAt || new Date().toISOString(),
  };
};
