/**
 * useOrders.js — অর্ডার (Supabase ⇄ লোকাল)
 * ------------------------------------------------------------
 * আগে অর্ডার শুধু localStorage-এ থাকত, তাই অ্যাডমিন অন্য ডিভাইসে
 * অর্ডার দেখত না। এখন db.js দিয়ে Supabase-এ যায়।
 *
 * API পুরনো OrderAdmin-এর সাথে সামঞ্জস্যপূর্ণ:
 *   updateStatus(id, status) · deleteOrder(id) · reset()
 */
import { useCallback, useEffect, useState } from 'react';
import {
  EVENTS,
  fetchOrders,
  updateOrderStatus,
  deleteOrder as dbDeleteOrder,
  isRemote,
} from '../lib/db.js';
import { toOrder } from '../lib/normalize.js';

export const ORDER_STATUSES = [
  { id: 'new', label: 'নতুন', tone: 'accent' },
  { id: 'processing', label: 'প্রসেসিং', tone: 'info' },
  { id: 'shipped', label: 'শিপড', tone: 'info' },
  { id: 'delivered', label: 'ডেলিভারড', tone: 'ok' },
  { id: 'cancelled', label: 'বাতিল', tone: 'bad' },
];

export const statusLabel = (id) =>
  ORDER_STATUSES.find((s) => s.id === id)?.label || 'নতুন';

export const statusTone = (id) =>
  ORDER_STATUSES.find((s) => s.id === id)?.tone || 'accent';

export const ORDERS_KEY = 'impotech_orders';
export const ORDERS_EVENT = EVENTS.orders;

/** useBackup এই শেপটা আশা করে। */
export const ordersStore = {
  KEY: ORDERS_KEY,
  EVENT: ORDERS_EVENT,
  read: () => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(ORDERS_KEY);
    } catch {
      /* ignore */
    }
  },
};

/** পাঠানোর মতো ইউনিক অর্ডার আইডি। */
export const makeOrderId = () => {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(100 + Math.random() * 900);
  return `IMP${stamp}${rand}`;
};

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    source: isRemote() ? 'supabase' : 'local',
    error: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchOrders();
    setOrders((res.data || []).map(toOrder));
    setStatus({ source: res.source, error: res.error });
    setLoading(false);
    return res;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetchOrders();
      if (!alive) return;
      setOrders((res.data || []).map(toOrder));
      setStatus({ source: res.source, error: res.error });
      setLoading(false);
    })();

    const sync = (e) => {
      if (Array.isArray(e.detail)) setOrders(e.detail.map(toOrder));
    };
    const onStorage = (e) => {
      if (e.key === ORDERS_KEY) load();
    };
    window.addEventListener(ORDERS_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      alive = false;
      window.removeEventListener(ORDERS_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [load]);

  const updateStatus = useCallback(async (id, next) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    const res = await updateOrderStatus(id, next);
    if (!res.ok) setStatus((s) => ({ ...s, error: res.error }));
    return res;
  }, []);

  const remove = useCallback(async (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    const res = await dbDeleteOrder(id);
    if (!res.ok) setStatus((s) => ({ ...s, error: res.error }));
    return res;
  }, []);

  /** সব অর্ডার মুছে ফেলা (OrderAdmin-এর "সব মুছুন")। */
  const reset = useCallback(async () => {
    const current = orders;
    setOrders([]);
    for (const o of current) {
      await dbDeleteOrder(o.id);
    }
    return true;
  }, [orders]);

  const findOrder = useCallback(
    (id) =>
      orders.find(
        (o) =>
          String(o.id).toUpperCase() === String(id || '').trim().toUpperCase() ||
          String(o.order_code).toUpperCase() === String(id || '').trim().toUpperCase()
      ),
    [orders]
  );

  return {
    orders,
    loading,
    status,
    isRemote: isRemote(),
    reload: load,
    updateStatus,
    remove,
    reset,
    findOrder,
    // পুরনো নাম
    deleteOrder: remove,
  };
};

export default useOrders;
