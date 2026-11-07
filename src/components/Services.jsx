import { FiTruck, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import Reveal from './Reveal.jsx';
import '../styles/Services.css';

const ICONS = {
  1: FiTruck,
  2: FiHeadphones,
  3: FiRefreshCw,
};

const Services = () => {
  const { config: site } = useSiteConfig();
  const services = site.home.services;
  return (
  <section className="sec sec-tight">
    <div className="container">
      <div className="services">
        {services.map((s, i) => {
          const Icon = ICONS[s.id] || FiTruck;
          return (
            <Reveal key={s.id} delay={i * 80} className="svc-wrap">
              <div className="svc">
                <div className={`svc-ico ${s.tone}`}>
                  <Icon size={23} />
                </div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
  );
};

export default Services;
