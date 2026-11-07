import { useMemo, useState } from 'react';
import { FiStar, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useReviews } from '../../hooks/useReviews.js';
import { AdCard, AdConfirm, AdEmpty, AdNotice } from '../AdminKit.jsx';

/* ==========================================================
   ReviewAdmin — moderate product reviews. A review only shows on
   the storefront once it is approved.
   ========================================================== */

const Stars = ({ n }) => (
  <span style={{ color: 'var(--accent)', display: 'inline-flex', gap: 2 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i} size={13} fill={i < n ? 'currentColor' : 'none'} />
    ))}
  </span>
);

const ReviewAdmin = () => {
  const { reviews, approveReview, deleteReview, reset } = useReviews();
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);
  const [notice, setNotice] = useState(null);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2400);
  };

  const filtered = useMemo(
    () => (filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)),
    [reviews, filter]
  );

  const pending = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      <AdCard
        title="প্রোডাক্ট রিভিউ"
        icon={FiStar}
        hint="অনুমোদন না করা পর্যন্ত রিভিউ সাইটে দেখানো হয় না।"
      >
        <div className="as-toolbar">
          <button
            type="button"
            className={`btn-ghost ${filter === 'all' ? 'on' : ''}`}
            onClick={() => setFilter('all')}
          >
            সব ({reviews.length})
          </button>
          <button
            type="button"
            className={`btn-ghost ${filter === 'pending' ? 'on' : ''}`}
            onClick={() => setFilter('pending')}
          >
            অপেক্ষমাণ ({pending})
          </button>
          <button
            type="button"
            className={`btn-ghost ${filter === 'approved' ? 'on' : ''}`}
            onClick={() => setFilter('approved')}
          >
            অনুমোদিত ({reviews.length - pending})
          </button>
          <span className="spacer" />
          {reviews.length > 0 ? (
            <button type="button" className="btn-ghost" onClick={() => setConfirm({ all: true })}>
              <FiTrash2 size={14} /> সব মুছুন
            </button>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <AdEmpty
            icon={FiStar}
            text={
              reviews.length === 0 ? 'এখনো কোনো রিভিউ আসেনি।' : 'এই ফিল্টারে কোনো রিভিউ নেই।'
            }
          />
        ) : (
          <div className="as-list">
            {filtered.map((r) => (
              <div key={r.id} className="as-item" style={{ alignItems: 'flex-start' }}>
                <div className="as-item-main">
                  <b>
                    {r.name} · <Stars n={r.rating} />
                  </b>
                  <small>{r.productName || r.productId}</small>
                  <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 6 }}>{r.text}</p>
                </div>
                <span className={`as-badge ${r.status === 'approved' ? 'ok' : 'accent'}`}>
                  {r.status === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                </span>
                <div className="as-item-actions">
                  {r.status !== 'approved' ? (
                    <button
                      type="button"
                      onClick={() => {
                        approveReview(r.id);
                        flash('ok', 'রিভিউ অনুমোদিত হয়েছে');
                      }}
                      title="অনুমোদন"
                      aria-label="অনুমোদন"
                    >
                      <FiCheck size={15} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="del"
                    onClick={() => setConfirm({ review: r })}
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

      <AdConfirm
        open={Boolean(confirm)}
        title={confirm?.all ? 'সব রিভিউ মুছবেন?' : 'রিভিউ ডিলিট করবেন?'}
        text={
          confirm?.all
            ? `সব ${reviews.length}টি রিভিউ মুছে যাবে।`
            : 'রিভিউটি স্থায়ীভাবে মুছে যাবে।'
        }
        confirmLabel="হ্যাঁ, মুছুন"
        onConfirm={() => {
          if (confirm?.all) {
            reset();
            flash('ok', 'সব রিভিউ মুছে ফেলা হয়েছে');
          } else if (confirm?.review) {
            deleteReview(confirm.review.id);
            flash('ok', 'রিভিউ ডিলিট হয়েছে');
          }
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default ReviewAdmin;
