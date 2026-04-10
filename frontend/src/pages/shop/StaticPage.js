import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import API from '../../utils/api';

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/pages/${slug}`)
      .then(({ data }) => setPage(data.page))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="page-wrap">
      <Header />
      <div className="loading-center"><div className="spinner" /></div>
      <Footer />
    </div>
  );

  if (!page) return (
    <div className="page-wrap">
      <Header />
      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem 1rem', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:'1rem' }}>🔍</div>
        <h1 style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>Page Not Found</h1>
        <p style={{ color:'var(--text-mid)', marginBottom:'1.5rem' }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </main>
      <Footer />
    </div>
  );

  const layoutStyles = {
    default:  { maxWidth: 800 },
    wide:     { maxWidth: 1100 },
    minimal:  { maxWidth: 680 },
    landing:  { maxWidth: '100%', padding: 0 },
  };
  const ls = layoutStyles[page.layout||'default'] || layoutStyles.default;

  return (
    <div className="page-wrap">
      <Header />
      <main style={{ flex:1 }}>
        {/* Hero */}
        {(page.heroTitle || page.title) && (
          <div style={{ background: `linear-gradient(135deg, ${page.heroColor||'var(--nav-bg)'} 0%, ${page.heroColor||'var(--primary-dark)'}cc 100%)`, padding: '2.5rem 1rem', textAlign: 'center' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {/* Breadcrumb */}
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:'1rem', fontSize:13, color:'rgba(255,255,255,0.65)' }}>
                <Link to="/" style={{ color:'rgba(255,255,255,0.65)' }}>Home</Link>
                <span>›</span>
                <span style={{ color:'#fff' }}>{page.title}</span>
              </div>
              <h1 style={{ fontSize:'clamp(1.5rem,4vw,2.25rem)', color:'#fff', fontWeight:800, marginBottom:'0.5rem' }}>
                {page.heroTitle || page.title}
              </h1>
              {page.heroSubtitle && (
                <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, lineHeight:1.6 }}>{page.heroSubtitle}</p>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ maxWidth: ls.maxWidth, margin: '2rem auto', padding: '0 1rem' }}>
          <div className="card card-body rich-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
            style={{ fontSize:15, lineHeight:1.8, color:'var(--text-mid)' }} />

          {/* Footer nav */}
          <div style={{ marginTop:'1.5rem', display:'flex', justifyContent:'center' }}>
            <Link to="/" className="btn btn-outline btn-sm">← Back to Home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
