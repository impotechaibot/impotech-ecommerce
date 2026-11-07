import { createSlice } from '@reduxjs/toolkit';

// Reads the persisted cart so a refresh does not empty the basket.
const loadCart = () => {
  try {
    const raw = localStorage.getItem('impotech_cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addItemToCart(state, action) {
      const newItem = action.payload;
      const existing = state.items.find((item) => item.id === newItem.id);
      if (!existing) {
        state.items.push({
          id: newItem.id,
          name: newItem.name,
          bn: newItem.bn,
          price: newItem.price,
          image: newItem.image,
          quantity: 1,
        });
      } else {
        existing.quantity += 1;
      }
    },
    removeItemFromCart(state, action) {
      const id = action.payload;
      const existing = state.items.find((item) => item.id === id);
      if (!existing) return;
      if (existing.quantity === 1) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        existing.quantity -= 1;
      }
    },
    setItemQuantity(state, action) {
      const { id, quantity } = action.payload;
      const existing = state.items.find((item) => item.id === id);
      if (!existing) return;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        existing.quantity = quantity;
      }
    },
    deleteItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;
