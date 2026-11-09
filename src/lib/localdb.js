/**
 * localdb.js — ডেমো মোডের ডেটা (localStorage)
 * ------------------------------------------------------------
 * অ্যাডমিন অ্যাপের সাথে একই key ('impotech_admin_db_v1') ব্যবহার করে,
 * তাই একই ব্রাউজারে অ্যাডমিন থেকে যোগ করা প্রোডাক্ট/সার্ভিস সাইটে দেখা যায়।
 * Supabase কনফিগার থাকলে এই মডিউল ব্যবহার হয় না।
 */

const KEY = 'impotech_admin_db_v1';

/** অ্যাডমিনের seed-এর সাথে মিল রাখতে একই placeholder */
export const ph = (label = 'IMPOTECH', bg = '#1a1a20', fg = '#f0b429') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect width="600" height="600" fill="${bg}"/>
      <text x="50%" y="50%" fill="${fg}" font-family="sans-serif" font-size="42"
        font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>`
  );

const now = () => new Date().toISOString();
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

/** অ্যাডমিন না খুললে সাইট একা চলার জন্য ন্যূনতম seed */
function seed() {
  const cats = [
    { id: 'cat-angel', name: 'Angel Wings', name_bn: 'অ্যাঞ্জেল উইংস', image: ph('Angel Wings'), sort_order: 0, active: true, created_at: now() },
    { id: 'cat-led', name: 'LED Light', name_bn: 'LED লাইট', image: ph('LED Light'), sort_order: 1, active: true, created_at: now() },
    { id: 'cat-bike', name: 'Bike Accessories', name_bn: 'বাইক অ্যাকসেসরিজ', image: ph('Bike'), sort_order: 2, active: true, created_at: now() },
    { id: 'cat-gear', name: 'Riding Gear', name_bn: 'রাইডিং গিয়ার', image: ph('Riding Gear'), sort_order: 3, active: true, created_at: now() },
    { id: 'cat-horn', name: 'Horn & Siren', name_bn: 'হর্ন ও সাইরেন', image: ph('Horn'), sort_order: 4, active: true, created_at: now() },
    { id: 'cat-holder', name: 'Phone Holder', name_bn: 'মোবাইল হোল্ডার', image: ph('Holder'), sort_order: 5, active: true, created_at: now() },
  ];

  const P = (i, name, name_bn, cat, price, old, stock, badge, tag, featured, desc) => ({
    id: 'prod-' + i,
    name,
    name_bn,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category_id: cat,
    price,
    old_price: old,
    stock,
    description: desc,
    images: [ph(name_bn || name)],
    videos: [],
    video_autoplay: false,
    badge,
    tag,
    rating: 4.5,
    reviews_count: 12,
    colors: [],
    features: [],
    featured,
    active: true,
    created_at: daysAgo(20 - i),
  });

  const products = [
    P(1, 'Angel Wings LED', 'অ্যাঞ্জেল উইংস LED', 'cat-angel', 850, 1200, 24, 'হট', 'new', true, 'গাড়ি ও বাইকের জন্য প্রিমিয়াম অ্যাঞ্জেল উইংস LED লাইট।'),
    P(2, 'RGB Strip Light 2m', 'RGB স্ট্রিপ লাইট ২মিটার', 'cat-led', 450, 650, 40, '', 'sale', true, 'রিমোট কন্ট্রোলসহ ২ মিটার RGB LED স্ট্রিপ।'),
    P(3, 'Bike Phone Holder', 'বাইক মোবাইল হোল্ডার', 'cat-holder', 350, 500, 60, '', '', false, 'শক্তিশালী গ্রিপ, যেকোনো মোবাইলের জন্য।'),
    P(4, 'Riding Gloves Pro', 'রাইডিং গ্লাভস প্রো', 'cat-gear', 690, 900, 18, 'নতুন', 'new', true, 'নখর-সুরক্ষা ও গ্রিপসহ প্রিমিয়াম রাইডিং গ্লাভস।'),
    P(5, 'Loud Horn 12V', 'লাউড হর্ন ১২V', 'cat-horn', 550, 750, 30, '', '', false, 'উচ্চ ডেসিবেল হর্ন, সহজ ইনস্টলেশন।'),
    P(6, 'Headlight LED H4', 'হেডলাইট LED H4', 'cat-led', 1250, 1600, 12, 'হট', 'hot', true, 'উজ্জ্বল ও দীর্ঘস্থায়ী LED হেডলাইট বাল্ব।'),
    P(7, 'Bike Cover Waterproof', 'বাইক কভার ওয়াটারপ্রুফ', 'cat-bike', 780, 1000, 22, '', '', false, 'বৃষ্টি ও ধুলো থেকে সুরক্ষা।'),
    P(8, 'Siren Police Sound', 'সাইরেন পুলিশ সাউন্ড', 'cat-horn', 420, 0, 0, '', '', false, 'মাল্টি-টোন পুলিশ সাইরেন।'),
    P(9, 'Knee Guard Set', 'নি গার্ড সেট', 'cat-gear', 950, 1300, 15, '', 'sale', false, 'রাইডিংয়ের সময় হাঁটু সুরক্ষা।'),
    P(10, 'Angel Wings RGB', 'অ্যাঞ্জেল উইংস RGB', 'cat-angel', 1100, 1450, 8, 'প্রিমিয়াম', 'new', true, 'মাল্টি-কালার RGB অ্যাঞ্জেল উইংস।'),
  ];

  const reviews = [
    { id: 'rev-1', product_id: 'prod-1', customer_name: 'রাকিব হাসান', rating: 5, text: 'দুর্দান্ত কোয়ালিটি!', status: 'approved', created_at: daysAgo(2) },
    { id: 'rev-2', product_id: 'prod-2', customer_name: 'সাদিয়া আক্তার', rating: 4, text: 'ভালো, তবে ডেলিভারি একটু দেরি।', status: 'approved', created_at: daysAgo(4) },
    { id: 'rev-3', product_id: 'prod-6', customer_name: 'তানভীর আহমেদ', rating: 5, text: 'খুব উজ্জ্বল, দামের তুলনায় সেরা।', status: 'approved', created_at: daysAgo(7) },
  ];

  const services = [
    { id: 'srv-1', name: 'Home Delivery', name_bn: 'হোম ডেলিভারি', slug: 'home-delivery', icon: '🚚', short_desc: 'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি।', description: 'আমরা সারা বাংলাদেশে ২–৪ কর্মদিবসের মধ্যে পণ্য পৌঁছে দিই।', price: 80, duration: '২–৪ দিন', status: 'active', sort_order: 0, images: [ph('DELIVERY', '#0a1226')], videos: [], created_at: daysAgo(10) },
    { id: 'srv-2', name: 'Installation Service', name_bn: 'ইনস্টলেশন সার্ভিস', slug: 'installation-service', icon: '🔧', short_desc: 'পণ্য কেনার সাথে ফ্রি ইনস্টলেশন।', description: 'LED লাইট, হর্ন বা যেকোনো অ্যাকসেসরির প্রফেশনাল ইনস্টলেশন।', price: 0, duration: '১ দিন', status: 'active', sort_order: 1, images: [ph('INSTALL', '#07130f')], videos: [], created_at: daysAgo(9) },
    { id: 'srv-3', name: 'Warranty & Replacement', name_bn: 'ওয়ারেন্টি ও রিপ্লেসমেন্ট', slug: 'warranty-replacement', icon: '🛡️', short_desc: '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি।', description: 'পণ্য পাওয়ার ৭ দিনের মধ্যে কোনো সমস্যা থাকলে বিনামূল্যে রিপ্লেসমেন্ট।', price: 0, duration: '৭ দিন', status: 'active', sort_order: 2, images: [ph('WARRANTY', '#150a1c')], videos: [], created_at: daysAgo(8) },
    { id: 'srv-4', name: 'Cash on Delivery', name_bn: 'ক্যাশ অন ডেলিভারি', slug: 'cash-on-delivery', icon: '💵', short_desc: 'পণ্য হাতে পেয়ে টাকা দিন।', description: 'সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।', price: 0, duration: 'সাথে সাথে', status: 'active', sort_order: 3, images: [ph('COD', '#0a1226')], videos: [], created_at: daysAgo(7) },
    { id: 'srv-5', name: 'Bulk / Wholesale Order', name_bn: 'বাল্ক / পাইকারি অর্ডার', slug: 'bulk-wholesale-order', icon: '📦', short_desc: 'পাইকারি দামে বাল্ক অর্ডার।', description: 'দোকানদার ও রিসেলারদের জন্য বিশেষ পাইকারি দাম।', price: 0, duration: '৩–৭ দিন', status: 'active', sort_order: 4, images: [ph('BULK', '#07130f')], videos: [], created_at: daysAgo(6) },
  ];

  const faqs = [
    { id: 'faq-1', question: 'ডেলিভারি কত দিনে পাব?', answer: 'ঢাকার ভেতরে ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ৩–৫ কর্মদিবস।', category: 'delivery', sort_order: 0, active: true, created_at: daysAgo(12) },
    { id: 'faq-2', question: 'ক্যাশ অন ডেলিভারি আছে?', answer: 'হ্যাঁ, সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা আছে।', category: 'payment', sort_order: 1, active: true, created_at: daysAgo(12) },
    { id: 'faq-3', question: 'পণ্য রিটার্ন করতে পারব?', answer: 'পণ্য পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় রিটার্ন করা যাবে।', category: 'return', sort_order: 2, active: true, created_at: daysAgo(12) },
    { id: 'faq-4', question: 'অর্ডার ট্র্যাক করব কীভাবে?', answer: 'অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে সাইটের "ট্র্যাক অর্ডার" পেজ থেকে ট্র্যাক করতে পারবেন।', category: 'order', sort_order: 3, active: true, created_at: daysAgo(12) },
    { id: 'faq-5', question: 'ওয়ারেন্টি আছে কি?', answer: 'প্রতিটি পণ্যে ৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি আছে।', category: 'product', sort_order: 4, active: true, created_at: daysAgo(12) },
  ];

  const policies = [
    { id: 'pol-1', title: 'রিটার্ন পলিসি', slug: 'return-policy', type: 'return', body: 'পণ্য পাওয়ার ৭ দিনের মধ্যে অক্ষত ও অব্যবহৃত অবস্থায় রিটার্ন করা যাবে।', active: true, created_at: daysAgo(20) },
    { id: 'pol-2', title: 'রিফান্ড পলিসি', slug: 'refund-policy', type: 'refund', body: 'রিটার্ন অনুমোদিত হলে ৫–৭ কর্মদিবসের মধ্যে বিকাশ/নগদ/রকেট বা ব্যাংকে রিফান্ড দেওয়া হয়।', active: true, created_at: daysAgo(20) },
    { id: 'pol-3', title: 'শিপিং পলিসি', slug: 'shipping-policy', type: 'shipping', body: 'ঢাকার ভেতরে ডেলিভারি চার্জ ৮০ টাকা, ঢাকার বাইরে ১৩০ টাকা। ২০০০ টাকার উপরে ফ্রি।', active: true, created_at: daysAgo(20) },
    { id: 'pol-4', title: 'প্রাইভেসি পলিসি', slug: 'privacy-policy', type: 'privacy', body: 'আমরা আপনার ব্যক্তিগত তথ্য শুধু অর্ডার প্রসেসিংয়ের জন্য ব্যবহার করি।', active: true, created_at: daysAgo(20) },
    { id: 'pol-5', title: 'শর্তাবলী', slug: 'terms', type: 'terms', body: 'সাইট ব্যবহার করে অর্ডার করলে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন।', active: true, created_at: daysAgo(20) },
  ];

  const settings = {
    identity: {
      siteName: 'ইম্পোটেক', siteNameEn: 'IMPOTECH',
      tagline: 'চায়না থেকে সরাসরি আমদানি — প্রিমিয়াম বাইক অ্যাকসেসরিজ',
      logo: '', favicon: '', copyright: '© {year} ইম্পোটেক — সর্বস্বত্ব সংরক্ষিত।',
    },
    theme: { accent: '#f0b429', accentDark: '#c9920f', fontScale: 100, radius: 18, mode: 'dark' },
    contact: {
      phone: '01884332067', email: 'support@impotech.com.bd', address: 'ঢাকা, বাংলাদেশ',
      hours: 'সকাল ১০টা — রাত ১০টা', whatsapp: '01884332067',
      facebook: '', instagram: '', youtube: '', tiktok: '',
    },
    checkout: {
      deliveryCharge: 80, freeDeliveryAbove: 2000, codEnabled: true,
      bkashEnabled: true, bkashNumber: '01884332067',
      nagadEnabled: true, nagadNumber: '01884332067',
      rocketEnabled: false, rocketNumber: '',
      paymentNote: 'বিকাশ/নগদে টাকা পাঠিয়ে ট্রানজেকশন আইডি অর্ডার নোটে লিখুন।',
      confirmMessage: 'ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি।',
    },
    background: { type: 'color', color: '#08080a', image: '', overlay: 45, blur: 0 },
    home: {
      slides: [
        { image: ph('IMPOTECH', '#0a1226'), tag: 'নতুন কালেকশন', title: 'প্রিমিয়াম বাইক অ্যাকসেসরিজ', text: 'চায়না থেকে সরাসরি আমদানি — সেরা দামে।', cta: 'কেনাকাটা করুন', link: '/shop' },
        { image: ph('LED LIGHT', '#07130f'), tag: 'অফার', title: 'LED লাইটে ৩০% ছাড়', text: 'সীমিত সময়ের জন্য।', cta: 'দেখুন', link: '/shop' },
      ],
      banners: [
        { image: ph('RIDING GEAR', '#150a1c'), title: 'রাইডিং গিয়ার', text: 'নিরাপদে রাইড করুন' },
      ],
      services: [
        { title: 'ফ্রি ডেলিভারি', text: '২০০০ টাকার উপরে' },
        { title: 'ক্যাশ অন ডেলিভারি', text: 'সারা দেশে' },
        { title: '৭ দিনের রিটার্ন', text: 'শর্তসাপেক্ষে' },
      ],
    },
    newsletter: { title: 'নিউজলেটার', text: 'নতুন অফার সবার আগে পান', button: 'সাবস্ক্রাইব' },
    content: {
      about: { title: 'আমাদের সম্পর্কে', body: 'ইম্পোটেক — চায়না থেকে সরাসরি আমদানি করা প্রিমিয়াম বাইক অ্যাকসেসরিজের বিশ্বস্ত ঠিকানা।' },
      privacy: { title: 'প্রাইভেসি পলিসি', body: 'আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখি।' },
      terms: { title: 'শর্তাবলী', body: 'সাইট ব্যবহারের শর্তাবলী এখানে লিখুন।' },
      returns: { title: 'রিটার্ন পলিসি', body: 'পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করা যাবে।' },
      faq: { title: 'সাধারণ প্রশ্নোত্তর', body: '' },
    },
    seo: {
      home: { title: 'ইম্পোটেক — প্রিমিয়াম বাইক অ্যাকসেসরিজ', description: 'চায়না থেকে সরাসরি আমদানি করা বাইক অ্যাকসেসরিজ, LED লাইট ও রাইডিং গিয়ার।' },
      products: { title: 'সব প্রোডাক্ট — ইম্পোটেক', description: 'সব প্রোডাক্ট দেখুন।' },
    },
    ogImage: '',
  };

  return {
    categories: cats,
    products,
    orders: [],
    coupons: [
      { id: 'cpn-1', code: 'SAVE10', type: 'percent', value: 10, min_order: 500, expires_at: null, active: true, note: '১০% ছাড়', created_at: now() },
      { id: 'cpn-2', code: 'FLAT100', type: 'fixed', value: 100, min_order: 1000, expires_at: null, active: true, note: '১০০ টাকা ছাড়', created_at: now() },
    ],
    reviews,
    customers: [],
    invoices: [],
    courier_shipments: [],
    landing_pages: [],
    services,
    returns: [],
    warranties: [],
    campaigns: [],
    suppliers: [],
    purchases: [],
    faqs,
    policies,
    support_tickets: [],
    vendors: [],
    warehouses: [],
    site_settings: settings,
  };
}

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw);
      const base = seed();
      for (const t of Object.keys(base)) {
        if (cache[t] === undefined) cache[t] = base[t];
      }
      return cache;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('localdb read failed, reseeding', e);
  }
  cache = seed();
  write(cache);
  return cache;
}

function write(db) {
  cache = db;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('localdb write failed (quota?)', e);
  }
}

export const uid = () =>
  'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

export const localdb = {
  all(table) {
    return [...(read()[table] || [])];
  },
  find(table, id) {
    return (read()[table] || []).find((r) => r.id === id) || null;
  },
  insert(table, row) {
    const db = read();
    const rec = { id: row.id || uid(), created_at: row.created_at || now(), ...row };
    db[table] = [rec, ...(db[table] || [])];
    write(db);
    return rec;
  },
  update(table, id, patch) {
    const db = read();
    let out = null;
    db[table] = (db[table] || []).map((r) => {
      if (r.id !== id) return r;
      out = { ...r, ...patch };
      return out;
    });
    write(db);
    return out;
  },
  remove(table, id) {
    const db = read();
    db[table] = (db[table] || []).filter((r) => r.id !== id);
    write(db);
  },

  getAllSettings() {
    return { ...(read().site_settings || {}) };
  },
  getSetting(key) {
    return read().site_settings?.[key] ?? null;
  },

  listCategories() {
    const db = read();
    return [...(db.categories || [])]
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((c) => ({
        ...c,
        productCount: (db.products || []).filter((p) => p.category_id === c.id && p.active !== false).length,
      }));
  },

  listProducts({ search = '', categoryId = '', sort = 'new', minPrice = 0, maxPrice = 0, featured = false } = {}) {
    const db = read();
    const s = search.toLowerCase();
    const list = [...(db.products || [])].filter((p) => {
      if (p.active === false) return false;
      const matchS =
        !s ||
        (p.name || '').toLowerCase().includes(s) ||
        (p.name_bn || '').includes(search) ||
        (p.tag || '').toLowerCase().includes(s);
      const matchC = !categoryId || p.category_id === categoryId;
      const matchF = !featured || p.featured === true;
      const price = Number(p.price || 0);
      const matchMin = !minPrice || price >= minPrice;
      const matchMax = !maxPrice || price <= maxPrice;
      return matchS && matchC && matchF && matchMin && matchMax;
    });

    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return list.map((p) => {
      const cat = (db.categories || []).find((c) => c.id === p.category_id);
      return { ...p, categories: cat ? { name: cat.name, name_bn: cat.name_bn } : null };
    });
  },

  findProductBySlug(slug) {
    const db = read();
    const p = (db.products || []).find((x) => x.slug === slug || x.id === slug);
    if (!p) return null;
    const cat = (db.categories || []).find((c) => c.id === p.category_id);
    return { ...p, categories: cat ? { name: cat.name, name_bn: cat.name_bn } : null };
  },

  listReviews(productId) {
    return [...(read().reviews || [])]
      .filter((r) => r.product_id === productId && r.status === 'approved')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  listServices({ search = '', status = 'active' } = {}) {
    const db = read();
    const s = search.toLowerCase();
    return [...(db.services || [])]
      .filter((x) => {
        const matchS = !s || (x.name || '').toLowerCase().includes(s) || (x.name_bn || '').includes(search);
        const matchSt = !status || x.status === status;
        return matchS && matchSt;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  findService(slug) {
    return (read().services || []).find((x) => x.slug === slug) || null;
  },

  listFaqs() {
    return [...(read().faqs || [])]
      .filter((f) => f.active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  listPolicies() {
    return [...(read().policies || [])].filter((p) => p.active !== false);
  },

  findPolicy(slug) {
    return (read().policies || []).find((p) => p.slug === slug) || null;
  },

  findLandingPage(slug) {
    const db = read();
    const p = (db.landing_pages || []).find((x) => x.slug === slug && x.published !== false);
    if (!p) return null;
    const prod = (db.products || []).find((x) => x.id === p.product_id);
    return { ...p, product: prod || null };
  },

  listCoupons() {
    return [...(read().coupons || [])].filter((c) => c.active !== false);
  },

  findOrder(code, phone) {
    return (
      (read().orders || []).find(
        (o) =>
          (o.order_code || '').toLowerCase() === String(code).toLowerCase() &&
          (o.customer_phone || '') === String(phone)
      ) || null
    );
  },

  listOrdersByPhone(phone) {
    return [...(read().orders || [])]
      .filter((o) => (o.customer_phone || '') === String(phone))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  nextOrderCode() {
    const n = (read().orders || []).length + 1001;
    return 'IMP-' + n;
  },

  /** অর্ডার প্লেস — অ্যাডমিনের ডেটাতেও যায় (একই localStorage) */
  placeOrder(order) {
    const db = read();
    const code = order.order_code || 'IMP-' + ((db.orders || []).length + 1001);
    const rec = {
      id: uid(),
      status: 'new',
      created_at: now(),
      ...order,
      order_code: code,
    };
    db.orders = [rec, ...(db.orders || [])];

    // ইনভয়েসও তৈরি করি (অ্যাডমিনে দেখা যাবে)
    const invNo = `INV-${new Date().getFullYear()}-${String((db.invoices || []).length + 1).padStart(4, '0')}`;
    const inv = {
      id: uid(),
      invoice_no: invNo,
      order_id: rec.id,
      order_code: code,
      customer_name: rec.customer_name,
      customer_phone: rec.customer_phone,
      customer_address: rec.customer_address,
      items: rec.items,
      subtotal: rec.subtotal,
      shipping: rec.shipping,
      discount: rec.discount,
      coupon_code: rec.coupon_code,
      total: rec.total,
      payment_method: rec.payment_method,
      status: 'issued',
      note: '',
      issued_at: now(),
      created_at: now(),
    };
    db.invoices = [inv, ...(db.invoices || [])];

    // কাস্টমার আপডেট
    const existing = (db.customers || []).find((c) => c.phone === rec.customer_phone);
    if (existing) {
      db.customers = db.customers.map((c) =>
        c.phone === rec.customer_phone
          ? { ...c, total_orders: (c.total_orders || 0) + 1, total_spent: (c.total_spent || 0) + Number(rec.total || 0) }
          : c
      );
    } else {
      db.customers = [
        {
          id: uid(), name: rec.customer_name, phone: rec.customer_phone, email: '',
          address: rec.customer_address, total_orders: 1, total_spent: Number(rec.total || 0), created_at: now(),
        },
        ...(db.customers || []),
      ];
    }

    write(db);
    return rec;
  },
};
