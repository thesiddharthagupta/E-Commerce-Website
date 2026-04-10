import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function Checkout() {
  const { cart, subtotal, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', street: '', city: '', state: '', zip: '', country: 'Nepal', phone: user?.phone || '',
    paymentMethod: 'cash', notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const orderData = {
        items: cart.map(i => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: { name: form.name, street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country, phone: form.phone },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      };
      const { data } = await API.post('/orders', orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '', required = true) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      <input className="form-control" type={type} required={required} placeholder={placeholder}
        value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
            {/* Shipping Form */}
            <div>
              <div className="card card-body" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>📦 Shipping Address</h3>
                <div className="grid grid-2">
                  {field('name', 'Full Name', 'text', 'John Doe')}
                  {field('phone', 'Phone Number', 'tel', '+977-98XXXXXXXX')}
                </div>
                {field('street', 'Street Address', 'text', 'Thamel, Kathmandu')}
                <div className="grid grid-2">
                  {field('city', 'City', 'text', 'Kathmandu')}
                  {field('state', 'Province', 'text', 'Bagmati')}
                </div>
                <div className="grid grid-2">
                  {field('zip', 'ZIP Code', 'text', '44600', false)}
                  {field('country', 'Country', 'text', 'Nepal')}
                </div>
              </div>

              <div className="card card-body" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>💳 Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    ['cash', '💵 Cash on Delivery', 'Pay when your order arrives'],
                    ['card', '💳 Card Payment', 'Credit / Debit card'],
                    ['esewa', '📱 eSewa', 'Pay via eSewa digital wallet'],
                    ['khalti', '🔷 Khalti', 'Pay via Khalti wallet'],
                  ].map(([val, label, sub]) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', border: `1.5px solid ${form.paymentMethod === val ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: form.paymentMethod === val ? 'var(--primary-light)' : 'white' }}>
                      <input type="radio" name="payment" value={val} checked={form.paymentMethod === val} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} style={{ accentColor: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>{sub}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card card-body">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '0.75rem' }}>📝 Order Notes</h3>
                <textarea className="form-control" placeholder="Special instructions or delivery notes (optional)" rows={3}
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="card card-body" style={{ position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
              <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: '1rem' }}>
                {cart.map(item => (
                  <div key={item.product} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <img src={item.image || 'https://placehold.co/48x48/1d8dac/white?text=P'} alt={item.name}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)', flexShrink: 0 }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                {[['Subtotal', subtotal], ['Shipping', shippingFee === 0 ? 'FREE' : shippingFee]].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: 14, color: 'var(--text-mid)' }}>
                    <span>{label}</span>
                    <span style={{ color: val === 'FREE' ? 'var(--success)' : 'var(--text-dark)', fontWeight: 500 }}>
                      {val === 'FREE' ? 'FREE' : `Rs. ${val.toLocaleString()}`}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid var(--border)', marginTop: '0.5rem', fontSize: 17, fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  <span>Total</span><span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
              <button type="submit" disabled={placing || cart.length === 0} className="btn btn-primary btn-block btn-lg">
                {placing ? '⏳ Placing Order...' : '✓ Place Order'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'center', marginTop: '0.75rem' }}>🔒 Your information is secure and encrypted</p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
