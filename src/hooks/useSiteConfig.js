import { useCallback, useEffect, useState } from 'react';
import {
  STORE_INFO,
  slides as DEFAULT_SLIDES,
  banners as DEFAULT_BANNERS,
  services as DEFAULT_SERVICES,
  footerLinks as DEFAULT_FOOTER_LINKS,
} from '../productsStore/Store.js';

/* ==========================================================
   useSiteConfig — the single source of truth for everything the
   admin panel can change about the site itself (not products).

   Stored as ONE JSON blob in localStorage['impotech_site'] so a
   backup export/import is a single key. Every consumer re-renders
   on save, and other tabs stay in sync through the `storage` event
   — exactly the same pattern as useProducts / useBackground.
   ========================================================== */

export const SITE_KEY = 'impotech_site';
export const SITE_EVENT = 'impotech-site-change';

export const DEFAULT_NAV = [
  { id: 'n1', label: 'হোম', to: '/', end: true },
  { id: 'n2', label: 'ফ্ল্যাশ সেল', to: '/products?sort=flash', hot: true },
  { id: 'n3', label: 'সব পণ্য', to: '/products' },
  { id: 'n4', label: 'রাইডিং গিয়ার', to: '/products?category=riding-gear' },
  { id: 'n5', label: 'অর্ডার ট্র্যাকিং', to: '/track' },
];

export const DEFAULT_CONTENT = {
  about: {
    title: 'আমাদের সম্পর্কে',
    body:
      'ইম্পোটেক — চায়না থেকে সরাসরি আমদানি করা প্রিমিয়াম বাইক অ্যাকসেসরিজের বিশ্বস্ত ঠিকানা।\n\n' +
      'আমরা ২০২০ সাল থেকে বাংলাদেশের রাইডারদের জন্য মানসম্মত LED লাইট, রাইডিং গিয়ার ও বাইক অ্যাকসেসরিজ সরবরাহ করে আসছি। ' +
      'প্রতিটি পণ্য নিজে হাতে যাচাই করে তারপর তালিকায় যোগ করা হয়, যাতে আপনি পান অরিজিনাল কোয়ালিটি নিশ্চিন্তে।\n\n' +
      'আমাদের লক্ষ্য একটাই — সাশ্রয়ী দামে সেরা মানের পণ্য, দ্রুত ডেলিভারি আর আন্তরিক কাস্টমার সাপোর্ট।',
  },
  privacy: {
    title: 'প্রাইভেসি পলিসি',
    body:
      'আপনার ব্যক্তিগত তথ্যের গোপনীয়তা আমাদের কাছে সর্বোচ্চ গুরুত্বপূর্ণ।\n\n' +
      '১. আমরা শুধু অর্ডার প্রক্রিয়াকরণের জন্য প্রয়োজনীয় তথ্য (নাম, মোবাইল নম্বর, ঠিকানা) সংগ্রহ করি।\n' +
      '২. আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না — ডেলিভারি পার্টনার ছাড়া, এবং শুধু ডেলিভারির প্রয়োজনে।\n' +
      '৩. পেমেন্ট তথ্য আমাদের সার্ভারে সংরক্ষণ করা হয় না; পেমেন্ট গেটওয়ে সরাসরি প্রক্রিয়া করে।\n' +
      '৪. আপনি যেকোনো সময় আপনার তথ্য মুছে ফেলার অনুরোধ করতে পারেন।',
  },
  terms: {
    title: 'শর্তাবলী',
    body:
      'এই ওয়েবসাইট ব্যবহার করে অর্ডার করার মাধ্যমে আপনি নিচের শর্তাবলীতে সম্মত হচ্ছেন।\n\n' +
      '১. পণ্যের দাম ও স্টক যেকোনো সময় পরিবর্তন হতে পারে; অর্ডার কনফার্ম হওয়ার সময়ের দামই চূড়ান্ত।\n' +
      '২. ভুল দাম বা স্টক তথ্যের কারণে অর্ডার বাতিলের অধিকার আমরা সংরক্ষণ করি — সেক্ষেত্রে সম্পূর্ণ টাকা ফেরত দেওয়া হবে।\n' +
      '৩. পণ্যের ছবি ও বর্ণনা যতটা সম্ভব নির্ভুল রাখা হয়; তবে স্ক্রিনের রঙে সামান্য পার্থক্য হতে পারে।\n' +
      '৪. অপব্যবহার বা ভুয়া অর্ডার শনাক্ত হলে অ্যাকাউন্ট ব্লক করা হতে পারে।',
  },
  returns: {
    title: 'রিটার্ন পলিসি',
    body:
      'পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে রিটার্ন বা রিপ্লেসমেন্টের সুযোগ আছে।\n\n' +
      'শর্ত:\n' +
      '• পণ্য অব্যবহৃত ও অরিজিনাল প্যাকেজিংয়ে থাকতে হবে।\n' +
      '• ভাঙা, ত্রুটিপূর্ণ বা ভুল পণ্য এলে ডেলিভারি চার্জ আমাদের বহন করবে।\n' +
      '• পছন্দ না হলে ডেলিভারি চার্জ ক্রেতাকে বহন করতে হবে।\n' +
      '• রিটার্নের জন্য অর্ডার আইডি ও পণ্যের ছবি সহ আমাদের হটলাইনে যোগাযোগ করুন।\n\n' +
      'রিফান্ড সাধারণত ৩–৭ কর্মদিবসের মধ্যে প্রক্রিয়া করা হয়।',
  },
  faq: {
    title: 'সাধারণ প্রশ্নোত্তর',
    body:
      'প্রশ্ন: ডেলিভারিতে কত সময় লাগে?\n' +
      'উত্তর: ঢাকার ভিতরে ২৪ ঘণ্টা, ঢাকার বাইরে ২–৪ কর্মদিবস।\n\n' +
      'প্রশ্ন: ক্যাশ অন ডেলিভারি আছে কি?\n' +
      'উত্তর: হ্যাঁ, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা আছে।\n\n' +
      'প্রশ্ন: পণ্য অরিজিনাল কি?\n' +
      'উত্তর: হ্যাঁ, প্রতিটি পণ্য নিজে যাচাই করে তালিকায় যোগ করা হয় এবং ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি দেওয়া হয়।\n\n' +
      'প্রশ্ন: অর্ডার ট্র্যাক করব কীভাবে?\n' +
      'উত্তর: অর্ডার কনফার্ম হলে যে আইডি পাবেন, সেটি "অর্ডার ট্র্যাকিং" পেজে দিলেই স্ট্যাটাস দেখতে পাবেন।',
  },
};

