import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/shop/ProductCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const Stars = ({ rating, size = 16, onChange }) => (
  <div style={{ display: 'flex', gap: 3, cursor: onChange ? 'pointer' : 'default' }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} onClick={() => onChange && onChange(i)}
        style={{ fontSize: size, color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.15s' }}>★</span>
    ))}
  </div>
);

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    color: active ? 'var(--primary)' : 'var(--text-mid)',
    borderBottom: `2px solid ${active ? 'var(--primary)' : 'transparent'}`,
    transition: 'all 0.2s'
  }}>{children}</button>
);

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, removeFromCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const inCart = product ? cart.find(i => i.product === product._id) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${slug}`);
        setProduct(data.product);
        // Fetch related & reviews
        const [relRes, revRes] = await Promise.all([
          API.get(`/products?category=${data.product.category._id}&limit=4`),
          API.get(`/reviews/product/${data.product._id}`),
        ]);
        setRelated(relRes.data.products.filter(p => p._id !== data.product._id).slice(0, 4));
        setReviews(revRes.data.reviews);
      } catch (err) {
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (inCart) {
      removeFromCart(product._id);
    } else {
      addToCart(product, quantity);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await API.post('/reviews', { product: product._id, ...reviewForm });
      toast.success('Review submitted for approval!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      // Refresh reviews
      const { data } = await API.get(`/reviews/product/${product._id}`);
      setReviews(data.reviews);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className="loading-center"><div className="spinner" /></div>
      <Footer />
    </div>
  );
  if (!product) return null;

  const price = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const images = product.images?.length ? product.images : [{ url: `https://placehold.co/600x450/1d8dac/white?text=${encodeURIComponent(product.name)}`, alt: product.name }];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-mid)', marginBottom: '1.5rem' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--primary)' }}>Home</span>
          <span>/</span>
          <span onClick={() => navigate('/shop')} style={{ cursor: 'pointer', color: 'var(--primary)' }}>Shop</span>
          <span>/</span>
          <span onClick={() => navigate(`/shop?category=${product.category._id}`)} style={{ cursor: 'pointer', color: 'var(--primary)' }}>{product.category.name}</span>
          <span>/</span>
          <span style={{ color: 'var(--text-dark)' }}>{product.name}</span>
        </div>

        {/* Product Main */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>

          {/* Image Gallery */}
          <div>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '0.75rem', position: 'relative' }}>
              <img src={images[selectedImage]?.url} alt={product.name}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'contain', padding: '1.5rem' }} />
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.isNew && <span className="badge badge-new">New</span>}
                {product.isFeatured && <span className="badge badge-primary">⭐ Featured</span>}
                {discount > 0 && <span className="badge badge-accent">-{discount}% OFF</span>}
                {product.stock === 0 && <span className="badge badge-danger">Out of Stock</span>}
                {product.stock > 0 && product.stock <= 5 && <span className="badge badge-warning">Only {product.stock} left!</span>}
              </div>
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', border: `2px solid ${i === selectedImage ? 'var(--primary)' : 'var(--border)'}`, background: 'white', padding: 4, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{product.brand}</div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{product.name}</h1>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <Stars rating={product.ratings.average} />
                <span style={{ fontSize: 14, color: 'var(--text-mid)' }}>{product.ratings.average} ({product.ratings.count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '1rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>Rs. {price.toLocaleString()}</span>
              {product.salePrice && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>Rs. {product.price.toLocaleString()}</span>
                  <span className="badge badge-accent" style={{ fontSize: 13 }}>Save {discount}%</span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: '1rem', lineHeight: 1.6 }}>{product.shortDescription}</p>
            )}

            {/* Key Features */}
            {product.features?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Key Features</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {product.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-mid)' }}>
                      <span style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock & SKU */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-mid)' }}>Status: </span>
                <span style={{ fontWeight: 600, color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock} units)` : '✗ Out of Stock'}
                </span>
              </div>
              {product.sku && <div><span style={{ color: 'var(--text-mid)' }}>SKU: </span><span style={{ fontWeight: 600 }}>{product.sku}</span></div>}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', width: 80 }}>Quantity</span>
                <div className="qty-control">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <input value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.stock)))} />
                  <button onClick={() => setQuantity(q => Math.min(q + 1, product.stock))}>+</button>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Max: {product.stock}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-lg ${inCart ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ flex: 1, minWidth: 160 }}
              >
                {inCart ? '🗑 Remove from Cart' : '🛒 Add to Cart'}
              </button>
              <button className="btn btn-accent btn-lg" style={{ flex: 1, minWidth: 160 }}
                onClick={() => { addToCart(product, quantity); navigate('/checkout'); }}>
                ⚡ Buy Now
              </button>
            </div>

            {/* Wishlist */}
            <button className="btn btn-outline btn-block" style={{ marginBottom: '1.25rem' }}>♡ Add to Wishlist</button>

            {/* Meta Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {product.warranty && (
                <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span>🛡</span><div><div style={{ fontWeight: 600 }}>Warranty</div><div style={{ color: 'var(--text-mid)', fontSize: 12 }}>{product.warranty}</div></div>
                </div>
              )}
              <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span>🚚</span><div><div style={{ fontWeight: 600 }}>Free Shipping</div><div style={{ color: 'var(--text-mid)', fontSize: 12 }}>On orders above Rs. 5,000</div></div>
              </div>
              <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span>🔄</span><div><div style={{ fontWeight: 600 }}>7-Day Return</div><div style={{ color: 'var(--text-mid)', fontSize: 12 }}>Easy returns policy</div></div>
              </div>
              <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span>✅</span><div><div style={{ fontWeight: 600 }}>Genuine Product</div><div style={{ color: 'var(--text-mid)', fontSize: 12 }}>100% authentic</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2.5rem', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto' }}>
            <TabBtn active={tab === 'description'} onClick={() => setTab('description')}>Description</TabBtn>
            <TabBtn active={tab === 'specs'} onClick={() => setTab('specs')}>Specifications</TabBtn>
            <TabBtn active={tab === 'reviews'} onClick={() => setTab('reviews')}>Reviews ({reviews.length})</TabBtn>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Description Tab */}
            {tab === 'description' && (
              <div>
                <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{product.description}</p>
                {product.features?.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 16, marginBottom: '1rem' }}>Product Features</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                      {product.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specs Tab */}
            {tab === 'specs' && (
              <div>
                {product.specifications?.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-page)' : 'white' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 14, color: 'var(--text-dark)', width: '35%', borderBottom: '1px solid var(--border)' }}>{spec.key}</td>
                          <td style={{ padding: '10px 16px', fontSize: 14, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' }}>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: 'var(--text-mid)' }}>No specifications available.</p>}
              </div>
            )}

            {/* Reviews Tab */}
            {tab === 'reviews' && (
              <div>
                {/* Review summary */}
                {reviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>{product.ratings?.average || 0}</div>
                      <Stars rating={product.ratings?.average || 0} size={20} />
                      <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>{reviews.length} reviews</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      {[5,4,3,2,1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const pct = reviews.length ? (count / reviews.length * 100) : 0;
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 13, width: 12, textAlign: 'right' }}>{star}</span>
                            <span style={{ color: '#f59e0b', fontSize: 13 }}>★</span>
                            <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4, transition: 'width 0.5s' }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-mid)', width: 24 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Review list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {reviews.length === 0 ? (
                    <p style={{ color: 'var(--text-mid)', textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first to review this product!</p>
                  ) : reviews.map(review => (
                    <div key={review._id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>
                            {review.user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{review.user?.name || 'Anonymous'}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <Stars rating={review.rating} />
                      </div>
                      {review.title && <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{review.title}</p>}
                      <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6 }}>{review.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write review form */}
                <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: 16, marginBottom: '1rem' }}>Write a Review</h3>
                  {!user ? (
                    <div className="alert alert-info">Please <button onClick={() => navigate('/login')} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>login</button> to write a review.</div>
                  ) : (
                    <form onSubmit={handleSubmitReview}>
                      <div className="form-group">
                        <label className="form-label">Your Rating</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1,2,3,4,5].map(star => (
                            <span key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                              style={{ fontSize: 28, cursor: 'pointer', color: star <= reviewForm.rating ? '#f59e0b' : '#e2e8f0', transition: 'color 0.15s' }}>★</span>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Review Title</label>
                        <input className="form-control" placeholder="Summarize your experience" value={reviewForm.title}
                          onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Your Review *</label>
                        <textarea className="form-control" required rows={4} placeholder="Tell others about your experience with this product..."
                          value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Related Products</h2>
            <div className="grid grid-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
