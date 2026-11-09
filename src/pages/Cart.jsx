import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { money, toBn } from '../lib/format.js';
import Seo from '../components/Seo.jsx';

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartSubtotal, settings } = useStore();
  const checkout = settings?.checkout || {};
  const freeAbove = Number(checkout.freeDeliveryAbove || 0);
  const shipping = cartSubtotal >= freeAbove && freeAbove > 0 ? 0 : Number(checkout.deliveryCharge || 0);
  const total = cartSubtotal + (cart.length ? shipping : 0);

  if (cart.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <Seo title="কার্ট — ইম্পোটেক" />
        <ShoppingBag size={48} className="mx-auto text-ink-muted" />
        <h1 className="text-2xl font-semibold mt-5">আপনার কার্ট খালি</h1>
        <p className="text-ink-muted mt-2">পছন্দের পণ্য যোগ করে কেনাকাটা শুরু করুন।</p>
        <Link to="/shop" className="btn-primary mt-6">কেনাকাটা শুরু করুন</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Seo title="কার্ট — ইম্পোটেক" />
      <h1 className="text-2xl font-semibold mb-6">শপিং কার্ট ({toBn(cart.length)})</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.key} className="card p-4 flex gap-4">
              <Link to={`/product/${item.slug}`} className="w-24 h-24 rounded-field overflow-hidden bg-surface2 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-medium hover:text-accent clamp-2">
                  {item.name}
                </Link>
                {item.variant && <p className="text-xs text-ink-muted mt-1">ভ্যারিয়েন্ট: {item.variant}</p>}
                <p className="text-accent font-semibold mt-2">{money(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-line rounded-field">
                    <button
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="w-9 h-9 grid place-items-center text-ink-muted hover:text-ink"
                      aria-label="কমান"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm">{toBn(item.qty)}</span>
                    <button
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="w-9 h-9 grid place-items-center text-ink-muted hover:text-ink"
                      aria-label="বাড়ান"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="text-ink-muted hover:text-red-400 flex items-center gap-1.5 text-sm"
                  >
                    <Trash2 size={15} /> মুছুন
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold">{money(Number(item.price) * Number(item.qty))}</p>
              </div>
            </div>
          ))}
        </div>

        {/* সারাংশ */}
        <div className="card p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold mb-4">অর্ডার সারাংশ</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">সাবটোটাল</span>
              <span>{money(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">ডেলিভারি চার্জ</span>
              <span>{shipping === 0 ? <span className="text-emerald-400">ফ্রি</span> : money(shipping)}</span>
            </div>
            {freeAbove > 0 && cartSubtotal < freeAbove && (
              <p className="text-xs text-ink-muted bg-surface2 rounded-field p-2.5">
                আরও {money(freeAbove - cartSubtotal)} কিনলে ফ্রি ডেলিভারি!
              </p>
            )}
            <div className="border-t border-line pt-3 flex justify-between text-base font-semibold">
              <span>মোট</span>
              <span className="text-accent">{money(total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-5">
            চেকআউট করুন <ArrowRight size={16} />
          </Link>
          <Link to="/shop" className="btn-ghost w-full mt-2">আরও কেনাকাটা</Link>
        </div>
      </div>
    </div>
  );
}
