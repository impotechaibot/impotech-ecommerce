import { createLocalStore } from './createLocalStore.js';

/* ==========================================================
   useReviews — product reviews shown in the admin panel.

   Reviews start as `pending` and only count once approved, so the
   admin can moderate before anything appears on the storefront.
   ========================================================== */

const normalise = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((r) => r && typeof r === 'object' && r.id)
    .map((r) => ({
      id: String(r.id),
      productId: r.productId || '',
      productName: r.productName || '',
      name: r.name || 'অতিথি',
      rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
      text: r.text || '',
      status: r.status === 'approved' ? 'approved' : 'pending',
      createdAt: r.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const reviewsStore = createLocalStore({
  key: 'impotech_reviews',
  event: 'impotech-reviews-change',
  defaults: [],
  sanitize: normalise,
});

export const readReviews = reviewsStore.read;
export const clearReviews = reviewsStore.clear;

export const useReviews = () => {
  const { value, isCustom, save, reset, defaults } = reviewsStore.useStore();

  const addReview = (review) => save([review, ...value]);
  const approveReview = (id) =>
    save(value.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
  const deleteReview = (id) => save(value.filter((r) => r.id !== id));

  return {
    reviews: value,
    isCustom,
    addReview,
    approveReview,
    deleteReview,
    reset,
    defaults,
  };
};
