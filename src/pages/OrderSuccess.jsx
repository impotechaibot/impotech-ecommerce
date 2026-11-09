import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Phone, Home } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { money, toBn, PAYMENT_LABEL } from '../lib/format.js';
import Seo from '../components/Seo.jsx';

export default function OrderSuccess() {
  const { code } = useParams();
  const { state } = useLocation();
  const { settings } = useStore();
  const order = state?.order;
  const contact = settings?.contact || {};

  return (
    <div className="container-x py-16 max-w-2xl">
      <Seo title="অর্ডার সফল — ইম্পোটেক" />
      <div className="card p-8 text-center">
        <CheckCircle2 size={56} className="mx-auto text-emerald-400" />
        <h1 className="text-2xl font-semibold mt-5">অর্ডার সফল হয়েছে!</h1>
        <p className="text-ink-muted mt-2">
          {settings?.checkout?.confirmMessage || 'ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি।'}
        </p>

        <div className="bg-surface2 rounded-field p-5 mt-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted text-sm">অর্ডার নম্বর</span>
            <span className="font-semibold text-accent">{code}</span>
          </div>
          {order && (
            <>
              <div className="flex items-center justify-between mt-3">
                <span className="text-ink-muted text-sm">মোট</span>
                <span className="font-semibold">{money(order.total)}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-ink-muted text-sm">পেমেন্ট</span>
                <span>{PAYMENT_LABEL[order.payment_method] || order.payment_method}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-ink-muted text-sm">আইটেম</span>
                <span>{toBn((order.items || []).length)}টি</span>
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-ink-muted mt-5">
          আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে ট্র্যাক করতে পারবেন।
        </p>

        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <Link to="/track" className="btn-primary"><Package size={16} /> অর্ডার ট্র্যাক</Link>
          <Link to="/shop" className="btn-outline"><Home size={16} /> আরও কেনাকাটা</Link>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="btn-ghost"><Phone size={16} /> {contact.phone}</a>
          )}
        </div>
      </div>
    </div>
  );
}
