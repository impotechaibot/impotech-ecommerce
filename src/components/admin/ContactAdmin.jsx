import { useState } from 'react';
import { FiPhone, FiShare2 } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import { toWaNumber, waDisplay } from '../../lib/whatsapp.js';
import {
  AdCard,
  AdField,
  AdGrid,
  AdInput,
  AdSaveBar,
  AdNotice,
  useDraft,
} from '../AdminKit.jsx';

/* ==========================================================
   ContactAdmin — phone, email, address, hours, WhatsApp and the
   social links used by the footer and the floating WhatsApp button.

   v24: WhatsApp নাম্বারে ভ্যালিডেশন।
   ----------------------------------------------------------
   কেন দরকার: wa.me লিংকে নাম্বার আন্তর্জাতিক ফরম্যাটে চায়
   (কান্ট্রি কোডসহ, শুরুতে 0 ছাড়া)। ভুল ফরম্যাটে সেভ হলে
   WhatsApp "Couldn't look up phone number" এরর দেয়।
   তাই সেভের আগেই toWaNumber() দিয়ে যাচাই করা হয়।
   ========================================================== */

const WA_ERROR =
  'সঠিক মোবাইল নাম্বার দিন, যেমন 01884332067 বা +8801884332067';

const ContactAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(config.contact);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  /* ---------- WhatsApp লাইভ ভ্যালিডেশন ---------- */
  const waRaw = String(draft.whatsapp ?? '').trim();
  const waNumber = toWaNumber(waRaw); // '' মানে অবৈধ
  const waInvalid = Boolean(waRaw) && !waNumber;

  /* WhatsApp খালি থাকলে ফোন নম্বরটাই ফলব্যাক হিসেবে ব্যবহৃত হয় */
  const phoneRaw = String(draft.phone ?? '').trim();
  const phoneNumber = toWaNumber(phoneRaw);

  /* ইনপুটের নিচে দেখানো হিন্ট */
  const waHint = !waRaw
    ? 'খালি রাখলে ফোন নম্বরটাই ব্যবহার হবে।'
    : waNumber
      ? `সেভ হবে: ${waDisplay(waRaw)}`
      : '';

  const commit = () => {
    /* ① WhatsApp দেওয়া আছে কিন্তু ভুল → সেভ আটকাও */
    if (waInvalid) {
      setError(WA_ERROR);
      return;
    }

    /* ② WhatsApp খালি, আর ফলব্যাক ফোন নম্বরটাও ভুল → সেভ আটকাও */
    if (!waRaw && !phoneNumber) {
      setError(
        'WhatsApp নম্বর খালি, আর ফোন নম্বরটাও সঠিক নয়। ' +
          'অন্তত একটা সঠিক নম্বর দিন, যেমন 01884332067।'
      );
      return;
    }

    const ok = save({ contact: draft });
    if (!ok) {
      setError('সেভ করা যায়নি — স্টোরেজ পূর্ণ হতে পারে');
      return;
    }
    setError('');
    markSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="as-stack">
      {error && <AdNotice type="error">{error}</AdNotice>}

      <AdCard title="যোগাযোগের তথ্য" icon={FiPhone}>
        <AdGrid cols={2}>
          <AdField label="ফোন নম্বর">
            <AdInput
              value={draft.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="01884332067"
              inputMode="tel"
            />
          </AdField>
          <AdField label="ইমেইল">
            <AdInput
              type="email"
              value={draft.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="support@example.com"
            />
          </AdField>
          <AdField label="ঠিকানা" full>
            <AdInput
              value={draft.address}
              onChange={(e) => update({ address: e.target.value })}
              placeholder="ঢাকা, বাংলাদেশ"
            />
          </AdField>
          <AdField label="খোলার সময়" full>
            <AdInput
              value={draft.hours}
              onChange={(e) => update({ hours: e.target.value })}
              placeholder="সকাল ১০টা — রাত ১০টা"
            />
          </AdField>
        </AdGrid>
      </AdCard>

      <AdCard
        title="WhatsApp"
        icon={FiPhone}
        hint="সাইটের ফ্লোটিং WhatsApp বাটন এই নম্বরে যাবে। যেকোনো ফরম্যাটে লিখতে পারেন — 01884332067, +880 1884-332067 বা 8801884332067।"
      >
        <AdField
          label="WhatsApp নম্বর"
          hint={waHint}
          error={waInvalid ? WA_ERROR : ''}
        >
          <AdInput
            value={draft.whatsapp}
            onChange={(e) => update({ whatsapp: e.target.value })}
            placeholder="01884332067"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={waInvalid || undefined}
          />
        </AdField>
      </AdCard>

      <AdCard
        title="সোশ্যাল মিডিয়া"
        icon={FiShare2}
        hint="খালি রাখলে সেই আইকন ফুটারে দেখানো হবে না।"
      >
        <AdGrid cols={2}>
          <AdField label="Facebook">
            <AdInput
              value={draft.facebook}
              onChange={(e) => update({ facebook: e.target.value })}
              placeholder="https://facebook.com/yourpage"
            />
          </AdField>
          <AdField label="Instagram">
            <AdInput
              value={draft.instagram}
              onChange={(e) => update({ instagram: e.target.value })}
              placeholder="https://instagram.com/yourpage"
            />
          </AdField>
          <AdField label="YouTube">
            <AdInput
              value={draft.youtube}
              onChange={(e) => update({ youtube: e.target.value })}
              placeholder="https://youtube.com/@yourchannel"
            />
          </AdField>
          <AdField label="TikTok">
            <AdInput
              value={draft.tiktok}
              onChange={(e) => update({ tiktok: e.target.value })}
              placeholder="https://tiktok.com/@yourhandle"
            />
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

export default ContactAdmin;
