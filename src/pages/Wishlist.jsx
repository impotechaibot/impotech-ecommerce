import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { money } from '../lib/format.js';
import Seo from '../components/Seo.jsx';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <Seo title="উইশলিস্ট — ইম্পোটেক" />
        <Heart size={48} className="mx-auto text-ink-muted" />
        <h1 className="text-2xl font-semibold mt-5">উইশলিস্ট খালি</h1>
        <p className="text-ink-muted mt-2">পছন্দের পণ্য উইশলিস্টে যোগ করুন।</p>
        <Link to="/shop" className="btn-primary mt-6">কেনাকাটা করুন</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Seo title="উইশলিস্ট — ইম্পোটেক" />
      <h1 className="text-2xl font-semibold mb-6">উইশলিস্ট</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {wishlist.map((item) => (
          <div key={item.id} className="card overflow-hidden flex flex-col">
            <Link to={`/product/${item.slug}`} className="aspect-square bg-surface2 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <Link to={`/product/${item.slug}`} className="font-medium clamp-2 hover:text-accent">{item.name}</Link>
              <p className="text-accent font-semibold mt-2">{money(item.price)}</p>
              <div className="flex gap-2 mt-auto pt-3">
                <button
                  onClick={() => { addToCart({ ...item, images: [item.image] }, 1); toast.success('কার্টে যোগ হয়েছে'); }}
                  className="btn-primary flex-1 text-xs"
                >
                  <ShoppingCart size={14} /> কার্টে
                </button>
                <button
                  onClick={() => { removeFromWishlist(item.id); toast.success('সরানো হয়েছে'); }}
                  className="w-10 h-10 grid place-items-center rounded-field border border-line text-ink-muted hover:text-red-400"
                  aria-label="মুছুন"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
