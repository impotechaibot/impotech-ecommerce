import { useState } from 'react';
import { FiLock, FiLogOut, FiKey, FiInfo } from 'react-icons/fi';
import { useSiteConfig } from '../../hooks/useSiteConfig.js';
import { AdCard, AdField, AdInput, AdNotice, AdConfirm } from '../AdminKit.jsx';

/* ==========================================================
   AdminSettings — change the panel password and end the session.

   NOTE: this is a client-side guard only. It keeps casual visitors
   out of the panel, but anyone who reads the bundle can bypass it.
   Real protection needs server-side authentication — see the
   README checklist.
   ========================================================== */

const AdminSettings = ({ onLogout }) => {
  const { config, save } = useSiteConfig();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3000);
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (current !== config.admin.password) {
      setError('বর্তমান পাসওয়ার্ড ভুল');
      return;
    }
    if (next.length < 4) {
      setError('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
      return;
    }
    if (next !== again) {
      setError('নতুন পাসওয়ার্ড দুবার একই লিখুন');
      return;
    }
    if (!save({ admin: { password: next } })) {
      setError('সেভ করা যায়নি');
      return;
    }
    setError('');
    setCurrent('');
    setNext('');
    setAgain('');
    flash('ok', 'পাসওয়ার্ড পরিবর্তন হয়েছে');
  };

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      <AdCard title="পাসওয়ার্ড পরিবর্তন" icon={FiKey}>
        <form onSubmit={changePassword} noValidate>
          <AdField label="বর্তমান পাসওয়ার্ড" error={error}>
            <AdInput
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </AdField>
          <AdField label="নতুন পাসওয়ার্ড">
            <AdInput
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
            />
          </AdField>
          <AdField label="নতুন পাসওয়ার্ড আবার">
            <AdInput
              type="password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
              autoComplete="new-password"
            />
          </AdField>
          <button type="submit" className="btn-primary" style={{ marginTop: 14 }}>
            <FiLock size={15} /> পাসওয়ার্ড সেভ করুন
          </button>
        </form>
      </AdCard>

      <AdCard title="লগইন সেশন" icon={FiLogOut}>
        <p className="as-hint" style={{ marginBottom: 14 }}>
          লগইন সেশন ব্রাউজার ট্যাব বন্ধ করলেই শেষ হয়ে যায়। এখনই লগআউট করতে চাইলে নিচের বাটন
          চাপুন।
        </p>
        <button type="button" className="btn-ghost" onClick={() => setConfirmLogout(true)}>
          <FiLogOut size={15} /> লগআউট করুন
        </button>
      </AdCard>

      <AdCard title="নিরাপত্তা নোট" icon={FiInfo}>
        <p className="as-hint">
          এই পাসওয়ার্ড গার্ডটি শুধু ক্লায়েন্ট-সাইড — অর্থাৎ কেউ কোড দেখে বাইপাস করতে পারবে।
          এখানে শুধু সাইটের চেহারা ও কনটেন্ট নিয়ন্ত্রণ হয়, কোনো সংবেদনশীল তথ্য নেই। আসল
          সুরক্ষার জন্য সার্ভার-সাইড অথেন্টিকেশন দরকার — README-এর চেকলিস্টে বিস্তারিত আছে।
        </p>
      </AdCard>

      <AdConfirm
        open={confirmLogout}
        title="লগআউট করবেন?"
        text="আবার ঢুকতে পাসওয়ার্ড দিতে হবে।"
        confirmLabel="হ্যাঁ, লগআউট"
        danger={false}
        onConfirm={() => {
          setConfirmLogout(false);
          onLogout?.();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default AdminSettings;
