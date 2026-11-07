import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { useProducts } from '../hooks/useProducts.js';
import '../styles/Products.css';

const SORTS = [
  { id: 'featured', label: 'ফিচার্ড' },
  { id: 'price-asc', label: 'দাম: কম থেকে বেশি' },
  { id: 'price-desc', label: 'দাম: বেশি থেকে কম' },
  { id: 'rating', label: 'রেটিং' },
  { id: 'discount', label: 'সর্বোচ্চ ছাড়' },
];

const Products = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'featured';
  const [maxPrice, setMaxPrice] = useState(1500);
  const [openFilter, setOpenFilter] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [category]);

  const activeCat = categories.find((c) => c.id === category);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || value === 'featured') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    let out =
      category === 'all'
        ? [...products]
        : products.filter((p) => p.category === category);

    out = out.filter((p) => p.price <= maxPrice);

    switch (sort) {
      case 'price-asc':
        out.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        out.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        out.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        out.sort(
          (a, b) =>
            (b.oldPrice - b.price) / b.oldPrice -
            (a.oldPrice - a.price) / a.oldPrice
        );
        break;
      default:
        break;
    }
    return out;
  }, [category, sort, maxPrice, products]);

  return (
    <div className="page products-page">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">হোম</Link>
          <span>/</span>
          <span>{activeCat ? activeCat.name : 'সব পণ্য'}</span>
        </nav>

        <div className="page-head">
          <div>
            <h1>{activeCat ? activeCat.name : 'সব পণ্য'}</h1>
            <p>{list.length}টি পণ্য পাওয়া গেছে</p>
          </div>
          <button
            type="button"
            className="filter-toggle"
            onClick={() => setOpenFilter((v) => !v)}
          >
            <FiFilter size={15} /> ফিল্টার
          </button>
        </div>

        <div className="prod-layout">
          <aside className={`filter-panel ${openFilter ? 'open' : ''}`}>
            <div className="fp-head">
              <h3>
                <FiFilter size={15} /> ফিল্টার
              </h3>
              <button
                type="button"
                className="fp-close"
                onClick={() => setOpenFilter(false)}
                aria-label="বন্ধ"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="fp-group">
              <p className="fp-label">ক্যাটাগরি</p>
              <button
                type="button"
                className={`fp-opt ${category === 'all' ? 'on' : ''}`}
                onClick={() => setParam('category', 'all')}
              >
                সব পণ্য
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`fp-opt ${category === c.id ? 'on' : ''}`}
                  onClick={() => setParam('category', c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="fp-group">
              <p className="fp-label">সর্বোচ্চ দাম</p>
              <input
                type="range"
                min={300}
                max={1500}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="সর্বোচ্চ দাম"
              />
              <p className="fp-value">৳ {maxPrice.toLocaleString('en-US')} পর্যন্ত</p>
            </div>

            <div className="fp-group">
              <p className="fp-label">সাজান</p>
              <div className="fp-sort">
                <select
                  value={sort}
                  onChange={(e) => setParam('sort', e.target.value)}
                  aria-label="সাজান"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown size={15} />
              </div>
            </div>
          </aside>

          <div className="prod-main">
            <div className="sort-bar">
              {SORTS.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`tab ${sort === s.id ? 'on' : ''}`}
                  onClick={() => setParam('sort', s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {list.length === 0 ? (
              <div className="empty-state">
                <p>কোনো পণ্য পাওয়া যায়নি।</p>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setParams(new URLSearchParams(), { replace: true });
                    setMaxPrice(1500);
                  }}
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="prod-grid">
                {list.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 8) * 45}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`filter-scrim ${openFilter ? 'open' : ''}`}
        onClick={() => setOpenFilter(false)}
        aria-hidden="true"
      />
    </div>
  );
};

export default Products;
