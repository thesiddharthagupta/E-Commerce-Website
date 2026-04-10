import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const GROUPS = [
  { key:'general',  icon:'🏪', label:'General',       fields:[
    { key:'site_name',    label:'Site / Company Name', type:'text',     hint:'Appears in header, browser tab & footer' },
    { key:'site_tagline', label:'Tagline',              type:'text',     hint:'Short description under logo' },
    { key:'site_logo',    label:'Logo URL',             type:'text',     hint:'Paste image URL or upload to /uploads/ folder' },
    { key:'footer_text',  label:'Footer Copyright Text',type:'text' },
  ]},
  { key:'homepage', icon:'🏠', label:'Homepage Sections', fields:[
    { key:'hero_title',        label:'Hero Banner Title',     type:'text',     hint:'Main headline on homepage banner' },
    { key:'hero_subtitle',     label:'Hero Subtitle',         type:'text' },
    { key:'hero_btn_text',     label:'Hero Button Text',      type:'text' },
    { key:'show_featured',     label:'Show Featured Products',type:'toggle' },
    { key:'show_new_arrivals', label:'Show New Arrivals',     type:'toggle' },
    { key:'show_categories',   label:'Show Category Grid',    type:'toggle' },
    { key:'show_banner',       label:'Show Promo Banners',    type:'toggle' },
    { key:'banner1_title',     label:'Banner 1 Title',        type:'text' },
    { key:'banner1_subtitle',  label:'Banner 1 Subtitle',     type:'text' },
    { key:'banner1_link',      label:'Banner 1 Link',         type:'text',     hint:'e.g. /shop?catname=Laptops' },
    { key:'banner2_title',     label:'Banner 2 Title',        type:'text' },
    { key:'banner2_subtitle',  label:'Banner 2 Subtitle',     type:'text' },
    { key:'banner2_link',      label:'Banner 2 Link',         type:'text' },
  ]},
  { key:'shop',     icon:'🛒', label:'Shop Settings',  fields:[
    { key:'currency',            label:'Currency Symbol',             type:'text',   hint:'e.g. Rs.' },
    { key:'free_shipping_above', label:'Free Shipping Threshold (Rs.)',type:'number' },
    { key:'shipping_fee',        label:'Shipping Fee (Rs.)',           type:'number' },
    { key:'tax_rate',            label:'Tax Rate (%)',                 type:'number',  hint:'0 = no tax' },
  ]},
  { key:'contact',  icon:'📞', label:'Contact Info',   fields:[
    { key:'contact_email',   label:'Email Address', type:'email' },
    { key:'contact_phone',   label:'Phone 1',       type:'text' },
    { key:'contact_phone2',  label:'Phone 2',       type:'text' },
    { key:'contact_address', label:'Address',       type:'text' },
    { key:'contact_hours',   label:'Business Hours',type:'text' },
  ]},
  { key:'social',   icon:'📱', label:'Social Media',   fields:[
    { key:'facebook',  label:'Facebook URL',  type:'url' },
    { key:'instagram', label:'Instagram URL', type:'url' },
    { key:'youtube',   label:'YouTube URL',   type:'url' },
    { key:'tiktok',    label:'TikTok URL',    type:'url' },
  ]},
  { key:'footer',   icon:'🦶', label:'Footer Design', fields:[
    { key:'footer_about',         label:'Footer About Text',    type:'text',   hint:'Main description in the first column' },
    { key:'footer_section1_title',label:'Column 1 Title',       type:'text',   hint:'Default: Shop' },
    { key:'footer_section2_title',label:'Column 2 Title',       type:'text',   hint:'Default: Support' },
    { key:'footer_section3_title',label:'Column 3 Title',       type:'text',   hint:'Default: Company' },
    { key:'footer_show_newsletter',label:'Show Newsletter Strip',type:'toggle' },
    { key:'footer_text',          label:'Copyright Text',       type:'text',   hint:'Legal copyright at the bottom' },
  ]},
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState('general');

  useEffect(() => {
    API.get('/settings').then(({ data }) => { setSettings(data.settings||{}); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await API.put('/settings', settings);
      toast.success('✅ Settings saved!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const group = GROUPS.find(g => g.key === activeGroup);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1>Site Settings</h1>
          <p>Control every aspect of your store — no code needed</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary btn-lg">
          {saving ? '⏳ Saving...' : '💾 Save All Settings'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'1.25rem', alignItems:'start' }}>
        {/* Group Nav */}
        <div className="card" style={{ overflow:'hidden', position:'sticky', top:10 }}>
          {GROUPS.map(g => (
            <button key={g.key} onClick={() => setActiveGroup(g.key)}
              style={{ width:'100%', padding:'11px 16px', border:'none', background:activeGroup===g.key?'var(--primary-light)':'transparent', color:activeGroup===g.key?'var(--primary-dark)':'var(--text-dark)', textAlign:'left', cursor:'pointer', fontSize:14, fontWeight:activeGroup===g.key?700:400, borderLeft:`3px solid ${activeGroup===g.key?'var(--primary)':'transparent'}`, display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid var(--border)' }}>
              <span>{g.icon}</span> {g.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="card card-body">
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:'1.5rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            {group?.icon} {group?.label}
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {group?.fields.map(field => (
              <div key={field.key}>
                <label className="form-label">{field.label}</label>
                {field.type === 'toggle' ? (
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <div onClick={() => setSettings(s => ({ ...s, [field.key]: !s[field.key] }))}
                      style={{ width:48, height:26, background:settings[field.key]?'var(--primary)':'#d1d5db', borderRadius:13, position:'relative', transition:'background 0.2s', cursor:'pointer', flexShrink:0 }}>
                      <div style={{ position:'absolute', top:3, left:settings[field.key]?24:3, width:20, height:20, background:'#fff', borderRadius:'50%', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span style={{ fontSize:14, fontWeight:500, color:settings[field.key]?'var(--success)':'var(--text-mid)' }}>
                      {settings[field.key] ? '✅ Enabled' : '⭕ Disabled'}
                    </span>
                  </label>
                ) : (
                  <input
                    className="form-control"
                    type={field.type||'text'}
                    value={settings[field.key]||''}
                    onChange={e => setSettings(s => ({ ...s, [field.key]: field.type==='number' ? Number(e.target.value) : e.target.value }))}
                    placeholder={field.hint||`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                {field.hint && field.type !== 'toggle' && <div style={{ fontSize:12, color:'var(--text-light)', marginTop:4 }}>💡 {field.hint}</div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop:'2rem', paddingTop:'1.5rem', borderTop:'1px solid var(--border)' }}>
            <button onClick={save} disabled={saving} className="btn btn-primary btn-lg">
              {saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
