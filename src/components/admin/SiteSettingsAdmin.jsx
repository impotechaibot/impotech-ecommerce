import { useState } from 'react';
import { FiSettings, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import {
  AdCard,
  AdField,
  AdGrid,
  AdInput,
  AdSaveBar,
  AdNotice,
  useDraft,
  fileToDataUrl,
} from '../AdminKit.jsx';

/* ==========================================================
   SiteSettingsAdmin — identity of the store: name, logo,
   favicon, tagline and the footer copyright line.
   ========================================================== */

const SiteSettingsAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft({
    siteName: config.siteName,
    siteNameEn: config.siteNameEn,
    tagline: config.tagline,
    logo: config.logo,
    favicon: config.favicon,
    copyright: config.copyright,
  });
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

  const pick = async (field, file) => {
    if (!file) return;
    try {
      const data = await fileToDataUrl(file, field === 'favicon' ? 128 : 400, 0.9);
      update({ [field]: data });
      setError('');
    } catch {
      setError('ছবিটি পড়া যায়নি');
    }
  };

  return (
    <div className="as-stack">
      {error && <AdNotice type="error">{error}</AdNotice>}

      <AdCard title="সাইটের পরিচয়" icon={FiSettings}>
        <AdGrid cols={2}>
          <AdField label="সাইটের নাম (বাংলা)">
            <AdInput
              value={draft.siteName}
              onChange={(e) => update({ siteName: e.target.value })}
              placeholder="ইম্পোটেক"
            />
          </AdField>
          <AdField label="Site name (English)">
            <AdInput
              value={draft.siteNameEn}
              onChange={(e) => update({ siteNameEn: e.target.value })}
              placeholder="IMPOTECH"
            />
          </AdField>
          <AdField label="ট্যাগলাইন" full hint="টপ বারে ও ফুটারে দেখানো হবে">
            <AdInput
              value={draft.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
              placeholder="চায়না থেকে সরাসরি আমদানি"
            />
          </AdField>
          <AdField
            label="ফুটারের কপিরাইট টেক্সট"
            full
            hint="{year} লিখলে স্বয়ংক্রিয়ভাবে চলতি বছর বসবে"
          >
            <AdInput
              value={draft.copyright}
              onChange={(e) => update({ copyright: e.target.value })}
            />
          </AdField>
        </AdGrid>
      </AdCard>

      <AdCard title="লোগো ও ফেভিকন" icon={FiUploadCloud}>
        <AdGrid cols={2}>
          <AdField label="লোগো" hint="খালি রাখলে ডিফল্ট লোগো ব্যবহার হবে">
            <label className="as-upload">
              <FiUploadCloud size={16} /> লোগো আপলোড করুন
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  pick('logo', e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
            <AdInput
              value={draft.logo?.startsWith('data:') ? '' : draft.logo}
              onChange={(e) => update({ logo: e.target.value })}
              placeholder="অথবা লোগোর URL"
            />
            {draft.logo ? (
              <>
                <img className="as-preview-img" src={draft.logo} alt="লোগো" />
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => update({ logo: '' })}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <FiTrash2 size={14} /> লোগো সরান
                </button>
              </>
            ) : null}
          </AdField>

          <AdField label="ফেভিকন" hint="ব্রাউজার ট্যাবে দেখানো ছোট আইকন">
            <label className="as-upload">
              <FiUploadCloud size={16} /> ফেভিকন আপলোড করুন
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  pick('favicon', e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
            <AdInput
              value={draft.favicon?.startsWith('data:') ? '' : draft.favicon}
              onChange={(e) => update({ favicon: e.target.value })}
              placeholder="অথবা ফেভিকনের URL"
            />
            {draft.favicon ? (
              <img
                className="as-preview-img"
                src={draft.favicon}
                alt="ফেভিকন"
                style={{ maxWidth: 64 }}
              />
            ) : null}
          </AdField>
        </AdGrid>
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

export default SiteSettingsAdmin;
