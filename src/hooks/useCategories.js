import { createLocalStore } from './createLocalStore.js';
import { categories as DEFAULT_CATEGORIES } from '../productsStore/Store.js';

/* ==========================================================
   useCategories — admin-managed category list.

   The seed list still comes from productsStore/Store.js; once the
   admin edits anything the full list lives in localStorage and that
   copy wins. Order is explicit (`order` field) so the home strip and
   the product filters can be re-arranged from the panel.
   ========================================================== */

const SEED = DEFAULT_CATEGORIES.map((c, i) => ({
  id: c.id,
  name: c.name,
  nameEn: '',
  image: c.image,
  order: i,
  active: true,
}));

const normalise = (list) => {
  if (!Array.isArray(list)) return SEED;
  const clean = list
    .filter((c) => c && typeof c === 'object' && c.id)
    .map((c, i) => ({
      id: String(c.id),
      name: c.name || String(c.id),
      nameEn: c.nameEn || '',
      image: c.image || '',
      order: Number.isFinite(Number(c.order)) ? Number(c.order) : i,
      active: c.active !== false,
    }))
    .sort((a, b) => a.order - b.order)
    .map((c, i) => ({ ...c, order: i }));
  return clean.length ? clean : SEED;
};

export const categoriesStore = createLocalStore({
  key: 'impotech_categories',
  event: 'impotech-categories-change',
  defaults: SEED,
  sanitize: normalise,
});

export const readCategories = categoriesStore.read;
export const hasCustomCategories = categoriesStore.has;
export const clearCategories = categoriesStore.clear;

/** Slugify a category name into a URL-safe id. */
export const slugifyCategory = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'category';

export const useCategories = () => {
  const { value, isCustom, save, reset, defaults } = categoriesStore.useStore();
  return { categories: value, isCustom, save, reset, defaults };
};
