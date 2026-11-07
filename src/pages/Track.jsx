import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiCheck, FiSearch } from 'react-icons/fi';
import { useOrders, ORDER_STATUSES } from '../hooks/useOrders.js';
import { formatMoney } from '../utils/format.js';
import '../styles/Track.css';

const Track = () => {
  const { findOrder } = useOrders();
  const [id, setId] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const q = id.trim();
    if (!q) return;
    const order = findOrder(q);
    if (order) {
      setResult(order);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  // Map the order status onto the 4-step progress bar.
  const stepIndex = (status) => {
    const order = ['new', 'processing', 'shipped', 'delivered'];
    const i = order.indexOf(status);
    return i < 0 ? 0 : i;
  };

  return (
    <div className="page">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">হোম</Link>
          <span>/</span>
          <span>অর্ডার ট্র্যাকিং</span>
        </nav>

        <div className="track-wrap">
          <div className="track-head">
            <div className="track-ico">
              <FiPackage size={26} />
            </div>
            <h1>অর্ডার ট্র্যাক করুন</h1>
            <p>আপনার অর্ডার আইডি দিয়ে ডেলিভারি স্ট্যাটাস দেখুন।</p>
          </div>

          <form className="track-form" onSubmit={submit}>
            <FiSearch size={17} />
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="অর্ডার আইডি (যেমন: IMP123456)"
              aria-label="অর্ডার আইডি"
            />
            <button type="submit">ট্র্যাক করুন</button>
          </form>

          {notFound && (
            <div className="track-result">
              <p className="tr-note">
                এই আইডিতে কোনো অর্ডার পাওয়া যায়নি। আইডিটি আবার যাচাই করুন।
              </p>
            </div>
          )}

          {result && (
            <div className="track-result">
              <p className="tr-id">
                অর্ডার <b>{result.id}</b>
              </p>
              <div className="tr-steps">
                {ORDER_STATUSES.slice(0, 4).map((s, i) => (
                  <div
                    key={s.id}
                    className={`tr-step ${i <= stepIndex(result.status) ? 'done' : ''} ${
                      i === stepIndex(result.status) ? 'now' : ''
                    }`}
                  >
                    <span className="tr-dot">
                      {i <= stepIndex(result.status) ? <FiCheck size={13} /> : null}
                    </span>
                    <span className="tr-label">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="tr-meta">
                <p>
                  মোট: <b>{formatMoney(result.total)}</b> · পেমেন্ট:{' '}
                  <b>{result.payment}</b>
                </p>
                <p>
                  স্ট্যাটাস:{' '}
                  <b>
                    {ORDER_STATUSES.find((s) => s.id === result.status)?.label ||
                      'নতুন'}
                  </b>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Track;
