
/**
 * StoreContext.jsx — সাইটের কেন্দ্রীয় ডেটা লেয়ার
 * ------------------------------------------------------------
 * - Supabase কনফিগার থাকলে আসল ডেটাবেস থেকে পড়ে
 * - না থাকলে localdb (localStorage) ডেমো মোড
 * - কার্ট, উইশলিস্ট, কাস্টমার অ্যাকাউন্ট — সব এক জায়গায়
 * - অর্ডার Supabase-এ INSERT করবে SELECT ছাড়াই
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import {
  supabase,
  isSupabaseConfigured,
} from '../lib/supabase.js';

import { localdb } from '../lib/localdb.js';
import { EVENTS } from '../lib/db.js';
import { toProduct, toCategory } from '../lib/normalize.js';
import * as cartLib from '../lib/cart.js';

const StoreContext = createContext(null);

const AUTH_KEY = 'impotech_customer_v1';

/* ---------- কাস্টমার লগইন ডেটা ---------- */

function readAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ---------- Store Provider ---------- */

export function StoreProvider({ children }) {
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [settings, setSettings] = useState({});

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [customer, setCustomer] = useState(readAuth);

  /* ---------- ডেটা লোড ---------- */

  const loadAll = useCallback(async () => {
    setLoading(true);

    /* ------------------------------------------------------------
       ⚠️ আগের বাগ: ছয়টা টেবিল একসাথে চাওয়া হত, আর **একটাও** এরর
       দিলে (যেমন `services` বা `policies` টেবিল না থাকলে) পুরো
       সাইট ডেমো ডেটায় নেমে যেত — ফলে অ্যাডমিনে যোগ করা প্রোডাক্ট
       ও ভিডিও লাইভ সাইটে কখনো দেখা যেত না।

       এখন প্রতিটা টেবিল আলাদাভাবে আনা হয়: যেটা পাওয়া যায় সেটা
       দেখাই, যেটা না পাওয়া যায় শুধু সেটার জন্য ফলব্যাক।
       ------------------------------------------------------------ */

    const safe = async (label, query, fallback) => {
      try {
        const { data, error } = await query;
        if (error) {
          console.warn(`[store] ${label} লোড হয়নি:`, error.message);
          return fallback();
        }
        return data || [];
      } catch (err) {
        console.warn(`[store] ${label} লোড হয়নি:`, err?.message || err);
        return fallback();
      }
    };

    if (isSupabaseConfigured) {
      const [p, c, s, f, pol, st] = await Promise.all([
        safe(
          'products',
          supabase
            .from('products')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false }),
          () => localdb.listProducts()
        ),
        safe(
          'categories',
          supabase.from('categories').select('*').order('sort_order'),
          () => localdb.listCategories()
        ),
        safe(
          'services',
          supabase.from('services').select('*').order('sort_order'),
          () => localdb.listServices()
        ),
        safe(
          'faqs',
          supabase.from('faqs').select('*').order('sort_order'),
          () => localdb.listFaqs()
        ),
        safe(
          'policies',
          supabase.from('policies').select('*'),
          () => localdb.listPolicies()
        ),
        safe(
          'site_settings',
          supabase.from('site_settings').select('*'),
          () => []
        ),
      ]);

      // প্রোডাক্ট ক্যানোনিকাল শেপে (snake_case) — পাবলিক পেজ এটাই পড়ে
      setProducts((p || []).map(toProduct).filter((x) => x.id));
      setCategories((c || []).map((x, i) => toCategory(x, i)));
      setServices(s || []);
      setFaqs(f || []);
      setPolicies(pol || []);

      const map = {};
      (st || []).forEach((row) => {
        map[row.key] = row.value;
      });
      setSettings(map);
    } else {
      // Demo mode
      setProducts(localdb.listProducts().map(toProduct));
      setCategories(localdb.listCategories().map((x, i) => toCategory(x, i)));
      setServices(localdb.listServices());
      setFaqs(localdb.listFaqs());
      setPolicies(localdb.listPolicies());
      setSettings(localdb.getAllSettings());
    }

    setCart(cartLib.getCart());
    setWishlist(cartLib.getWishlist());
    setLoading(false);
  }, []);

  /* অ্যাডমিন কিছু বদলালে সাথে সাথে পাবলিক পেজ আপডেট */
  useEffect(() => {
    const onProducts = (e) => {
      if (Array.isArray(e.detail)) setProducts(e.detail.map(toProduct));
    };
    const onCategories = (e) => {
      if (Array.isArray(e.detail)) setCategories(e.detail.map((c, i) => toCategory(c, i)));
    };
    window.addEventListener(EVENTS.products, onProducts);
    window.addEventListener(EVENTS.categories, onCategories);
    return () => {
      window.removeEventListener(EVENTS.products, onProducts);
      window.removeEventListener(EVENTS.categories, onCategories);
    };
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Separate Admin project publishes site_settings updates; refresh the shared
  // settings map so checkout/header data updates without a page reload.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;
    const channel = supabase
      .channel('impotech-store-settings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, async () => {
        try {
          const { data, error } = await supabase.from('site_settings').select('*');
          if (error) throw error;
          const map = {};
          (data || []).forEach((row) => { map[row.key] = row.value; });
          setSettings(map);
        } catch (err) {
          console.warn('[store] site settings live refresh failed:', err?.message || err);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  /* ---------- কার্ট ---------- */

  const addToCart = useCallback((product, qty = 1, variant = '') => {
    const next = cartLib.addToCart(product, qty, variant);
    setCart([...next]);
    return next;
  }, []);

  const updateQty = useCallback((key, qty) => {
    const next = cartLib.updateQty(key, qty);
    setCart([...next]);
  }, []);

  const removeFromCart = useCallback((key) => {
    const next = cartLib.removeFromCart(key);
    setCart([...next]);
  }, []);

  const clearCart = useCallback(() => {
    const next = cartLib.clearCart();
    setCart([...next]);
  }, []);

  /* ---------- উইশলিস্ট ---------- */

  const toggleWishlist = useCallback((product) => {
    const next = cartLib.toggleWishlist(product);
    setWishlist([...next]);
    return next;
  }, []);

  const removeFromWishlist = useCallback((id) => {
    const next = cartLib.removeFromWishlist(id);
    setWishlist([...next]);
  }, []);

  /* ---------- কাস্টমার অ্যাকাউন্ট ---------- */

  const login = useCallback((data) => {
    const rec = {
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      at: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(rec));
    setCustomer(rec);

    return rec;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setCustomer(null);
  }, []);

  /* ---------- অর্ডার ---------- */

  const placeOrder = useCallback(async (order) => {
    if (isSupabaseConfigured) {
      // Supabase-এ শুধু INSERT করা হচ্ছে।
      // SELECT permission লাগবে না।
      const { error } = await supabase
        .from('orders')
        .insert(order);

      if (error) {
        console.error('Supabase order insert failed:', error);
        throw error;
      }

      // INSERT সফল হলে Checkout-কে order data ফেরত দেবে।
      return order;
    }

    // Demo mode
    return localdb.placeOrder(order);
  }, []);

  /* ---------- অর্ডার খোঁজা ---------- */

  const findOrder = useCallback(async (code, phone) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', code)
        .eq('customer_phone', phone)
        .maybeSingle();

      if (error) {
        console.error('Find order failed:', error);
        throw error;
      }

      return data || null;
    }

    return localdb.findOrder(code, phone);
  }, []);

  /* ---------- ফোন নম্বর দিয়ে অর্ডার লিস্ট ---------- */

  const listOrdersByPhone = useCallback(async (phone) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load customer orders failed:', error);
        throw error;
      }

      return data || [];
    }

    return localdb.listOrdersByPhone(phone);
  }, []);

  /* ---------- ডেরাইভড ডেটা ---------- */

  const cartCount = useMemo(
    () => cart.reduce(
      (sum, item) => sum + Number(item.qty || 0),
      0
    ),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.qty || 0),
      0
    ),
    [cart]
  );

  /* ---------- Provider Value ---------- */

  const value = {
    loading,

    products,
    categories,
    services,
    faqs,
    policies,
    settings,

    cart,
    cartCount,
    cartSubtotal,

    wishlist,
    customer,

    isSupabaseConfigured,

    reload: loadAll,

    addToCart,
    updateQty,
    removeFromCart,
    clearCart,

    toggleWishlist,
    removeFromWishlist,

    login,
    logout,

    placeOrder,
    findOrder,
    listOrdersByPhone,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

/* ---------- useStore Hook ---------- */

export function useStore() {
  const ctx = useContext(StoreContext);

  if (!ctx) {
    throw new Error(
      'useStore must be used within StoreProvider'
    );
  }

  return ctx;
}
