import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { money, discountPercent, stockStatus } from '../lib/format.js';
import Rating from './Rating.jsx';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const off = discountPercent(product.price, product.old_price);
  const stock = stockStatus(product.stock);
  const wished = wishlist.some((w) => w.id === product.id);

  const add = (e) => {
    e.preventDefault();
    if (Number(product.stock || 0) <= 0) {
      toast.error('পণ্যটি স্টকে নেই');
      return;
    }
    addToCart(product, 1);
    toast.success('কার্টে যোগ হয়েছে');
  };

  const wish = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    toast.success(wished ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ হয়েছে');
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="card overflow-hidden group hover:border-accent/50 transition-colors flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-surface2">
        <img
          src={(product.images && product.images[0]) || ''}
          alt={product.name_bn || product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="badge bg-red-500/90 text-white">-{off}%</span>
          )}
          {product.badge && (
            <span className="badge bg-accent text-black">{product.badge}</span>
          )}
        </div>
        <button
          onClick={wish}
          aria-label="উইশলিস্ট"
          className={`absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full backdrop-blur
            ${wished ? 'bg-accent text-black' : 'bg-black/50 text-white hover:bg-black/70'}`}
        >
          <Heart size={16} className={wished ? 'fill-black' : ''} />
        </button>
        {Number(product.stock || 0) <= 0 && (
          <div className="absolute inset-0 bg-black/60 grid place-items-center">
            <span className="badge bg-surface text-ink-muted">স্টক শেষ</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-ink-muted">{product.categories?.name_bn || product.categories?.name || ''}</p>
        <h3 className="font-medium mt-1 clamp-2 leading-snug">
          {product.name_bn || product.name}
        </h3>
        <div className="mt-2">
          <Rating value={product.rating} count={product.reviews_count} />
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-accent font-semibold">{money(product.price)}</p>
            {Number(product.old_price || 0) > Number(product.price || 0) && (
              <p className="text-xs text-ink-muted line-through">{money(product.old_price)}</p>
            )}
          </div>
          <button
            onClick={add}
            aria-label="কার্টে যোগ করুন"
            className="w-10 h-10 grid place-items-center rounded-field bg-accent text-black hover:bg-accent-dark transition-colors"
          >
            <ShoppingCart size={17} />
          </button>
        </div>
        <p className={`text-xs mt-2 ${stock.tone === 'out' ? 'text-red-400' : stock.tone === 'low' ? 'text-amber-400' : 'text-emerald-400'}`}>
          {stock.label}
        </p>
      </div>
    </Link>
  );
}
