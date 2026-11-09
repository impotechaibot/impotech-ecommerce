/**
 * format.js — বাংলা ফরম্যাটিং হেল্পার
 */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** ইংরেজি সংখ্যা → বাংলা সংখ্যা */
export function toBn(input) {
  return String(input ?? '').replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** টাকা ফরম্যাট — ৳১,২৫০ */
export function money(n, { bn = true } = {}) {
  const num = Number(n || 0);
  const s = num.toLocaleString('en-US');
  return '৳' + (bn ? toBn(s) : s);
}

/** তারিখ — বাংলা */
export function dateBn(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export function dateTimeBn(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('bn-BD', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/** ডিসকাউন্ট শতাংশ */
export function discountPercent(price, oldPrice) {
  const p = Number(price || 0);
  const o = Number(oldPrice || 0);
  if (!o || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}

/** স্টক স্ট্যাটাস */
export function stockStatus(stock) {
  const s = Number(stock || 0);
  if (s <= 0) return { label: 'স্টক শেষ', tone: 'out' };
  if (s <= 5) return { label: `মাত্র ${toBn(s)}টি বাকি`, tone: 'low' };
  return { label: 'স্টকে আছে', tone: 'in' };
}

/** অর্ডার স্ট্যাটাস লেবেল */
export const ORDER_STATUS = {
  new: 'নতুন',
  processing: 'প্রসেসিং',
  shipped: 'শিপড',
  delivered: 'ডেলিভারড',
  cancelled: 'বাতিল',
};

export const PAYMENT_LABEL = {
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  card: 'কার্ড',
};

/** slug তৈরি */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
