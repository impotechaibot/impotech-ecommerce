import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import '../styles/Search.css';

const Search = () => {
  const { products } = useProducts();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [term, setTerm] = useState(query);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.bn.includes(query.trim()) ||
        p.category.includes(q) ||
        p.desc.includes(query.trim())
    );
  }, [query, products]);

  const submit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (term.trim()) next.set('q', term.trim());
    else next.delete('q');
    setParams(next, { replace: true });
  };

  return (
    <div className="page">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">হোম</Link>
          <span>/</span>
          <span>সার্চ</span>
        </nav>

        <div className="search-hero">
          <h1>
            <FiSearch size={22} /> পণ্য খুঁজুন
          </h1>
          <form className="search-big" onSubmit={submit}>
            <FiSearch size={18} />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="পণ্যের নাম, ক্যাটাগরি বা কীওয়ার্ড লিখুন…"
              autoFocus
              aria-label="সার্চ"
            />
            {term && (
              <button
                type="button"
                className="sb-clear"
                onClick={() => {
                  setTerm('');
                  setParams(new URLSearchParams(), { replace: true });
                }}
                aria-label="মুছুন"
              >
                <FiX size={16} />
              </button>
            )}
            <button type="submit" className="sb-go">
              খুঁজুন
            </button>
          </form>
        </div>

        {query ? (
          results.length > 0 ? (
            <>
              <p className="search-count">
                “{query}” এর জন্য {results.length}টি ফলাফল
              </p>
              <div className="prod-grid">
                {results.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 8) * 45}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>“{query}” এর জন্য কোনো পণ্য পাওয়া যায়নি।</p>
              <Link to="/products" className="btn-ghost">
                সব পণ্য দেখুন
              </Link>
            </div>
          )
        ) : (
          <div className="search-suggest">
            <p className="search-count">জনপ্রিয় কীওয়ার্ড</p>
            <div className="chip-row">
              {['অ্যাঞ্জেল উইংস', 'LED লাইট', 'রাইডিং গ্লাভস', 'মোবাইল হোল্ডার', 'হর্ন'].map(
                (k) => (
                  <button
                    key={k}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setTerm(k);
                      setParams(new URLSearchParams({ q: k }), { replace: true });
                    }}
                  >
                    {k}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
