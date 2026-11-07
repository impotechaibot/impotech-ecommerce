import { useState } from 'react';
import { FiSearch, FiImage } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import {
  AdCard,
  AdField,
  AdInput,
  AdTextarea,
  AdSaveBar,
  AdNotice,
  useDraft,
  fileToDataUrl,
} from '../AdminKit.jsx';

/* ==========================================================
   SeoAdmin — per-page title + meta description, plus the OG image
   used when the site is shared on social media.
   ========================================================== */

const PAGES = [
  { key: 'home', label: 'হোম' },
  { key: 'products', label: 'সব পণ্য' },
  { key: 'product', label: 'পণ্যের বিস্তারিত' },
  { key: 'cart', label: 'কার্ট' },
  { key: 'checkout', label: 'চেকআউট' },
  { key: 'track', label: 'অর্ডার ট্র্যাকিং' },
  { key: 'search', label: 'সার্চ' },
  { key: 'wishlist', label: 'উইশলিস্ট' },
  { key: 'about', label: 'আমাদের সম্পর্কে' },
  { key: 'privacy', label: 'প্রাইভেসি' },
  { key: 'terms', label: 'শর্তাবলী' },
  { key: 'returns', label: 'রিটার্ন পলিসি' },
  { key: 'faq', label: 'FAQ' },
];

const SeoAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft({
    seo: config.seo,
    ogImage: config.ogImage,
  });
  const [active, setActive] = useState('home');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const commit = () => {
    const ok = save(draft);
    if (!ok) {
      setError('সেভ করা যায়নি — স্টোরেজ পূর্ণ হতে পারে');
      return;
    }
    setError('');
    markSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const page = draft.seo[active] || { title: '', description: '' };

  const pickOg = async (file) => {
    if (!file) return;
    try {
      const data = await fileToDataUrl(file, 1200, 0.85);
      update({ ogImage: data });
      setError('');
    } catch {
      setError('ছবিটি পড়া যায়নি');
    }
  };

  return (
    <div className="as-stack">
      {error && <AdNotice type="error">{error}</AdNotice>}

      <AdCard
        title="পেজভিত্তিক SEO"
        icon={FiSearch}
        hint="টাইটেল ব্রাউজার ট্যাবে ও সার্চ রেজাল্টে দেখানো হয়। মেটা ডেসক্রিপশন ১৫০–১৬০ অক্ষরে রাখলে ভালো।"
      >
        <div className="as-toolbar">
          {PAGES.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`btn-ghost ${active === p.key ? 'on' : ''}`}
              onClick={() => setActive(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <AdField label="পেজ টাইটেল">
          <AdInput
            value={page.title}
            onChange={(e) =>
              update({ seo: { ...draft.seo, [active]: { ...page, title: e.target.value } } })
            }
          />
        </AdField>

        <AdField label="মেটা ডেসক্রিপশন" hint={`${(page.description || '').length} অক্ষর`}>
          <AdTextarea
            value={page.description}
            onChange={(e) =>
              update({
                seo: { ...draft.seo, [active]: { ...page, description: e.target.value } },
              })
            }
            style={{ minHeight: 90 }}
          />
        </AdField>
      </AdCard>

      <AdCard
        title="OG ইমেজ"
        icon={FiImage}
        hint="সোশ্যাল মিডিয়ায় লিংক শেয়ার করলে এই ছবি দেখানো হবে।"
      >
        <label className="as-upload">
          <FiImage size={16} /> OG ছবি আপলোড করুন
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              pickOg(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <AdInput
          value={draft.ogImage?.startsWith('data:') ? '' : draft.ogImage}
          onChange={(e) => update({ ogImage: e.target.value })}
          placeholder="অথবা ছবির URL"
          style={{ marginTop: 10 }}
        />
        {draft.ogImage ? (
          <img className="as-preview-img" src={draft.ogImage} alt="OG" style={{ marginTop: 10 }} />
        ) : null}
      </AdCard>

      <AdSaveBar
        dirty={dirty}
        saved={saved}
        onSave={commit}
        onDiscard={discard}
        onReset={() => {
          reset();
          discard();
        }}
        canReset
      />
    </div>
  );
};

export default SeoAdmin;
