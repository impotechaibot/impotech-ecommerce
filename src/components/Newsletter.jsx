import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext.jsx';

export default function Newsletter() {
  const { settings } = useStore();
  const nl = settings?.newsletter || {};
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('সঠিক ইমেইল দিন');
      return;
    }
    toast.success('সাবস্ক্রাইব সফল! ধন্যবাদ।');
    setEmail('');
  };

  return (
    <section className="container-x py-14">
      <div className="card p-8 sm:p-10 bg-gradient-to-br from-surface to-surface2 text-center">
        <Mail className="mx-auto text-accent" size={28} />
        <h3 className="text-xl sm:text-2xl font-semibold mt-3">
          {nl.title || 'নিউজলেটার'}
        </h3>
        <p className="text-ink-muted mt-1.5 text-sm">
          {nl.text || 'নতুন অফার সবার আগে পান'}
        </p>
        <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            className="input"
            placeholder="আপনার ইমেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-primary shrink-0">
            <Send size={16} /> {nl.button || 'সাবস্ক্রাইব'}
          </button>
        </form>
      </div>
    </section>
  );
}
