/**
 * StoreContext.jsx — সাইটের কেন্দ্রীয় ডেটা লেয়ার
 * ------------------------------------------------------------
 * - Supabase কনফিগার থাকলে আসল ডেটাবেস থেকে পড়ে (অ্যাডমিনের সাথে শেয়ারড)
 * - না থাকলে localdb (localStorage) ডেমো মোড
 * - কার্ট, উইশলিস্ট, কাস্টমার অ্যাকাউন্ট — সব এক জায়গায়
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';
import * as cartLib from '../lib/cart.js';

const StoreContext = createContext(null);

const AUTH_KEY = 'impotech_customer_v1';

function readAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

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
  const [customer, setCustomer] = useState(readAuth());

  /* ---------- ডেটা লোড ---------- */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const [p, c, s, f, pol, st] = await Promise.all([
          supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('active', true).order('sort_order'),
          supabase.from('services').select('*').eq('status', 'active').order('sort_order'),
          supabase.from('faqs').select('*').eq('active', true).order('sort_order'),
          supabase.from('policies').select('*').eq('active', true),
          supabase.from('site_settings').select('*'),
        ]);
        setProducts(p.data || []);
        setCategories(c.data || []);
        setServices(s.data || []);
        setFaqs(f.data || []);
        setPolicies(pol.data || []);
        const map = {};
        (st.data || []).forEach((row) => { map[row.key] = row.value; });
        setSettings(map);
      } else {
        setProducts(localdb.listProducts());
        setCategories(localdb.listCategories());
        setServices(localdb.listServices());
        setFaqs(localdb.listFaqs());
        setPolicies(localdb.listPolicies());
        setSettings(localdb.getAllSettings());
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('store load failed, falling back to demo', e);
      setProducts(localdb.listProducts());
      setCategories(localdb.listCategories());
      setServices(localdb.listServices());
      setFaqs(localdb.listFaqs());
      setPolicies(localdb.listPolicies());
      setSettings(localdb.getAllSettings());
    } finally {
      setCart(cartLib.getCart());
      setWishlist(cartLib.getWishlist());
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

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

  /* ---------- অ্যাকাউন্ট (ডেমো) ---------- */
  const login = useCallback((data) => {
    const rec = { name: data.name || '', phone: data.phone || '', email: data.email || '', at: new Date().toISOString() };
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
      const { data, error } = await supabase.from('orders').insert(order).select().single();
      if (error) throw error;
      return data;
    }
    return localdb.placeOrder(order);
  }, []);

  const findOrder = useCallback(async (code, phone) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', code)
        .eq('customer_phone', phone)
        .maybeSingle();
      return data || null;
    }
    return localdb.findOrder(code, phone);
  }, []);

  const listOrdersByPhone = useCallback(async (phone) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });
      return data || [];
    }
    return localdb.listOrdersByPhone(phone);
  }, []);

  /* ---------- ডেরাইভড ---------- */
  const cartCount = useMemo(() => cart.reduce((s, i) => s + Number(i.qty || 0), 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0),
    [cart]
  );

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

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
