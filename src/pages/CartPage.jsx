import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { cartActions } from '../redux-state/CartState.js';
import { useCartWithProducts } from '../hooks/useCartWithProducts.js';
import { formatMoney, productImage } from '../utils/format.js';
import '../styles/CartPage.css';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, total } = useCartWithProducts();
  const shipping = total > 0 ? (total >= 2000 ? 0 : 80) : 0;

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <nav className="crumbs">
            <Link to="/">হোম</Link>
            <span>/</span>
            <span>কার্ট</span>
          </nav>
          <div className="cart-empty">
            <FiShoppingBag size={52} />
            <h1>আপনার কার্ট খালি</h1>
            <p>পছন্দের পণ্য যোগ করে কেনাকাটা শুরু করুন।</p>
            <Link to="/products" className="btn-primary">
              কেনাকাটা শুরু করুন <FiArrowRight size={15} />
            </Link>
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
          <span>কার্ট</span>
        </nav>

        <div className="page-head">
          <div>
            <h1>শপিং কার্ট</h1>
            <p>{items.length}টি পণ্য কার্টে আছে</p>
          </div>
          <button
            type="button"
            className="clear-cart"
            onClick={() => dispatch(cartActions.clearCart())}
          >
            <FiTrash2 size={14} /> কার্ট খালি করুন
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <div key={item.id} className="cart-row">
                <Link to={`/product/${item.id}`} className="cr-img">
                  <img src={productImage({ images: [item.image] }, 0)} alt={item.bn} />
                </Link>

                <div className="cr-info">
                  <Link to={`/product/${item.id}`} className="cr-name">
                    {item.bn || item.name}
                  </Link>
                  <p className="cr-unit">প্রতি ইউনিট {formatMoney(item.price)}</p>
                  <div className="cr-qty">
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
                        dispatch(
                          cartActions.addItemToCart({
                            id: item.id,
                            name: item.name,
                            bn: item.bn,
                            price: item.price,
                            image: item.image,
                          })
                        )
                      }
                      aria-label="বাড়ান"
                    >
                      <FiPlus size={13} />
                    </button>
                  </div>
                </div>

                <div className="cr-right">
                  <b>{formatMoney(item.price * item.quantity)}</b>
                  <button
                    type="button"
                    className="cr-del"
                    onClick={() => dispatch(cartActions.deleteItem(item.id))}
                    aria-label="সরান"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>অর্ডার সারাংশ</h3>
            <div className="cs-row">
              <span>সাবটোটাল</span>
              <b>{formatMoney(total)}</b>
            </div>
            <div className="cs-row">
              <span>ডেলিভারি</span>
              <b>{shipping === 0 ? 'ফ্রি' : formatMoney(shipping)}</b>
            </div>
            {shipping > 0 && (
              <p className="cs-hint">
                {formatMoney(2000 - total)} আরও কিনলে ডেলিভারি ফ্রি!
              </p>
            )}
            <div className="cs-total">
              <span>মোট</span>
              <b>{formatMoney(total + shipping)}</b>
            </div>
            <Link to="/checkout" className="btn-primary">
              চেকআউট করুন <FiArrowRight size={15} />
            </Link>
            <Link to="/products" className="btn-ghost">
              কেনাকাটা চালিয়ে যান
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
