import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Tag, Truck, CreditCard, Wallet, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { localdb } from '../lib/localdb.js';
import { money, toBn } from '../lib/format.js';
import Seo from '../components/Seo.jsx';

export default function Checkout() {
  const { cart, cartSubtotal, clearCart, settings, placeOrder, customer } = useStore();
  const navigate = useNavigate();
  const checkout = settings?.checkout || {};

  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: '',
    city: 'ঢাকা',
    note: '',
  });
  const [payment, setPayment] = useState(checkout.codEnabled ? 'cod' : 'bkash');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const freeAbove = Number(checkout.freeDeliveryAbove || 0);
  const shipping = cartSubtotal >= freeAbove && freeAbove > 0 ? 0 : Number(checkout.deliveryCharge || 0);
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round((cartSubtotal * Number(appliedCoupon.value)) / 100)
      : Number(appliedCoupon.value)
    : 0;
  const total = Math.max(0, cartSubtotal + shipping - discount);

  const paymentOptions = useMemo(() => {
    const opts = [];
    if (checkout.codEnabled) opts.push({ id: 'cod', label: 'ক্যাশ অন ডেলিভারি', icon: Banknote, hint: 'পণ্য হাতে পেয়ে টাকা দিন' });
    if (checkout.bkashEnabled) opts.push({ id: 'bkash', label: 'বিকাশ', icon: Wallet, hint: checkout.bkashNumber ? `পেমেন্ট নম্বর: ${checkout.bkashNumber}` : '' });
    if (checkout.nagadEnabled) opts.push({ id: 'nagad', label: 'নগদ', icon: Wallet, hint: checkout.nagadNumber ? `পেমেন্ট নম্বর: ${checkout.nagadNumber}` : '' });
    if (checkout.rocketEnabled) opts.push({ id: 'rocket', label: 'রকেট', icon: Wallet, hint: checkout.rocketNumber ? `পেমেন্ট নম্বর: ${checkout.rocketNumber}` : '' });
    opts.push({ id: 'card', label: 'কার্ড / অনলাইন', icon: CreditCard, hint: 'ভিসা / মাস্টারকার্ড' });
    return opts;
  }, [checkout]);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    const list = localdb.listCoupons();
    const found = list.find((c) => (c.code || '').toUpperCase() === code);
    if (!found) {
      toast.error('কুপন কোডটি সঠিক নয়');
      return;
    }
    if (found.min_order && cartSubtotal < Number(found.min_order)) {
      toast.error(`এই কুপনের জন্য কমপক্ষে ${money(found.min_order)} কেনাকাটা করতে হবে`);
      return;
    }
    setAppliedCoupon(found);
    toast.success('কুপন প্রয়োগ হয়েছে');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('নাম দিন'); return; }
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) { toast.error('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)'); return; }
    if (!form.address.trim()) { toast.error('ঠিকানা দিন'); return; }
    if (cart.length === 0) { toast.error('কার্ট খালি'); return; }

    setSubmitting(true);
    try {
      const order = {
        order_code: localdb.nextOrderCode(),
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim(),
        customer_address: `${form.address.trim()}, ${form.city}`,
        city: form.city,
        note: form.note.trim(),
        items: cart.map((i) => ({
          product_id: i.id,
          name: i.name,
          slug: i.slug,
          price: Number(i.price),
          qty: Number(i.qty),
          variant: i.variant || '',
          image: i.image,
        })),
        subtotal: cartSubtotal,
        shipping,
        discount,
        coupon_code: appliedCoupon?.code || '',
        total,
        payment_method: payment,
        status: 'new',
      };

      const saved = await placeOrder(order);
      clearCart();
      toast.success('অর্ডার সফল হয়েছে!');
      navigate(`/order-success/${saved.order_code}`, { state: { order: saved } });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <Seo title="চেকআউট — ইম্পোটেক" />
        <h1 className="text-2xl font-semibold">কার্ট খালি</h1>
        <p className="text-ink-muted mt-2">চেকআউট করতে আগে পণ্য যোগ করুন।</p>
        <Link to="/shop" className="btn-primary mt-6">কেনাকাটা করুন</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Seo title="চেকআউট — ইম্পোটেক" />
      <h1 className="text-2xl font-semibold mb-6">চেকআউট</h1>

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          {/* ডেলিভারি তথ্য */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Truck size={18} className="text-accent" /> ডেলিভারি তথ্য
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">পূর্ণ নাম *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="আপনার নাম" />
              </div>
              <div>
                <label className="label">মোবাইল নম্বর *</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="numeric" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">ইমেইল (ঐচ্ছিক)</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">সম্পূর্ণ ঠিকানা *</label>
                <textarea className="input min-h-[80px]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="বাসা/রোড/এলাকা" />
              </div>
              <div>
                <label className="label">জেলা / শহর</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="label">অর্ডার নোট (ঐচ্ছিক)</label>
                <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="বিশেষ নির্দেশনা" />
              </div>
            </div>
          </div>

          {/* পেমেন্ট */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-accent" /> পেমেন্ট পদ্ধতি
            </h2>
            <div className="space-y-2.5">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-field border cursor-pointer transition-colors ${
                    payment === opt.id ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    className="accent-accent"
                  />
                  <opt.icon size={18} className="text-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opt.label}</p>
                    {opt.hint && <p className="text-xs text-ink-muted mt-0.5">{opt.hint}</p>}
                  </div>
                  {payment === opt.id && <Check size={18} className="text-accent" />}
                </label>
              ))}
            </div>
            {checkout.paymentNote && (
              <p className="text-xs text-ink-muted mt-4 bg-surface2 rounded-field p-3">{checkout.paymentNote}</p>
            )}
          </div>
        </div>

        {/* সারাংশ */}
        <div className="card p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold mb-4">অর্ডার সারাংশ</h2>

          <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
            {cart.map((i) => (
              <div key={i.key} className="flex gap-3 text-sm">
                <div className="w-12 h-12 rounded-field overflow-hidden bg-surface2 shrink-0">
                  <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="clamp-2 leading-snug">{i.name}</p>
                  <p className="text-xs text-ink-muted">{toBn(i.qty)} × {money(i.price)}</p>
                </div>
                <p className="font-medium">{money(Number(i.price) * Number(i.qty))}</p>
              </div>
            ))}
          </div>

          {/* কুপন */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                className="input pl-9"
                placeholder="কুপন কোড"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
            </div>
            <button type="button" className="btn-outline shrink-0" onClick={applyCoupon}>প্রয়োগ</button>
          </div>

          <div className="space-y-3 text-sm border-t border-line pt-4">
            <div className="flex justify-between">
              <span className="text-ink-muted">সাবটোটাল</span>
              <span>{money(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">ডেলিভারি চার্জ</span>
              <span>{shipping === 0 ? <span className="text-emerald-400">ফ্রি</span> : money(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>ডিসকাউন্ট ({appliedCoupon?.code})</span>
                <span>-{money(discount)}</span>
              </div>
            )}
            <div className="border-t border-line pt-3 flex justify-between text-base font-semibold">
              <span>সর্বমোট</span>
              <span className="text-accent">{money(total)}</span>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-5" disabled={submitting}>
            {submitting ? 'অর্ডার হচ্ছে…' : 'অর্ডার নিশ্চিত করুন'}
          </button>
          <p className="text-xs text-ink-muted text-center mt-3">
            অর্ডার করলে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন।
          </p>
        </div>
      </form>
    </div>
  );
}
