import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { wishlistActions } from '../redux-state/WishlistState.js';
import { selectWishlist } from '../redux-state/Store.js';
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import '../styles/Wishlist.css';

const Wishlist = () => {
  const dispatch = useDispatch();
  const ids = useSelector(selectWishlist);
  const { products } = useProducts();
  const list = products.filter((p) => ids.includes(p.id));

  if (list.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <nav className="crumbs">
            <Link to="/">হোম</Link>
            <span>/</span>
            <span>উইশলিস্ট</span>
          </nav>
          <div className="cart-empty">
            <FiHeart size={52} />
            <h1>উইশলিস্ট খালি</h1>
            <p>পছন্দের পণ্যে হৃদয় আইকনে ক্লিক করে সেভ করুন।</p>
            <Link to="/products" className="btn-primary">
              পণ্য দেখুন <FiArrowRight size={15} />
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
          <span>উইশলিস্ট</span>
        </nav>

        <div className="page-head">
          <div>
            <h1>উইশলিস্ট</h1>
            <p>{list.length}টি পণ্য সেভ করা আছে</p>
          </div>
          <button
            type="button"
            className="clear-cart"
            onClick={() => dispatch(wishlistActions.clearWishlist())}
          >
            <FiTrash2 size={14} /> সব সরান
          </button>
        </div>

        <div className="prod-grid">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
