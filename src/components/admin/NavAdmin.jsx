import { useState } from 'react';
import { FiMenu, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import {
  AdCard,
  AdField,
  AdInput,
  AdToggle,
  AdSaveBar,
  AdConfirm,
  AdOrderBtns,
  AdEmpty,
  AdNotice,
  moveItem,
} from '../AdminKit.jsx';

/* ==========================================================
   NavAdmin — the main menu items (desktop nav + mobile drawer).
   ========================================================== */

const EMPTY = { id: '', label: '', to: '/', hot: false };

const NavAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const nav = config.nav || [];

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2600);
  };

  const openNew = () => {
    setDraft({ ...EMPTY, id: `n${Date.now()}` });
    setError('');
    setEditing('new');
  };

  const openEdit = (item) => {
    setDraft({ ...item });
    setError('');
    setEditing(item.id);
  };

  const close = () => {
    setEditing(null);
    setDraft(EMPTY);
    setError('');
  };

  const commit = (e) => {
    e.preventDefault();
    if (!draft.label.trim()) {
      setError('মেনু লেবেল আবশ্যক');
      return;
    }
    if (!draft.to.trim()) {
      setError('লিংক (path) আবশ্যক');
      return;
    }

    const record = {
      id: draft.id || `n${Date.now()}`,
      label: draft.label.trim(),
      to: draft.to.trim(),
      hot: Boolean(draft.hot),
    };

    const next =
      editing === 'new'
        ? [...nav, record]
        : nav.map((n) => (n.id === record.id ? record : n));

    if (!save({ nav: next })) {
      flash('error', 'সেভ করা যায়নি');
      return;
    }
    flash('ok', editing === 'new' ? 'মেনু আইটেম যোগ হয়েছে' : 'মেনু আপডেট হয়েছে');
    close();
  };

  const doDelete = () => {
    if (!confirm) return;
    save({ nav: nav.filter((n) => n.id !== confirm.id) });
    setConfirm(null);
    if (editing === confirm.id) close();
    flash('ok', 'মেনু আইটেম ডিলিট হয়েছে');
  };

  const move = (from, to) => save({ nav: moveItem(nav, from, to) });

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      <AdCard
        title="মেনু আইটেম"
        icon={FiMenu}
        hint="এখানকার তালিকা ডেস্কটপ নেভিগেশন ও মোবাইল ড্রয়ারে একসাথে ব্যবহৃত হয়।"
      >
        <div className="as-toolbar">
          <span className="as-hint">মোট {nav.length}টি আইটেম</span>
          <span className="spacer" />
          <button type="button" className="btn-primary" onClick={openNew}>
            <FiPlus size={16} /> নতুন আইটেম
          </button>
        </div>

        {nav.length === 0 ? (
          <AdEmpty icon={FiMenu} text="কোনো মেনু আইটেম নেই।" />
        ) : (
          <div className="as-list">
            {nav.map((n, i) => (
              <div key={n.id} className="as-item">
                <AdOrderBtns index={i} total={nav.length} onMove={move} />
                <div className="as-item-main">
                  <b>{n.label}</b>
                  <small>{n.to}</small>
                </div>
                {n.hot ? <span className="as-badge accent">হট</span> : null}
                <div className="as-item-actions">
                  <button type="button" onClick={() => openEdit(n)} title="এডিট" aria-label="এডিট">
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="del"
                    onClick={() => setConfirm(n)}
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

        <div style={{ marginTop: 16 }}>
          <AdSaveBar
            dirty={false}
            onSave={() => {}}
            onDiscard={() => {}}
            onReset={() => {
              reset();
              flash('ok', 'ডিফল্ট মেনু ফিরিয়ে আনা হয়েছে');
            }}
            canReset
            resetLabel="ডিফল্ট মেনুতে ফিরুন"
          />
        </div>
      </AdCard>

      {editing && (
        <>
          <div className="pa-scrim" onClick={close} aria-hidden="true" />
          <aside className="pa-drawer" aria-label="মেনু এডিটর">
            <form onSubmit={commit} noValidate>
              <div className="pa-drawer-head">
                <h3>
                  <FiMenu size={17} />
                  {editing === 'new' ? 'নতুন মেনু আইটেম' : 'মেনু এডিট'}
                </h3>
                <button type="button" onClick={close} aria-label="বন্ধ">
                  <FiX size={19} />
                </button>
              </div>

              <div className="pa-drawer-body">
                <AdField label="লেবেল *" error={error}>
                  <AdInput
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                    placeholder="যেমন: সব পণ্য"
                  />
                </AdField>

                <AdField
                  label="লিংক (path) *"
                  hint="যেমন: /products, /products?category=led-light, /track"
                >
                  <AdInput
                    value={draft.to}
                    onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                    placeholder="/products"
                  />
                </AdField>

                <AdToggle
                  checked={draft.hot}
                  onChange={(v) => setDraft({ ...draft, hot: v })}
                  label="হট আইটেম"
                  hint="অ্যাকসেন্ট রঙে হাইলাইট হবে"
                />
              </div>

              <div className="pa-drawer-foot">
                <button type="submit" className="btn-primary">
                  <FiSave size={15} />
                  {editing === 'new' ? 'যোগ করুন' : 'আপডেট সেভ করুন'}
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
        title="মেনু আইটেম ডিলিট করবেন?"
        text={confirm ? `"${confirm.label}" মেনু থেকে সরে যাবে।` : ''}
        confirmLabel="হ্যাঁ, ডিলিট করুন"
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default NavAdmin;
