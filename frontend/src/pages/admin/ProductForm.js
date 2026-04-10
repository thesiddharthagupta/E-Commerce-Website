import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const initialForm = {
  name: '', brand: '', description: '', shortDescription: '', category: '',
  price: '', salePrice: '', sku: '', stock: '', warranty: '',
  isFeatured: false, isNewArrival: false, isActive: true,
  specifications: [{ key: '', value: '' }],
  features: [''],
  tags: '',
};

const Section = ({ title, children }) => (
  <div className="card card-body" style={{ marginBottom: '1.25rem' }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>{title}</h3>
    {children}
  </div>
);

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    API.get('/categories').then(({ data }) => setCategories(data.categories));
    if (id) {
      API.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        const tagsRaw = Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',') : []);
        setForm({
          name: p.name, brand: p.brand || '', description: p.description,
          shortDescription: p.shortDescription || '', category: p.category?._id || '',
          price: p.price, salePrice: p.salePrice || '', sku: p.sku || '', stock: p.stock,
          warranty: p.warranty || '', isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, isActive: p.isActive,
          specifications: p.specifications?.length ? p.specifications : [{ key: '', value: '' }],
          features: p.features?.length ? p.features : [''],
          tags: tagsRaw.map(t => t.trim()).filter(Boolean).join(', '),
        });
        setPreviews(p.images?.map(i => i.url) || []);
        setFetching(false);
      }).catch(() => { toast.error('Failed to load product'); navigate('/admin/products'); });
    }
  }, [id]);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addSpec = () => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const removeSpec = (i) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));
  const setSpec = (i, field, val) => setForm(f => ({ ...f, specifications: f.specifications.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));

  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (i) => setForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const setFeature = (i, val) => setForm(f => ({ ...f, features: f.features.map((feat, idx) => idx === i ? val : feat) }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'specifications' || key === 'features') {
          fd.append(key, JSON.stringify(typeof val === 'string' ? val : val));
        } else {
          fd.append(key, val);
        }
      });
      fd.set('specifications', JSON.stringify(form.specifications.filter(s => s.key)));
      fd.set('features', JSON.stringify(form.features.filter(Boolean)));
      fd.set('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      images.forEach(img => fd.append('images', img));

      if (id) {
        await API.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await API.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to save product. Check required fields or unique SKU.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-center"><div className="spinner" /></div>;


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <button onClick={() => navigate('/admin/products')} className="btn btn-outline">← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
          {/* Main */}
          <div>
            <Section title="Basic Information">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  id="product-name"
                  className="form-control" 
                  required 
                  autoFocus 
                  value={form.name} 
                  onChange={e => setField('name', e.target.value)} 
                  placeholder="e.g. MacBook Pro 14 M3" 
                  style={{ position: 'relative', zIndex: 1 }}
                />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-control" value={form.brand} onChange={e => setField('brand', e.target.value)} placeholder="e.g. Apple" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-control" required value={form.category} onChange={e => setField('category', e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input className="form-control" value={form.shortDescription} onChange={e => setField('shortDescription', e.target.value)} placeholder="Brief product summary (shown on cards)" />
              </div>
              <div className="form-group">
                <label className="form-label">Full Description *</label>
                <textarea className="form-control" required rows={5} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Detailed product description..." />
              </div>
            </Section>

            <Section title="Pricing & Inventory">
              <div className="grid grid-2">
                <div className="form-group"><label className="form-label">Regular Price (Rs.) *</label><input className="form-control" type="number" required min="0" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="0" /></div>
                <div className="form-group"><label className="form-label">Sale Price (Rs.)</label><input className="form-control" type="number" min="0" value={form.salePrice} onChange={e => setField('salePrice', e.target.value)} placeholder="Leave blank for no sale" /></div>
                <div className="form-group"><label className="form-label">SKU</label><input className="form-control" value={form.sku} onChange={e => setField('sku', e.target.value)} placeholder="e.g. MBP14M3" /></div>
                <div className="form-group"><label className="form-label">Stock Quantity *</label><input className="form-control" type="number" required min="0" value={form.stock} onChange={e => setField('stock', e.target.value)} placeholder="0" /></div>
              </div>
              <div className="form-group"><label className="form-label">Warranty</label><input className="form-control" value={form.warranty} onChange={e => setField('warranty', e.target.value)} placeholder="e.g. 1 Year Manufacturer Warranty" /></div>
            </Section>

            <Section title="Key Features">
              {form.features.map((feat, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="form-control" value={feat} onChange={e => setFeature(i, e.target.value)} placeholder={`Feature ${i + 1}`} />
                  <button type="button" onClick={() => removeFeature(i)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0 }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addFeature} className="btn btn-outline btn-sm">+ Add Feature</button>
            </Section>

            <Section title="Specifications">
              {form.specifications.map((spec, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                  <input className="form-control" value={spec.key} onChange={e => setSpec(i, 'key', e.target.value)} placeholder="e.g. Processor" />
                  <input className="form-control" value={spec.value} onChange={e => setSpec(i, 'value', e.target.value)} placeholder="e.g. Apple M3" />
                  <button type="button" onClick={() => removeSpec(i)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: 'var(--danger)' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addSpec} className="btn btn-outline btn-sm">+ Add Spec</button>
            </Section>

            <Section title="Tags">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-control" value={form.tags} onChange={e => setField('tags', e.target.value)} placeholder="e.g. laptop, apple, macbook, m3" />
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 80 }}>
            <Section title="Product Images">
              <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} id="img-upload" />
              <label htmlFor="img-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '1.5rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '0.75rem', background: 'var(--bg-page)' }}>
                <span style={{ fontSize: 32 }}>📸</span>
                <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>Click to upload images</span>
                <span style={{ fontSize: 11, color: 'var(--text-light)' }}>JPG, PNG, WEBP up to 5MB each</span>
              </label>
              {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 8, border: `2px solid ${i === 0 ? 'var(--primary)' : 'var(--border)'}` }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '2px' }}>PRIMARY</div>}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Product Status">
              {[
                ['isActive', '✅ Active (visible in store)'],
                ['isFeatured', '⭐ Featured on homepage'],
                ['isNewArrival', '🆕 Mark as New Arrival'],
              ].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setField(key, e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                  {label}
                </label>
              ))}
            </Section>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 8 }}>
              {loading ? '⏳ Saving...' : id ? '✓ Update Product' : '✓ Create Product'}
            </button>
            <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-outline btn-block">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
