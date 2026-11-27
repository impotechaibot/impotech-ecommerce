import { useParams, Link } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import NotFound from './NotFound.jsx';

function blockStyle(block) {
  const style = { padding: block.padding || '32px 0', backgroundColor: block.backgroundColor || 'transparent' };
  if (block.backgroundImage) {
    const overlay = Math.max(0, Math.min(90, Number(block.overlay || 0))) / 100;
    style.backgroundImage = `linear-gradient(rgba(0,0,0,${overlay}),rgba(0,0,0,${overlay})),url("${String(block.backgroundImage).replace(/"/g, '\\"')}")`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = block.backgroundPosition || 'center';
  }
  return style;
}


export default function CustomPage() {
  const { slug } = useParams();
  const { config } = useSiteConfig();
  const { products } = useStore();
  const page = (config.pages || []).find((p) => p.slug === slug && p.status === 'published');
  if (!page) return <NotFound />;
  return <>
    <Seo title={page.metaTitle || page.title} description={page.metaDescription || page.body || ''}/>
    {(page.sections || []).filter((s) => s.enabled !== false).map((s) => <section key={s.id} style={blockStyle(s)} className={s.animation === 'fade-up' ? 'animate-fade-up' : s.animation === 'fade-in' ? 'animate-fade-up' : ''}>
      <div className="container-x">
        {s.type === 'hero' && <div className="relative min-h-[260px] flex flex-col justify-center rounded-card overflow-hidden">{s.image && <img src={s.image} alt={s.title || ''} className="absolute inset-0 w-full h-full object-cover"/>}<div className="absolute inset-0 bg-black/40"/><div className="relative p-6 sm:p-10"><h1 className="text-3xl sm:text-4xl font-bold">{s.title || page.title}</h1>{s.body && <p className="mt-3 max-w-2xl text-ink-muted whitespace-pre-wrap">{s.body}</p>}{s.buttonText && <Link className="btn-primary mt-5 inline-flex" to={s.buttonLink || '/shop'}>{s.buttonText}</Link>}</div></div>}
        {s.type === 'text' && <div className="max-w-4xl mx-auto"><h2 className="text-2xl font-semibold">{s.title}</h2>{s.body && <div className="mt-3 text-ink-muted leading-relaxed whitespace-pre-wrap">{s.body}</div>}{s.buttonText && <Link className="btn-primary mt-5 inline-flex" to={s.buttonLink || '/shop'}>{s.buttonText}</Link>}</div>}
        {s.type === 'image' && <div className="max-w-5xl mx-auto">{s.image && <img src={s.image} alt={s.title || ''} className="w-full rounded-card object-cover max-h-[600px]"/>}{s.title && <h2 className="text-xl font-semibold mt-4">{s.title}</h2>}{s.body && <p className="text-ink-muted mt-2 whitespace-pre-wrap">{s.body}</p>}{s.buttonText && <Link className="btn-primary mt-4 inline-flex" to={s.buttonLink || '/shop'}>{s.buttonText}</Link>}</div>}
        {s.type === 'cta' && <div className="card p-6 sm:p-9 text-center"><h2 className="text-2xl font-semibold">{s.title}</h2>{s.body && <p className="text-ink-muted mt-2 whitespace-pre-wrap">{s.body}</p>}{s.buttonText && <Link className="btn-primary mt-5 inline-flex" to={s.buttonLink || '/shop'}>{s.buttonText}</Link>}</div>}
        {s.type === 'products' && <div><h2 className="text-2xl font-semibold">{s.title || 'পণ্যসমূহ'}</h2>{s.body && <p className="text-ink-muted mt-2">{s.body}</p>}<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">{products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p}/>)}</div></div>}
      </div>
    </section>)}
  </>;
}
