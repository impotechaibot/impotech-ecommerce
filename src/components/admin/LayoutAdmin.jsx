import { useState } from 'react';
import {
  FiLayout,
  FiImage,
  FiType,
  FiTag,
  FiSquare,
  FiAlignLeft,
  FiSmartphone,
} from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import { AdCard, AdSaveBar, AdNotice, AdToggle, useDraft } from '../AdminKit.jsx';
import { DEFAULT_LAYOUT } from '../../lib/layout.js';

/* ==========================================================
   LayoutAdmin — প্রোডাক্ট পেজের লেআউট ভ্যারিয়েন্ট।
   যা বেছে নেওয়া হয় তা settings.layout-এ সেভ হয়
   (localStorage['impotech_site']), আর ProductDetail.jsx
   resolveLayout() দিয়ে সেটা পড়ে প্রয়োগ করে।
   ========================================================== */

const GROUPS = [
  {
    key: 'gallery',
    title: 'ছবির অনুপাত',
    icon: FiImage,
    hint: 'প্রোডাক্টের মূল ছবি কেমন দেখাবে।',
    options: [
      { value: 'square', label: 'স্কয়ার (১:১)', note: 'সবচেয়ে নিরাপদ — সব ছবিতে মানায়' },
      { value: 'wide', label: 'ওয়াইড (৪:৩)', note: 'ল্যান্ডস্কেপ ছবির জন্য' },
      { value: 'tall', label: 'টল (৩:৪)', note: 'পোশাক / লম্বা পণ্যের জন্য' },
    ],
  },
  {
    key: 'title',
    title: 'শিরোনামের বিন্যাস',
    icon: FiType,
    hint: 'পণ্যের নাম কীভাবে বসবে।',
    options: [
      { value: 'stacked', label: 'স্ট্যাকড', note: 'নাম উপরে, ইংরেজি নাম নিচে (ডিফল্ট)' },
      { value: 'inline', label: 'ইনলাইন', note: 'একই লাইনে সংক্ষিপ্ত' },
      { value: 'centered', label: 'সেন্টারড', note: 'মাঝখানে — ফ্যাশন স্টোরে ভালো লাগে' },
    ],
  },
  {
    key: 'price',
    title: 'দামের বিন্যাস',
    icon: FiTag,
    hint: 'দাম, কাটা দাম ও ছাড়ের ব্যাজ।',
    options: [
      { value: 'inline', label: 'ইনলাইন', note: 'পাশাপাশি (ডিফল্ট)' },
      { value: 'stacked', label: 'স্ট্যাকড', note: 'একটার নিচে একটা' },
      { value: 'boxed', label: 'বক্সড', note: 'হালকা বাক্সে — আলাদা করে চোখে পড়ে' },
    ],
  },
  {
    key: 'buttons',
    title: 'বাটনের বিন্যাস',
    icon: FiSquare,
    hint: 'কার্টে যোগ / এখনই কিনুন বাটন।',
    options: [
      { value: 'split', label: 'স্প্লিট', note: 'পাশাপাশি (ডিফল্ট)' },
      { value: 'stacked', label: 'স্ট্যাকড', note: 'একটার নিচে একটা — বড় বাটন' },
      { value: 'full', label: 'ফুল', note: 'পুরো প্রস্থ, আলাদা সারি' },
    ],
  },
  {
    key: 'desc',
    title: 'বর্ণনার স্টাইল',
    icon: FiAlignLeft,
    hint: 'সংক্ষিপ্ত বর্ণনা ও বিবরণ ট্যাব।',
    options: [
      { value: 'plain', label: 'প্লেইন', note: 'সাধারণ প্যারাগ্রাফ (ডিফল্ট)' },
      { value: 'card', label: 'কার্ড', note: 'হালকা ব্যাকগ্রাউন্ডে' },
      { value: 'bullets', label: 'বুলেট', note: 'বাক্য ভেঙে তালিকা — পড়তে সহজ' },
    ],
  },
  {
    key: 'density',
    title: 'স্পেসিং',
    icon: FiLayout,
    hint: 'মোবাইলে কতটা ফাঁকা জায়গা থাকবে।',
    options: [
      { value: 'compact', label: 'কম্প্যাক্ট', note: 'কম স্ক্রল, বেশি তথ্য' },
      { value: 'cozy', label: 'কোজি', note: 'ভারসাম্য (ডিফল্ট)' },
      { value: 'roomy', label: 'রুমি', note: 'খোলামেলা, প্রিমিয়াম অনুভূতি' },
    ],
  },
];

const LayoutAdmin = () => {
  const { config, save } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(
    config.layout || DEFAULT_LAYOUT
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const commit = () => {
    const ok = save({ layout: draft });
    if (!ok) {
      setError(
        'সেভ করা যায়নি — ব্রাউজার স্টোরেজ পূর্ণ হতে পারে। কিছু ছবি সরিয়ে আবার চেষ্টা করুন।'
      );
      return;
    }
    setError('');
    markSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const resetAll = () => {
    save({ layout: DEFAULT_LAYOUT });
    discard();
  };

  return (
    <div className="as-stack">
      {error ? <AdNotice type="error">{error}</AdNotice> : null}

      <AdNotice type="ok">
        এখানে যা বেছে নেবেন তা <b>প্রোডাক্ট পেজে</b> সাথে সাথে প্রয়োগ হবে। ডেস্কটপ
        লেআউট অপরিবর্তিত থাকবে — শুধু মোবাইল ও টেক্সটের বিন্যাস বদলাবে।
      </AdNotice>

      {GROUPS.map((g) => {
        const Icon = g.icon;
        const current = g.options.find((o) => o.value === draft[g.key]);
        return (
          <AdCard key={g.key} title={g.title} icon={Icon} hint={g.hint}>
            <div className="ad-mode" style={{ flexWrap: 'wrap' }}>
              {g.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={draft[g.key] === o.value ? 'on' : ''}
                  onClick={() => update({ [g.key]: o.value })}
                  title={o.note}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {current ? (
              <p className="as-hint" style={{ marginTop: 8 }}>
                {current.note}
              </p>
            ) : null}
          </AdCard>
        );
      })}

      <AdCard
        title="মোবাইল স্টিকি বার"
        icon={FiSmartphone}
        hint="মোবাইলে নিচে ভাসমান কার্ট বার দেখাবে কি না।"
      >
        <AdToggle
          checked={draft.stickyBar !== false}
          onChange={(v) => update({ stickyBar: v })}
          label="নিচে ভাসমান কার্ট বার"
          hint="চালু থাকলে মোবাইলে সবসময় দাম ও “কার্টে যোগ” বাটন হাতের কাছে থাকবে।"
        />
      </AdCard>

      <AdSaveBar
        dirty={dirty}
        saved={saved}
        onSave={commit}
        onDiscard={discard}
        onReset={resetAll}
        canReset
      />
    </div>
  );
};

export default LayoutAdmin;