export const DEFAULT_SEO = {
  home: {
    title: 'ইম্পোটেক — প্রিমিয়াম বাইক অ্যাকসেসরিজ',
    description:
      'চায়না থেকে সরাসরি আমদানি করা প্রিমিয়াম বাইক অ্যাক্সেসরিজ। LED অ্যাঞ্জেল উইংস, রাইডিং গিয়ার ও আরও অনেক কিছু।',
  },
  products: {
    title: 'সব পণ্য — ইম্পোটেক',
    description: 'ইম্পোটেকের সম্পূর্ণ পণ্য তালিকা — LED লাইট, রাইডিং গিয়ার, বাইক অ্যাক্সেসরিজ।',
  },
  product: {
    title: 'পণ্যের বিস্তারিত — ইম্পোটেক',
    description: 'পণ্যের বিস্তারিত তথ্য, দাম ও স্টক দেখুন।',
  },
  cart: { title: 'শপিং কার্ট — ইম্পোটেক', description: 'আপনার কার্টের পণ্য দেখুন ও অর্ডার সম্পন্ন করুন।' },
  checkout: { title: 'চেকআউট — ইম্পোটেক', description: 'ডেলিভারি তথ্য দিয়ে অর্ডার কনফার্ম করুন।' },
  track: { title: 'অর্ডার ট্র্যাকিং — ইম্পোটেক', description: 'অর্ডার আইডি দিয়ে ডেলিভারি স্ট্যাটাস দেখুন।' },
  search: { title: 'সার্চ — ইম্পোটেক', description: 'পছন্দের পণ্য খুঁজুন।' },
  wishlist: { title: 'উইশলিস্ট — ইম্পোটেক', description: 'আপনার সেভ করা পণ্য।' },
  about: { title: 'আমাদের সম্পর্কে — ইম্পোটেক', description: 'ইম্পোটেক সম্পর্কে জানুন।' },
  privacy: { title: 'প্রাইভেসি পলিসি — ইম্পোটেক', description: 'আমাদের প্রাইভেসি পলিসি।' },
  terms: { title: 'শর্তাবলী — ইম্পোটেক', description: 'সেবা ব্যবহারের শর্তাবলী।' },
  returns: { title: 'রিটার্ন পলিসি — ইম্পোটেক', description: 'রিটার্ন ও রিপ্লেসমেন্ট নীতিমালা।' },
  faq: { title: 'সাধারণ প্রশ্নোত্তর — ইম্পোটেক', description: 'সাধারণ প্রশ্নের উত্তর।' },
};

