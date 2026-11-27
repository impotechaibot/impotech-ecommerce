import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Music2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

const DEFAULT_LINK_GROUPS = [
  { title: 'কোম্পানি', links: [{ label: 'আমাদের সম্পর্কে', to: '/content/about' }, { label: 'যোগাযোগ', to: '/contact' }, { label: 'ব্লগ', to: '/blog' }] },
  { title: 'সহায়তা', links: [{ label: 'অর্ডার ট্র্যাকিং', to: '/track' }, { label: 'ডেলিভারি তথ্য', to: '/policy/shipping-policy' }, { label: 'রিটার্ন পলিসি', to: '/policy/return-policy' }, { label: 'প্রশ্নোত্তর', to: '/faq' }] },
];
const hrefFor = (label) => {
  const text = String(label || '').toLowerCase();
  if (text.includes('যোগাযোগ') || text.includes('contact')) return '/contact';
  if (text.includes('আমাদের') || text.includes('about')) return '/content/about';
  if (text.includes('ট্র্যাক') || text.includes('track')) return '/track';
  if (text.includes('রিটার্ন') || text.includes('return')) return '/policy/return-policy';
  if (text.includes('privacy') || text.includes('প্রাইভেসি')) return '/policy/privacy-policy';
  if (text.includes('faq') || text.includes('প্রশ্ন')) return '/faq';
  if (text.includes('ডেলিভারি') || text.includes('shipping')) return '/policy/shipping-policy';
  if (text.includes('ব্লগ') || text.includes('blog')) return '/blog';
  if (text.includes('সার্ভিস') || text.includes('service')) return '/services';
  return '/shop';
};

export default function Footer() {
  const { categories } = useStore();
  const { config: settings } = useSiteConfig();
  const contact = settings?.contact || {};
  const identity = settings || {};
  const year = new Date().getFullYear();
  const rawGroups = Array.isArray(settings?.footerLinks) && settings.footerLinks.length ? settings.footerLinks : DEFAULT_LINK_GROUPS;
  const groups = rawGroups.map((group) => ({ ...group, links: (group.links || []).map((item) => typeof item === 'string' ? { label: item, to: hrefFor(item) } : { ...item, to: item.to || hrefFor(item.label) }) }));
  const footerSettings = { showSocial: true, showContact: true, backgroundColor: '', ...(settings?.footerSettings || {}) };

  const LinkItem = ({ item }) => {
    const href = item.to || hrefFor(item.label);
    const external = /^https?:\/\//i.test(href);
    return external ? <a href={href} target="_blank" rel="noreferrer" className="link-muted">{item.label}</a> : <Link to={href} className="link-muted">{item.label}</Link>;
  };

  return <footer className="border-t border-line bg-surface mt-16" style={{ backgroundColor: footerSettings.backgroundColor || undefined }}>
    <div className="container-x py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <div className="flex items-center gap-2">{identity.logo ? <img src={identity.logo} alt={identity.siteName || 'ইম্পোটেক'} className="w-9 h-9 object-contain rounded-lg"/> : <span className="w-9 h-9 rounded-lg bg-accent grid place-items-center text-black font-bold text-lg">ই</span>}<span className="font-semibold text-lg">{identity.siteName || 'ইম্পোটেক'}</span></div>
        <p className="text-sm text-ink-muted mt-4 leading-relaxed">{identity.tagline || 'চায়না থেকে সরাসরি আমদানি — প্রিমিয়াম বাইক অ্যাকসেসরিজ'}</p>
        {footerSettings.showSocial && <div className="flex gap-2 mt-5">{contact.facebook && <a href={contact.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-field bg-surface2 text-ink-muted hover:text-accent"><Facebook size={17}/></a>}{contact.instagram && <a href={contact.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-field bg-surface2 text-ink-muted hover:text-accent"><Instagram size={17}/></a>}{contact.youtube && <a href={contact.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-field bg-surface2 text-ink-muted hover:text-accent"><Youtube size={17}/></a>}{contact.tiktok && <a href={contact.tiktok} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-field bg-surface2 text-ink-muted hover:text-accent"><Music2 size={17}/></a>}</div>}
      </div>
      {groups.map((group, i) => <div key={group.id || `${group.title}-${i}`}><h4 className="font-semibold mb-4">{group.title}</h4><ul className="space-y-2.5 text-sm">{group.links.map((item, j) => <li key={item.id || `${item.label}-${j}`}><LinkItem item={item}/></li>)}</ul></div>)}
      {footerSettings.showContact && <div><h4 className="font-semibold mb-4">যোগাযোগ</h4><ul className="space-y-3 text-sm text-ink-muted"><li className="flex items-start gap-2.5"><Phone size={16} className="text-accent shrink-0 mt-0.5"/><a href={`tel:${contact.phone || ''}`} className="hover:text-accent">{contact.phone || '01884332067'}</a></li><li className="flex items-start gap-2.5"><Mail size={16} className="text-accent shrink-0 mt-0.5"/><a href={`mailto:${contact.email || ''}`} className="hover:text-accent">{contact.email || 'support@impotech.com.bd'}</a></li><li className="flex items-start gap-2.5"><MapPin size={16} className="text-accent shrink-0 mt-0.5"/><span>{contact.address || 'ঢাকা, বাংলাদেশ'}</span></li></ul><p className="text-xs text-ink-muted mt-4">{contact.hours || 'সকাল ১০টা — রাত ১০টা'}</p></div>}
    </div>
    <div className="border-t border-line"><div className="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted"><p>{(identity.copyright || '© {year} ইম্পোটেক — সর্বস্বত্ব সংরক্ষিত।').replace('{year}', year)}</p><p>বিকাশ • নগদ • রকেট • ক্যাশ অন ডেলিভারি</p></div></div>
  </footer>;
}
