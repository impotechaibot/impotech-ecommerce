import { useState } from 'react';
import { FiFileText, FiInfo, FiShield, FiFile, FiRefreshCw, FiHelpCircle } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import {
  AdCard,
  AdField,
  AdInput,
  AdTextarea,
  AdSaveBar,
  AdNotice,
  useDraft,
} from '../AdminKit.jsx';

/* ==========================================================
   ContentAdmin — the text of the static pages (About, Privacy,
   Terms, Return policy, FAQ). Each page is a title + body.
   ========================================================== */

const PAGES = [
  { key: 'about', label: 'আমাদের সম্পর্কে', icon: FiInfo },
  { key: 'privacy', label: 'প্রাইভেসি পলিসি', icon: FiShield },
  { key: 'terms', label: 'শর্তাবলী', icon: FiFile },
  { key: 'returns', label: 'রিটার্ন পলিসি', icon: FiRefreshCw },
  { key: 'faq', label: 'সাধারণ প্রশ্নোত্তর', icon: FiHelpCircle },
];

const ContentAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(config.content);
  const [active, setActive] = useState('about');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const commit = () => {
    const ok = save({ content: draft });
    if (!ok) {
      setError('সেভ করা যায়নি — স্টোরেজ পূর্ণ হতে পারে');
      return;
    }
    setError('');
    markSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const page = draft[active] || { title: '', body: '' };

  return (
    <div className="as-stack">
      {error && <AdNotice type="error">{error}</AdNotice>}

      <AdCard
        title="কনটেন্ট পেজ"
        icon={FiFileText}
        hint="এই লেখাগুলো সাইটের /about, /privacy, /terms, /returns ও /faq পেজে দেখানো হবে।"
      >
        <div className="as-toolbar">
          {PAGES.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`btn-ghost ${active === p.key ? 'on' : ''}`}
              onClick={() => setActive(p.key)}
            >
              <p.icon size={14} /> {p.label}
            </button>
          ))}
        </div>

        <AdField label="পেজের শিরোনাম">
          <AdInput
            value={page.title}
            onChange={(e) => update({ [active]: { ...page, title: e.target.value } })}
          />
        </AdField>

        <AdField label="মূল লেখা" hint="প্রতিটি নতুন লাইন আলাদা প্যারাগ্রাফ হিসেবে দেখানো হবে।">
          <AdTextarea
            value={page.body}
            onChange={(e) => update({ [active]: { ...page, body: e.target.value } })}
            style={{ minHeight: 320 }}
          />
        </AdField>
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

export default ContentAdmin;
