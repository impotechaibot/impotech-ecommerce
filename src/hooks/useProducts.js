/**
 * useProducts.js — প্রোডাক্টের একটাই হুক, একটাই সোর্স
 * ------------------------------------------------------------
 * আগে এই হুক শুধু localStorage পড়ত/লিখত, আর পাবলিক পেজ Supabase
 * পড়ত — তাই অ্যাডমিনের পরিবর্তন লাইভ সাইটে যেত না।
 *
 * এখন:
 *   • মাউন্টে db.fetchProducts() → Supabase (বা লোকাল)
 *   • save/remove → db.saveProduct()/db.deleteProduct() → Supabase
 *   • ইভেন্টে সব কম্পোনেন্ট সাথে সাথে রি-রেন্ডার
 *   • `status` দিয়ে UI জানে ডেটা কোথা থেকে এসেছে ও কী ভুল হয়েছে
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EVENTS,
  fetchProducts,
  saveProduct,
  deleteProduct,
  replaceProducts,
  isRemote,
} from '../lib/db.js';
import { toProduct, uniqueSlug } from '../lib/normalize.js';

export const PRODUCTS_KEY = 'impotech_products';
export const PRODUCTS_EVENT = EVENTS.products;

const sortList = (list) =>
  [...list].sort((a, b) => {
    const so = Number(a.sort_order || 0) - Number(b.sort_order || 0);
    if (so !== 0) return so;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

export const useProducts = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    source: isRemote() ? 'supabase' : 'local',
    error: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchProducts();
    setList(sortList(res.data || []));
    setStatus({ source: res.source, error: res.error });
    setLoading(false);
    return res;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetchProducts();
      if (!alive) return;
      setList(sortList(res.data || []));
      setStatus({ source: res.source, error: res.error });
      setLoading(false);
    })();

    const sync = (e) => {
      if (Array.isArray(e.detail)) setList(sortList(e.detail.map(toProduct)));
    };
    const onStorage = (e) => {
      if (e.key === PRODUCTS_KEY) load();
    };
    window.addEventListener(PRODUCTS_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      alive = false;
      window.removeEventListener(PRODUCTS_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [load]);

  /** নতুন প্রোডাক্ট যোগ — slug ইউনিক করে, তারপর সেভ। */
  const add = useCallback(
    async (draft) => {
      const taken = list.map((p) => p.slug);
      const base = draft.slug || draft.name_bn || draft.name;
      const product = toProduct({
        ...draft,
        id: draft.id || `p-${Date.now().toString(36)}`,
        slug: uniqueSlug(base, taken),
      });
      const res = await saveProduct(product);
      if (res.ok) {
        setList((prev) =>
          sortList([res.data, ...prev.filter((p) => p.id !== res.data.id)])
        );
        setStatus({ source: res.source, error: null });
      } else {
        setStatus((s) => ({ ...s, error: res.error }));
      }
      return res;
    },
    [list]
  );

  /** পুরনো প্রোডাক্ট আপডেট। */
  const update = useCallback(async (id, draft) => {
    const product = toProduct({ ...draft, id });
    const res = await saveProduct(product);
    if (res.ok) {
      setList((prev) => sortList(prev.map((p) => (p.id === id ? res.data : p))));
      setStatus({ source: res.source, error: null });
    } else {
      setStatus((s) => ({ ...s, error: res.error }));
    }
    return res;
  }, []);

  const remove = useCallback(async (id) => {
    const res = await deleteProduct(id);
    if (res.ok) {
      setList((prev) => prev.filter((p) => p.id !== id));
      setStatus((s) => ({ ...s, error: null }));
    } else {
      setStatus((s) => ({ ...s, error: res.error }));
    }
    return res;
  }, []);

  /** পুরো তালিকা একবারে (রিসেট / ইমপোর্ট)। */
  const replaceAll = useCallback(async (next) => {
    const res = await replaceProducts(next);
    if (res.ok) {
      setList(sortList(res.data));
      setStatus({ source: res.source, error: null });
    } else {
      setStatus((s) => ({ ...s, error: res.error }));
    }
    return res;
  }, []);

  const byId = useMemo(() => {
    const map = new Map();
    list.forEach((p) => map.set(p.id, p));
    return map;
  }, [list]);

  const bySlug = useMemo(() => {
    const map = new Map();
    list.forEach((p) => {
      if (p.slug) map.set(p.slug, p);
      map.set(p.id, p);
    });
    return map;
  }, [list]);

  return {
    products: list,
    loading,
    status,
    isRemote: isRemote(),
    reload: load,
    add,
    update,
    remove,
    replaceAll,
    byId,
    bySlug,
  };
};

export default useProducts;
