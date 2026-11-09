import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

export default function HeroSlider() {
  const { settings } = useStore();
  const slides = settings?.home?.slides || [];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const s = slides[i];

  return (
    <section className="relative h-[420px] sm:h-[520px] overflow-hidden">
      <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />

      <div className="container-x relative h-full flex items-center">
        <div className="max-w-xl animate-fade-up" key={i}>
          {s.tag && <span className="badge bg-accent text-black">{s.tag}</span>}
          <h1 className="text-3xl sm:text-5xl font-bold mt-4 leading-tight">{s.title}</h1>
          <p className="text-ink-muted mt-4 text-base sm:text-lg">{s.text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={s.link || '/shop'} className="btn-primary">{s.cta || 'কেনাকাটা করুন'}</Link>
            <Link to="/services" className="btn-outline">আমাদের সার্ভিস</Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
            aria-label="আগের"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setI((v) => (v + 1) % slides.length)}
            aria-label="পরের"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`স্লাইড ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-8 bg-accent' : 'w-3 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
