import { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import '../styles/HeroSlider.css';

const AUTOPLAY_MS = 6000;

const HeroSlider = () => {
  const { config: site } = useSiteConfig();
  const slides = site.home.slides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next) => {
    setIndex((i) => (next + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [index, paused, go]);

  return (
    <section className="hero">
      <div className="container">
        <div
          className="hero-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="slides">
            {slides.map((s, i) => (
              <div key={s.id} className={`slide ${i === index ? 'active' : ''}`}>
                <img src={s.image} alt={s.title.join(' ')} />
                <div className="slide-content">
                  <span className="slide-tag">{s.tag}</span>
                  <h1>
                    {s.title[0]}
                    <br />
                    {s.title[1]}
                  </h1>
                  <p>{s.text}</p>
                  <Link to="/products" className="slide-cta">
                    {s.cta}
                    <FiArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="slider-arrow prev"
            onClick={() => go(index - 1)}
            aria-label="আগের স্লাইড"
          >
            <FiChevronLeft size={19} />
          </button>
          <button
            type="button"
            className="slider-arrow next"
            onClick={() => go(index + 1)}
            aria-label="পরের স্লাইড"
          >
            <FiChevronRight size={19} />
          </button>

          <div className="slider-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={i === index ? 'active' : ''}
                onClick={() => go(i)}
                aria-label={`স্লাইড ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
