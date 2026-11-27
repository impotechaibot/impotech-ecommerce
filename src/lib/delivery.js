/**
 * delivery.js — ডেলিভারি চার্জের একটাই হিসাব
 * ------------------------------------------------------------
 * আগে চার্জ ৪ জায়গায় আলাদা করে লেখা ছিল (৮০ / ৬০ / হার্ডকোড),
 * তাই এক জায়গায় বদলালে বাকি জায়গায় পুরনো দামই থাকত।
 *
 * এখন সব পেজ এই ফাইল দিয়ে হিসাব করে, আর মান আসে
 * অ্যাডমিন → চেকআউট ট্যাব → site config থেকে।
 */

/** অ্যাডমিনে কিছু সেট না থাকলে এই ডিফল্ট। */
export const DEFAULT_DELIVERY_CHARGE = 80;
export const DEFAULT_OUTSIDE_CHARGE = 130;
export const DEFAULT_FREE_ABOVE = 2000;

const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

/** চেকআউট সেটিংস থেকে নিরাপদ মান। */
export const deliverySettings = (checkout = {}) => ({
  inside: num(checkout.deliveryCharge, DEFAULT_DELIVERY_CHARGE),
  outside: num(checkout.outsideDeliveryCharge, DEFAULT_OUTSIDE_CHARGE),
  freeAbove: num(checkout.freeDeliveryAbove, DEFAULT_FREE_ABOVE),
});

/**
 * ডেলিভারি চার্জ হিসাব।
 * @param {number} subtotal  পণ্যের মোট দাম
 * @param {object} checkout  site config-এর checkout অংশ
 * @param {{outside?:boolean, freeDelivery?:boolean}} opts
 */
export const calcShipping = (subtotal, checkout = {}, opts = {}) => {
  const { inside, outside, freeAbove } = deliverySettings(checkout);
  const amount = Number(subtotal) || 0;

  // প্রোডাক্টে ফ্রি ডেলিভারি চালু থাকলে চার্জ নেই
  if (opts.freeDelivery) return 0;
  // নির্দিষ্ট অঙ্কের বেশি কিনলে ফ্রি (০ দিলে বন্ধ)
  if (freeAbove > 0 && amount >= freeAbove) return 0;

  return opts.outside ? outside : inside;
};

/** ফ্রি ডেলিভারির জন্য আর কত টাকা বাকি (০ = হয়ে গেছে / বন্ধ)। */
export const amountToFreeDelivery = (subtotal, checkout = {}) => {
  const { freeAbove } = deliverySettings(checkout);
  if (freeAbove <= 0) return 0;
  return Math.max(0, freeAbove - (Number(subtotal) || 0));
};

/** UI-তে দেখানোর জন্য লেবেল। */
export const deliveryLabel = (checkout = {}, outside = false) => {
  const { inside, outside: out } = deliverySettings(checkout);
  return outside ? out : inside;
};
