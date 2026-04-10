import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CloseIcon, TrashIcon, CartIcon, ArrowRightIcon, TruckIcon } from './Icons';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, subtotal, shippingFee, total, isOpen, setIsOpen, cartCount } = useCart();
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <>
      <div onClick={() => setIsOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 400, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, width: 'min(420px, 100vw)', height: '100vh', background: '#fff', zIndex: 401, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)', animation: 'slideFromRight 0.25s ease' }}>

        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', background: 'var(--nav-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <CartIcon size={20} stroke="#fff" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Your Cart</span>
            {cartCount > 0 && (
              <span style={{ background: 'var(--accent)', color: 'var(--nav-accent-text, #0d1b2a)', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>{cartCount}</span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotal > 0 && subtotal < 5000 && (
          <div style={{ padding: '0.75rem 1.25rem', background: 'var(--accent-light)', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--accent-dark)', fontWeight: 600 }}>
              <TruckIcon size={14} /> Add Rs. {(5000 - subtotal).toLocaleString()} more for FREE shipping!
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((subtotal / 5000) * 100, 100)}%`, background: 'var(--primary)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CartIcon size={56} stroke="#e2e8f0" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-mid)', marginBottom: '1rem' }}>Your cart is empty</p>
              <button onClick={() => { setIsOpen(false); navigate('/shop'); }} className="btn btn-primary">Browse Products</button>
            </div>
          ) : cart.map(item => (
            <div key={item.product} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
              <img src={item.image || 'https://placehold.co/64x64/e6f5fd/109be0?text=P'} alt={item.name}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0, background: '#f8fafc' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>Rs. {item.price.toLocaleString()}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="qty-control" style={{ transform: 'scale(0.88)', transformOrigin: 'left center' }}>
                    <button onClick={() => updateQuantity(item.product, item.quantity - 1)}>−</button>
                    <input value={item.quantity} onChange={e => updateQuantity(item.product, parseInt(e.target.value) || 1)} style={{ width: 40, height: 32 }} />
                    <button onClick={() => updateQuantity(item.product, Math.min(item.quantity + 1, item.stock))}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                    <TrashIcon size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', background: '#fafafa' }}>
            {[['Subtotal', `Rs. ${subtotal.toLocaleString()}`], ['Shipping', shippingFee === 0 ? '🎉 FREE' : `Rs. ${shippingFee}`]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: 'var(--text-mid)' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600, color: label === 'Shipping' && shippingFee === 0 ? 'var(--success)' : 'var(--text-dark)' }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid var(--border)', marginTop: 4, fontSize: 17, fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
              <span>Total</span><span style={{ color: 'var(--primary-dark)' }}>Rs. {total.toLocaleString()}</span>
            </div>
            <button onClick={() => { setIsOpen(false); navigate('/checkout'); }} className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 8 }}>
              Checkout <ArrowRightIcon size={16} />
            </button>
            <button onClick={() => { setIsOpen(false); navigate('/cart'); }} className="btn btn-ghost btn-block btn-sm">
              View Full Cart
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes slideFromRight { from{transform:translateX(100%)} to{transform:none} }`}</style>
    </>
  );
}
