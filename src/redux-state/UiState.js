import { createSlice } from '@reduxjs/toolkit';

// Small UI slice: cart drawer visibility + a single lightweight toast.
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    searchOpen: false,
    toast: null,
  },
  reducers: {
    openCart(state) {
      state.cartOpen = true;
    },
    closeCart(state) {
      state.cartOpen = false;
    },
    toggleCart(state) {
      state.cartOpen = !state.cartOpen;
    },
    setSearchOpen(state, action) {
      state.searchOpen = action.payload;
    },
    showToast(state, action) {
      state.toast = { id: Date.now(), message: action.payload };
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
