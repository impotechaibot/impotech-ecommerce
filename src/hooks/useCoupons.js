import { createLocalStore } from './createLocalStore.js';

/* ==========================================================
   useCoupons — discount codes applied at checkout.

   A coupon is either a percentage or a fixed-amount discount, with
   an optional minimum order and an optional expiry date. The
   checkout calls validateCoupon() and shows the reason when a code
   is rejected.
   ========================================================== */

const normalise = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((c) => c && typeof c === 'object' && c.code)
    .map((c) => ({
      id: String(c.id || c.code),
      code: String(c.code).toUpperCase().trim(),
      type: c.type === 'fixed' ? 'fixed' : 'percent',
      value: Math.max(0, Number(c.value) || 0),
      minOrder: Math.max(0, Number(c.minOrder) || 0),
      expires: c.expires || '',
      active: c.active !== false,
      note: c.note || '',
    }));
};

export const couponsStore = createLocalStore({
  key: 'impotech_coupons',
  event: 'impotech-coupons-change',
  defaults: [],
  sanitize: normalise,
});

export const readCoupons = couponsStore.read;
export const clearCoupons = couponsStore.clear;

/**
 * Validate a code against a subtotal.
 * @returns {{ok: true, coupon, discount}} | {{ok: false, reason}}
 */
export const validateCoupon = (code, subtotal) => {
  const wanted = String(code || '').toUpperCase().trim();
  if (!wanted) return { ok: false, reason: 'কুপন কোড লিখুন' };

  const coupon = readCoupons().find((c) => c.code === wanted);
  if (!coupon) return { ok: false, reason: 'এই কুপন কোডটি পাওয়া যায়নি' };
  if (!coupon.active) return { ok: false, reason: 'এই কুপনটি এখন নিষ্ক্রিয়' };

  if (coupon.expires) {
    const end = new Date(coupon.expires);
    end.setHours(23, 59, 59, 999);
    if (Number.isFinite(end.getTime()) && end.getTime() < Date.now())
      return { ok: false, reason: 'এই কুপনের মেয়াদ শেষ হয়ে গেছে' };
  }

  const amount = Number(subtotal) || 0;
  if (amount < coupon.minOrder)
    return {
      ok: false,
      reason: `সর্বনিম্ন ৳${coupon.minOrder.toLocaleString('en-US')} অর্ডারে এই কুপন প্রযোজ্য`,
    };

  const raw =
    coupon.type === 'percent' ? (amount * coupon.value) / 100 : coupon.value;
  const discount = Math.max(0, Math.min(amount, Math.round(raw)));

  return { ok: true, coupon, discount };
};

export const useCoupons = () => {
  const { value, isCustom, save, reset, defaults } = couponsStore.useStore();
  return { coupons: value, isCustom, save, reset, defaults };
};
