import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { money } from '../lib/format.js';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';

export default function Services() {
  const { services, loading } = useStore();

  if (loading) return <Loader />;

  return (
    <div className="container-x py-10">
      <Seo title="আমাদের সার্ভিস — ইম্পোটেক" description="ডেলিভারি, ইনস্টলেশন, ওয়ারেন্টি ও আরও অনেক সুবিধা।" />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold">আমাদের সার্ভিস</h1>
        <p className="text-ink-muted mt-2">কেনার পরেও আমরা আপনার পাশে আছি</p>
      </div>

      {services.length === 0 ? (
        <div className="card p-16 text-center text-ink-muted">এখনো কোনো সার্ভিস যোগ করা হয়নি।</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <Link key={s.id} to={`/service/${s.slug}`} className="card overflow-hidden hover:border-accent/50 transition-colors group">
              {s.images && s.images[0] && (
                <div className="aspect-video overflow-hidden bg-surface2">
                  <img src={s.images[0]} alt={s.name_bn || s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                <span className="text-3xl">{s.icon || '⭐'}</span>
                <h2 className="font-semibold mt-3">{s.name_bn || s.name}</h2>
                <p className="text-sm text-ink-muted mt-2 clamp-2">{s.short_desc}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-accent font-medium">
                    {Number(s.price || 0) > 0 ? money(s.price) : 'ফ্রি'}
                  </span>
                  <span className="text-sm text-ink-muted flex items-center gap-1">
                    বিস্তারিত <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
