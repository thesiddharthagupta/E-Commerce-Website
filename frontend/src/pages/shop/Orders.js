import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import API from '../../utils/api';

const STATUS_COLORS = { pending: 'warning', confirmed: 'primary', processing: 'primary', shipped: 'new', delivered: 'success', cancelled: 'danger' };
const statusBadge = (s) => {
  const map = { pending: '#fef3c7:#92400e', confirmed: 'var(--primary-light):var(--primary-dark)', processing: '#dbeafe:#1e40af', shipped: '#f0f9ff:#0c4a6e', delivered: '#dcfce7:#166534', cancelled: '#fee2e2:#991b1b' };
  const [bg, color] = (map[s] || 'var(--border):var(--text-mid)').split(':');
  return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{s}</span>;
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get('/orders/my').then(({ data }) => { setOrders(data.orders); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className="loading-center"><div className="spinner" /></div>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Orders</h1>
        {orders.length === 0 ? (
          <div className="card card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: 60, marginBottom: '1rem' }}>📦</div>
            <h3>No orders yet</h3>
            <p style={{ color: 'var(--text-mid)', marginTop: 8 }}>Your orders will appear here after you make a purchase.</p>
          </div>
        ) : orders.map(order => (
          <div key={order._id} className="card" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, background: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>Order ID: </span>
                <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                {statusBadge(order.orderStatus)}
                <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>Rs. {order.total?.toLocaleString()}</span>
                <button onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {expanded === order._id ? 'Hide ▲' : 'Details ▼'}
                </button>
              </div>
            </div>
            {expanded === order._id && (
              <div style={{ padding: '1.25rem 1.5rem' }}>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <img src={item.image || 'https://placehold.co/52x52/1d8dac/white?text=P'} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: 13 }}>
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Shipping Address</p>
                    <p style={{ color: 'var(--text-mid)' }}>{order.shippingAddress?.name}<br />{order.shippingAddress?.street}, {order.shippingAddress?.city}<br />{order.shippingAddress?.country}</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Payment</p>
                    <p style={{ color: 'var(--text-mid)', textTransform: 'capitalize' }}>{order.paymentMethod} — {order.paymentStatus}</p>
                    {order.trackingNumber && <p style={{ marginTop: 4 }}>Tracking: <strong>{order.trackingNumber}</strong></p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
}
