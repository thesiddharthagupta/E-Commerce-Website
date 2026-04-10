import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { PhoneIcon, MailIcon, MapPinIcon, ArrowRightIcon } from './Icons';

export default function Footer() {
  const [settings, setSettings] = useState({});
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('');

  useEffect(() => {
    API.get('/settings').then(r => setSettings(r.data.settings || {})).catch(() => {});
  }, []);

  const subscribe = async e => {
    e.preventDefault();
    if (!email) return;
    try {
      await API.post('/newsletter/subscribe', { email });
      setSubStatus('success'); setEmail('');
    } catch { setSubStatus('error'); }
    setTimeout(() => setSubStatus(''), 4000);
  };

  const name = settings.site_name || 'TechMart Nepal';
  const showNewsletter = settings.footer_show_newsletter !== false;

  return (
    <footer style={{ background: '#0d1b2a', color: 'rgba(255,255,255,0.65)', marginTop: 'auto' }}>
      {/* Newsletter strip */}
      {showNewsletter && (
        <div style={{ background: 'var(--primary)', padding: '1.5rem 1rem' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: 3 }}>📬 Stay in the loop</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Get exclusive deals and new arrivals</div>
            </div>
            <form onSubmit={subscribe} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 420, minWidth: 240 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontFamily: 'var(--font)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#fff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'} />
              <button type="submit" className="btn btn-dark btn-sm" style={{ flexShrink: 0, padding: '10px 16px' }}>
                {subStatus === 'success' ? '✅ Done!' : <><span>Subscribe</span> <ArrowRightIcon size={14} /></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main footer */}
      <div className="container" style={{ padding: '2.5rem 1rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: '0.75rem' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>T</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-heading)' }}>{name}</div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
              {settings.footer_about || "Nepal's biggest electronics destination. Genuine products, best prices, expert service since 2014."}
            </p>
            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {settings.contact_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <PhoneIcon size={14} stroke="var(--accent)" /> <span>{settings.contact_phone}</span>
                </div>
              )}
              {settings.contact_email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <MailIcon size={14} stroke="var(--accent)" /> <span>{settings.contact_email}</span>
                </div>
              )}
              {settings.contact_address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                  <MapPinIcon size={14} stroke="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} /> <span>{settings.contact_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {settings.footer_section1_title || 'Shop'}
            </h4>
            {[['Laptops','/shop?catname=Laptops'],['Smartphones','/shop?catname=Smartphones'],['Gaming','/shop?catname=Gaming'],['Audio','/shop?catname=Audio'],['New Arrivals','/shop?isNewArrival=true'],['Today\'s Deals','/shop?featured=true']].map(([l,to]) => (
              <Link key={l} to={to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                {l}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {settings.footer_section2_title || 'Support'}
            </h4>
            {[['Contact Us','/contact'],['My Orders','/my-orders'],['Return Policy','/page/returns'],['Warranty','/page/warranty'],['FAQ','/contact']].map(([l,to]) => (
              <Link key={l} to={to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                {l}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {settings.footer_section3_title || 'Company'}
            </h4>
            {[['About Us','/page/about'],['Privacy Policy','/page/privacy'],['Terms & Conditions','/page/terms'],['Careers','/contact']].map(([l,to]) => (
              <Link key={l} to={to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                {l}
              </Link>
            ))}
            {/* Social */}
            <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
              {[['f',settings.facebook,'#4267B2'],['in',settings.instagram,'#E1306C'],['yt',settings.youtube,'#FF0000'],['tk',settings.tiktok,'#000000']].filter(([,url])=>url).map(([ic,url,color]) => (
                <a key={ic} href={url} target="_blank" rel="noreferrer"
                  style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = color}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                  {ic}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {settings.footer_text || `© ${new Date().getFullYear()} ${name} Pvt. Ltd. All rights reserved.`}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['eSewa', 'Khalti', 'VISA', 'Mastercard', 'COD'].map(p => (
              <span key={p} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 600px) {
          footer .container > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
