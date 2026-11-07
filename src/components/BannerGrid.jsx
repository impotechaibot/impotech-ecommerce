import { Link } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import Reveal from './Reveal.jsx';
import '../styles/BannerGrid.css';

const BannerGrid = () => {
  const { config: site } = useSiteConfig();
  const banners = site.home.banners;

  return (
    <section className="sec sec-tight">
      <div className="container">
        <div className="banner-grid">
          {banners.map((b, i) => (
            <Reveal key={b.id} delay={i * 90}>
              <Link to={`/products?category=${b.category}`} className="banner">
                <img src={b.image} alt={b.title} loading="lazy" />
                <div className="banner-txt">
                  <b>{b.title}</b>
                  <span>{b.text}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerGrid;
