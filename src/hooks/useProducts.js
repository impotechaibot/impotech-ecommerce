import { useCallback, useEffect, useState } from 'react';
import { products as DEFAULT_PRODUCTS } from '../productsStore/Store.js';

// The catalogue in productsStore/Store.js stays the source of truth for the
// default seed products. Once the admin panel edits/saves anything we keep the
// full list in localStorage and that copy wins on every route — same pattern as
// useBackground.js, so cart/wishlist/background all behave the same way.
export const PRODUCTS_KEY = 'impotech_products';
export const PRODUCTS_EVENT = 'impotech-products-change';

const isUsable = (p) =>
  p && typeof p === 'object' && typeof p.id === 'string' && p.id.length > 0;

// Normalise numbers on read so a hand-edited / older payload cannot break maths.
// `oldPrice` is clamped to at least `price` so the discount maths never divides
// by a value smaller than the live price (or by zero).
const normalise = (p) => {
  const price = Number(p.price) || 0;
  const oldPrice = Math.max(price, Number(p.oldPrice) || 0);
  return {
    ...p,
    price,
    oldPrice,
    stock: Number(p.stock) || 0,
    rating: Number(p.rating) || 0,
    reviews: Number(p.reviews) || 0,
    // `images` is the current field; a legacy record may only carry a single
    // `image` string, so fold that in when the array is missing/empty.
    images: (() => {
      const list = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      if (list.length) return list;
      return typeof p.image === 'string' && p.image ? [p.image] : [];
    })(),
    videos: Array.isArray(p.videos) ? p.videos.filter(Boolean) : [],
    // Per-product setting: when true the detail gallery auto-plays a selected
    // video muted (with a mute/unmute control) instead of waiting for a click.
    videoAutoplay: Boolean(p.videoAutoplay),
    colors: Array.isArray(p.colors) ? p.colors : [],
    features: Array.isArray(p.features) ? p.features : [],
    bn: p.bn || p.name || 'পণ্য',
    name: p.name || p.bn || 'Product',
  };
};

export const readProducts = () => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return DEFAULT_PRODUCTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_PRODUCTS;
    const clean = parsed.filter(isUsable).map(normalise);
    if (!clean.length) return DEFAULT_PRODUCTS;
    return clean;
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

export const hasCustomProducts = () => {
  try {
    return Boolean(localStorage.getItem(PRODUCTS_KEY));
  } catch {
    return false;
  }
};

/** Returns true when the write actually landed (localStorage can be full). */
export const writeProducts = (list) => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(PRODUCTS_EVENT, { detail: list }));
    return true;
  } catch (err) {
    console.warn('Products could not be saved', err);
    return false;
  }
};

export const clearProducts = () => {
  try {
    localStorage.removeItem(PRODUCTS_KEY);
    window.dispatchEvent(
      new CustomEvent(PRODUCTS_EVENT, { detail: DEFAULT_PRODUCTS })
    );
  } catch (err) {
    console.warn('Products could not be reset', err);
  }
};

// One hook, one source of truth — every consumer re-renders on save and other
// tabs stay in sync through the `storage` event.
export const useProducts = () => {
  const [state, setState] = useState(() => ({
    list: readProducts(),
    custom: hasCustomProducts(),
  }));

  useEffect(() => {
    const sync = () => {
      setState({ list: readProducts(), custom: hasCustomProducts() });
    };
    const onStorage = (e) => {
      if (e.key === PRODUCTS_KEY) sync();
    };
    window.addEventListener(PRODUCTS_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PRODUCTS_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const save = useCallback((list) => {
    const ok = writeProducts(list);
    if (ok) setState({ list, custom: true });
    return ok;
  }, []);

  const reset = useCallback(() => {
    clearProducts();
    setState({ list: DEFAULT_PRODUCTS, custom: false });
  }, []);

  return {
    products: state.list,
    isCustom: state.custom,
    save,
    reset,
    defaults: DEFAULT_PRODUCTS,
  };
};
