import { useRef, useState } from 'react';
import { FiDownload, FiUpload, FiAlertTriangle, FiDatabase, FiHardDrive } from 'react-icons/fi';
import {
  buildBackup,
  downloadBackup,
  importBackup,
  resetAll,
  storageUsage,
  BACKUP_KEYS,
} from '../../hooks/useBackup.js';
import { AdCard, AdConfirm, AdNotice } from '../AdminKit.jsx';

/* ==========================================================
   BackupAdmin — export the whole site's data as JSON, restore it
   from a file, or wipe everything back to the built-in defaults.
   ========================================================== */

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const BackupAdmin = () => {
  const fileRef = useRef(null);
  const [notice, setNotice] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [usage, setUsage] = useState(() => storageUsage());

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3200);
  };

  const doExport = () => {
    const payload = downloadBackup();
    const count = Object.keys(payload.data).length;
    flash('ok', `ব্যাকআপ ডাউনলোড হয়েছে (${count}টি ডেটা সেট)`);
  };

  const onImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => flash('error', 'ফাইলটি পড়া যায়নি');
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        const result = importBackup(payload);
        if (!result.ok) {
          flash('error', result.reason || 'ইমপোর্ট ব্যর্থ হয়েছে');
          return;
        }
        setUsage(storageUsage());
        flash('ok', `${result.restored}টি ডেটা সেট পুনরুদ্ধার হয়েছে`);
      } catch {
        flash('error', 'ফাইলটি বৈধ JSON নয়');
      }
    };
    reader.readAsText(file);
  };

  const preview = buildBackup();

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      <div className="as-stats">
        <div className="as-stat">
          <span>ব্যবহৃত স্টোরেজ</span>
          <b className={usage > 4 * 1024 * 1024 ? 'warn' : ''}>{formatBytes(usage)}</b>
        </div>
        <div className="as-stat">
          <span>ডেটা সেট</span>
          <b>{Object.keys(preview.data).length}</b>
        </div>
        <div className="as-stat">
          <span>ব্রাউজার সীমা</span>
          <b>~৫ MB</b>
        </div>
      </div>

      <AdCard
        title="এক্সপোর্ট"
        icon={FiDownload}
        hint="সাইটের সব সেটিংস, প্রোডাক্ট, ক্যাটাগরি, অর্ডার, কুপন ও রিভিউ একটি JSON ফাইলে সেভ হবে।"
      >
        <button type="button" className="btn-primary" onClick={doExport}>
          <FiDownload size={15} /> ব্যাকআপ ডাউনলোড করুন
        </button>
      </AdCard>

      <AdCard
        title="ইমপোর্ট"
        icon={FiUpload}
        hint="আগে এক্সপোর্ট করা JSON ফাইল আপলোড করলে সব ডেটা ফিরে আসবে। বর্তমান ডেটা প্রতিস্থাপিত হবে।"
      >
        <label className="as-upload">
          <FiUpload size={16} /> ব্যাকআপ ফাইল বেছে নিন
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              onImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
      </AdCard>

      <AdCard title="ডেটা সেট তালিকা" icon={FiDatabase}>
        <div className="as-list">
          {BACKUP_KEYS.map(({ key, label }) => (
            <div key={key} className="as-item">
              <div className="as-item-main">
                <b>{label}</b>
                <small>{key}</small>
              </div>
              <span className={`as-badge ${key in preview.data ? 'ok' : 'muted'}`}>
                {key in preview.data ? 'ডেটা আছে' : 'খালি'}
              </span>
            </div>
          ))}
        </div>
      </AdCard>

      <AdCard title="সব রিসেট" icon={FiHardDrive}>
        <p className="as-hint" style={{ marginBottom: 14 }}>
          সব অ্যাডমিন পরিবর্তন মুছে গিয়ে সাইট আবার কোডের ডিফল্ট অবস্থায় ফিরে যাবে। এই কাজটি ফেরানো
          যায় না — আগে ব্যাকআপ নিয়ে রাখুন।
        </p>
        <button type="button" className="btn-danger" onClick={() => setConfirmReset(true)}>
          <FiAlertTriangle size={15} /> সব ডেটা রিসেট করুন
        </button>
      </AdCard>

      <AdConfirm
        open={confirmReset}
        title="সব ডেটা রিসেট করবেন?"
        text="সব প্রোডাক্ট, ক্যাটাগরি, অর্ডার, কুপন, রিভিউ ও সেটিংস মুছে গিয়ে ডিফল্ট অবস্থায় ফিরবে। এটি ফেরানো যাবে না।"
        confirmLabel="হ্যাঁ, সব রিসেট করুন"
        onConfirm={() => {
          resetAll();
          setUsage(storageUsage());
          setConfirmReset(false);
          flash('ok', 'সব ডেটা ডিফল্টে ফিরিয়ে আনা হয়েছে');
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};

export default BackupAdmin;
