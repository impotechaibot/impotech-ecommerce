import { Link, useParams } from 'react-router-dom';
import { Clock, Tag, ArrowLeft, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { money } from '../lib/format.js';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { services, settings, loading } = useStore();
  const service = services.find((s) => s.slug === slug);
  const contact = settings?.contact || {};

  if (loading) return <Loader />;

  if (!service) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">সার্ভিসটি পাওয়া যায়নি</h1>
        <Link to="/services" className="btn-primary mt-6">সব সার্ভিস দেখুন</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8 max-w-4xl">
      <Seo title={`${service.name_bn || service.name} — ইম্পোটেক`} description={service.short_desc} />
      <Link to="/services" className="text-sm text-ink-muted hover:text-accent flex items-center gap-1.5 mb-6">
        <ArrowLeft size={15} /> সব সার্ভিস
      </Link>

      <div className="card overflow-hidden">
        {service.images && service.images[0] && (
          <div className="aspect-video bg-surface2 overflow-hidden">
            <img src={service.images[0]} alt={service.name_bn || service.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-7">
          <span className="text-4xl">{service.icon || '⭐'}</span>
          <h1 className="text-2xl font-semibold mt-4">{service.name_bn || service.name}</h1>
          {service.name_bn && service.name && <p className="text-sm text-ink-muted mt-1">{service.name}</p>}

          <div className="flex flex-wrap gap-4 mt-5">
            <span className="flex items-center gap-2 text-accent font-medium">
              <Tag size={16} /> {Number(service.price || 0) > 0 ? money(service.price) : 'ফ্রি'}
            </span>
            {service.duration && (
              <span className="flex items-center gap-2 text-ink-muted">
                <Clock size={16} /> {service.duration}
              </span>
            )}
          </div>

          <div className="mt-6 text-ink-muted leading-relaxed whitespace-pre-line">
            {service.description || service.short_desc}
          </div>

          {service.videos && service.videos.length > 0 && (
            <div className="mt-7">
              <h2 className="font-semibold mb-3">ভিডিও</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {service.videos.map((v, i) => (
                  <video key={i} src={v} controls className="w-full rounded-field bg-black aspect-video" />
                ))}
              </div>
            </div>
          )}

          {service.images && service.images.length > 1 && (
            <div className="mt-7">
              <h2 className="font-semibold mb-3">গ্যালারি</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {service.images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square rounded-field overflow-hidden bg-surface2">
                    <img src={img} alt={`গ্যালারি ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/shop" className="btn-primary">কেনাকাটা করুন</Link>
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="btn-outline"><Phone size={16} /> {contact.phone}</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
