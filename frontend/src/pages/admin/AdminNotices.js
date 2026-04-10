import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const init = { title: '', content: '', type: 'info', showOnHomepage: false, isActive: true, startDate: '', endDate: '' };

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(init);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => API.get('/notices').then(({ data }) => { setNotices(data.notices); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/notices/${editing}`, form); toast.success('Updated'); }
      else { await API.post('/notices', form); toast.success('Notice created'); }
      setForm(init); setEditing(null); fetch();
    } catch { toast.error('Failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete notice?')) return;
    await API.delete(`/notices/${id}`); fetch(); toast.success('Deleted');
  };

  const typeColors = { info: 'primary', warning: 'warning', success: 'success', promo: 'accent' };

  return (
    <div>
      <div className="page-header"><h1>Notices & Announcements</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>{editing ? 'Edit Notice' : 'New Notice'}</h3>
          <form onSubmit={save}>
            <div className="form-group"><label className="form-label">Title *</label><input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Content *</label><textarea className="form-control" required rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['info', 'warning', 'success', 'promo'].map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-control" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            {[['showOnHomepage', '🏠 Show on homepage'], ['isActive', '✅ Active']].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} style={{ accentColor: 'var(--primary)' }} />
                {label}
              </label>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(init); }} className="btn btn-outline">Cancel</button>}
            </div>
          </form>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? <div className="loading-center"><div className="spinner" /></div>
            : notices.length === 0 ? <div className="card card-body" style={{ textAlign: 'center', color: 'var(--text-mid)' }}>No notices yet</div>
            : notices.map(notice => (
            <div key={notice._id} className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge badge-${typeColors[notice.type] || 'primary'}`}>{notice.type}</span>
                  {notice.showOnHomepage && <span className="badge badge-primary">Homepage</span>}
                  {!notice.isActive && <span className="badge badge-danger">Inactive</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditing(notice._id); setForm({ title: notice.title, content: notice.content, type: notice.type, showOnHomepage: notice.showOnHomepage, isActive: notice.isActive, endDate: notice.endDate?.slice(0, 10) || '' }); }} className="btn btn-outline btn-sm">✏️</button>
                  <button onClick={() => del(notice._id)} className="btn btn-danger btn-sm">🗑</button>
                </div>
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{notice.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-mid)' }}>{notice.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
