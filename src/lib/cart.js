/**
 * cart.js — কার্ট ও উইশলিস্ট (localStorage)
 */

const CART_KEY = 'impotech_cart_v1';
const WISH_KEY = 'impotech_wishlist_v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('cart write failed', e);
  }
}

/* ---------- কার্ট ---------- */
export function getCart() {
  return read(CART_KEY, []);
}

export function saveCart(items) {
  write(CART_KEY, items);
  return items;
}

export function addToCart(product, qty = 1, variant = '') {
  const items = getCart();
  const key = product.id + (variant ? '::' + variant : '');
  const existing = items.find((i) => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({
      key,
      id: product.id,
      name: product.name_bn || product.name,
      slug: product.slug,
      price: Number(product.price || 0),
      image: (product.images && product.images[0]) || '',
      variant,
      qty,
    });
  }
  return saveCart(items);
}

export function updateQty(key, qty) {
  const items = getCart().map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i));
  return saveCart(items);
}

export function removeFromCart(key) {
  return saveCart(getCart().filter((i) => i.key !== key));
}

export function clearCart() {
  return saveCart([]);
}

export function cartCount() {
  return getCart().reduce((s, i) => s + Number(i.qty || 0), 0);
}

export function cartSubtotal() {
  return getCart().reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0);
}

/* ---------- উইশলিস্ট ---------- */
export function getWishlist() {
  return read(WISH_KEY, []);
}

export function toggleWishlist(product) {
  const list = getWishlist();
  const exists = list.find((i) => i.id === product.id);
  const next = exists
    ? list.filter((i) => i.id !== product.id)
    : [
        ...list,
        {
          id: product.id,
          name: product.name_bn || product.name,
          slug: product.slug,
          price: Number(product.price || 0),
          image: (product.images && product.images[0]) || '',
        },
      ];
  write(WISH_KEY, next);
  return next;
}

export function inWishlist(id) {
  return getWishlist().some((i) => i.id === id);
}

export function removeFromWishlist(id) {
  const next = getWishlist().filter((i) => i.id !== id);
  write(WISH_KEY, next);
  return next;
}
