import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import HeroSlider from '../components/HeroSlider.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Newsletter from '../components/Newsletter.jsx';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';
import { money } from '../lib/format.js';

const ICONS = [Truck, ShieldCheck, RotateCcw, Headphones];
const DEFAULT_SECTION_LAYOUT = [
  { id: 'hero', type: 'hero', enabled: true, padding: '0' },
  { id: 'perks', type: 'perks', enabled: true, padding: '40px 0' },
  { id: 'categories', type: 'categories', enabled: true, title: 'ক্যাটাগরি', subtitle: 'আপনার পছন্দের ক্যাটাগরি বেছে নিন', padding: '32px 0' },
  { id: 'featured', type: 'featured', enabled: true, title: 'ফিচার্ড পণ্য', subtitle: 'আমাদের বাছাই করা সেরা পণ্য', padding: '32px 0' },
  { id: 'banners', type: 'banners', enabled: true, padding: '32px 0' },
  { id: 'services', type: 'services', enabled: true, title: 'আমাদের সার্ভিস', subtitle: 'কেনার পরেও আমরা পাশে আছি', padding: '32px 0' },
  { id: 'latest', type: 'latest', enabled: true, title: 'নতুন এসেছে', subtitle: 'সদ্য যোগ হওয়া পণ্য', padding: '32px 0' },
  { id: 'newsletter', type: 'newsletter', enabled: true, padding: '32px 0' },
];

function sectionStyle(section) {
  const style = { padding: section.padding || '32px 0', backgroundColor: section.backgroundColor || 'transparent' };
  if (section.backgroundImage) {
    const opacity = Math.max(0, Math.min(90, Number(section.overlay || 0))) / 100;
    style.backgroundImage = `linear-gradient(rgba(0,0,0,${opacity}),rgba(0,0,0,${opacity})),url("${String(section.backgroundImage).replace(/"/g, '\\"')}")`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = section.backgroundPosition || 'center';
  }
  return style;
}

function SectionHeading({ title, subtitle, link = '/shop', linkLabel = 'সব দেখুন' }) {
  if (!title && !subtitle) return null;
  return <div className="flex items-end justify-between gap-3 mb-6">
    <div>{title && <h2 className="text-2xl font-semibold">{title}</h2>}{subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}</div>
    {link && <Link to={link} className="text-sm text-accent hover:underline flex items-center gap-1 shrink-0">{linkLabel}<ArrowRight size={14}/></Link>}
  </div>;
}


