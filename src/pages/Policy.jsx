import { Link, useParams } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import Seo from '../components/Seo.jsx';

export default function Policy() {
  const { slug } = useParams();
  const { policies } = useStore();
  const policy = policies.find((p) => p.slug === slug);

  if (!policy) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">পেজটি পাওয়া যায়নি</h1>
        <Link to="/" className="btn-primary mt-6">হোমে ফিরুন</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10 max-w-3xl">
      <Seo title={`${policy.title} — ইম্পোটেক`} description={(policy.body || '').slice(0, 150)} />
      <Link to="/" className="text-sm text-ink-muted hover:text-accent flex items-center gap-1.5 mb-6">
        <ArrowLeft size={15} /> হোম
      </Link>
      <div className="card p-8">
        <FileText size={32} className="text-accent" />
        <h1 className="text-2xl font-semibold mt-4">{policy.title}</h1>
        <div className="mt-6 text-ink-muted leading-relaxed whitespace-pre-line">
          {policy.body}
        </div>
      </div>
    </div>
  );
}
