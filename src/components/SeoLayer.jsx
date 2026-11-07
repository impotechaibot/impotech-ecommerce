import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

/* ==========================================================
   SeoLayer — sets the document title + meta description (and OG
   image) for the current route from the admin SEO config.
   ========================================================== */

const routeKey = (pathname) => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/product/')) return 'product';
  if (pathname.startsWith('/products')) return 'products';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/wishlist')) return 'wishlist';
  if (pathname.startsWith('/checkout')) return 'checkout';
  if (pathname.startsWith('/track')) return 'track';
  if (pathname.startsWith('/page/')) return pathname.replace('/page/', '');
  return 'home';
};

const setMeta = (name, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setOg = (property, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const SeoLayer = () => {
  const { pathname } = useLocation();
  const { config: site } = useSiteConfig();

  useEffect(() => {
    const key = routeKey(pathname);
    const meta = site.seo?.[key] || site.seo?.home || {};
    if (meta.title) document.title = meta.title;
    setMeta('description', meta.description);
    setOg('og:title', meta.title);
    setOg('og:description', meta.description);
    if (site.ogImage) setOg('og:image', site.ogImage);
  }, [pathname, site.seo, site.ogImage]);

  return null;
};

export default SeoLayer;
