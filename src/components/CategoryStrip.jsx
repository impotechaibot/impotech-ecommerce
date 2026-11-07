import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories.js';
import Reveal from './Reveal.jsx';
import '../styles/CategoryStrip.css';

const CategoryStrip = () => {
  const { categories } = useCategories();
  const scrollRef = useRef(null);

  const nudge = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <section className="sec" id="categories">
      <div className="container">
        <Reveal className="sec-head">
          <div>
            <h2>
              <FiGrid size={22} /> ক্যাটাগরি
            </h2>
            <p className="sub">আপনার পছন্দের ক্যাটাগরি থেকে কিনুন</p>
          </div>
          <Link to="/products" className="sec-link">
            সব দেখুন →
          </Link>
        </Reveal>

        <Reveal className="cat-strip" delay={80}>
          <button
            type="button"
            className="cat-arrow left"
            onClick={() => nudge(-1)}
            aria-label="আগের ক্যাটাগরি"
          >
            <FiChevronLeft size={16} />
          </button>

          <div className="cat-scroll" ref={scrollRef}>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.id}`}
                className="cat-box"
              >
                <div className="cat-inner">
                  <img src={c.image} alt={c.name} loading="lazy" />
                  <span>{c.name}</span>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="cat-arrow right"
            onClick={() => nudge(1)}
            aria-label="পরের ক্যাটাগরি"
          >
            <FiChevronRight size={16} />
          </button>
        </Reveal>
      </div>
    </section>
  );
};

export default CategoryStrip;
