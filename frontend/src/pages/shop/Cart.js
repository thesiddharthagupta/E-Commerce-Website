import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, shippingFee, total } = useCart();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponInfo, setCouponInfo] = useState(null);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      const { data } = await API.post('/offers/validate', { code: coupon, cartTotal: subtotal });
      setDiscount(data.discount);
      setCouponInfo(data.offer);
      toast.success(`Coupon applied! Rs. ${data.discount} discount`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplying(false);
    }
  };

  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '3rem' }}>
        <div style={{ fontSize: 80 }}>🛒</div>
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--text-mid)' }}>Add some products to get started!</p>
        <Link to="/shop" className="btn btn-primary btn-lg">Continue Shopping</Link>
      </main>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: '1.5rem' }}>Shopping Cart</h1>
          <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>🗑 Clear Cart</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div className="card">
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-mid)' }}>
              <span>Product</span><span style={{ textAlign: 'center' }}>Price</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'center' }}>Total</span><span />
            </div>
            {cart.map(item => (
              <div key={item.product} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={item.image || 'https://placehold.co/64x64/1d8dac/white?text=P'} alt={item.name}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexShrink: 0 }} />
                  <div>
                    <Link to={`/product/${item.slug}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</Link>
                    {item.salePrice && <div style={{ fontSize: 12, color: 'var(--text-light)', textDecoration: 'line-through', marginTop: 2 }}>Rs. {item.originalPrice?.toLocaleString()}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary-dark)' }}>Rs. {item.price.toLocaleString()}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.product, item.quantity - 1)}>−</button>
                    <input value={item.quantity} onChange={e => updateQuantity(item.product, parseInt(e.target.value) || 1)} />
                    <button onClick={() => updateQuantity(item.product, Math.min(item.quantity + 1, item.stock))}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                <button onClick={() => removeFromCart(item.product)} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: 18, padding: 4 }} title="Remove">✕</button>
              </div>
            ))}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-outline">← Continue Shopping</Link>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Coupon */}
            <div className="card card-body">
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: '0.75rem' }}>🏷 Coupon Code</p>
              {couponInfo ? (
                <div className="alert alert-success" style={{ marginBottom: 0 }}>
                  <span>✓ <strong>{couponInfo.code}</strong> applied — Rs. {discount.toLocaleString()} off!</span>
                  <button onClick={() => { setDiscount(0); setCouponInfo(null); setCoupon(''); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-control" placeholder="Enter code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} />
                  <button onClick={applyCoupon} disabled={applying} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    {applying ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="card card-body">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
              {[
                ['Subtotal', `Rs. ${subtotal.toLocaleString()}`],
                ['Shipping', shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee}`],
                ...(discount > 0 ? [['Discount', `-Rs. ${discount.toLocaleString()}`]] : []),
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: 14, color: 'var(--text-mid)' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 500, color: label === 'Discount' ? 'var(--success)' : label === 'Shipping' && shippingFee === 0 ? 'var(--success)' : 'var(--text-dark)' }}>{val}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
                <span>Total</span>
                <span>Rs. {(total - discount).toLocaleString()}</span>
              </div>
              {shippingFee > 0 && (
                <p style={{ fontSize: 12, color: 'var(--primary)', background: 'var(--primary-light)', padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  Add Rs. {(5000 - subtotal).toLocaleString()} more for FREE shipping!
                </p>
              )}
              <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-block btn-lg">Proceed to Checkout →</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
