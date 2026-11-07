import { SITE_KEY } from './useSiteConfig.js';
import { PRODUCTS_KEY } from './useProducts.js';
import { BG_KEY } from './useBackground.js';
import { categoriesStore } from './useCategories.js';
import { ordersStore } from './useOrders.js';
import { couponsStore } from './useCoupons.js';
import { reviewsStore } from './useReviews.js';

/* ==========================================================
   useBackup — export / import / reset the whole site's data.

   Everything the admin can change lives under a handful of
   localStorage keys, so a backup is just those keys in one JSON
   file. Import validates the shape before writing anything, and
   `resetAll` clears every key back to the built-in defaults.
   ========================================================== */

export const BACKUP_KEYS = [
  { key: SITE_KEY, label: 'সাইট সেটিংস' },
  { key: PRODUCTS_KEY, label: 'প্রোডাক্ট' },
  { key: categoriesStore.KEY, label: 'ক্যাটাগরি' },
  { key: BG_KEY, label: 'ব্যাকগ্রাউন্ড' },
  { key: ordersStore.KEY, label: 'অর্ডার' },
  { key: couponsStore.KEY, label: 'কুপন' },
  { key: reviewsStore.KEY, label: 'রিভিউ' },
  { key: 'impotech_cart', label: 'কার্ট' },
  { key: 'impotech_wishlist', label: 'উইশলিস্ট' },
];

const BACKUP_VERSION = 1;

/** Build the backup object (also used for the download). */
export const buildBackup = () => {
  const data = {};
  BACKUP_KEYS.forEach(({ key }) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) data[key] = JSON.parse(raw);
    } catch {
      /* skip unreadable keys */
    }
  });
  return {
    app: 'impotech-store',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
};

export const downloadBackup = () => {
  const payload = buildBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `impotech-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return payload;
};

/**
 * Restore a backup object. Only keys we know about are written, and
 * each value is re-serialised so a malformed file cannot inject junk.
 * @returns {{ok: boolean, restored: number, reason?: string}}
 */
export const importBackup = (payload) => {
  if (!payload || typeof payload !== 'object' || !payload.data)
    return { ok: false, restored: 0, reason: 'ফাইলটি বৈধ ব্যাকআপ নয়' };

  const known = new Set(BACKUP_KEYS.map((k) => k.key));
  let restored = 0;

  try {
    Object.entries(payload.data).forEach(([key, value]) => {
      if (!known.has(key)) return;
      localStorage.setItem(key, JSON.stringify(value));
      restored += 1;
    });
  } catch (err) {
    return { ok: false, restored, reason: 'সেভ করা যায়নি — স্টোরেজ পূর্ণ হতে পারে' };
  }

  // Nudge every store to re-read from localStorage.
  window.dispatchEvent(new Event('storage'));
  BACKUP_KEYS.forEach(({ key }) => {
    window.dispatchEvent(new CustomEvent(`${key}-change`));
  });
  window.dispatchEvent(new CustomEvent('impotech-site-change'));
  window.dispatchEvent(new CustomEvent('impotech-products-change'));
  window.dispatchEvent(new CustomEvent('impotech-bg-change'));
  window.dispatchEvent(new CustomEvent('impotech-categories-change'));
  window.dispatchEvent(new CustomEvent('impotech-orders-change'));
  window.dispatchEvent(new CustomEvent('impotech-coupons-change'));
  window.dispatchEvent(new CustomEvent('impotech-reviews-change'));

  return { ok: true, restored };
};

/** Wipe every admin-editable key back to the built-in defaults. */
export const resetAll = () => {
  BACKUP_KEYS.forEach(({ key }) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  });
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('impotech-site-change'));
  window.dispatchEvent(new CustomEvent('impotech-products-change'));
  window.dispatchEvent(new CustomEvent('impotech-bg-change'));
  window.dispatchEvent(new CustomEvent('impotech-categories-change'));
  window.dispatchEvent(new CustomEvent('impotech-orders-change'));
  window.dispatchEvent(new CustomEvent('impotech-coupons-change'));
  window.dispatchEvent(new CustomEvent('impotech-reviews-change'));
};

/** Rough size of everything we store, for the backup panel. */
export const storageUsage = () => {
  let bytes = 0;
  BACKUP_KEYS.forEach(({ key }) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) bytes += raw.length * 2; // UTF-16 code units
    } catch {
      /* ignore */
    }
  });
  return bytes;
};
