import { useMemo, useState } from 'react';
import { FiShoppingBag, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { useOrders, ORDER_STATUSES, statusLabel, statusTone } from '../../hooks/useOrders.js';
import { AdCard, AdInput, AdSelect, AdConfirm, AdEmpty, AdNotice } from '../AdminKit.jsx';
import { formatMoney } from '../../utils/format.js';

/* ==========================================================
   OrderAdmin — orders that came in through the checkout.
   Status can be changed inline; the detail drawer shows the full
   basket, customer and payment info.
   ========================================================== */

const OrderAdmin = () => {
  const { orders, updateStatus, deleteOrder, reset } = useOrders();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [notice, setNotice] = useState(null);

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 2400);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.customer?.phone || '').toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'new').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      revenue,
    };
  }, [orders]);

  return (
    <div className="as-stack">
      {notice && <AdNotice type={notice.type}>{notice.text}</AdNotice>}

      <div className="as-stats">
        <div className="as-stat">
          <span>মোট অর্ডার</span>
          <b>{stats.total}</b>
        </div>
        <div className="as-stat">
          <span>নতুন</span>
          <b className="accent">{stats.pending}</b>
        </div>
        <div className="as-stat">
          <span>ডেলিভারড</span>
          <b>{stats.delivered}</b>
        </div>
        <div className="as-stat">
          <span>মোট আয়</span>
          <b>{formatMoney(stats.revenue)}</b>
        </div>
      </div>

      <AdCard title="অর্ডার তালিকা" icon={FiShoppingBag}>
        <div className="as-toolbar">
          <AdInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="অর্ডার আইডি, নাম বা ফোন"
          />
          <AdSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'সব স্ট্যাটাস' },
              ...ORDER_STATUSES.map((s) => ({ value: s.id, label: s.label })),
            ]}
          />
          <span className="spacer" />
          {orders.length > 0 ? (
            <button type="button" className="btn-ghost" onClick={() => setConfirm({ all: true })}>
              <FiTrash2 size={14} /> সব মুছুন
            </button>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <AdEmpty
            icon={FiShoppingBag}
            text={
              orders.length === 0
                ? 'এখনো কোনো অর্ডার আসেনি। চেকআউট থেকে অর্ডার করলে এখানে দেখা যাবে।'
                : 'এই ফিল্টারে কোনো অর্ডার নেই।'
            }
          />
        ) : (
          <div className="as-table-wrap">
            <table className="as-table">
              <thead>
                <tr>
                  <th>অর্ডার</th>
                  <th>কাস্টমার</th>
                  <th>পণ্য</th>
                  <th>মোট</th>
                  <th>স্ট্যাটাস</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <b>{o.id}</b>
                      <br />
                      <small style={{ color: 'var(--muted-2)' }}>
                        {new Date(o.createdAt).toLocaleDateString('bn-BD')}
                      </small>
                    </td>
                    <td>
                      {o.customer?.name || '—'}
                      <br />
                      <small style={{ color: 'var(--muted-2)' }}>
                        {o.customer?.phone || ''}
                      </small>
                    </td>
                    <td>{o.items.length}টি</td>
                    <td>
                      <b>{formatMoney(o.total)}</b>
                    </td>
                    <td>
                      <AdSelect
                        value={o.status}
                        onChange={(e) => {
                          updateStatus(o.id, e.target.value);
                          flash('ok', 'স্ট্যাটাস আপডেট হয়েছে');
                        }}
                        options={ORDER_STATUSES.map((s) => ({
                          value: s.id,
                          label: s.label,
                        }))}
                        style={{ minWidth: 130 }}
                      />
                    </td>
                    <td>
                      <div className="as-item-actions">
                        <button
                          type="button"
                          onClick={() => setDetail(o)}
                          title="বিস্তারিত"
                          aria-label="বিস্তারিত"
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          type="button"
                          className="del"
                          onClick={() => setConfirm({ order: o })}
                          title="ডিলিট"
                          aria-label="ডিলিট"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdCard>

      {detail && (
        <>
          <div className="pa-scrim" onClick={() => setDetail(null)} aria-hidden="true" />
          <aside className="pa-drawer" aria-label="অর্ডার বিস্তারিত">
            <div className="pa-drawer-head">
              <h3>
                <FiShoppingBag size={17} /> অর্ডার {detail.id}
              </h3>
              <button type="button" onClick={() => setDetail(null)} aria-label="বন্ধ">
                <FiX size={19} />
              </button>
            </div>
            <div className="pa-drawer-body">
              <span className={`as-badge ${statusTone(detail.status)}`}>
                {statusLabel(detail.status)}
              </span>

              <AdCard title="কাস্টমার">
                <p style={{ fontSize: 13, lineHeight: 1.9 }}>
                  <b>{detail.customer?.name || '—'}</b>
                  <br />
                  {detail.customer?.phone || ''}
                  <br />
                  {detail.customer?.address || ''}
                  {detail.note ? (
                    <>
                      <br />
                      <em style={{ color: 'var(--muted-2)' }}>নোট: {detail.note}</em>
                    </>
                  ) : null}
                </p>
              </AdCard>

              <AdCard title="পণ্য">
                <div className="as-list">
                  {detail.items.map((it, i) => (
                    <div key={`${it.id}-${i}`} className="as-item">
                      {it.image ? <img className="as-thumb" src={it.image} alt="" /> : null}
                      <div className="as-item-main">
                        <b>{it.name}</b>
                        <small>
                          {formatMoney(it.price)} × {it.quantity}
                        </small>
                      </div>
                      <b>{formatMoney(it.price * it.quantity)}</b>
                    </div>
                  ))}
                </div>
              </AdCard>

              <AdCard title="হিসাব">
                <div className="as-list">
                  <div className="as-item">
                    <div className="as-item-main">
                      <b>সাবটোটাল</b>
                    </div>
                    <b>{formatMoney(detail.subtotal)}</b>
                  </div>
                  <div className="as-item">
                    <div className="as-item-main">
                      <b>ডেলিভারি</b>
                    </div>
                    <b>{formatMoney(detail.shipping)}</b>
                  </div>
                  {detail.discount > 0 ? (
                    <div className="as-item">
                      <div className="as-item-main">
                        <b>ছাড় {detail.coupon ? `(${detail.coupon})` : ''}</b>
                      </div>
                      <b style={{ color: 'var(--green)' }}>-{formatMoney(detail.discount)}</b>
                    </div>
                  ) : null}
                  <div className="as-item">
                    <div className="as-item-main">
                      <b>সর্বমোট</b>
                    </div>
                    <b style={{ color: 'var(--accent)' }}>{formatMoney(detail.total)}</b>
                  </div>
                </div>
                <p className="as-hint" style={{ marginTop: 10 }}>
                  পেমেন্ট: {detail.payment === 'cod' ? 'ক্যাশ অন ডেলিভারি' : detail.payment}
                </p>
              </AdCard>
            </div>
          </aside>
        </>
      )}

      <AdConfirm
        open={Boolean(confirm)}
        title={confirm?.all ? 'সব অর্ডার মুছবেন?' : 'অর্ডার ডিলিট করবেন?'}
        text={
          confirm?.all
            ? `সব ${orders.length}টি অর্ডার স্থায়ীভাবে মুছে যাবে।`
            : confirm
            ? `অর্ডার ${confirm.order.id} স্থায়ীভাবে মুছে যাবে।`
            : ''
        }
        confirmLabel="হ্যাঁ, মুছুন"
        onConfirm={() => {
          if (confirm?.all) {
            reset();
            flash('ok', 'সব অর্ডার মুছে ফেলা হয়েছে');
          } else if (confirm?.order) {
            deleteOrder(confirm.order.id);
            flash('ok', 'অর্ডার ডিলিট হয়েছে');
          }
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default OrderAdmin;
