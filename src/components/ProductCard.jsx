import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { cartActions } from '../redux-state/CartState.js';
import { wishlistActions } from '../redux-state/WishlistState.js';
import { uiActions } from '../redux-state/UiState.js';
import { selectWishlist } from '../redux-state/Store.js';
import { formatMoney, productImage, productImages } from '../utils/format.js';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlist);
  const liked = wishlist.includes(product.id);
  const discount =
    product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  const addToCart = (e) => {
    e.preventDefault();
    dispatch(
      cartActions.addItemToCart({
        id: product.id,
        name: product.name,
        bn: product.bn,
        price: product.price,
        image: productImage(product, 0),
      })
    );
    dispatch(uiActions.showToast('কার্টে যোগ হয়েছে'));
    dispatch(uiActions.openCart());
  };

  const toggleWish = (e) => {
    e.preventDefault();
    dispatch(wishlistActions.toggleWishlist(product.id));
    dispatch(
      uiActions.showToast(liked ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'উইশলিস্টে যোগ হয়েছে')
    );
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="pc-media">
        <img src={productImage(product, 0)} alt={product.bn} loading="lazy" />
        {productImages(product)[1] && (
          <img
            className="pc-media-hover"
            src={productImage(product, 1)}
            alt=""
            loading="lazy"
          />
        )}
        <div className="pc-tags">
          {product.tag && <span className="pc-tag accent">{product.tag}</span>}
          {discount > 0 && <span className="pc-tag">-{discount}%</span>}
        </div>
        <button
          type="button"
          className={`pc-wish ${liked ? 'active' : ''}`}
          onClick={toggleWish}
          aria-label={liked ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যোগ করুন'}
        >
          <FiHeart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className="pc-body">
        <div className="pc-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              size={12}
              fill={i < product.rating ? 'currentColor' : 'none'}
              className={i < product.rating ? 'on' : 'off'}
            />
          ))}
          <span>({product.reviews})</span>
        </div>

        <Link to={`/product/${product.id}`} className="pc-name">
          {product.bn}
        </Link>

        <div className="pc-price-row">
          <b>{formatMoney(product.price)}</b>
          {product.oldPrice > product.price && (
            <s>{formatMoney(product.oldPrice)}</s>
          )}
        </div>

        <button type="button" className="pc-add" onClick={addToCart}>
          <FiShoppingBag size={15} /> কার্টে যোগ করুন
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
