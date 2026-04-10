import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, messages: 0, revenue: 0, pendingOrders: 0, reviews: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, msgsRes, reviewsRes] = await Promise.all([
          API.get('/products?limit=1'),
          API.get('/orders?limit=5'),
          API.get('/messages'),
          API.get('/reviews'),
        ]);
        const orders = ordersRes.data.orders || [];
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const pending = orders.filter(o => o.orderStatus === 'pending').length;
        setStats({
          products: productsRes.data.total || 0,
          orders: ordersRes.data.total || 0,
          messages: (msgsRes.data.messages || []).filter(m => !m.isRead).length,
          revenue,
          pendingOrders: pending,
          reviews: (reviewsRes.data.reviews || []).filter(r => !r.isApproved).length,
        });
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusBadge = (s) => {
    const map = { pending: '#fef3c7:#92400e', confirmed: 'var(--primary-light):var(--primary-dark)', delivered: '#dcfce7:#166534', cancelled: '#fee2e2:#991b1b', shipped: '#dbeafe:#1e40af' };
    const [bg, color] = (map[s] || '#f1f5f9:#475569').split(':');
    return <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your TechMart store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon="📦" label="Total Products" value={loading ? '...' : stats.products} color="primary" onClick={() => navigate('/admin/products')} />
        <StatCard icon="🛒" label="Total Orders" value={loading ? '...' : stats.orders} color="success" onClick={() => navigate('/admin/orders')} />
        <StatCard icon="💰" label="Total Revenue" value={loading ? '...' : `Rs. ${stats.revenue.toLocaleString()}`} color="warning" />
        <StatCard icon="✉️" label="Unread Messages" value={loading ? '...' : stats.messages} color="danger" onClick={() => navigate('/admin/messages')} />
      </div>

      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard icon="⏳" label="Pending Orders" value={loading ? '...' : stats.pendingOrders} color="warning" onClick={() => navigate('/admin/orders')} />
        <StatCard icon="⭐" label="Pending Reviews" value={loading ? '...' : stats.reviews} color="primary" onClick={() => navigate('/admin/reviews')} />
        <StatCard icon="🏪" label="Store Status" value="Active" color="success" />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Orders</h3>
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>View All →</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-mid)' }}>No orders yet</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>#{order._id.slice(-8).toUpperCase()}</td>
                  <td>{order.user?.name || order.guestEmail || 'Guest'}</td>
                  <td style={{ fontWeight: 700 }}>Rs. {order.total?.toLocaleString()}</td>
                  <td>{statusBadge(order.orderStatus)}</td>
                  <td style={{ color: 'var(--text-mid)', fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            ['/admin/products/new', '+ Add Product', 'primary'],
            ['/admin/categories', '+ Add Category', 'outline'],
            ['/admin/offers', '+ Create Offer', 'outline'],
            ['/admin/notices', '+ Post Notice', 'outline'],
          ].map(([path, label, variant]) => (
            <button key={path} onClick={() => navigate(path)} className={`btn btn-${variant}`}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
