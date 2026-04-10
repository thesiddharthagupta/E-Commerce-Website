import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors = { pending: '#fef3c7:#92400e', confirmed: '#dbeafe:#1e40af', processing: '#ede9fe:#5b21b6', shipped: '#e0f2fe:#0c4a6e', delivered: '#dcfce7:#166534', cancelled: '#fee2e2:#991b1b' };
const badge = (s) => {
  const [bg, color] = (statusColors[s] || '#f1f5f9:#475569').split(':');
  return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{s}</span>;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    API.get(`/orders${params}`).then(({ data }) => { setOrders(data.orders); setLoading(false); });
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
      toast.success(`Order ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <div className="page-header"><h1>Orders</h1><p>Manage customer orders</p></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('')} className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-outline'}`}>All</button>
        {STATUSES.map(s => <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>{s}</button>)}
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                : orders.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-mid)' }}>No orders found</td></tr>
                : orders.map(order => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>#{order._id.slice(-8).toUpperCase()}</td>
                    <td>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{order.user?.name || 'Guest'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>{order.user?.email || order.guestEmail}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{order.items?.length} item(s)</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Rs. {order.total?.toLocaleString()}</td>
                    <td><span style={{ fontSize: 12, textTransform: 'capitalize', fontWeight: 600 }}>{order.paymentMethod}</span></td>
                    <td>{badge(order.orderStatus)}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-mid)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setExpanded(expanded === order._id ? null : order._id)} className="btn btn-outline btn-sm">👁</button>
                        <select value={order.orderStatus} onChange={e => updateStatus(order._id, e.target.value)}
                          style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                  {expanded === order._id && (
                    <tr>
                      <td colSpan={8} style={{ background: 'var(--bg-page)', padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          <div>
                            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Items:</p>
                            {order.items?.map((item, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
                                <img src={item.image || 'https://placehold.co/36x36/1d8dac/white?text=P'} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                                <div>
                                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                                  <div style={{ color: 'var(--text-mid)' }}>Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: 13 }}>
                            <p style={{ fontWeight: 700, marginBottom: 8 }}>Shipping:</p>
                            <p style={{ color: 'var(--text-mid)', lineHeight: 1.7 }}>
                              {order.shippingAddress?.name}<br />
                              {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                              {order.shippingAddress?.state}, {order.shippingAddress?.country}<br />
                              📞 {order.shippingAddress?.phone}
                            </p>
                            {order.notes && <p style={{ marginTop: 8 }}><strong>Notes:</strong> {order.notes}</p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
