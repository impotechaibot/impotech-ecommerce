import { useCallback, useRef, useState } from 'react';
import {
  FiCheck,
  FiRotateCcw,
  FiAlertTriangle,
  FiX,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';

/* ==========================================================
   AdminKit — the small shared UI kit every admin section uses.
   Keeping the fields/toggles/save-bar in one place means all 17
   sections look and behave the same, and a fix lands everywhere.
   ========================================================== */

/** Local draft of a config slice with dirty tracking. */
export const useDraft = (source) => {
  const [draft, setDraft] = useState(source);
  const [dirty, setDirty] = useState(false);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const update = useCallback((patch) => {
    setDraft((d) => (typeof patch === 'function' ? patch(d) : { ...d, ...patch }));
    setDirty(true);
  }, []);

  const discard = useCallback(() => {
    setDraft(sourceRef.current);
    setDirty(false);
  }, []);

  const markSaved = useCallback(() => setDirty(false), []);

  return { draft, setDraft, update, dirty, discard, markSaved };
};

/* ---------------- layout ---------------- */

export const AdCard = ({ title, icon: Icon, hint, children, className = '' }) => (
  <section className={`as-card ${className}`.trim()}>
    {title && (
      <header className="as-card-head">
        <h3>
          {Icon ? <Icon size={15} /> : null}
          {title}
        </h3>
        {hint ? <p className="as-card-hint">{hint}</p> : null}
      </header>
    )}
    {children}
  </section>
);

export const AdField = ({ label, hint, error, children, full }) => (
  <label className={`as-field ${full ? 'full' : ''}`.trim()}>
    {label ? <span className="as-label">{label}</span> : null}
    {children}
    {hint && !error ? <em className="as-hint">{hint}</em> : null}
    {error ? <em className="as-error">{error}</em> : null}
  </label>
);

export const AdGrid = ({ cols = 2, children }) => (
  <div className={`as-grid cols-${cols}`}>{children}</div>
);

/* ---------------- inputs ---------------- */

export const AdInput = ({ className = '', ...props }) => (
  <input className={`as-input ${className}`.trim()} {...props} />
);

export const AdTextarea = ({ className = '', ...props }) => (
  <textarea className={`as-textarea ${className}`.trim()} {...props} />
);

export const AdSelect = ({ options = [], className = '', ...props }) => (
  <div className="as-select-wrap">
    <select className={`as-select ${className}`.trim()} {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <FiChevronDown size={15} />
  </div>
);

export const AdToggle = ({ checked, onChange, label, hint }) => (
  <label className="as-toggle">
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="as-switch" aria-hidden="true" />
    <span className="as-toggle-txt">
      <b>{label}</b>
      {hint ? <small>{hint}</small> : null}
    </span>
  </label>
);

export const AdColor = ({ value, onChange, label }) => (
  <div className="as-color">
    <input
      type="color"
      value={value || '#f0b429'}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label || 'রঙ'}
    />
    <input
      className="as-input as-color-hex"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`${label || 'রঙ'} হেক্স`}
    />
  </div>
);

export const AdRange = ({ value, onChange, min = 0, max = 100, step = 1, suffix = '' }) => (
  <div className="as-range">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <b>
      {value}
      {suffix}
    </b>
  </div>
);

/* ---------------- save bar ---------------- */

export const AdSaveBar = ({
  onSave,
  onDiscard,
  dirty,
  saved,
  onReset,
  resetLabel = 'ডিফল্টে ফিরিয়ে নিন',
  canReset = true,
}) => (
  <div className="as-savebar">
    <button type="button" className="btn-primary" onClick={onSave} disabled={!dirty}>
      {saved ? <FiCheck size={15} /> : null}
      {saved ? 'সেভ হয়েছে' : 'সেভ করুন'}
    </button>
    <button type="button" className="btn-ghost" onClick={onDiscard} disabled={!dirty}>
      <FiX size={14} /> বাতিল
    </button>
    {onReset ? (
      <button
        type="button"
        className="btn-ghost as-reset"
        onClick={onReset}
        disabled={!canReset}
      >
        <FiRotateCcw size={14} /> {resetLabel}
      </button>
    ) : null}
    {dirty ? <span className="as-dirty">অসংরক্ষিত পরিবর্তন</span> : null}
  </div>
);

/* ---------------- misc ---------------- */

export const AdEmpty = ({ icon: Icon, text, children }) => (
  <div className="as-empty">
    {Icon ? <Icon size={30} /> : null}
    <p>{text}</p>
    {children}
  </div>
);

export const AdNotice = ({ type = 'ok', children }) => (
  <div className={`as-notice ${type}`} role="status">
    {type === 'ok' ? <FiCheck size={15} /> : <FiAlertTriangle size={15} />}
    {children}
  </div>
);

export const AdConfirm = ({
  open,
  title,
  text,
  confirmLabel = 'হ্যাঁ, নিশ্চিত',
  onConfirm,
  onCancel,
  danger = true,
}) => {
  if (!open) return null;
  return (
    <div className="as-modal-wrap" role="dialog" aria-modal="true">
      <div className="as-modal-scrim" onClick={onCancel} />
      <div className="as-modal">
        <div className={`as-modal-ico ${danger ? 'danger' : ''}`}>
          <FiAlertTriangle size={22} />
        </div>
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="as-modal-actions">
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
};

/** Up / down reorder buttons used by every ordered list. */
export const AdOrderBtns = ({ index, total, onMove }) => (
  <div className="as-order-btns">
    <button
      type="button"
      onClick={() => onMove(index, index - 1)}
      disabled={index === 0}
      aria-label="উপরে"
      title="উপরে"
    >
      <FiChevronUp size={14} />
    </button>
    <button
      type="button"
      onClick={() => onMove(index, index + 1)}
      disabled={index === total - 1}
      aria-label="নিচে"
      title="নিচে"
    >
      <FiChevronDown size={14} />
    </button>
  </div>
);

/** Move an item inside an array (used with AdOrderBtns). */
export const moveItem = (list, from, to) => {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/** Read an image file and downscale it to a JPEG data URL. */
export const fileToDataUrl = (file, max = 1200, quality = 0.82) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
