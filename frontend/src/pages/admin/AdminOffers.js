import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const init = { title: '', code: '', type: 'percentage', value: '', minPurchase: 0, maxDiscount: '', usageLimit: '', startDate: '', endDate: '', isActive: true };

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(init);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => API.get('/offers').then(({ data }) => { setOffers(data.offers); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/offers/${editing}`, form); toast.success('Offer updated'); }
      else { await API.post('/offers', form); toast.success('Offer created'); }
      setForm(init); setEditing(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete offer?')) return;
    await API.delete(`/offers/${id}`); fetch(); toast.success('Deleted');
  };

  const f = (key, label, type = 'text', extra = {}) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-control" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} {...extra} />
    </div>
  );

  return (
    <div>
      <div className="page-header"><h1>Offers & Coupons</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>{editing ? 'Edit Offer' : 'Create Offer'}</h3>
          <form onSubmit={save}>
            {f('title', 'Title *', 'text', { required: true, placeholder: 'e.g. Summer Sale' })}
            {f('code', 'Coupon Code *', 'text', { required: true, placeholder: 'e.g. SAVE20', style: { textTransform: 'uppercase' } })}
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (Rs.)</option>
                </select>
              </div>
              {f('value', `Value (${form.type === 'percentage' ? '%' : 'Rs.'}) *`, 'number', { required: true, min: 0 })}
            </div>
            <div className="grid grid-2">
              {f('minPurchase', 'Min. Purchase (Rs.)', 'number', { min: 0 })}
              {f('maxDiscount', 'Max. Discount (Rs.)', 'number', { min: 0, placeholder: 'No limit' })}
            </div>
            <div className="grid grid-2">
              {f('startDate', 'Start Date', 'date')}
              {f('endDate', 'End Date', 'date')}
            </div>
            {f('usageLimit', 'Usage Limit', 'number', { min: 0, placeholder: 'Unlimited' })}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: 'var(--primary)' }} />
              Active
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(init); }} className="btn btn-outline">Cancel</button>}
            </div>
          </form>
        </div>
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                  : offers.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-mid)' }}>No offers yet</td></tr>
                  : offers.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{o.code}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{o.type}</td>
                    <td style={{ fontWeight: 600 }}>{o.type === 'percentage' ? `${o.value}%` : `Rs. ${o.value}`}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-mid)' }}>{o.usedCount}/{o.usageLimit || '∞'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-mid)' }}>{o.endDate ? new Date(o.endDate).toLocaleDateString() : '—'}</td>
                    <td>{o.isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditing(o._id); setForm({ title: o.title, code: o.code, type: o.type, value: o.value, minPurchase: o.minPurchase || 0, maxDiscount: o.maxDiscount || '', usageLimit: o.usageLimit || '', startDate: o.startDate?.slice(0, 10) || '', endDate: o.endDate?.slice(0, 10) || '', isActive: o.isActive }); }} className="btn btn-outline btn-sm">✏️</button>
                        <button onClick={() => del(o._id)} className="btn btn-danger btn-sm">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
