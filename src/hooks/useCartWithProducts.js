import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCartItems, selectCartCount } from '../redux-state/Store.js';
import { useProducts } from './useProducts.js';
import { productImage } from '../utils/format.js';

// The cart stores a snapshot of id/name/price/image so it survives across
// reloads. When the admin edits or deletes a product we want the cart to follow
// the live catalogue instead of keeping a stale snapshot:
//   • product still exists  → price / name / image come from the catalogue
//   • product was deleted   → the line is dropped from the cart view
// If an id is no longer in the catalogue we also flag it as removed so callers
// can show a note.
export const useCartWithProducts = () => {
  const rawItems = useSelector(selectCartItems);
  const rawCount = useSelector(selectCartCount);
  const { products } = useProducts();

  return useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    const items = [];
    const removed = [];

    rawItems.forEach((item) => {
      const live = byId.get(item.id);
      if (!live) {
        removed.push(item);
        return;
      }
      items.push({
        ...item,
        name: live.name,
        bn: live.bn,
        price: live.price,
        image: productImage(live, 0) || item.image,
      });
    });

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((n, i) => n + i.quantity, 0);

    return {
      items,
      total,
      count,
      removed,
      // raw values are useful when an item was deleted mid-session
      rawCount,
    };
  }, [rawItems, rawCount, products]);
};
