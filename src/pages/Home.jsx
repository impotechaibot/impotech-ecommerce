import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Newsletter from '../components/Newsletter.jsx';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';
import { money } from '../lib/format.js';

const ICONS = [Truck, ShieldCheck, RotateCcw, Headphones];

export default function Home() {
  const { products, categories, services, settings, loading } = useStore();
  const home = settings?.home || {};
  const seo = settings?.seo?.home || {};

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const latest = products.slice(0, 8);
  const banners = home.banners || [];
  const perks = home.services || [];

  if (loading) return <Loader />;

  return (
    <>
      <Seo
        title={seo.title || 'ইম্পোটেক — প্রিমিয়াম বাইক অ্যাকসেসরিজ'}
        description={seo.description || 'চায়না থেকে সরাসরি আমদানি করা বাইক অ্যাকসেসরিজ, LED লাইট ও রাইডিং গিয়ার।'}
      />

      <HeroSlider />

      {/* পার্কস */}
      {perks.length > 0 && (
        <section className="container-x py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {perks.map((p, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={i} className="card p-5 flex items-center gap-3">
                  <span className="w-11 h-11 grid place-items-center rounded-field bg-accent/15 text-accent shrink-0">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ক্যাটাগরি */}
      {categories.length > 0 && (
        <section className="container-x py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">ক্যাটাগরি</h2>
              <p className="text-sm text-ink-muted mt-1">আপনার পছন্দের ক্যাটাগরি বেছে নিন</p>
            </div>
            <Link to="/shop" className="text-sm text-accent hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="card p-4 text-center hover:border-accent/50 transition-colors group"
              >
                <div className="aspect-square rounded-field overflow-hidden bg-surface2 mb-3">
                  <img
                    src={c.image}
                    alt={c.name_bn || c.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm font-medium">{c.name_bn || c.name}</p>
                <p className="text-xs text-ink-muted mt-0.5">{c.productCount}টি পণ্য</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ফিচার্ড */}
      {featured.length > 0 && (
        <section className="container-x py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">ফিচার্ড পণ্য</h2>
              <p className="text-sm text-ink-muted mt-1">আমাদের বাছাই করা সেরা পণ্য</p>
            </div>
            <Link to="/shop" className="text-sm text-accent hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* অফার ব্যানার */}
      {banners.length > 0 && (
        <section className="container-x py-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {banners.map((b, i) => (
              <div key={i} className="relative rounded-card overflow-hidden h-52 group">
                <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-transparent" />
                <div className="relative h-full flex flex-col justify-center p-7">
                  <h3 className="text-xl font-semibold">{b.title}</h3>
                  <p className="text-sm text-ink-muted mt-1.5">{b.text}</p>
                  <Link to="/shop" className="btn-primary w-fit mt-4">কেনাকাটা করুন</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* সার্ভিস */}
      {services.length > 0 && (
        <section className="container-x py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">আমাদের সার্ভিস</h2>
              <p className="text-sm text-ink-muted mt-1">কেনার পরেও আমরা পাশে আছি</p>
            </div>
            <Link to="/services" className="text-sm text-accent hover:underline flex items-center gap-1">
              সব সার্ভিস <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 6).map((s) => (
              <Link key={s.id} to={`/service/${s.slug}`} className="card p-5 hover:border-accent/50 transition-colors">
                <span className="text-3xl">{s.icon || '⭐'}</span>
                <h3 className="font-medium mt-3">{s.name_bn || s.name}</h3>
                <p className="text-sm text-ink-muted mt-1.5 clamp-2">{s.short_desc}</p>
                <p className="text-sm text-accent mt-3">
                  {Number(s.price || 0) > 0 ? money(s.price) : 'ফ্রি'}
                  {s.duration ? ` · ${s.duration}` : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* নতুন পণ্য */}
      {latest.length > 0 && (
        <section className="container-x py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">নতুন এসেছে</h2>
              <p className="text-sm text-ink-muted mt-1">সদ্য যোগ হওয়া পণ্য</p>
            </div>
            <Link to="/shop" className="text-sm text-accent hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <Newsletter />
    </>
  );
}