export default function Home() {
  const { products, categories, services, loading } = useStore();
  const { config: siteConfig } = useSiteConfig();
  const home = siteConfig?.home || {};
  const seo = siteConfig?.seo?.home || {};
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const latest = products.slice(0, 8);
  const banners = home.banners || [];
  const perks = home.services || [];
  const sections = Array.isArray(home.sectionLayout) && home.sectionLayout.length ? home.sectionLayout : DEFAULT_SECTION_LAYOUT;
  if (loading) return <Loader />;

  const renderSection = (section) => {
    if (section.enabled === false) return null;
    const style = sectionStyle(section);
    const id = section.id || section.type;
    switch (section.type) {
      case 'hero': return <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><HeroSlider/></section>;
      case 'perks': return perks.length > 0 ? <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><div className="container-x"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{perks.map((p, i) => { const Icon = ICONS[i % ICONS.length]; return <div key={i} className="card p-5 flex items-center gap-3"><span className="w-11 h-11 grid place-items-center rounded-field bg-accent/15 text-accent shrink-0"><Icon size={20}/></span><div><p className="font-medium text-sm">{p.title}</p><p className="text-xs text-ink-muted mt-0.5">{p.text}</p></div></div>; })}</div></div></section> : null;
      case 'categories': return categories.length > 0 ? <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><div className="container-x"><SectionHeading title={section.title || 'ক্যাটাগরি'} subtitle={section.subtitle || 'আপনার পছন্দের ক্যাটাগরি বেছে নিন'}/><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">{categories.map((c) => <Link key={c.id} to={`/shop?category=${c.id}`} className="card p-4 text-center hover:border-accent/50 transition-colors group"><div className="aspect-square rounded-field overflow-hidden bg-surface2 mb-3"><img src={c.image} alt={c.name_bn || c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/></div><p className="text-sm font-medium">{c.name_bn || c.name}</p><p className="text-xs text-ink-muted mt-0.5">{c.productCount}টি পণ্য</p></Link>)}</div></div></section> : null;
      case 'featured': return featured.length > 0 ? <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><div className="container-x"><SectionHeading title={section.title || 'ফিচার্ড পণ্য'} subtitle={section.subtitle || 'আমাদের বাছাই করা সেরা পণ্য'}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">{featured.map((p) => <ProductCard key={p.id} product={p}/>)}</div></div></section> : null;
      case 'banners': return banners.length > 0 ? <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><div className="container-x"><div className="grid gap-4 sm:grid-cols-2">{banners.map((b, i) => <Link key={i} to={b.link || '/shop'} className="relative rounded-card overflow-hidden h-52 group block"><img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/><div className="absolute inset-0 bg-gradient-to-r from-black/85 to-transparent"/><div className="relative h-full flex flex-col justify-center p-7"><h3 className="text-xl font-semibold text-white">{b.title}</h3><p className="text-sm text-white/80 mt-1.5">{b.text}</p><span className="btn-primary w-fit mt-4">কেনাকাটা করুন</span></div></Link>)}</div></div></section> : null;
      case 'services': return services.length > 0 ? <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><div className="container-x"><SectionHeading title={section.title || 'আমাদের সার্ভিস'} subtitle={section.subtitle || 'কেনার পরেও আমরা পাশে আছি'} link="/services" linkLabel="সব সার্ভিস"/><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{services.slice(0, 6).map((s) => <Link key={s.id} to={`/service/${s.slug}`} className="card p-5 hover:border-accent/50 transition-colors"><span className="text-3xl">{s.icon || '⭐'}</span><h3 className="font-medium mt-3">{s.name_bn || s.name}</h3><p className="text-sm text-ink-muted mt-1.5 clamp-2">{s.short_desc}</p><p className="text-sm text-accent mt-3">{Number(s.price || 0) > 0 ? money(s.price) : 'ফ্রি'}{s.duration ? ` · ${s.duration}` : ''}</p></Link>)}</div></div></section> : null;
      case 'latest': return latest.length > 0 ? <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><div className="container-x"><SectionHeading title={section.title || 'নতুন এসেছে'} subtitle={section.subtitle || 'সদ্য যোগ হওয়া পণ্য'}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">{latest.map((p) => <ProductCard key={p.id} product={p}/>)}</div></div></section> : null;
      case 'newsletter': return <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><Newsletter/></section>;
      case 'custom': return <section key={id} className={section.animation === 'fade-up' || section.animation === 'fade-in' ? 'animate-fade-up' : ''} style={style}><div className="container-x"><div className="card overflow-hidden"><div className={`grid ${section.image ? 'md:grid-cols-2' : 'grid-cols-1'}`}>{section.image && <img src={section.image} alt={section.title || ''} className="w-full h-64 md:h-full object-cover"/>}<div className="p-6 sm:p-9 flex flex-col justify-center"><SectionHeading title={section.title} subtitle={section.subtitle} link={null}/>{section.text && <p className="text-ink-muted whitespace-pre-wrap">{section.text}</p>}{section.buttonText && <Link className="btn-primary mt-5 w-fit" to={section.buttonLink || '/shop'}>{section.buttonText}</Link>}</div></div></div></div></section>;
      default: return null;
    }
  };


  return <>
    <Seo title={seo.title || 'ইম্পোটেক — প্রিমিয়াম বাইক অ্যাকসেসরিজ'} description={seo.description || 'চায়না থেকে সরাসরি আমদানি করা বাইক অ্যাকসেসরিজ, LED লাইট ও রাইডিং গিয়ার।'}/>
    {sections.map(renderSection)}
  </>;
}
