import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import Seo from '../components/Seo.jsx';

export default function Faq() {
  const { faqs } = useStore();
  const [open, setOpen] = useState(null);

  return (
    <div className="container-x py-10 max-w-3xl">
      <Seo title="সাধারণ প্রশ্নোত্তর — ইম্পোটেক" description="ডেলিভারি, পেমেন্ট, রিটার্ন ও অর্ডার সংক্রান্ত প্রশ্নের উত্তর।" />
      <div className="text-center mb-10">
        <HelpCircle size={40} className="mx-auto text-accent" />
        <h1 className="text-3xl font-semibold mt-4">সাধারণ প্রশ্নোত্তর</h1>
        <p className="text-ink-muted mt-2">আপনার প্রশ্নের উত্তর এখানে খুঁজুন</p>
      </div>

      {faqs.length === 0 ? (
        <div className="card p-16 text-center text-ink-muted">এখনো কোনো প্রশ্ন যোগ করা হয়নি।</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.id} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === f.id ? null : f.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-medium">{f.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-accent shrink-0 transition-transform ${open === f.id ? 'rotate-180' : ''}`}
                />
              </button>
              {open === f.id && (
                <div className="px-5 pb-5 text-sm text-ink-muted leading-relaxed border-t border-line pt-4">
                  {f.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
