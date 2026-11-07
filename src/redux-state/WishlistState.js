import { createSlice } from '@reduxjs/toolkit';

const loadWishlist = () => {
  try {
    const raw = localStorage.getItem('impotech_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    ids: loadWishlist(),
  },
  reducers: {
    toggleWishlist(state, action) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((x) => x !== id);
      } else {
        state.ids.push(id);
      }
    },
    clearWishlist(state) {
      state.ids = [];
    },
  },
});

export const wishlistActions = wishlistSlice.actions;
export default wishlistSlice.reducer;
