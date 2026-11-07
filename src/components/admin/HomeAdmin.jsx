import { useState } from 'react';
import {
  FiImage,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiLayout,
  FiMail,
  FiStar,
} from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import {
  AdCard,
  AdField,
  AdGrid,
  AdInput,
  AdTextarea,
  AdSaveBar,
  AdConfirm,
  AdOrderBtns,
  AdEmpty,
  AdNotice,
  moveItem,
  fileToDataUrl,
} from '../AdminKit.jsx';

/* ==========================================================
   HomeAdmin — everything on the home page: hero slides, promo
   banners, service highlight cards and the newsletter block.
   ========================================================== */

const EMPTY_SLIDE = {
  id: '',
  image: '',
  title: '',
  subtitle: '',
  cta: 'এখনই কিনুন',
  link: '/products',
};

const EMPTY_BANNER = { id: '', image: '', title: '', subtitle: '', link: '/products' };
const EMPTY_SERVICE = { id: '', icon: '', title: '', text: '' };

const HomeAdmin = () => {
  const { config, save, reset } = useSiteConfig();
  const home = config.home;

  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [editor, setEditor] = useState(null); // {kind, mode, draft}
  const [error, setError] = useState('');

  const [news, setNews] = useState(home.newsletter);
  const [newsDirty, setNewsDirty] = useState(false);
  const [newsSaved, setNewsSaved] = useState(false);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2600);
  };

  const listOf = (kind) =>
    kind === 'slide' ? home.slides : kind === 'banner' ? home.banners : home.services;

  const keyOf = (kind) =>
    kind === 'slide' ? 'slides' : kind === 'banner' ? 'banners' : 'services';

  const openNew = (kind) => {
    const base =
      kind === 'slide' ? EMPTY_SLIDE : kind === 'banner' ? EMPTY_BANNER : EMPTY_SERVICE;
    setEditor({ kind, mode: 'new', draft: { ...base, id: `${kind}${Date.now()}` } });
    setError('');
  };

  const openEdit = (kind, item) => {
    setEditor({ kind, mode: 'edit', draft: { ...item } });
    setError('');
  };

  const closeEditor = () => {
    setEditor(null);
    setError('');
  };

  const commitEditor = (e) => {
    e.preventDefault();
    const { kind, mode, draft } = editor;
    if (!draft.title?.trim()) {
      setError('শিরোনাম আবশ্যক');
      return;
    }

    const list = listOf(kind);
    const next =
      mode === 'new'
        ? [...list, draft]
        : list.map((it) => (it.id === draft.id ? draft : it));

    if (!save({ home: { [keyOf(kind)]: next } })) {
      flash('error', 'সেভ করা যায়নি');
      return;
    }
    flash('ok', mode === 'new' ? 'যোগ হয়েছে' : 'আপডেট হয়েছে');
    closeEditor();
  };

  const doDelete = () => {
    if (!confirm) return;
    const { kind, item } = confirm;
    const next = listOf(kind).filter((it) => it.id !== item.id);
    save({ home: { [keyOf(kind)]: next } });
    setConfirm(null);
    flash('ok', 'ডিলিট হয়েছে');
  };

  const move = (kind, from, to) =>
    save({ home: { [keyOf(kind)]: moveItem(listOf(kind), from, to) } });

  const onImage = async (file) => {
    if (!file) return;
    try {
      const data = await fileToDataUrl(file, 1400, 0.82);
      setEditor((ed) => ({ ...ed, draft: { ...ed.draft, image: data } }));
      setError('');
    } catch {
      setError('ছবিটি পড়া যায়নি');
    }
  };

  const saveNews = () => {
    if (!save({ home: { newsletter: news } })) {
      flash('error', 'সেভ করা যায়নি');
      return;
    }
    setNewsDirty(false);
    setNewsSaved(true);
    setTimeout(() => setNewsSaved(false), 2200);
  };

  const renderList = (kind, title, icon, hint) => {
    const list = listOf(kind);
    return (
      <AdCard title={title} icon={icon} hint={hint}>
        <div className="as-toolbar">
          <span className="as-hint">মোট {list.length}টি</span>
          <span className="spacer" />
          <button type="button" className="btn-primary" onClick={() => openNew(kind)}>
            <FiPlus size={16} /> নতুন যোগ করুন
          </button>
        </div>

        {list.length === 0 ? (
          <AdEmpty icon={icon} text="কিছু নেই।" />
        ) : (
          <div className="as-list">
            {list.map((it, i) => (
              <div key={it.id} className="as-item">
                <AdOrderBtns index={i} total={list.length} onMove={(f, t) => move(kind, f, t)} />
                {it.image ? (
                  <img className="as-thumb wide" src={it.image} alt="" />
                ) : (
                  <span className="as-thumb wide" />
                )}
                <div className="as-item-main">
                  <b>{it.title}</b>
                  <small>{it.subtitle || it.text || it.link || ''}</small>
                </div>
                <div className="as-item-actions">
                  <button
                    type="button"
                    onClick={() => openEdit(kind, it)}
                    title="এডিট"
                    aria-label="এডিট"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="del"
                    onClick={() => setConfirm({ kind, item: it })}
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
      </AdCard>
    );
  };

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      {renderList(
        'slide',
        'হিরো স্লাইডার',
        FiImage,
        'হোমের উপরের বড় স্লাইডার। ক্রম বদলালে স্লাইডের ক্রম বদলাবে।'
      )}
      {renderList('banner', 'প্রোমো ব্যানার', FiLayout, 'হোমের মাঝের প্রোমোশনাল ব্যানার।')}
      {renderList(
        'service',
        'সার্ভিস হাইলাইট কার্ড',
        FiStar,
        'যেমন: ফ্রি ডেলিভারি, ৭ দিনের রিপ্লেসমেন্ট।'
      )}

      <AdCard title="নিউজলেটার সেকশন" icon={FiMail}>
        <AdGrid cols={2}>
          <AdField label="শিরোনাম">
            <AdInput
              value={news.title}
              onChange={(e) => {
                setNews({ ...news, title: e.target.value });
                setNewsDirty(true);
              }}
            />
          </AdField>
          <AdField label="বাটন টেক্সট">
            <AdInput
              value={news.button}
              onChange={(e) => {
                setNews({ ...news, button: e.target.value });
                setNewsDirty(true);
              }}
            />
          </AdField>
          <AdField label="বর্ণনা" full>
            <AdTextarea
              value={news.text}
              onChange={(e) => {
                setNews({ ...news, text: e.target.value });
                setNewsDirty(true);
              }}
              style={{ minHeight: 80 }}
            />
          </AdField>
        </AdGrid>
        <div style={{ marginTop: 16 }}>
          <AdSaveBar
            dirty={newsDirty}
            saved={newsSaved}
            onSave={saveNews}
            onDiscard={() => {
              setNews(home.newsletter);
              setNewsDirty(false);
            }}
            onReset={() => {
              reset();
              setNewsDirty(false);
            }}
            canReset
          />
        </div>
      </AdCard>

      {editor && (
        <>
          <div className="pa-scrim" onClick={closeEditor} aria-hidden="true" />
          <aside className="pa-drawer" aria-label="হোম এডিটর">
            <form onSubmit={commitEditor} noValidate>
              <div className="pa-drawer-head">
                <h3>
                  <FiImage size={17} />
                  {editor.mode === 'new' ? 'নতুন যোগ করুন' : 'এডিট করুন'}
                </h3>
                <button type="button" onClick={closeEditor} aria-label="বন্ধ">
                  <FiX size={19} />
                </button>
              </div>

              <div className="pa-drawer-body">
                <AdField label="শিরোনাম *" error={error}>
                  <AdInput
                    value={editor.draft.title}
                    onChange={(e) =>
                      setEditor({ ...editor, draft: { ...editor.draft, title: e.target.value } })
                    }
                  />
                </AdField>

                {editor.kind !== 'service' ? (
                  <AdField label="সাবটাইটেল">
                    <AdInput
                      value={editor.draft.subtitle || ''}
                      onChange={(e) =>
                        setEditor({
                          ...editor,
                          draft: { ...editor.draft, subtitle: e.target.value },
                        })
                      }
                    />
                  </AdField>
                ) : (
                  <AdField label="বর্ণনা">
                    <AdTextarea
                      value={editor.draft.text || ''}
                      onChange={(e) =>
                        setEditor({ ...editor, draft: { ...editor.draft, text: e.target.value } })
                      }
                      style={{ minHeight: 80 }}
                    />
                  </AdField>
                )}

                {editor.kind === 'slide' ? (
                  <AdField label="বাটন টেক্সট">
                    <AdInput
                      value={editor.draft.cta || ''}
                      onChange={(e) =>
                        setEditor({ ...editor, draft: { ...editor.draft, cta: e.target.value } })
                      }
                    />
                  </AdField>
                ) : null}

                {editor.kind !== 'service' ? (
                  <AdField label="লিংক" hint="যেমন: /products বা /products?category=led-light">
                    <AdInput
                      value={editor.draft.link || ''}
                      onChange={(e) =>
                        setEditor({ ...editor, draft: { ...editor.draft, link: e.target.value } })
                      }
                    />
                  </AdField>
                ) : (
                  <AdField label="আইকন (ইমোজি বা ছোট টেক্সট)" hint="যেমন: 🚚 বা ★">
                    <AdInput
                      value={editor.draft.icon || ''}
                      onChange={(e) =>
                        setEditor({ ...editor, draft: { ...editor.draft, icon: e.target.value } })
                      }
                    />
                  </AdField>
                )}

                {editor.kind !== 'service' ? (
                  <AdField label="ছবি">
                    <label className="as-upload">
                      <FiImage size={16} /> ছবি আপলোড করুন
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
                      value={editor.draft.image?.startsWith('data:') ? '' : editor.draft.image}
                      onChange={(e) =>
                        setEditor({ ...editor, draft: { ...editor.draft, image: e.target.value } })
                      }
                      placeholder="অথবা ছবির URL"
                    />
                    {editor.draft.image ? (
                      <img className="as-preview-img" src={editor.draft.image} alt="" />
                    ) : null}
                  </AdField>
                ) : null}
              </div>

              <div className="pa-drawer-foot">
                <button type="submit" className="btn-primary">
                  <FiSave size={15} /> সেভ করুন
                </button>
                <button type="button" className="btn-ghost" onClick={closeEditor}>
                  বাতিল
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      <AdConfirm
        open={Boolean(confirm)}
        title="ডিলিট করবেন?"
        text={confirm ? `"${confirm.item.title}" সরে যাবে।` : ''}
        confirmLabel="হ্যাঁ, ডিলিট করুন"
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default HomeAdmin;
