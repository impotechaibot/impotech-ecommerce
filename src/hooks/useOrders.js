import { createLocalStore } from './createLocalStore.js';

/* ==========================================================
   useOrders — orders placed through the checkout.

   The checkout writes a full order record here; the admin panel
   lists them, changes status, opens the detail and deletes. The
   Track page reads the same store so a customer can look up a real
   order id instead of the old demo value.
   ========================================================== */

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

const normalise = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((o) => o && typeof o === 'object' && o.id)
    .map((o) => ({
      id: String(o.id),
      items: Array.isArray(o.items) ? o.items : [],
      customer: o.customer && typeof o.customer === 'object' ? o.customer : {},
      payment: o.payment || 'cod',
      subtotal: Number(o.subtotal) || 0,
      shipping: Number(o.shipping) || 0,
      discount: Number(o.discount) || 0,
      coupon: o.coupon || '',
      total: Number(o.total) || 0,
      status: o.status || 'new',
      note: o.note || '',
      createdAt: o.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const ordersStore = createLocalStore({
  key: 'impotech_orders',
  event: 'impotech-orders-change',
  defaults: [],
  sanitize: normalise,
});

export const readOrders = ordersStore.read;
export const clearOrders = ordersStore.clear;

/** Generate a readable, collision-resistant order id. */
export const makeOrderId = () => {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(100 + Math.random() * 900);
  return `IMP${stamp}${rand}`;
};

export const useOrders = () => {
  const { value, isCustom, save, reset, defaults } = ordersStore.useStore();

  const addOrder = (order) => {
    const next = [order, ...value];
    return save(next) ? order : null;
  };

  const updateStatus = (id, status) =>
    save(value.map((o) => (o.id === id ? { ...o, status } : o)));

  const deleteOrder = (id) => save(value.filter((o) => o.id !== id));

  const findOrder = (id) =>
    value.find((o) => o.id.toUpperCase() === String(id || '').trim().toUpperCase());

  return {
    orders: value,
    isCustom,
    addOrder,
    updateStatus,
    deleteOrder,
    findOrder,
    reset,
    defaults,
  };
};