export const DEFAULT_SITE = {
  /* ---- identity ---- */
  siteName: STORE_INFO.name,
  siteNameEn: STORE_INFO.nameEn,
  tagline: 'চায়না থেকে সরাসরি আমদানি — প্রিমিয়াম বাইক অ্যাক্সেসরিজ',
  logo: '',
  favicon: '',
  copyright: '© {year} ইম্পোটেক — সর্বস্বত্ব সংরক্ষিত।',

  /* ---- theme ---- */
  theme: {
    accent: '#f0b429',
    accentDark: '#c9920f',
    fontScale: 100,
    radius: 18,
    mode: 'dark',
  },

  /* ---- navigation ---- */
  nav: DEFAULT_NAV,

  /* ---- contact ---- */
  contact: {
    phone: STORE_INFO.phone,
    email: 'support@impotech.com.bd',
    address: STORE_INFO.address,
    hours: STORE_INFO.hours,
    whatsapp: STORE_INFO.phone,
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
    tiktok: '',
  },

  /* ---- checkout / payment ---- */
  checkout: {
    deliveryCharge: 80,
    freeDeliveryAbove: 2000,
    codEnabled: true,
    bkashEnabled: true,
    bkashNumber: '01884332067',
    nagadEnabled: true,
    nagadNumber: '01884332067',
    rocketEnabled: false,
    rocketNumber: '',
    paymentNote:
      'বিকাশ/নগদে টাকা পাঠিয়ে ট্রানজেকশন আইডি অর্ডার নোটে লিখুন। পেমেন্ট ভেরিফাই হলে অর্ডার প্রসেস শুরু হবে।',
    confirmMessage:
      'ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি। শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।',
  },

  /* ---- home page ---- */
  home: {
    slides: DEFAULT_SLIDES,
    banners: DEFAULT_BANNERS,
    services: DEFAULT_SERVICES,
    newsletter: {
      title: 'নিউজলেটার সাবস্ক্রাইব করুন',
      text: 'সর্বশেষ অফার ও নতুন পণ্য সম্পর্কে জানতে আপনার ইমেইল দিন।',
      button: 'সাবস্ক্রাইব',
    },
  },

  /* ---- footer ---- */
  footerLinks: DEFAULT_FOOTER_LINKS,

  /* ---- content pages ---- */
  content: DEFAULT_CONTENT,

  /* ---- seo ---- */
  seo: DEFAULT_SEO,
  ogImage: '',

  /* ---- admin ---- */
  admin: {
    password: 'impotech2026',
  },
};

/* Deep-merge the stored blob over the defaults so a config saved by an
   older version (missing a key) still works after an upgrade. */
const mergeDeep = (base, patch) => {
  if (Array.isArray(base) || Array.isArray(patch)) {
    return Array.isArray(patch) ? patch : base;
  }
  if (typeof base !== 'object' || base === null) return patch ?? base;
  if (typeof patch !== 'object' || patch === null) return base;
  const out = { ...base };
  Object.keys(patch).forEach((k) => {
    out[k] = k in base ? mergeDeep(base[k], patch[k]) : patch[k];
  });
  return out;
};

export const readSiteConfig = () => {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (!raw) return DEFAULT_SITE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SITE;
    return mergeDeep(DEFAULT_SITE, parsed);
  } catch {
    return DEFAULT_SITE;
  }
};

export const hasCustomSite = () => {
  try {
    return Boolean(localStorage.getItem(SITE_KEY));
  } catch {
    return false;
  }
};

/** Returns true when the write landed (localStorage can be full). */
export const writeSiteConfig = (cfg) => {
  try {
    localStorage.setItem(SITE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent(SITE_EVENT, { detail: cfg }));
    return true;
  } catch (err) {
    console.warn('Site config could not be saved', err);
    return false;
  }
};

export const clearSiteConfig = () => {
  try {
    localStorage.removeItem(SITE_KEY);
    window.dispatchEvent(new CustomEvent(SITE_EVENT, { detail: DEFAULT_SITE }));
  } catch (err) {
    console.warn('Site config could not be reset', err);
  }
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState(readSiteConfig);

  useEffect(() => {
    const sync = (e) => setConfig(e.detail || readSiteConfig());
    const onStorage = (e) => {
      if (e.key === SITE_KEY) setConfig(readSiteConfig());
    };
    window.addEventListener(SITE_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SITE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /** save(patch) merges a partial update; save(fn) gets the current config. */
  const save = useCallback((patch) => {
    const current = readSiteConfig();
    const next =
      typeof patch === 'function' ? patch(current) : mergeDeep(current, patch);
    const ok = writeSiteConfig(next);
    if (ok) setConfig(next);
    return ok;
  }, []);

  const reset = useCallback(() => {
    clearSiteConfig();
    setConfig(DEFAULT_SITE);
  }, []);

  return { config, save, reset, defaults: DEFAULT_SITE };
};

/* ---------- small helpers used across the app ---------- */

/** '#f0b429' → '240, 180, 41' (for rgba() shadows / soft tints). */
export const hexToRgb = (hex) => {
  const clean = String(hex || '').replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const n = parseInt(full || 'f0b429', 16);
  if (Number.isNaN(n)) return '240, 180, 41';
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/** Slightly darker variant of a hex colour (used for hover states). */
export const darken = (hex, amount = 0.18) => {
  const clean = String(hex || '').replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const n = parseInt(full || 'f0b429', 16);
  if (Number.isNaN(n)) return hex;
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * (1 - amount));
  const g = clamp(((n >> 8) & 255) * (1 - amount));
  const b = clamp((n & 255) * (1 - amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};
