import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import Loader from '../components/Loader.jsx';
import { toBn } from '../lib/format.js';

const SORTS = [
  { value: 'new', label: 'নতুন আগে' },
  { value: 'price-asc', label: 'দাম: কম থেকে বেশি' },
  { value: 'price-desc', label: 'দাম: বেশি থেকে কম' },
  { value: 'rating', label: 'রেটিং' },
];

const PER_PAGE = 9;

export default function Shop() {
  const { products, categories, loading } = useStore();
  const [params, setParams] = useSearchParams();

  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [sort, setSort] = useState('new');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setQ(params.get('q') || '');
    setCategory(params.get('category') || '');
    setPage(1);
  }, [params]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchS =
        !s ||
        (p.name || '').toLowerCase().includes(s) ||
        (p.name_bn || '').includes(q.trim()) ||
        (p.tag || '').toLowerCase().includes(s);
      const matchC = !category || p.category_id === category;
      const price = Number(p.price || 0);
      const matchMin = !minPrice || price >= Number(minPrice);
      const matchMax = !maxPrice || price <= Number(maxPrice);
      return matchS && matchC && matchMin && matchMax;
    });

    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return list;
  }, [products, q, category, sort, minPrice, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const applyCategory = (id) => {
    setCategory(id);
    setPage(1);
    const next = new URLSearchParams(params);
    if (id) next.set('category', id);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setQ('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('new');
    setPage(1);
    setParams({}, { replace: true });
  };

  const activeCat = categories.find((c) => c.id === category);

  if (loading) return <Loader />;

  return (
    <div className="container-x py-8">
      <Seo title="সব প্রোডাক্ট — ইম্পোটেক" description="সব প্রোডাক্ট দেখুন।" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {activeCat ? (activeCat.name_bn || activeCat.name) : 'সব পণ্য'}
          </h1>
          <p className="text-sm text-ink-muted mt-1">{toBn(filtered.length)}টি পণ্য পাওয়া গেছে</p>
        </div>
        <button className="btn-outline lg:hidden" onClick={() => setShowFilters(true)}>
          <SlidersHorizontal size={16} /> ফিল্টার
        </button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* ফিল্টার সাইডবার */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-bg p-5 overflow-y-auto' : 'hidden'} lg:block lg:static lg:bg-transparent lg:p-0`}>
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h2 className="font-semibold">ফিল্টার</h2>
            <button onClick={() => setShowFilters(false)} className="btn-ghost"><X size={18} /></button>
          </div>

          <div className="card p-5 space-y-6 lg:sticky lg:top-24">
            <div>
              <label className="label">সার্চ</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  className="input pl-9"
                  placeholder="পণ্যের নাম…"
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div>
              <label className="label">ক্যাটাগরি</label>
              <div className="space-y-1">
                <button
                  onClick={() => applyCategory('')}
                  className={`block w-full text-left px-3 py-2 rounded-field text-sm ${!category ? 'bg-accent/15 text-accent' : 'text-ink-muted hover:bg-surface2'}`}
                >
                  সব ক্যাটাগরি
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => applyCategory(c.id)}
                    className={`block w-full text-left px-3 py-2 rounded-field text-sm ${category === c.id ? 'bg-accent/15 text-accent' : 'text-ink-muted hover:bg-surface2'}`}
                  >
                    {c.name_bn || c.name} ({toBn(c.productCount)})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">দামের রেঞ্জ (৳)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="input"
                  placeholder="সর্বনিম্ন"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                />
                <span className="text-ink-muted">—</span>
                <input
                  type="number"
                  className="input"
                  placeholder="সর্বোচ্চ"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <button className="btn-outline w-full" onClick={clearAll}>ফিল্টার রিসেট</button>
          </div>
        </aside>

        {/* প্রোডাক্ট গ্রিড */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-sm text-ink-muted hidden sm:block">
              {toBn(pageItems.length)}টি দেখানো হচ্ছে
            </p>
            <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {pageItems.length === 0 ? (
            <div className="card p-16 text-center">
              <p className="text-ink-muted">কোনো পণ্য পাওয়া যায়নি।</p>
              <button className="btn-outline mt-4" onClick={clearAll}>ফিল্টার রিসেট করুন</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                className="btn-outline"
                disabled={page === 1}
                onClick={() => setPage((v) => Math.max(1, v - 1))}
              >
                আগের
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-field text-sm ${n === page ? 'bg-accent text-black font-medium' : 'text-ink-muted hover:bg-surface2'}`}
                >
                  {toBn(n)}
                </button>
              ))}
              <button
                className="btn-outline"
                disabled={page === totalPages}
                onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
              >
                পরের
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
