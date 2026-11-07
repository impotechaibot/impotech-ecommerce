import { useState } from 'react';
import { FiTag, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useCoupons } from '../../hooks/useCoupons.js';
import {
  AdCard,
  AdField,
  AdGrid,
  AdInput,
  AdSelect,
  AdToggle,
  AdConfirm,
  AdEmpty,
  AdNotice,
} from '../AdminKit.jsx';

/* ==========================================================
   CouponAdmin — discount codes. A coupon is percent or fixed,
   with an optional minimum order and expiry date.
   ========================================================== */

const EMPTY = {
  id: '',
  code: '',
  type: 'percent',
  value: '',
  minOrder: '',
  expires: '',
  active: true,
  note: '',
};

const CouponAdmin = () => {
  const { coupons, save, reset, isCustom } = useCoupons();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2600);
  };

  const openNew = () => {
    setDraft({ ...EMPTY });
    setError('');
    setEditing('new');
  };

  const openEdit = (c) => {
    setDraft({ ...c, value: String(c.value), minOrder: String(c.minOrder) });
    setError('');
    setEditing(c.id);
  };

  const close = () => {
    setEditing(null);
    setDraft(EMPTY);
    setError('');
  };

  const commit = (e) => {
    e.preventDefault();
    const code = draft.code.toUpperCase().trim();
    if (!code) {
      setError('কুপন কোড আবশ্যক');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      setError('কোডে শুধু ইংরেজি অক্ষর, সংখ্যা, - ও _ ব্যবহার করুন');
      return;
    }
    if (coupons.some((c) => c.code === code && c.id !== draft.id)) {
      setError('এই কোডটি আগেই ব্যবহার করা হয়েছে');
      return;
    }
    const value = Number(draft.value);
    if (!Number.isFinite(value) || value <= 0) {
      setError('ছাড়ের পরিমাণ সঠিক সংখ্যা হতে হবে');
      return;
    }
    if (draft.type === 'percent' && value > 100) {
      setError('পার্সেন্ট ছাড় ১০০-এর বেশি হতে পারে না');
      return;
    }

    const record = {
      id: draft.id || `c${Date.now()}`,
      code,
      type: draft.type,
      value,
      minOrder: Number(draft.minOrder) || 0,
      expires: draft.expires || '',
      active: draft.active !== false,
      note: draft.note || '',
    };

    const next =
      editing === 'new'
        ? [...coupons, record]
        : coupons.map((c) => (c.id === record.id ? record : c));

    if (!save(next)) {
      flash('error', 'সেভ করা যায়নি');
      return;
    }
    flash('ok', editing === 'new' ? 'কুপন যোগ হয়েছে' : 'কুপন আপডেট হয়েছে');
    close();
  };

  const doDelete = () => {
    if (!confirm) return;
    save(coupons.filter((c) => c.id !== confirm.id));
    setConfirm(null);
    if (editing === confirm.id) close();
    flash('ok', 'কুপন ডিলিট হয়েছে');
  };

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      <AdCard
        title="কুপন কোড"
        icon={FiTag}
        hint="চেকআউটে গ্রাহক কোড লিখলে ছাড় স্বয়ংক্রিয়ভাবে হিসাব হবে।"
      >
        <div className="as-toolbar">
          <span className="as-hint">মোট {coupons.length}টি কুপন</span>
          <span className="spacer" />
          <button type="button" className="btn-primary" onClick={openNew}>
            <FiPlus size={16} /> নতুন কুপন
          </button>
        </div>

        {coupons.length === 0 ? (
          <AdEmpty icon={FiTag} text="কোনো কুপন নেই। নতুন কুপন যোগ করুন।" />
        ) : (
          <div className="as-list">
            {coupons.map((c) => (
              <div key={c.id} className="as-item">
                <div className="as-item-main">
                  <b>{c.code}</b>
                  <small>
                    {c.type === 'percent' ? `${c.value}% ছাড়` : `৳${c.value} ছাড়`}
                    {c.minOrder ? ` · ন্যূনতম ৳${c.minOrder}` : ''}
                    {c.expires ? ` · মেয়াদ ${c.expires}` : ''}
                  </small>
                </div>
                <span className={`as-badge ${c.active ? 'ok' : 'muted'}`}>
                  {c.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
                <div className="as-item-actions">
                  <button type="button" onClick={() => openEdit(c)} title="এডিট" aria-label="এডিট">
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="del"
                    onClick={() => setConfirm(c)}
                    title="ডিলিট"
                    aria-label="ডিলিট"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isCustom ? (
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                reset();
                flash('ok', 'সব কুপন মুছে ফেলা হয়েছে');
              }}
            >
              <FiTrash2 size={14} /> সব কুপন মুছুন
            </button>
          </div>
        ) : null}
      </AdCard>

      {editing && (
        <>
          <div className="pa-scrim" onClick={close} aria-hidden="true" />
          <aside className="pa-drawer" aria-label="কুপন এডিটর">
            <form onSubmit={commit} noValidate>
              <div className="pa-drawer-head">
                <h3>
                  <FiTag size={17} />
                  {editing === 'new' ? 'নতুন কুপন' : 'কুপন এডিট'}
                </h3>
                <button type="button" onClick={close} aria-label="বন্ধ">
                  <FiX size={19} />
                </button>
              </div>

              <div className="pa-drawer-body">
                <AdField label="কুপন কোড *" error={error} hint="যেমন: SAVE10">
                  <AdInput
                    value={draft.code}
                    onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE10"
                  />
                </AdField>

                <AdGrid cols={2}>
                  <AdField label="ছাড়ের ধরন">
                    <AdSelect
                      value={draft.type}
                      onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                      options={[
                        { value: 'percent', label: 'পার্সেন্ট (%)' },
                        { value: 'fixed', label: 'ফিক্সড (৳)' },
                      ]}
                    />
                  </AdField>
                  <AdField label={draft.type === 'percent' ? 'ছাড় (%)' : 'ছাড় (৳)'}>
                    <AdInput
                      type="text"
                      inputMode="numeric"
                      value={draft.value}
                      onChange={(e) =>
                        setDraft({ ...draft, value: e.target.value.replace(/[^0-9]/g, '') })
                      }
                    />
                  </AdField>
                  <AdField label="ন্যূনতম অর্ডার (৳)" hint="০ = কোনো শর্ত নেই">
                    <AdInput
                      type="text"
                      inputMode="numeric"
                      value={draft.minOrder}
                      onChange={(e) =>
                        setDraft({ ...draft, minOrder: e.target.value.replace(/[^0-9]/g, '') })
                      }
                    />
                  </AdField>
                  <AdField label="মেয়াদ শেষ (ঐচ্ছিক)">
                    <AdInput
                      type="date"
                      value={draft.expires}
                      onChange={(e) => setDraft({ ...draft, expires: e.target.value })}
                    />
                  </AdField>
                </AdGrid>

                <AdField label="নোট (ঐচ্ছিক)">
                  <AdInput
                    value={draft.note}
                    onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                    placeholder="যেমন: ঈদ অফার"
                  />
                </AdField>

                <AdToggle
                  checked={draft.active}
                  onChange={(v) => setDraft({ ...draft, active: v })}
                  label="সক্রিয়"
                  hint="নিষ্ক্রিয় কুপন চেকআউটে কাজ করবে না"
                />
              </div>

              <div className="pa-drawer-foot">
                <button type="submit" className="btn-primary">
                  <FiSave size={15} />
                  {editing === 'new' ? 'কুপন যোগ করুন' : 'আপডেট সেভ করুন'}
                </button>
                <button type="button" className="btn-ghost" onClick={close}>
                  বাতিল
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      <AdConfirm
        open={Boolean(confirm)}
        title="কুপন ডিলিট করবেন?"
        text={confirm ? `"${confirm.code}" কোডটি আর কাজ করবে না।` : ''}
        confirmLabel="হ্যাঁ, ডিলিট করুন"
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default CouponAdmin;
