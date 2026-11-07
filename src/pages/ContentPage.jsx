import { Link, useParams } from 'react-router-dom';
import { FiFileText, FiArrowLeft } from 'react-icons/fi';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import '../styles/ContentPage.css';

// Renders one of the admin-editable content pages (about / privacy / terms /
// returns / faq) from useSiteConfig. The body is plain text with \n line
// breaks, so we split on blank lines into paragraphs.
const ContentPage = () => {
  const { slug } = useParams();
  const { config: site } = useSiteConfig();
  const page = site.content[slug];

  if (!page) {
    return (
      <div className="page">
        <div className="container empty-state">
          <p>এই পেজটি পাওয়া যায়নি।</p>
          <Link to="/" className="btn-primary">
            হোমে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = String(page.body || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="page content-page">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">হোম</Link>
          <span>/</span>
          <span>{page.title}</span>
        </nav>

        <article className="cp-card">
          <h1>
            <FiFileText size={22} /> {page.title}
          </h1>
          <div className="cp-body">
            {paragraphs.map((p, i) => (
              <p key={i}>
                {p.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < p.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>
          <Link to="/" className="cp-back">
            <FiArrowLeft size={14} /> হোমে ফিরুন
          </Link>
        </article>
      </div>
    </div>
  );
};

export default ContentPage;
