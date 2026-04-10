import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/shop/ProductCard';
import API from '../../utils/api';

const CAT_ICONS = {Laptops:'💻',Smartphones:'📱',Tablets:'📟',Audio:'🎧',Cameras:'📷',Accessories:'🔌',Gaming:'🎮','Smart Home':'🏠',Peripherals:'🖱','Smart Watches':'⌚'};

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page     = parseInt(sp.get('page'))||1;
  const search   = sp.get('search')||'';
  const catname  = sp.get('catname')||'';
  const catid    = sp.get('category')||'';
  const sort     = sp.get('sort')||'newest';
  const minPrice = sp.get('minPrice')||'';
  const maxPrice = sp.get('maxPrice')||'';
  const featured = sp.get('featured')||'';
  const isNew    = sp.get('isNewArrival')||'';

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories||[])).catch(()=>{});
  }, []);

  useEffect(() => {
    window.scrollTo(0,0);
    setLoading(true);
    const params = new URLSearchParams({ page, limit:20, sort });
    if (search)   params.set('search',  search);
    if (catid)    params.set('category', catid);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (featured) params.set('featured', featured);
    if (isNew)    params.set('isNewArrival',    isNew);

    // Resolve catname to id
    const fetchProducts = async () => {
      try {
        let finalParams = params;
        if (catname && categories.length) {
          const cat = categories.find(c => c.name.toLowerCase() === catname.toLowerCase());
          if (cat) finalParams.set('category', cat._id);
        }
        const { data } = await API.get(`/products?${finalParams}`);
        setProducts(data.products||[]);
        setTotal(data.total||0);
        setPages(data.pages||1);
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [page, search, catname, catid, sort, minPrice, maxPrice, featured, isNew, categories.length]);

  const setP = (k, v) => { const p = new URLSearchParams(sp); v ? p.set(k,v) : p.delete(k); p.delete('page'); setSp(p); };
  const setPage = p => { const params = new URLSearchParams(sp); params.set('page',p); setSp(params); };
  const activeCat = catname || (catid && categories.find(c=>c._id===catid)?.name) || '';

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Header />
      {/* Breadcrumb */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'8px 0', fontSize:13 }}>
        <div className="container" style={{ display:'flex', gap:6, alignItems:'center', color:'var(--text-mid)', flexWrap:'wrap' }}>
          <Link to="/" style={{ color:'#007185' }}>Home</Link> <span>›</span>
          <Link to="/shop" style={{ color:'#007185' }}>Shop</Link>
          {activeCat && <><span>›</span><span style={{ color:'var(--text-dark)', fontWeight:600 }}>{activeCat}</span></>}
          {search && <><span>›</span><span style={{ color:'var(--text-dark)' }}>Results for "{search}"</span></>}
        </div>
      </div>
      <main style={{ flex:1 }}>
        <div className="container" style={{ padding:'1rem', display:'grid', gridTemplateColumns:'220px 1fr', gap:'1rem', alignItems:'start' }}>
          {/* Sidebar */}
          <aside>
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden', position:'sticky', top:10 }}>
              <div style={{ padding:'0.75rem 1rem', fontWeight:800, fontSize:14, borderBottom:'1px solid var(--border)', background:'#f7f7f7' }}>Filter Results</div>
              {/* Categories */}
              <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>Department</div>
                <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:'pointer', fontSize:13 }}>
                  <input type="radio" name="cat" checked={!activeCat} onChange={() => { setP('catname',''); setP('category',''); }} style={{ accentColor:'var(--primary)' }} />
                  All Departments
                </label>
                {categories.map(cat => (
                  <label key={cat._id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:'pointer', fontSize:13 }}>
                    <input type="radio" name="cat" checked={activeCat===cat.name} onChange={() => { setP('catname',cat.name); setP('category',''); }} style={{ accentColor:'var(--primary)' }} />
                    <span>{CAT_ICONS[cat.name]||'📦'}</span> {cat.name}
                  </label>
                ))}
              </div>
              {/* Price */}
              <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>Price (Rs.)</div>
                {[['Under 10,000','','10000'],['10,000–50,000','10000','50000'],['50,000–150,000','50000','150000'],['Above 150,000','150000','']].map(([label,min,max]) => (
                  <label key={label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:'pointer', fontSize:13 }}>
                    <input type="radio" name="price" checked={minPrice===min && maxPrice===max} onChange={() => { setP('minPrice',min); setP('maxPrice',max); }} style={{ accentColor:'var(--primary)' }} />
                    {label}
                  </label>
                ))}
                <div style={{ display:'flex', gap:6, marginTop:8 }}>
                  <input className="form-control" type="number" placeholder="Min" defaultValue={minPrice}
                    onBlur={e => setP('minPrice',e.target.value)} style={{ fontSize:12, padding:'6px 8px' }} />
                  <input className="form-control" type="number" placeholder="Max" defaultValue={maxPrice}
                    onBlur={e => setP('maxPrice',e.target.value)} style={{ fontSize:12, padding:'6px 8px' }} />
                </div>
              </div>
              {/* Flags */}
              <div style={{ padding:'0.75rem 1rem' }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>Availability</div>
                {[['featured','⭐ Featured'],['isNewArrival','🆕 New Arrivals']].map(([k,label]) => (
                  <label key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:'pointer', fontSize:13 }}>
                    <input type="checkbox" checked={!!sp.get(k)} onChange={e => setP(k,e.target.checked?'true':'')} style={{ accentColor:'var(--primary)' }} />
                    {label}
                  </label>
                ))}
                {(activeCat||search||minPrice||maxPrice||featured||isNew) && (
                  <button onClick={() => setSp({})} style={{ marginTop:8, fontSize:13, color:'var(--danger)', background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:0 }}>✕ Clear All Filters</button>
                )}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div>
            {/* Toolbar */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem', background:'#fff', padding:'0.6rem 0.75rem', border:'1px solid var(--border)', borderRadius:'var(--radius-md)' }}>
              <span style={{ fontSize:13, color:'var(--text-mid)' }}>
                {loading ? 'Loading...' : <><strong style={{ color:'var(--text-dark)' }}>{total.toLocaleString()}</strong> results{search ? <> for "<strong>{search}</strong>"</> : ''}</>}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, color:'var(--text-mid)' }}>Sort:</span>
                <select className="form-control" value={sort} onChange={e => setP('sort',e.target.value)} style={{ width:'auto', padding:'5px 10px', fontSize:13 }}>
                  <option value="newest">Newest</option>
                  <option value="popular">Best Selling</option>
                  <option value="rating">Avg. Customer Review</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div style={{ textAlign:'center', padding:'4rem', background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-md)' }}>
                <div style={{ fontSize:56, marginBottom:'1rem' }}>🔍</div>
                <h3 style={{ marginBottom:8 }}>No results found</h3>
                <p style={{ color:'var(--text-mid)', marginBottom:'1.5rem', fontSize:14 }}>Try adjusting your filters or search terms.</p>
                <button onClick={() => setSp({})} className="btn btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-4">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button onClick={() => setPage(page-1)} disabled={page===1}>← Prev</button>
                    {Array.from({length:Math.min(pages,8)},(_,i)=>i+1).map(p => (
                      <button key={p} className={p===page?'active':''} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button onClick={() => setPage(page+1)} disabled={page===pages}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
