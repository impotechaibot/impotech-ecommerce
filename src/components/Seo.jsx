import { useEffect } from 'react';
import { setMeta, setJsonLd } from '../lib/seo.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

/**
 * Seo — পেজের মেটা ও JSON-LD সেট করে
 * <Seo title="..." description="..." jsonLd={{...}} />
 */
export default function Seo({ title, description, image, url, type, jsonLd, jsonLdId = 'page-jsonld' }) {
  const { config: site } = useSiteConfig();
  const advanced = site.seo_advanced || {};
  const finalTitle = title || advanced.defaultTitle;
  const finalDescription = description || advanced.defaultDescription;
  const finalImage = image || site.ogImage || advanced.defaultImage;
  const base = String(advanced.canonicalBase || advanced.siteUrl || '').replace(/\/$/, '');
  const finalUrl = url || (base ? `${base}${window.location.pathname}` : undefined);
  const robots = `${advanced.robotsIndex === false ? 'noindex' : 'index'},${advanced.robotsFollow === false ? 'nofollow' : 'follow'}`;
  useEffect(() => {
    setMeta({ title: finalTitle, description: finalDescription, image: finalImage, url: finalUrl, type, robots, twitterHandle: advanced.twitterHandle, facebookAppId: advanced.facebookAppId });
    if (jsonLd) setJsonLd(jsonLdId, jsonLd);
    else if (advanced.structuredData !== false) setJsonLd('site-jsonld', { '@context': 'https://schema.org', '@type': 'OnlineStore', name: advanced.siteName || site.siteName || 'ইম্পোটেক', url: base || undefined, description: finalDescription, ...(finalImage ? { image: finalImage, logo: finalImage } : {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTitle, finalDescription, finalImage, finalUrl, type, robots, jsonLd, advanced.twitterHandle, advanced.facebookAppId, advanced.structuredData, advanced.siteName, base]);

  return null;
}
