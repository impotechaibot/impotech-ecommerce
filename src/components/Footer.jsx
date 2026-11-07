import { Link } from 'react-router-dom';
import {
  FiPhone,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiYoutube,
} from 'react-icons/fi';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useCategories } from '../hooks/useCategories.js';
import logo from '../assets/logo.png';
import '../styles/Footer.css';

const Footer = () => {
  const { config: site } = useSiteConfig();
  const { categories } = useCategories();
  const contact = site.contact;
  const footerLinks = site.footerLinks;

  const SOCIALS = [
    { icon: FiFacebook, label: 'Facebook', href: contact.facebook },
    { icon: FiInstagram, label: 'Instagram', href: contact.instagram },
    { icon: FiYoutube, label: 'YouTube', href: contact.youtube },
  ].filter((s) => s.href);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand-col">
            <div className="foot-brand">
              <img src={site.logo || logo} alt={site.siteName} />
              <b>{site.siteName}</b>
            </div>
            <p className="foot-about">
              🇨🇳 Direct Import from China
              <br />
              ✨ Premium Quality • Affordable Price
              <br />🛍️ All Kinds of Trendy Products
            </p>
            <a href={`tel:${contact.phone}`} className="foot-contact">
              <span className="fc-ico">
                <FiPhone size={17} />
              </span>
              <span>
                <small>কল করুন ২৪/৭</small>
                <b>{contact.phone}</b>
              </span>
            </a>
            <div className="socials">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="foot-col">
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((l) => (
                  <li key={l}>
                    <Link to="/products">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="foot-col">
            <h4>যোগাযোগ</h4>
            <ul className="foot-info">
              <li>
                <FiMapPin size={14} /> {contact.address}
              </li>
              <li>
                <FiClock size={14} /> {contact.hours}
              </li>
              <li>
                <FiPhone size={14} /> {contact.phone}
              </li>
            </ul>
            <div className="foot-cats">
              {categories.slice(0, 3).map((c) => (
                <Link key={c.id} to={`/products?category=${c.id}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <p>{site.copyright.replace('{year}', new Date().getFullYear())}</p>
          <div className="foot-links">
            <Link to="/page/terms">শর্তাবলী</Link>
            <Link to="/page/privacy">প্রাইভেসি পলিসি</Link>
            <Link to="/admin">অ্যাডমিন</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
