import { useState } from 'react';
import { FiTruck, FiCreditCard, FiMessageSquare } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import {
  AdCard,
  AdField,
  AdGrid,
  AdInput,
  AdTextarea,
  AdToggle,
  AdSaveBar,
  AdNotice,
  useDraft,
} from '../AdminKit.jsx';

/* ==========================================================
   CheckoutAdmin — delivery charge, free-delivery threshold, the
   cash-on-delivery switch, the mobile-wallet numbers and the
   order confirmation message shown after checkout.
   ========================================================== */

const CheckoutAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const { draft, update, dirty, discard, markSaved } = useDraft(config.checkout);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const commit = () => {
    const ok = save({ checkout: draft });
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

      <AdCard title="ডেলিভারি" icon={FiTruck}>
        <AdGrid cols={2}>
          <AdField label="ডেলিভারি চার্জ (৳)">
            <AdInput
              type="text"
              inputMode="numeric"
              value={draft.deliveryCharge}
              onChange={(e) =>
                update({ deliveryCharge: e.target.value.replace(/[^0-9]/g, '') })
              }
            />
          </AdField>
          <AdField label="ফ্রি ডেলিভারির ন্যূনতম অর্ডার (৳)" hint="০ দিলে ফ্রি ডেলিভারি বন্ধ">
            <AdInput
              type="text"
              inputMode="numeric"
              value={draft.freeDeliveryAbove}
              onChange={(e) =>
                update({ freeDeliveryAbove: e.target.value.replace(/[^0-9]/g, '') })
              }
            />
          </AdField>
        </AdGrid>
      </AdCard>

      <AdCard title="পেমেন্ট পদ্ধতি" icon={FiCreditCard}>
        <div className="as-stack" style={{ gap: 12 }}>
          <AdToggle
            checked={draft.codEnabled}
            onChange={(v) => update({ codEnabled: v })}
            label="ক্যাশ অন ডেলিভারি"
            hint="চালু থাকলে চেকআউটে এই অপশন দেখাবে"
          />

          <AdToggle
            checked={draft.bkashEnabled}
            onChange={(v) => update({ bkashEnabled: v })}
            label="বিকাশ"
          />
          {draft.bkashEnabled ? (
            <AdField label="বিকাশ নম্বর">
              <AdInput
                value={draft.bkashNumber}
                onChange={(e) => update({ bkashNumber: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </AdField>
          ) : null}

          <AdToggle
            checked={draft.nagadEnabled}
            onChange={(v) => update({ nagadEnabled: v })}
            label="নগদ"
          />
          {draft.nagadEnabled ? (
            <AdField label="নগদ নম্বর">
              <AdInput
                value={draft.nagadNumber}
                onChange={(e) => update({ nagadNumber: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </AdField>
          ) : null}

          <AdToggle
            checked={draft.rocketEnabled}
            onChange={(v) => update({ rocketEnabled: v })}
            label="রকেট"
          />
          {draft.rocketEnabled ? (
            <AdField label="রকেট নম্বর">
              <AdInput
                value={draft.rocketNumber}
                onChange={(e) => update({ rocketNumber: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </AdField>
          ) : null}

          <AdField label="পেমেন্ট নির্দেশনা" hint="চেকআউটে মোবাইল ওয়ালেট বেছে নিলে এই লেখা দেখানো হবে">
            <AdTextarea
              value={draft.paymentNote}
              onChange={(e) => update({ paymentNote: e.target.value })}
            />
          </AdField>
        </div>
      </AdCard>

      <AdCard title="অর্ডার কনফার্মেশন মেসেজ" icon={FiMessageSquare}>
        <AdField label="কনফার্মেশনের পর দেখানো বার্তা">
          <AdTextarea
            value={draft.confirmMessage}
            onChange={(e) => update({ confirmMessage: e.target.value })}
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

export default CheckoutAdmin;
