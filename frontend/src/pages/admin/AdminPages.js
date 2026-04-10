import React, { useEffect, useState, useRef } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, CheckIcon, CloseIcon, ImageIcon, LayersIcon } from '../../components/common/Icons';

const init = {
  title: '', slug: '', content: '', metaTitle: '', metaDescription: '',
  isPublished: true, showInFooter: false, showInNav: false,
  layout: 'default', heroTitle: '', heroSubtitle: '', heroColor: '#109be0',
  sections: []
};

// Block types for the page builder
const BLOCK_TYPES = [
  { id:'paragraph', icon:'¶', label:'Text / Paragraph' },
  { id:'heading',   icon:'H', label:'Heading' },
  { id:'image',     icon:'🖼', label:'Image' },
  { id:'list',      icon:'•', label:'Bullet List' },
  { id:'callout',   icon:'💡', label:'Callout Box' },
  { id:'html',      icon:'<>', label:'Custom HTML' },
];

function BlockEditor({ block, onChange, onRemove, onMoveUp, onMoveDown }) {
  const renderInput = () => {
    switch (block.type) {
      case 'paragraph':
        return <textarea className="form-control" rows={4} value={block.content||''} onChange={e => onChange({...block, content:e.target.value})} placeholder="Write your paragraph text here..." />;
      case 'heading':
        return (
          <div style={{ display:'grid', gridTemplateColumns:'100px 1fr', gap:8 }}>
            <select className="form-control" value={block.level||'h2'} onChange={e => onChange({...block, level:e.target.value})}>
              <option value="h1">H1 – Title</option>
              <option value="h2">H2 – Section</option>
              <option value="h3">H3 – Sub</option>
            </select>
            <input className="form-control" value={block.content||''} onChange={e => onChange({...block, content:e.target.value})} placeholder="Heading text..." />
          </div>
        );
      case 'image':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input className="form-control" value={block.src||''} onChange={e => onChange({...block, src:e.target.value})} placeholder="Image URL (https://...)" />
            <input className="form-control" value={block.alt||''} onChange={e => onChange({...block, alt:e.target.value})} placeholder="Alt text / caption" />
          </div>
        );
      case 'list':
        return (
          <div>
            <textarea className="form-control" rows={4} value={block.content||''} onChange={e => onChange({...block, content:e.target.value})} placeholder="One item per line:&#10;- Item 1&#10;- Item 2&#10;- Item 3" />
            <div style={{ fontSize:12, color:'var(--text-light)', marginTop:4 }}>One item per line. Start each line with - or leave as is.</div>
          </div>
        );
      case 'callout':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 130px', gap:8 }}>
              <input className="form-control" value={block.title||''} onChange={e => onChange({...block, title:e.target.value})} placeholder="Callout title (optional)" />
              <select className="form-control" value={block.variant||'info'} onChange={e => onChange({...block, variant:e.target.value})}>
                <option value="info">ℹ Info</option>
                <option value="success">✅ Success</option>
                <option value="warning">⚠️ Warning</option>
                <option value="danger">🚫 Important</option>
              </select>
            </div>
            <textarea className="form-control" rows={3} value={block.content||''} onChange={e => onChange({...block, content:e.target.value})} placeholder="Callout content..." />
          </div>
        );
      case 'html':
        return <textarea className="form-control" rows={6} value={block.content||''} onChange={e => onChange({...block, content:e.target.value})} placeholder="<div>Custom HTML here...</div>" style={{ fontFamily:'monospace', fontSize:13 }} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden', marginBottom:'0.75rem' }}>
      {/* Block toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#f8fafc', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text-mid)', display:'flex', alignItems:'center', gap:6 }}>
          <span>{BLOCK_TYPES.find(b=>b.id===block.type)?.icon}</span>
          {BLOCK_TYPES.find(b=>b.id===block.type)?.label}
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={onMoveUp}  style={{ background:'none', border:'1px solid var(--border)', borderRadius:4, padding:'2px 8px', cursor:'pointer', fontSize:13, color:'var(--text-mid)' }}>↑</button>
          <button onClick={onMoveDown} style={{ background:'none', border:'1px solid var(--border)', borderRadius:4, padding:'2px 8px', cursor:'pointer', fontSize:13, color:'var(--text-mid)' }}>↓</button>
          <button onClick={onRemove}  style={{ background:'none', border:'1px solid #fee2e2', borderRadius:4, padding:'2px 8px', cursor:'pointer', color:'var(--danger)' }}><CloseIcon size={13} /></button>
        </div>
      </div>
      <div style={{ padding:'12px' }}>
        {renderInput()}
      </div>
    </div>
  );
}

// Render blocks as HTML string for saving
function blocksToHTML(sections = []) {
  return sections.map(block => {
    switch(block.type) {
      case 'heading':   return `<${block.level||'h2'}>${block.content||''}</${block.level||'h2'}>`;
      case 'paragraph': return `<p>${(block.content||'').replace(/\n/g,'<br/>')}</p>`;
      case 'image':     return `<figure><img src="${block.src||''}" alt="${block.alt||''}" style="max-width:100%;border-radius:8px;"/>${block.alt?`<figcaption>${block.alt}</figcaption>`:''}</figure>`;
      case 'list':      return `<ul>${(block.content||'').split('\n').filter(Boolean).map(line=>`<li>${line.replace(/^[-*•]\s*/,'')}</li>`).join('')}</ul>`;
      case 'callout': {
        const colors = {info:'#e6f5fd:#109be0',success:'#dcfce7:#16a34a',warning:'#fef3c7:#d97706',danger:'#fee2e2:#dc2626'};
        const [bg,border] = (colors[block.variant||'info']||colors.info).split(':');
        return `<div style="background:${bg};border-left:4px solid ${border};padding:1rem;border-radius:0 8px 8px 0;margin:1rem 0;">${block.title?`<strong>${block.title}</strong><br/>`:''}${block.content||''}</div>`;
      }
      case 'html': return block.content||'';
      default: return '';
    }
  }).join('\n');
}

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(init);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'builder' | 'html'
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'html' | 'seo'

  const fetchPages = () => API.get('/pages').then(({ data }) => { setPages(data.pages||[]); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { fetchPages(); }, []);

  const addBlock = type => {
    setForm(f => ({ ...f, sections: [...(f.sections||[]), { id: Date.now(), type, content: '', level: type==='heading'?'h2':undefined }] }));
  };

  const updateBlock = (idx, updated) => {
    setForm(f => ({ ...f, sections: f.sections.map((b,i) => i===idx ? updated : b) }));
  };

  const removeBlock = idx => {
    setForm(f => ({ ...f, sections: f.sections.filter((_,i) => i!==idx) }));
  };

  const moveBlock = (idx, dir) => {
    setForm(f => {
      const secs = [...f.sections];
      const target = idx + dir;
      if (target < 0 || target >= secs.length) return f;
      [secs[idx], secs[target]] = [secs[target], secs[idx]];
      return { ...f, sections: secs };
    });
  };

  const save = async e => {
    e.preventDefault();
    try {
      // If using builder, compile sections to HTML content
      const finalContent = activeTab === 'builder' && form.sections?.length
        ? blocksToHTML(form.sections)
        : form.content;
      const payload = { ...form, content: finalContent, slug: form.slug || form.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') };

      if (editing) { await API.put(`/pages/${editing}`, payload); toast.success('Page updated!'); }
      else { await API.post('/pages', payload); toast.success('Page created!'); }
      setForm(init); setEditing(null); setView('list'); fetchPages();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save page'); }
  };

  const edit = async (page) => {
    setEditing(page._id);
    setForm({
      title: page.title||'', slug: page.slug||'', content: page.content||'',
      metaTitle: page.metaTitle||'', metaDescription: page.metaDescription||'',
      isPublished: page.isPublished!==false, showInFooter: !!page.showInFooter, showInNav: !!page.showInNav,
      layout: page.layout||'default', heroTitle: page.heroTitle||'', heroSubtitle: page.heroSubtitle||'',
      heroColor: page.heroColor||'#109be0', sections: page.sections||[]
    });
    setView('builder');
    setActiveTab(page.sections?.length ? 'builder' : 'html');
  };

  const del = async id => {
    if (!window.confirm('Delete this page?')) return;
    await API.delete(`/pages/${id}`); fetchPages(); toast.success('Page deleted');
  };

  if (view !== 'list') return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800 }}>{editing ? `Edit: ${form.title}` : 'New Page'}</h1>
          <p style={{ color:'var(--text-mid)', fontSize:13, marginTop:3 }}>Build your page visually or with HTML</p>
        </div>
        <button onClick={() => { setView('list'); setEditing(null); setForm(init); }} className="btn btn-ghost btn-sm">← Back to Pages</button>
      </div>

      <form onSubmit={save}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.25rem', alignItems:'start' }}>
          {/* Main editor */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Page basics */}
            <div className="card card-body">
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:'1rem', color:'var(--text-mid)' }}>PAGE DETAILS</h3>
              <div className="grid grid-2">
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Page Title *</label>
                  <input className="form-control" required value={form.title}
                    onChange={e => setForm(f => ({ ...f, title:e.target.value, slug:f.slug||e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') }))}
                    placeholder="e.g. About Us" />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">URL Slug *</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-light)', fontSize:13 }}>/page/</span>
                    <input className="form-control" required value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug:e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') }))}
                      placeholder="about-us" style={{ paddingLeft:52 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Hero section */}
            <div className="card card-body">
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:'1rem', color:'var(--text-mid)' }}>HERO BANNER (optional)</h3>
              <div className="grid grid-2">
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Hero Title</label>
                  <input className="form-control" value={form.heroTitle} onChange={e => setForm(f=>({...f,heroTitle:e.target.value}))} placeholder="About TechMart Nepal" />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Hero Subtitle</label>
                  <input className="form-control" value={form.heroSubtitle} onChange={e => setForm(f=>({...f,heroSubtitle:e.target.value}))} placeholder="Your trusted tech partner" />
                </div>
              </div>
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:10 }}>
                <label className="form-label" style={{ marginBottom:0 }}>Banner Color:</label>
                <input type="color" value={form.heroColor||'#109be0'} onChange={e => setForm(f=>({...f,heroColor:e.target.value}))} style={{ width:40, height:30, padding:2, border:'1px solid var(--border)', borderRadius:6, cursor:'pointer' }} />
                <span style={{ fontSize:12, color:'var(--text-light)' }}>{form.heroColor}</span>
                <div style={{ flex:1, height:30, borderRadius:6, background:`linear-gradient(135deg, ${form.heroColor}, ${form.heroColor}88)`, display:'flex', alignItems:'center', paddingLeft:12 }}>
                  <span style={{ fontSize:13, color:'#fff', fontWeight:700, opacity:0.9 }}>Preview</span>
                </div>
              </div>
            </div>

            {/* Content builder */}
            <div className="card">
              {/* Tabs */}
              <div style={{ display:'flex', borderBottom:'1px solid var(--border)' }}>
                {[['builder','🧩 Page Builder'],['html','💻 HTML Editor'],['seo','🔍 SEO']].map(([id,label]) => (
                  <button key={id} type="button" onClick={() => setActiveTab(id)}
                    style={{ padding:'12px 18px', border:'none', background:'none', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:700, color:activeTab===id?'var(--primary)':'var(--text-mid)', borderBottom:`2px solid ${activeTab===id?'var(--primary)':'transparent'}`, marginBottom:-1, transition:'all 0.15s' }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ padding:'1rem' }}>
                {activeTab === 'builder' && (
                  <div>
                    {/* Blocks */}
                    {(form.sections||[]).length === 0 ? (
                      <div style={{ textAlign:'center', padding:'2.5rem', background:'#f8fafc', borderRadius:'var(--radius-md)', border:'2px dashed var(--border)', marginBottom:'1rem' }}>
                        <div style={{ fontSize:36, marginBottom:8 }}>🧩</div>
                        <p style={{ color:'var(--text-mid)', fontSize:14, marginBottom:0 }}>No blocks yet. Add your first block below!</p>
                      </div>
                    ) : (
                      (form.sections||[]).map((block, idx) => (
                        <BlockEditor key={block.id||idx} block={block}
                          onChange={updated => updateBlock(idx, updated)}
                          onRemove={() => removeBlock(idx)}
                          onMoveUp={() => moveBlock(idx, -1)}
                          onMoveDown={() => moveBlock(idx, 1)} />
                      ))
                    )}
                    {/* Add block palette */}
                    <div style={{ borderTop:'1px solid var(--border)', paddingTop:'0.75rem' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Add Block</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {BLOCK_TYPES.map(bt => (
                          <button key={bt.id} type="button" onClick={() => addBlock(bt.id)}
                            className="btn btn-ghost btn-sm" style={{ fontSize:12 }}>
                            <span>{bt.icon}</span> {bt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'html' && (
                  <div>
                    <div className="form-group" style={{ marginBottom:'0.5rem' }}>
                      <label className="form-label">HTML Content</label>
                      <textarea className="form-control" rows={16} value={form.content}
                        onChange={e => setForm(f=>({...f,content:e.target.value}))}
                        placeholder="<h2>Your HTML content here...</h2>&#10;<p>Write any HTML you like.</p>"
                        style={{ fontFamily:'monospace', fontSize:13, lineHeight:1.6 }} />
                    </div>
                    <div className="alert alert-info" style={{ fontSize:12 }}>
                      💡 HTML mode. Use builder mode for drag-and-drop page construction.
                    </div>
                  </div>
                )}
                {activeTab === 'seo' && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Meta Title</label>
                      <input className="form-control" value={form.metaTitle} onChange={e => setForm(f=>({...f,metaTitle:e.target.value}))} placeholder="Page title for search engines" />
                      <div style={{ fontSize:12, color:'var(--text-light)', marginTop:4 }}>{form.metaTitle?.length||0}/60 chars recommended</div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Meta Description</label>
                      <textarea className="form-control" rows={3} value={form.metaDescription} onChange={e => setForm(f=>({...f,metaDescription:e.target.value}))} placeholder="Brief description for search results..." />
                      <div style={{ fontSize:12, color:'var(--text-light)', marginTop:4 }}>{form.metaDescription?.length||0}/160 chars recommended</div>
                    </div>
                    {/* Preview */}
                    {(form.metaTitle || form.title) && (
                      <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1rem', background:'#fff' }}>
                        <div style={{ fontSize:11, color:'var(--text-light)', marginBottom:4 }}>GOOGLE PREVIEW</div>
                        <div style={{ color:'#1a0dab', fontSize:18, fontWeight:400, marginBottom:2 }}>{form.metaTitle||form.title}</div>
                        <div style={{ color:'#006621', fontSize:13, marginBottom:3 }}>techmart.com.np/page/{form.slug}</div>
                        <div style={{ color:'#545454', fontSize:13, lineHeight:1.5 }}>{form.metaDescription||'No description provided.'}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar options */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:80 }}>
            <div className="card card-body">
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:'1rem', color:'var(--text-mid)' }}>PUBLISH SETTINGS</h3>
              {[
                ['isPublished','✅ Published', 'Visible on website'],
                ['showInNav','🔗 Show in Header Nav', 'Appears in top navigation'],
                ['showInFooter','📋 Show in Footer', 'Appears in footer links'],
              ].map(([key, label, hint]) => (
                <div key={key} style={{ marginBottom:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <div onClick={() => setForm(f=>({...f,[key]:!f[key]}))}
                      style={{ width:44, height:24, background:form[key]?'var(--primary)':'#d1d5db', borderRadius:12, position:'relative', transition:'background 0.2s', cursor:'pointer', flexShrink:0 }}>
                      <div style={{ position:'absolute', top:3, left:form[key]?22:3, width:18, height:18, background:'#fff', borderRadius:'50%', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{label}</div>
                      <div style={{ fontSize:11, color:'var(--text-light)' }}>{hint}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div className="card card-body">
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:'1rem', color:'var(--text-mid)' }}>LAYOUT</h3>
              {['default','wide','minimal','landing'].map(layout => (
                <label key={layout} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer', fontSize:13 }}>
                  <input type="radio" name="layout" value={layout} checked={form.layout===layout} onChange={() => setForm(f=>({...f,layout}))} style={{ accentColor:'var(--primary)' }} />
                  <span style={{ textTransform:'capitalize', fontWeight:form.layout===layout?700:400 }}>{layout}</span>
                </label>
              ))}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              {editing ? '✓ Update Page' : '✓ Publish Page'}
            </button>
            <button type="button" onClick={() => { setView('list'); setEditing(null); setForm(init); }} className="btn btn-ghost btn-block">
              Cancel
            </button>
            {form.slug && <a href={`/page/${form.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-block btn-sm"><EyeIcon size={14} /> Preview</a>}
          </div>
        </div>
      </form>
    </div>
  );

  // List view
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1>Pages</h1>
          <p>Create and manage static pages — About, Policies, Custom pages</p>
        </div>
        <button onClick={() => setView('builder')} className="btn btn-primary">
          <PlusIcon size={16} /> New Page
        </button>
      </div>

      {/* Quick templates */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
        {[
          { title:'About Us', slug:'about', icon:'🏢', desc:'Company story & team' },
          { title:'Privacy Policy', slug:'privacy', icon:'🔒', desc:'Data privacy terms' },
          { title:'Return Policy', slug:'returns', icon:'🔄', desc:'Return & refund rules' },
          { title:'Terms & Conditions', slug:'terms', icon:'📜', desc:'Legal terms of use' },
          { title:'Warranty Info', slug:'warranty', icon:'🛡', desc:'Product warranty policy' },
          { title:'Custom Page', slug:'', icon:'📄', desc:'Blank page builder' },
        ].map(tmpl => (
          <button key={tmpl.slug} onClick={() => { setForm({...init, title:tmpl.title, slug:tmpl.slug}); setView('builder'); }}
            style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1rem', cursor:'pointer', textAlign:'left', transition:'all 0.15s', fontFamily:'var(--font)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='#fff'; }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{tmpl.icon}</div>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{tmpl.title}</div>
            <div style={{ fontSize:11, color:'var(--text-light)' }}>{tmpl.desc}</div>
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>All Pages ({pages.length})</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Title</th><th>URL</th><th>Nav</th><th>Footer</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:'2rem' }}><div className="spinner" style={{ margin:'auto' }} /></td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="icon">📄</div>
                    <h3>No pages yet</h3>
                    <p style={{ color:'var(--text-mid)' }}>Create your first page using the button above</p>
                  </div>
                </td></tr>
              ) : pages.map(page => (
                <tr key={page._id}>
                  <td style={{ fontWeight:600 }}>{page.title}</td>
                  <td>
                    <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer"
                      style={{ fontSize:13, color:'var(--primary)', fontFamily:'monospace' }}>
                      /page/{page.slug}
                    </a>
                  </td>
                  <td>{page.showInNav ? '✅' : '—'}</td>
                  <td>{page.showInFooter ? '✅' : '—'}</td>
                  <td>
                    {page.isPublished
                      ? <span className="badge badge-success">Published</span>
                      : <span className="badge badge-warning">Draft</span>}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs" title="Preview"><EyeIcon size={13} /></a>
                      <button onClick={() => edit(page)} className="btn btn-outline btn-xs"><EditIcon size={13} /></button>
                      <button onClick={() => del(page._id)} className="btn btn-danger btn-xs"><TrashIcon size={13} /></button>
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
