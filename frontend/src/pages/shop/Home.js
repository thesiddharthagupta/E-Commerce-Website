import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/shop/ProductCard';
import API from '../../utils/api';

const CAT_ICONS = {Laptops:'💻',Smartphones:'📱',Tablets:'📟',Audio:'🎧',Cameras:'📷',Accessories:'🔌',Gaming:'🎮','Smart Home':'🏠',Peripherals:'🖱','Smart Watches':'⌚'};

// Sliding hero banner
function HeroBanner({ settings }) {
  const slides = [
    { bg:'linear-gradient(120deg,#232f3e 60%,#37475a)', text:settings.hero_title||"Nepal's Biggest\nElectronics Store", sub:settings.hero_subtitle||'Genuine products · Best prices · Expert service', cta:settings.hero_btn_text||'Shop Now', link:'/shop', img:'💻', badge:'🏆 #1 in Nepal' },
    { bg:'linear-gradient(120deg,#0f1b2d 60%,#1a3a5c)', text:'Gaming Laptops &\nHandhelds', sub:'ROG, Lenovo Legion, MSI — built for champions', cta:'Shop Gaming', link:'/shop?catname=Gaming', img:'🎮', badge:'🔥 Hot Deals' },
    { bg:'linear-gradient(120deg,#1a0533 60%,#3b0764)', text:'Latest Smartphones\n2024', sub:'iPhone 15 Pro, Galaxy S24, Pixel 8 & more', cta:'Shop Phones', link:'/shop?catname=Smartphones', img:'📱', badge:'🆕 New Arrivals' },
  ];
  const [idx, setIdx] = useState(0);
  const timer = useRef();
  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => (i+1)%slides.length), 5000);
    return () => clearInterval(timer.current);
  }, []);
  const s = slides[idx];
  const navigate = useNavigate();
  return (
    <div style={{ position:'relative', background:s.bg, overflow:'hidden', transition:'background 0.5s' }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2.5rem 1rem', minHeight:340, position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:520 }}>
          <span style={{ display:'inline-block', background:'rgba(254,189,105,0.2)', color:'var(--nav-accent)', fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:3, marginBottom:'0.75rem', border:'1px solid rgba(254,189,105,0.3)' }}>{s.badge}</span>
          <h1 style={{ fontSize:'clamp(1.6rem,3.5vw,2.5rem)', fontWeight:900, color:'#fff', marginBottom:'0.75rem', lineHeight:1.2, whiteSpace:'pre-line' }}>{s.text}</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.75)', marginBottom:'1.5rem', lineHeight:1.6 }}>{s.sub}</p>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <button onClick={() => navigate(s.link)} className="btn btn-accent btn-lg">{s.cta} →</button>
            <button onClick={() => navigate('/shop')} className="btn btn-outline-dark btn-lg">Browse All</button>
          </div>
          <div style={{ display:'flex', gap:'2rem', marginTop:'1.5rem' }}>
            {[['10K+','Customers'],['500+','Products'],['4.8★','Rating'],['10yr','Experience']].map(([n,l]) => (
              <div key={l}><div style={{ fontSize:'1.1rem', fontWeight:900, color:'#fff', fontFamily:'var(--font-heading)' }}>{n}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:600 }}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{ fontSize:'clamp(80px,12vw,160px)', opacity:0.25, flexShrink:0, lineHeight:1, userSelect:'none' }}>{s.img}</div>
      </div>
      {/* Dots */}
      <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6, zIndex:2 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); clearInterval(timer.current); }}
            style={{ width:i===idx?24:8, height:8, borderRadius:4, background:i===idx?'var(--nav-accent)':'rgba(255,255,255,0.4)', border:'none', cursor:'pointer', transition:'all 0.3s' }} />
        ))}
      </div>
      {/* Arrows */}
      {['‹','›'].map((arrow, i) => (
        <button key={arrow} onClick={() => { setIdx(j => (j + (i?1:-1)+slides.length)%slides.length); clearInterval(timer.current); }}
          style={{ position:'absolute', top:'50%', [i?'right':'left']:16, transform:'translateY(-50%)', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', width:40, height:40, borderRadius:'50%', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, backdropFilter:'blur(4px)' }}>
          {arrow}
        </button>
      ))}
    </div>
  );
}

