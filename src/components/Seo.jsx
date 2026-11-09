import { useEffect } from 'react';
import { setMeta, setJsonLd } from '../lib/seo.js';

/**
 * Seo — পেজের মেটা ও JSON-LD সেট করে
 * <Seo title="..." description="..." jsonLd={{...}} />
 */
export default function Seo({ title, description, image, url, type, jsonLd, jsonLdId = 'page-jsonld' }) {
  useEffect(() => {
    setMeta({ title, description, image, url, type });
    if (jsonLd) setJsonLd(jsonLdId, jsonLd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, url, type]);

  return null;
}
