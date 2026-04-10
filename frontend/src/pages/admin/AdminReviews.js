// AdminReviews.js
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => API.get('/reviews').then(({ data }) => { setReviews(data.reviews); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const toggle = async (id) => {
    await API.patch(`/reviews/${id}/approve`);
    setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: !r.isApproved } : r));
    toast.success('Review status updated');
  };

  const del = async (id) => {
    if (!window.confirm('Delete review?')) return;
    await API.delete(`/reviews/${id}`); fetch(); toast.success('Deleted');
  };

  return (
    <div>
      <div className="page-header"><h1>Reviews</h1><p>Approve and manage product reviews</p></div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                : reviews.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-mid)' }}>No reviews yet</td></tr>
                : reviews.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{r.product?.name || 'Unknown'}</td>
                  <td style={{ fontSize: 13 }}>{r.user?.name || 'Anonymous'}</td>
                  <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(r.rating)}<span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - r.rating)}</span></span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-mid)', maxWidth: 250 }}>
                    {r.title && <strong style={{ display: 'block', marginBottom: 2 }}>{r.title}</strong>}
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.comment}</span>
                  </td>
                  <td>{r.isApproved ? <span className="badge badge-success">Approved</span> : <span className="badge badge-warning">Pending</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggle(r._id)} className={`btn btn-sm ${r.isApproved ? 'btn-outline' : 'btn-primary'}`}>{r.isApproved ? 'Hide' : 'Approve'}</button>
                      <button onClick={() => del(r._id)} className="btn btn-danger btn-sm">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
