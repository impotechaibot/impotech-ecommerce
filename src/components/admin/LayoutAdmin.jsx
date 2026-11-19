import { useState } from 'react';
import { FiLayout, FiCloud, FiCloudOff } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import { LAYOUT_GROUPS, DEFAULT_LAYOUT, resolveLayout } from '../../lib/layout.js';
import {
  AdCard,
  AdSaveBar,
  AdNotice,
  AdToggle,
  useDraft,
} from '../AdminKit.jsx';

/* ==========================================================
   LayoutAdmin — প্রোডাক্ট পেজের লেআউট ভ্যারিয়েন্ট
   ----------------------------------------------------------
   বসানোর পাথ:  src/components/admin/LayoutAdmin.jsx   (নতুন)

   এখানে যা বাছা হয় তা settings.layout-এ জমা হয় এবং
   ProductDetail.jsx সেটা পড়ে ক্লাস-নাম বের করে।

   v21 — Supabase সিঙ্ক: থিমের মতোই সেভ করলে
   localStorage + Supabase দুটোতেই যায়।
   ========================================================== */

const LayoutAdmin = () => {
  const { config, save, reset, syncRemote, remoteStatus } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(
    resolveLayout(config.layout)
  );

  const [status, setStatus] = useState('idle'); // idle | saving | saved | local | error
  const [error, setError] = useState('');

  const commit = async () => {
    setError('');
    setStatus('saving');

    const ok = save({ layout: draft });
    if (!ok) {
      setStatus('error');
      setError('সেভ করা যায়নি — ব্রাউজারের স্টোরেজ পূর্ণ হতে পারে।');
      return;
    }
    markSaved();

    const res = await syncRemote();
    if (res.ok) setStatus('saved');
    else if (res.reason === 'not-configured') setStatus('local');
    else {
      setStatus('error');
      setError(
        'Supabase-এ সেভ হয়নি: ' +
          (res.message || 'নেটওয়ার্ক সমস্যা') +
          ' — লেআউট এই ব্রাউজারে সেভ হয়েছে, অন্য ডিভাইসে যাবে না।'
      );
    }

    setTimeout(() => {
      setStatus((s) => (s === 'saved' || s === 'local' ? 'idle' : s));
    }, 5000);
  };

  return (
    <div className="as-stack">
      {status === 'saving' && (
        <AdNotice type="ok">
          <FiCloud size={14} /> সেভ হচ্ছে…
        </AdNotice>
      )}
      {status === 'saved' && (
        <AdNotice type="ok">সেভ হয়েছে — সব ডিভাইসে প্রয়োগ হবে।</AdNotice>
      )}
      {status === 'local' && (
        <AdNotice type="ok">
          <FiCloudOff size={14} /> শুধু এই ব্রাউজারে সেভ হয়েছে — Supabase কনফিগার করা নেই।
        </AdNotice>
      )}
      {status === 'error' && <AdNotice type="error">{error}</AdNotice>}

      {remoteStatus === 'disabled' && (
        <AdNotice type="ok">
          <FiCloudOff size={14} /> Supabase কনফিগার করা নেই — লেআউট শুধু এই ব্রাউজারে থাকবে।
        </AdNotice>
      )}
      {remoteStatus === 'offline' && (
        <AdNotice type="error">
          Supabase-এ পৌঁছানো যাচ্ছে না — localStorage থেকে লেআউট দেখানো হচ্ছে।
        </AdNotice>
      )}

      <AdCard
        title="প্রোডাক্ট পেজের লেআউট"
        icon={FiLayout}
        hint="মোবাইলে প্রোডাক্ট পেজ কেমন সাজানো দেখাবে তা এখান থেকে বাছুন। ডেস্কটপ লেআউট অপরিবর্তিত থাকবে।"
      >
        <div className="as-stack">
          {LAYOUT_GROUPS.map((g) => (
            <div key={g.key}>
              <p className="as-label" style={{ marginBottom: 8 }}>
                {g.label}
              </p>
              <div className="ad-mode" style={{ flexWrap: 'wrap' }}>
                {g.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={draft[g.key] === o.value ? 'on' : ''}
                    onClick={() => update({ [g.key]: o.value })}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 6 }}>
            <AdToggle
              checked={draft.stickyBar}
              onChange={(v) => update({ stickyBar: v })}
              label="মোবাইল স্টিকি বার"
              hint="মোবাইলে নিচে ভাসমান দাম + কার্টে যোগ + কিনুন বার দেখাবে"
            />
          </div>
        </div>
      </AdCard>

      <AdSaveBar
        dirty={dirty}
        saved={status === 'saved'}
        onSave={commit}
        onDiscard={discard}
        onReset={() => {
          save({ layout: DEFAULT_LAYOUT });
          discard();
        }}
        canReset
      />
    </div>
  );
};

export default LayoutAdmin;
import { useState } from 'react';
import { FiLayout, FiCloud, FiCloudOff } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import { LAYOUT_GROUPS, DEFAULT_LAYOUT, resolveLayout } from '../../lib/layout.js';
import {
  AdCard,
  AdSaveBar,
  AdNotice,
  AdToggle,
  useDraft,
} from '../AdminKit.jsx';

/* ==========================================================
   LayoutAdmin — প্রোডাক্ট পেজের লেআউট ভ্যারিয়েন্ট
   ----------------------------------------------------------
   বসানোর পাথ:  src/components/admin/LayoutAdmin.jsx   (নতুন)

   এখানে যা বাছা হয় তা settings.layout-এ জমা হয় এবং
   ProductDetail.jsx সেটা পড়ে ক্লাস-নাম বের করে।

   v21 — Supabase সিঙ্ক: থিমের মতোই সেভ করলে
   localStorage + Supabase দুটোতেই যায়।
   ========================================================== */

const LayoutAdmin = () => {
  const { config, save, reset, syncRemote, remoteStatus } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(
    resolveLayout(config.layout)
  );

  const [status, setStatus] = useState('idle'); // idle | saving | saved | local | error
  const [error, setError] = useState('');

  const commit = async () => {
    setError('');
    setStatus('saving');

    const ok = save({ layout: draft });
    if (!ok) {
      setStatus('error');
      setError('সেভ করা যায়নি — ব্রাউজারের স্টোরেজ পূর্ণ হতে পারে।');
      return;
    }
    markSaved();

    const res = await syncRemote();
    if (res.ok) setStatus('saved');
    else if (res.reason === 'not-configured') setStatus('local');
    else {
      setStatus('error');
      setError(
        'Supabase-এ সেভ হয়নি: ' +
          (res.message || 'নেটওয়ার্ক সমস্যা') +
          ' — লেআউট এই ব্রাউজারে সেভ হয়েছে, অন্য ডিভাইসে যাবে না।'
      );
    }

    setTimeout(() => {
      setStatus((s) => (s === 'saved' || s === 'local' ? 'idle' : s));
    }, 5000);
  };

  return (
    <div className="as-stack">
      {status === 'saving' && (
        <AdNotice type="ok">
          <FiCloud size={14} /> সেভ হচ্ছে…
        </AdNotice>
      )}
      {status === 'saved' && (
        <AdNotice type="ok">সেভ হয়েছে — সব ডিভাইসে প্রয়োগ হবে।</AdNotice>
      )}
      {status === 'local' && (
        <AdNotice type="ok">
          <FiCloudOff size={14} /> শুধু এই ব্রাউজারে সেভ হয়েছে — Supabase কনফিগার করা নেই।
        </AdNotice>
      )}
      {status === 'error' && <AdNotice type="error">{error}</AdNotice>}

      {remoteStatus === 'disabled' && (
        <AdNotice type="ok">
          <FiCloudOff size={14} /> Supabase কনফিগার করা নেই — লেআউট শুধু এই ব্রাউজারে থাকবে।
        </AdNotice>
      )}
      {remoteStatus === 'offline' && (
        <AdNotice type="error">
          Supabase-এ পৌঁছানো যাচ্ছে না — localStorage থেকে লেআউট দেখানো হচ্ছে।
        </AdNotice>
      )}

      <AdCard
        title="প্রোডাক্ট পেজের লেআউট"
        icon={FiLayout}
        hint="মোবাইলে প্রোডাক্ট পেজ কেমন সাজানো দেখাবে তা এখান থেকে বাছুন। ডেস্কটপ লেআউট অপরিবর্তিত থাকবে।"
      >
        <div className="as-stack">
          {LAYOUT_GROUPS.map((g) => (
            <div key={g.key}>
              <p className="as-label" style={{ marginBottom: 8 }}>
                {g.label}
              </p>
              <div className="ad-mode" style={{ flexWrap: 'wrap' }}>
                {g.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={draft[g.key] === o.value ? 'on' : ''}
                    onClick={() => update({ [g.key]: o.value })}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 6 }}>
            <AdToggle
              checked={draft.stickyBar}
              onChange={(v) => update({ stickyBar: v })}
              label="মোবাইল স্টিকি বার"
              hint="মোবাইলে নিচে ভাসমান দাম + কার্টে যোগ + কিনুন বার দেখাবে"
            />
          </div>
        </div>
      </AdCard>

      <AdSaveBar
        dirty={dirty}
        saved={status === 'saved'}
        onSave={commit}
        onDiscard={discard}
        onReset={() => {
          save({ layout: DEFAULT_LAYOUT });
          discard();
        }}
        canReset
      />
    </div>
  );
};

export default LayoutAdmin;
