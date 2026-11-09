/**
 * seo.js — SEO হেল্পার (মেটা, JSON-LD, sitemap)
 */

/** ডকুমেন্ট টাইটেল ও মেটা সেট */
export function setMeta({ title, description, image, url, type = 'website' }) {
  if (title) document.title = title;

  const setTag = (attr, key, content) => {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setTag('name', 'description', description);
  setTag('property', 'og:title', title);
  setTag('property', 'og:description', description);
  setTag('property', 'og:type', type);
  if (image) setTag('property', 'og:image', image);
  if (url) setTag('property', 'og:url', url);
  setTag('name', 'twitter:card', 'summary_large_image');
  setTag('name', 'twitter:title', title);
  setTag('name', 'twitter:description', description);
}

/** JSON-LD স্ক্রিপ্ট ইনজেক্ট */
export function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** প্রোডাক্টের JSON-LD */
export function productJsonLd(product, siteUrl) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name_bn || product.name,
    description: product.description || '',
    image: product.images || [],
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: Number(product.price || 0),
      availability: Number(product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/product/${product.slug}`,
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews_count || 1,
          },
        }
      : {}),
  };
}

/** সাইটম্যাপ XML জেনারেট */
export function buildSitemap({ siteUrl, products = [], services = [], policies = [], landingPages = [] }) {
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/shop', priority: '0.9' },
    { loc: '/services', priority: '0.8' },
    { loc: '/blog', priority: '0.6' },
    { loc: '/faq', priority: '0.6' },
    { loc: '/contact', priority: '0.6' },
    ...products.map((p) => ({ loc: `/product/${p.slug}`, priority: '0.8' })),
    ...services.map((s) => ({ loc: `/service/${s.slug}`, priority: '0.7' })),
    ...policies.map((p) => ({ loc: `/policy/${p.slug}`, priority: '0.5' })),
    ...landingPages.map((l) => ({ loc: `/lp/${l.slug}`, priority: '0.7' })),
  ];

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${siteUrl}${u.loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}
