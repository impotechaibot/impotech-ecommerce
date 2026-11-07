import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FiCheck,
  FiTruck,
  FiCreditCard,
  FiSmartphone,
  FiLock,
  FiArrowLeft,
  FiTag,
  FiX,
} from 'react-icons/fi';
import { cartActions } from '../redux-state/CartState.js';
import { uiActions } from '../redux-state/UiState.js';
import { useCartWithProducts } from '../hooks/useCartWithProducts.js';
import { useSiteConfig } from '../hooks/useSiteConfig.js';
import { validateCoupon } from '../hooks/useCoupons.js';
import { useOrders, makeOrderId } from '../hooks/useOrders.js';
import { formatMoney, productImage } from '../utils/format.js';
import '../styles/Checkout.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useCartWithProducts();
  const { config: site } = useSiteConfig();
  const { addOrder } = useOrders();
  const co = site.checkout;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'ঢাকা',
    note: '',
  });
  const [payment, setPayment] = useState('cod');
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // coupon state
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // {code, discount}
  const [couponErr, setCouponErr] = useState('');

  // Build the payment options from the admin config.
  const PAYMENTS = [
    co.codEnabled && { id: 'cod', label: 'ক্যাশ অন ডেলিভারি', icon: FiTruck },
    co.bkashEnabled && { id: 'bkash', label: 'বিকাশ', icon: FiSmartphone },
    co.nagadEnabled && { id: 'nagad', label: 'নগদ', icon: FiSmartphone },
    co.rocketEnabled && { id: 'rocket', label: 'রকেট', icon: FiSmartphone },
    { id: 'card', label: 'কার্ড', icon: FiCreditCard },
  ].filter(Boolean);

  const shipping =
    total >= co.freeDeliveryAbove ? 0 : co.deliveryCharge;
  const discount = coupon ? coupon.discount : 0;
  const grandTotal = Math.max(0, total - discount) + shipping;

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const applyCoupon = () => {
    const res = validateCoupon(couponInput, total);
    if (res.ok) {
      setCoupon({ code: res.coupon.code, discount: res.discount });
      setCouponErr('');
    } else {
      setCoupon(null);
      setCouponErr(res.reason);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponErr('');
  };

  const submit = (e) => {
    e.preventDefault();
    const id = makeOrderId();
    const order = {
      id,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        bn: i.bn,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
      },
      payment,
      subtotal: total,
      shipping,
      discount,
      coupon: coupon ? coupon.code : '',
      total: grandTotal,
      status: 'new',
      note: form.note,
      createdAt: new Date().toISOString(),
    };
    addOrder(order);
    setOrderId(id);
    setPlaced(true);
    dispatch(cartActions.clearCart());
    dispatch(uiActions.showToast('অর্ডার সফলভাবে প্লেস হয়েছে'));
  };

  if (placed) {
    return (
      <div className="page">
        <div className="container">
          <div className="order-success">
            <div className="os-icon">
              <FiCheck size={32} />
            </div>
            <h1>অর্ডার কনফার্ম হয়েছে!</h1>
            <p>
              আপনার অর্ডার নম্বর <b>{orderId}</b>. {co.confirmMessage}
            </p>
            <div className="os-actions">
              <Link to="/" className="btn-primary">
                হোমে ফিরুন
              </Link>
              <Link to="/track" className="btn-ghost">
                অর্ডার ট্র্যাক করুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="cart-empty">
            <h1>চেকআউট করার জন্য কার্টে পণ্য নেই</h1>
            <p>প্রথমে পছন্দের পণ্য কার্টে যোগ করুন।</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/products')}>
              পণ্য দেখুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">হোম</Link>
          <span>/</span>
          <Link to="/cart">কার্ট</Link>
          <span>/</span>
          <span>চেকআউট</span>
        </nav>

        <div className="page-head">
          <div>
            <h1>চেকআউট</h1>
            <p>ডেলিভারি তথ্য দিন এবং অর্ডার কনফার্ম করুন</p>
          </div>
        </div>

        <form className="checkout-layout" onSubmit={submit}>
          <div className="co-form">
            <section className="co-card">
              <h3>ডেলিভারি তথ্য</h3>
              <div className="co-grid">
                <label>
                  <span>পুরো নাম *</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    required
                    placeholder="আপনার নাম"
                  />
                </label>
                <label>
                  <span>মোবাইল নম্বর *</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    required
                    placeholder="017XXXXXXXX"
                    pattern="[0-9+\- ]{11,}"
                  />
                </label>
                <label className="full">
                  <span>ইমেইল (অপশনাল)</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={change}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="full">
                  <span>সম্পূর্ণ ঠিকানা *</span>
                  <input
                    name="address"
                    value={form.address}
                    onChange={change}
                    required
                    placeholder="বাসা / রোড / এলাকা"
                  />
                </label>
                <label>
                  <span>জেলা / শহর *</span>
                  <input name="city" value={form.city} onChange={change} required />
                </label>
                <label>
                  <span>অর্ডার নোট (অপশনাল)</span>
                  <input
                    name="note"
                    value={form.note}
                    onChange={change}
                    placeholder="যেমন: বিকালে কল করুন"
                  />
                </label>
              </div>
            </section>

            <section className="co-card">
              <h3>পেমেন্ট মেথড</h3>
              <div className="pay-row">
                {PAYMENTS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`pay-opt ${payment === id ? 'on' : ''}`}
                    onClick={() => setPayment(id)}
                  >
                    <Icon size={17} />
                    {label}
                    {payment === id && <FiCheck size={14} className="pay-check" />}
                  </button>
                ))}
              </div>
              {(payment === 'bkash' || payment === 'nagad' || payment === 'rocket') && (
                <p className="co-pay-note">
                  {payment === 'bkash' && co.bkashNumber && (
                    <>বিকাশ (পার্সোনাল): <b>{co.bkashNumber}</b><br /></>
                  )}
                  {payment === 'nagad' && co.nagadNumber && (
                    <>নগদ (পার্সোনাল): <b>{co.nagadNumber}</b><br /></>
                  )}
                  {payment === 'rocket' && co.rocketNumber && (
                    <>রকেট: <b>{co.rocketNumber}</b><br /></>
                  )}
                  {co.paymentNote}
                </p>
              )}
            </section>
          </div>

          <aside className="co-summary">
            <h3>অর্ডার সারাংশ</h3>

            <div className="co-items">
              {items.map((item) => (
                <div key={item.id} className="co-item">
                  <span className="co-thumb">
                    <img src={productImage({ images: [item.image] }, 0)} alt="" />
                    <i>{item.quantity}</i>
                  </span>
                  <span className="co-it-name">{item.bn || item.name}</span>
                  <b>{formatMoney(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>

            {/* coupon */}
            <div className="co-coupon">
              {coupon ? (
                <div className="co-coupon-applied">
                  <span>
                    <FiTag size={14} /> {coupon.code}
                  </span>
                  <button type="button" onClick={removeCoupon} aria-label="কুপন সরান">
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="co-coupon-row">
                    <FiTag size={14} />
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyCoupon();
                        }
                      }}
                      placeholder="কুপন কোড"
                      aria-label="কুপন কোড"
                    />
                    <button type="button" onClick={applyCoupon}>
                      প্রয়োগ
                    </button>
                  </div>
                  {couponErr && <p className="co-coupon-err">{couponErr}</p>}
                </>
              )}
            </div>

            <div className="cs-row">
              <span>সাবটোটাল</span>
              <b>{formatMoney(total)}</b>
            </div>
            {discount > 0 && (
              <div className="cs-row">
                <span>ছাড়</span>
                <b className="cs-discount">-{formatMoney(discount)}</b>
              </div>
            )}
            <div className="cs-row">
              <span>ডেলিভারি</span>
              <b>{shipping === 0 ? 'ফ্রি' : formatMoney(shipping)}</b>
            </div>
            <div className="cs-total">
              <span>মোট প্রদেয়</span>
              <b>{formatMoney(grandTotal)}</b>
            </div>

            <button type="submit" className="btn-primary">
              <FiLock size={15} /> অর্ডার কনফার্ম করুন
            </button>
            <Link to="/cart" className="co-back">
              <FiArrowLeft size={14} /> কার্টে ফিরুন
            </Link>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
