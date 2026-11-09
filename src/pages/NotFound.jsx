import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <Seo title="পেজ পাওয়া যায়নি — ইম্পোটেক" />
      <p className="text-7xl font-bold text-accent">৪০৪</p>
      <h1 className="text-2xl font-semibold mt-4">পেজটি পাওয়া যায়নি</h1>
      <p className="text-ink-muted mt-2">আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে ফেলা হয়েছে।</p>
      <div className="flex flex-wrap gap-3 justify-center mt-7">
        <Link to="/" className="btn-primary"><Home size={16} /> হোমে ফিরুন</Link>
        <Link to="/shop" className="btn-outline"><Search size={16} /> পণ্য খুঁজুন</Link>
      </div>
    </div>
  );
}
