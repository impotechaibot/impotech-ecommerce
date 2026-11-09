import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';
import Seo from '../components/Seo.jsx';

export default function Contact() {
  const { settings } = useStore();
  const contact = settings?.contact || {};
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error('সব ঘর পূরণ করুন');
      return;
    }
    toast.success('বার্তা পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।');
    setForm({ name: '', phone: '', message: '' });
  };

  const items = [
    { icon: Phone, label: 'ফোন', value: contact.phone || '01884332067', href: `tel:${contact.phone || ''}` },
    { icon: Mail, label: 'ইমেইল', value: contact.email || 'support@impotech.com.bd', href: `mailto:${contact.email || ''}` },
    { icon: MapPin, label: 'ঠিকানা', value: contact.address || 'ঢাকা, বাংলাদেশ' },
    { icon: Clock, label: 'সময়', value: contact.hours || 'সকাল ১০টা — রাত ১০টা' },
  ];

  return (
    <div className="container-x py-10">
      <Seo title="যোগাযোগ — ইম্পোটেক" description="আমাদের সাথে যোগাযোগ করুন।" />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold">যোগাযোগ করুন</h1>
        <p className="text-ink-muted mt-2">যেকোনো প্রশ্ন বা সহায়তার জন্য আমরা আছি</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <span className="w-12 h-12 grid place-items-center rounded-field bg-accent/15 text-accent shrink-0">
                <it.icon size={20} />
              </span>
              <div>
                <p className="text-sm text-ink-muted">{it.label}</p>
                {it.href ? (
                  <a href={it.href} className="font-medium hover:text-accent">{it.value}</a>
                ) : (
                  <p className="font-medium">{it.value}</p>
                )}
              </div>
            </div>
          ))}
          {contact.whatsapp && (
            <a
              href={`https://wa.me/88${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="card p-5 flex items-center gap-4 hover:border-emerald-400/50"
            >
              <span className="w-12 h-12 grid place-items-center rounded-field bg-emerald-400/15 text-emerald-400 shrink-0">
                <MessageCircle size={20} />
              </span>
              <div>
                <p className="text-sm text-ink-muted">হোয়াটসঅ্যাপ</p>
                <p className="font-medium">{contact.whatsapp}</p>
              </div>
            </a>
          )}
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="font-semibold">বার্তা পাঠান</h2>
          <div>
            <label className="label">আপনার নাম</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="নাম" />
          </div>
          <div>
            <label className="label">মোবাইল নম্বর</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="numeric" />
          </div>
          <div>
            <label className="label">বার্তা</label>
            <textarea className="input min-h-[120px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="আপনার প্রশ্ন লিখুন…" />
          </div>
          <button type="submit" className="btn-primary w-full"><Send size={16} /> পাঠান</button>
        </form>
      </div>
    </div>
  );
}
