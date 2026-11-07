import { useState } from 'react';
import { FiMail, FiCheck } from 'react-icons/fi';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import Reveal from './Reveal.jsx';
import '../styles/Newsletter.css';

const Newsletter = () => {
  const { config: site } = useSiteConfig();
  const news = site.home.newsletter;
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
    setTimeout(() => setDone(false), 3500);
  };

  return (
    <section className="sec sec-tight" id="newsletter">
      <div className="container">
        <Reveal className="news-strip">
          <div className="news-copy">
            <h3>{news.title}</h3>
            <p>{news.text}</p>
          </div>
          <form className="news-form" onSubmit={submit}>
            <FiMail size={17} className="news-mail-ico" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল"
              required
              aria-label="ইমেইল"
            />
            <button type="submit">
              {done ? (
                <>
                  <FiCheck size={15} /> {news.button}
                </>
              ) : (
                news.button
              )}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
};

export default Newsletter;
