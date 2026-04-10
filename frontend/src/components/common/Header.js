import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartDrawer from './CartDrawer';
import {
  SearchIcon, CartIcon, HeartIcon, UserIcon, MenuIcon, CloseIcon,
  ChevronDown, HomeIcon, PackageIcon, LogOutIcon, SettingsIcon, LayersIcon
} from './Icons';

const CATS = [
  {name:'Laptops',slug:'Laptops',icon:'💻'},
  {name:'Smartphones',slug:'Smartphones',icon:'📱'},
  {name:'Gaming',slug:'Gaming',icon:'🎮'},
  {name:'Audio',slug:'Audio',icon:'🎧'},
  {name:'Tablets',slug:'Tablets',icon:'📟'},
  {name:'Accessories',slug:'Accessories',icon:'🔌'},
  {name:'Smart Watches',slug:'Smart Watches',icon:'⌚'},
  {name:'Cameras',slug:'Cameras',icon:'📷'},
];

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, setIsOpen } = useCart();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [userMenu, setUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);
  const [siteName, setSiteName] = useState('TechMart');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef();
  const searchRef = useRef();

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings?.site_name) setSiteName(d.settings.site_name);
    }).catch(() => {});
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenu(false); }, [location]);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', s, { passive: true });
    return () => window.removeEventListener('scroll', s);
  }, []);

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = e => {
    e.preventDefault();
    if (!search.trim()) return;
    const cat = catFilter !== 'All' ? `&catname=${encodeURIComponent(catFilter)}` : '';
    navigate(`/shop?search=${encodeURIComponent(search.trim())}${cat}`);
    setSearch('');
    setMobileOpen(false);
  };

  const navBg = { background: 'var(--nav-bg)' };
  const accentStyle = { color: 'var(--nav-accent)', fontWeight: 700 };

  return (
    <>
      {/* ── TOPBAR ── */}
      <div style={{ background: 'var(--nav-darker, #065c8a)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 32, gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🚚</span>
            <span>Free shipping on orders above <strong style={{ color: '#fff' }}>Rs. 5,000</strong></span>
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['About', '/page/about'], ['Contact', '/contact'], ['Returns', '/page/returns']].map(([l, to]) => (
              <Link key={l} to={to} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header style={{ ...navBg, position: 'sticky', top: 0, zIndex: 100, boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.3)' : 'none', transition: 'box-shadow 0.3s' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12, height: 'var(--header-h, 68px)' }}>

          {/* Mobile menu button */}
          <button className="icon-btn" onClick={() => setMobileOpen(true)}
            style={{ color: '#fff', display: 'none', flexShrink: 0 }}
            aria-label="Open menu"
            id="mobile-menu-btn">
            <MenuIcon size={24} />
          </button>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, textDecoration: 'none', padding: '4px 8px', borderRadius: 6, border: '1px solid transparent', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'var(--font-heading)', flexShrink: 0 }}>T</div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 17, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{siteName}</div>
              <div style={{ color: 'var(--nav-accent)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>NEPAL</div>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} ref={searchRef}
            style={{ flex: 1, display: 'flex', maxWidth: 640, height: 42 }}
            className="desktop-search">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ padding: '0 10px', background: '#ddd', border: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', color: '#222', width: 130, flexShrink: 0, fontWeight: 600 }}>
              <option value="All">All Categories</option>
              {CATS.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products, brands, models..."
              style={{ flex: 1, padding: '0 14px', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'var(--font)', color: '#111', minWidth: 0 }} />
            <button type="submit"
              style={{ padding: '0 18px', background: 'var(--accent)', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nav-accent-text, #0d1b2a)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              <SearchIcon size={20} />
            </button>
          </form>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
            {/* Wishlist */}
            <button className="icon-btn" style={{ color: 'rgba(255,255,255,0.8)' }}
              title="Wishlist" onClick={() => navigate('/profile?tab=wishlist')}>
              <HeartIcon size={22} />
            </button>

            {/* User / Account */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={() => user ? setUserMenu(!userMenu) : navigate('/login')}
                style={{ background: 'none', border: '1px solid transparent', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#fff', textAlign: 'left', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 6, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
                onMouseLeave={e => !userMenu && (e.currentTarget.style.borderColor = 'transparent')}>
                <UserIcon size={22} stroke="rgba(255,255,255,0.85)" />
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Hello, sign in'}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>Account <ChevronDown size={12} /></div>
                </div>
              </button>
              {userMenu && user && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', minWidth: 220, boxShadow: 'var(--shadow-lg)', zIndex: 300, overflow: 'hidden', animation: 'fadeInUp 0.15s ease' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--primary-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>{user.email}</div>
                  </div>
                  {[
                    { to: '/profile', icon: <UserIcon size={15} />, label: 'My Profile' },
                    { to: '/my-orders', icon: <PackageIcon size={15} />, label: 'My Orders' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 14, color: 'var(--text-dark)', borderBottom: '1px solid var(--border)', fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ color: 'var(--primary)' }}>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 14, color: 'var(--primary)', fontWeight: 700, borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <SettingsIcon size={15} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { logout(); setUserMenu(false); navigate('/'); }}
                    style={{ width: '100%', padding: '11px 16px', fontSize: 14, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font)', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOutIcon size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Returns */}
            <Link to="/my-orders"
              style={{ color: '#fff', textAlign: 'left', padding: '5px 8px', borderRadius: 6, border: '1px solid transparent', textDecoration: 'none', transition: 'border-color 0.2s', lineHeight: 1.25 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              className="hide-sm">
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Returns</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>& Orders</div>
            </Link>

            {/* Cart */}
            <button onClick={() => setIsOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid transparent', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#fff', fontFamily: 'var(--font)', transition: 'border-color 0.2s', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <div style={{ position: 'relative' }}>
                <CartIcon size={26} stroke="rgba(255,255,255,0.9)" />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -7, right: -7, background: 'var(--accent)', color: 'var(--nav-accent-text, #0d1b2a)', fontSize: 11, fontWeight: 900, minWidth: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--nav-bg)', lineHeight: 1, padding: '0 2px' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>My</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Cart</div>
              </div>
            </button>
          </div>
        </div>

        {/* ── CATEGORY NAV BAR ── */}
        <div style={{ background: 'var(--nav-hover)', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', height: 'var(--subnav-h)', gap: 0, minWidth: 'max-content' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => setMobileOpen(true)}>
              <MenuIcon size={16} /> All
            </button>
            {CATS.map(cat => (
              <Link key={cat.slug} to={`/shop?catname=${encodeURIComponent(cat.slug)}`}
                style={{ padding: '0 13px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap', textDecoration: 'none', fontWeight: 500, transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.88)'; }}>
                {cat.name}
              </Link>
            ))}
            <Link to="/shop?isNew=true" style={{ padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 13, color: '#7dd3fc', fontWeight: 700, textDecoration: 'none', marginLeft: 'auto' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              🆕 New
            </Link>
            <Link to="/shop?featured=true" style={{ padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--nav-accent)', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              🔥 Deals
            </Link>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
            {/* Drawer header */}
            <div style={{ background: 'var(--nav-bg)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-heading)' }}>
                {user ? `Hello, ${user.name.split(' ')[0]}` : 'Hello, Guest'}
              </div>
              <button className="icon-btn" onClick={() => setMobileOpen(false)} style={{ color: '#fff' }}>
                <CloseIcon size={22} />
              </button>
            </div>

            {/* Mobile search */}
            <form onSubmit={handleSearch} style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', border: '1.5px solid var(--primary)', borderRadius: 8, overflow: 'hidden' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                  style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'var(--font)' }} />
                <button type="submit" style={{ padding: '0 14px', background: 'var(--primary)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                  <SearchIcon size={18} />
                </button>
              </div>
            </form>

            {/* Nav links */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '6px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shop by Department</div>
                {CATS.map(cat => (
                  <Link key={cat.slug} to={`/shop?catname=${encodeURIComponent(cat.slug)}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', fontSize: 14, color: 'var(--text-dark)', fontWeight: 500, borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ fontSize: 20, width: 28 }}>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-light)' }} />
                  </Link>
                ))}
              </div>
              {/* Quick links */}
              <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '6px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Links</div>
                {[['🆕 New Arrivals', '/shop?isNew=true'], ['🔥 Today\'s Deals', '/shop?featured=true'], ['📦 My Orders', '/my-orders'], ['👤 My Profile', '/profile'], ['📞 Contact', '/contact']].map(([label, to]) => (
                  <Link key={to} to={to}
                    style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', fontSize: 14, color: 'var(--text-dark)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {label}
                  </Link>
                ))}
              </div>
              {/* Auth actions */}
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user ? (
                  <button onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}
                    className="btn btn-outline" style={{ justifyContent: 'center' }}>
                    <LogOutIcon size={16} /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-primary btn-block" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Sign In</Link>
                    <Link to="/register" className="btn btn-outline btn-block" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <CartDrawer />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .desktop-search { display: none !important; }
          .hide-sm { display: none !important; }
          :root { --header-h: 60px; --subnav-h: 0px; }
          header > div:last-child { display: none; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .desktop-search { max-width: 400px !important; }
          .hide-sm { display: none !important; }
        }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
      `}</style>
    </>
  );
}
