import { useState } from 'react';
import { FiDroplet, FiSun, FiMoon, FiType, FiSquare } from 'react-icons/fi';
import { useSiteConfig, darken, hexToRgb } from '../../hooks/useSiteConfig.js';
import {
  AdCard,
  AdField,
  AdGrid,
  AdColor,
  AdRange,
  AdSaveBar,
  AdNotice,
  useDraft,
} from '../AdminKit.jsx';

/* ==========================================================
   ThemeAdmin — accent colour, font scale, corner radius and a
   dark/light mode switch. The background feature (colour or
   image) lives in its own tab and is untouched by this one.
   ========================================================== */

const ACCENT_PRESETS = [
  { label: 'অ্যাম্বার (ডিফল্ট)', value: '#f0b429' },
  { label: 'কমলা', value: '#f97316' },
  { label: 'লাল', value: '#ef4444' },
  { label: 'গোলাপি', value: '#ec4899' },
  { label: 'ভায়োলেট', value: '#8b5cf6' },
  { label: 'নীল', value: '#3b82f6' },
  { label: 'সায়ান', value: '#06b6d4' },
  { label: 'সবুজ', value: '#22c55e' },
  { label: 'লাইম', value: '#84cc16' },
];

const ThemeAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(config.theme);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const commit = () => {
    const ok = save({ theme: draft });
    if (!ok) {
      setError('সেভ করা যায়নি — স্টোরেজ পূর্ণ হতে পারে');
      return;
    }
    setError('');
    markSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const rgb = hexToRgb(draft.accent);

  return (
    <div className="as-stack">
      {error && <AdNotice type="error">{error}</AdNotice>}

      <AdCard
        title="রঙ"
        icon={FiDroplet}
        hint="অ্যাকসেন্ট রঙ বাটন, লিংক, ব্যাজ ও হাইলাইটে ব্যবহৃত হয়।"
      >
        <div className="ad-swatches" style={{ marginBottom: 16 }}>
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={draft.accent === p.value ? 'on' : ''}
              onClick={() => update({ accent: p.value, accentDark: darken(p.value, 0.2) })}
              title={p.label}
            >
              <span style={{ background: p.value }} />
              <em>{p.label}</em>
            </button>
          ))}
        </div>

        <AdGrid cols={2}>
          <AdField label="অ্যাকসেন্ট রঙ">
            <AdColor
              value={draft.accent}
              label="অ্যাকসেন্ট"
              onChange={(v) => update({ accent: v, accentDark: darken(v, 0.2) })}
            />
          </AdField>
          <AdField label="গাঢ় অ্যাকসেন্ট (হোভার)" hint="স্বয়ংক্রিয়ভাবে হিসাব হয়, চাইলে বদলান">
            <AdColor
              value={draft.accentDark}
              label="গাঢ় অ্যাকসেন্ট"
              onChange={(v) => update({ accentDark: v })}
            />
          </AdField>
        </AdGrid>
      </AdCard>

      <AdCard title="টাইপোগ্রাফি ও আকৃতি" icon={FiType}>
        <AdGrid cols={2}>
          <AdField label="ফন্ট সাইজ স্কেল" hint="১০০% = ডিফল্ট">
            <AdRange
              value={draft.fontScale}
              min={85}
              max={120}
              step={5}
              suffix="%"
              onChange={(v) => update({ fontScale: v })}
            />
          </AdField>
          <AdField label="বাটনের গোলাকার ভাব" hint="০ = একদম সোজা কোণা">
            <AdRange
              value={draft.radius}
              min={0}
              max={28}
              step={2}
              suffix="px"
              onChange={(v) => update({ radius: v })}
            />
          </AdField>
        </AdGrid>
      </AdCard>

      <AdCard title="ডার্ক / লাইট মোড" icon={draft.mode === 'light' ? FiSun : FiMoon}>
        <div className="ad-mode">
          <button
            type="button"
            className={draft.mode === 'dark' ? 'on' : ''}
            onClick={() => update({ mode: 'dark' })}
          >
            <FiMoon size={14} /> ডার্ক (ডিফল্ট)
          </button>
          <button
            type="button"
            className={draft.mode === 'light' ? 'on' : ''}
            onClick={() => update({ mode: 'light' })}
          >
            <FiSun size={14} /> লাইট
          </button>
        </div>
        <p className="as-hint">
          লাইট মোডে সাইটের পটভূমি ও টেক্সট রঙ উল্টে যায়। ব্যাকগ্রাউন্ড ট্যাবের ছবি/রঙ সেটিং আলাদা
          থাকে — লাইট মোডে সেটি প্রযোজ্য হবে না।
        </p>
      </AdCard>

      <AdCard title="প্রিভিউ" icon={FiSquare}>
        <div
          style={{
            padding: 20,
            borderRadius: draft.radius,
            border: '1px solid var(--line-strong)',
            background: 'rgba(255,255,255,0.03)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn-primary"
            style={{
              background: draft.accent,
              boxShadow: `0 8px 22px rgba(${rgb}, 0.28)`,
            }}
          >
            প্রাইমারি বাটন
          </button>
          <span
            className="as-badge"
            style={{
              background: `rgba(${rgb}, 0.14)`,
              color: draft.accent,
              border: `1px solid ${draft.accent}55`,
            }}
          >
            ব্যাজ
          </span>
          <span style={{ color: draft.accent, fontWeight: 700, fontSize: 14 }}>
            অ্যাকসেন্ট লিংক →
          </span>
        </div>
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

export default ThemeAdmin;
