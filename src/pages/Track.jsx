import { useState } from 'react';
import { Package, Search, CheckCircle2, Truck, Home, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { money, dateTimeBn, ORDER_STATUS, PAYMENT_LABEL, toBn } from '../lib/format.js';
import Seo from '../components/Seo.jsx';

const STEPS = [
  { id: 'new', label: 'অর্ডার গৃহীত', icon: CheckCircle2 },
  { id: 'processing', label: 'প্রসেসিং', icon: Clock },
  { id: 'shipped', label: 'শিপড', icon: Truck },
  { id: 'delivered', label: 'ডেলিভারড', icon: Home },
];

export default function Track() {
  const { findOrder } = useStore();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) {
      toast.error('অর্ডার নম্বর ও মোবাইল নম্বর দুটোই দিন');
      return;
    }
    setLoading(true);
    try {
      const found = await findOrder(code.trim(), phone.trim());
      setOrder(found);
      setSearched(true);
      if (!found) toast.error('এই তথ্যে কোনো অর্ডার পাওয়া যায়নি');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STEPS.findIndex((s) => s.id === order.status) : -1;

  return (
    <div className="container-x py-12 max-w-3xl">
      <Seo title="অর্ডার ট্র্যাক — ইম্পোটেক" />
      <div className="text-center mb-8">
        <Package size={40} className="mx-auto text-accent" />
        <h1 className="text-2xl font-semibold mt-4">অর্ডার ট্র্যাক করুন</h1>
        <p className="text-ink-muted mt-2 text-sm">অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে আপনার অর্ডারের অবস্থা জানুন।</p>
      </div>

      <form onSubmit={submit} className="card p-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="label">অর্ডার নম্বর</label>
          <input className="input" placeholder="IMP-1001" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div>
          <label className="label">মোবাইল নম্বর</label>
          <input className="input" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Search size={16} /> {loading ? 'খোঁজা হচ্ছে…' : 'ট্র্যাক'}
        </button>
      </form>

      {searched && order && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-ink-muted">অর্ডার নম্বর</p>
              <p className="font-semibold text-accent">{order.order_code}</p>
            </div>
            <span className="badge bg-accent/15 text-accent">{ORDER_STATUS[order.status] || order.status}</span>
          </div>

          {/* স্টেপার */}
          <div className="flex items-center justify-between mt-8 mb-2">
            {STEPS.map((s, i) => {
              const done = i <= currentStep;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <span className={`absolute top-5 right-1/2 w-full h-0.5 ${i <= currentStep ? 'bg-accent' : 'bg-line'}`} />
                  )}
                  <span className={`relative z-10 w-10 h-10 grid place-items-center rounded-full ${done ? 'bg-accent text-black' : 'bg-surface2 text-ink-muted'}`}>
                    <s.icon size={18} />
                  </span>
                  <span className={`text-xs mt-2 text-center ${done ? 'text-accent' : 'text-ink-muted'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-line mt-6 pt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">তারিখ</span>
              <span>{dateTimeBn(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">কাস্টমার</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">পেমেন্ট</span>
              <span>{PAYMENT_LABEL[order.payment_method] || order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">মোট</span>
              <span className="font-semibold text-accent">{money(order.total)}</span>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="border-t border-line mt-5 pt-5">
              <p className="text-sm font-medium mb-3">আইটেম ({toBn(order.items.length)})</p>
              <div className="space-y-2">
                {order.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted">{it.name} × {toBn(it.qty)}</span>
                    <span>{money(Number(it.price) * Number(it.qty))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {searched && !order && (
        <div className="card p-12 mt-6 text-center">
          <p className="text-ink-muted">এই তথ্যে কোনো অর্ডার পাওয়া যায়নি। অর্ডার নম্বর ও মোবাইল নম্বর আবার যাচাই করুন।</p>
        </div>
      )}
    </div>
  );
}
