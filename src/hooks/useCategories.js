/**
 * useCategories.js — ক্যাটাগরি (Supabase ⇄ লোকাল)
 * ------------------------------------------------------------
 * আগে শুধু localStorage-এ থাকত, তাই অ্যাডমিনে নতুন ক্যাটাগরি
 * যোগ করলে লাইভ সাইটে আসত না। এখন db.js দিয়ে যায়।
 *
 * API পুরনো CategoryAdmin-এর সাথে সামঞ্জস্যপূর্ণ:
 *   save(list) → boolean (sync, আগের মতোই)
 *   reset()    → ডিফল্টে ফেরা
 *   isCustom   → ডিফল্টের বাইরে কিছু আছে কি না
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { categories as DEFAULT_CATEGORIES } from '../productsStore/Store.js';
import { EVENTS, fetchCategories, saveCategories, isRemote } from '../lib/db.js';
import { toCategory, slugify } from '../lib/normalize.js';

const SEED = DEFAULT_CATEGORIES.map((c, i) =>
  toCategory(
    { id: c.id, name: c.name, name_bn: c.name, nameEn: c.name, image: c.image, sort_order: i },
    i
  )
);

export const CATEGORIES_KEY = 'impotech_categories';
export const CATEGORIES_EVENT = EVENTS.categories;

export const slugifyCategory = (text) => slugify(text, 'category');

/** useBackup এই শেপটা আশা করে। */
export const categoriesStore = {
  KEY: CATEGORIES_KEY,
  EVENT: CATEGORIES_EVENT,
  read: () => {
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY);
      return raw ? JSON.parse(raw) : SEED;
    } catch {
      return SEED;
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(CATEGORIES_KEY);
    } catch {
      /* ignore */
    }
  },
};

export const useCategories = () => {
  const [categories, setCategories] = useState(SEED);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    source: isRemote() ? 'supabase' : 'local',
    error: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchCategories();
    const list = (res.data || []).map((c, i) => toCategory(c, i));
    setCategories(list.length ? list : SEED);
    setStatus({ source: res.source, error: res.error });
    setLoading(false);
    return res;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetchCategories();
      if (!alive) return;
      const list = (res.data || []).map((c, i) => toCategory(c, i));
      setCategories(list.length ? list : SEED);
      setStatus({ source: res.source, error: res.error });
      setLoading(false);
    })();

    const sync = (e) => {
      if (Array.isArray(e.detail)) setCategories(e.detail.map((c, i) => toCategory(c, i)));
    };
    const onStorage = (e) => {
      if (e.key === CATEGORIES_KEY) load();
    };
    window.addEventListener(CATEGORIES_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      alive = false;
      window.removeEventListener(CATEGORIES_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [load]);

  /**
   * sync boolean ফেরত দেয় (পুরনো কলারদের জন্য), আর রিমোটে
   * ব্যাকগ্রাউন্ডে push করে — ব্যর্থ হলে `status.error`-এ ধরা পড়ে।
   */
  const save = useCallback((list) => {
    const clean = (Array.isArray(list) ? list : [])
      .map((c, i) => toCategory(c, i))
      .filter((c) => c.id);
    setCategories(clean);

    saveCategories(clean).then((res) => {
      if (res.ok) setStatus({ source: res.source, error: null });
      else setStatus((s) => ({ ...s, error: res.error }));
    });

    return true;
  }, []);

  const reset = useCallback(() => {
    setCategories(SEED);
    saveCategories(SEED).then((res) => {
      if (!res.ok) setStatus((s) => ({ ...s, error: res.error }));
    });
    return true;
  }, []);

  const isCustom = useMemo(() => {
    if (categories.length !== SEED.length) return true;
    return categories.some((c, i) => c.id !== SEED[i]?.id || c.name !== SEED[i]?.name);
  }, [categories]);

  return {
    categories,
    loading,
    status,
    isRemote: isRemote(),
    isCustom,
    reload: load,
    save,
    reset,
    defaults: SEED,
  };
};

export default useCategories;
