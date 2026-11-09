import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

export default function Footer() {
  const { settings, categories } = useStore();
  const contact = settings?.contact || {};
  const identity = settings?.identity || {};
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface mt-16">
      <div className="container-x py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-accent grid place-items-center text-black font-bold text-lg">ই</span>
            <span className="font-semibold text-lg">{identity.siteName || 'ইম্পোটেক'}</span>
          </div>
          <p className="text-sm text-ink-muted mt-4 leading-relaxed">
            {identity.tagline || 'চায়না থেকে সরাসরি আমদানি — প্রিমিয়াম বাইক অ্যাকসেসরিজ'}
          </p>
          <div className="flex gap-2 mt-5">
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-field bg-surface2 text-ink-muted hover:text-accent">
                <Facebook size={17} />
              </a>
            )}
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-field bg-surface2 text-ink-muted hover:text-accent">
                <Instagram size={17} />
              </a>
            )}
            {contact.youtube && (
              <a href={contact.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-field bg-surface2 text-ink-muted hover:text-accent">
                <Youtube size={17} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">ক্যাটাগরি</h4>
          <ul className="space-y-2.5 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`} className="link-muted">
                  {c.name_bn || c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">দ্রুত লিংক</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/shop" className="link-muted">সব পণ্য</Link></li>
            <li><Link to="/services" className="link-muted">সার্ভিস</Link></li>
            <li><Link to="/track" className="link-muted">অর্ডার ট্র্যাক</Link></li>
            <li><Link to="/faq" className="link-muted">সাধারণ প্রশ্নোত্তর</Link></li>
            <li><Link to="/policy/return-policy" className="link-muted">রিটার্ন পলিসি</Link></li>
            <li><Link to="/policy/privacy-policy" className="link-muted">প্রাইভেসি পলিসি</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">যোগাযোগ</h4>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="text-accent shrink-0 mt-0.5" />
              <a href={`tel:${contact.phone || ''}`} className="hover:text-accent">{contact.phone || '01884332067'}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={16} className="text-accent shrink-0 mt-0.5" />
              <a href={`mailto:${contact.email || ''}`} className="hover:text-accent">{contact.email || 'support@impotech.com.bd'}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
              <span>{contact.address || 'ঢাকা, বাংলাদেশ'}</span>
            </li>
          </ul>
          <p className="text-xs text-ink-muted mt-4">{contact.hours || 'সকাল ১০টা — রাত ১০টা'}</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <p>{(identity.copyright || '© {year} ইম্পোটেক — সর্বস্বত্ব সংরক্ষিত।').replace('{year}', year)}</p>
          <p>বিকাশ • নগদ • রকেট • ক্যাশ অন ডেলিভারি</p>
        </div>
      </div>
    </footer>
  );
}
