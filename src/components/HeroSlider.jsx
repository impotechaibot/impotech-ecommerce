import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

function getYouTubeId(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    const u = new URL(value.startsWith('http') ? value : `https://${value}`);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || '';
    if (['youtube.com', 'm.youtube.com'].includes(host)) {
      if (u.pathname === '/watch') return u.searchParams.get('v') || '';
      const parts = u.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0])) return parts[1] || '';
    }
  } catch { return ''; }
  return '';
}

export default function HeroSlider() {
  const { config } = useSiteConfig();
  const home = config?.home || {};
  const slides = home.slides || [];
  const hero = { overlay: 65, desktopHeight: 520, mobileHeight: 400, textPosition: 'left', imageFit: 'cover', imagePosition: 'center', autoSlideSeconds: 6, showServiceButton: true, ...(home.heroSettings || {}) };
  const [i, setI] = useState(0);
  useEffect(() => { setI((v) => Math.min(v, Math.max(0, slides.length - 1))); }, [slides.length]);
  useEffect(() => {
    const seconds = Number(hero.autoSlideSeconds || 0);
    if (slides.length <= 1 || seconds <= 0) return undefined;
    const timer = setInterval(() => setI((v) => (v + 1) % slides.length), seconds * 1000);
    return () => clearInterval(timer);
  }, [slides.length, hero.autoSlideSeconds]);
  if (!slides.length) return null;
  const slide = slides[i];
  const ytId = getYouTubeId(slide.video);
  const isDirectVideo = Boolean(slide.video) && !ytId;
  const imageSrc = slide.imageDesktop || slide.image || slide.imageMobile || '';
  const fit = hero.imageFit === 'contain' ? 'object-contain' : 'object-cover';
  const opacity = Math.max(0, Math.min(95, Number(hero.overlay || 0))) / 100;
  const textAlignment = hero.textPosition === 'center' ? 'text-center items-center' : hero.textPosition === 'right' ? 'text-right items-end' : 'text-left items-start';
  const sectionStyle = { '--hero-height-desktop': `${Number(hero.desktopHeight || 520)}px`, '--hero-height-mobile': `${Number(hero.mobileHeight || 400)}px` };

  return <section className="relative hero-slider overflow-hidden" style={sectionStyle}>
    {ytId ? <iframe className="absolute inset-0 w-full h-full pointer-events-none" src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&playsinline=1`} title={slide.title || 'Hero video'} allow="autoplay; encrypted-media"/> : isDirectVideo ? <video className={`absolute inset-0 w-full h-full ${fit}`} src={slide.video} poster={slide.videoThumbnail || undefined} autoPlay muted loop playsInline preload="metadata" style={{ objectPosition: hero.imagePosition || 'center' }}/> : <picture className="absolute inset-0"><source media="(max-width: 640px)" srcSet={slide.imageMobile || imageSrc}/><img src={imageSrc} alt={slide.title || ''} className={`absolute inset-0 w-full h-full ${fit}`} style={{ objectPosition: hero.imagePosition || 'center' }}/></picture>}
    <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity * 0.75}) 50%, rgba(0,0,0,${opacity * 0.25}) 100%)` }}/>
    <div className="container-x relative h-full flex items-center">
      <div className={`max-w-xl flex flex-col ${textAlignment} animate-fade-up`} key={i}>
        {slide.tag && <span className="badge bg-accent text-black">{slide.tag}</span>}
        {slide.title && <h1 className="text-3xl sm:text-5xl font-bold mt-4 leading-tight">{slide.title}</h1>}
        {slide.text && <p className="text-white/80 mt-4 text-base sm:text-lg">{slide.text}</p>}
        <div className={`mt-7 flex flex-wrap gap-3 ${hero.textPosition === 'center' ? 'justify-center' : hero.textPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
          {slide.cta && <Link to={slide.link || '/shop'} className="btn-primary">{slide.cta}</Link>}
          {hero.showServiceButton && <Link to="/services" className="btn-outline">আমাদের সার্ভিস</Link>}
        </div>
      </div>
    </div>
    {slides.length > 1 && <>
      <button onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)} aria-label="আগের" className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft size={20}/></button>
      <button onClick={() => setI((v) => (v + 1) % slides.length)} aria-label="পরের" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronRight size={20}/></button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">{slides.map((_, idx) => <button key={idx} onClick={() => setI(idx)} aria-label={`স্লাইড ${idx + 1}`} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-8 bg-accent' : 'w-3 bg-white/40'}`}/>)}</div>
    </>}
  </section>;
}
