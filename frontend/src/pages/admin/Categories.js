// Categories.js
import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => API.get('/categories').then(({ data }) => { setCategories(data.categories); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/categories/${editing}`, form);
        toast.success('Category updated');
      } else {
        await API.post('/categories', form);
        toast.success('Category created');
      }
      setForm({ name: '', description: '', sortOrder: 0 }); setEditing(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await API.delete(`/categories/${id}`); fetch(); toast.success('Deleted');
  };

  return (
    <div>
      <div className="page-header"><h1>Categories</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>{editing ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={save}>
            <div className="form-group"><label className="form-label">Name *</label><input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Sort Order</label><input className="form-control" type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Category'}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', sortOrder: 0 }); }} className="btn btn-outline">Cancel</button>}
            </div>
          </form>
        </div>
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
                  : categories.map((cat, i) => (
                  <tr key={cat._id}>
                    <td style={{ color: 'var(--text-light)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-mid)', fontSize: 13 }}>{cat.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditing(cat._id); setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0 }); }} className="btn btn-outline btn-sm">✏️</button>
                        <button onClick={() => del(cat._id, cat.name)} className="btn btn-danger btn-sm">🗑</button>
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
