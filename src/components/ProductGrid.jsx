import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiSliders } from 'react-icons/fi';
import ProductCard from './ProductCard.jsx';
import Reveal from './Reveal.jsx';
import { useCategories } from '../hooks/useCategories.js';
import { useProducts } from '../hooks/useProducts.js';
import '../styles/ProductGrid.css';

// Home page product grid with quick category tabs (client-side filter).
const ProductGrid = () => {
  const [active, setActive] = useState('all');
  const { products } = useProducts();
  const { categories } = useCategories();

  const list =
    active === 'all'
      ? products.slice(0, 8)
      : products.filter((p) => p.category === active);

  return (
    <section className="sec sec-tight" id="products">
      <div className="container">
        <Reveal className="sec-head">
          <div>
            <h2>
              <FiShoppingCart size={22} /> সমস্ত পণ্য
            </h2>
            <p className="sub">মোট {products.length}টি পণ্য পাওয়া যাচ্ছে</p>
          </div>
          <Link to="/products" className="sec-link">
            <FiSliders size={14} /> ফিল্টার →
          </Link>
        </Reveal>

        <Reveal className="tab-row" delay={60}>
          <button
            type="button"
            className={`tab ${active === 'all' ? 'on' : ''}`}
            onClick={() => setActive('all')}
          >
            সব
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`tab ${active === c.id ? 'on' : ''}`}
              onClick={() => setActive(c.id)}
            >
              {c.name}
            </button>
          ))}
        </Reveal>

        <div className="prod-grid">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 6) * 55}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        {list.length === 0 && (
          <p className="grid-empty">এই ক্যাটাগরিতে এখন কোনো পণ্য নেই।</p>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
