import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Package, Heart, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import { money, dateBn, ORDER_STATUS, toBn } from '../lib/format.js';
import Seo from '../components/Seo.jsx';

export default function Account() {
  const { customer, login, logout, listOrdersByPhone, wishlist } = useStore();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      toast.error('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)');
      return;
    }
    if (mode === 'register' && !form.name.trim()) {
      toast.error('নাম দিন');
      return;
    }
    login({ name: form.name.trim() || 'গ্রাহক', phone: form.phone.trim(), email: form.email.trim() });
    toast.success(mode === 'login' ? 'লগইন সফল' : 'রেজিস্ট্রেশন সফল');
  };

  const loadOrders = async () => {
    if (!customer?.phone) return;
    const list = await listOrdersByPhone(customer.phone);
    setOrders(list);
    setLoaded(true);
  };

  if (!customer) {
    return (
      <div className="container-x py-12 max-w-md">
        <Seo title="অ্যাকাউন্ট — ইম্পোটেক" />
        <div className="card p-8">
          <User size={36} className="mx-auto text-accent" />
          <h1 className="text-xl font-semibold text-center mt-4">
            {mode === 'login' ? 'লগইন করুন' : 'নতুন অ্যাকাউন্ট'}
          </h1>
          <p className="text-sm text-ink-muted text-center mt-2">
            মোবাইল নম্বর দিয়ে অ্যাকাউন্টে ঢুকে অর্ডার হিস্ট্রি দেখুন।
          </p>

          <form onSubmit={submit} className="space-y-4 mt-6">
            {mode === 'register' && (
              <div>
                <label className="label">পূর্ণ নাম</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="আপনার নাম" />
              </div>
            )}
            <div>
              <label className="label">মোবাইল নম্বর</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="numeric" />
            </div>
            <div>
              <label className="label">ইমেইল (ঐচ্ছিক)</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <button type="submit" className="btn-primary w-full">
              {mode === 'login' ? 'লগইন' : 'রেজিস্টার'}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-accent hover:underline w-full text-center mt-4"
          >
            {mode === 'login' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Seo title="আমার অ্যাকাউন্ট — ইম্পোটেক" />
      <div className="card p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-full bg-accent/15 text-accent grid place-items-center text-xl font-semibold">
            {(customer.name || '?').charAt(0)}
          </span>
          <div>
            <p className="font-semibold">{customer.name}</p>
            <p className="text-sm text-ink-muted flex items-center gap-1.5 mt-0.5"><Phone size={13} /> {customer.phone}</p>
            {customer.email && <p className="text-sm text-ink-muted flex items-center gap-1.5 mt-0.5"><Mail size={13} /> {customer.email}</p>}
          </div>
        </div>
        <button onClick={() => { logout(); toast.success('লগআউট হয়েছে'); }} className="btn-outline">
          <LogOut size={16} /> লগআউট
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Link to="/wishlist" className="card p-5 flex items-center gap-3 hover:border-accent/50">
          <Heart size={20} className="text-accent" />
          <div>
            <p className="font-medium">উইশলিস্ট</p>
            <p className="text-sm text-ink-muted">{toBn(wishlist.length)}টি পণ্য</p>
          </div>
        </Link>
        <button onClick={loadOrders} className="card p-5 flex items-center gap-3 hover:border-accent/50 text-left">
          <Package size={20} className="text-accent" />
          <div>
            <p className="font-medium">অর্ডার হিস্ট্রি</p>
            <p className="text-sm text-ink-muted">আপনার অর্ডার দেখুন</p>
          </div>
        </button>
      </div>

      {loaded && (
        <div className="mt-6">
          <h2 className="font-semibold mb-4">আমার অর্ডার ({toBn(orders.length)})</h2>
          {orders.length === 0 ? (
            <div className="card p-10 text-center text-ink-muted">কোনো অর্ডার পাওয়া যায়নি।</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-medium text-accent">{o.order_code}</p>
                    <p className="text-xs text-ink-muted mt-1">{dateBn(o.created_at)} · {toBn((o.items || []).length)}টি আইটেম</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(o.total)}</p>
                    <span className="badge bg-accent/15 text-accent mt-1">{ORDER_STATUS[o.status] || o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
