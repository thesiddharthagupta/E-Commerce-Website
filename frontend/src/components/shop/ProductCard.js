import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CartIcon, HeartIcon, ArrowRightIcon, StarIcon } from '../common/Icons';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  if (!product) return null;

  const price    = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const inCart   = cart.some(i => i.product === product._id);
  const stars    = Math.round(product.ratings?.average || 0);

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug}`)}>
      {/* Image */}
      <div className="img-wrap">
        <img
          src={product.images?.[0]?.url || `https://placehold.co/300x300/e6f5fd/109be0?text=${encodeURIComponent(product.brand||'Product')}`}
          alt={product.name} loading="lazy"
          onError={e => { e.target.src = `https://placehold.co/300x300/f1f5f9/64748b?text=${encodeURIComponent(product.name?.slice(0,10)||'')}`; }}
        />
        {/* Badges */}
        <div className="badges">
          {discount >= 5 && <span className="badge badge-danger">-{discount}%</span>}
          {product.isNewArrival && <span className="badge badge-new">New</span>}
          {product.stock === 0 && <span className="badge badge-dark">Out of Stock</span>}
          {product.stock > 0 && product.stock <= 3 && <span className="badge badge-warning">Only {product.stock}!</span>}
        </div>
        {/* Wishlist */}
        <button className="wishlist-btn" onClick={e => e.stopPropagation()} title="Add to wishlist">
          <HeartIcon size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="card-info">
        <div className="brand-tag">{product.brand || product.category?.name}</div>
        <div className="prod-name">{product.name}</div>
        {product.ratings?.count > 0 && (
          <div className="rating-row">
            <div className="stars" style={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon key={i} size={12} filled={i <= stars} />
              ))}
            </div>
            <span className="rating-count">({product.ratings.count.toLocaleString()})</span>
          </div>
        )}
        {product.shortDescription && (
          <div style={{ fontSize: 12, color: 'var(--text-light)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.shortDescription}
          </div>
        )}
        <div className="price-row">
          {product.salePrice ? (
            <>
              <span className="price">Rs. {product.salePrice.toLocaleString()}</span>
              <span className="old-price">Rs. {product.price.toLocaleString()}</span>
              <span className="discount-tag">-{discount}%</span>
            </>
          ) : (
            <span className="price">Rs. {product.price.toLocaleString()}</span>
          )}
        </div>
        {product.stock > 0 && (
          <div className="stock-ok" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, background: 'var(--success)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
            In Stock
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button
          className="btn btn-primary btn-sm btn-block"
          onClick={e => { e.stopPropagation(); addToCart(product); }}
          disabled={product.stock === 0}
          style={{ fontSize: 13, gap: 6 }}>
          <CartIcon size={14} stroke="#fff" />
          {product.stock === 0 ? 'Out of Stock' : inCart ? 'Added ✓' : 'Add to Cart'}
        </button>
        <button
          className="btn btn-ghost btn-sm btn-block"
          onClick={e => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
          style={{ fontSize: 13, color: 'var(--primary)', gap: 4 }}>
          Read More <ArrowRightIcon size={13} />
        </button>
      </div>
    </div>
  );
}
