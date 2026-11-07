import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiShoppingBag, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { cartActions } from '../redux-state/CartState.js';
import { uiActions } from '../redux-state/UiState.js';
import { useCartWithProducts } from '../hooks/useCartWithProducts.js';
import { formatMoney, productImage } from '../utils/format.js';
import '../styles/CartDrawer.css';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.cartOpen);
  const { items, total } = useCartWithProducts();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) dispatch(uiActions.closeCart());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dispatch]);

  const close = () => dispatch(uiActions.closeCart());

  return (
    <>
      <div
        className={`cart-scrim ${open ? 'open' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={`cart-drawer ${open ? 'open' : ''}`}
        aria-label="শপিং কার্ট"
        aria-hidden={!open}
      >
        <div className="cd-head">
          <h3>
            <FiShoppingBag size={18} /> শপিং কার্ট
            <span>{items.length}</span>
          </h3>
          <button type="button" onClick={close} aria-label="বন্ধ করুন">
            <FiX size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cd-empty">
            <FiShoppingBag size={40} />
            <p>আপনার কার্ট খালি</p>
            <Link to="/products" className="btn-primary" onClick={close}>
              কেনাকাটা শুরু করুন
            </Link>
          </div>
        ) : (
          <>
            <div className="cd-items">
              {items.map((item) => (
                <div key={item.id} className="cd-item">
                  <Link to={`/product/${item.id}`} onClick={close} className="cd-thumb">
                    <img src={productImage({ images: [item.image] }, 0)} alt={item.bn} />
                  </Link>
                  <div className="cd-info">
                    <Link to={`/product/${item.id}`} onClick={close}>
                      {item.bn || item.name}
                    </Link>
                    <span className="cd-price">{formatMoney(item.price)}</span>
                    <div className="cd-qty">
                      <button
                        type="button"
                        onClick={() => dispatch(cartActions.removeItemFromCart(item.id))}
                        aria-label="কমান"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(cartActions.addItemToCart({ ...item, price: item.price }))
                        }
                        aria-label="বাড়ান"
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cd-del"
                    onClick={() => dispatch(cartActions.deleteItem(item.id))}
                    aria-label="সরান"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cd-foot">
              <div className="cd-row">
                <span>সাবটোটাল</span>
                <b>{formatMoney(total)}</b>
              </div>
              <p className="cd-note">ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>
              <Link to="/checkout" className="btn-primary" onClick={close}>
                চেকআউট করুন
              </Link>
              <button type="button" className="btn-ghost" onClick={close}>
                কেনাকাটা চালিয়ে যান
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
