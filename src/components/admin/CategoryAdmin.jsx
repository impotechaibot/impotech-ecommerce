import { useMemo, useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiGrid,
  FiSave,
  FiX,
} from 'react-icons/fi';
import { useCategories, slugifyCategory } from '../../hooks/useCategories.js';
import { useProducts } from '../../hooks/useProducts.js';
import {
  AdCard,
  AdField,
  AdGrid,
  AdInput,
  AdToggle,
  AdSaveBar,
  AdConfirm,
  AdOrderBtns,
  AdEmpty,
  AdNotice,
  moveItem,
  fileToDataUrl,
} from '../AdminKit.jsx';

/* ==========================================================
   CategoryAdmin — add / edit / delete / reorder categories.
   The order here drives the home category strip and the product
   filters, so a change is visible on the storefront immediately.
   ========================================================== */

const EMPTY = { id: '', name: '', nameEn: '', image: '', active: true };

const CategoryAdmin = () => {
  const { categories, save, reset, isCustom } = useCategories();
  const { products } = useProducts();

  const [editing, setEditing] = useState(null); // category id | 'new' | null
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null); // {category, count}
  const [confirmReset, setConfirmReset] = useState(false);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2600);
  };

  const counts = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [products]);

  const openNew = () => {
    setDraft({ ...EMPTY });
    setError('');
    setEditing('new');
  };

  const openEdit = (c) => {
    setDraft({ ...c });
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
    if (!draft.name.trim()) {
      setError('ক্যাটাগরির নাম আবশ্যক');
      return;
    }

    const isNew = editing === 'new';
    let id = draft.id;

    if (isNew) {
      const seed = slugifyCategory(draft.nameEn || draft.name);
      id = seed;
      let n = 2;
      while (categories.some((c) => c.id === id)) id = `${seed}-${n++}`;
    }

    const record = {
      id,
      name: draft.name.trim(),
      nameEn: (draft.nameEn || '').trim(),
      image: draft.image || '',
      active: draft.active !== false,
      order: isNew ? categories.length : draft.order,
    };

    const next = isNew
      ? [...categories, record]
      : categories.map((c) => (c.id === id ? record : c));

    if (!save(next)) {
      flash('error', 'সেভ করা যায়নি — স্টোরেজ পূর্ণ হতে পারে');
      return;
    }
    flash('ok', isNew ? 'নতুন ক্যাটাগরি যোগ হয়েছে' : 'ক্যাটাগরি আপডেট হয়েছে');
    close();
  };

  const askDelete = (c) => setConfirm({ category: c, count: counts[c.id] || 0 });

  const doDelete = () => {
    if (!confirm) return;
    const next = categories.filter((c) => c.id !== confirm.category.id);
    save(next);
    setConfirm(null);
    if (editing === confirm.category.id) close();
    flash('ok', 'ক্যাটাগরি ডিলিট হয়েছে');
  };

  const move = (from, to) => {
    const next = moveItem(categories, from, to).map((c, i) => ({ ...c, order: i }));
    save(next);
  };

  const onImage = async (file) => {
    if (!file) return;
    try {
      const data = await fileToDataUrl(file, 600, 0.8);
      setDraft((d) => ({ ...d, image: data }));
      setError('');
    } catch {
      setError('ছবিটি পড়া যায়নি');
    }
  };

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      <AdCard
        title="ক্যাটাগরি তালিকা"
        icon={FiGrid}
        hint="ক্রম বদলালে হোমের ক্যাটাগরি স্ট্রিপ ও প্রোডাক্ট ফিল্টারে সাথে সাথে প্রতিফলিত হবে।"
      >
        <div className="as-toolbar">
          <span className="as-hint">
            মোট {categories.length}টি ক্যাটাগরি · {products.length}টি প্রোডাক্ট
          </span>
          <span className="spacer" />
          <button type="button" className="btn-primary" onClick={openNew}>
            <FiPlus size={16} /> নতুন ক্যাটাগরি
          </button>
        </div>

        {categories.length === 0 ? (
          <AdEmpty icon={FiGrid} text="কোনো ক্যাটাগরি নেই।" />
        ) : (
          <div className="as-list">
            {categories.map((c, i) => (
              <div key={c.id} className="as-item">
                <AdOrderBtns index={i} total={categories.length} onMove={move} />
                {c.image ? (
                  <img className="as-thumb" src={c.image} alt="" />
                ) : (
                  <span className="as-thumb" />
                )}
                <div className="as-item-main">
                  <b>{c.name}</b>
                  <small>
                    {c.id} · {counts[c.id] || 0}টি প্রোডাক্ট
                    {c.nameEn ? ` · ${c.nameEn}` : ''}
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
                    onClick={() => askDelete(c)}
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
            onReset={() => setConfirmReset(true)}
            canReset={isCustom}
            resetLabel="ডিফল্ট ক্যাটাগরিতে ফিরুন"
          />
        </div>
      </AdCard>

      {/* editor */}
      {editing && (
        <>
          <div className="pa-scrim" onClick={close} aria-hidden="true" />
          <aside className="pa-drawer" aria-label="ক্যাটাগরি এডিটর">
            <form onSubmit={commit} noValidate>
              <div className="pa-drawer-head">
                <h3>
                  <FiGrid size={17} />
                  {editing === 'new' ? 'নতুন ক্যাটাগরি' : 'ক্যাটাগরি এডিট'}
                </h3>
                <button type="button" onClick={close} aria-label="বন্ধ">
                  <FiX size={19} />
                </button>
              </div>

              <div className="pa-drawer-body">
                <AdField label="নাম (বাংলা) *" error={error}>
                  <AdInput
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="যেমন: LED লাইট"
                  />
                </AdField>

                <AdField label="Name (English)" hint="খালি রাখলে বাংলা নাম থেকেই আইডি তৈরি হবে">
                  <AdInput
                    value={draft.nameEn}
                    onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
                    placeholder="e.g. LED Light"
                  />
                </AdField>

                <AdField label="আইকন / ছবি">
                  <div className="as-grid cols-2">
                    <label className="as-upload">
                      <FiPlus size={15} /> ছবি আপলোড
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          onImage(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <AdInput
                      value={draft.image?.startsWith('data:') ? '' : draft.image}
                      onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                      placeholder="অথবা ছবির URL"
                    />
                  </div>
                  {draft.image ? (
                    <img
                      className="as-preview-img"
                      src={draft.image}
                      alt=""
                      style={{ marginTop: 10 }}
                    />
                  ) : null}
                </AdField>

                <AdToggle
                  checked={draft.active}
                  onChange={(v) => setDraft({ ...draft, active: v })}
                  label="সক্রিয়"
                  hint="নিষ্ক্রিয় ক্যাটাগরি সাইটে দেখানো হবে না"
                />
              </div>

              <div className="pa-drawer-foot">
                <button type="submit" className="btn-primary">
                  <FiSave size={15} />
                  {editing === 'new' ? 'ক্যাটাগরি যোগ করুন' : 'আপডেট সেভ করুন'}
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
        title="ক্যাটাগরি ডিলিট করবেন?"
        text={
          confirm
            ? confirm.count > 0
              ? `"${confirm.category.name}" ক্যাটাগরিতে ${confirm.count}টি প্রোডাক্ট আছে। ডিলিট করলে সেই প্রোডাক্টগুলো "অন্যান্য" হিসেবে দেখাবে।`
              : `"${confirm.category.name}" স্থায়ীভাবে তালিকা থেকে সরে যাবে।`
            : ''
        }
        confirmLabel="হ্যাঁ, ডিলিট করুন"
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <AdConfirm
        open={confirmReset}
        title="ডিফল্ট ক্যাটাগরিতে ফিরবেন?"
        text="অ্যাডমিন থেকে করা সব ক্যাটাগরি পরিবর্তন মুছে যাবে এবং Store.js-এর মূল তালিকা ফিরে আসবে।"
        confirmLabel="হ্যাঁ, রিসেট করুন"
        onConfirm={() => {
          reset();
          setConfirmReset(false);
          close();
          flash('ok', 'ডিফল্ট ক্যাটাগরি ফিরিয়ে আনা হয়েছে');
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};

export default CategoryAdmin;
