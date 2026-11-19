import { useState } from 'react';
import {
  FiDroplet, FiSun, FiMoon, FiType, FiSquare,
  FiCloud, FiCloudOff,
} from 'react-icons/fi';
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

   v21 — Supabase সিঙ্ক:
     সেভ করলে দুটো জায়গায় লেখা হয় —
      ১. localStorage  → সাথে সাথে সাইটে প্রয়োগ
      ২. Supabase      → সব ডিভাইসে এক থাকে
     Supabase কনফিগার না থাকলে বা নেটওয়ার্ক ফেল করলে
     localStorage-ই যথেষ্ট — সাইট কখনো ভাঙবে না।
     সেভিং / সফল / ব্যর্থ — তিন অবস্থাই বাংলায় দেখানো হয়।

   ⚠️ AdNotice শুধু type="ok" আর type="error" নেয়
      (AdminKit.jsx দেখুন) — তাই 'info'/'success' ব্যবহার করা হয়নি।
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
  const { config, save, reset, syncRemote, remoteStatus } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(config.theme);

  /* idle | saving | saved | local | error */
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const commit = async () => {
    setError('');
    setStatus('saving');

    /* ---- ১. localStorage: তাৎক্ষণিক, সাইটে সাথে সাথে বদলায় ---- */
    const ok = save({ theme: draft });
    if (!ok) {
      setStatus('error');
      setError('সেভ করা যায়নি — ব্রাউজারের স্টোরেজ পূর্ণ হতে পারে।');
      return;
    }
    markSaved();

    /* ---- ২. Supabase: সব ডিভাইসে এক রাখার জন্য ---- */
    const res = await syncRemote();
    if (res.ok) {
      setStatus('saved');
    } else if (res.reason === 'not-configured') {
      setStatus('local');
    } else {
      setStatus('error');
      setError(
        'Supabase-এ সেভ হয়নি: ' +
          (res.message || 'নেটওয়ার্ক সমস্যা') +
          ' — থিম এই ব্রাউজারে সেভ হয়েছে, অন্য ডিভাইসে যাবে না।'
      );
    }

    setTimeout(() => {
      setStatus((s) => (s === 'saved' || s === 'local' ? 'idle' : s));
    }, 5000);
  };

  const rgb = hexToRgb(draft.accent);

  return (
    <div className="as-stack">
      {/* ---------- সেভের অবস্থা ---------- */}
      {status === 'saving' && (
        <AdNotice type="ok">
          <FiCloud size={14} /> সেভ হচ্ছে…
        </AdNotice>
      )}
      {status === 'saved' && (
        <AdNotice type="ok">
          সেভ হয়েছে — সব ডিভাইসে প্রয়োগ হবে।
        </AdNotice>
      )}
      {status === 'local' && (
        <AdNotice type="ok">
          <FiCloudOff size={14} /> শুধু এই ব্রাউজারে সেভ হয়েছে — Supabase কনফিগার করা নেই।
        </AdNotice>
      )}
      {status === 'error' && <AdNotice type="error">{error}</AdNotice>}

      {/* ---------- Supabase সংযোগের অবস্থা ---------- */}
      {remoteStatus === 'disabled' && (
        <AdNotice type="ok">
          <FiCloudOff size={14} /> Supabase কনফিগার করা নেই — থিম শুধু এই ব্রাউজারে থাকবে।
        </AdNotice>
      )}
      {remoteStatus === 'offline' && (
        <AdNotice type="error">
          Supabase-এ পৌঁছানো যাচ্ছে না — localStorage থেকে থিম দেখানো হচ্ছে।
        </AdNotice>
      )}

      <AdCard
        title="রং"
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
          থাকে — লাইট মোডে সেটি প্রয়োজ্য হবে না।
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
        saved={status === 'saved'}
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
