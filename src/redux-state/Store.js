import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './CartState.js';
import wishlistReducer from './WishlistState.js';
import uiReducer from './UiState.js';

// Persist cart + wishlist slices to localStorage on every change.
const persist = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  try {
    localStorage.setItem('impotech_cart', JSON.stringify(state.cart.items));
    localStorage.setItem('impotech_wishlist', JSON.stringify(state.wishlist.ids));
  } catch {
    // storage might be full or blocked — never break the app over it
  }
  return result;
};

const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persist),
});

export default store;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((n, item) => n + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectWishlist = (state) => state.wishlist.ids;
