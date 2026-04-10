import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const { data } = await API.get(`/products?${params}&isActive=all`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { toast.error('Failed to fetch products'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const toggleFeatured = async (id, current) => {
    try {
      await API.patch(`/products/${id}/feature`);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isFeatured: !current } : p));
      toast.success(current ? 'Removed from featured' : 'Marked as featured!');
    } catch { toast.error('Failed to update'); }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product removed');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Products <span style={{ fontSize: '1rem', color: 'var(--text-mid)', fontWeight: 400 }}>({total})</span></h1>
        </div>
        <button onClick={() => navigate('/admin/products/new')} className="btn btn-primary">+ Add Product</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input className="form-control" placeholder="🔍 Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 360 }} />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-mid)' }}>No products found</td></tr>
              ) : products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={p.images?.[0]?.url || 'https://placehold.co/44x44/1d8dac/white?text=P'} alt={p.name}
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{p.brand || '—'} · SKU: {p.sku || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.category?.name}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Rs. {(p.salePrice || p.price).toLocaleString()}</div>
                    {p.salePrice && <div style={{ fontSize: 11, color: 'var(--text-light)', textDecoration: 'line-through' }}>Rs. {p.price.toLocaleString()}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--danger)' : p.stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.isNewArrival && <span className="badge badge-new">New</span>}
                      {p.isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Hidden</span>}
                    </div>
                  </td>
                  <td>
                    <button onClick={() => toggleFeatured(p._id, p.isFeatured)}
                      style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'}>
                      {p.isFeatured ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(`/product/${p.slug}`)} className="btn btn-outline btn-sm" title="View on store">👁</button>
                      <button onClick={() => navigate(`/admin/products/edit/${p._id}`)} className="btn btn-outline btn-sm">✏️</button>
                      <button onClick={() => deleteProduct(p._id, p.name)} className="btn btn-danger btn-sm">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