function SectionBox({ title, link, linkText='View all', children, bg='#fff' }) {
  return (
    <div style={{ background:bg, border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1rem 0.75rem', borderBottom:'1px solid var(--border)' }}>
        <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text-dark)' }}>{title}</h2>
        {link && <Link to={link} style={{ fontSize:13, color:'#007185', fontWeight:600 }}>{linkText}</Link>}
      </div>
      <div style={{ padding:'1rem' }}>{children}</div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/products/featured'),
      API.get('/categories'),
      API.get('/products?isNewArrival=true&limit=8'),
      API.get('/products?limit=20&sort=popular'),
      API.get('/settings'),
    ]).then(([f,c,n,a,s]) => {
      setFeatured(f.data.products||[]);
      setCategories(c.data.categories||[]);
      setNewArrivals(n.data.products||[]);
      setAllProducts(a.data.products||[]);
      setSettings(s.data.settings||{});
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const showFeatured   = settings.show_featured   !== false;
  const showNew        = settings.show_new_arrivals !== false;
  const showCategories = settings.show_categories  !== false;
  const showBanner     = settings.show_banner       !== false;

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Header />
      <main style={{ flex:1, background:'var(--bg-page)' }}>

        {/* Hero Slider */}
        <HeroBanner settings={settings} />

        {/* Trust bar */}
        <div style={{ background:'var(--nav-bg)', color:'rgba(255,255,255,0.85)' }}>
          <div className="container" style={{ display:'flex', gap:'1rem', padding:'10px 1rem', overflowX:'auto', justifyContent:'center', flexWrap:'wrap' }}>
            {[['🚚','Free Shipping','On orders above Rs.5,000'],['✅','100% Genuine','Authorized products only'],['🔄','7-Day Returns','Easy hassle-free returns'],['💳','Secure Payment','eSewa, Khalti, Card'],['🔧','After Sales','In-house service center']].map(([icon,t,s]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 16px', borderRight:'1px solid rgba(255,255,255,0.12)', whiteSpace:'nowrap' }}>
                <span style={{ fontSize:16 }}>{icon}</span>
                <div><div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{t}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.55)' }}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="container" style={{ padding:'1.25rem 1rem' }}>
          {/* Layout: 3 boxes top row */}
          {showCategories && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem', marginBottom:'1rem' }}>
              <SectionBox title="Shop by Category" link="/shop" linkText="See all">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  {categories.slice(0,8).map(cat => (
                    <Link key={cat._id} to={`/shop?catname=${encodeURIComponent(cat.name)}`}
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', textDecoration:'none', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='transparent'; }}>
                      <span style={{ fontSize:20 }}>{CAT_ICONS[cat.name]||'📦'}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--text-dark)' }}>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </SectionBox>

              {showBanner && (
                <div style={{ cursor:'pointer', borderRadius:'var(--radius-md)', overflow:'hidden', background:'linear-gradient(135deg,#1e3a5f,var(--primary-dark))', border:'1px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'1.5rem' }}
                  onClick={() => navigate(settings.banner1_link||'/shop?catname=Laptops')}>
                  <div>
                    <span className="badge badge-accent" style={{ marginBottom:'0.5rem' }}>Up to 15% Off</span>
                    <h3 style={{ color:'#fff', fontSize:'1.2rem', fontWeight:800, marginBottom:'0.5rem' }}>{settings.banner1_title||'Premium Laptops'}</h3>
                    <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.5 }}>{settings.banner1_subtitle||'MacBook, Dell XPS, ROG & more'}</p>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'1rem' }}>
                    <button className="btn btn-accent btn-sm">Shop Now →</button>
                    <span style={{ fontSize:60, opacity:0.2 }}>💻</span>
                  </div>
                </div>
              )}

              {showBanner && (
                <div style={{ cursor:'pointer', borderRadius:'var(--radius-md)', overflow:'hidden', background:'linear-gradient(135deg,#1a0533,#3b0764)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'1.5rem' }}
                  onClick={() => navigate(settings.banner2_link||'/shop?catname=Gaming')}>
                  <div>
                    <span className="badge badge-hot" style={{ marginBottom:'0.5rem' }}>Best Sellers</span>
                    <h3 style={{ color:'#fff', fontSize:'1.2rem', fontWeight:800, marginBottom:'0.5rem' }}>{settings.banner2_title||'Gaming Gear'}</h3>
                    <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.5 }}>{settings.banner2_subtitle||'Consoles, monitors, peripherals'}</p>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'1rem' }}>
                    <button className="btn btn-outline-dark btn-sm">Shop Now →</button>
                    <span style={{ fontSize:60, opacity:0.2 }}>🎮</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Featured Products */}
          {showFeatured && (
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', marginBottom:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1rem 0.5rem', borderBottom:'1px solid var(--border)' }}>
                <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>🔥 Featured Products</h2>
                <Link to="/shop?featured=true" style={{ fontSize:13, color:'#007185', fontWeight:600 }}>View all →</Link>
              </div>
              <div style={{ padding:'1rem' }}>
                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                  <div className="grid grid-5">
                    {featured.slice(0,10).map(p => <ProductCard key={p._id} product={p} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Arrivals */}
          {showNew && newArrivals.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', marginBottom:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1rem 0.5rem', borderBottom:'1px solid var(--border)' }}>
                <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>🆕 New Arrivals</h2>
                <Link to="/shop?isNew=true" style={{ fontSize:13, color:'#007185', fontWeight:600 }}>See all →</Link>
              </div>
              <div style={{ padding:'1rem' }}>
                <div className="grid grid-5">
                  {newArrivals.slice(0,5).map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </div>
          )}

          {/* All Products */}
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1rem 0.5rem', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>All Products</h2>
              <Link to="/shop" style={{ fontSize:13, color:'#007185', fontWeight:600 }}>Browse all products →</Link>
            </div>
            <div style={{ padding:'1rem' }}>
              {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                <div className="grid grid-5">
                  {allProducts.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              )}
            </div>
          </div>

          {/* Why TechMart */}
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', marginBottom:'1rem', padding:'1.5rem' }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'1rem', textAlign:'center' }}>Why Choose {settings.site_name||'TechMart'}?</h2>
            <div className="grid grid-4">
              {[['🏆','#1 in Nepal','Rated top electronics store by 10,000+ customers'],['✅','100% Genuine','All products from authorized distributors'],['🔧','Expert Support','In-house technicians & after-sales service'],['💰','Best Prices','Price-match guarantee across Nepal']].map(([icon,title,desc]) => (
                <div key={title} style={{ textAlign:'center', padding:'1rem' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:12, color:'var(--text-mid)', lineHeight:1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
